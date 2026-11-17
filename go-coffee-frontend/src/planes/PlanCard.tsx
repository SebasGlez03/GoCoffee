import { Link } from 'react-router';
import { DETALLE_FRECUENCIA, NOMBRE_FRECUENCIA, bolsas, moneda } from '../compartido/formato';
import type { Plan } from '../compartido/tipos';

export function PlanCard({ plan }: { plan: Plan }) {
  return (
    <article className="gc-plan">
      <header className="gc-plan__encabezado">
        <span className="gc-plan__frecuencia">{NOMBRE_FRECUENCIA[plan.frecuenciaEntrega]}</span>
        <h2 className="gc-plan__nombre">{plan.nombre}</h2>
        <p className="gc-plan__precio">
          <strong>{moneda(plan.precio)}</strong> <span>por entrega</span>
        </p>
      </header>
      <ul className="gc-plan__caracteristicas">
        <li>
          <span aria-hidden="true">☕</span> {bolsas(plan.cantidadBolsas)} por entrega
        </li>
        <li>
          <span aria-hidden="true">📦</span> {DETALLE_FRECUENCIA[plan.frecuenciaEntrega]}
        </li>
        <li>
          <span aria-hidden="true">⏸️</span> Pausa, salta o cancela cuando quieras
        </li>
      </ul>
      <Link className="gc-boton gc-boton--bloque" to={`/planes/${plan.idPlan}`}>
        Ver plan y suscribirme
      </Link>
    </article>
  );
}
