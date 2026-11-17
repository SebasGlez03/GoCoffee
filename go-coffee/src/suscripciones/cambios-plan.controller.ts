import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IsBoolean, IsInt, IsNumber, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { UsuarioSesion } from './suscripciones.service';
import { CambiosPlanService } from './cambios-plan.service';

class SolicitarCambioDto {
  @IsInt() @Min(1) planId!: number;
  @IsNumber() @Min(0) precioEsperado!: number;
}
class ResolverCambioDto { @IsBoolean() aceptar!: boolean; }

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CambiosPlanController {
  constructor(private readonly servicio: CambiosPlanService) {}
  @Get('suscripciones/:id/cambios-plan/opciones')
  @Roles('CLIENTE', 'ADMINISTRADOR')
  opciones(@Param('id', ParseIntPipe) id: number, @Req() req: { user: UsuarioSesion }) { return this.servicio.opciones(id, req.user); }
  @Get('suscripciones/:id/cambios-plan')
  @Roles('CLIENTE', 'ADMINISTRADOR')
  historial(@Param('id', ParseIntPipe) id: number, @Req() req: { user: UsuarioSesion }) { return this.servicio.historial(id, req.user); }
  @Post('suscripciones/:id/cambios-plan')
  @Roles('CLIENTE', 'ADMINISTRADOR')
  solicitar(@Param('id', ParseIntPipe) id: number, @Body() dto: SolicitarCambioDto, @Req() req: { user: UsuarioSesion }) { return this.servicio.solicitar(id, dto.planId, dto.precioEsperado, req.user); }
  @Get('cambios-plan')
  @Roles('ADMINISTRADOR')
  listar() { return this.servicio.listar(); }
  @Patch('cambios-plan/:id/resolucion')
  @Roles('ADMINISTRADOR')
  resolver(@Param('id', ParseIntPipe) id: number, @Body() dto: ResolverCambioDto) { return this.servicio.resolver(id, dto.aceptar); }
}
