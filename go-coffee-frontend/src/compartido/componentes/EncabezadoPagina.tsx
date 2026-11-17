import type { ReactNode } from 'react';

export function EncabezadoPagina({
  etiqueta,
  titulo,
  children,
  acciones,
}: {
  etiqueta?: string;
  titulo: string;
  children?: ReactNode;
  acciones?: ReactNode;
}) {
  return (
    <header className="gc-pagina__encabezado">
      <div>
        {etiqueta && <span className="gc-pagina__etiqueta">{etiqueta}</span>}
        <h1>{titulo}</h1>
        {children && <p className="gc-pagina__bajada">{children}</p>}
      </div>
      {acciones && <div className="gc-pagina__acciones">{acciones}</div>}
    </header>
  );
}
