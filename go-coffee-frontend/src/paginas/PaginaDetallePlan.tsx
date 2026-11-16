import React, { useState } from 'react';
import type { Plan } from '../componentes/PlanCard';

interface PaginaDetallePlanProps {
  planSeleccionado?: Plan; // Recibe el plan elegido desde el catálogo
  onRegresar: () => void; // Función para volver al catálogo
}

export function PaginaDetallePlan ({planSeleccionado, onRegresar}: PaginaDetallePlanProps) {
    // Estado para la configuración de la suscripción
  const [diaEntrega, setDiaEntrega] = useState<string>('LUNES');
  const [direccionEnvio, setDireccionEnvio] = useState<string>('');
  const [suscripcionExitosa, setSuscripcionExitosa] = useState<boolean>(false);

  // Plan de respaldo si se entra directo a la ruta sin seleccionar uno antes
  const planActual = planSeleccionado || {
    idPlan: 'PLN-02',
    nombre: 'Plan Barista en Casa',
    cantidadBolsas: 2,
    tipoMolienda: 'GRANO_ENTERO',
    precio: 459.0,
    remplazadoPorId: null,
  };

  const handlerContratar = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí conectarías con tu endpoint del backend mediante fetch/axios
    console.log('Contratando plan:', {
      planId: planActual.idPlan,
      diaEntrega,
      direccionEnvio,
    });
    setSuscripcionExitosa(true);
  };

  return (
    <>
<div className="gc-detalle-container">
        {/* Botón de retorno */}
        <button type="button" className="gc-btn-regresar" onClick={onRegresar}>
          ← Volver al catálogo de planes
        </button>

        {suscripcionExitosa ? (
          <div className="gc-success-card">
            <span className="gc-success-icon">🎉</span>
            <h2>¡Suscripción exitosa!</h2>
            <p>
              Tu <strong>{planActual.nombre}</strong> ha sido activado correctamente. 
              Te enviaremos tu café fresco cada ciclo.
            </p>
            <button
              type="button"
              className="gc-btn-primary"
              onClick={onRegresar}
            >
              Ver mis suscripciones
            </button>
          </div>
        ) : (
          <div className="gc-detalle-grid">
            {/* Columna Izquierda: Resumen del Plan */}
            <div className="gc-detalle-info">
              <span className="gc-detalle-eyebrow">Configura tu entrega</span>
              <h1 className="gc-detalle-title">{planActual.nombre}</h1>
              
              <div className="gc-detalle-price-box">
                <span className="gc-detalle-price">${planActual.precio.toFixed(2)}</span>
                <span className="gc-detalle-period">/ ciclo recurrente</span>
              </div>

              <ul className="gc-detalle-specs">
                <li>
                  <span>☕ Cantidad:</span>
                  <strong>{planActual.cantidadBolsas} {planActual.cantidadBolsas === 1 ? 'bolsa' : 'bolsas'} por entrega</strong>
                </li>
                <li>
                  <span>⚙️ Tipo de molienda:</span>
                  <strong>{planActual.tipoMolienda.replace(/_/g, ' ')}</strong>
                </li>
                <li>
                  <span>📦 Envío:</span>
                  <strong>Incluido a todo México</strong>
                </li>
              </ul>
            </div>

            {/* Columna Derecha: Formulario de Contratación */}
            <form className="gc-detalle-form" onSubmit={handlerContratar}>
              <h2>Detalles de Entrega</h2>
              
              <div className="gc-form-group">
                <label htmlFor="direccion">Dirección de envío:</label>
                <input
                  id="direccion"
                  type="text"
                  required
                  placeholder="Calle, número, colonia, C.P."
                  value={direccionEnvio}
                  onChange={(e) => setDireccionEnvio(e.target.value)}
                />
              </div>

              <div className="gc-form-group">
                <label htmlFor="dia">Día preferido de entrega:</label>
                <select
                  id="dia"
                  value={diaEntrega}
                  onChange={(e) => setDiaEntrega(e.target.value)}
                >
                  <option value="LUNES">Lunes</option>
                  <option value="MIERCOLES">Miércoles</option>
                  <option value="VIERNES">Viernes</option>
                </select>
              </div>

              <div className="gc-form-summary">
                <p>Podrás pausar, cambiar de plan o cancelar tus entregas desde tu portal en cualquier momento[cite: 1, 2].</p>
              </div>

              <button type="submit" className="gc-btn-primary gc-btn-block">
                Confirmar y Suscribirme
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}