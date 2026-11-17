import { Navigate } from 'react-router';
import { useSesion } from '../sesion/SesionContext';
import { useCambiosPlan } from '../hooks/UseCambiosPlan';
import { HistorialCambiosPlan } from '../componentes/HistorialCambiosPlan';
import { Cargando } from '../componentes/Cargando';

export function PaginaCambiosPlan() {
  const { usuario } = useSesion();
  return usuario?.rol === 'ADMINISTRADOR' ? <AdministrarCambios /> : <Navigate to="/suscripciones" replace />;
}
function AdministrarCambios() {
  const { historial, cargando, error, mensaje, guardando, actualizar, resolver } = useCambiosPlan();
  return <section className="gc-cambios gc-cambios--pagina">
    <h1>Solicitudes de cambio de plan</h1>
    <p>Revisa el plan, precio y ciclo propuestos antes de aprobar.</p>
    {cargando && <Cargando />}
    {error && <p role="alert">{error}</p>}
    {mensaje && <p role="status">{mensaje}</p>}
    {!cargando && <HistorialCambiosPlan historial={historial} guardando={guardando} resolver={resolver} />}
    <button type="button" disabled={guardando || cargando} onClick={actualizar}>Actualizar solicitudes</button>
  </section>;
}
