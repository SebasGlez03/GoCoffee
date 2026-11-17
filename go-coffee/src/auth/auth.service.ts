import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type {
  RespuestaLogin,
  UsuarioPublico,
} from '../contrato/contrato';
import type { UsuariosRepository } from './dominio/usuarios.repository';
import { USUARIOS_REPOSITORY } from './infra/usuarios.tokens';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USUARIOS_REPOSITORY)
    private readonly usuarios: UsuariosRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<UsuarioPublico> {
    const email = dto.email.trim().toLowerCase();
    if (await this.usuarios.buscarPorEmail(email)) {
      throw new ConflictException('Ese correo ya tiene una cuenta.');
    }

    const usuario = await this.usuarios.crear({
      email,
      passwordHash: await bcrypt.hash(dto.password, 10),
      // El registro público siempre crea clientes.
      rol: 'CLIENTE',
    });

    return {
      idUsuario: usuario.idUsuario,
      email: usuario.email,
      rol: usuario.rol,
    };
  }

  async login(dto: LoginDto): Promise<RespuestaLogin> {
    const usuario = await this.usuarios.buscarPorEmail(
      dto.email.trim().toLowerCase(),
    );
    const passwordValida =
      usuario !== null &&
      (await bcrypt.compare(dto.password, usuario.passwordHash));

    if (!usuario || !passwordValida) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    const user: UsuarioPublico = {
      idUsuario: usuario.idUsuario,
      email: usuario.email,
      rol: usuario.rol,
    };

    return {
      access_token: this.jwtService.sign({
        sub: usuario.idUsuario,
        email: usuario.email,
        rol: usuario.rol,
      }),
      user,
    };
  }

  me(user: UsuarioPublico): UsuarioPublico {
    return {
      idUsuario: user.idUsuario,
      email: user.email,
      rol: user.rol,
    };
  }
}
