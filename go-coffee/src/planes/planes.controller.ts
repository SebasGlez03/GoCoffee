import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { PlanesService } from './planes.service';
import { PlanMapper } from './mapper/PlanMapper';
import type { CrearPlanDTO } from './dto/crearPlanDto';
import type { Response } from 'express';
import type { ModificarPlanDTO } from './dto/modificarPlanDTO';
import { EstadoPlan } from '../dominio/tipos';

@Controller('planes')
export class PlanesController {
  constructor(private readonly servicio: PlanesService) {}

  @Get(':id')
  async buscar(@Param('id') id: string) {
    const plan = await this.servicio.buscarPlanPorId(Number(id));
    return PlanMapper.toDto(plan);
  }

  @Get()
  async listar() {
    const lista = await this.servicio.buscarTodosLosPlanes();
    return lista.map((plan) => PlanMapper.toDto(plan));
  }

  @Post()
  @HttpCode(201)
  async crear(
    @Body() dto: CrearPlanDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const nuevoPlan = await this.servicio.guardarNuevoPlan(dto);
    res.setHeader('location', `/planes/${nuevoPlan.idPlan}`);
    return PlanMapper.toDto(nuevoPlan);
  }

  @Put()
  async modificar(
    @Body() dto: ModificarPlanDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const planModificado = await this.servicio.modificarNuevoPlan(dto);
    res.setHeader('location', `/planes/${dto.id}`);
    return PlanMapper.toDto(planModificado);
  }

  @Delete(':id')
  async cancelar(@Param('id') id: string) {
    await this.servicio.eliminarPlan(Number(id));
  }

  @Get('estado/:estado')
  async buscarPorEstado(@Param('estado') estado: string) {
    const planes = await this.servicio.buscarPlanesPorEstado(
      estado as EstadoPlan,
    );
    return planes.map((plan) => PlanMapper.toDto(plan));
  }
}
