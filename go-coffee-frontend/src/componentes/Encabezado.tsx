import '../assets/css/Encabezado.css';
import {NavLink, Link} from "react-router";
import { useSesion } from '../sesion/SesionContext.tsx';

export function Encabezado() {
  const { usuario, salir } = useSesion();

  function selectorClaseActiva({isActive} : {isActive: boolean}){
    return isActive ? 'gc-nav-link active' : 'gc-nav-link';
  }

    return (
    <header className="gc-header">
      <div className="gc-header-container">
        {/* Marca / Logo */}
        <Link className='gc-link-logo' to="/planes">
          <span className="gc-logo-icon">☕</span>
          <span className="gc-logo-text">GO_COFFEE</span>
        </Link>

        {/* Enlaces de navegación estáticos */}
        <nav className="gc-nav">
          <NavLink to="/planes" className={selectorClaseActiva}>Planes</NavLink>
          <NavLink to="/suscripciones" className={selectorClaseActiva}>Suscripciones</NavLink>
          <NavLink to="/entregas" className={selectorClaseActiva}>Próximas Entregas</NavLink>
          <NavLink to="/cobros" className={selectorClaseActiva}>Cobros</NavLink>
        </nav>

        {/* Botones de acción */}
        {usuario ? (
            <>
              <span className="barra__usuario">Hola, {usuario.email}</span>

              <button className="gc-btn-primary" onClick={salir}>Salir</button>
            </>
          ) : (
            <Link to="/entrar">
              <button className="gc-btn-primary">Iniciar Sesion</button>
              </Link>
          )}
      </div>
    </header>
  );
}