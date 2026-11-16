import axios from 'axios';

export const URL_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: URL_API,
  timeout: 5000,
});

export interface Sobre<T> {
  data: T;
}

export function mensajeDeError(e: unknown, generico: string): string {
  if (axios.isAxiosError(e)) {
    if (e.response?.status === 401 && e.config?.url !== '/auth/login') {
      return 'Tu sesión terminó. Vuelve a entrar.';
    }
    const mensaje = e.response?.data?.message; // 400 trae un arreglo; 404 y 409, un texto
    if (Array.isArray(mensaje)) return mensaje.join('. ');
    if (typeof mensaje === 'string') return mensaje;
  }
  return generico;
}