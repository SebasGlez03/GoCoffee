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
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CrearSuscripcionDto } from './dto/crear-suscripcion.dto';
import { ModificarSuscripcionDto } from './dto/modificar-suscripcion.dto';
import type { UsuarioSesion } from './suscripciones.service';

import { aSuscripcion } from './dto/suscripcion-respuesta.dto';
import { SuscripcionesService } from './suscripciones.service';
import { SuscripcionNoEncontradaError } from '../dominio/errores';
import { ModificacionSuscripcion } from '../dominio/entidades-repo';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

type PeticionAutenticada = Request & { user: UsuarioSesion };

@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private readonly servicio: SuscripcionesService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE', 'ADMINISTRADOR')
  async findById(@Param('id', ParseIntPipe) id: number, @Req() req: PeticionAutenticada) {
    const suscripcion = await this.servicio.findById(id, req.user);
    if (!suscripcion) {
      throw new SuscripcionNoEncontradaError(id);
    }
    return aSuscripcion(suscripcion);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE', 'ADMINISTRADOR')
  async findAll(@Req() req: PeticionAutenticada) {
    const lista = await this.servicio.findAll(req.user);
    return lista.map(aSuscripcion);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE', 'ADMINISTRADOR')
  @HttpCode(201)
  async save(
    @Body() dto: CrearSuscripcionDto,
    @Req() req: PeticionAutenticada,
    @Res({ passthrough: true }) res: Response,
  ) {
    const suscripcion = await this.servicio.save(dto, req.user);
    res.setHeader('Location', `/suscripciones/${suscripcion.idSuscripcion}`);
    return aSuscripcion(suscripcion);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE', 'ADMINISTRADOR')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModificarSuscripcionDto,
    @Req() req: PeticionAutenticada,
  ) {
    const { fechaInicio, ...resto } = dto;
    const modificacion: ModificacionSuscripcion = {
      ...resto,
      ...(fechaInicio != undefined && { fechaInicio: new Date(fechaInicio) }),
    };
    const suscripcion = await this.servicio.update(id, modificacion, req.user);
    return aSuscripcion(suscripcion);
  }
}
