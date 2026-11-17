import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { obtenerSecretoJwt } from '../../config/jwt.config';
import type { UsuarioPublico } from '../../contrato/contrato';
import type { UsuariosRepository } from '../dominio/usuarios.repository';
import { USUARIOS_REPOSITORY } from '../infra/usuarios.tokens';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(USUARIOS_REPOSITORY)
    private readonly usuarios: UsuariosRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: obtenerSecretoJwt(),
    });
  }

  async validate(payload: { email: string }): Promise<UsuarioPublico | null> {
    const usuario = await this.usuarios.buscarPorEmail(payload.email);
    if (!usuario) return null;
    return {
      idUsuario: usuario.idUsuario,
      email: usuario.email,
      rol: usuario.rol,
    };
  }
}
