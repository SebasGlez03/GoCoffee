import type { Rol } from '../../dominio/tipos';

export interface UsuarioGuardado {
  idUsuario: number;
  email: string;
  passwordHash: string;
  rol: Rol;
}

export interface NuevoUsuario {
  email: string;
  passwordHash: string;
  rol: Rol;
}

/** Acceso a usuarios. AuthService depende de esta interfaz, no de Prisma. */
export interface UsuariosRepository {
  buscarPorEmail(email: string): Promise<UsuarioGuardado | null>;
  crear(usuario: NuevoUsuario): Promise<UsuarioGuardado>;
}
