import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResolverCambioDto, SolicitarCambioDto } from './dto/cambio-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { UsuarioSesion } from './suscripciones.service';
import { CambiosPlanService } from './cambios-plan.service';
import type {
  OpcionesCambioPlanRespuesta,
  SolicitudCambioPlanRespuesta,
} from '../contrato/contrato';

@ApiTags('Cambios de plan')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CambiosPlanController {
  constructor(private readonly servicio: CambiosPlanService) {}
  @Get('suscripciones/:id/cambios-plan/opciones')
  @Roles('CLIENTE', 'ADMINISTRADOR')
  opciones(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: UsuarioSesion },
  ) {
    return this.servicio.opciones(id, req.user) as Promise<OpcionesCambioPlanRespuesta>;
  }
  @Get('suscripciones/:id/cambios-plan')
  @Roles('CLIENTE', 'ADMINISTRADOR')
  historial(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: UsuarioSesion },
  ) {
    return this.servicio.historial(id, req.user) as Promise<SolicitudCambioPlanRespuesta[]>;
  }
  @Post('suscripciones/:id/cambios-plan')
  @Roles('CLIENTE', 'ADMINISTRADOR')
  solicitar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SolicitarCambioDto,
    @Req() req: { user: UsuarioSesion },
  ) {
    return this.servicio.solicitar(
      id,
      dto.planId,
      dto.precioEsperado,
      dto.numCicloAplicacion,
      req.user,
    ) as Promise<SolicitudCambioPlanRespuesta>;
  }
  @Get('cambios-plan')
  @Roles('ADMINISTRADOR')
  listar() {
    return this.servicio.listar() as Promise<SolicitudCambioPlanRespuesta[]>;
  }
  @Patch('cambios-plan/:id/resolucion')
  @Roles('ADMINISTRADOR')
  resolver(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResolverCambioDto,
  ) {
    return this.servicio.resolver(id, dto.aceptar) as Promise<SolicitudCambioPlanRespuesta>;
  }
}
