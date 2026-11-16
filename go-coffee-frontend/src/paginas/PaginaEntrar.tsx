import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSesion } from '../sesion/SesionContext.tsx';
import { mensajeDeError } from '../servicios/api.ts';
import "../assets/css/PaginaEntrar.css";


export function PaginaEntrar() {
  const { entrar } = useSesion();
  const navegar = useNavigate();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null); // limpia el error del intento anterior
    setEnviando(true);
    try {
      await entrar(correo, password);
      navegar('/planes');
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudo iniciar sesión.'));
    } finally {
      setEnviando(false); // salga bien o mal, se vuelve a habilitar el botón
    }
  }

  return (
    <section className="gc-auth-page">
      <div className="gc-auth-card">
        <header className="gc-auth-header">
          <span className="gc-auth-eyebrow">☕ Bienvenido de nuevo</span>
          <h1 className="gc-auth-title">Inicia sesión</h1>
          <p className="gc-auth-subtitle">
            Ingresa a tu cuenta de GO_COFFEE para gestionar tu suscripción y
            entregas.
          </p>
        </header>

        {error && (
          <div className="gc-auth-alert is-error" role="alert">
            {error}
          </div>
        )}

        <form className="gc-auth-form" onSubmit={enviar}>
          <div className="gc-form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>

          <div className="gc-form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="gc-auth-submit"
            disabled={enviando}
          >
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <footer className="gc-auth-footer">
          <p>
            ¿Aún no tienes cuenta?{" "}
            <Link to="/registrar" className="gc-auth-link">
              Regístrate aquí
            </Link>
          </p>
        </footer>
      </div>
    </section>
  );
}
