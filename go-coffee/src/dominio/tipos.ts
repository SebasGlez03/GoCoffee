export type EstadoPlan = 'OBSOLETO' | 'ACTUAL' | 'INACTIVO';

export type EstadoSuscripcion =
  'ACTIVA' | 'PAUSADA' | 'SUSPENDIDA' | 'CANCELADA';

export type EstadoCobro = 'FALLIDO' | 'PAGADO';

export type EstadoEntrega =
  'PROGRAMADA' | 'SALTADA' | 'ARMADA' | 'ENTREGADA' | 'ENVIADA';

export type EstadoSolicitud = 'ACEPTADA' | 'RECHAZADA' | 'PENDIENTE';

export type Rol = 'ADMINISTRADOR' | 'CLIENTE';

export type FrecuenciaEntrega = 'SEMANAL' | 'QUINCENAL' | 'MENSUAL';
