import type { ReactNode } from 'react';
import type { Tono } from '../formato';

/** Píldora de color para estados (Activa, Pagado, En camino…). */
export function Etiqueta({ tono, children }: { tono: Tono; children: ReactNode }) {
  return <span className={`gc-etiqueta gc-etiqueta--${tono}`}>{children}</span>;
}
