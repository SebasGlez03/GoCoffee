import { Entrega } from './entidades';

export interface EntregaRepository {
  save(entrega: Entrega): Promise<Entrega>;
  findById(idEntrega: number): Promise<Entrega | null>;
  findAllBySuscripcion(idSuscripcion: number): Promise<Entrega[]>;
}

export class EntregaMemoriaRepository implements EntregaRepository {
  private entregas: Entrega[] = [];

  async save(entrega: Entrega): Promise<Entrega> {
    this.entregas.push(entrega);
    return entrega;
  }

  async findById(idEntrega: number): Promise<Entrega | null> {
    return this.entregas.find((e) => e.idEntrega === idEntrega) || null;
  }

  async findAllBySuscripcion(): Promise<Entrega[]> {
    return this.entregas;
  }
}