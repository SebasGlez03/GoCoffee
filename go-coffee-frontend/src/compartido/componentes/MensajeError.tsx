import type { ErrorApi } from '../api/errores';

/** Situación "algo falló": explica qué pasó y permite reintentar. */
export function MensajeError({ error, onReintentar }: { error: ErrorApi; onReintentar?: () => void }) {
  const sinConexion = error.tipo === 'sin-conexion';
  return (
    <div className="gc-estado-pantalla gc-estado-pantalla--error" role="alert">
      <span className="gc-estado-pantalla__icono" aria-hidden="true">
        {sinConexion ? '📡' : '⚠️'}
      </span>
      <h2>{sinConexion ? 'No hay conexión con GoCoffee' : 'No pudimos cargar esta información'}</h2>
      <p>{error.message}</p>
      {onReintentar && (
        <button type="button" className="gc-boton" onClick={onReintentar}>
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}
