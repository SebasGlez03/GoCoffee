import { Link } from 'react-router';
import type { SolicitudCambioPlan } from '../tipos/tipos';
import '../assets/css/CambiosPlan.css';

const fecha = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeZone: 'UTC' });
const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export function HistorialCambiosPlan({ historial, guardando, resolver }: {
  historial: SolicitudCambioPlan[]; guardando: boolean;
  resolver?: (id: number, aceptar: boolean) => Promise<void>;
}) {
  return (
    <div className="gc-cambios__historial">
      <h3>Historial de cambios de plan</h3>
      {historial.length === 0 && <p>No hay solicitudes de cambio.</p>}
      {historial.map((s) => <article key={s.idSolicitud}>
        <h4>{s.nombreAnterior ?? s.planAnterior.nombre} → {s.nombreNuevo ?? s.planNuevo.nombre}</h4>
        <p>Solicitud #{s.idSolicitud} · {fecha.format(new Date(s.fechaSolicitud))}</p>
        <p>{s.precioAnterior === null ? 'Precio anterior no registrado' : moneda.format(s.precioAnterior)} → {s.precioNuevo === null ? 'Precio nuevo no registrado' : `${moneda.format(s.precioNuevo)} por ciclo`}</p>
        <p>Desde el ciclo <strong>#{s.numCicloAplicacion}</strong> · {s.fechaAplicacion ? 'Fecha de entrega' : 'Fecha prevista'}: {fecha.format(new Date(s.fechaNuevoCiclo))}</p>
        <p>Estado: <strong>{s.fechaAplicacion ? 'Aplicado' : s.estadoSolicitud === 'ACEPTADA' ? 'Aprobado, por aplicar' : s.estadoSolicitud === 'RECHAZADA' ? 'Rechazado' : 'Pendiente de aprobación'}</strong></p>
        {resolver && <>
          <p>{s.suscripcion.usuario?.email ?? `Cliente ${s.suscripcion.usuarioId ?? 'sin asignar'}`} · <Link to={`/suscripciones/${s.idSuscripcion}`}>Suscripción #{s.idSuscripcion}</Link></p>
          {s.estadoSolicitud === 'PENDIENTE' && <div className="gc-cambios__acciones">
            <button type="button" disabled={guardando} onClick={() => { if (window.confirm(`¿Aprobar el cambio desde el ciclo #${s.numCicloAplicacion}?`)) void resolver(s.idSolicitud, true); }}>Aprobar</button>
            <button type="button" disabled={guardando} onClick={() => { if (window.confirm('¿Rechazar esta solicitud?')) void resolver(s.idSolicitud, false); }}>Rechazar</button>
          </div>}
        </>}
      </article>)}
    </div>
  );
}
