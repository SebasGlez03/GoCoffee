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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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

/**
 * Un CLIENTE solo ve y modifica sus propias suscripciones (403 si no es
 * suyo); el ADMINISTRADOR ve todas.
 */
@ApiTags('Suscripciones')
@ApiBearerAuth()
@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private readonly servicio: SuscripcionesService) {}

  /** 200 · 401 · 403 no es tuya · 404 no existe. */
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

  /** 200 (lista vacía si no tiene) · 401. */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE', 'ADMINISTRADOR')
  async findAll(@Req() req: PeticionAutenticada) {
    const lista = await this.servicio.findAll(req.user);
    return lista.map(aSuscripcion);
  }

  /** 201 · 400 datos inválidos · 401 · 409 duplicada o fecha pasada. */
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

  /** Pausar, reanudar, cancelar o cambiar día. 200 · 400 · 401 · 403 · 404 · 409 cancelada/suspendida. */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENTE', 'ADMINISTRADOR')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModificarSuscripcionDto,
    @Req() req: PeticionAutenticada,
  ) {
    const { fechaInicio, direccionEntrega, ...resto } = dto;
    const modificacion: ModificacionSuscripcion = {
      ...resto,
      ...(fechaInicio != undefined && { fechaInicio: new Date(fechaInicio) }),
      ...(direccionEntrega != undefined && {
        direccionEntrega: {
          ...direccionEntrega,
          idDireccionEntrega: direccionEntrega.idDireccionEntrega ?? 0,
        },
      }),
    };
    const suscripcion = await this.servicio.update(id, modificacion, req.user);
    return aSuscripcion(suscripcion);
  }
}
