import { useEffect, useRef, useState } from 'react';
import { aErrorApi, type ErrorApi } from '../api/errores';

export interface Consulta<T> {
  datos: T | null;
  cargando: boolean;
  error: ErrorApi | null;
  /** Vuelve a pedir los datos mostrando "cargando". */
  reintentar: () => void;
  /** Reemplaza los datos sin volver a pedirlos (después de una acción). */
  actualizar: (datos: T) => void;
}

/**
 * Pide datos al servicio y expone las situaciones de toda pantalla:
 * cargando, con datos, con error (y la pantalla decide cuándo está vacía).
 * `llave` identifica la consulta: si cambia (p. ej. otro id), se repite.
 */
export function useConsulta<T>(llave: string, consulta: () => Promise<T>): Consulta<T> {
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] = useState<{
    llave: string;
    datos: T | null;
    error: ErrorApi | null;
  } | null>(null);
  const consultaActual = useRef(consulta);
  const llaveCompleta = `${llave}#${intento}`;

  useEffect(() => {
    consultaActual.current = consulta;
  });

  useEffect(() => {
    let vigente = true;
    consultaActual
      .current()
      .then((datos) => {
        if (vigente) setResultado({ llave: llaveCompleta, datos, error: null });
      })
      .catch((e: unknown) => {
        if (vigente) setResultado({ llave: llaveCompleta, datos: null, error: aErrorApi(e) });
      });
    return () => {
      vigente = false;
    };
  }, [llaveCompleta]);

  const listo = resultado?.llave === llaveCompleta;
  return {
    datos: listo ? resultado.datos : null,
    cargando: !listo,
    error: listo ? resultado.error : null,
    reintentar: () => setIntento((n) => n + 1),
    actualizar: (datos: T) => setResultado({ llave: llaveCompleta, datos, error: null }),
  };
}
