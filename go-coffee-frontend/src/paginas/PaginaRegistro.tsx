import React, { useState } from "react";
import { Link} from "react-router-dom";
import "../assets/css/PaginaRegistro.css";

interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
  confirmarPassword: string;
}

export function PaginaRegistro() {

  const [form, setForm] = useState<DatosRegistro>({
    nombre: "",
    email: "",
    password: "",
    confirmarPassword: "",
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

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (form.password !== form.confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    setError(null);
  };

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

          <form className="gc-auth-form" onSubmit={handleSubmit}>
            <div className="gc-form-group">
              <label htmlFor="nombre">Nombre completo</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                placeholder="Ej. Ana García"
                value={form.nombre}
                onChange={handleChange}
                disabled={cargando}
              />
            </div>

            <div className="gc-form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                required
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
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
                disabled={cargando}
              />
            </div>

            <div className="gc-form-group">
              <label htmlFor="confirmarPassword">Confirmar contraseña</label>
              <input
                id="confirmarPassword"
                name="confirmarPassword"
                type="password"
                required
                placeholder="Repite tu contraseña"
                value={form.confirmarPassword}
                onChange={handleChange}
                disabled={cargando}
              />
            </div>

            <button
              type="submit"
              className="gc-auth-submit"
              disabled={cargando}
            >
              {cargando ? "Creando cuenta..." : "Registrarme"}
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