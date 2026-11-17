import { useState } from 'react';
import { Link } from 'react-router';
import { Aviso } from '../compartido/componentes/Aviso';
import { EncabezadoPagina } from '../compartido/componentes/EncabezadoPagina';
import { EstadoConsulta } from '../compartido/componentes/EstadoConsulta';
import { EstadoVacio } from '../compartido/componentes/EstadoVacio';
import { fechaLarga } from '../compartido/formato';
import { useAccion } from '../compartido/hooks/useAccion';
import { useConsulta } from '../compartido/hooks/useConsulta';
import { traerMisSuscripciones } from '../suscripciones/suscripciones.servicio';
import { ConfirmarSalto } from './ConfirmarSalto';
import { saltarEntrega } from './entregas.servicio';
import { ListaEntregas, type FilaEntrega } from './ListaEntregas';
import { esFutura, fechaDeCiclo } from './reglasEntrega';
import './entregas.css';

type Vista = 'proximas' | 'historial';

export function PaginaEntregas() {
  const suscripciones = useConsulta('mis-suscripciones', traerMisSuscripciones);
  const accion = useAccion();
  const [vista, setVista] = useState<Vista>('proximas');
  const [porSaltar, setPorSaltar] = useState<FilaEntrega | null>(null);

  async function confirmarSalto() {
    if (!porSaltar) return;
    const { suscripcion, ciclo } = porSaltar;
    await accion.ejecutar(
      `saltar-${suscripcion.id}-${ciclo.numCiclo}`,
      async () => {
        await saltarEntrega(suscripcion.id, ciclo.numCiclo);
        suscripciones.actualizar(await traerMisSuscripciones());
        return true;
      },
      `Listo: saltaste la entrega del ${fechaLarga(fechaDeCiclo(ciclo))}. No se cobrará ese ciclo.`,
    );
    setPorSaltar(null);
  }

  return (
    <div className="gc-pagina">
      <EncabezadoPagina etiqueta="Calendario" titulo="Mis entregas">
        Consulta cuándo llega tu café y salta una entrega puntual si no la necesitas.
      </EncabezadoPagina>

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

      <EstadoConsulta
        consulta={suscripciones}
        textoCarga="Cargando tu calendario…"
        estaVacio={(lista) => lista.length === 0}
        vacio={
          <EstadoVacio
            icono="📅"
            titulo="Todavía no tienes entregas"
            accion={
              <Link className="gc-boton" to="/planes">
                Elegir un plan
              </Link>
            }
          >
            Tus entregas aparecerán aquí en cuanto te suscribas a un plan.
          </EstadoVacio>
        }
      >
        {(lista) => {
          const filas = lista
            .flatMap((suscripcion) => suscripcion.ciclos.map((ciclo) => ({ suscripcion, ciclo })))
            .filter(({ ciclo }) => {
              const futura = esFutura(fechaDeCiclo(ciclo));
              return vista === 'proximas' ? futura : !futura;
            })
            .sort((a, b) => {
              const orden = fechaDeCiclo(a.ciclo).localeCompare(fechaDeCiclo(b.ciclo));
              return vista === 'proximas' ? orden : -orden;
            });

          return (
            <section className="gc-tarjeta">
              <div className="gc-pestanas" role="tablist" aria-label="Tipo de entregas">
                <button
                  type="button"
                  role="tab"
                  aria-selected={vista === 'proximas'}
                  className="gc-pestanas__boton"
                  onClick={() => setVista('proximas')}
                >
                  Próximas
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={vista === 'historial'}
                  className="gc-pestanas__boton"
                  onClick={() => setVista('historial')}
                >
                  Historial
                </button>
              </div>
              {filas.length === 0 ? (
                <EstadoVacio icono={vista === 'proximas' ? '🗓️' : '📦'} titulo={vista === 'proximas' ? 'No tienes entregas próximas' : 'Aún no hay entregas pasadas'}>
                  {vista === 'proximas'
                    ? 'Si pausaste o cancelaste tus suscripciones no se programan nuevas entregas. Puedes reanudarlas desde "Mis suscripciones".'
                    : 'Aquí verás las entregas que ya pasaron, con su estado y su cobro.'}
                </EstadoVacio>
              ) : (
                <ListaEntregas filas={filas} enCurso={accion.enCurso} onSaltar={setPorSaltar} />
              )}
            </section>
          );
        }}
      </EstadoConsulta>

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
