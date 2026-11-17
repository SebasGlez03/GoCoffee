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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CiclosService } from './ciclos.service';
import type { UsuarioSesion } from './suscripciones.service';
import { FiltrosCiclosDto } from './dto/filtros-ciclos.dto';
import type { CicloAdministracionRespuesta } from '../contrato/contrato';

@ApiTags('Ciclos y entregas')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CiclosController {
  constructor(private readonly servicio: CiclosService) {}

  /** Salta la entrega de un ciclo. 201 · 401 · 403 · 404 · 409 ya armada/enviada, pagada o pasada. */
  @Post('suscripciones/:id/ciclos/:numCiclo/saltar')
  @Roles('CLIENTE', 'ADMINISTRADOR')
  saltar(
    @Param('id', ParseIntPipe) id: number,
    @Param('numCiclo', ParseIntPipe) numCiclo: number,
    @Req() req: { user: UsuarioSesion },
  ) {
    return this.servicio.saltarEntrega(id, numCiclo, req.user);
  }

  /** Backoffice: ciclos con entregas y cobros. 200 · 400 filtros inválidos · 401 · 403. */
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
    }) as Promise<CicloAdministracionRespuesta[]>;
  }
}
