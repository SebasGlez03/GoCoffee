import { useState, type FormEvent } from 'react';
import { Aviso } from '../compartido/componentes/Aviso';
import { atributosCampo } from '../compartido/componentes/atributosCampo';
import { Campo } from '../compartido/componentes/Campo';
import { Cargando } from '../compartido/componentes/Cargando';
import { MensajeError } from '../compartido/componentes/MensajeError';
import { bolsas, fecha, moneda, NOMBRE_FRECUENCIA } from '../compartido/formato';
import { useAccion } from '../compartido/hooks/useAccion';
import { useConsulta } from '../compartido/hooks/useConsulta';
import type { Suscripcion } from '../compartido/tipos';
import { enfocarPrimerError, requerido, validar, type Errores } from '../compartido/validacion';
import { solicitarCambio, traerHistorialCambios, traerOpcionesCambio } from './cambios-plan.servicio';
import { HistorialCambios } from './HistorialCambios';
import './cambios-plan.css';

type CampoCambio = 'nuevo-plan' | 'ciclo-aplicacion';

/** Solicitud de cambio de plan (caso de uso SF-F) dentro del detalle de suscripción. */
export function CambioPlan({ suscripcion }: { suscripcion: Suscripcion }) {
  const puedeSolicitar = suscripcion.estadoSuscripcion === 'ACTIVA' || suscripcion.estadoSuscripcion === 'PAUSADA';
  const datos = useConsulta(`cambios-${suscripcion.id}`, () =>
    Promise.all([
      traerHistorialCambios(suscripcion.id),
      puedeSolicitar ? traerOpcionesCambio(suscripcion.id) : Promise.resolve(null),
    ]),
  );
  const accion = useAccion();
  const [valores, setValores] = useState<Record<CampoCambio, string>>({ 'nuevo-plan': '', 'ciclo-aplicacion': '' });
  const [errores, setErrores] = useState<Errores<CampoCambio>>({});

  if (datos.cargando) {
    return (
      <section className="gc-tarjeta">
        <h2>Cambiar de plan</h2>
        <Cargando texto="Cargando opciones de cambio…" />
      </section>
    );
  }
  if (datos.error || !datos.datos) {
    return (
      <section className="gc-tarjeta">
        <h2>Cambiar de plan</h2>
        {datos.error && <MensajeError error={datos.error} onReintentar={datos.reintentar} />}
      </section>
    );
  }

  const [historial, opciones] = datos.datos;
  const pendiente = historial.some(
    (s) => s.estadoSolicitud === 'PENDIENTE' || (s.estadoSolicitud === 'ACEPTADA' && !s.fechaAplicacion),
  );
  const planElegido = opciones?.planes.find((p) => String(p.planId) === valores['nuevo-plan']);
  const cicloElegido = opciones?.ciclosAplicacion.find((c) => String(c.numCiclo) === valores['ciclo-aplicacion']);

  function cambiar(campo: CampoCambio, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const nuevos = validar(valores, {
      'nuevo-plan': [requerido('Elige el plan al que quieres cambiar.')],
      'ciclo-aplicacion': [requerido('Elige desde qué ciclo aplica el cambio.')],
    });
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0 || !planElegido || !cicloElegido) {
      enfocarPrimerError(nuevos);
      return;
    }
    const creada = await accion.ejecutar(
      'solicitar',
      () =>
        solicitarCambio(suscripcion.id, {
          planId: planElegido.planId,
          precioEsperado: planElegido.precio,
          numCicloAplicacion: cicloElegido.numCiclo,
        }),
      'Enviamos tu solicitud. Tu plan sigue igual hasta que se apruebe y llegue el ciclo elegido.',
    );
    if (creada) {
      datos.actualizar([[creada, ...historial], opciones]);
      setValores({ 'nuevo-plan': '', 'ciclo-aplicacion': '' });
    }
  }

  return (
    <section className="gc-tarjeta gc-cambio-plan" aria-labelledby="titulo-cambio">
      <h2 id="titulo-cambio">Cambiar de plan</h2>

      {accion.exito && (
        <Aviso tono="exito" onCerrar={accion.limpiar}>
          {accion.exito}
        </Aviso>
      )}
      {accion.error && (
        <Aviso tono="error" onCerrar={accion.limpiar}>
          {accion.error}
        </Aviso>
      )}

      {!puedeSolicitar && (
        <p className="gc-texto-suave">Solo puedes cambiar de plan mientras tu suscripción está activa o pausada.</p>
      )}
      {puedeSolicitar && pendiente && (
        <Aviso tono="info">Ya tienes un cambio de plan en proceso. Cuando se aplique podrás pedir otro.</Aviso>
      )}
      {puedeSolicitar && !pendiente && opciones && opciones.planes.length === 0 && (
        <p className="gc-texto-suave">Por ahora no hay otros planes disponibles para cambiar.</p>
      )}

      {puedeSolicitar && !pendiente && opciones && opciones.planes.length > 0 && (
        <form className="gc-formulario" onSubmit={enviar} noValidate>
          <div className="gc-formulario__fila">
            <Campo id="nuevo-plan" etiqueta="Nuevo plan" error={errores['nuevo-plan']}>
              <select
                {...atributosCampo('nuevo-plan', errores['nuevo-plan'])}
                value={valores['nuevo-plan']}
                disabled={accion.ocupado}
                onChange={(e) => cambiar('nuevo-plan', e.target.value)}
              >
                <option value="">Elige un plan</option>
                {opciones.planes.map((p) => (
                  <option key={p.planId} value={p.planId}>
                    {p.nombre} · {moneda(p.precio)}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo
              id="ciclo-aplicacion"
              etiqueta="Aplicar desde"
              error={errores['ciclo-aplicacion']}
              ayuda="Tu plan actual se mantiene hasta ese ciclo."
            >
              <select
                {...atributosCampo('ciclo-aplicacion', errores['ciclo-aplicacion'], 'Tu plan actual se mantiene hasta ese ciclo.')}
                value={valores['ciclo-aplicacion']}
                disabled={accion.ocupado}
                onChange={(e) => cambiar('ciclo-aplicacion', e.target.value)}
              >
                <option value="">Elige un ciclo</option>
                {opciones.ciclosAplicacion.map((c) => (
                  <option key={c.numCiclo} value={c.numCiclo}>
                    Ciclo #{c.numCiclo} · {fecha(c.fecha)}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          {planElegido && (
            <div className="gc-resumen">
              <p>
                <strong>{planElegido.nombre}</strong>: {bolsas(planElegido.cantidadBolsas)},{' '}
                {NOMBRE_FRECUENCIA[planElegido.frecuenciaEntrega].toLowerCase()}.
              </p>
              <p>
                Pagarás <strong>{moneda(planElegido.precio)}</strong> por entrega
                {suscripcion.plan && <> (hoy pagas {moneda(suscripcion.plan.precio)})</>}
                {cicloElegido && <> a partir del {fecha(cicloElegido.fecha)}</>}.
              </p>
              <p className="gc-texto-suave">El cambio requiere la aprobación de GoCoffee.</p>
            </div>
          )}

          <button type="submit" className="gc-boton" disabled={accion.ocupado}>
            {accion.ocupado ? 'Enviando…' : 'Solicitar cambio de plan'}
          </button>
        </form>
      )}

      <h3 className="gc-cambio-plan__subtitulo">Historial de cambios</h3>
      {historial.length === 0 ? (
        <p className="gc-texto-suave">No has solicitado cambios de plan.</p>
      ) : (
        <HistorialCambios solicitudes={historial} />
      )}
    </section>
  );
}
