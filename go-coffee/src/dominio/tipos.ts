export const ESTADOS_PLAN = ['OBSOLETO', 'ACTUAL', 'INACTIVO'] as const;
export type EstadoPlan = typeof ESTADOS_PLAN[number];

export const ESTADOS_SUSCRIPCION = [
  'ACTIVA',
  'PAUSADA',
  'SUSPENDIDA',
  'CANCELADA',
] as const;
export type EstadoSuscripcion = typeof ESTADOS_SUSCRIPCION[number];

export const ESTADOS_COBRO = ['FALLIDO', 'PAGADO'] as const;
export type EstadoCobro = typeof ESTADOS_COBRO[number];

export const ESTADOS_ENTREGA = [
  'PROGRAMADA',
  'SALTADA',
  'ARMADA',
  'ENTREGADA',
  'ENVIADA',
] as const;
export type EstadoEntrega = typeof ESTADOS_ENTREGA[number];

export const ESTADOS_SOLICITUD = ['ACEPTADA', 'RECHAZADA', 'PENDIENTE'] as const;
export type EstadoSolicitud = typeof ESTADOS_SOLICITUD[number];

export const ROLES = ['ADMINISTRADOR', 'CLIENTE'] as const;
export type Rol = typeof ROLES[number];

export const FRECUENCIAS_ENTREGA = ['SEMANAL', 'QUINCENAL', 'MENSUAL'] as const;
export type FrecuenciaEntrega = typeof FRECUENCIAS_ENTREGA[number];

export const DIAS_SEMANA = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
] as const;
export type DiaSemana = typeof DIAS_SEMANA[number];