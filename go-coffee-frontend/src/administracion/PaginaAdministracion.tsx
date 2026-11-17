import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Aviso } from '../compartido/componentes/Aviso';
import { atributosCampo } from '../compartido/componentes/atributosCampo';
import { Campo } from '../compartido/componentes/Campo';
import { Confirmar } from '../compartido/componentes/Confirmar';
import { EncabezadoPagina } from '../compartido/componentes/EncabezadoPagina';
import { Etiqueta } from '../compartido/componentes/Etiqueta';
import { EstadoConsulta } from '../compartido/componentes/EstadoConsulta';
import { EstadoVacio } from '../compartido/componentes/EstadoVacio';
import {
  NOMBRE_ESTADO_COBRO,
  NOMBRE_ESTADO_ENTREGA,
  TONO_COBRO,
  TONO_ENTREGA,
  fechaCorta,
  moneda,
} from '../compartido/formato';
import { useAccion } from '../compartido/hooks/useAccion';
import { useConsulta } from '../compartido/hooks/useConsulta';
import type { CicloAdministracion, EstadoCobro, FiltrosCiclosConsulta } from '../compartido/tipos';
import { registrarCobro, traerCiclos } from './administracion.servicio';

/** Backoffice: ciclos con su entrega y sus cobros; registro manual de cobros. */
export function PaginaAdministracion() {
  const [filtros, setFiltros] = useState<FiltrosCiclosConsulta>({});
  const ciclos = useConsulta(`ciclos-${JSON.stringify(filtros)}`, () => traerCiclos(filtros));
  const accion = useAccion();
  const [porCobrar, setPorCobrar] = useState<CicloAdministracion | null>(null);
  const [resultado, setResultado] = useState<EstadoCobro>('PAGADO');
  const [referencia, setReferencia] = useState('');

  function aplicarFiltros(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const texto = (campo: string) => String(d.get(campo) ?? '').trim() || undefined;
    const idSuscripcion = texto('idSuscripcion');
    setFiltros({
      desde: texto('desde'),
      hasta: texto('hasta'),
      estadoEntrega: texto('estadoEntrega') as FiltrosCiclosConsulta['estadoEntrega'],
      estadoCobro: texto('estadoCobro') as FiltrosCiclosConsulta['estadoCobro'],
      idSuscripcion: idSuscripcion ? Number(idSuscripcion) : undefined,
    });
  }

  async function confirmarCobro() {
    if (!porCobrar?.suscripcionId) return;
    const registrado = await accion.ejecutar(
      'cobro',
      () =>
        registrarCobro({
          idSuscripcion: porCobrar.suscripcionId!,
          numCiclo: porCobrar.numCiclo,
          estadoCobro: resultado,
          referencia: referencia.trim() || undefined,
        }),
      'Se registró el resultado del cobro.',
    );
    setPorCobrar(null);
    if (registrado) ciclos.actualizar(await traerCiclos(filtros));
  }

  return (
    <div className="gc-pagina">
      <EncabezadoPagina
        etiqueta="Backoffice"
        titulo="Panel administrativo"
        acciones={
          <Link className="gc-boton gc-boton--secundario" to="/administracion/cambios-plan">
            Solicitudes de cambio de plan
          </Link>
        }
      >
        Filtra los ciclos, revisa entregas y cobros, y registra el resultado de cada cobro.
      </EncabezadoPagina>

      <Aviso tono="info">Los cobros se registran manualmente: confirma el pago fuera del sistema antes de marcarlo como pagado.</Aviso>
      {accion.exito && <Aviso tono="exito" onCerrar={accion.limpiar}>{accion.exito}</Aviso>}
      {accion.error && <Aviso tono="error" onCerrar={accion.limpiar}>{accion.error}</Aviso>}

      <form className="gc-tarjeta gc-filtros" onSubmit={aplicarFiltros}>
        <Campo id="desde" etiqueta="Desde">
          <input {...atributosCampo('desde')} type="date" defaultValue={filtros.desde} />
        </Campo>
        <Campo id="hasta" etiqueta="Hasta">
          <input {...atributosCampo('hasta')} type="date" defaultValue={filtros.hasta} />
        </Campo>
        <Campo id="idSuscripcion" etiqueta="Suscripción #">
          <input {...atributosCampo('idSuscripcion')} type="number" min="1" defaultValue={filtros.idSuscripcion} />
        </Campo>
        <Campo id="estadoEntrega" etiqueta="Entrega">
          <select {...atributosCampo('estadoEntrega')} defaultValue={filtros.estadoEntrega ?? ''}>
            <option value="">Todas</option>
            {Object.entries(NOMBRE_ESTADO_ENTREGA).map(([valor, nombre]) => (
              <option key={valor} value={valor}>{nombre}</option>
            ))}
          </select>
        </Campo>
        <Campo id="estadoCobro" etiqueta="Cobro">
          <select {...atributosCampo('estadoCobro')} defaultValue={filtros.estadoCobro ?? ''}>
            <option value="">Todos</option>
            <option value="PAGADO">Pagado</option>
            <option value="FALLIDO">Fallido</option>
          </select>
        </Campo>
        <button type="submit" className="gc-boton" disabled={ciclos.cargando}>
          Aplicar filtros
        </button>
      </form>

      <section className="gc-tarjeta">
        <EstadoConsulta
          consulta={ciclos}
          textoCarga="Cargando ciclos…"
          estaVacio={(lista) => lista.length === 0}
          vacio={<EstadoVacio icono="🔎" titulo="No hay ciclos con esos filtros">Prueba con otras fechas o quita algún filtro.</EstadoVacio>}
        >
          {(lista) => (
            <div className="gc-tabla__contenedor">
              <table className="gc-tabla">
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Suscripción</th>
                    <th scope="col">Cliente</th>
                    <th scope="col">Ciclo</th>
                    <th scope="col">Entrega</th>
                    <th scope="col">Cobros</th>
                    <th scope="col"><span className="gc-oculto">Acciones</span></th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((ciclo) => {
                    const pagado = ciclo.cobros.some((c) => c.estadoCobro === 'PAGADO');
                    const puedeRegistrar = !pagado && ciclo.entrega?.estadoEntrega !== 'SALTADA' && Boolean(ciclo.suscripcionId);
                    return (
                      <tr key={ciclo.idCiclo}>
                        <td data-etiqueta="Fecha">{fechaCorta(ciclo.fechaProgramada)}</td>
                        <td data-etiqueta="Suscripción">
                          {ciclo.suscripcionId ? (
                            <Link to={`/suscripciones/${ciclo.suscripcionId}`}>
                              #{ciclo.suscripcionId} · {ciclo.suscripcion?.plan.nombre}
                            </Link>
                          ) : '—'}
                        </td>
                        <td data-etiqueta="Cliente">{ciclo.suscripcion?.usuario?.email ?? 'Sin cuenta asociada'}</td>
                        <td data-etiqueta="Ciclo">#{ciclo.numCiclo}</td>
                        <td data-etiqueta="Entrega">
                          {ciclo.entrega ? (
                            <Etiqueta tono={TONO_ENTREGA[ciclo.entrega.estadoEntrega]}>{NOMBRE_ESTADO_ENTREGA[ciclo.entrega.estadoEntrega]}</Etiqueta>
                          ) : '—'}
                        </td>
                        <td data-etiqueta="Cobros">
                          {ciclo.cobros.length === 0
                            ? <span className="gc-texto-suave">Sin cobros</span>
                            : ciclo.cobros.map((c) => (
                                <div key={c.idCobro}>
                                  <Etiqueta tono={TONO_COBRO[c.estadoCobro]}>{NOMBRE_ESTADO_COBRO[c.estadoCobro]}</Etiqueta>{' '}
                                  {c.monto === null ? '' : moneda(c.monto)}
                                </div>
                              ))}
                        </td>
                        <td className="gc-tabla__acciones">
                          {puedeRegistrar && (
                            <button
                              type="button"
                              className="gc-boton gc-boton--secundario gc-boton--chico"
                              disabled={accion.ocupado}
                              onClick={() => {
                                setResultado('PAGADO');
                                setReferencia('');
                                setPorCobrar(ciclo);
                              }}
                            >
                              Registrar cobro
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </EstadoConsulta>
      </section>

      {porCobrar && (
        <Confirmar
          titulo={`Registrar cobro · Suscripción #${porCobrar.suscripcionId} · Ciclo #${porCobrar.numCiclo}`}
          textoConfirmar="Registrar resultado"
          peligro={resultado === 'FALLIDO'}
          ocupado={accion.ocupado}
          onConfirmar={() => void confirmarCobro()}
          onCancelar={() => setPorCobrar(null)}
        >
          <div className="gc-formulario">
            <Campo id="resultado-cobro" etiqueta="Resultado">
              <select {...atributosCampo('resultado-cobro')} value={resultado} onChange={(e) => setResultado(e.target.value as EstadoCobro)}>
                <option value="PAGADO">Pagado</option>
                <option value="FALLIDO">Fallido (suspende la suscripción)</option>
              </select>
            </Campo>
            <Campo id="referencia-cobro" etiqueta="Referencia del comprobante (opcional)">
              <input {...atributosCampo('referencia-cobro')} maxLength={160} value={referencia} onChange={(e) => setReferencia(e.target.value)} />
            </Campo>
          </div>
        </Confirmar>
      )}
    </div>
  );
}
