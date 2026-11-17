import { Outlet, useLocation } from 'react-router';
import { Aviso } from '../compartido/componentes/Aviso';
import { useSesion } from '../sesion/SesionContext';
import { Encabezado } from './Encabezado';
import { PiePagina } from './PiePagina';

/** Estructura común: encabezado, contenido de la ruta y pie. */
export function Layout() {
  const { aviso, descartarAviso } = useSesion();
  const { pathname } = useLocation();
  // En /entrar el aviso se muestra dentro del formulario.
  const mostrarAviso = aviso && pathname !== '/entrar';

  return (
    <div className="gc-disposicion">
      <a className="gc-saltar" href="#contenido">
        Saltar al contenido
      </a>
      <Encabezado />
      <main className="gc-disposicion__contenido" id="contenido">
        {mostrarAviso && (
          <div className="gc-pagina gc-pagina--aviso">
            <Aviso tono="advertencia" onCerrar={descartarAviso}>
              {aviso}
            </Aviso>
          </div>
        )}
        <Outlet />
      </main>
      <PiePagina />
    </div>
  );
}
