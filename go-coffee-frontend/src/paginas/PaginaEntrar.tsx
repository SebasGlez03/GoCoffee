import React, { useState } from "react";
import { Link} from "react-router-dom";
import "../assets/css/PaginaEntrar.css";
interface DatosLogin {
  email: string;
  password: string;
}

export function PaginaEntrar() {

  const [form, setForm] = useState<DatosLogin>({
    email: "",
    password: "",
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

  };

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

        <form className="gc-auth-form" onSubmit={handleSubmit}>
          <div className="gc-form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={handleChange}
              disabled={cargando}
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
              value={form.password}
              onChange={handleChange}
              disabled={cargando}
            />
          </div>

          <button
            type="submit"
            className="gc-auth-submit"
            disabled={cargando}
          >
            {cargando ? "Iniciando sesión..." : "Entrar"}
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
