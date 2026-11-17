import { useState } from 'react';
import type { Plan } from '../componentes/PlanCard';
import { PlanCard } from '../componentes/PlanCard';
import '../assets/css/PaginaCatalogoPlanes.css';
import { Link } from 'react-router';
import { Cargando } from '../componentes/Cargando';
import { MensajeError } from '../componentes/MensajeError';
import { usePlanes } from '../hooks/usePlanes';

export function PaginaCatalogoPlanes() {
  const [planSeleccionado, setPlanSeleccionado] = useState<Plan | null>(null);
  const { planes, cargando, error, reintentar } = usePlanes();

  const handleSeleccionarPlan = (plan: Plan) => {
    setPlanSeleccionado(plan);
    console.log('Plan elegido para suscripción:', plan);
  };

  return (
    <>
      <section className="gc-catalogo-page">
        {/* Encabezado de la vista */}
        <header className="gc-catalogo-header">
          {!error && !cargando && (
            <>
              <span className="gc-catalogo-eyebrow">
                Suscripciones GO_COFFEE
              </span>
              <h1 className="gc-catalogo-title">Elige tu plan de café ideal</h1>
              <p className="gc-catalogo-subtitle">
                Recibe café recién tostado en la puerta de tu casa cada ciclo.
                Pausa, salta entregas o cambia de plan cuando lo necesites.
              </p>
            </>
          )}
        </header>

        {cargando && <Cargando />}
        {error && <MensajeError mensaje={error} onReintentar={reintentar} />}

        {/* Aviso temporal de prueba al dar clic en un plan */}
        {planSeleccionado && (
          <div className="gc-catalogo-banner" role="status">
            <span>
              Seleccionaste <strong>{planSeleccionado.nombre}</strong> ($
              {planSeleccionado.precio.toFixed(2)} / ciclo). Listo para
              configurar dirección y día de entrega.
            </span>
            <button
              type="button"
              className="gc-banner-close"
              onClick={() => setPlanSeleccionado(null)}
              aria-label="Cerrar aviso"
            >
              ✕
            </button>
          </div>
        )}

        {/* Grid de tarjetas de planes */}
        {planes.length > 0 && (
          <div className="gc-catalogo-grid">
            {planes.map((plan) => (
              <Link
                className="gc-link-router"
                key={plan.idPlan}
                to={`/planes/${plan.idPlan}`}
              >
                <PlanCard
                  key={plan.idPlan}
                  plan={plan}
                  onSeleccionar={handleSeleccionarPlan}
                />
              </Link>
            ))}
          </div>
        )}
      </section>
      ;
    </>
  );
}
