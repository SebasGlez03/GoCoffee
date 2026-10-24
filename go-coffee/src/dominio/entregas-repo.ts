import { Entrega } from './entidades';

export interface EntregaRepository {
  save(
    entrega: Entrega,
    idSuscripcion: number,
    numCiclo: number,
  ): Promise<Entrega>;
  findById(idEntrega: number): Promise<Entrega | null>;
  findAllBySuscripcion(idSuscripcion: number): Promise<Entrega[]>;
  findBySuscripcionYCiclo(
    idSuscripcion: number,
    numCiclo: number,
  ): Promise<Entrega | null>;
}

export class EntregaMemoriaRepository implements EntregaRepository {
  private entregas: {
    entrega: Entrega;
    idSuscripcion: number;
    numCiclo: number;
  }[] = [];

  save(
    entrega: Entrega,
    idSuscripcion: number,
    numCiclo: number,
  ): Promise<Entrega> {
    this.entregas.push({ entrega, idSuscripcion, numCiclo });
    return Promise.resolve(entrega);
  }

  findById(idEntrega: number): Promise<Entrega | null> {
    return Promise.resolve(
      this.entregas.find((item) => item.entrega.idEntrega === idEntrega)
        ?.entrega ?? null,
    );
  }

  findAllBySuscripcion(idSuscripcion: number): Promise<Entrega[]> {
    return Promise.resolve(
      this.entregas
        .filter((item) => item.idSuscripcion === idSuscripcion)
        .map((item) => item.entrega),
    );
  }

  findBySuscripcionYCiclo(
    idSuscripcion: number,
    numCiclo: number,
  ): Promise<Entrega | null> {
    return Promise.resolve(
      this.entregas.find(
        (item) =>
          item.idSuscripcion === idSuscripcion && item.numCiclo === numCiclo,
      )?.entrega ?? null,
    );
  }
}
