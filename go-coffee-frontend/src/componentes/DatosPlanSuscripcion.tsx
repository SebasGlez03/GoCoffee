import type { Suscripcion } from '../tipos/tipos';
import '../assets/css/DatosPlanSuscripcion.css';

const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const frecuencias = { SEMANAL: 'Cada 7 días', QUINCENAL: 'Cada 15 días', MENSUAL: 'Cada 31 días' };

export function DatosPlanSuscripcion({ plan }: { plan: Suscripcion['plan'] }) {
  return (
    <section className="gc-plan-suscripcion" aria-label="Datos del plan contratado">
      <h3>{plan?.nombre ?? 'Plan no disponible'}</h3>
      {plan ? (
        <dl>
          <div><dt>Contenido por entrega</dt><dd>{plan.cantidadBolsas} {plan.cantidadBolsas === 1 ? 'bolsa de café' : 'bolsas de café'}</dd></div>
          <div><dt>Precio por ciclo</dt><dd>{moneda.format(plan.precio)}</dd></div>
          <div><dt>Frecuencia</dt><dd>{frecuencias[plan.frecuenciaEntrega]}</dd></div>
        </dl>
      ) : <p>No se pudieron consultar los datos del plan.</p>}
    </section>
  );
}
