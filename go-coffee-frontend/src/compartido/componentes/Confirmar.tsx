import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Ventana de confirmación para acciones importantes (cancelar, pausar…).
 * Se cierra con Esc o con "Volver".
 */
export function Confirmar({
  titulo,
  children,
  textoConfirmar,
  peligro = false,
  ocupado = false,
  onConfirmar,
  onCancelar,
}: {
  titulo: string;
  children: ReactNode;
  textoConfirmar: string;
  peligro?: boolean;
  ocupado?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const botonVolver = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    botonVolver.current?.focus();
    function alPresionar(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancelar();
    }
    document.addEventListener('keydown', alPresionar);
    return () => document.removeEventListener('keydown', alPresionar);
  }, [onCancelar]);

  return (
    <div className="gc-dialogo__fondo" onClick={onCancelar}>
      <div
        className="gc-dialogo"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gc-dialogo-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="gc-dialogo-titulo">{titulo}</h2>
        <div className="gc-dialogo__cuerpo">{children}</div>
        <div className="gc-dialogo__acciones">
          <button ref={botonVolver} type="button" className="gc-boton gc-boton--secundario" onClick={onCancelar} disabled={ocupado}>
            Volver
          </button>
          <button
            type="button"
            className={`gc-boton${peligro ? ' gc-boton--peligro' : ''}`}
            onClick={onConfirmar}
            disabled={ocupado}
          >
            {ocupado ? 'Procesando…' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
