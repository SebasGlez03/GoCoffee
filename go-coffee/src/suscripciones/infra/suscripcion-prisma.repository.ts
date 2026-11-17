import { CiclosService } from '../ciclos.service';
import { Injectable } from '@nestjs/common';
import { SuscripcionRepository } from '../dominio/suscripcion.repository';
import { Suscripcion } from '../../dominio/entidades';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { Ciclo } from '../../dominio/entidades';
import type { NuevaSuscripcion } from '../../dominio/entidades-repo';
import { SuscripcionDuplicadaError, SuscripcionCanceladaError } from '../../dominio/errores';

@Injectable()
export class SuscripcionPrismaRepository implements SuscripcionRepository {
  constructor(private readonly prisma: PrismaService, private readonly ciclosServicio: CiclosService) {}

  async findByUsuarioYPlan(usuarioId: number, planId: number): Promise<Suscripcion | null> {
    const item = await this.prisma.client.suscripcion.findFirst({
      where: { usuarioId, planId, estadoSuscripcion: { not: 'CANCELADA' } },
      include: { plan: true, direccionEntrega: true, ciclos: { include: { entrega: true, cobro: true } } },
    });
    return item ? this.toDomain(item) : null;
  }

  async findById(id: number): Promise<Suscripcion | null> {
    const item = await this.prisma.client.suscripcion.findUnique({
      where: { idSuscripcion: id },
      include: {
        direccionEntrega: true,
        plan: true,
        ciclos: { include: { entrega: true, cobro: true }, orderBy: { numCiclo: 'asc' } },
      },
    });

    if (!item) return null;

    return this.toDomain(item);
  }

  async findAll(usuarioId?: number): Promise<Suscripcion[]> {
    const items = await this.prisma.client.suscripcion.findMany({
      where: usuarioId === undefined ? {} : { usuarioId },
      include: {
        direccionEntrega: true,
        plan: true,
        ciclos: { include: { entrega: true, cobro: true }, orderBy: { numCiclo: 'asc' } },
      },
    });

    return items.map((item) => this.toDomain(item));
  }

  async save(entidad: NuevaSuscripcion): Promise<Suscripcion> {
    const created = await this.prisma.client.$transaction(async (tx) => {
      // Serializa las altas del mismo usuario antes de comprobar y crear.
      // El bloqueo se libera al confirmar o revertir la transaccion.
      await tx.$queryRaw`SELECT id FROM usuarios WHERE id = ${entidad.usuarioId} FOR UPDATE`;
      const existente = await tx.suscripcion.findFirst({
        where: {
          usuarioId: entidad.usuarioId,
          planId: entidad.planId,
          estadoSuscripcion: { not: 'CANCELADA' },
        },
      });
      if (existente) throw new SuscripcionDuplicadaError();

      const nueva = await tx.suscripcion.create({
      data: {
        usuario: { connect: { idUsuario: entidad.usuarioId } },
        plan: {
          connect: { planId: entidad.planId },
        },
        diaSemana: entidad.diaSemanaEntrega,
        fechaInicio: entidad.fechaInicio,
        estadoSuscripcion: entidad.estadoSuscripcion,
        direccionEntrega: entidad.direccionEntrega
          ? {
              create: {
                calle: entidad.direccionEntrega.calle,
                codigoPostal: entidad.direccionEntrega.codigoPostal,
                numeroCasa: entidad.direccionEntrega.numeroCasa,
                estado: entidad.direccionEntrega.estado,
              },
            }
          : undefined,
      },
      include: {
        direccionEntrega: true,
        plan: true,
        ciclos: { include: { entrega: true, cobro: true }, orderBy: { numCiclo: 'asc' } },
      },
      });
      await this.ciclosServicio.sincronizar(tx, nueva.idSuscripcion);
      return tx.suscripcion.findUniqueOrThrow({
        where: { idSuscripcion: nueva.idSuscripcion },
        include: { plan: true, direccionEntrega: true, ciclos: { include: { entrega: true, cobro: true }, orderBy: { numCiclo: 'asc' } } },
      });
    });

    return this.toDomain(created);
  }

