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
import { CrearPlanDTO } from './dto/crearPlanDto';
import { ModificarPlanDTO } from './dto/modificarPlanDTO';
import { PlanesService } from './planes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('planes')
export class PlanesController {
  constructor(private readonly servicio: PlanesService) {}

  @Get()
  getAll() {
    return this.servicio.buscarTodosLosPlanes();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.buscarPlanPorId(id);
  }

  @Get('estado/:estado')
  getByEstado(@Param('estado') estado: string) {
    return this.servicio.buscarPlanesPorEstado(estado as any);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  create(@Body() dto: CrearPlanDTO) {
    return this.servicio.guardarNuevoPlan(dto);
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  update(@Body() dto: ModificarPlanDTO) {
    return this.servicio.modificarNuevoPlan(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.eliminarPlan(id);
  }
}