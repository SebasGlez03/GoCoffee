import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { CambioPlan } from '../cambios-plan/CambioPlan';
import { Aviso } from '../compartido/componentes/Aviso';
import { atributosCampo } from '../compartido/componentes/atributosCampo';
import { Campo } from '../compartido/componentes/Campo';
import { Confirmar } from '../compartido/componentes/Confirmar';
import { Etiqueta } from '../compartido/componentes/Etiqueta';
import { EstadoConsulta } from '../compartido/componentes/EstadoConsulta';
import { EstadoVacio } from '../compartido/componentes/EstadoVacio';
import { NoEncontrado } from '../compartido/componentes/NoEncontrado';
import {
  NOMBRE_DIA,
  NOMBRE_ESTADO_SUSCRIPCION,
  NOMBRE_FRECUENCIA,
  TONO_SUSCRIPCION,
  bolsas,
  fecha,
  fechaLarga,
  moneda,
} from '../compartido/formato';
import { useAccion } from '../compartido/hooks/useAccion';
import { useConsulta } from '../compartido/hooks/useConsulta';
import type { DiaSemana, Suscripcion } from '../compartido/tipos';
import { ConfirmarSalto } from '../entregas/ConfirmarSalto';
import { saltarEntrega } from '../entregas/entregas.servicio';
import { ListaEntregas, type FilaEntrega } from '../entregas/ListaEntregas';
import { esFutura, fechaDeCiclo } from '../entregas/reglasEntrega';
import {
  cambiarDiaEntrega,
  cancelarSuscripcion,
  pausarSuscripcion,
  reanudarSuscripcion,
  traerSuscripcion,
} from './suscripciones.servicio';
import './suscripciones.css';

const SUSCRIPCION_INEXISTENTE = (
  <NoEncontrado
    titulo="No encontramos esa suscripción"
    mensaje="Puede que la dirección esté mal escrita o que la suscripción no sea de tu cuenta."
    enlace={{ a: '/suscripciones', texto: 'Ir a mis suscripciones' }}
  />
);

