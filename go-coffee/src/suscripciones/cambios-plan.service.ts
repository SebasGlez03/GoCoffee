import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import type { UsuarioSesion } from './suscripciones.service';
import { siguienteFecha } from './ciclos-calendario';
import type { FrecuenciaEntrega } from '../dominio/tipos';

const incluir = {
  planAnterior: true,
  planNuevo: true,
  suscripcion: {
    select: { usuarioId: true, usuario: { select: { email: true } } },
  },
} as const;

@Injectable()
export class CambiosPlanService {
  constructor(private readonly prisma: PrismaService) {}

  private async bloquear(tx: Prisma.TransactionClient, id: number) {
    await tx.$queryRaw`SELECT id FROM suscripciones WHERE id = ${id} FOR UPDATE`;
    await tx.$queryRaw`SELECT u.id FROM usuarios u JOIN suscripciones s ON s."usuarioId" = u.id WHERE s.id = ${id} FOR UPDATE`;
  }

  private async suscripcion(
    tx: Prisma.TransactionClient,
    id: number,
    usuario: UsuarioSesion,
  ) {
    const s = await tx.suscripcion.findUnique({
      where: { idSuscripcion: id },
      include: {
        plan: true,
        ciclos: { orderBy: { numCiclo: 'desc' }, take: 1 },
      },
    });
    if (!s) throw new NotFoundException('Suscripción no encontrada.');
    if (usuario.rol !== 'ADMINISTRADOR' && s.usuarioId !== usuario.idUsuario)
      throw new ForbiddenException('No tienes acceso a esta suscripción.');
    return s;
  }

  private siguiente(s: {
    fechaInicio: Date;
    plan: { frecuenciaEntrega: string };
    ciclos: { fechaProgramada: Date; numCiclo: number }[];
  }) {
    const ultimo = s.ciclos[0];
    let fecha = ultimo
      ? siguienteFecha(
          ultimo.fechaProgramada,
          s.plan.frecuenciaEntrega as FrecuenciaEntrega,
        )
      : s.fechaInicio;
    while (fecha <= new Date())
      fecha = siguienteFecha(
        fecha,
        s.plan.frecuenciaEntrega as FrecuenciaEntrega,
      );
    return { numCiclo: (ultimo?.numCiclo ?? 0) + 1, fecha };
  }

  private fechaParaCiclo(
    s: {
      fechaInicio: Date;
      plan: { frecuenciaEntrega: string };
      ciclos: { fechaProgramada: Date; numCiclo: number }[];
    },
    numCiclo: number,
  ) {
    const siguiente = this.siguiente(s);
    if (numCiclo < siguiente.numCiclo) {
      throw new ConflictException('El ciclo de aplicación ya fue generado.');
    }
    let fecha = siguiente.fecha;
    for (let ciclo = siguiente.numCiclo; ciclo < numCiclo; ciclo += 1) {
      fecha = siguienteFecha(
        fecha,
        s.plan.frecuenciaEntrega as FrecuenciaEntrega,
      );
    }
    return fecha;
  }

  async opciones(id: number, usuario: UsuarioSesion) {
    const s = await this.suscripcion(this.prisma.client, id, usuario);
    const siguiente = this.siguiente(s);
    const ciclosAplicacion = Array.from({ length: 12 }, (_, indice) => {
      const numCiclo = siguiente.numCiclo + indice;
      return { numCiclo, fecha: this.fechaParaCiclo(s, numCiclo) };
    });
    return {
      numCicloAplicacion: siguiente.numCiclo,
      fechaNuevoCiclo: siguiente.fecha,
      ciclosAplicacion,
      planes: await this.prisma.client.plan.findMany({
        where: { estado: 'ACTUAL', planId: { not: s.planId } },
        select: {
          planId: true,
          nombre: true,
          precio: true,
          cantidadBolsas: true,
          frecuenciaEntrega: true,
        },
      }),
    };
  }

  async historial(id: number, usuario: UsuarioSesion) {
    await this.suscripcion(this.prisma.client, id, usuario);
    return this.prisma.client.solicitudCambioPlanSuscrito.findMany({
      where: { idSuscripcion: id },
      include: incluir,
      orderBy: { idSolicitud: 'desc' },
    });
  }

  listar() {
    return this.prisma.client.solicitudCambioPlanSuscrito.findMany({
      include: incluir,
      orderBy: { idSolicitud: 'desc' },
    });
  }

