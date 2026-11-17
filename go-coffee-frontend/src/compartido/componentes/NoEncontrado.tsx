import { Link } from 'react-router';

/** Pantalla para direcciones que no corresponden a nada. */
export function NoEncontrado({
  titulo = 'Esta página no existe',
  mensaje = 'Revisa la dirección o vuelve al catálogo de planes.',
  enlace = { a: '/planes', texto: 'Ver los planes' },
  codigo = '404',
}: {
  titulo?: string;
  mensaje?: string;
  enlace?: { a: string; texto: string };
  /** Lo que se muestra en grande (404, o un candado para secciones restringidas). */
  codigo?: string;
}) {
  return (
    <section className="gc-pagina">
      <div className="gc-estado-pantalla gc-estado-pantalla--404">
        <span className="gc-estado-pantalla__codigo" aria-hidden="true">
          {codigo}
        </span>
        <h1>{titulo}</h1>
        <p>{mensaje}</p>
        <Link className="gc-boton" to={enlace.a}>
          {enlace.texto}
        </Link>
      </div>
    </section>
  );
}
