import type { Sesion, Usuario } from '../tipos/tipos.ts';
import { api, type Sobre } from './api.ts'; 

interface RespuestaToken {
  access_token: string;
  user: Usuario;
}

export async function entrar(correo: string, password: string): Promise<Sesion> {
  const r = await api.post<Sobre<RespuestaToken>>('/auth/login', { email: correo, password });
  return { token: r.data.data.access_token, usuario: r.data.data.user };
}

export async function registrar(correo: string, password: string): Promise<Sesion> {
  await api.post<Sobre<Usuario>>('/auth/register', { email: correo, password });
  return entrar(correo, password);
}
