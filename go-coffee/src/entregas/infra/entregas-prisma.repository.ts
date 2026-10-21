import { Injectable } from '@nestjs/common';
import { EntregasRepository } from '../dominio/entregas.repository';
import { Entrega } from '../../dominio/entidades';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class EntregasPrismaRepository implements EntregasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Entrega | null> {
    const item = await this.prisma.client.entrega.findUnique({
      where: { idEntrega: id },
    });

    if (!item) return null;

    return this.toDomain(item);
  }

  async findAll(): Promise<Entrega[]> {
    const items = await this.prisma.client.entrega.findMany();
    return items.map((item) => this.toDomain(item));
  }

  async save(entidad: Entrega): Promise<Entrega> {
    const created = await this.prisma.client.entrega.create({
      data: {
        fechaEntrega: entidad.fechaProgramada,
        estadoEntrega: entidad.estadoEntrega,
      },
    });

    return this.toDomain(created);
  }

  async update(entidad: Entrega): Promise<Entrega> {
    const updated = await this.prisma.client.entrega.update({
      where: { idEntrega: entidad.idEntrega },
      data: {
        fechaEntrega: entidad.fechaProgramada,
        estadoEntrega: entidad.estadoEntrega,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.client.entrega.delete({
      where: { idEntrega: id },
    });
  }

  private toDomain(item: any): Entrega {
    return {
      idEntrega: item.idEntrega,
      fechaProgramada: item.fechaEntrega,
      estadoEntrega: item.estadoEntrega,
    };
  }
}