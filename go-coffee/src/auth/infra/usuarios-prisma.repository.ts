import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { Rol } from '../../dominio/tipos';
import type {
  NuevoUsuario,
  UsuarioGuardado,
  UsuariosRepository,
} from '../dominio/usuarios.repository';

@Injectable()
export class UsuariosPrismaRepository implements UsuariosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorEmail(email: string): Promise<UsuarioGuardado | null> {
    const usuario = await this.prisma.client.usuario.findUnique({
      where: { email },
    });
    return usuario ? this.aDominio(usuario) : null;
  }

  async crear(datos: NuevoUsuario): Promise<UsuarioGuardado> {
    const usuario = await this.prisma.client.usuario.create({ data: datos });
    return this.aDominio(usuario);
  }

  private aDominio(usuario: {
    idUsuario: number;
    email: string;
    passwordHash: string;
    rol: string;
  }): UsuarioGuardado {
    return {
      idUsuario: usuario.idUsuario,
      email: usuario.email,
      passwordHash: usuario.passwordHash,
      rol: usuario.rol as Rol,
    };
  }
}
