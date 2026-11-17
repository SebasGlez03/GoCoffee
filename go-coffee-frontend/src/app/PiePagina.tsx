import { Link } from 'react-router';

export function PiePagina() {
  return (
    <footer className="gc-pie">
      <div className="gc-pie__contenedor">
        <p className="gc-pie__marca">☕ GO_COFFEE</p>
        <p>Café de especialidad en grano y molido, por suscripción.</p>
        <nav className="gc-pie__enlaces" aria-label="Pie de página">
          <Link to="/planes">Planes</Link>
          <Link to="/suscripciones">Mis suscripciones</Link>
          <Link to="/cobros">Cobros</Link>
        </nav>
        <p className="gc-pie__legal">GoCoffee · Equipo 6 · ITSON · Tópico de Aplicaciones Web</p>
      </div>
    </footer>
  );
}
