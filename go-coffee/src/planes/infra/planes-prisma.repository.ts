import { Injectable } from '@nestjs/common';
import { PlanesRepository } from '../dominio/planes.repository';
import { Plan } from '../../dominio/entidades';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { EstadoPlan } from '../../dominio/tipos';

@Injectable()
export class PlanPrismaRepository implements PlanesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Plan | null> {
    const item = await this.prisma.client.plan.findUnique({
      where: { planId: id },
    });

    if (!item) return null;

    return this.toDomain(item);
  }

  async findAll(): Promise<Plan[]> {
    const items = await this.prisma.client.plan.findMany();
    return items.map((item) => this.toDomain(item));
  }

  async save(entidad: Plan): Promise<Plan> {
    const created = await this.prisma.client.plan.create({
      data: {
        nombre: entidad.nombre,
        cantidadBolsas: entidad.cantidadBolsas,
        precio: entidad.precio,
        frecuenciaEntrega: entidad.frecuenciaEntrega,
        fechaCreacion: entidad.fechaCreacion,
        estado: entidad.estado,
        remplazadoPorId: entidad.remplazadoPorId ?? null,
      },
    });

    return this.toDomain(created);
  }

  async update(entidad: Plan): Promise<Plan> {
    const updated = await this.prisma.client.plan.update({
      where: { planId: entidad.idPlan! },
      data: {
        nombre: entidad.nombre,
        cantidadBolsas: entidad.cantidadBolsas,
        precio: entidad.precio,
        frecuenciaEntrega: entidad.frecuenciaEntrega,
        fechaCreacion: entidad.fechaCreacion,
        estado: entidad.estado,
        remplazadoPorId: entidad.remplazadoPorId ?? null,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.client.plan.delete({
      where: { planId: id },
    });
  }

  async findByEstado(estado: EstadoPlan): Promise<Plan[]> {
    const items = await this.prisma.client.plan.findMany({
      where: { estado },
    });

    return items.map((item) => this.toDomain(item));
  }

  private toDomain(item: any): Plan {
    return {
      idPlan: item.planId,
      nombre: item.nombre,
      cantidadBolsas: item.cantidadBolsas,
      precio: item.precio,
      remplazadoPorId: item.remplazadoPorId ?? undefined,
      fechaCreacion: item.fechaCreacion,
      estado: item.estado,
      frecuenciaEntrega: item.frecuenciaEntrega,
    };
  }
}