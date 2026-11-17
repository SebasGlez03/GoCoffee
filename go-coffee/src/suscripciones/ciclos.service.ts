import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import type { DiaSemana, FrecuenciaEntrega } from '../dominio/tipos';
import { proximoDia, siguienteFecha } from './ciclos-calendario';
import type { UsuarioSesion } from './suscripciones.service';

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

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async procesar() {
    if (this.ejecutando) return;
    this.ejecutando = true;
    try {
      const lista = await this.prisma.client.suscripcion.findMany({
        where: { estadoSuscripcion: 'ACTIVA' },
        select: { idSuscripcion: true },
      });
      for (const suscripcion of lista) {
        try {
          await this.prisma.client.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT id FROM suscripciones WHERE id = ${suscripcion.idSuscripcion} FOR UPDATE`;
            await this.sincronizar(tx, suscripcion.idSuscripcion);
          });
        } catch (error) {
          this.logger.error(
            `No se pudo programar la suscripción ${suscripcion.idSuscripcion}`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error('No se pudieron consultar las suscripciones', error);
    } finally {
      this.ejecutando = false;
    }
  }

  // Se ejecuta dentro de una transacción con la suscripción bloqueada.
  async sincronizar(
    tx: Prisma.TransactionClient,
    id: number,
    cambioDia = false,
    reanudando = false,
  ) {
    await tx.$queryRaw`SELECT u.id FROM usuarios u JOIN suscripciones s ON s."usuarioId" = u.id WHERE s.id = ${id} FOR UPDATE`;
    const suscripcion = await tx.suscripcion.findUniqueOrThrow({
      where: { idSuscripcion: id },
      include: {
        plan: true,
        ciclos: {
          include: {
            entrega: true,
            cobros: { orderBy: { fechaCobro: 'desc' } },
          },
          orderBy: { numCiclo: 'asc' },
        },
      },
    });
    const ahora = new Date();
    const frecuencia = suscripcion.plan.frecuenciaEntrega as FrecuenciaEntrega;

    if (suscripcion.estadoSuscripcion === 'CANCELADA') {
      await tx.solicitudCambioPlanSuscrito.updateMany({
        where: {
          idSuscripcion: id,
          OR: [
            { estadoSolicitud: 'PENDIENTE' },
            { estadoSolicitud: 'ACEPTADA', fechaAplicacion: null },
          ],
        },
        data: { estadoSolicitud: 'RECHAZADA', fechaResolucion: ahora },
      });
      for (const ciclo of suscripcion.ciclos) {
        if (!ciclo.entrega) continue;
        const pagada = ciclo.cobros.some(
          (cobro) => cobro.estadoCobro === 'PAGADO',
        );
        if (
          pagada &&
          ciclo.entregaPausada &&
          ciclo.entrega.estadoEntrega === 'SALTADA'
        ) {
          await tx.ciclo.update({
            where: { idCiclo: ciclo.idCiclo },
            data: {
              entregaPausada: false,
              entrega: { update: { estadoEntrega: 'PROGRAMADA' } },
            },
          });
        } else if (!pagada && ciclo.entrega.estadoEntrega === 'PROGRAMADA') {
          await tx.ciclo.update({
            where: { idCiclo: ciclo.idCiclo },
            data: {
              entregaPausada: false,
              entrega: { update: { estadoEntrega: 'SALTADA' } },
            },
          });
        }
      }
      return;
    }

    if (suscripcion.estadoSuscripcion === 'PAUSADA') {
      for (const ciclo of suscripcion.ciclos) {
        if (
          ciclo.entrega?.estadoEntrega !== 'PROGRAMADA' ||
          ciclo.cobros.some((cobro) => cobro.estadoCobro === 'PAGADO')
        )
          continue;
        await tx.ciclo.update({
          where: { idCiclo: ciclo.idCiclo },
          data: {
            entregaPausada: true,
            entrega: { update: { estadoEntrega: 'SALTADA' } },
          },
        });
      }
      return;
    }
    if (suscripcion.estadoSuscripcion !== 'ACTIVA') return;

    if (reanudando) {
      for (const ciclo of suscripcion.ciclos) {
        if (!ciclo.entregaPausada) continue;
        const recuperar = ciclo.entrega?.estadoEntrega === 'SALTADA';
        await tx.ciclo.update({
          where: { idCiclo: ciclo.idCiclo },
          data: {
            entregaPausada: false,
            ...(recuperar
              ? { entrega: { update: { estadoEntrega: 'PROGRAMADA' } } }
              : {}),
          },
        });
        if (recuperar && ciclo.entrega)
          ciclo.entrega.estadoEntrega = 'PROGRAMADA';
      }
    }

    const pendientes = suscripcion.ciclos.filter(
      (ciclo) =>
        ciclo.entrega?.estadoEntrega === 'PROGRAMADA' &&
        !ciclo.cobros.some((cobro) => cobro.estadoCobro === 'PAGADO'),
    );
    if (cambioDia || reanudando) {
      let anterior: Date | undefined;
      for (const ciclo of pendientes) {
        let fecha = ciclo.fechaProgramada;
        if (cambioDia || fecha <= ahora) {
          fecha = anterior
            ? siguienteFecha(anterior, frecuencia)
            : cambioDia
              ? new Date(Math.max(fecha.getTime(), ahora.getTime() + 86400000))
              : fecha;
          if (!anterior && cambioDia) {
            fecha = proximoDia(fecha, suscripcion.diaSemana as DiaSemana);
          }
          if (!cambioDia) {
            while (fecha <= ahora) fecha = siguienteFecha(fecha, frecuencia);
          }
          await tx.ciclo.update({
            where: { idCiclo: ciclo.idCiclo },
            data: {
              fechaProgramada: fecha,
              entrega: { update: { fechaEntrega: fecha } },
            },
          });
        }
        anterior = fecha;
      }
      if (pendientes.length) return;
    }

    if (suscripcion.estadoSuscripcion !== 'ACTIVA') return;
    const ultimo = suscripcion.ciclos.at(-1);
    if (ultimo && ultimo.fechaProgramada > ahora) return;
    let fecha = ultimo
      ? siguienteFecha(ultimo.fechaProgramada, frecuencia)
      : suscripcion.fechaInicio;
    while (fecha <= ahora) fecha = siguienteFecha(fecha, frecuencia);
    if (cambioDia)
      fecha = proximoDia(fecha, suscripcion.diaSemana as DiaSemana);
    const numCiclo = (ultimo?.numCiclo ?? 0) + 1;
    const cambio = await tx.solicitudCambioPlanSuscrito.findFirst({
      where: {
        idSuscripcion: id,
        estadoSolicitud: 'ACEPTADA',
        fechaAplicacion: null,
        numCicloAplicacion: numCiclo,
      },
      include: { planNuevo: true },
    });
    let planCiclo = suscripcion.plan;
    if (cambio) {
      const duplicada = await tx.suscripcion.findFirst({
        where: {
          usuarioId: suscripcion.usuarioId,
          planId: cambio.idPlanNuevo,
          estadoSuscripcion: { not: 'CANCELADA' },
          idSuscripcion: { not: id },
        },
      });
      if (
        duplicada ||
        cambio.idPlanAnterior !== suscripcion.planId ||
        cambio.planNuevo.estado !== 'ACTUAL' ||
        cambio.planNuevo.precio !== cambio.precioNuevo
      ) {
        await tx.solicitudCambioPlanSuscrito.update({
          where: { idSolicitud: cambio.idSolicitud },
          data: { estadoSolicitud: 'RECHAZADA', fechaResolucion: ahora },
        });
      } else {
        planCiclo = cambio.planNuevo;
        await tx.suscripcion.update({
          where: { idSuscripcion: id },
          data: { planId: cambio.idPlanNuevo },
        });
        await tx.solicitudCambioPlanSuscrito.update({
          where: { idSolicitud: cambio.idSolicitud },
          data: { fechaAplicacion: ahora, fechaNuevoCiclo: fecha },
        });
      }
    }
    await tx.ciclo.create({
      data: {
        suscripcion: { connect: { idSuscripcion: id } },
        numCiclo,
        fechaProgramada: fecha,
        planIdAplicado: planCiclo.planId,
        precioAplicado: planCiclo.precio,
        entrega: {
          create: { fechaEntrega: fecha, estadoEntrega: 'PROGRAMADA' },
        },
      },
    });
  }

  async saltarEntrega(
    idSuscripcion: number,
    numCiclo: number,
    usuario: UsuarioSesion,
  ) {
    return this.prisma.client.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM suscripciones WHERE id = ${idSuscripcion} FOR UPDATE`;
      const suscripcion = await tx.suscripcion.findUnique({
        where: { idSuscripcion },
        select: { usuarioId: true, estadoSuscripcion: true },
      });
      if (!suscripcion)
        throw new NotFoundException('Suscripción no encontrada.');
      if (
        usuario.rol !== 'ADMINISTRADOR' &&
        suscripcion.usuarioId !== usuario.idUsuario
      ) {
        throw new ForbiddenException('No tienes acceso a esta suscripción.');
      }
      if (!['ACTIVA', 'PAUSADA'].includes(suscripcion.estadoSuscripcion)) {
        throw new BadRequestException(
          'Solo puedes saltar entregas de una suscripción activa o pausada.',
        );
      }

      const ciclo = await tx.ciclo.findUnique({
        where: {
          suscripcionId_numCiclo: { suscripcionId: idSuscripcion, numCiclo },
        },
        include: { entrega: true, cobros: true },
      });
      if (!ciclo?.entrega)
        throw new NotFoundException('No existe una entrega para ese ciclo.');
      if (ciclo.cobros.some((cobro) => cobro.estadoCobro === 'PAGADO')) {
        throw new ConflictException(
          'No se puede saltar una entrega que ya fue pagada.',
        );
      }
      if (ciclo.entrega.estadoEntrega !== 'PROGRAMADA') {
        throw new ConflictException(
          'Solo se pueden saltar entregas programadas.',
        );
      }
      if (ciclo.entrega.fechaEntrega <= new Date()) {
        throw new ConflictException('Solo se pueden saltar entregas futuras.');
      }

      return tx.ciclo.update({
        where: { idCiclo: ciclo.idCiclo },
        data: {
          entregaPausada: false,
          entrega: { update: { estadoEntrega: 'SALTADA' } },
        },
        include: { entrega: true, cobros: { orderBy: { fechaCobro: 'desc' } } },
      });
    });
  }

  async listarCiclosAdmin(filtros: {
    desde?: Date;
    hasta?: Date;
    estadoEntrega?: string;
    estadoCobro?: string;
    idSuscripcion?: number;
  }) {
    if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) {
      throw new BadRequestException(
        'La fecha inicial debe ser anterior a la fecha final.',
      );
    }
    const where: Prisma.CicloWhereInput = {
      ...(filtros.desde || filtros.hasta
        ? {
            fechaProgramada: {
              ...(filtros.desde ? { gte: filtros.desde } : {}),
              ...(filtros.hasta ? { lte: filtros.hasta } : {}),
            },
          }
        : {}),
      ...(filtros.idSuscripcion
        ? { suscripcionId: filtros.idSuscripcion }
        : {}),
      ...(filtros.estadoEntrega
        ? { entrega: { is: { estadoEntrega: filtros.estadoEntrega } } }
        : {}),
      ...(filtros.estadoCobro
        ? { cobros: { some: { estadoCobro: filtros.estadoCobro } } }
        : {}),
    };
    return this.prisma.client.ciclo.findMany({
      where,
      take: 500,
      include: {
        entrega: true,
        cobros: { orderBy: { fechaCobro: 'desc' } },
        suscripcion: {
          include: {
            usuario: { select: { email: true } },
            plan: { select: { nombre: true } },
          },
        },
      },
      orderBy: [{ fechaProgramada: 'asc' }, { suscripcionId: 'asc' }],
    });
  }
}
