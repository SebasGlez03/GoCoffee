import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { aErrorApi } from '../compartido/api/errores';
import { Aviso } from '../compartido/componentes/Aviso';
import { atributosCampo } from '../compartido/componentes/atributosCampo';
import { Campo } from '../compartido/componentes/Campo';
import { correo, enfocarPrimerError, minimo, requerido, validar, type Errores } from '../compartido/validacion';
import { destinoSeguro } from './destino';
import { useSesion } from './SesionContext';
import './sesion.css';

type CampoRegistro = 'email' | 'password' | 'confirmacion';

export function PaginaRegistro() {
  const { usuario, registrar } = useSesion();
  const navegar = useNavigate();
  const desde = (useLocation().state as { desde?: unknown } | null)?.desde;
  const destino = destinoSeguro(desde, '/planes');

  const [valores, setValores] = useState<Record<CampoRegistro, string>>({
    email: '',
    password: '',
    confirmacion: '',
  });
  const [errores, setErrores] = useState<Errores<CampoRegistro>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (usuario && !enviando) return <Navigate to={destino} replace />;

  function cambiar(campo: CampoRegistro, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const nuevos = validar(valores, {
      email: [requerido('Escribe tu correo.'), correo],
      password: [
        requerido('Crea una contraseña.'),
        minimo(6, 'La contraseña debe tener al menos 6 caracteres.'),
      ],
      confirmacion: [
        requerido('Vuelve a escribir la contraseña.'),
        (v) => (v === valores.password ? null : 'Las contraseñas no coinciden.'),
      ],
    });
    setErrores(nuevos);
    setErrorGeneral(null);
    if (Object.keys(nuevos).length > 0) {
      enfocarPrimerError(nuevos);
      return;
    }
    setEnviando(true);
    try {
      await registrar({ email: valores.email.trim(), password: valores.password });
      navegar(destino, { replace: true });
    } catch (error) {
      const errorApi = aErrorApi(error);
      if (errorApi.estado === 409) {
        setErrores({ email: 'Ese correo ya tiene una cuenta. Inicia sesión con él.' });
        document.getElementById('email')?.focus();
      } else {
        setErrorGeneral(errorApi.message);
      }
      setEnviando(false);
    }
  }

  return (
    <section className="gc-auth">
      <div className="gc-auth__tarjeta">
        <header className="gc-auth__encabezado">
          <span className="gc-pagina__etiqueta">☕ Únete a GoCoffee</span>
          <h1>Crea tu cuenta</h1>
          <p>Regístrate para suscribirte y recibir café recién tostado en tu casa.</p>
        </header>

        {errorGeneral && <Aviso tono="error">{errorGeneral}</Aviso>}

        <form className="gc-formulario" onSubmit={enviar} noValidate>
          <Campo id="email" etiqueta="Correo electrónico" error={errores.email}>
            <input
              {...atributosCampo('email', errores.email)}
              type="email"
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              value={valores.email}
              onChange={(e) => cambiar('email', e.target.value)}
              disabled={enviando}
            />
          </Campo>
          <Campo id="password" etiqueta="Contraseña" error={errores.password} ayuda="Mínimo 6 caracteres.">
            <input
              {...atributosCampo('password', errores.password, 'Mínimo 6 caracteres.')}
              type="password"
              autoComplete="new-password"
              value={valores.password}
              onChange={(e) => cambiar('password', e.target.value)}
              disabled={enviando}
            />
          </Campo>
          <Campo id="confirmacion" etiqueta="Confirma tu contraseña" error={errores.confirmacion}>
            <input
              {...atributosCampo('confirmacion', errores.confirmacion)}
              type="password"
              autoComplete="new-password"
              value={valores.confirmacion}
              onChange={(e) => cambiar('confirmacion', e.target.value)}
              disabled={enviando}
            />
          </Campo>
          <button type="submit" className="gc-boton gc-boton--bloque" disabled={enviando}>
            {enviando ? 'Creando tu cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <footer className="gc-auth__pie">
          ¿Ya tienes cuenta?{' '}
          <Link to="/entrar" state={{ desde }}>
            Inicia sesión
          </Link>
        </footer>
      </div>
    </section>
  );
}
