import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import type { DiaSemana, FrecuenciaEntrega } from '../dominio/tipos';
import { proximoDia, siguienteFecha } from './ciclos-calendario';

@Injectable()
export class CiclosService implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  private ejecutando = false;
  private readonly logger = new Logger(CiclosService.name);
  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.procesar(), 60_000);
    void this.procesar();
  }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }

  async procesar() {
    if (this.ejecutando) return;
    this.ejecutando = true;
    try {
      const lista = await this.prisma.client.suscripcion.findMany({
        where: { estadoSuscripcion: 'ACTIVA' }, select: { idSuscripcion: true },
      });
      for (const s of lista) {
        try {
          await this.prisma.client.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT id FROM suscripciones WHERE id = ${s.idSuscripcion} FOR UPDATE`;
            await this.sincronizar(tx, s.idSuscripcion);
          });
        } catch (e) { this.logger.error(`No se pudo programar la suscripción ${s.idSuscripcion}`, e); }
      }
    } catch (e) { this.logger.error('No se pudieron consultar las suscripciones', e); }
    finally { this.ejecutando = false; }
  }

  // Se ejecuta dentro de una transacción con la suscripción bloqueada.
  async sincronizar(tx: Prisma.TransactionClient, id: number, cambioDia = false, reanudando = false) {
    // Serializa también cambios de plan y nuevas suscripciones del mismo cliente.
    await tx.$queryRaw`SELECT u.id FROM usuarios u JOIN suscripciones s ON s.usuarioId = u.id WHERE s.id = ${id} FOR UPDATE`;
    const s = await tx.suscripcion.findUniqueOrThrow({
      where: { idSuscripcion: id }, include: { plan: true, ciclos: { include: { entrega: true, cobro: true }, orderBy: { numCiclo: 'asc' } } },
    });
    const ahora = new Date();
    const frecuencia = s.plan.frecuenciaEntrega as FrecuenciaEntrega;
    if (s.estadoSuscripcion === 'CANCELADA') {
      await tx.solicitudCambioPlanSuscrito.updateMany({ where: { idSuscripcion: id,
        OR: [{ estadoSolicitud: 'PENDIENTE' }, { estadoSolicitud: 'ACEPTADA', fechaAplicacion: null }] },
        data: { estadoSolicitud: 'RECHAZADA', fechaResolucion: ahora } });
      for (const c of s.ciclos) {
        if (!c.entrega) continue;
        const pagada = c.cobro?.estadoCobro === 'PAGADO';
        // Conserva todas las pagadas; la última se informa en la respuesta.
        // Una entrega saltada voluntariamente no se reactiva.
        if (pagada && c.entregaPausada && c.entrega.estadoEntrega === 'SALTADA') {
          await tx.ciclo.update({ where: { idCiclo: c.idCiclo }, data: {
            entregaPausada: false, entrega: { update: { estadoEntrega: 'PROGRAMADA' } },
          } });
        } else if (!pagada && c.entrega.estadoEntrega === 'PROGRAMADA') {
          await tx.ciclo.update({ where: { idCiclo: c.idCiclo }, data: {
            entregaPausada: false, entrega: { update: { estadoEntrega: 'SALTADA' } },
          } });
        }
      }
      return;
    }
    if (s.estadoSuscripcion === 'PAUSADA') {
      for (const c of s.ciclos) {
        if (c.entrega?.estadoEntrega !== 'PROGRAMADA') continue;
        await tx.ciclo.update({ where: { idCiclo: c.idCiclo }, data: {
          entregaPausada: true, entrega: { update: { estadoEntrega: 'SALTADA' } },
        } });
      }
      return;
    }
    if (s.estadoSuscripcion !== 'ACTIVA') return;
    if (reanudando) {
      for (const c of s.ciclos) {
        if (!c.entregaPausada) continue;
        const recuperar = c.entrega?.estadoEntrega === 'SALTADA';
        await tx.ciclo.update({ where: { idCiclo: c.idCiclo }, data: {
          entregaPausada: false,
          ...(recuperar ? { entrega: { update: { estadoEntrega: 'PROGRAMADA' } } } : {}),
        } });
        if (recuperar && c.entrega) c.entrega.estadoEntrega = 'PROGRAMADA';
      }
    }
    const pendientes = s.ciclos.filter((c) => c.entrega?.estadoEntrega === 'PROGRAMADA');
    if (cambioDia || reanudando) {
      let anterior: Date | undefined;
      for (const c of pendientes) {
        let fecha = c.fechaProgramada;
        if (cambioDia || fecha <= ahora) {
          fecha = anterior ? siguienteFecha(anterior, frecuencia) : cambioDia
            ? new Date(Math.max(fecha.getTime(), ahora.getTime() + 86400000)) : fecha;
          if (!anterior && cambioDia) fecha = proximoDia(fecha, s.diaSemana as DiaSemana);
          if (!cambioDia) while (fecha <= ahora) fecha = siguienteFecha(fecha, frecuencia);
          await tx.ciclo.update({ where: { idCiclo: c.idCiclo }, data: {
            fechaProgramada: fecha, entrega: { update: { fechaEntrega: fecha } },
          } });
        }
        anterior = fecha;
      }
      if (pendientes.length) return;
    }
    if (s.estadoSuscripcion !== 'ACTIVA') return;
    const ultimo = s.ciclos.at(-1);
    if (ultimo && ultimo.fechaProgramada > ahora) return;
    let fecha = ultimo ? siguienteFecha(ultimo.fechaProgramada, frecuencia) : s.fechaInicio;
    // No fabrica ciclos atrasados después de una pausa o de un servidor apagado.
    while (fecha <= ahora) fecha = siguienteFecha(fecha, frecuencia);
    if (cambioDia) fecha = proximoDia(fecha, s.diaSemana as DiaSemana);
    const numCiclo = (ultimo?.numCiclo ?? 0) + 1;
    const cambio = await tx.solicitudCambioPlanSuscrito.findFirst({ where: {
      idSuscripcion: id, estadoSolicitud: 'ACEPTADA', fechaAplicacion: null, numCicloAplicacion: numCiclo,
    }, include: { planNuevo: true } });
    let planCiclo = s.plan;
    if (cambio) {
      const duplicada = await tx.suscripcion.findFirst({ where: {
        usuarioId: s.usuarioId, planId: cambio.idPlanNuevo, estadoSuscripcion: { not: 'CANCELADA' }, idSuscripcion: { not: id },
      } });
      if (duplicada || cambio.idPlanAnterior !== s.planId || cambio.planNuevo.estado !== 'ACTUAL' || cambio.planNuevo.precio !== cambio.precioNuevo) {
        await tx.solicitudCambioPlanSuscrito.update({ where: { idSolicitud: cambio.idSolicitud }, data: {
          estadoSolicitud: 'RECHAZADA', fechaResolucion: ahora,
        } });
      } else {
        planCiclo = cambio.planNuevo;
        await tx.suscripcion.update({ where: { idSuscripcion: id }, data: { planId: cambio.idPlanNuevo } });
        await tx.solicitudCambioPlanSuscrito.update({ where: { idSolicitud: cambio.idSolicitud }, data: {
          fechaAplicacion: ahora, fechaNuevoCiclo: fecha,
        } });
      }
    }
    await tx.ciclo.create({ data: {
      suscripcion: { connect: { idSuscripcion: id } }, numCiclo, fechaProgramada: fecha,
      planIdAplicado: planCiclo.planId, precioAplicado: planCiclo.precio,
      entrega: { create: { fechaEntrega: fecha, estadoEntrega: 'PROGRAMADA' } },
    } });
  }
}
