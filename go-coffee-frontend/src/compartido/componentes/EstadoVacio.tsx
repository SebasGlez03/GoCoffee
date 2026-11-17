import type { ReactNode } from 'react';

/** Situación "salió bien pero no hay nada": dice por qué y qué hacer. */
export function EstadoVacio({
  icono = '☕',
  titulo,
  children,
  accion,
}: {
  icono?: string;
  titulo: string;
  children?: ReactNode;
  accion?: ReactNode;
}) {
  return (
    <div className="gc-estado-pantalla gc-estado-pantalla--vacio">
      <span className="gc-estado-pantalla__icono" aria-hidden="true">
        {icono}
      </span>
      <h2>{titulo}</h2>
      {children && <p>{children}</p>}
      {accion}
    </div>
  );
}
