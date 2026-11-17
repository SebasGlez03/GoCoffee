import type {
  DiaSemana,
  EstadoCobro,
  EstadoEntrega,
  EstadoSolicitud,
  EstadoSuscripcion,
  FrecuenciaEntrega,
  MarcaTarjeta,
} from './tipos';

/** Textos y formatos que se repiten en varias pantallas. */

const formatoMoneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const formatoFecha = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const formatoFechaCorta = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const formatoFechaLarga = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export const moneda = (valor: number) => formatoMoneda.format(valor);
export const fecha = (iso: string) => formatoFecha.format(new Date(iso));
export const fechaCorta = (iso: string) => formatoFechaCorta.format(new Date(iso));
export const fechaLarga = (iso: string) => formatoFechaLarga.format(new Date(iso));

export const NOMBRE_DIA: Record<DiaSemana, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

export const NOMBRE_FRECUENCIA: Record<FrecuenciaEntrega, string> = {
  SEMANAL: 'Semanal',
  QUINCENAL: 'Quincenal',
  MENSUAL: 'Mensual',
};

export const DETALLE_FRECUENCIA: Record<FrecuenciaEntrega, string> = {
  SEMANAL: 'una entrega cada 7 días',
  QUINCENAL: 'una entrega cada 15 días',
  MENSUAL: 'una entrega cada 31 días',
};

export const NOMBRE_ESTADO_SUSCRIPCION: Record<EstadoSuscripcion, string> = {
  ACTIVA: 'Activa',
  PAUSADA: 'Pausada',
  SUSPENDIDA: 'Suspendida',
  CANCELADA: 'Cancelada',
};

export const NOMBRE_ESTADO_ENTREGA: Record<EstadoEntrega, string> = {
  PROGRAMADA: 'Programada',
  SALTADA: 'Saltada',
  ARMADA: 'En preparación',
  ENVIADA: 'En camino',
  ENTREGADA: 'Entregada',
};

export const NOMBRE_ESTADO_COBRO: Record<EstadoCobro, string> = {
  PAGADO: 'Pagado',
  FALLIDO: 'Fallido',
};

export const NOMBRE_ESTADO_SOLICITUD: Record<EstadoSolicitud, string> = {
  PENDIENTE: 'Pendiente de aprobación',
  ACEPTADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
};

export const NOMBRE_MARCA: Record<MarcaTarjeta, string> = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMEX: 'American Express',
  OTRA: 'Otra',
};

/** Tono visual de cada estado (se usa en las etiquetas de color). */
export type Tono = 'exito' | 'advertencia' | 'peligro' | 'info' | 'neutro';

export const TONO_SUSCRIPCION: Record<EstadoSuscripcion, Tono> = {
  ACTIVA: 'exito',
  PAUSADA: 'advertencia',
  SUSPENDIDA: 'peligro',
  CANCELADA: 'neutro',
};

export const TONO_ENTREGA: Record<EstadoEntrega, Tono> = {
  PROGRAMADA: 'info',
  SALTADA: 'neutro',
  ARMADA: 'advertencia',
  ENVIADA: 'advertencia',
  ENTREGADA: 'exito',
};

export const TONO_COBRO: Record<EstadoCobro, Tono> = {
  PAGADO: 'exito',
  FALLIDO: 'peligro',
};

export const bolsas = (n: number) => `${n} ${n === 1 ? 'bolsa' : 'bolsas'} de 250 g`;
