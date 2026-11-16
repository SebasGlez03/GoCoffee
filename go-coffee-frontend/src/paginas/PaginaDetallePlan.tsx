import { useRef, useState, type FormEvent } from "react";
import { usePlan } from "../hooks/UsePlan";
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { useSesion } from '../sesion/SesionContext.tsx';
import { MensajeError } from "../componentes/MensajeError";
import { Cargando } from "../componentes/Cargando";
import '../assets/css/PaginaDetallePlan.css';
import { subscribirse as crearSuscripcion } from '../servicios/goCoffee';
import { mensajeDeError } from '../servicios/api';
import type { DiaSemana, Suscripcion } from '../tipos/tipos';

const dias: DiaSemana[] = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

function proximaFecha(dia: DiaSemana) {
  const fecha = new Date();
  const diferencia = (dias.indexOf(dia) - fecha.getDay() + 7) % 7 || 7;
  fecha.setDate(fecha.getDate() + diferencia);
  fecha.setHours(0, 0, 0, 0);
  return fecha;
}

function mostrarFecha(fecha: Date | string) {
  return new Date(fecha).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function PaginaDetallePlan() {
  const { id } = useParams();
  return <DetallePlan key={id} id={Number(id)} />;
}

function DetallePlan({ id }: { id: number }) {
  const { plan, cargando, error, reintentar } = usePlan(id);
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const { usuario } = useSesion();

  const [diaEntrega, setDiaEntrega] = useState<DiaSemana>('LUNES');
  const [fechaInicio, setFechaInicio] = useState(() => proximaFecha('LUNES'));
  const [calle, setCalle] = useState('');
  const [colonia, setColonia] = useState('');
  const [numeroCasa, setNumeroCasa] = useState('');
  const [numeroInterior, setNumeroInterior] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [estado, setEstado] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState<Suscripcion | null>(null);
  const enCurso = useRef(false);

  async function subscribirse(e: FormEvent<HTMLFormElement>){
    e.preventDefault();
    if (enCurso.current || confirmacion || !plan) return;
    if(!usuario){
      navegar('/entrar', { state: { desde: ubicacion.pathname } });
      return;
    }
    if (![calle, colonia, numeroCasa, codigoPostal, estado].every((dato) => dato.trim())) {
      setErrorEnvio('Completa todos los datos de la dirección.');
      return;
    }
    enCurso.current = true;
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const inicio = proximaFecha(diaEntrega);
      setFechaInicio(inicio);
      const creada = await crearSuscripcion({
        planId: plan.idPlan,
        diaSemanaEntrega: diaEntrega,
        fechaInicio: inicio.toISOString(),
        direccionEntrega: {
          calle: `${calle.trim()}, colonia ${colonia.trim()}`,
          numeroCasa: numeroInterior.trim() ? `${numeroCasa.trim()}, interior ${numeroInterior.trim()}` : numeroCasa.trim(),
          codigoPostal: codigoPostal.trim(),
          estado: estado.trim(),
        },
        estadoSuscripcion: 'ACTIVA',
        ciclos: [],
      });
      setConfirmacion(creada);
    } catch (e) {
      setErrorEnvio(mensajeDeError(e, 'No se pudo confirmar la suscripción. Intenta de nuevo.'));
    } finally {
      enCurso.current = false;
      setEnviando(false);
    }
  }


  if (cargando) return <Cargando />;
  if (error || !plan)
    return (
      <MensajeError
        mensaje={error ?? "No existe el plan."}
        onReintentar={reintentar}
      />
    );

  if (confirmacion) return (
    <section className="gc-success-card" role="status">
      <span className="gc-success-icon" aria-hidden="true">☕</span>
      <h1>¡Tu suscripción está activa!</h1>
      <p>Te suscribiste a <strong>{plan.nombre}</strong>.</p>
      <p>Suscripción #{confirmacion.id} · Asociada a tu cuenta.</p>
      <p>Fecha de inicio: <strong>{mostrarFecha(confirmacion.fechaInicio)}</strong>.</p>
      <address className="gc-direccion-confirmada">
        <strong>Dirección de entrega</strong>
        <span>{confirmacion.direccionEntrega.calle}</span>
        <span>Número {confirmacion.direccionEntrega.numeroCasa}</span>
        <span>C.P. {confirmacion.direccionEntrega.codigoPostal}</span>
        <span>{confirmacion.direccionEntrega.estado}</span>
      </address>
      <Link to="/planes" className="gc-btn-primary">Volver a los planes</Link>
    </section>
  );

  return (
    <>
      <div className="gc-detalle-container">
        {/* Botón de retorno */}
          <Link to="/planes" className="gc-btn-regresar">
            ← Todos los planes
          </Link>
        <div className="gc-detalle-grid">
          {/* Columna Izquierda: Resumen del Plan */}
          <div className="gc-detalle-info">
            <span className="gc-detalle-eyebrow">Configura tu entrega</span>
            <h1 className="gc-detalle-title">{plan.nombre}</h1>

            <div className="gc-detalle-price-box">
              <span className="gc-detalle-price">
                ${plan.precio.toFixed(2)}
              </span>
              <span className="gc-detalle-period">/ {plan.frecuenciaEntrega}</span>
            </div>

            <ul className="gc-detalle-specs">
              <li>
                <span>☕ Cantidad:</span>
                <strong>
                  {plan.cantidadBolsas}{" "}
                  {plan.cantidadBolsas === 1 ? "bolsa" : "bolsas"} por entrega
                </strong>
              </li>
              <li>
                <span>📦 Envío:</span>
                <strong>Incluido a todo México</strong>
              </li>
            </ul>
          </div>

          {/* Columna Derecha: Formulario de Contratación */}
          <form className="gc-detalle-form" onSubmit={subscribirse} aria-busy={enviando}>
            <h2>Detalles de Entrega</h2>
            {usuario ? <p>La suscripción quedará asociada a <strong>{usuario.email}</strong>.</p> : (
              <p><Link to="/entrar" state={{ desde: ubicacion.pathname }}>Inicia sesión</Link> para confirmar tu suscripción.</p>
            )}
            {errorEnvio && <p className="gc-detalle-error" role="alert">{errorEnvio}</p>}
            <fieldset className="gc-detalle-campos" disabled={enviando}>
            <legend>Dirección de entrega</legend>
            <div className="gc-form-group">
              <label htmlFor="calle">Calle:</label>
              <input
                id="calle"
                autoComplete="section-entrega address-line1"
                type="text"
                required
                placeholder="Ej. Avenida Principal"
                value={calle}
                onChange={(e) => setCalle(e.target.value)}
              />
            </div>

            <div className="gc-form-group">
              <label htmlFor="colonia">Colonia:</label>
              <input id="colonia" autoComplete="section-entrega address-level3" required value={colonia} onChange={(e) => setColonia(e.target.value)} placeholder="Ej. Centro" />
            </div>
            <div className="gc-form-group">
              <label htmlFor="numeroCasa">Número exterior:</label>
              <input id="numeroCasa" required value={numeroCasa} onChange={(e) => setNumeroCasa(e.target.value)} placeholder="Ej. 123 o S/N" />
            </div>
            <div className="gc-form-group">
              <label htmlFor="numeroInterior">Número interior (opcional):</label>
              <input id="numeroInterior" value={numeroInterior} onChange={(e) => setNumeroInterior(e.target.value)} placeholder="Ej. Departamento 4" />
            </div>
            <div className="gc-form-group">
              <label htmlFor="codigoPostal">Código postal:</label>
              <input id="codigoPostal" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} title="Escribe los cinco dígitos del código postal." required value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} placeholder="83000" />
            </div>
            <div className="gc-form-group">
              <label htmlFor="estado">Estado:</label>
              <input id="estado" autoComplete="address-level1" required value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Sonora" />
            </div>
            <div className="gc-form-group">
              <label htmlFor="dia">Día preferido de entrega:</label>
              <select
                id="dia"
                value={diaEntrega}
                onChange={(e) => {
                  const dia = e.target.value as DiaSemana;
                  setDiaEntrega(dia);
                  setFechaInicio(proximaFecha(dia));
                }}
              >
                {dias.map((dia) => <option key={dia} value={dia}>{dia === 'MIERCOLES' ? 'Miércoles' : dia === 'SABADO' ? 'Sábado' : dia[0] + dia.slice(1).toLowerCase()}</option>)}
              </select>
            </div>

            </fieldset>
            <div className="gc-form-summary" aria-live="polite">
              <p>
                Tu suscripción comenzará el <strong>{mostrarFecha(fechaInicio)}</strong>, en la próxima fecha futura del día elegido.
              </p>
            </div>

            <button type="submit" className="gc-btn-primary gc-btn-block" disabled={enviando}>
              {enviando ? 'Confirmando…' : usuario ? 'Confirmar y suscribirme' : 'Iniciar sesión para suscribirme'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
