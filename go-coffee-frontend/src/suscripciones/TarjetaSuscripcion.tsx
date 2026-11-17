import { Link } from 'react-router';
import { Etiqueta } from '../compartido/componentes/Etiqueta';
import {
  NOMBRE_DIA,
  NOMBRE_ESTADO_SUSCRIPCION,
  NOMBRE_FRECUENCIA,
  TONO_SUSCRIPCION,
  bolsas,
  fechaLarga,
  moneda,
} from '../compartido/formato';
import type { Suscripcion } from '../compartido/tipos';
import { proximaEntrega } from './reglasSuscripcion';

export function TarjetaSuscripcion({ suscripcion }: { suscripcion: Suscripcion }) {
  const { plan, direccionEntrega } = suscripcion;
  const proxima = proximaEntrega(suscripcion);
  const sinEntregas = {
    ACTIVA: 'Sin entregas programadas',
    PAUSADA: 'En pausa',
    SUSPENDIDA: 'Detenida hasta regularizar el pago',
    CANCELADA: 'Sin más entregas',
  }[suscripcion.estadoSuscripcion];

  return (
    <article className="gc-tarjeta gc-suscripcion">
      <header className="gc-suscripcion__encabezado">
        <div>
          <p className="gc-texto-suave">Suscripción #{suscripcion.id}</p>
          <h2>{plan?.nombre ?? 'Plan no disponible'}</h2>
        </div>
        <Etiqueta tono={TONO_SUSCRIPCION[suscripcion.estadoSuscripcion]}>
          {NOMBRE_ESTADO_SUSCRIPCION[suscripcion.estadoSuscripcion]}
        </Etiqueta>
      </header>

      {plan && (
        <p className="gc-suscripcion__plan">
          {bolsas(plan.cantidadBolsas)} · {NOMBRE_FRECUENCIA[plan.frecuenciaEntrega]} ·{' '}
          <strong>{moneda(plan.precio)}</strong> por entrega
        </p>
      )}

      <dl className="gc-datos">
        <div>
          <dt>Próxima entrega</dt>
          <dd>{proxima && suscripcion.estadoSuscripcion === 'ACTIVA' ? fechaLarga(proxima) : sinEntregas}</dd>
        </div>
        <div>
          <dt>Día de entrega</dt>
          <dd>{NOMBRE_DIA[suscripcion.diaSemanaEntrega]}</dd>
        </div>
        <div className="gc-datos__completo">
          <dt>Dirección</dt>
          <dd>
            {direccionEntrega.calle} #{direccionEntrega.numeroCasa}, C.P. {direccionEntrega.codigoPostal},{' '}
            {direccionEntrega.estado}
          </dd>
        </div>
      </dl>

      <Link className="gc-boton gc-boton--bloque" to={`/suscripciones/${suscripcion.id}`}>
        Administrar suscripción
      </Link>
    </article>
  );
}
