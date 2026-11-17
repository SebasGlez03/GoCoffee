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
    const s = await tx.suscripcion.findUniqueOrThrow({
      where: { idSuscripcion: id }, include: { plan: true, ciclos: { include: { entrega: true }, orderBy: { numCiclo: 'asc' } } },
    });
    const ahora = new Date();
    const frecuencia = s.plan.frecuenciaEntrega as FrecuenciaEntrega;
    if (s.estadoSuscripcion === 'CANCELADA') {
      await tx.entrega.updateMany({
        where: { estadoEntrega: 'PROGRAMADA', ciclo: { some: { suscripcionId: id } } },
        data: { estadoEntrega: 'SALTADA' },
      });
      return;
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
    await tx.ciclo.create({ data: {
      suscripcion: { connect: { idSuscripcion: id } }, numCiclo: (ultimo?.numCiclo ?? 0) + 1, fechaProgramada: fecha,
      entrega: { create: { fechaEntrega: fecha, estadoEntrega: 'PROGRAMADA' } },
    } });
  }
}
