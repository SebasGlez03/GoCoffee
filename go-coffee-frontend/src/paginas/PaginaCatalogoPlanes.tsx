import { useState } from "react";
import type { Plan } from "../componentes/PlanCard";
import {PlanCard} from "../componentes/PlanCard";
import '../assets/css/PaginaCatalogoPlanes.css';

const PLANES_MOCK: Plan[] = [
  {
    idPlan: "PLN-01",
    nombre: "Plan Degustación",
    cantidadBolsas: 1,
    tipoMolienda: "MOLIDO_MEDIO",
    precio: 249.0,
  },
  {
    idPlan: "PLN-02",
    nombre: "Plan Barista en Casa",
    cantidadBolsas: 2,
    tipoMolienda: "GRANO_ENTERO",
    precio: 459.0,
  },
  {
    idPlan: "PLN-03",
    nombre: "Plan Espresso Intenso",
    cantidadBolsas: 2,
    tipoMolienda: "MOLIDO_FINO",
    precio: 479.0,
  },
  {
    idPlan: "PLN-04",
    nombre: "Plan Oficina & Familia",
    cantidadBolsas: 4,
    tipoMolienda: "MOLIDO_GRUESO",
    precio: 849.0,
  },
  {
    idPlan: "PLN-00",
    nombre: "Plan Antiguo (Retirado)",
    cantidadBolsas: 1,
    tipoMolienda: "GRANO_ENTERO",
    precio: 199.0,
  },
];

export function PaginaCatalogoPlanes() {
  const [planSeleccionado, setPlanSeleccionado] = useState<Plan | null>(null);

  const handleSeleccionarPlan = (plan: Plan) => {
    setPlanSeleccionado(plan);
    console.log("Plan elegido para suscripción:", plan);
  };

  return (
    <>
      <section className="gc-catalogo-page">
          {/* Encabezado de la vista */}
          <header className="gc-catalogo-header">
            <span className="gc-catalogo-eyebrow">Suscripciones GO_COFFEE</span>
            <h1 className="gc-catalogo-title">Elige tu plan de café ideal</h1>
            <p className="gc-catalogo-subtitle">
              Recibe café recién tostado en la puerta de tu casa cada ciclo. Pausa,
              salta entregas o cambia de plan cuando lo necesites.
            </p>
          </header>

          {/* Aviso temporal de prueba al dar clic en un plan */}
          {planSeleccionado && (
            <div className="gc-catalogo-banner" role="status">
              <span>
                Seleccionaste <strong>{planSeleccionado.nombre}</strong> ($
                {planSeleccionado.precio.toFixed(2)} / ciclo). Listo para configurar
                dirección y día de entrega.
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
          {PLANES_MOCK.length > 0 ? (
            <div className="gc-catalogo-grid">
              {PLANES_MOCK.map((plan) => (
                <PlanCard
                  key={plan.idPlan}
                  plan={plan}
                  destacado={plan.idPlan === "PLN-02"}
                  onSeleccionar={handleSeleccionarPlan}
                />
              ))}
            </div>
          ) : (
            <div className="gc-catalogo-empty">
              <p>No hay planes vigentes disponibles con ese tipo de molienda.</p>
              <button
                type="button"
                className="gc-btn-reset"
                onClick={() => console.log("JAJJAJAJ")}
              >
                Ver todos los planes
              </button>
            </div>
          )}
        </section>;
    </>
  );
}
