import { api, type Sobre } from './api.ts'; 
import type { CrearSuscripcion, Plan, Suscripcion } from '../tipos/tipos.ts';

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
