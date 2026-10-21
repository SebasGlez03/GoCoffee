import { Injectable } from '@nestjs/common';
import { SuscripcionRepository } from '../dominio/suscripcion.repository';
import { Suscripcion } from '../../dominio/entidades';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { Ciclo } from '../../dominio/entidades';

@Injectable()
export class SuscripcionPrismaRepository implements SuscripcionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Suscripcion | null> {
    const item = await this.prisma.client.suscripcion.findUnique({
      where: { idSuscripcion: id },
      include: {
        direccionEntrega: true,
        ciclo: {
          include: {
            cobro: true,
            entrega: true,
          },
        },
      },
    });

    if (!item) return null;

    return this.toDomain(item);
  }

  async findAll(): Promise<Suscripcion[]> {
    const items = await this.prisma.client.suscripcion.findMany({
      include: {
        direccionEntrega: true,
        ciclo: {
          include: {
            cobro: true,
            entrega: true,
          },
        },
      },
    });

    return items.map((item) => this.toDomain(item));
  }

  async save(entidad: Suscripcion): Promise<Suscripcion> {
    const created = await this.prisma.client.suscripcion.create({
      data: {
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
        ciclo: {
          include: {
            cobro: true,
            entrega: true,
          },
        },
      },
    });

    return this.toDomain(created);
  }

  async update(entidad: Suscripcion): Promise<Suscripcion> {
    const updated = await this.prisma.client.suscripcion.update({
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
        ciclo: {
          include: {
            cobro: true,
            entrega: true,
          },
        },
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.client.suscripcion.delete({
      where: { idSuscripcion: id },
    });
  }

  private toDomain(item: any): Suscripcion {
    const ciclos: Ciclo[] = item.ciclo
      ? [
          {
            idCiclo: item.ciclo.idCiclo,
            fechaProgramada: item.ciclo.fechaProgramada,
            numCiclo: item.ciclo.numCiclo,
            entrega: {
              idEntrega: item.ciclo.entrega?.idEntrega ?? 0,
              fechaProgramada:
                item.ciclo.entrega?.fechaEntrega ?? item.ciclo.fechaProgramada,
              estadoEntrega:
                (item.ciclo.entrega?.estadoEntrega as any) ?? 'PROGRAMADA',
            },
            cobro: {
              idCobro: item.ciclo.cobro?.idCobro ?? 0,
              fechaCobro:
                item.ciclo.cobro?.fechaCobro ?? item.ciclo.fechaProgramada,
              estado:
                (item.ciclo.cobro?.estadoCobro as any) ?? 'PAGADO',
            },
          },
        ]
      : [];

    return {
      idSuscripcion: item.idSuscripcion,
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