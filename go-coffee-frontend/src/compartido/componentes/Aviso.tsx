import type { ReactNode } from 'react';

/** Mensaje en línea: resultado de una acción o una advertencia. */
export function Aviso({
  tono = 'info',
  children,
  onCerrar,
}: {
  tono?: 'exito' | 'error' | 'info' | 'advertencia';
  children: ReactNode;
  onCerrar?: () => void;
}) {
  return (
    <div className={`gc-aviso gc-aviso--${tono}`} role={tono === 'error' ? 'alert' : 'status'}>
      <div className="gc-aviso__texto">{children}</div>
      {onCerrar && (
        <button type="button" className="gc-aviso__cerrar" onClick={onCerrar} aria-label="Cerrar aviso">
          ×
        </button>
      )}
    </div>
  );
}
