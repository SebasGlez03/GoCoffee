import { api, type Sobre } from './api.ts';
import type {
  Cobro,
  CrearSuscripcion,
  DiaSemana,
  CicloAdministracion,
  MetodoPago,
  Plan,
  Suscripcion,
  OpcionesCambioPlan,
  SolicitudCambioPlan,
} from '../tipos/tipos.ts';

export async function traerPlanes(): Promise<Plan[]> {
  const respuesta = await api.get<Sobre<Plan[]>>('/planes');
  return respuesta.data.data;
}

export async function traerPlan(id: number): Promise<Plan> {
  const respuesta = await api.get<Sobre<Plan>>(`/planes/${id}`);
  return respuesta.data.data;
}

export async function subscribirse(
  datos: CrearSuscripcion,
): Promise<Suscripcion> {
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
  const respuesta = await api.patch<Sobre<Suscripcion>>(
    `/suscripciones/${id}`,
    {
      estadoSuscripcion: 'CANCELADA',
    },
  );
  return respuesta.data.data;
}

export async function pausarSuscripcion(id: number): Promise<Suscripcion> {
  const respuesta = await api.patch<Sobre<Suscripcion>>(
    `/suscripciones/${id}`,
    {
      estadoSuscripcion: 'PAUSADA',
    },
  );
  return respuesta.data.data;
}

export async function reanudarSuscripcion(id: number): Promise<Suscripcion> {
  const respuesta = await api.patch<Sobre<Suscripcion>>(
    `/suscripciones/${id}`,
    {
      estadoSuscripcion: 'ACTIVA',
    },
  );
  return respuesta.data.data;
}

export async function cambiarDiaEntrega(
  id: number,
  diaSemanaEntrega: DiaSemana,
): Promise<Suscripcion> {
  const respuesta = await api.patch<Sobre<Suscripcion>>(
    `/suscripciones/${id}`,
    { diaSemanaEntrega },
  );
  return respuesta.data.data;
}

export async function traerOpcionesCambioPlan(
  id: number,
): Promise<OpcionesCambioPlan> {
  return (
    await api.get<Sobre<OpcionesCambioPlan>>(
      `/suscripciones/${id}/cambios-plan/opciones`,
    )
  ).data.data;
}
export async function traerCambiosPlan(
  id?: number,
): Promise<SolicitudCambioPlan[]> {
  return (
    await api.get<Sobre<SolicitudCambioPlan[]>>(
      id === undefined ? '/cambios-plan' : `/suscripciones/${id}/cambios-plan`,
    )
  ).data.data;
}
export async function solicitarCambioPlan(
  id: number,
  planId: number,
  precioEsperado: number,
  numCicloAplicacion: number,
): Promise<SolicitudCambioPlan> {
  return (
    await api.post<Sobre<SolicitudCambioPlan>>(
      `/suscripciones/${id}/cambios-plan`,
      { planId, precioEsperado, numCicloAplicacion },
    )
  ).data.data;
}
export async function resolverCambioPlan(
  id: number,
  aceptar: boolean,
): Promise<SolicitudCambioPlan> {
  return (
    await api.patch<Sobre<SolicitudCambioPlan>>(
      `/cambios-plan/${id}/resolucion`,
      { aceptar },
    )
  ).data.data;
}

export async function saltarEntrega(idSuscripcion: number, numCiclo: number) {
  return (
    await api.post<Sobre<unknown>>(
      `/suscripciones/${idSuscripcion}/ciclos/${numCiclo}/saltar`,
    )
  ).data.data;
}

export async function traerMetodoPago(): Promise<MetodoPago | null> {
  return (await api.get<Sobre<MetodoPago | null>>('/cobros/metodo-pago')).data
    .data;
}

export async function guardarMetodoPago(
  datos: Pick<MetodoPago, 'titular' | 'marca' | 'ultimos4'>,
): Promise<MetodoPago> {
  return (await api.put<Sobre<MetodoPago>>('/cobros/metodo-pago', datos)).data
    .data;
}

export async function traerHistorialCobros(): Promise<Cobro[]> {
  return (await api.get<Sobre<Cobro[]>>('/cobros/historial')).data.data;
}

export interface FiltrosCiclosAdmin {
  desde?: string;
  hasta?: string;
  estadoEntrega?: string;
  estadoCobro?: string;
  idSuscripcion?: number;
}

export async function traerCiclosAdmin(
  filtros: FiltrosCiclosAdmin,
): Promise<CicloAdministracion[]> {
  return (
    await api.get<Sobre<CicloAdministracion[]>>('/administracion/ciclos', {
      params: filtros,
    })
  ).data.data;
}

export async function registrarCobro(datos: {
  idSuscripcion: number;
  numCiclo: number;
  estadoCobro: 'PAGADO' | 'FALLIDO';
  referencia?: string;
}): Promise<Cobro> {
  return (await api.post<Sobre<Cobro>>('/cobros', datos)).data.data;
}
