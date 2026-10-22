import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const usuarioExistente = await this.prisma.client.usuario.findUnique({
      where: { email: dto.email },
    });

    if (usuarioExistente) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const usuario = await this.prisma.client.usuario.create({
      data: {
        email: dto.email,
        passwordHash,
        rol: dto.rol ?? 'CLIENTE',
      },
    });

    return {
      idUsuario: usuario.idUsuario,
      email: usuario.email,
      rol: usuario.rol,
    };
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.client.usuario.findUnique({
      where: { email: dto.email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.passwordHash);

    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: usuario.idUsuario,
      email: usuario.email,
      rol: usuario.rol,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        idUsuario: usuario.idUsuario,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }

  async me(user: any) {
    return {
      idUsuario: user.idUsuario,
      email: user.email,
      rol: user.rol,
    };
  }
}