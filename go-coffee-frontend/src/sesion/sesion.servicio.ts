import { api } from '../compartido/api/cliente';
import type { CredencialesCuerpo, RespuestaLogin, Usuario } from '../compartido/tipos';

export function iniciarSesion(credenciales: CredencialesCuerpo) {
  return api.crear<RespuestaLogin>('/auth/login', credenciales);
}

export function crearCuenta(credenciales: CredencialesCuerpo) {
  return api.crear<Usuario>('/auth/register', credenciales);
}
