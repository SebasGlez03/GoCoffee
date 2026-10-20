import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import type { CrearSuscripcionDto } from './dto/crear-suscripcion.dto';
import type { ModificarSuscripcionDto } from './dto/modificar-suscripcion.dto';
import { aSuscripcion } from './dto/suscripcion-respuesta.dto';
import { SuscripcionesService } from './suscripciones.service';
import { SuscripcionNoEncontradaError } from '../dominio/errores';

@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private readonly servicio: SuscripcionesService) {}

  // TODO: Tengo dudas de que puede que este no funcione, porque quizas el @Param se refiere al nombre de el atributo de la entidad, y este esta como idSuscripcion
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const suscripcion = await this.servicio.findById(id);
    if (!suscripcion) {
      throw new SuscripcionNoEncontradaError(id);
    }
    return aSuscripcion(suscripcion);
  }

  @Get()
  async findAll() {
    const lista = await this.servicio.findAll();
    return lista.map(aSuscripcion);
  }

  @Post()
  @HttpCode(201)
  async save(
    @Body() dto: CrearSuscripcionDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const suscripcion = await this.servicio.save(dto);
    res.setHeader('Location', `/suscripciones/${suscripcion.idSuscripcion}`);
    return aSuscripcion(suscripcion);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModificarSuscripcionDto,
  ) {
    const dtoConId = { ...dto, id };
    const suscripcion = await this.servicio.update(dtoConId);
    return aSuscripcion(suscripcion);
  }
}
