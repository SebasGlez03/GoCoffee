import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { UsuarioSesion } from '../suscripciones/suscripciones.service';
import { MetodoPagoDto } from './dto/metodo-pago.dto';
import { RegistrarCobroDto } from './dto/registrar-cobro.dto';
import { PagosService } from './pagos.service';
import type {
  CobroRegistradoRespuesta,
  CobroRespuesta,
  MetodoPagoRespuesta,
} from '../contrato/contrato';

/**
 * Pagos en modo manual: el administrador registra el resultado de cada
 * cobro. El cliente consulta su historial y mantiene su método de pago.
 */
@ApiTags('Cobros')
@ApiBearerAuth()
@Controller('cobros')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PagosController {
  constructor(private readonly servicio: PagosService) {}

  @Get('metodo-pago')
  @Roles('CLIENTE', 'ADMINISTRADOR')
  metodoPago(@Req() req: { user: UsuarioSesion }) {
    return this.servicio.obtenerMetodoPago(req.user) as Promise<MetodoPagoRespuesta | null>;
  }

  @Put('metodo-pago')
  @Roles('CLIENTE', 'ADMINISTRADOR')
  guardarMetodoPago(
    @Req() req: { user: UsuarioSesion },
    @Body() dto: MetodoPagoDto,
  ) {
    return this.servicio.guardarMetodoPago(req.user, dto) as Promise<MetodoPagoRespuesta>;
  }

  @Get('historial')
  @Roles('CLIENTE', 'ADMINISTRADOR')
  historial(@Req() req: { user: UsuarioSesion }) {
    return this.servicio.historial(req.user) as Promise<CobroRespuesta[]>;
  }

  @Post()
  @Roles('ADMINISTRADOR')
  registrar(
    @Body() dto: RegistrarCobroDto,
    @Req() req: { user: UsuarioSesion },
  ) {
    return this.servicio.registrarCobro(dto, req.user) as Promise<CobroRegistradoRespuesta>;
  }
}
