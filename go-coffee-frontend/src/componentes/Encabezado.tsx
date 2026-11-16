import '../assets/css/Encabezado.css';
import {NavLink} from "react-router";

export function Encabezado() {
  function selectorClaseActiva({isActive} : {isActive: boolean}){
    return isActive ? 'gc-nav-link active' : 'gc-nav-link';
  }

    return (
    <header className="gc-header">
      <div className="gc-header-container">
        {/* Marca / Logo */}
        <a href="#inicio" className="gc-logo">
          <span className="gc-logo-icon">☕</span>
          <span className="gc-logo-text">GO_COFFEE</span>
        </a>

        {/* Enlaces de navegación estáticos */}
        <nav className="gc-nav">
          <NavLink to="/planes" className={selectorClaseActiva}>Planes</NavLink>
          <NavLink to="/suscripcion" className={selectorClaseActiva}>Suscripcion</NavLink>
          <NavLink to="/entregas" className={selectorClaseActiva}>Próximas Entregas</NavLink>
          <NavLink to="/cobros" className={selectorClaseActiva}>Cobros</NavLink>
        </nav>

        {/* Botones de acción */}
        <div className="gc-actions">
          <button type="button" className="gc-btn-primary">
            Iniciar Sesion
          </button>
        </div>
      </div>
    </header>
  );
}