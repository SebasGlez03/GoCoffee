import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router';
import { aErrorApi } from '../compartido/api/errores';
import { Aviso } from '../compartido/componentes/Aviso';
import { atributosCampo } from '../compartido/componentes/atributosCampo';
import { Campo } from '../compartido/componentes/Campo';
import { NOMBRE_DIA, NOMBRE_MARCA, fechaLarga, moneda } from '../compartido/formato';
import { useConsulta } from '../compartido/hooks/useConsulta';
import type { DiaSemana, Plan, Suscripcion } from '../compartido/tipos';
import { enfocarPrimerError, patron, requerido, validar, type Errores } from '../compartido/validacion';
import { traerMetodoPago } from '../cobros/cobros.servicio';
import { useSesion } from '../sesion/SesionContext';
import { crearSuscripcion } from '../suscripciones/suscripciones.servicio';
import { ESTADOS_MEXICO } from './estadosMexico';

/** Orden de getDay(): 0 = domingo. */
const DIAS_JS: DiaSemana[] = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
const DIAS_FORMULARIO: DiaSemana[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

/** Próxima fecha (a partir de mañana) que cae en el día elegido. */
function proximaFecha(dia: DiaSemana): Date {
  const fecha = new Date();
  const diferencia = (DIAS_JS.indexOf(dia) - fecha.getDay() + 7) % 7 || 7;
  fecha.setDate(fecha.getDate() + diferencia);
  fecha.setHours(0, 0, 0, 0);
  return fecha;
}

type CampoDireccion = 'calle' | 'colonia' | 'numeroCasa' | 'numeroInterior' | 'codigoPostal' | 'estado';

const VACIO: Record<CampoDireccion, string> = {
  calle: '',
  colonia: '',
  numeroCasa: '',
  numeroInterior: '',
  codigoPostal: '',
  estado: '',
};

export function FormularioSuscripcion({ plan }: { plan: Plan & { idPlan: number } }) {
  const { usuario } = useSesion();
  const { pathname } = useLocation();
  const [dia, setDia] = useState<DiaSemana>('LUNES');
  const [valores, setValores] = useState(VACIO);
  const [errores, setErrores] = useState<Errores<CampoDireccion>>({});
  const [errorEnvio, setErrorEnvio] = useState<{ texto: string; duplicada: boolean } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [creada, setCreada] = useState<Suscripcion | null>(null);

  if (creada) return <ConfirmacionSuscripcion suscripcion={creada} plan={plan} />;

  if (!usuario) {
    return (
      <section className="gc-tarjeta gc-detalle-plan__formulario">
        <h2>Suscríbete a {plan.nombre}</h2>
        <p className="gc-texto-suave">
          Para elegir tu dirección y día de entrega necesitas una cuenta. Al entrar regresarás a esta
          misma página.
        </p>
        <div className="gc-acciones">
          <Link className="gc-boton" to="/entrar" state={{ desde: pathname }}>
            Iniciar sesión para suscribirme
          </Link>
          <Link className="gc-boton gc-boton--secundario" to="/registrar" state={{ desde: pathname }}>
            Crear una cuenta
          </Link>
        </div>
      </section>
    );
  }

  function cambiar(campo: CampoDireccion, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const nuevos = validar(valores, {
      calle: [requerido('Escribe la calle.')],
      colonia: [requerido('Escribe la colonia.')],
      numeroCasa: [requerido('Escribe el número exterior (o S/N).')],
      codigoPostal: [
        requerido('Escribe el código postal.'),
        patron(/^\d{5}$/, 'El código postal debe tener 5 dígitos.'),
      ],
      estado: [requerido('Elige el estado.')],
    });
    setErrores(nuevos);
    setErrorEnvio(null);
    if (Object.keys(nuevos).length > 0) {
      enfocarPrimerError(nuevos);
      return;
    }
    setEnviando(true);
    try {
      const v = valores;
      const suscripcion = await crearSuscripcion({
        planId: plan.idPlan,
        diaSemanaEntrega: dia,
        fechaInicio: proximaFecha(dia).toISOString(),
        estadoSuscripcion: 'ACTIVA',
        direccionEntrega: {
          calle: `${v.calle.trim()}, colonia ${v.colonia.trim()}`,
          numeroCasa: v.numeroInterior.trim()
            ? `${v.numeroCasa.trim()}, interior ${v.numeroInterior.trim()}`
            : v.numeroCasa.trim(),
          codigoPostal: v.codigoPostal.trim(),
          estado: v.estado,
        },
      });
      setCreada(suscripcion);
    } catch (error) {
      const errorApi = aErrorApi(error);
      setErrorEnvio({ texto: errorApi.message, duplicada: errorApi.codigo === 'SuscripcionDuplicadaError' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="gc-tarjeta gc-detalle-plan__formulario gc-formulario" onSubmit={enviar} noValidate>
      <h2>Configura tu entrega</h2>
      <p className="gc-texto-suave">
        La suscripción quedará a nombre de <strong>{usuario.email}</strong>.
      </p>

      {errorEnvio && (
        <Aviso tono="error">
          {errorEnvio.texto}{' '}
          {errorEnvio.duplicada && <Link to="/suscripciones">Ir a mis suscripciones</Link>}
        </Aviso>
      )}

      <fieldset className="gc-formulario__grupo" disabled={enviando}>
        <legend>Dirección de entrega</legend>
        <Campo id="calle" etiqueta="Calle" error={errores.calle}>
          <input
            {...atributosCampo('calle', errores.calle)}
            autoComplete="address-line1"
            placeholder="Ej. Av. Principal"
            value={valores.calle}
            onChange={(e) => cambiar('calle', e.target.value)}
          />
        </Campo>
        <Campo id="colonia" etiqueta="Colonia" error={errores.colonia}>
          <input
            {...atributosCampo('colonia', errores.colonia)}
            placeholder="Ej. Centro"
            value={valores.colonia}
            onChange={(e) => cambiar('colonia', e.target.value)}
          />
        </Campo>
        <div className="gc-formulario__fila">
          <Campo id="numeroCasa" etiqueta="Número exterior" error={errores.numeroCasa}>
            <input
              {...atributosCampo('numeroCasa', errores.numeroCasa)}
              placeholder="Ej. 123 o S/N"
              value={valores.numeroCasa}
              onChange={(e) => cambiar('numeroCasa', e.target.value)}
            />
          </Campo>
          <Campo id="numeroInterior" etiqueta="Interior (opcional)">
            <input
              {...atributosCampo('numeroInterior')}
              placeholder="Ej. Depto 4"
              value={valores.numeroInterior}
              onChange={(e) => cambiar('numeroInterior', e.target.value)}
            />
          </Campo>
        </div>
        <div className="gc-formulario__fila">
          <Campo id="codigoPostal" etiqueta="Código postal" error={errores.codigoPostal}>
            <input
              {...atributosCampo('codigoPostal', errores.codigoPostal)}
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={5}
              placeholder="83000"
              value={valores.codigoPostal}
              onChange={(e) => cambiar('codigoPostal', e.target.value.replace(/\D/g, ''))}
            />
          </Campo>
          <Campo id="estado" etiqueta="Estado" error={errores.estado}>
            <select
              {...atributosCampo('estado', errores.estado)}
              value={valores.estado}
              onChange={(e) => cambiar('estado', e.target.value)}
            >
              <option value="">Elige un estado</option>
              {ESTADOS_MEXICO.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </Campo>
        </div>
      </fieldset>

      <fieldset className="gc-formulario__grupo" disabled={enviando}>
        <legend>Día de entrega</legend>
        <Campo id="dia" etiqueta="¿Qué día de la semana quieres recibirlo?">
          <select {...atributosCampo('dia')} value={dia} onChange={(e) => setDia(e.target.value as DiaSemana)}>
            {DIAS_FORMULARIO.map((d) => (
              <option key={d} value={d}>
                {NOMBRE_DIA[d]}
              </option>
            ))}
          </select>
        </Campo>
      </fieldset>

      <MetodoPagoResumen />

      <div className="gc-resumen" aria-live="polite">
        <p>
          Primera entrega: <strong>{fechaLarga(proximaFecha(dia).toISOString())}</strong>
        </p>
        <p>
          Pagarás <strong>{moneda(plan.precio)}</strong> por cada entrega que recibas.
        </p>
      </div>

      <button type="submit" className="gc-boton gc-boton--bloque" disabled={enviando}>
        {enviando ? 'Confirmando…' : 'Confirmar suscripción'}
      </button>
    </form>
  );
}

/** Muestra el método de pago registrado (caso de uso de alta: método de pago). */
function MetodoPagoResumen() {
  const metodo = useConsulta('metodo-pago', traerMetodoPago);
  const { pathname } = useLocation();
  if (metodo.cargando) return <p className="gc-texto-suave">Revisando tu método de pago…</p>;
  if (metodo.error) return null;
  if (!metodo.datos) {
    return (
      <Aviso tono="advertencia">
        Aún no registras un método de pago. Puedes suscribirte ahora y{' '}
        <Link to="/cobros" state={{ desde: pathname }}>
          registrarlo en Cobros
        </Link>{' '}
        antes de tu primera entrega.
      </Aviso>
    );
  }
  return (
    <Aviso tono="info">
      Se cobrará con tu tarjeta {NOMBRE_MARCA[metodo.datos.marca]} terminada en{' '}
      <strong>{metodo.datos.ultimos4}</strong>. <Link to="/cobros">Cambiar</Link>
    </Aviso>
  );
}

function ConfirmacionSuscripcion({ suscripcion, plan }: { suscripcion: Suscripcion; plan: Plan }) {
  const primera =
    [...suscripcion.ciclos].sort((a, b) => a.numCiclo - b.numCiclo)[0]?.fechaProgramada ??
    suscripcion.fechaInicio;
  return (
    <section className="gc-tarjeta gc-confirmacion" role="status">
      <span className="gc-confirmacion__icono" aria-hidden="true">
        ✅
      </span>
      <h2>¡Tu suscripción está activa!</h2>
      <p>
        Te suscribiste a <strong>{plan.nombre}</strong>. Tu primera entrega llega el{' '}
        <strong>{fechaLarga(primera)}</strong>.
      </p>
      <address className="gc-confirmacion__direccion">
        {suscripcion.direccionEntrega.calle} #{suscripcion.direccionEntrega.numeroCasa}
        <br />
        C.P. {suscripcion.direccionEntrega.codigoPostal}, {suscripcion.direccionEntrega.estado}
      </address>
      <div className="gc-acciones">
        <Link className="gc-boton" to={`/suscripciones/${suscripcion.id}`}>
          Ver mi suscripción
        </Link>
        <Link className="gc-boton gc-boton--secundario" to="/entregas">
          Ver calendario de entregas
        </Link>
      </div>
    </section>
  );
}
