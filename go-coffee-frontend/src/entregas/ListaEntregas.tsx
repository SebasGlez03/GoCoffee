import { Link } from 'react-router';
import { Etiqueta } from '../compartido/componentes/Etiqueta';
import {
  NOMBRE_ESTADO_COBRO,
  NOMBRE_ESTADO_ENTREGA,
  TONO_COBRO,
  TONO_ENTREGA,
  fechaLarga,
} from '../compartido/formato';
import type { Ciclo, Suscripcion } from '../compartido/tipos';
import { fechaDeCiclo, puedeSaltar } from './reglasEntrega';

export interface FilaEntrega {
  suscripcion: Suscripcion;
  ciclo: Ciclo;
}

/** Tabla de entregas (en teléfono se ve como tarjetas). */
export function ListaEntregas({
  filas,
  mostrarSuscripcion = true,
  enCurso,
  onSaltar,
}: {
  filas: FilaEntrega[];
  mostrarSuscripcion?: boolean;
  enCurso: string | null;
  onSaltar: (fila: FilaEntrega) => void;
}) {
  return (
    <div className="gc-tabla__contenedor">
      <table className="gc-tabla">
        <thead>
          <tr>
            <th scope="col">Fecha de entrega</th>
            {mostrarSuscripcion && <th scope="col">Plan</th>}
            <th scope="col">Ciclo</th>
            <th scope="col">Entrega</th>
            <th scope="col">Cobro</th>
            <th scope="col">
              <span className="gc-oculto">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => {
            const { suscripcion, ciclo } = fila;
            const clave = `saltar-${suscripcion.id}-${ciclo.numCiclo}`;
            return (
              <tr key={`${suscripcion.id}-${ciclo.numCiclo}`}>
                <td data-etiqueta="Fecha">
                  <time dateTime={fechaDeCiclo(ciclo)}>{fechaLarga(fechaDeCiclo(ciclo))}</time>
                </td>
                {mostrarSuscripcion && (
                  <td data-etiqueta="Plan">
                    <Link to={`/suscripciones/${suscripcion.id}`}>
                      {suscripcion.plan?.nombre ?? 'Plan'} · #{suscripcion.id}
                    </Link>
                  </td>
                )}
                <td data-etiqueta="Ciclo">#{ciclo.numCiclo}</td>
                <td data-etiqueta="Entrega">
                  {ciclo.entrega ? (
                    <Etiqueta tono={TONO_ENTREGA[ciclo.entrega.estadoEntrega]}>
                      {NOMBRE_ESTADO_ENTREGA[ciclo.entrega.estadoEntrega]}
                    </Etiqueta>
                  ) : (
                    <span className="gc-texto-suave">Sin entrega</span>
                  )}
                </td>
                <td data-etiqueta="Cobro">
                  {ciclo.cobro ? (
                    <Etiqueta tono={TONO_COBRO[ciclo.cobro.estado]}>{NOMBRE_ESTADO_COBRO[ciclo.cobro.estado]}</Etiqueta>
                  ) : (
                    <span className="gc-texto-suave">Pendiente</span>
                  )}
                </td>
                <td className="gc-tabla__acciones">
                  {puedeSaltar(suscripcion, ciclo) && (
                    <button
                      type="button"
                      className="gc-boton gc-boton--secundario gc-boton--chico"
                      disabled={enCurso !== null}
                      onClick={() => onSaltar(fila)}
                    >
                      {enCurso === clave ? 'Saltando…' : 'Saltar entrega'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
