import { api } from '../compartido/api/cliente';
import type { OpcionesCambioPlan, SolicitudCambioPlan } from '../compartido/tipos';

export function traerOpcionesCambio(idSuscripcion: number) {
  return api.obtener<OpcionesCambioPlan>(`/suscripciones/${idSuscripcion}/cambios-plan/opciones`);
}

export function traerHistorialCambios(idSuscripcion: number) {
  return api.obtener<SolicitudCambioPlan[]>(`/suscripciones/${idSuscripcion}/cambios-plan`);
}

export function solicitarCambio(
  idSuscripcion: number,
  datos: { planId: number; precioEsperado: number; numCicloAplicacion: number },
) {
  return api.crear<SolicitudCambioPlan>(`/suscripciones/${idSuscripcion}/cambios-plan`, datos);
}
