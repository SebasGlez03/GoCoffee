import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { SuscripcionesService } from './suscripciones.service';
import { aSuscripcion } from './dto/suscripcion-respuesta.dto';

@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private readonly servicio: SuscripcionesService) {}

  // TODO: Tengo dudas de que puede que este no funcione, porque quizas el @Param se refiere al nombre de el atributo de la entidad, y este esta como idSuscripcion
  @Get(':id')
  async findById(@Param('id') id: number) {
    const suscripcion = await this.servicio.findById(Number(id));
    if (!suscripcion) {
        throw new NotFoundException(`No se encontro la suscripcion con el id ${id}`);
    }
    return aSuscripcion(suscripcion);
  }

  @Get()
  async findAll() {
    const lista = await this.servicio.findAll();
    return lista.map(aSuscripcion);
  }
}
