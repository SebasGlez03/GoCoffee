import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
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

@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private readonly servicio: SuscripcionesService) {}

  // TODO: Tengo dudas de que puede que este no funcione, porque quizas el @Param se refiere al nombre de el atributo de la entidad, y este esta como idSuscripcion
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const suscripcion = await this.servicio.findById(id);
    if (!suscripcion) {
      throw new NotFoundException(
        `No se encontro la suscripcion con el id ${id}`,
      );
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
    // TODO: Aqui aplica tambien lo de revisar los errores que no estan aplicados y validados.
    if (!Number.isInteger(dto.diaSemanaEntrega)) {
      throw new BadRequestException(
        'El campo diaSemanaEntrega debe de ser un numero entero',
      );
    }

    try {
      const suscripcion = await this.servicio.save(dto);
      res.setHeader('Location', `/suscripciones/${suscripcion.idSuscripcion}`);
      return aSuscripcion(suscripcion);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
        // TODO: Aqui tambien poner los errores aplicando y validando.
      }
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModificarSuscripcionDto,
  ) {
    if (id <= 0) {
      throw new BadRequestException('El ID debe ser un número entero positivo');
    }

    const dtoConId = { ...dto, id };
    const suscripcion = await this.servicio.update(dtoConId);
    return aSuscripcion(suscripcion);
  }
}
