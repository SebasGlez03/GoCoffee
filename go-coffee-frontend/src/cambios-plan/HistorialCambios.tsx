import type { ReactNode } from 'react';
import { Etiqueta } from '../compartido/componentes/Etiqueta';
import { fecha, moneda } from '../compartido/formato';
import { estadoSolicitud } from './reglasCambio';
import type { SolicitudCambioPlan } from '../compartido/tipos';

/** Lista de solicitudes de cambio de plan (cliente y administrador). */
export function HistorialCambios({
  solicitudes,
  acciones,
  detalleCliente = false,
}: {
  solicitudes: SolicitudCambioPlan[];
  acciones?: (s: SolicitudCambioPlan) => ReactNode;
  detalleCliente?: boolean;
}) {
  return (
    <ul className="gc-historial">
      {solicitudes.map((s) => {
        const estado = estadoSolicitud(s);
        return (
          <li key={s.idSolicitud} className="gc-historial__elemento">
            <div className="gc-historial__principal">
              <p className="gc-historial__titulo">
                {s.nombreAnterior ?? s.planAnterior.nombre} → <strong>{s.nombreNuevo ?? s.planNuevo.nombre}</strong>
              </p>
              <p className="gc-texto-suave">
                {s.precioNuevo !== null && <>Nuevo precio {moneda(s.precioNuevo)} por entrega · </>}
                Desde el ciclo #{s.numCicloAplicacion} ({fecha(s.fechaNuevoCiclo)}) · Solicitado el{' '}
                {fecha(s.fechaSolicitud)}
              </p>
              {detalleCliente && (
                <p className="gc-texto-suave">
                  {s.suscripcion.usuario?.email ?? 'Cliente sin cuenta'} · Suscripción #{s.idSuscripcion}
                </p>
              )}
            </div>
            <div className="gc-historial__lateral">
              <Etiqueta tono={estado.tono}>{estado.texto}</Etiqueta>
              {acciones?.(s)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
