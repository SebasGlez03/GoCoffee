import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import type { RespuestaError, Sobre } from '../tipos';
import { ErrorApi, interpretarError } from './errores';
import { almacen } from './token';

/*
 * ÚNICO punto de comunicación con el servicio del Avance 2.
 * - La dirección del servicio se configura en .env (VITE_API_URL).
 * - Adjunta la credencial (Bearer) en cada petición.
 * - Abre el sobre { data, meta } de las respuestas exitosas.
 * - Convierte cualquier falla en un ErrorApi con mensaje para el usuario.
 * Ninguna pantalla importa axios: todas usan `api` a través de los
 * servicios de cada característica (planes.servicio.ts, etc.).
 */
export const URL_API = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

const http = axios.create({ baseURL: URL_API, timeout: 10000 });

http.interceptors.request.use((config) => {
  const token = almacen.leerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let alExpirarSesion: (() => void) | null = null;

/** SesionContext registra aquí qué hacer cuando la credencial ya no vale. */
export function registrarAlExpirarSesion(manejador: (() => void) | null) {
  alExpirarSesion = manejador;
}

http.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (!(error instanceof AxiosError)) {
      return Promise.reject(interpretarError(500, undefined));
    }
    const estado = error.response?.status ?? null;
    const errorApi = interpretarError(estado, error.response?.data as Partial<RespuestaError> | undefined);

    // 401 en una petición que llevaba credencial: la sesión venció.
    const llevabaToken =
      Boolean(error.config?.headers?.Authorization) && error.config?.url !== '/auth/login';
    if (estado === 401 && llevabaToken) alExpirarSesion?.();

    return Promise.reject(errorApi);
  },
);

async function pedir<T>(config: AxiosRequestConfig): Promise<T> {
  const respuesta = await http.request<Sobre<T>>(config);
  return respuesta.data.data; // se abre el sobre aquí y solo aquí
}

export const api = {
  obtener: <T>(ruta: string, params?: object) => pedir<T>({ method: 'GET', url: ruta, params }),
  crear: <T>(ruta: string, cuerpo?: unknown) => pedir<T>({ method: 'POST', url: ruta, data: cuerpo }),
  modificar: <T>(ruta: string, cuerpo?: unknown) => pedir<T>({ method: 'PATCH', url: ruta, data: cuerpo }),
  reemplazar: <T>(ruta: string, cuerpo?: unknown) => pedir<T>({ method: 'PUT', url: ruta, data: cuerpo }),
};

export { ErrorApi };
