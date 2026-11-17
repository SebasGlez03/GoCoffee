import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router";
import { useSesion } from "../sesion/SesionContext";
import { Cargando } from "../componentes/Cargando";
import { MensajeError } from "../componentes/MensajeError";
import { mensajeDeError } from "../servicios/api";
import {
  registrarCobro,
  traerCiclosAdmin,
  type FiltrosCiclosAdmin,
} from "../servicios/goCoffee";
import type { CicloAdministracion } from "../tipos/tipos";
import "../assets/css/Operaciones.css";

const fecha = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeZone: "UTC",
});
const moneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export function PaginaAdministracion() {
  const { usuario } = useSesion();
  return usuario?.rol === "ADMINISTRADOR" ? (
    <PanelAdministracion />
  ) : (
    <Navigate to="/suscripciones" replace />
  );
}

function PanelAdministracion() {
  const [ciclos, setCiclos] = useState<CicloAdministracion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [seleccionado, setSeleccionado] = useState<CicloAdministracion | null>(
    null,
  );
  const [guardando, setGuardando] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosCiclosAdmin>({});

  const cargar = useCallback(async (criterios: FiltrosCiclosAdmin) => {
    setCargando(true);
    setError(null);
    try {
      setCiclos(await traerCiclosAdmin(criterios));
      setFiltros(criterios);
    } catch (e) {
      setError(mensajeDeError(e, "No se pudo cargar el historial de ciclos."));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let vigente = true;
    traerCiclosAdmin({})
      .then((lista) => {
        if (vigente) setCiclos(lista);
      })
      .catch((e) => {
        if (vigente)
          setError(
            mensajeDeError(e, "No se pudo cargar el historial de ciclos."),
          );
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, []);

  async function registrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!seleccionado?.suscripcionId) return;
    const datos = new FormData(e.currentTarget);
    setGuardando(true);
    setError(null);
    setMensaje(null);
    try {
      await registrarCobro({
        idSuscripcion: seleccionado.suscripcionId,
        numCiclo: seleccionado.numCiclo,
        estadoCobro: String(datos.get("estadoCobro")) as "PAGADO" | "FALLIDO",
        referencia: String(datos.get("referencia") ?? "") || undefined,
      });
      setSeleccionado(null);
      setMensaje("Se registró el resultado manual del cobro.");
      await cargar(filtros);
    } catch (e) {
      setError(mensajeDeError(e, "No se pudo registrar el cobro."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="gc-operaciones">
      <header>
        <h1>Panel administrativo</h1>
        <p>Filtra los ciclos y consulta el historial de entregas y cobros.</p>
      </header>
      <nav className="gc-operaciones__enlaces">
        <Link to="/administracion/cambios-plan">
          Solicitudes de cambio de plan
        </Link>
        <Link to="/entregas">Calendario de entregas</Link>
      </nav>
      <aside className="gc-operaciones__aviso">
        Los cobros se registran manualmente. Confirma el pago fuera del sistema
        antes de registrar PAGADO.
      </aside>
      <form
        key={JSON.stringify(filtros)}
        className="gc-operaciones__filtros"
        onSubmit={(e) => {
          e.preventDefault();
          const datos = new FormData(e.currentTarget);
          const suscripcion = String(datos.get("idSuscripcion") ?? "");
          void cargar({
            desde: String(datos.get("desde") ?? "") || undefined,
            hasta: String(datos.get("hasta") ?? "") || undefined,
            estadoEntrega:
              String(datos.get("estadoEntrega") ?? "") || undefined,
            estadoCobro: String(datos.get("estadoCobro") ?? "") || undefined,
            idSuscripcion: suscripcion ? Number(suscripcion) : undefined,
          });
        }}
      >
        <label>
          Desde <input name="desde" type="date" defaultValue={filtros.desde} />
        </label>
        <label>
          Hasta <input name="hasta" type="date" defaultValue={filtros.hasta} />
        </label>
        <label>
          Suscripción #{" "}
          <input
            name="idSuscripcion"
            type="number"
            min="1"
            defaultValue={filtros.idSuscripcion}
          />
        </label>
        <label>
          Estado de entrega
          <select
            name="estadoEntrega"
            defaultValue={filtros.estadoEntrega ?? ""}
          >
            <option value="">Todos</option>
            <option value="PROGRAMADA">Programada</option>
            <option value="SALTADA">Saltada</option>
            <option value="ARMADA">Armada</option>
            <option value="ENVIADA">Enviada</option>
            <option value="ENTREGADA">Entregada</option>
          </select>
        </label>
        <label>
          Estado de cobro
          <select name="estadoCobro" defaultValue={filtros.estadoCobro ?? ""}>
            <option value="">Todos</option>
            <option value="PAGADO">Pagado</option>
            <option value="FALLIDO">Fallido</option>
          </select>
        </label>
        <button type="submit" disabled={cargando}>
          Aplicar filtros
        </button>
      </form>

      {error && (
        <MensajeError
          mensaje={error}
          onReintentar={() => void cargar(filtros)}
        />
      )}
      {mensaje && (
        <p className="gc-operaciones__mensaje" role="status">
          {mensaje}
        </p>
      )}
      {cargando && <Cargando />}
      {!cargando &&
        (ciclos.length === 0 ? (
          <p>No se encontraron ciclos con esos filtros.</p>
        ) : (
          <div className="gc-operaciones__tabla-contenedor">
            <table className="gc-operaciones__tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Suscripción</th>
                  <th>Cliente</th>
                  <th>Plan</th>
                  <th>Ciclo</th>
                  <th>Entrega</th>
                  <th>Historial de cobros</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ciclos.map((ciclo) => {
                  const tienePago = ciclo.cobros.some(
                    (cobro) => cobro.estadoCobro === "PAGADO",
                  );
                  const puedeRegistrar =
                    !tienePago &&
                    ciclo.entrega?.estadoEntrega !== "SALTADA" &&
                    Boolean(ciclo.suscripcionId);
                  return (
                    <tr key={ciclo.idCiclo}>
                      <td>{fecha.format(new Date(ciclo.fechaProgramada))}</td>
                      <td>
                        {ciclo.suscripcionId ? (
                          <Link to={`/suscripciones/${ciclo.suscripcionId}`}>
                            #{ciclo.suscripcionId}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {ciclo.suscripcion?.usuario?.email ??
                          "Sin cuenta asociada"}
                      </td>
                      <td>{ciclo.suscripcion?.plan.nombre ?? "—"}</td>
                      <td>#{ciclo.numCiclo}</td>
                      <td>{ciclo.entrega?.estadoEntrega ?? "Sin entrega"}</td>
                      <td>
                        {ciclo.cobros.length === 0
                          ? "Sin cobros"
                          : ciclo.cobros.map((cobro) => (
                              <div key={cobro.idCobro}>
                                {cobro.estadoCobro} ·{" "}
                                {cobro.monto === null
                                  ? "—"
                                  : moneda.format(cobro.monto)}
                              </div>
                            ))}
                      </td>
                      <td>
                        {puedeRegistrar && (
                          <button
                            type="button"
                            disabled={guardando}
                            onClick={() => setSeleccionado(ciclo)}
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
        ))}

      {seleccionado && (
        <form
          className="gc-operaciones__formulario"
          onSubmit={(e) => void registrar(e)}
        >
          <h2>
            Registrar cobro · Suscripción #{seleccionado.suscripcionId} · Ciclo
            #{seleccionado.numCiclo}
          </h2>
          <label>
            Resultado
            <select name="estadoCobro">
              <option value="PAGADO">Pagado</option>
              <option value="FALLIDO">Fallido</option>
            </select>
          </label>
          <label>
            Referencia del comprobante (opcional)
            <input name="referencia" maxLength={160} />
          </label>
          <div className="gc-operaciones__acciones">
            <button type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : "Confirmar resultado"}
            </button>
            <button
              type="button"
              disabled={guardando}
              onClick={() => setSeleccionado(null)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
