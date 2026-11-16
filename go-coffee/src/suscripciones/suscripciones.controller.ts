import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import type { CrearSuscripcionDto } from './dto/crear-suscripcion.dto';
import type { ModificarSuscripcionDto } from './dto/modificar-suscripcion.dto';
import { aSuscripcion } from './dto/suscripcion-respuesta.dto';
import { SuscripcionesService } from './suscripciones.service';
import { SuscripcionNoEncontradaError } from '../dominio/errores';
import { ModificacionSuscripcion } from '../dominio/entidades-repo';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private readonly servicio: SuscripcionesService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE', 'ADMINISTRADOR')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const suscripcion = await this.servicio.findById(id);
    if (!suscripcion) {
      throw new SuscripcionNoEncontradaError(id);
    }
    return aSuscripcion(suscripcion);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE', 'ADMINISTRADOR')
  async findAll() {
    const lista = await this.servicio.findAll();
    return lista.map(aSuscripcion);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE', 'ADMINISTRADOR')
  @HttpCode(201)
  async save(
    @Body() dto: CrearSuscripcionDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const suscripcion = await this.servicio.save(dto);
    res.setHeader('Location', `/suscripciones/${suscripcion.idSuscripcion}`);
    return aSuscripcion(suscripcion);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE', 'ADMINISTRADOR')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModificarSuscripcionDto,
  ) {
    const { fechaInicio, ...resto } = dto;
    const modificacion: ModificacionSuscripcion = {
      ...resto,
      ...(fechaInicio != undefined && { fechaInicio: new Date(fechaInicio) }),
    };
    const suscripcion = await this.servicio.update(id, modificacion);
    return aSuscripcion(suscripcion);
  }
}