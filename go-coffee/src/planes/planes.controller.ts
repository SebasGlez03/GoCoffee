import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CrearPlanDto } from './dto/crear-plan.dto';
import { EstadoPlanParamDto } from './dto/estado-plan.param.dto';
import { ModificarPlanDto } from './dto/modificar-plan.dto';
import { PlanesService } from './planes.service';
import type { PlanRespuesta } from '../contrato/contrato';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Las consultas del catálogo son públicas a propósito: el portal del
 * cliente muestra los planes a visitantes sin sesión (caso de uso SF-B).
 * Crear, modificar y retirar planes requiere rol ADMINISTRADOR.
 */
@ApiTags('Planes')
@Controller('planes')
export class PlanesController {
  constructor(private readonly servicio: PlanesService) {}

  /** Todos los planes. 200. */
  @Get()
  getAll(): Promise<PlanRespuesta[]> {
    return this.servicio.buscarTodosLosPlanes();
  }

  /** Planes por estado (ACTUAL, OBSOLETO, INACTIVO). 200 · 400 estado inválido. */
  @Get('estado/:estado')
  getByEstado(@Param() params: EstadoPlanParamDto): Promise<PlanRespuesta[]> {
    return this.servicio.buscarPlanesPorEstado(params.estado);
  }

  /** Un plan. 200 · 400 id inválido · 404 no existe. */
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<PlanRespuesta> {
    return this.servicio.buscarPlanPorId(id);
  }

  /** 201 · 400 · 401 · 403. */
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  create(@Body() dto: CrearPlanDto) {
    return this.servicio.guardarNuevoPlan(dto);
  }

  /** 200 · 400 · 401 · 403 · 404. */
  @Put()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  update(@Body() dto: ModificarPlanDto) {
    return this.servicio.modificarNuevoPlan(dto);
  }

  /** 200 · 401 · 403 · 404. */
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminarPlan(id);
  }
}
