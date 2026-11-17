export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div className="gc-estado-pantalla gc-estado-pantalla--cargando" role="status" aria-live="polite">
      <span className="gc-rueda" aria-hidden="true" />
      <p>{texto}</p>
    </div>
  );
}
