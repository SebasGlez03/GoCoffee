import { useState, type FormEvent } from 'react';
import { Aviso } from '../compartido/componentes/Aviso';
import { atributosCampo } from '../compartido/componentes/atributosCampo';
import { Campo } from '../compartido/componentes/Campo';
import { Cargando } from '../compartido/componentes/Cargando';
import { MensajeError } from '../compartido/componentes/MensajeError';
import { NOMBRE_MARCA, fecha } from '../compartido/formato';
import { useAccion } from '../compartido/hooks/useAccion';
import { useConsulta } from '../compartido/hooks/useConsulta';
import type { MarcaTarjeta, MetodoPago } from '../compartido/tipos';
import { enfocarPrimerError, minimo, patron, requerido, validar, type Errores } from '../compartido/validacion';
import { guardarMetodoPago, traerMetodoPago } from './cobros.servicio';

const MARCAS: MarcaTarjeta[] = ['VISA', 'MASTERCARD', 'AMEX', 'OTRA'];

export function FormularioMetodoPago() {
  const metodo = useConsulta('metodo-pago', traerMetodoPago);

  return (
    <section className="gc-tarjeta" aria-labelledby="titulo-metodo">
      <h2 id="titulo-metodo">Método de pago</h2>
      {metodo.cargando && <Cargando texto="Cargando tu método de pago…" />}
      {metodo.error && <MensajeError error={metodo.error} onReintentar={metodo.reintentar} />}
      {!metodo.cargando && !metodo.error && (
        <Formulario actual={metodo.datos} alGuardar={metodo.actualizar} />
      )}
    </section>
  );
}

type CampoPago = 'titular' | 'marca' | 'ultimos4';

function Formulario({ actual, alGuardar }: { actual: MetodoPago | null; alGuardar: (m: MetodoPago) => void }) {
  const accion = useAccion();
  const [valores, setValores] = useState<Record<CampoPago, string>>({
    titular: actual?.titular ?? '',
    marca: actual?.marca ?? 'VISA',
    ultimos4: actual?.ultimos4 ?? '',
  });
  const [errores, setErrores] = useState<Errores<CampoPago>>({});

  function cambiar(campo: CampoPago, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const nuevos = validar(valores, {
      titular: [requerido('Escribe el nombre como aparece en la tarjeta.'), minimo(2, 'Escribe el nombre completo del titular.')],
      ultimos4: [requerido('Escribe los últimos 4 dígitos.'), patron(/^\d{4}$/, 'Deben ser exactamente 4 números.')],
    });
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) {
      enfocarPrimerError(nuevos);
      return;
    }
    const guardado = await accion.ejecutar(
      'guardar',
      () =>
        guardarMetodoPago({
          titular: valores.titular.trim(),
          marca: valores.marca as MarcaTarjeta,
          ultimos4: valores.ultimos4,
        }),
      'Guardamos tu método de pago.',
    );
    if (guardado) alGuardar(guardado);
  }

  return (
    <form className="gc-formulario" onSubmit={enviar} noValidate>
      {actual ? (
        <p className="gc-metodo-actual">
          <span aria-hidden="true">💳</span> {NOMBRE_MARCA[actual.marca]} terminada en <strong>{actual.ultimos4}</strong>
          <span className="gc-texto-suave"> · actualizada el {fecha(actual.actualizadoEn)}</span>
        </p>
      ) : (
        <Aviso tono="advertencia">Aún no registras un método de pago.</Aviso>
      )}
      {accion.exito && <Aviso tono="exito">{accion.exito}</Aviso>}
      {accion.error && <Aviso tono="error">{accion.error}</Aviso>}

      <Campo id="titular" etiqueta="Titular de la tarjeta" error={errores.titular}>
        <input
          {...atributosCampo('titular', errores.titular)}
          autoComplete="cc-name"
          value={valores.titular}
          onChange={(e) => cambiar('titular', e.target.value)}
          disabled={accion.ocupado}
        />
      </Campo>
      <div className="gc-formulario__fila">
        <Campo id="marca" etiqueta="Marca">
          <select
            {...atributosCampo('marca')}
            value={valores.marca}
            onChange={(e) => cambiar('marca', e.target.value)}
            disabled={accion.ocupado}
          >
            {MARCAS.map((m) => (
              <option key={m} value={m}>
                {NOMBRE_MARCA[m]}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="ultimos4" etiqueta="Últimos 4 dígitos" error={errores.ultimos4}>
          <input
            {...atributosCampo('ultimos4', errores.ultimos4)}
            inputMode="numeric"
            maxLength={4}
            placeholder="1234"
            value={valores.ultimos4}
            onChange={(e) => cambiar('ultimos4', e.target.value.replace(/\D/g, ''))}
            disabled={accion.ocupado}
          />
        </Campo>
      </div>
      <p className="gc-texto-suave gc-texto-chico">
        Por seguridad solo guardamos el titular, la marca y los últimos 4 dígitos. Nunca pedimos el número
        completo ni el código de seguridad.
      </p>
      <button type="submit" className="gc-boton" disabled={accion.ocupado}>
        {accion.ocupado ? 'Guardando…' : actual ? 'Actualizar método de pago' : 'Guardar método de pago'}
      </button>
    </form>
  );
}
