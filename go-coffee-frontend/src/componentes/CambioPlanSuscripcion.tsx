import { useState } from 'react';
import { useCambiosPlan } from '../hooks/UseCambiosPlan';
import { HistorialCambiosPlan } from './HistorialCambiosPlan';
import { Cargando } from './Cargando';
import { useSesion } from '../sesion/SesionContext';
import type { Suscripcion } from '../tipos/tipos';

const moneda = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});
const fecha = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'long',
  timeZone: 'UTC',
});
const frecuencia = {
  SEMANAL: 'cada 7 días',
  QUINCENAL: 'cada 15 días',
  MENSUAL: 'cada 31 días',
};

export function CambioPlanSuscripcion({
  suscripcion,
}: {
  suscripcion: Suscripcion;
}) {
  const { usuario } = useSesion();
  const {
    historial,
    opciones,
    cargando,
    error,
    mensaje,
    guardando,
    actualizar,
    solicitar,
    resolver,
  } = useCambiosPlan(suscripcion.id);
  const [elegido, setElegido] = useState('');
  const [cicloElegido, setCicloElegido] = useState('');
  const plan = opciones?.planes.find((p) => p.planId === Number(elegido));
  const pendiente = historial.some(
    (s) =>
      s.estadoSolicitud === 'PENDIENTE' ||
      (s.estadoSolicitud === 'ACEPTADA' && !s.fechaAplicacion),
  );
  return (
    <section className="gc-cambios" aria-label="Cambio de plan">
      <h2>Cambiar de plan</h2>
      {cargando && <Cargando />}
      {error && <p role="alert">{error}</p>}
      {mensaje && <p role="status">{mensaje}</p>}
      {!cargando && (
        <>
          {['ACTIVA', 'PAUSADA'].includes(suscripcion.estadoSuscripcion) &&
            !pendiente &&
            opciones && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (plan && cicloElegido)
                    void solicitar(
                      plan.planId,
                      plan.precio,
                      Number(cicloElegido),
                    );
                }}
              >
                <label htmlFor="nuevo-plan">Nuevo plan</label>
                <select
                  id="nuevo-plan"
                  required
                  value={elegido}
                  disabled={guardando}
                  onChange={(e) => setElegido(e.target.value)}
                >
                  <option value="">Selecciona un plan</option>
                  {opciones.planes.map((p) => (
                    <option key={p.planId} value={p.planId}>
                      {p.nombre} · {moneda.format(p.precio)}
                    </option>
                  ))}
                </select>
                <label htmlFor="ciclo-aplicacion">Aplicar desde el ciclo</label>
                <select
                  id="ciclo-aplicacion"
                  required
                  value={cicloElegido}
                  disabled={guardando}
                  onChange={(e) => setCicloElegido(e.target.value)}
                >
                  <option value="">Selecciona un ciclo</option>
                  {opciones.ciclosAplicacion.map((ciclo) => (
                    <option key={ciclo.numCiclo} value={ciclo.numCiclo}>
                      Ciclo #{ciclo.numCiclo} ·{' '}
                      {fecha.format(new Date(ciclo.fecha))}
                    </option>
                  ))}
                </select>
                {opciones.planes.length === 0 && (
                  <p>No hay otros planes disponibles.</p>
                )}
                {plan && cicloElegido && (
                  <p>
                    {plan.cantidadBolsas} bolsas ·{' '}
                    {frecuencia[plan.frecuenciaEntrega]} ·{' '}
                    <strong>{moneda.format(plan.precio)} por ciclo</strong>.
                    <br />
                    Sujeto a aprobación del administrador; la fecha puede
                    ajustarse si pausas la suscripción.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={!plan || !cicloElegido || guardando}
                >
                  {guardando ? 'Enviando…' : 'Solicitar cambio de plan'}
                </button>
              </form>
            )}
          {pendiente && (
            <p>Ya tienes un cambio pendiente o aprobado por aplicar.</p>
          )}
          <HistorialCambiosPlan
            historial={historial}
            guardando={guardando}
            resolver={usuario?.rol === 'ADMINISTRADOR' ? resolver : undefined}
          />
        </>
      )}
      <button
        type="button"
        disabled={cargando || guardando}
        onClick={actualizar}
      >
        Actualizar solicitudes y opciones
      </button>
    </section>
  );
}
