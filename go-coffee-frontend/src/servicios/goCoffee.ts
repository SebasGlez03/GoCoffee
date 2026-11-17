import { api, type Sobre } from './api.ts'; 
import type { CrearSuscripcion, DiaSemana, Plan, Suscripcion, OpcionesCambioPlan, SolicitudCambioPlan } from '../tipos/tipos.ts';

export async function traerPlanes(): Promise<Plan[]>{
    const respuesta = await api.get<Sobre<Plan[]>>('/planes');
    return respuesta.data.data;
}

export async function traerPlan(id: number): Promise<Plan> {
    const respuesta = await api.get<Sobre<Plan>>(`/planes/${id}`);
    return respuesta.data.data;
}

export async function subscribirse(datos: CrearSuscripcion): Promise<Suscripcion> {
  const respuesta = await api.post<Sobre<Suscripcion>>('/suscripciones', datos);
  return respuesta.data.data;
}

// El backend identifica al usuario mediante el token de la sesión.
export async function traerSuscripcion(id: number): Promise<Suscripcion> {
  const respuesta = await api.get<Sobre<Suscripcion>>(`/suscripciones/${id}`);
  return respuesta.data.data;
}

export async function traerSuscripciones(): Promise<Suscripcion[]> {
  const respuesta = await api.get<Sobre<Suscripcion[]>>('/suscripciones');
  return respuesta.data.data;
}

export async function desuscribirse(id: number): Promise<Suscripcion> {
  const respuesta = await api.patch<Sobre<Suscripcion>>(`/suscripciones/${id}`, {
    estadoSuscripcion: 'CANCELADA',
  });
  return respuesta.data.data;
}

export async function pausarSuscripcion(id: number): Promise<Suscripcion> {
  const respuesta = await api.patch<Sobre<Suscripcion>>(`/suscripciones/${id}`, {
    estadoSuscripcion: 'PAUSADA',
  });
  return respuesta.data.data;
}

export async function reanudarSuscripcion(id: number): Promise<Suscripcion> {
  const respuesta = await api.patch<Sobre<Suscripcion>>(`/suscripciones/${id}`, {
    estadoSuscripcion: 'ACTIVA',
  });
  return respuesta.data.data;
}

export async function cambiarDiaEntrega(id: number, diaSemanaEntrega: DiaSemana): Promise<Suscripcion> {
  const respuesta = await api.patch<Sobre<Suscripcion>>(`/suscripciones/${id}`, { diaSemanaEntrega });
  return respuesta.data.data;
}

export async function traerOpcionesCambioPlan(id: number): Promise<OpcionesCambioPlan> {
  return (await api.get<Sobre<OpcionesCambioPlan>>(`/suscripciones/${id}/cambios-plan/opciones`)).data.data;
}
export async function traerCambiosPlan(id?: number): Promise<SolicitudCambioPlan[]> {
  return (await api.get<Sobre<SolicitudCambioPlan[]>>(id === undefined ? '/cambios-plan' : `/suscripciones/${id}/cambios-plan`)).data.data;
}
export async function solicitarCambioPlan(id: number, planId: number, precioEsperado: number): Promise<SolicitudCambioPlan> {
  return (await api.post<Sobre<SolicitudCambioPlan>>(`/suscripciones/${id}/cambios-plan`, { planId, precioEsperado })).data.data;
}
export async function resolverCambioPlan(id: number, aceptar: boolean): Promise<SolicitudCambioPlan> {
  return (await api.patch<Sobre<SolicitudCambioPlan>>(`/cambios-plan/${id}/resolucion`, { aceptar })).data.data;
}
