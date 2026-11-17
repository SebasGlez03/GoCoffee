import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { useSesion } from '../sesion/SesionContext';

function clase({ isActive }: { isActive: boolean }) {
  return isActive ? 'gc-nav__enlace gc-nav__enlace--activo' : 'gc-nav__enlace';
}

/** Encabezado común: se escribe una vez y lo usan todas las pantallas. */
export function Encabezado() {
  const { usuario, esAdministrador, salir } = useSesion();
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();
  const [rutaAnterior, setRutaAnterior] = useState(pathname);

  // Al navegar se cierra el menú del teléfono.
  if (rutaAnterior !== pathname) {
    setRutaAnterior(pathname);
    setAbierto(false);
  }

  return (
    <header className={`gc-header${abierto ? ' gc-header--abierto' : ''}`}>
      <div className="gc-header__contenedor">
        <Link className="gc-header__marca" to="/planes" aria-label="GoCoffee, ir al inicio">
          <span aria-hidden="true">☕</span> GO_COFFEE
        </Link>

        <button
          type="button"
          className="gc-header__menu"
          aria-expanded={abierto}
          aria-controls="gc-menu-principal"
          onClick={() => setAbierto((a) => !a)}
        >
          <span className="gc-header__menu-icono" aria-hidden="true" />
          <span className="gc-oculto">{abierto ? 'Cerrar menú' : 'Abrir menú'}</span>
        </button>

        <div className="gc-header__panel" id="gc-menu-principal">
          <nav className="gc-nav" aria-label="Principal">
            <NavLink to="/planes" className={clase}>
              Planes
            </NavLink>
            {usuario && (
              <>
                <NavLink to="/suscripciones" className={clase}>
                  Mis suscripciones
                </NavLink>
                <NavLink to="/entregas" className={clase}>
                  Entregas
                </NavLink>
                <NavLink to="/cobros" className={clase}>
                  Cobros
                </NavLink>
              </>
            )}
            {esAdministrador && (
              <NavLink to="/administracion" className={clase}>
                Administración
              </NavLink>
            )}
          </nav>

          <div className="gc-header__cuenta">
            {usuario ? (
              <>
                <span className="gc-header__usuario" title={usuario.email}>
                  {usuario.email}
                </span>
                <button type="button" className="gc-boton gc-boton--claro" onClick={salir}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link className="gc-nav__enlace" to="/registrar">
                  Crear cuenta
                </Link>
                <Link className="gc-boton" to="/entrar" state={{ desde: pathname }}>
                  Iniciar sesión
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