const DIAS: DiaSemana[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

type Operacion = 'pausar' | 'reanudar' | 'cancelar';

/** /suscripciones/:id — dirección propia para poder compartir el enlace. */
export function PaginaDetalleSuscripcion() {
  const { id } = useParams();
  const idSuscripcion = Number(id);
  if (!id || !/^\d+$/.test(id) || idSuscripcion <= 0) return SUSCRIPCION_INEXISTENTE;
  return <DetalleSuscripcion key={idSuscripcion} id={idSuscripcion} />;
}

function DetalleSuscripcion({ id }: { id: number }) {
  const consulta = useConsulta(`suscripcion-${id}`, () => traerSuscripcion(id));

  return (
    <EstadoConsulta
      consulta={consulta}
      textoCarga="Cargando tu suscripción…"
      noEncontrado={SUSCRIPCION_INEXISTENTE}
    >
      {(suscripcion) => <Contenido suscripcion={suscripcion} alActualizar={consulta.actualizar} />}
    </EstadoConsulta>
  );
}

function Contenido({
  suscripcion,
  alActualizar,
}: {
  suscripcion: Suscripcion;
  alActualizar: (s: Suscripcion) => void;
}) {
  const accion = useAccion();
  const [porConfirmar, setPorConfirmar] = useState<Operacion | null>(null);
  const [porSaltar, setPorSaltar] = useState<FilaEntrega | null>(null);
  const [dia, setDia] = useState<DiaSemana>(suscripcion.diaSemanaEntrega);
  const { plan, estadoSuscripcion: estado } = suscripcion;
  const cancelada = estado === 'CANCELADA';

  async function ejecutar(operacion: Operacion) {
    const funciones = { pausar: pausarSuscripcion, reanudar: reanudarSuscripcion, cancelar: cancelarSuscripcion };
    const mensajes = {
      pausar: 'Pausaste tu suscripción. No se generarán entregas ni cobros hasta que la reanudes.',
      reanudar: 'Reanudaste tu suscripción. Tus entregas vuelven a programarse.',
      cancelar: 'Cancelaste tu suscripción. Se respetan las entregas que ya pagaste.',
    };
    const actualizada = await accion.ejecutar(operacion, () => funciones[operacion](suscripcion.id), mensajes[operacion]);
    if (actualizada) alActualizar(actualizada);
    setPorConfirmar(null);
  }

  async function guardarDia() {
    const actualizada = await accion.ejecutar(
      'dia',
      () => cambiarDiaEntrega(suscripcion.id, dia),
      `Tus próximas entregas llegarán en ${NOMBRE_DIA[dia].toLowerCase()}.`,
    );
    if (actualizada) alActualizar(actualizada);
  }

  async function confirmarSalto() {
    if (!porSaltar) return;
    const { ciclo } = porSaltar;
    await accion.ejecutar(
      `saltar-${suscripcion.id}-${ciclo.numCiclo}`,
      async () => {
        await saltarEntrega(suscripcion.id, ciclo.numCiclo);
        alActualizar(await traerSuscripcion(suscripcion.id));
      },
      `Saltaste la entrega del ${fechaLarga(fechaDeCiclo(ciclo))}. No se cobrará ese ciclo.`,
    );
    setPorSaltar(null);
  }

  const filas: FilaEntrega[] = [...suscripcion.ciclos]
    .sort((a, b) => fechaDeCiclo(b).localeCompare(fechaDeCiclo(a)))
    .slice(0, 8)
    .map((ciclo) => ({ suscripcion, ciclo }));

  return (
    <div className="gc-pagina">
      <Link className="gc-volver" to="/suscripciones">
        ← Mis suscripciones
      </Link>

      <header className="gc-pagina__encabezado">
        <div>
          <span className="gc-pagina__etiqueta">Suscripción #{suscripcion.id}</span>
          <h1>{plan?.nombre ?? 'Mi suscripción'}</h1>
          <p className="gc-pagina__bajada">Desde el {fecha(suscripcion.fechaInicio)}</p>
        </div>
        <Etiqueta tono={TONO_SUSCRIPCION[estado]}>{NOMBRE_ESTADO_SUSCRIPCION[estado]}</Etiqueta>
      </header>

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

      {estado === 'SUSPENDIDA' && (
        <Aviso tono="error">
          Tu suscripción está suspendida porque un cobro no se pudo realizar. Revisa tu{' '}
          <Link to="/cobros">método de pago</Link>; cuando el cobro se registre como pagado, tus entregas
          se reanudan solas.
        </Aviso>
      )}
      {estado === 'PAUSADA' && (
        <Aviso tono="advertencia">
          Tu suscripción está pausada: no se generan entregas ni cobros. Reanúdala cuando quieras.
        </Aviso>
      )}
      {cancelada && <ResumenCancelacion suscripcion={suscripcion} />}

      <div className={`gc-detalle-suscripcion${cancelada ? ' gc-detalle-suscripcion--una-columna' : ''}`}>
        <section className="gc-tarjeta" aria-labelledby="titulo-datos">
          <h2 id="titulo-datos">Datos de tu suscripción</h2>
          <dl className="gc-datos">
            {plan && (
              <>
                <div>
                  <dt>Contenido</dt>
                  <dd>{bolsas(plan.cantidadBolsas)}</dd>
                </div>
                <div>
                  <dt>Precio por entrega</dt>
                  <dd>{moneda(plan.precio)}</dd>
                </div>
                <div>
                  <dt>Frecuencia</dt>
                  <dd>{NOMBRE_FRECUENCIA[plan.frecuenciaEntrega]}</dd>
                </div>
              </>
            )}
            <div>
              <dt>Día de entrega</dt>
              <dd>{NOMBRE_DIA[suscripcion.diaSemanaEntrega]}</dd>
            </div>
            <div className="gc-datos__completo">
              <dt>Dirección de entrega</dt>
              <dd>
                {suscripcion.direccionEntrega.calle} #{suscripcion.direccionEntrega.numeroCasa}, C.P.{' '}
                {suscripcion.direccionEntrega.codigoPostal}, {suscripcion.direccionEntrega.estado}
              </dd>
            </div>
          </dl>
        </section>

        {!cancelada && (
          <section className="gc-tarjeta" aria-labelledby="titulo-acciones">
            <h2 id="titulo-acciones">Administrar</h2>
            <form
              className="gc-formulario gc-formulario--en-linea"
              onSubmit={(e) => {
                e.preventDefault();
                void guardarDia();
              }}
            >
              <Campo id="dia-entrega" etiqueta="Día de entrega">
                <select
                  {...atributosCampo('dia-entrega')}
                  value={dia}
                  disabled={accion.ocupado}
                  onChange={(e) => setDia(e.target.value as DiaSemana)}
                >
                  {DIAS.map((d) => (
                    <option key={d} value={d}>
                      {NOMBRE_DIA[d]}
                    </option>
                  ))}
                </select>
              </Campo>
              <button
                type="submit"
                className="gc-boton gc-boton--secundario"
                disabled={accion.ocupado || dia === suscripcion.diaSemanaEntrega}
              >
                {accion.enCurso === 'dia' ? 'Guardando…' : 'Guardar día'}
              </button>
            </form>

            <div className="gc-acciones gc-acciones--separadas">
              {estado === 'ACTIVA' && (
                <button type="button" className="gc-boton gc-boton--secundario" disabled={accion.ocupado} onClick={() => setPorConfirmar('pausar')}>
                  Pausar suscripción
                </button>
              )}
              {estado === 'PAUSADA' && (
                <button type="button" className="gc-boton" disabled={accion.ocupado} onClick={() => setPorConfirmar('reanudar')}>
                  Reanudar suscripción
                </button>
              )}
              <button type="button" className="gc-boton gc-boton--peligro-suave" disabled={accion.ocupado} onClick={() => setPorConfirmar('cancelar')}>
                Cancelar suscripción
              </button>
            </div>
          </section>
        )}
      </div>

      <section className="gc-tarjeta" aria-labelledby="titulo-entregas">
        <div className="gc-tarjeta__encabezado">
          <h2 id="titulo-entregas">Entregas de esta suscripción</h2>
          <Link to="/entregas">Ver calendario completo</Link>
        </div>
        {filas.length === 0 ? (
          <EstadoVacio icono="🗓️" titulo="Todavía no hay entregas registradas">
            La primera entrega aparece aquí en cuanto se programa el ciclo.
          </EstadoVacio>
        ) : (
          <ListaEntregas filas={filas} mostrarSuscripcion={false} enCurso={accion.enCurso} onSaltar={setPorSaltar} />
        )}
      </section>

      <CambioPlan key={`${suscripcion.id}-${estado}-${plan?.idPlan}`} suscripcion={suscripcion} />

      {porConfirmar && (
        <ConfirmarOperacion
          operacion={porConfirmar}
          suscripcion={suscripcion}
          ocupado={accion.ocupado}
          onConfirmar={() => void ejecutar(porConfirmar)}
          onCancelar={() => setPorConfirmar(null)}
        />
      )}
      {porSaltar && (
        <ConfirmarSalto
          fila={porSaltar}
          ocupado={accion.ocupado}
          onConfirmar={() => void confirmarSalto()}
          onCancelar={() => setPorSaltar(null)}
        />
      )}
    </div>
  );
}

function ConfirmarOperacion({
  operacion,
  suscripcion,
  ocupado,
  onConfirmar,
  onCancelar,
}: {
  operacion: Operacion;
  suscripcion: Suscripcion;
  ocupado: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  if (operacion === 'pausar') {
    return (
      <Confirmar titulo="¿Pausar tu suscripción?" textoConfirmar="Sí, pausar" ocupado={ocupado} onConfirmar={onConfirmar} onCancelar={onCancelar}>
        <p>Mientras esté pausada no se programan entregas ni se generan cobros.</p>
        <p>Las entregas que ya pagaste se conservan. Puedes reanudarla cuando quieras.</p>
      </Confirmar>
    );
  }
  if (operacion === 'reanudar') {
    return (
      <Confirmar titulo="¿Reanudar tu suscripción?" textoConfirmar="Sí, reanudar" ocupado={ocupado} onConfirmar={onConfirmar} onCancelar={onCancelar}>
        <p>Volveremos a programar tus entregas a partir del siguiente ciclo disponible.</p>
      </Confirmar>
    );
  }
  const ultima = suscripcion.ultimaEntregaPagada;
  const pendiente = ultima !== null && esFutura(ultima.fechaProgramada);
  return (
    <Confirmar titulo="¿Cancelar tu suscripción?" textoConfirmar="Sí, cancelar" peligro ocupado={ocupado} onConfirmar={onConfirmar} onCancelar={onCancelar}>
      {pendiente && ultima ? (
        <p>
          Respetaremos lo que ya pagaste: tu última entrega llegará el <strong>{fechaLarga(ultima.fechaProgramada)}</strong>.
        </p>
      ) : (
        <p>No tienes entregas pagadas pendientes, así que ya no recibirás más entregas.</p>
      )}
      <p>No se harán más cobros. Esta acción no se puede deshacer.</p>
    </Confirmar>
  );
}

function ResumenCancelacion({ suscripcion }: { suscripcion: Suscripcion }) {
  const ultima = suscripcion.ultimaEntregaPagada;
  return (
    <Aviso tono="info">
      Esta suscripción está cancelada y ya no genera entregas ni cobros.{' '}
      {ultima ? (
        <>
          Tu última entrega pagada es la del <strong>{fechaLarga(ultima.fechaProgramada)}</strong> (ciclo #
          {ultima.numCiclo}){ultima.estadoEntrega === 'ENTREGADA' ? ' y ya fue entregada.' : '.'}
        </>
      ) : (
        'No había entregas pagadas pendientes.'
      )}
    </Aviso>
  );
}
