import type { Suscripcion } from '../compartido/tipos';
import { esFutura, fechaDeCiclo } from '../entregas/reglasEntrega';

/** Fecha de la próxima entrega programada (o null si no hay). */
export function proximaEntrega(suscripcion: Suscripcion): string | null {
  const fechas = suscripcion.ciclos
    .filter((c) => c.entrega?.estadoEntrega === 'PROGRAMADA')
    .map(fechaDeCiclo)
    .filter(esFutura)
    .sort();
  return fechas[0] ?? null;
}

/** Orden para la lista: activas primero, canceladas al final. */
const ORDEN = { ACTIVA: 0, SUSPENDIDA: 1, PAUSADA: 2, CANCELADA: 3 } as const;

export function ordenarSuscripciones(lista: Suscripcion[]): Suscripcion[] {
  return [...lista].sort(
    (a, b) => ORDEN[a.estadoSuscripcion] - ORDEN[b.estadoSuscripcion] || b.id - a.id,
  );
}
