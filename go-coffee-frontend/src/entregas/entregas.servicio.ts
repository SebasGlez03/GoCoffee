import { api } from '../compartido/api/cliente';

/** Salta la entrega de un ciclo: no se entrega ni se cobra ese ciclo. */
export function saltarEntrega(idSuscripcion: number, numCiclo: number) {
  return api.crear<unknown>(`/suscripciones/${idSuscripcion}/ciclos/${numCiclo}/saltar`);
}
