import { Inject, Injectable } from '@nestjs/common';
import { SUSCRIPCIONES_REPOSITORY } from './suscripciones.tokens';
import type { SuscripcionRepository } from './dominio/suscripcion.repository';
import { Suscripcion } from 'src/dominio/entidades';
import { CrearSuscripcionDto } from './dto/crear-suscripcion.dto';

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
      fechaInicio: new Date(dto.fechaInicio), // WARN: Esto se hizo porque del DTO viene en string, pero hay que revisarlo a fondo.
      estadoSuscripcion: dto.estadoSuscripcion,
      direccionEntrega: dto.direccionEntrega,
      diaSemanaEntrega: dto.diaSemanaEntrega,
      ciclos: dto.ciclos,
    });
  }
}