  async update(entidad: Suscripcion): Promise<Suscripcion> {
    const updated = await this.prisma.client.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM suscripciones WHERE id = ${entidad.idSuscripcion} FOR UPDATE`;
      const anterior = await tx.suscripcion.findUniqueOrThrow({ where: { idSuscripcion: entidad.idSuscripcion } });
      if (anterior.estadoSuscripcion === 'CANCELADA') throw new SuscripcionCanceladaError(entidad.idSuscripcion);
      await tx.suscripcion.update({
      where: { idSuscripcion: entidad.idSuscripcion },
      data: {
        plan: {
          connect: { planId: entidad.planId },
        },
        diaSemana: entidad.diaSemanaEntrega,
        fechaInicio: entidad.fechaInicio,
        estadoSuscripcion: entidad.estadoSuscripcion,
        direccionEntrega:
          entidad.direccionEntrega !== undefined
            ? {
                upsert: {
                  create: {
                    calle: entidad.direccionEntrega.calle,
                    codigoPostal: entidad.direccionEntrega.codigoPostal,
                    numeroCasa: entidad.direccionEntrega.numeroCasa,
                    estado: entidad.direccionEntrega.estado,
                  },
                  update: {
                    calle: entidad.direccionEntrega.calle,
                    codigoPostal: entidad.direccionEntrega.codigoPostal,
                    numeroCasa: entidad.direccionEntrega.numeroCasa,
                    estado: entidad.direccionEntrega.estado,
                  },
                },
              }
            : undefined,
      },
      include: {
        direccionEntrega: true,
        plan: true,
        ciclos: { include: { entrega: true, cobro: true }, orderBy: { numCiclo: 'asc' } },
      },
    });

      await this.ciclosServicio.sincronizar(tx, entidad.idSuscripcion,
        anterior.diaSemana !== entidad.diaSemanaEntrega || anterior.fechaInicio.getTime() !== entidad.fechaInicio.getTime(),
        anterior.estadoSuscripcion !== 'ACTIVA' && entidad.estadoSuscripcion === 'ACTIVA');
      return tx.suscripcion.findUniqueOrThrow({
        where: { idSuscripcion: entidad.idSuscripcion },
        include: { plan: true, direccionEntrega: true, ciclos: { include: { entrega: true, cobro: true }, orderBy: { numCiclo: 'asc' } } },
      });
    });
    return this.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.client.suscripcion.delete({
      where: { idSuscripcion: id },
    });
  }

  private toDomain(item: any): Suscripcion {
    const ciclos: Ciclo[] = (item.ciclos ?? []).map((c: any) => ({
      idCiclo: c.idCiclo, numCiclo: c.numCiclo, fechaProgramada: c.fechaProgramada,
      entrega: c.entrega ? { idEntrega: c.entrega.idEntrega, fechaProgramada: c.entrega.fechaEntrega, estadoEntrega: c.entrega.estadoEntrega } : null,
      cobro: c.cobro ? { idCobro: c.cobro.idCobro, fechaCobro: c.cobro.fechaCobro, estado: c.cobro.estadoCobro } : null,
    }));

    return {
      idSuscripcion: item.idSuscripcion,
      usuarioId: item.usuarioId ?? null,
      planId: item.planId,
      plan: item.plan ? {
        idPlan: item.plan.planId,
        nombre: item.plan.nombre,
        cantidadBolsas: item.plan.cantidadBolsas,
        precio: item.plan.precio,
        frecuenciaEntrega: item.plan.frecuenciaEntrega,
      } : undefined,
      diaSemanaEntrega: item.diaSemana,
      fechaInicio: item.fechaInicio,
      direccionEntrega: item.direccionEntrega
        ? {
            idDireccionEntrega: item.direccionEntrega.idDireccionEntrega,
            calle: item.direccionEntrega.calle,
            codigoPostal: item.direccionEntrega.codigoPostal,
            numeroCasa: item.direccionEntrega.numeroCasa,
            estado: item.direccionEntrega.estado,
          }
        : {
            idDireccionEntrega: 0,
            calle: '',
            codigoPostal: '',
            numeroCasa: '',
            estado: '',
          },
      estadoSuscripcion: item.estadoSuscripcion,
      ciclos,
    };
  }
}
