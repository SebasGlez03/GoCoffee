import '../assets/css/PlanCard.css';

export interface Plan {
  idPlan: string;
  nombre: string;
  cantidadBolsas: number;
  tipoMolienda: string;
  precio: number;
}

export interface PlanCardProps {
  plan: Plan;
  destacado?: boolean;
  onSeleccionar?: (plan: Plan) => void;
}

export function PlanCard({plan, destacado = false, onSeleccionar,}: PlanCardProps) {
  return (
    <article className={`gc-plan-card ${destacado ? "is-featured" : ""}`}>
      {destacado && <span className="gc-plan-badge">Más popular</span>}

      {/* Cabecera: Nombre y Precio */}
      <header className="gc-plan-header">
        <h3 className="gc-plan-title">{plan.nombre}</h3>
        <div className="gc-plan-price-box">
          <span className="gc-plan-currency">$</span>
          <span className="gc-plan-price">{plan.precio.toFixed(2)}</span>
          <span className="gc-plan-period">/ ciclo</span>
        </div>
      </header>

      {/* Detalles principales del Plan */}
      <ul className="gc-plan-features">
        <li>
          <span className="gc-feature-icon">☕</span>
          <span>
            <strong>{plan.cantidadBolsas}</strong>{" "}
            {plan.cantidadBolsas === 1 ? "bolsa de café" : "bolsas de café"} por
            entrega
          </span>
        </li>
        <li>
          <span className="gc-feature-icon">⚙️</span>
          <span>
            Molienda: <strong>{plan.tipoMolienda}</strong>
          </span>
        </li>
        <li>
          <span className="gc-feature-icon">📦</span>
          <span>Entrega recurrente programada</span>
        </li>
      </ul>

      {/* Acción */}
      <footer className="gc-plan-footer">
        <button
          type="button"
          className={destacado ? "gc-plan-btn-primary" : "gc-plan-btn-outline"}
          onClick={() => onSeleccionar?.(plan)}
        >
          Elegir este plan
        </button>
      </footer>
    </article>
  );
}
