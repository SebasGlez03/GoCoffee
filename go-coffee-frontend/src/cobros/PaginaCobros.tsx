import { Link, useLocation } from 'react-router';
import { EncabezadoPagina } from '../compartido/componentes/EncabezadoPagina';
import { Etiqueta } from '../compartido/componentes/Etiqueta';
import { EstadoConsulta } from '../compartido/componentes/EstadoConsulta';
import { EstadoVacio } from '../compartido/componentes/EstadoVacio';
import { Aviso } from '../compartido/componentes/Aviso';
import { NOMBRE_ESTADO_COBRO, TONO_COBRO, fechaCorta, moneda } from '../compartido/formato';
import { useConsulta } from '../compartido/hooks/useConsulta';
import type { Cobro } from '../compartido/tipos';
import { destinoSeguro } from '../sesion/destino';
import { traerHistorialCobros } from './cobros.servicio';
import { FormularioMetodoPago } from './FormularioMetodoPago';
import './cobros.css';

export function PaginaCobros() {
  const historial = useConsulta('historial-cobros', traerHistorialCobros);
  const desde = (useLocation().state as { desde?: unknown } | null)?.desde;
  const regreso = desde ? destinoSeguro(desde, '') : '';

  return (
    <div className="gc-pagina">
      <EncabezadoPagina etiqueta="Pagos" titulo="Cobros y método de pago">
        Consulta lo que se te ha cobrado en cada ciclo y mantén al día tu método de pago.
      </EncabezadoPagina>

      {regreso && (
        <Aviso tono="info">
          Cuando termines, <Link to={regreso}>regresa a donde estabas</Link>.
        </Aviso>
      )}

      <div className="gc-cobros">
        <FormularioMetodoPago />

        <section className="gc-tarjeta" aria-labelledby="titulo-historial">
          <h2 id="titulo-historial">Historial de cobros</h2>
          <EstadoConsulta
            consulta={historial}
            textoCarga="Cargando tus cobros…"
            estaVacio={(lista) => lista.length === 0}
            vacio={
              <EstadoVacio icono="🧾" titulo="Aún no tienes cobros">
                Cada vez que se procese el pago de un ciclo aparecerá aquí, con su fecha, monto y estado.
              </EstadoVacio>
            }
          >
            {(lista) => <TablaCobros cobros={lista} />}
          </EstadoConsulta>
        </section>
      </div>
    </div>
  );
}

function TablaCobros({ cobros }: { cobros: Cobro[] }) {
  const hayFallidos = cobros.some((c) => c.estadoCobro === 'FALLIDO');
  return (
    <>
      {hayFallidos && (
        <Aviso tono="advertencia">
          Tienes un cobro fallido. Para reintentarlo, revisa o actualiza tu método de pago; el equipo de
          GoCoffee volverá a intentar el cargo y tu suscripción se reactivará en cuanto quede pagado.
        </Aviso>
      )}
      <div className="gc-tabla__contenedor">
        <table className="gc-tabla">
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              <th scope="col">Concepto</th>
              <th scope="col">Monto</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {cobros.map((cobro) => (
              <tr key={cobro.idCobro}>
                <td data-etiqueta="Fecha">{fechaCorta(cobro.fechaCobro)}</td>
                <td data-etiqueta="Concepto">
                  {cobro.ciclo ? (
                    <>
                      Ciclo #{cobro.ciclo.numCiclo}
                      {cobro.ciclo.suscripcion && (
                        <>
                          {' '}
                          de la{' '}
                          <Link to={`/suscripciones/${cobro.ciclo.suscripcion.idSuscripcion}`}>
                            suscripción #{cobro.ciclo.suscripcion.idSuscripcion}
                          </Link>
                        </>
                      )}
                    </>
                  ) : (
                    'Cobro de suscripción'
                  )}
                  {cobro.referencia && <span className="gc-texto-suave"> · Ref. {cobro.referencia}</span>}
                </td>
                <td data-etiqueta="Monto">{cobro.monto === null ? '—' : moneda(cobro.monto)}</td>
                <td data-etiqueta="Estado">
                  <Etiqueta tono={TONO_COBRO[cobro.estadoCobro]}>{NOMBRE_ESTADO_COBRO[cobro.estadoCobro]}</Etiqueta>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
