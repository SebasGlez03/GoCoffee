import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Cargando } from "../componentes/Cargando";
import { MensajeError } from "../componentes/MensajeError";
import { useSesion } from "../sesion/SesionContext";
import { mensajeDeError } from "../servicios/api";
import { saltarEntrega, traerSuscripciones } from "../servicios/goCoffee";
import type { Suscripcion } from "../tipos/tipos";
import "../assets/css/Operaciones.css";

const fecha = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function PaginaEntregas() {
  const { usuario } = useSesion();
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [mes, setMes] = useState(() => new Date().toISOString().slice(0, 7));
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accion, setAccion] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setSuscripciones(await traerSuscripciones());
    } catch (e) {
      setError(
        mensajeDeError(e, "No se pudo cargar el calendario de entregas."),
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let vigente = true;
    traerSuscripciones()
      .then((lista) => {
        if (vigente) setSuscripciones(lista);
      })
      .catch((e) => {
        if (vigente)
          setError(
            mensajeDeError(e, "No se pudo cargar el calendario de entregas."),
          );
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, []);

  const ciclos = useMemo(
    () =>
      suscripciones
        .flatMap((suscripcion) =>
          suscripcion.ciclos.map((ciclo) => ({ suscripcion, ciclo })),
        )
        .filter(({ ciclo }) => ciclo.fechaProgramada.slice(0, 7) === mes)
        .sort((a, b) =>
          a.ciclo.fechaProgramada.localeCompare(b.ciclo.fechaProgramada),
        ),
    [mes, suscripciones],
  );

  async function saltar(idSuscripcion: number, numCiclo: number) {
    const llave = `${idSuscripcion}-${numCiclo}`;
    if (
      !window.confirm(
        `¿Saltar la entrega del ciclo #${numCiclo}? No se registrará un cobro.`,
      )
    )
      return;
    setAccion(llave);
    setError(null);
    setMensaje(null);
    try {
      await saltarEntrega(idSuscripcion, numCiclo);
      setMensaje(`Se saltó la entrega del ciclo #${numCiclo}.`);
      await cargar();
    } catch (e) {
      setError(mensajeDeError(e, "No se pudo saltar la entrega."));
    } finally {
      setAccion(null);
    }
  }

  return (
    <section className="gc-operaciones">
      <header>
        <h1>Calendario e historial de entregas</h1>
        <p>Consulta las entregas programadas y pasadas de tus suscripciones.</p>
      </header>
      <label className="gc-operaciones__filtro">
        Mes
        <input
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
        />
      </label>
      {cargando && <Cargando />}
      {error && (
        <MensajeError mensaje={error} onReintentar={() => void cargar()} />
      )}
      {mensaje && (
        <p className="gc-operaciones__mensaje" role="status">
          {mensaje}
        </p>
      )}
      {!cargando &&
        !error &&
        (ciclos.length === 0 ? (
          <p>No hay ciclos de entrega registrados para este mes.</p>
        ) : (
          <div className="gc-operaciones__tabla-contenedor">
            <table className="gc-operaciones__tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Suscripción</th>
                  <th>Ciclo</th>
                  <th>Entrega</th>
                  <th>Cobro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ciclos.map(({ suscripcion, ciclo }) => {
                  const pagada = ciclo.cobro?.estado === "PAGADO";
                  const llave = `${suscripcion.id}-${ciclo.numCiclo}`;
                  const puedeSaltar =
                    ciclo.entrega?.estadoEntrega === "PROGRAMADA" &&
                    !pagada &&
                    suscripcion.estadoSuscripcion !== "CANCELADA";
                  return (
                    <tr key={`${suscripcion.id}-${ciclo.numCiclo}`}>
                      <td>
                        <time dateTime={ciclo.fechaProgramada}>
                          {fecha.format(new Date(ciclo.fechaProgramada))}
                        </time>
                      </td>
                      <td>
                        <Link to={`/suscripciones/${suscripcion.id}`}>
                          #{suscripcion.id}
                        </Link>
                      </td>
                      <td>#{ciclo.numCiclo}</td>
                      <td>{ciclo.entrega?.estadoEntrega ?? "Sin entrega"}</td>
                      <td>{ciclo.cobro?.estado ?? "Sin cobro"}</td>
                      <td>
                        {puedeSaltar ? (
                          <button
                            type="button"
                            disabled={accion !== null}
                            onClick={() =>
                              void saltar(suscripcion.id, ciclo.numCiclo)
                            }
                          >
                            {accion === llave ? "Guardando…" : "Saltar entrega"}
                          </button>
                        ) : (
                          <span aria-label="Sin acciones">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      {usuario?.rol === "ADMINISTRADOR" && (
        <p>
          <Link to="/administracion">
            Ir al panel administrativo de ciclos y cobros
          </Link>
        </p>
      )}
    </section>
  );
}
