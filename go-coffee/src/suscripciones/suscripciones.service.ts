import { Inject, Injectable } from '@nestjs/common';
import { SUSCRIPCIONES_REPOSITORY } from './suscripciones.tokens';
import type { SuscripcionRepository } from './dominio/suscripcion.repository';
import { CrearSuscripcionDto } from './dto/crear-suscripcion.dto';
import { ModificarSuscripcionDto } from './dto/modificar-suscripcion.dto';
import { Suscripcion } from '../dominio/entidades';
import {
  CambioRetroactivoError,
  CiclosSuscripcionesVacios,
  DiaSemanaEntregadoVacio,
  DireccionEntregaVacia,
  EstadoSuscripcionVacio,
  FechaVacia,
  IdInvalidoError,
  SuscripcionCanceladaError,
  SuscripcionNoEncontradaError,
} from '../dominio/errores';

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
    this.validarCamposObligatorios(dto);

    const fechaInicio = new Date(dto.fechaInicio);
    if (fechaInicio.getTime() < Date.now()) {
      throw new CambioRetroactivoError(fechaInicio);
    }

    return this.repo.save({
      fechaInicio: new Date(dto.fechaInicio),
      estadoSuscripcion: dto.estadoSuscripcion,
      direccionEntrega: dto.direccionEntrega,
      diaSemanaEntrega: dto.diaSemanaEntrega,
      ciclos: dto.ciclos,
    });
  }

  private validarCamposObligatorios(dto: CrearSuscripcionDto): void {
    if (!dto.diaSemanaEntrega) {
      throw new DiaSemanaEntregadoVacio();
    }
    if (!dto.fechaInicio) {
      throw new FechaVacia();
    }
    if (!dto.direccionEntrega) {
      throw new DireccionEntregaVacia();
    }
    if (!dto.estadoSuscripcion) {
      throw new EstadoSuscripcionVacio();
    }
    if (!dto.ciclos) {
      throw new CiclosSuscripcionesVacios();
    }
  }

  async update(dto: ModificarSuscripcionDto): Promise<Suscripcion> {
    if (!Number.isInteger(dto.id) || dto.id <= 0) {
      throw new IdInvalidoError();
    }

    const suscripcionExistente = await this.repo.findById(dto.id);
    if (!suscripcionExistente) {
      throw new SuscripcionNoEncontradaError(dto.id);
    }
    if (suscripcionExistente.estadoSuscripcion == 'CANCELADA') {
      throw new SuscripcionCanceladaError(dto.id);
    }
    if (dto.diaSemanaEntrega != undefined && !dto.diaSemanaEntrega) {
      throw new DiaSemanaEntregadoVacio();
    }
    if (dto.direccionEntrega != undefined && !dto.direccionEntrega) {
      throw new DireccionEntregaVacia();
    }
    if (dto.estadoSuscripcion != undefined && !dto.estadoSuscripcion) {
      throw new EstadoSuscripcionVacio();
    }
    if (dto.ciclos != undefined && !dto.ciclos) {
      throw new CiclosSuscripcionesVacios();
    }
    if (dto.fechaInicio != undefined) {
      const fecha = new Date(dto.fechaInicio);
      if (fecha.getTime() < Date.now()) {
        throw new CambioRetroactivoError(fecha);
      }
    }

    const suscripcionActualizada: Suscripcion = {
      ...suscripcionExistente,
      ...(dto.diaSemanaEntrega !== undefined && {
        diaSemanaEntrega: dto.diaSemanaEntrega,
      }),
      ...(dto.fechaInicio !== undefined && {
        fechaInicio: new Date(dto.fechaInicio),
      }),
      ...(dto.direccionEntrega !== undefined && {
        direccionEntrega: dto.direccionEntrega,
      }),
      ...(dto.estadoSuscripcion !== undefined && {
        estadoSuscripcion: dto.estadoSuscripcion,
      }),
      ...(dto.ciclos !== undefined && { ciclos: dto.ciclos }),
    };

    return this.repo.update(suscripcionActualizada);
  }
}
