import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useSesion } from "../sesion/SesionContext.tsx";
import { mensajeDeError } from "../servicios/api.ts";
import "../assets/css/PaginaRegistro.css";

export function PaginaRegistro() {
  const { registrar } = useSesion();
  const navegar = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await registrar(correo, password);
      navegar("/planes");
    } catch (e) {
      // 400: los mensajes del DTO, juntos. 409: "Ese correo ya esta registrado".
      setError(mensajeDeError(e, "No se pudo crear la cuenta."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="gc-auth-page">
      <div className="gc-auth-card">
        <header className="gc-auth-header">
          <span className="gc-auth-eyebrow">☕ Únete a GO_COFFEE</span>
          <h1 className="gc-auth-title">Crea tu cuenta</h1>
          <p className="gc-auth-subtitle">
            Regístrate para configurar tu suscripción y recibir café recién
            tostado en casa.
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
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="gc-auth-submit" disabled={enviando}>
            {enviando ? 'Creando…' : 'Crear cuenta'}
          </button>
        </form>

        <footer className="gc-auth-footer">
          <p>
            ¿Ya tienes una cuenta?{" "}
            <Link to="/entrar" className="gc-auth-link">
              Inicia sesión aquí
            </Link>
          </p>
        </footer>
      </div>
    </section>
  );
}
