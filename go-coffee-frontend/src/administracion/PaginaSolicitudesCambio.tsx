import { useState } from 'react';
import { Link } from 'react-router';
import { HistorialCambios } from '../cambios-plan/HistorialCambios';
import { Aviso } from '../compartido/componentes/Aviso';
import { Confirmar } from '../compartido/componentes/Confirmar';
import { EncabezadoPagina } from '../compartido/componentes/EncabezadoPagina';
import { EstadoConsulta } from '../compartido/componentes/EstadoConsulta';
import { EstadoVacio } from '../compartido/componentes/EstadoVacio';
import { fecha } from '../compartido/formato';
import { useAccion } from '../compartido/hooks/useAccion';
import { useConsulta } from '../compartido/hooks/useConsulta';
import type { SolicitudCambioPlan } from '../compartido/tipos';
import '../cambios-plan/cambios-plan.css';
import { resolverSolicitud, traerSolicitudesCambio } from './administracion.servicio';

/** Backoffice: aprobar o rechazar solicitudes de cambio de plan. */
export function PaginaSolicitudesCambio() {
  const solicitudes = useConsulta('solicitudes-cambio', traerSolicitudesCambio);
  const accion = useAccion();
  const [porResolver, setPorResolver] = useState<{ solicitud: SolicitudCambioPlan; aceptar: boolean } | null>(null);

  async function resolver() {
    if (!porResolver || !solicitudes.datos) return;
    const { solicitud, aceptar } = porResolver;
    const lista = solicitudes.datos;
    const resuelta = await accion.ejecutar(
      `resolver-${solicitud.idSolicitud}`,
      () => resolverSolicitud(solicitud.idSolicitud, aceptar),
      aceptar ? 'Cambio aprobado para el ciclo indicado.' : 'Solicitud rechazada.',
    );
    if (resuelta) solicitudes.actualizar(lista.map((s) => (s.idSolicitud === resuelta.idSolicitud ? resuelta : s)));
    setPorResolver(null);
  }

  return (
    <div className="gc-pagina">
      <Link className="gc-volver" to="/administracion">
        ← Panel administrativo
      </Link>
      <EncabezadoPagina etiqueta="Backoffice" titulo="Solicitudes de cambio de plan">
        Revisa el plan, el precio y el ciclo propuestos antes de aprobar.
      </EncabezadoPagina>

      {accion.exito && <Aviso tono="exito" onCerrar={accion.limpiar}>{accion.exito}</Aviso>}
      {accion.error && <Aviso tono="error" onCerrar={accion.limpiar}>{accion.error}</Aviso>}

      <section className="gc-tarjeta">
        <EstadoConsulta
          consulta={solicitudes}
          textoCarga="Cargando solicitudes…"
          estaVacio={(lista) => lista.length === 0}
          vacio={<EstadoVacio icono="📭" titulo="No hay solicitudes">Cuando un cliente pida cambiar de plan aparecerá aquí.</EstadoVacio>}
        >
          {(lista) => (
            <HistorialCambios
              solicitudes={lista}
              detalleCliente
              acciones={(s) =>
                s.estadoSolicitud === 'PENDIENTE' && (
                  <>
                    <button type="button" className="gc-boton gc-boton--chico" disabled={accion.ocupado} onClick={() => setPorResolver({ solicitud: s, aceptar: true })}>
                      Aprobar
                    </button>
                    <button type="button" className="gc-boton gc-boton--chico gc-boton--peligro-suave" disabled={accion.ocupado} onClick={() => setPorResolver({ solicitud: s, aceptar: false })}>
                      Rechazar
                    </button>
                  </>
                )
              }
            />
          )}
        </EstadoConsulta>
      </section>

      {porResolver && (
        <Confirmar
          titulo={porResolver.aceptar ? '¿Aprobar el cambio de plan?' : '¿Rechazar la solicitud?'}
          textoConfirmar={porResolver.aceptar ? 'Aprobar' : 'Rechazar'}
          peligro={!porResolver.aceptar}
          ocupado={accion.ocupado}
          onConfirmar={() => void resolver()}
          onCancelar={() => setPorResolver(null)}
        >
          <p>
            {porResolver.solicitud.nombreAnterior ?? porResolver.solicitud.planAnterior.nombre} →{' '}
            <strong>{porResolver.solicitud.nombreNuevo ?? porResolver.solicitud.planNuevo.nombre}</strong>, desde el
            ciclo #{porResolver.solicitud.numCicloAplicacion} ({fecha(porResolver.solicitud.fechaNuevoCiclo)}).
          </p>
        </Confirmar>
      )}
    </div>
  );
}
