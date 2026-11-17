import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Cargando } from "../componentes/Cargando";
import { MensajeError } from "../componentes/MensajeError";
import { mensajeDeError } from "../servicios/api";
import {
  guardarMetodoPago,
  traerHistorialCobros,
  traerMetodoPago,
} from "../servicios/goCoffee";
import type { Cobro, MetodoPago } from "../tipos/tipos";
import "../assets/css/Operaciones.css";

const fecha = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeZone: "UTC",
});
const moneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export function PaginaCobros() {
  const [metodo, setMetodo] = useState<MetodoPago | null>(null);
  const [historial, setHistorial] = useState<Cobro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [metodoActual, cobros] = await Promise.all([
        traerMetodoPago(),
        traerHistorialCobros(),
      ]);
      setMetodo(metodoActual);
      setHistorial(cobros);
    } catch (e) {
      setError(
        mensajeDeError(e, "No se pudo cargar la información de cobros."),
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let vigente = true;
    Promise.all([traerMetodoPago(), traerHistorialCobros()])
      .then(([metodoActual, cobros]) => {
        if (vigente) {
          setMetodo(metodoActual);
          setHistorial(cobros);
        }
      })
      .catch((e) => {
        if (vigente)
          setError(
            mensajeDeError(e, "No se pudo cargar la información de cobros."),
          );
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, []);

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    setGuardando(true);
    setError(null);
    setMensaje(null);
    try {
      const actualizado = await guardarMetodoPago({
        titular: String(datos.get("titular")),
        marca: String(datos.get("marca")) as MetodoPago["marca"],
        ultimos4: String(datos.get("ultimos4")),
      });
      setMetodo(actualizado);
      setMensaje("Se actualizaron los datos de pago.");
    } catch (e) {
      setError(
        mensajeDeError(e, "No se pudieron actualizar los datos de pago."),
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="gc-operaciones">
      <header>
        <h1>Cobros y método de pago</h1>
        <p>
          Consulta los cobros registrados y corrige los datos visibles de tu
          método de pago.
        </p>
      </header>
      <aside className="gc-operaciones__aviso">
        Modo manual/demo: GoCoffee no procesa pagos y no almacena el número
        completo de tarjeta ni el CVV. Solo se guarda el titular, la marca y los
        últimos cuatro dígitos.
      </aside>
      {cargando && <Cargando />}
      {error && (
        <MensajeError mensaje={error} onReintentar={() => void cargar()} />
      )}
      {mensaje && (
        <p className="gc-operaciones__mensaje" role="status">
          {mensaje}
        </p>
      )}
      {!cargando && (
        <>
          <form
            className="gc-operaciones__formulario"
            onSubmit={(e) => void guardar(e)}
          >
            <h2>
              {metodo ? "Corregir método de pago" : "Registrar método de pago"}
            </h2>
            <label>
              Titular
              <input
                name="titular"
                required
                minLength={2}
                maxLength={100}
                defaultValue={metodo?.titular ?? ""}
              />
            </label>
            <label>
              Marca
              <select name="marca" defaultValue={metodo?.marca ?? "VISA"}>
                <option value="VISA">Visa</option>
                <option value="MASTERCARD">Mastercard</option>
                <option value="AMEX">American Express</option>
                <option value="OTRA">Otra</option>
              </select>
            </label>
            <label>
              Últimos 4 dígitos
              <input
                name="ultimos4"
                required
                pattern="\d{4}"
                inputMode="numeric"
                maxLength={4}
                defaultValue={metodo?.ultimos4 ?? ""}
              />
            </label>
            <button type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar datos de pago"}
            </button>
          </form>

          <h2>Historial de cobros</h2>
          {historial.length === 0 ? (
            <p>Aún no hay cobros registrados.</p>
          ) : (
            <div className="gc-operaciones__tabla-contenedor">
              <table className="gc-operaciones__tabla">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Suscripción</th>
                    <th>Ciclo</th>
                    <th>Estado</th>
                    <th>Monto</th>
                    <th>Referencia</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((cobro) => (
                    <tr key={cobro.idCobro}>
                      <td>{fecha.format(new Date(cobro.fechaCobro))}</td>
                      <td>
                        {cobro.ciclo?.suscripcion
                          ? `#${cobro.ciclo.suscripcion.idSuscripcion}`
                          : "—"}
                      </td>
                      <td>{cobro.ciclo ? `#${cobro.ciclo.numCiclo}` : "—"}</td>
                      <td>{cobro.estadoCobro}</td>
                      <td>
                        {cobro.monto === null
                          ? "—"
                          : moneda.format(cobro.monto)}
                      </td>
                      <td>{cobro.referencia ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
