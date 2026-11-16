import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { Usuario } from '../dominio/entidades';

import { SUSCRIPCIONES_REPOSITORY } from './suscripciones.tokens';
import type { SuscripcionRepository } from './dominio/suscripcion.repository';
import { CrearSuscripcionDto } from './dto/crear-suscripcion.dto';
import type { ModificacionSuscripcion } from '../dominio/entidades-repo';
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

export type UsuarioSesion = Pick<Usuario, 'idUsuario' | 'rol'>;

@Injectable()
export class SuscripcionesService {
  constructor(
    @Inject(SUSCRIPCIONES_REPOSITORY)
    private readonly repo: SuscripcionRepository,
  ) { }

  async findById(id: number, usuario: UsuarioSesion): Promise<Suscripcion | null> {
    const suscripcion = await this.repo.findById(id);
    if (suscripcion) this.validarPropietario(suscripcion, usuario);
    return suscripcion;
  }

  findAll(usuario: UsuarioSesion): Promise<Suscripcion[]> {
    return this.repo.findAll(usuario.rol === 'ADMINISTRADOR' ? undefined : usuario.idUsuario);
  }

  async save(dto: CrearSuscripcionDto, usuario: UsuarioSesion): Promise<Suscripcion> {
    this.validarCamposObligatorios(dto);

    const fechaInicio = new Date(dto.fechaInicio);
    if (fechaInicio.getTime() < Date.now()) {
      throw new CambioRetroactivoError(fechaInicio);
    }

    const direccionEntrega = {
      idDireccionEntrega: dto.direccionEntrega.idDireccionEntrega ?? 0,
      calle: dto.direccionEntrega.calle,
      codigoPostal: dto.direccionEntrega.codigoPostal,
      numeroCasa: dto.direccionEntrega.numeroCasa,
      estado: dto.direccionEntrega.estado,
    };

    return this.repo.save({
      usuarioId: usuario.idUsuario,
      planId: dto.planId,
      fechaInicio,
      estadoSuscripcion: dto.estadoSuscripcion,
      direccionEntrega,
      diaSemanaEntrega: dto.diaSemanaEntrega,
      ciclos: dto.ciclos,
    });
  }

  private validarCamposObligatorios(dto: CrearSuscripcionDto): void {
    if (!dto.planId || dto.planId <= 0) {
      throw new IdInvalidoError();
    }
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

  private validarPropietario(suscripcion: Suscripcion, usuario: UsuarioSesion): void {
    if (usuario.rol !== 'ADMINISTRADOR' && suscripcion.usuarioId !== usuario.idUsuario) {
      throw new ForbiddenException('No tienes acceso a esta suscripción.');
    }
  }

  async update(id: number, modificacion: ModificacionSuscripcion, usuario: UsuarioSesion): Promise<Suscripcion> {
   
   
    if (!Number.isInteger(id) || id <= 0) {
      throw new IdInvalidoError();
    }
    if (modificacion.idSuscripcion != undefined || modificacion.usuarioId !== undefined) {
      throw new IdInvalidoError();
    }

    const suscripcionExistente = await this.repo.findById(id);
    if (!suscripcionExistente) {
      throw new SuscripcionNoEncontradaError(id);
    }
    this.validarPropietario(suscripcionExistente, usuario);
    if (suscripcionExistente.estadoSuscripcion == 'CANCELADA') {
      throw new SuscripcionCanceladaError(id);
    }

    if (modificacion.diaSemanaEntrega != undefined && !modificacion.diaSemanaEntrega) {
      throw new DiaSemanaEntregadoVacio();
    }
    if (modificacion.direccionEntrega != undefined && !modificacion.direccionEntrega) {
      throw new DireccionEntregaVacia();
    }
    if (modificacion.estadoSuscripcion != undefined && !modificacion.estadoSuscripcion) {
      throw new EstadoSuscripcionVacio();
    }
    if (modificacion.ciclos != undefined && !modificacion.ciclos) {
      throw new CiclosSuscripcionesVacios();
    }
    if (modificacion.fechaInicio != undefined) {
      const fecha = new Date(modificacion.fechaInicio);
      if (fecha.getTime() < Date.now()) {
        throw new CambioRetroactivoError(fecha);
      }
    }

    const suscripcionActualizada: Suscripcion = {
      ...suscripcionExistente,
      ...(modificacion.diaSemanaEntrega !== undefined && {
        diaSemanaEntrega: modificacion.diaSemanaEntrega,
      }),
      ...(modificacion.fechaInicio !== undefined && {
        fechaInicio: new Date(modificacion.fechaInicio),
      }),
      ...(modificacion.direccionEntrega !== undefined && {
        direccionEntrega: modificacion.direccionEntrega,
      }),
      ...(modificacion.estadoSuscripcion !== undefined && {
        estadoSuscripcion: modificacion.estadoSuscripcion,
      }),
      ...(modificacion.ciclos !== undefined && { ciclos: modificacion.ciclos }),
    };

    return this.repo.update(suscripcionActualizada);
  }
}
