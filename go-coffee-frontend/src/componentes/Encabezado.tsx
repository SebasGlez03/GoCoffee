import '../assets/css/Encabezado.css';
import {NavLink, Link} from "react-router";

export function Encabezado() {
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
          <NavLink to="/suscripcion" className={selectorClaseActiva}>Suscripcion</NavLink>
          <NavLink to="/entregas" className={selectorClaseActiva}>Próximas Entregas</NavLink>
          <NavLink to="/cobros" className={selectorClaseActiva}>Cobros</NavLink>
        </nav>

        {/* Botones de acción */}
        <div className="gc-actions">
          <Link to="/entrar">
            <button type="button" className="gc-btn-primary">
              Iniciar Sesion
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}