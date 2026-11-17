import { useRef, useState } from 'react';
import { aErrorApi } from '../api/errores';

/**
 * Ejecuta operaciones que cambian datos (pausar, cancelar, guardar…):
 * evita el doble clic y guarda el resultado para mostrarlo al usuario.
 * `clave` dice cuál botón está trabajando ("pausar", "saltar-3", etc.).
 */
export function useAccion() {
  const [enCurso, setEnCurso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const ocupado = useRef(false);

  async function ejecutar<T>(
    clave: string,
    operacion: () => Promise<T>,
    mensajeExito?: string | ((resultado: T) => string),
  ): Promise<T | undefined> {
    if (ocupado.current) return undefined;
    ocupado.current = true;
    setEnCurso(clave);
    setError(null);
    setExito(null);
    try {
      const resultado = await operacion();
      if (mensajeExito) {
        setExito(typeof mensajeExito === 'function' ? mensajeExito(resultado) : mensajeExito);
      }
      return resultado;
    } catch (e) {
      setError(aErrorApi(e).message);
      return undefined;
    } finally {
      ocupado.current = false;
      setEnCurso(null);
    }
  }

  function limpiar() {
    setError(null);
    setExito(null);
  }

  return { ejecutar, enCurso, ocupado: enCurso !== null, error, exito, limpiar };
}
