import { CiclosService } from '../ciclos.service';
import { Injectable } from '@nestjs/common';
import { SuscripcionRepository } from '../dominio/suscripcion.repository';
import { Suscripcion } from '../../dominio/entidades';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { Prisma } from '@prisma/client';
import type { Ciclo } from '../../dominio/entidades';
import type { NuevaSuscripcion } from '../../dominio/entidades-repo';
import {
  DIAS_SEMANA,
  ESTADOS_COBRO,
  ESTADOS_ENTREGA,
  ESTADOS_SUSCRIPCION,
  FRECUENCIAS_ENTREGA,
} from '../../dominio/tipos';
import type {
  DiaSemana,
  EstadoCobro,
  EstadoEntrega,
  EstadoSuscripcion,
  FrecuenciaEntrega,
} from '../../dominio/tipos';
import {
  SuscripcionDuplicadaError,
  SuscripcionCanceladaError,
} from '../../dominio/errores';

function esValorPermitido<T extends string>(
  valor: string,
  permitidos: readonly T[],
): valor is T {
  return permitidos.some((permitido) => permitido === valor);
}

function validarValor<T extends string>(
  valor: string,
  permitidos: readonly T[],
  campo: string,
): T {
  if (!esValorPermitido(valor, permitidos)) {
    throw new Error(`Valor inválido para ${campo}: ${valor}`);
  }
  return valor;
}

type SuscripcionConRelaciones = Prisma.SuscripcionGetPayload<{
  include: {
    direccionEntrega: true;
    plan: true;
    ciclos: { include: { entrega: true; cobros: true } };
  };
}>;

@Injectable()
export class SuscripcionPrismaRepository implements SuscripcionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ciclosServicio: CiclosService,
  ) {}

  async findByUsuarioYPlan(
    usuarioId: number,
    planId: number,
  ): Promise<Suscripcion | null> {
    const item = await this.prisma.client.suscripcion.findFirst({
      where: { usuarioId, planId, estadoSuscripcion: { not: 'CANCELADA' } },
      include: {
        plan: true,
        direccionEntrega: true,
        ciclos: {
          include: { entrega: true, cobros: { orderBy: { idCobro: 'desc' } } },
        },
      },
    });
    return item ? this.toDomain(item) : null;
  }

  async findById(id: number): Promise<Suscripcion | null> {
    const item = await this.prisma.client.suscripcion.findUnique({
      where: { idSuscripcion: id },
      include: {
        direccionEntrega: true,
        plan: true,
        ciclos: {
          include: { entrega: true, cobros: { orderBy: { idCobro: 'desc' } } },
          orderBy: { numCiclo: 'asc' },
        },
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
        ciclos: {
          include: { entrega: true, cobros: { orderBy: { idCobro: 'desc' } } },
          orderBy: { numCiclo: 'asc' },
        },
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
          ciclos: {
            include: {
              entrega: true,
              cobros: { orderBy: { idCobro: 'desc' } },
            },
            orderBy: { numCiclo: 'asc' },
          },
        },
      });
      await this.ciclosServicio.sincronizar(tx, nueva.idSuscripcion);
      return tx.suscripcion.findUniqueOrThrow({
        where: { idSuscripcion: nueva.idSuscripcion },
        include: {
          plan: true,
          direccionEntrega: true,
          ciclos: {
            include: {
              entrega: true,
              cobros: { orderBy: { idCobro: 'desc' } },
            },
            orderBy: { numCiclo: 'asc' },
          },
        },
      });
    });

    return this.toDomain(created);
  }

  async update(entidad: Suscripcion): Promise<Suscripcion> {
    const updated = await this.prisma.client.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM suscripciones WHERE id = ${entidad.idSuscripcion} FOR UPDATE`;
      const anterior = await tx.suscripcion.findUniqueOrThrow({
        where: { idSuscripcion: entidad.idSuscripcion },
      });
      if (anterior.estadoSuscripcion === 'CANCELADA')
        throw new SuscripcionCanceladaError(entidad.idSuscripcion);
      await tx.suscripcion.update({
        where: { idSuscripcion: entidad.idSuscripcion },
        data: {
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
          ciclos: {
            include: {
              entrega: true,
              cobros: { orderBy: { idCobro: 'desc' } },
            },
            orderBy: { numCiclo: 'asc' },
          },
        },
      });

      await this.ciclosServicio.sincronizar(
        tx,
        entidad.idSuscripcion,
        anterior.diaSemana !== entidad.diaSemanaEntrega ||
          anterior.fechaInicio.getTime() !== entidad.fechaInicio.getTime(),
        anterior.estadoSuscripcion !== 'ACTIVA' &&
          entidad.estadoSuscripcion === 'ACTIVA',
      );
      return tx.suscripcion.findUniqueOrThrow({
        where: { idSuscripcion: entidad.idSuscripcion },
        include: {
          plan: true,
          direccionEntrega: true,
          ciclos: {
            include: {
              entrega: true,
              cobros: { orderBy: { idCobro: 'desc' } },
            },
            orderBy: { numCiclo: 'asc' },
          },
        },
      });
    });
    return this.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.client.suscripcion.delete({
      where: { idSuscripcion: id },
    });
  }

  private toDomain(item: SuscripcionConRelaciones): Suscripcion {
    const ciclos: Ciclo[] = item.ciclos.map((c) => ({
      idCiclo: c.idCiclo,
      numCiclo: c.numCiclo,
      fechaProgramada: c.fechaProgramada,
      planIdAplicado: c.planIdAplicado ?? null,
      precioAplicado: c.precioAplicado ?? null,
      entrega: c.entrega
        ? {
            idEntrega: c.entrega.idEntrega,
            fechaProgramada: c.entrega.fechaEntrega,
            estadoEntrega: validarValor<EstadoEntrega>(
              c.entrega.estadoEntrega,
              ESTADOS_ENTREGA,
              'estadoEntrega',
            ),
          }
        : null,
      cobro: c.cobros[0]
        ? {
            idCobro: c.cobros[0].idCobro,
            fechaCobro: c.cobros[0].fechaCobro,
            estado: validarValor<EstadoCobro>(
              c.cobros[0].estadoCobro,
              ESTADOS_COBRO,
              'estadoCobro',
            ),
          }
        : null,
    }));

    return {
      idSuscripcion: item.idSuscripcion,
      usuarioId: item.usuarioId ?? null,
      planId: item.planId,
      plan: item.plan
        ? {
            idPlan: item.plan.planId,
            nombre: item.plan.nombre,
            cantidadBolsas: item.plan.cantidadBolsas,
            precio: item.plan.precio,
            frecuenciaEntrega: validarValor<FrecuenciaEntrega>(
              item.plan.frecuenciaEntrega,
              FRECUENCIAS_ENTREGA,
              'frecuenciaEntrega',
            ),
          }
        : undefined,
      diaSemanaEntrega: validarValor<DiaSemana>(
        item.diaSemana,
        DIAS_SEMANA,
        'diaSemana',
      ),
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
      estadoSuscripcion: validarValor<EstadoSuscripcion>(
        item.estadoSuscripcion,
        ESTADOS_SUSCRIPCION,
        'estadoSuscripcion',
      ),
      motivoSuspension: item.motivoSuspension ?? null,
      ciclos,
    };
  }
}
