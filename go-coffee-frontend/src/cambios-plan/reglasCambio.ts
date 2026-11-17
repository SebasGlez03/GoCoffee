import type { Tono } from '../compartido/formato';
import type { SolicitudCambioPlan } from '../compartido/tipos';

/** Texto y color del estado de una solicitud de cambio de plan. */
export function estadoSolicitud(s: SolicitudCambioPlan): { texto: string; tono: Tono } {
  if (s.fechaAplicacion) return { texto: 'Aplicado', tono: 'exito' };
  if (s.estadoSolicitud === 'ACEPTADA') return { texto: 'Aprobado, por aplicar', tono: 'info' };
  if (s.estadoSolicitud === 'RECHAZADA') return { texto: 'Rechazado', tono: 'peligro' };
  return { texto: 'Pendiente de aprobación', tono: 'advertencia' };
}
