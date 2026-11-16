import { Injectable } from '@nestjs/common';
import { SuscripcionRepository } from '../dominio/suscripcion.repository';
import { Suscripcion } from '../../dominio/entidades';
import { SuscripcionDuplicadaError, SuscripcionInactivaError } from '../../dominio/errores';
import type { NuevaSuscripcion } from '../../dominio/entidades-repo';

@Injectable()
export class SuscripcionMemoriaRepository implements SuscripcionRepository {
  private suscripciones: Suscripcion[] = [];
  private siguienteId = 1;

  async findByUsuarioYPlan(usuarioId: number, planId: number): Promise<Suscripcion | null> {
    return this.suscripciones.find((s) => s.usuarioId === usuarioId && s.planId === planId) ?? null;
  }

  async findById(id: number): Promise<Suscripcion | null> {
    return (
      this.suscripciones.find((s) => s.idSuscripcion === id) ?? null
    );
  }

  async findAll(usuarioId?: number): Promise<Suscripcion[]> {
    return this.suscripciones.filter((s) => usuarioId === undefined || s.usuarioId === usuarioId);
  }

  async save(entidad: NuevaSuscripcion): Promise<Suscripcion> {
    if (this.suscripciones.some((s) => s.usuarioId === entidad.usuarioId && s.planId === entidad.planId)) {
      throw new SuscripcionDuplicadaError();
    }
    const nueva: Suscripcion = {
      idSuscripcion: this.siguienteId++,
      usuarioId: entidad.usuarioId,
      ciclos: entidad.ciclos,
      diaSemanaEntrega: entidad.diaSemanaEntrega,
      direccionEntrega: entidad.direccionEntrega,
      estadoSuscripcion: entidad.estadoSuscripcion,
      fechaInicio: entidad.fechaInicio,
      planId: entidad.planId
    };
    this.suscripciones.push(nueva);
    return nueva;
  }

  async delete(id: number): Promise<void> {
    const index = this.suscripciones.findIndex((s) => s.idSuscripcion === id);
    if (index !== -1) {
      this.suscripciones.splice(index, 1);
    }
  }

  async update(entidad: Suscripcion): Promise<Suscripcion> {
    const index = this.suscripciones.findIndex((s) => s.idSuscripcion === entidad.idSuscripcion);
    if (index !== -1) {
      this.suscripciones[index] = entidad;
      return entidad;
    }
    throw new SuscripcionInactivaError(entidad.idSuscripcion);
  }

  // TODO: No se si debemos de agregar el cancelar como en las versiones que hizo el profe.
}
