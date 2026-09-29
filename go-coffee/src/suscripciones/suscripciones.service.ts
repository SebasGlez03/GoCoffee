import { Inject, Injectable } from '@nestjs/common';
import { SUSCRIPCIONES_REPOSITORY } from './suscripciones.tokens';
import type { SuscripcionRepository } from './dominio/suscripcion.repository';
import { CrearSuscripcionDto } from './dto/crear-suscripcion.dto';
import { ModificarSuscripcionDto } from './dto/modificar-suscripcion.dto';
import { Suscripcion } from '../dominio/entidades';

@Injectable()
export class SuscripcionesService {
  constructor(
    @Inject(SUSCRIPCIONES_REPOSITORY)
    private readonly repo: SuscripcionRepository,
  ) {}

  findById(id: number): Promise<Suscripcion | null> {
    return this.repo.findById(id);
  }

  findAll(): Promise<Suscripcion[]> {
    return this.repo.findAll();
  }

  async save(dto: CrearSuscripcionDto): Promise<Suscripcion> {
    // TODO: Crear los metodos para verificar los errores, y utilizarlo al momento de crearlo (en este metodo)
    return this.repo.save({
      fechaInicio: new Date(dto.fechaInicio),
      estadoSuscripcion: dto.estadoSuscripcion,
      direccionEntrega: dto.direccionEntrega,
      diaSemanaEntrega: dto.diaSemanaEntrega,
      ciclos: dto.ciclos,
    });
  }

  async update(dto: ModificarSuscripcionDto): Promise<Suscripcion> {
    const suscripcionExistente = await this.repo.findById(dto.id);
    if (!suscripcionExistente) {
      throw new Error(`Suscripcion con id ${dto.id} no encontrada`);
    }

    const suscripcionActualizada: Suscripcion = {
      ...suscripcionExistente,
      ...(dto.diaSemanaEntrega !== undefined && { diaSemanaEntrega: dto.diaSemanaEntrega }),
      ...(dto.fechaInicio !== undefined && { fechaInicio: new Date(dto.fechaInicio) }),
      ...(dto.direccionEntrega !== undefined && { direccionEntrega: dto.direccionEntrega }),
      ...(dto.estadoSuscripcion !== undefined && { estadoSuscripcion: dto.estadoSuscripcion }),
      ...(dto.ciclos !== undefined && { ciclos: dto.ciclos }),
    };

    return this.repo.update(suscripcionActualizada);
  }
}
