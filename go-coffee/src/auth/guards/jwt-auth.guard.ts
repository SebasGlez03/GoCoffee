import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { UsuarioPublico } from '../../contrato/contrato';

/**
 * Exige un token válido. Si falta o ya venció responde 401; el portal
 * usa ese 401 para cerrar la sesión y avisar al usuario.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<T = UsuarioPublico>(err: unknown, user: T | false | null): T {
    if (err || !user) {
      throw err instanceof Error
        ? err
        : new UnauthorizedException(
            'Tu sesión no es válida o ya venció. Vuelve a iniciar sesión.',
          );
    }
    return user;
  }
}
