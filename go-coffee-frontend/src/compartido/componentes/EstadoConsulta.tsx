import type { ReactNode } from 'react';
import type { Consulta } from '../hooks/useConsulta';
import { Cargando } from './Cargando';
import { MensajeError } from './MensajeError';

/**
 * Resuelve las cuatro situaciones de una pantalla que pide datos:
 * cargando, error, vacía y con información.
 */
export function EstadoConsulta<T>({
  consulta,
  textoCarga,
  estaVacio,
  vacio,
  noEncontrado,
  children,
}: {
  consulta: Consulta<T>;
  textoCarga?: string;
  estaVacio?: (datos: T) => boolean;
  vacio?: ReactNode;
  /** Qué mostrar si el servicio responde 404 (o 403 en recursos ajenos). */
  noEncontrado?: ReactNode;
  children: (datos: T) => ReactNode;
}) {
  if (consulta.cargando) return <Cargando texto={textoCarga} />;
  if (consulta.error) {
    const ajeno = consulta.error.tipo === 'no-encontrado' || consulta.error.tipo === 'permiso';
    if (ajeno && noEncontrado) return <>{noEncontrado}</>;
    // La sesión vencida la atiende SesionContext (redirige al inicio de sesión).
    if (consulta.error.tipo === 'sesion') return <Cargando texto="Tu sesión expiró…" />;
    return <MensajeError error={consulta.error} onReintentar={consulta.reintentar} />;
  }
  if (consulta.datos === null) return null;
  if (estaVacio?.(consulta.datos)) return <>{vacio}</>;
  return <>{children(consulta.datos)}</>;
}
