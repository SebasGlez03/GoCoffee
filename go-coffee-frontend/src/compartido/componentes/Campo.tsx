import type { ReactNode } from 'react';

/** Etiqueta + control + mensaje de error junto al campo que lo provocó. */
export function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  children,
}: {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  children: ReactNode;
}) {
  return (
    <div className={`gc-campo${error ? ' gc-campo--error' : ''}`}>
      <label htmlFor={id}>{etiqueta}</label>
      {children}
      {error ? (
        <p className="gc-campo__error" id={`${id}-error`}>
          {error}
        </p>
      ) : (
        ayuda && (
          <p className="gc-campo__ayuda" id={`${id}-ayuda`}>
            {ayuda}
          </p>
        )
      )}
    </div>
  );
}
