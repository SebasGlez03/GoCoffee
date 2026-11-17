import { Link, useParams } from 'react-router';
import { EstadoConsulta } from '../compartido/componentes/EstadoConsulta';
import { NoEncontrado } from '../compartido/componentes/NoEncontrado';
import { DETALLE_FRECUENCIA, NOMBRE_FRECUENCIA, bolsas, moneda } from '../compartido/formato';
import { useConsulta } from '../compartido/hooks/useConsulta';
import { FormularioSuscripcion } from './FormularioSuscripcion';
import { traerPlan } from './planes.servicio';
import './planes.css';

const PLAN_INEXISTENTE = (
  <NoEncontrado
    titulo="Ese plan no existe"
    mensaje="Puede que la dirección esté mal escrita o que el plan ya no se ofrezca."
    enlace={{ a: '/planes', texto: 'Ver los planes disponibles' }}
  />
);

/** /planes/:id — dirección propia para poder compartir el plan. */
export function PaginaDetallePlan() {
  const { id } = useParams();
  const idPlan = Number(id);
  if (!id || !/^\d+$/.test(id) || idPlan <= 0) return PLAN_INEXISTENTE;
  return <DetallePlan key={idPlan} idPlan={idPlan} />;
}

function DetallePlan({ idPlan }: { idPlan: number }) {
  const plan = useConsulta(`plan-${idPlan}`, () => traerPlan(idPlan));

  return (
    <EstadoConsulta consulta={plan} textoCarga="Cargando el plan…" noEncontrado={PLAN_INEXISTENTE}>
      {(datos) => (
        <div className="gc-pagina">
          <Link className="gc-volver" to="/planes">
            ← Todos los planes
          </Link>
          <div className="gc-detalle-plan">
            <section className="gc-tarjeta gc-detalle-plan__info" aria-labelledby="nombre-plan">
              <span className="gc-pagina__etiqueta">Plan {NOMBRE_FRECUENCIA[datos.frecuenciaEntrega].toLowerCase()}</span>
              <h1 id="nombre-plan">{datos.nombre}</h1>
              <p className="gc-detalle-plan__precio">
                <strong>{moneda(datos.precio)}</strong> por entrega
              </p>
              <dl className="gc-datos">
                <div>
                  <dt>Contenido</dt>
                  <dd>{bolsas(datos.cantidadBolsas)}</dd>
                </div>
                <div>
                  <dt>Frecuencia</dt>
                  <dd>{DETALLE_FRECUENCIA[datos.frecuenciaEntrega]}</dd>
                </div>
                <div>
                  <dt>Envío</dt>
                  <dd>Incluido</dd>
                </div>
                <div>
                  <dt>Cobro</dt>
                  <dd>Solo por los ciclos que recibes</dd>
                </div>
              </dl>
              <ul className="gc-lista-check">
                <li>Pausa tu suscripción cuando salgas de viaje.</li>
                <li>Salta una entrega puntual sin que se te cobre.</li>
                <li>Cambia de plan desde el ciclo que elijas.</li>
                <li>Cancela cuando quieras; respetamos lo que ya pagaste.</li>
              </ul>
            </section>

            {datos.estado === 'ACTUAL' && datos.idPlan ? (
              <FormularioSuscripcion plan={{ ...datos, idPlan: datos.idPlan }} />
            ) : (
              <section className="gc-tarjeta">
                <h2>Este plan ya no acepta nuevas suscripciones</h2>
                <p className="gc-texto-suave">
                  Si ya estás suscrito, tu plan sigue igual. Para suscribirte, elige uno de los planes vigentes.
                </p>
                <Link className="gc-boton" to="/planes">
                  Ver planes vigentes
                </Link>
              </section>
            )}
          </div>
        </div>
      )}
    </EstadoConsulta>
  );
}
