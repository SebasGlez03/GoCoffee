import {
  IsArray,
  IsDateString,
  IsIn,
  IsObject
} from 'class-validator';
import type { DireccionEntrega, Ciclo } from '../../dominio/entidades';
import type { DiaSemana, EstadoSuscripcion} from '../../dominio/tipos';
import { DIAS_SEMANA, ESTADOS_SUSCRIPCION} from '../../dominio/tipos';


export class CrearSuscripcionDto {
  @IsIn(DIAS_SEMANA)
  diaSemanaEntrega!: DiaSemana;

  @IsDateString()
  fechaInicio!: string;

  @IsObject()
  direccionEntrega!: DireccionEntrega;

  @IsIn(ESTADOS_SUSCRIPCION)
  estadoSuscripcion!: EstadoSuscripcion;

  @IsArray()
  ciclos!: Ciclo[];
}
