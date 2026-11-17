import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../common/prisma/prisma.service';
import { DURACION_TOKEN, obtenerSecretoJwt } from '../config/jwt.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UsuariosPrismaRepository } from './infra/usuarios-prisma.repository';
import { USUARIOS_REPOSITORY } from './infra/usuarios.tokens';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: obtenerSecretoJwt(),
        signOptions: { expiresIn: DURACION_TOKEN as `${number}d` },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    { provide: USUARIOS_REPOSITORY, useClass: UsuariosPrismaRepository },
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
