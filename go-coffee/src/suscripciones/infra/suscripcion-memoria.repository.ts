import { Injectable } from '@nestjs/common';
import { SuscripcionRepository } from '../dominio/suscripcion.repository';
import { Suscripcion } from 'src/dominio/entidades';

@Injectable()
export class SuscripcionMemoriaRepository implements SuscripcionRepository {
  private suscripciones: Suscripcion[] = [];
  private siguienteId = 1;

  async findById(id: number): Promise<Suscripcion | null> {
    return (
      this.suscripciones.find((s) => s.idSuscripcion === id) ?? null
    );
  }

  async findAll(): Promise<Suscripcion[]> {
    return this.suscripciones;
  }

  async save(entidad: Suscripcion): Promise<Suscripcion> {
    const nueva: Suscripcion = {
      idSuscripcion: this.siguienteId++,
      ciclos: entidad.ciclos,
      diaSemanaEntrega: entidad.diaSemanaEntrega,
      direccionEntrega: entidad.direccionEntrega,
      estadoSuscripcion: entidad.estadoSuscripcion,
      fechaInicio: entidad.fechaInicio,
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

  // TODO: No se si debemos de agregar el cancelar como en las versiones que hizo el profe.
}
