import { useState } from "react";
import { usePlan } from "../hooks/UsePlan";
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { useSesion } from '../sesion/SesionContext.tsx';
import { MensajeError } from "../componentes/MensajeError";
import { Cargando } from "../componentes/Cargando";
import '../assets/css/PaginaDetallePlan.css';

/*interface Aviso {
  tipo: 'exito' | 'error';
  texto: string;
}*/

export function PaginaDetallePlan() {
  const { id } = useParams();
  const { plan, cargando, error, reintentar } = usePlan(Number(id));
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const { usuario } = useSesion();
  //const [aviso, setAviso] = useState<Aviso | null>(null);

  const [diaEntrega, setDiaEntrega] = useState<string>("LUNES");
  const [direccionEnvio, setDireccionEnvio] = useState<string>("");

  async function subscribirse(){
    if(!usuario){
      navegar('/entrar', { state: { desde: ubicacion.pathname } });
      return;
    }
    console.log("Subscrito")
  }


  if (cargando) return <Cargando />;
  if (error || !plan)
    return (
      <MensajeError
        mensaje={error ?? "No existe la clase."}
        onReintentar={reintentar}
      />
    );

  return (
    <>
      <div className="gc-detalle-container">
        {/* Botón de retorno */}
        <button type="button" className="gc-btn-regresar">
          <Link to="/planes" className="detalle__volver">
            ← Todos los planes
          </Link>
        </button>
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
          <form className="gc-detalle-form">
            <h2>Detalles de Entrega</h2>
             {/*aviso && <p className={`aviso aviso--${aviso.tipo}`}>{aviso.texto}</p>*/}
            <div className="gc-form-group">
              <label htmlFor="direccion">Dirección de envío:</label>
              <input
                id="direccion"
                type="text"
                required
                placeholder="Calle, número, colonia, C.P."
                value={direccionEnvio}
                onChange={(e) => setDireccionEnvio(e.target.value)}
              />
            </div>

            <div className="gc-form-group">
              <label htmlFor="dia">Día preferido de entrega:</label>
              <select
                id="dia"
                value={diaEntrega}
                onChange={(e) => setDiaEntrega(e.target.value)}
              >
                <option value="LUNES">Lunes</option>
                <option value="MIERCOLES">Miércoles</option>
                <option value="VIERNES">Viernes</option>
              </select>
            </div>

            <div className="gc-form-summary">
              <p>
                Podrás pausar, cambiar de plan o cancelar tus entregas desde tu
                portal en cualquier momento[cite: 1, 2].
              </p>
            </div>

            <button className="gc-btn-primary gc-btn-block" onClick={() => subscribirse()}>
              Confirmar y Suscribirme
            </button>
          </form>
        </div>
      </div>
    </>
  );
}