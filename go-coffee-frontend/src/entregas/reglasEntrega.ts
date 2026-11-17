import type { Ciclo, Suscripcion } from '../compartido/tipos';

/**
 * Indica si el botón "Saltar" tiene sentido. Solo acomoda la interfaz:
 * la regla real la valida el servicio (y si la rechaza, se muestra el motivo).
 */
export function puedeSaltar(suscripcion: Suscripcion, ciclo: Ciclo): boolean {
  return (
    (suscripcion.estadoSuscripcion === 'ACTIVA' || suscripcion.estadoSuscripcion === 'PAUSADA') &&
    ciclo.entrega?.estadoEntrega === 'PROGRAMADA' &&
    ciclo.cobro?.estado !== 'PAGADO' &&
    new Date(ciclo.entrega.fechaProgramada) > new Date()
  );
}

export function fechaDeCiclo(ciclo: Ciclo): string {
  return ciclo.entrega?.fechaProgramada ?? ciclo.fechaProgramada;
}

/** true si la fecha todavía no pasa. */
export function esFutura(iso: string): boolean {
  return new Date(iso).getTime() >= Date.now();
}
