import '../assets/css/Encabezado.css';

export function Encabezado() {
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
          <a href="#planes" className="gc-nav-link active">Planes</a>
          <a href="#suscripcion" className="gc-nav-link">Mi Suscripción</a>
          <a href="#entregas" className="gc-nav-link">Próximas Entregas</a>
          <a href="#cobros" className="gc-nav-link">Cobros</a>
        </nav>

        {/* Botones de acción */}
        <div className="gc-actions">
          <button type="button" className="gc-btn-outline">
            Iniciar Sesión
          </button>
          <button type="button" className="gc-btn-primary">
            Suscribirme
          </button>
        </div>
      </div>
    </header>
  );
}