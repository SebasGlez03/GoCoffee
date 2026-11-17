import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { aErrorApi } from '../compartido/api/errores';
import { Aviso } from '../compartido/componentes/Aviso';
import { atributosCampo } from '../compartido/componentes/atributosCampo';
import { Campo } from '../compartido/componentes/Campo';
import { correo, enfocarPrimerError, requerido, validar, type Errores } from '../compartido/validacion';
import { destinoSeguro } from './destino';
import { useSesion } from './SesionContext';
import './sesion.css';

type CampoEntrar = 'email' | 'password';

export function PaginaEntrar() {
  const { usuario, entrar, aviso, descartarAviso } = useSesion();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const desde = (ubicacion.state as { desde?: unknown } | null)?.desde;
  const destino = destinoSeguro(desde);

  const [valores, setValores] = useState<Record<CampoEntrar, string>>({ email: '', password: '' });
  const [errores, setErrores] = useState<Errores<CampoEntrar>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (usuario && !enviando) return <Navigate to={destino} replace />;

  function cambiar(campo: CampoEntrar, valor: string) {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const nuevos = validar(valores, {
      email: [requerido('Escribe tu correo.'), correo],
      password: [requerido('Escribe tu contraseña.')],
    });
    setErrores(nuevos);
    setErrorGeneral(null);
    if (Object.keys(nuevos).length > 0) {
      enfocarPrimerError(nuevos);
      return;
    }
    setEnviando(true);
    try {
      await entrar({ email: valores.email.trim(), password: valores.password });
      navegar(destino, { replace: true });
    } catch (error) {
      setErrorGeneral(aErrorApi(error).message);
      setEnviando(false);
    }
  }

  return (
    <section className="gc-auth">
      <div className="gc-auth__tarjeta">
        <header className="gc-auth__encabezado">
          <span className="gc-pagina__etiqueta">☕ Bienvenido de nuevo</span>
          <h1>Inicia sesión</h1>
          <p>Entra a tu cuenta para administrar tus suscripciones, entregas y cobros.</p>
        </header>

        {aviso && (
          <Aviso tono="advertencia" onCerrar={descartarAviso}>
            {aviso}
          </Aviso>
        )}
        {!aviso && typeof desde === 'string' && (
          <Aviso tono="info">Inicia sesión para continuar; te regresaremos a donde ibas.</Aviso>
        )}
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
          <Campo id="password" etiqueta="Contraseña" error={errores.password}>
            <input
              {...atributosCampo('password', errores.password)}
              type="password"
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={valores.password}
              onChange={(e) => cambiar('password', e.target.value)}
              disabled={enviando}
            />
          </Campo>
          <button type="submit" className="gc-boton gc-boton--bloque" disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <footer className="gc-auth__pie">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registrar" state={{ desde }}>
            Regístrate aquí
          </Link>
        </footer>
      </div>
    </section>
  );
}
