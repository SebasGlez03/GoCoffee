import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { UsuarioPublico } from '../contrato/contrato';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Crea una cuenta de CLIENTE. 201 creada · 400 datos inválidos · 409 correo repetido. */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** Inicia sesión. 200 con token · 400 datos inválidos · 401 credenciales incorrectas. */
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** Datos del usuario del token. 200 · 401 sin token o vencido. */
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@Req() req: { user: UsuarioPublico }) {
    return this.authService.me(req.user);
  }
}