  async solicitar(
    id: number,
    planId: number,
    precioEsperado: number,
    numCicloAplicacion: number,
    usuario: UsuarioSesion,
  ) {
    return this.prisma.client.$transaction(async (tx) => {
      await this.bloquear(tx, id);
      const s = await this.suscripcion(tx, id, usuario);
      if (!['ACTIVA', 'PAUSADA'].includes(s.estadoSuscripcion))
        throw new BadRequestException(
          'Solo puedes cambiar el plan de una suscripción activa o pausada.',
        );
      if (s.planId === planId)
        throw new BadRequestException('Ya tienes este plan.');
      const pendiente = await tx.solicitudCambioPlanSuscrito.findFirst({
        where: {
          idSuscripcion: id,
          OR: [
            { estadoSolicitud: 'PENDIENTE' },
            { estadoSolicitud: 'ACEPTADA', fechaAplicacion: null },
          ],
        },
      });
      if (pendiente)
        throw new ConflictException(
          'Ya tienes un cambio pendiente o aprobado por aplicar.',
        );
      const plan = await tx.plan.findUnique({ where: { planId } });
      if (!plan || plan.estado !== 'ACTUAL')
        throw new BadRequestException('El plan elegido ya no está disponible.');
      if (plan.precio !== precioEsperado)
        throw new ConflictException(
          'El precio cambió. Actualiza las opciones antes de confirmar.',
        );
      if (
        await tx.suscripcion.findFirst({
          where: {
            usuarioId: s.usuarioId,
            planId,
            estadoSuscripcion: { not: 'CANCELADA' },
            idSuscripcion: { not: id },
          },
        })
      ) {
        throw new ConflictException('Ya tienes otra suscripción a ese plan.');
      }
      if (!Number.isInteger(numCicloAplicacion))
        throw new BadRequestException('Selecciona un ciclo válido.');
      const fechaNuevoCiclo = this.fechaParaCiclo(s, numCicloAplicacion);
      return tx.solicitudCambioPlanSuscrito.create({
        data: {
          idSuscripcion: id,
          idPlanAnterior: s.planId,
          idPlanNuevo: planId,
          nombreAnterior: s.plan.nombre,
          nombreNuevo: plan.nombre,
          precioAnterior: s.plan.precio,
          precioNuevo: plan.precio,
          numCicloAplicacion,
          fechaNuevoCiclo,
          estadoSolicitud: 'PENDIENTE',
        },
        include: incluir,
      });
    });
  }

  async resolver(id: number, aceptar: boolean) {
    const original =
      await this.prisma.client.solicitudCambioPlanSuscrito.findUnique({
        where: { idSolicitud: id },
      });
    if (!original) throw new NotFoundException('Solicitud no encontrada.');
    return this.prisma.client.$transaction(async (tx) => {
      await this.bloquear(tx, original.idSuscripcion);
      const solicitud = await tx.solicitudCambioPlanSuscrito.findUniqueOrThrow({
        where: { idSolicitud: id },
        include: { planNuevo: true },
      });
      if (solicitud.estadoSolicitud !== 'PENDIENTE')
        throw new ConflictException('La solicitud ya fue resuelta.');
      if (aceptar) {
        const s = await this.suscripcion(tx, solicitud.idSuscripcion, {
          idUsuario: 0,
          rol: 'ADMINISTRADOR',
        });
        if (
          !['ACTIVA', 'PAUSADA'].includes(s.estadoSuscripcion) ||
          s.planId !== solicitud.idPlanAnterior
        )
          throw new ConflictException(
            'La suscripción ya no permite este cambio.',
          );
        if (
          solicitud.planNuevo.estado !== 'ACTUAL' ||
          solicitud.planNuevo.precio !== solicitud.precioNuevo
        )
          throw new ConflictException(
            'El plan o precio cambió. Rechaza esta solicitud y solicita una nueva.',
          );
        const fechaNuevoCiclo = this.fechaParaCiclo(
          s,
          solicitud.numCicloAplicacion,
        );
        if (
          await tx.suscripcion.findFirst({
            where: {
              usuarioId: s.usuarioId,
              planId: solicitud.idPlanNuevo,
              estadoSuscripcion: { not: 'CANCELADA' },
              idSuscripcion: { not: s.idSuscripcion },
            },
          })
        )
          throw new ConflictException(
            'El cliente ya tiene otra suscripción a ese plan.',
          );
        return tx.solicitudCambioPlanSuscrito.update({
          where: { idSolicitud: id },
          data: {
            estadoSolicitud: 'ACEPTADA',
            fechaResolucion: new Date(),
            fechaNuevoCiclo,
          },
          include: incluir,
        });
      }
      return tx.solicitudCambioPlanSuscrito.update({
        where: { idSolicitud: id },
        data: { estadoSolicitud: 'RECHAZADA', fechaResolucion: new Date() },
        include: incluir,
      });
    });
  }
}
