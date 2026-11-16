import type { Sesion, Usuario } from "../tipos/tipos";
import * as servicio from '../servicios/sesion.ts';
import { createContext, useContext, useState, type ReactNode } from 'react';

interface ValorSesion {
  token: string | null;
  usuario: Usuario | null;
  entrar: (correo: string, password: string) => Promise<void>;
  registrar: (correo: string, password: string) => Promise<void>;
  salir: () => void;
}

const SesionContext = createContext<ValorSesion | null>(null);

function leerSesion(): Sesion | null {
  const token = localStorage.getItem('token');
  const guardado = localStorage.getItem('usuario');
  if (!token || !guardado) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    return null;
  }

  try {
    const usuario: unknown = JSON.parse(guardado);
    if (
      typeof usuario === 'object' &&
      usuario !== null &&
      'email' in usuario &&
      typeof usuario.email === 'string' &&
      'idUsuario' in usuario &&
      typeof usuario.idUsuario === 'number' &&
      'rol' in usuario &&
      (usuario.rol === 'CLIENTE' ||
        usuario.rol === 'ADMINISTRADOR')
    ) {
      return {
        token,
        usuario: { 
          idUsuario: usuario.idUsuario,
          email: usuario.email,
          rol: usuario.rol,
        },
      };
    }
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }

  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  return null;
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion);

  function guardar(sesion: Sesion) {
    localStorage.setItem('token', sesion.token);
    localStorage.setItem('usuario', JSON.stringify(sesion.usuario));
    setSesion(sesion);
  }

  async function entrar(correo: string, password: string) {
    guardar(await servicio.entrar(correo, password));
  }

  async function registrar(correo: string, password: string) {
    guardar(await servicio.registrar(correo, password));
  }

  function salir() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setSesion(null);
  }

  return (
    <SesionContext
      value={{
        token: sesion?.token ?? null,
        usuario: sesion?.usuario ?? null,
        entrar,
        registrar,
        salir,
      }}
    >
      {children}
    </SesionContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSesion() {
  const valor = useContext(SesionContext);
  if (!valor) throw new Error('useSesion() tiene que usarse dentro de <ProveedorSesion>');
  return valor;
}
