import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CiclosService } from './ciclos.service';
import type { UsuarioSesion } from './suscripciones.service';

class FiltrosCiclosDto {
  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;

  @IsOptional()
  @IsIn(['PROGRAMADA', 'SALTADA', 'ARMADA', 'ENVIADA', 'ENTREGADA'])
  estadoEntrega?: string;

  @IsOptional()
  @IsIn(['PAGADO', 'FALLIDO'])
  estadoCobro?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idSuscripcion?: number;
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CiclosController {
  constructor(private readonly servicio: CiclosService) {}

  @Post('suscripciones/:id/ciclos/:numCiclo/saltar')
  @Roles('CLIENTE', 'ADMINISTRADOR')
  saltar(
    @Param('id', ParseIntPipe) id: number,
    @Param('numCiclo', ParseIntPipe) numCiclo: number,
    @Req() req: { user: UsuarioSesion },
  ) {
    return this.servicio.saltarEntrega(id, numCiclo, req.user);
  }

  @Get('administracion/ciclos')
  @Roles('ADMINISTRADOR')
  listarAdmin(@Query() filtros: FiltrosCiclosDto) {
    const hasta = filtros.hasta ? new Date(filtros.hasta) : undefined;
    if (hasta && /^\d{4}-\d{2}-\d{2}$/.test(filtros.hasta ?? '')) {
      hasta.setUTCHours(23, 59, 59, 999);
    }
    return this.servicio.listarCiclosAdmin({
      desde: filtros.desde ? new Date(filtros.desde) : undefined,
      hasta,
      estadoEntrega: filtros.estadoEntrega,
      estadoCobro: filtros.estadoCobro,
      idSuscripcion: filtros.idSuscripcion,
    });
  }
}
