import { api, type Sobre } from './api.ts'; 
import type { CrearSuscripcion, Plan } from '../tipos/tipos.ts';

export async function traerPlanes(): Promise<Plan[]>{
    const respuesta = await api.get<Sobre<Plan[]>>('/planes');
    return respuesta.data.data;
}

export async function traerPlan(id: number): Promise<Plan> {
    const respuesta = await api.get<Sobre<Plan>>(`/planes/${id}`);
    return respuesta.data.data;
}

export async function subscribirse(datos: CrearSuscripcion): Promise<void> {
  await api.post('/suscripciones', datos);
}
