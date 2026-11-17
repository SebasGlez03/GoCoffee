import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { registrarAlExpirarSesion } from '../compartido/api/cliente';
import { almacen, tokenVencido } from '../compartido/api/token';
import type { CredencialesCuerpo, Usuario } from '../compartido/tipos';
import * as servicio from './sesion.servicio';

const AVISO_EXPIRADA = 'Tu sesión expiró. Vuelve a iniciar sesión para continuar.';

interface ValorSesion {
  usuario: Usuario | null;
  esAdministrador: boolean;
  /** Mensaje para el usuario cuando la sesión se cerró sola. */
  aviso: string | null;
  descartarAviso: () => void;
  entrar: (credenciales: CredencialesCuerpo) => Promise<void>;
  registrar: (credenciales: CredencialesCuerpo) => Promise<void>;
  salir: () => void;
}

const SesionContext = createContext<ValorSesion | null>(null);

function esUsuario(valor: unknown): valor is Usuario {
  if (typeof valor !== 'object' || valor === null) return false;
  const v = valor as Record<string, unknown>;
  return (
    typeof v.idUsuario === 'number' &&
    typeof v.email === 'string' &&
    (v.rol === 'CLIENTE' || v.rol === 'ADMINISTRADOR')
  );
}

function leerSesionGuardada(): { usuario: Usuario | null; aviso: string | null } {
  const token = almacen.leerToken();
  const guardado = almacen.leerUsuario();
  if (!token || !guardado) {
    almacen.borrar();
    return { usuario: null, aviso: null };
  }
  if (tokenVencido(token)) {
    almacen.borrar();
    return { usuario: null, aviso: AVISO_EXPIRADA };
  }
  try {
    const usuario: unknown = JSON.parse(guardado);
    if (esUsuario(usuario)) return { usuario, aviso: null };
  } catch {
    // dato dañado: se descarta abajo
  }
  almacen.borrar();
  return { usuario: null, aviso: null };
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const navegar = useNavigate();
  const [inicial] = useState(leerSesionGuardada);
  const [usuario, setUsuario] = useState<Usuario | null>(inicial.usuario);
  const [aviso, setAviso] = useState<string | null>(inicial.aviso);

  // Cuando el servicio responde 401, se cierra la sesión y se avisa.
  useEffect(() => {
    registrarAlExpirarSesion(() => {
      almacen.borrar();
      setUsuario(null);
      setAviso(AVISO_EXPIRADA);
      const desde = window.location.pathname + window.location.search;
      navegar('/entrar', { replace: true, state: { desde } });
    });
    return () => registrarAlExpirarSesion(null);
  }, [navegar]);

  const entrar = useCallback(async (credenciales: CredencialesCuerpo) => {
    const { access_token, user } = await servicio.iniciarSesion(credenciales);
    almacen.guardar(access_token, user);
    setUsuario(user);
    setAviso(null);
  }, []);

  const registrar = useCallback(
    async (credenciales: CredencialesCuerpo) => {
      await servicio.crearCuenta(credenciales);
      await entrar(credenciales);
    },
    [entrar],
  );

  const salir = useCallback(() => {
    // Primero se sale de la pantalla protegida y después se borra la sesión;
    // así RutaProtegida no manda al usuario a "Iniciar sesión".
    navegar('/planes');
    setTimeout(() => {
      almacen.borrar();
      setUsuario(null);
      setAviso(null);
    }, 0);
  }, [navegar]);

  return (
    <SesionContext
      value={{
        usuario,
        esAdministrador: usuario?.rol === 'ADMINISTRADOR',
        aviso,
        descartarAviso: () => setAviso(null),
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
