import { api } from '../compartido/api/cliente';
import type { CrearSuscripcionCuerpo, DiaSemana, Suscripcion } from '../compartido/tipos';

/** El servicio sabe quién es el usuario por el token: solo regresa lo suyo. */
export function traerMisSuscripciones() {
  return api.obtener<Suscripcion[]>('/suscripciones');
}

export function traerSuscripcion(id: number) {
  return api.obtener<Suscripcion>(`/suscripciones/${id}`);
}

export function crearSuscripcion(datos: CrearSuscripcionCuerpo) {
  return api.crear<Suscripcion>('/suscripciones', datos);
}

export function pausarSuscripcion(id: number) {
  return api.modificar<Suscripcion>(`/suscripciones/${id}`, { estadoSuscripcion: 'PAUSADA' });
}

export function reanudarSuscripcion(id: number) {
  return api.modificar<Suscripcion>(`/suscripciones/${id}`, { estadoSuscripcion: 'ACTIVA' });
}

export function cancelarSuscripcion(id: number) {
  return api.modificar<Suscripcion>(`/suscripciones/${id}`, { estadoSuscripcion: 'CANCELADA' });
}

export function cambiarDiaEntrega(id: number, diaSemanaEntrega: DiaSemana) {
  return api.modificar<Suscripcion>(`/suscripciones/${id}`, { diaSemanaEntrega });
}
