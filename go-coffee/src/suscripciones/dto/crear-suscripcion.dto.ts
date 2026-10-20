import {
  IsArray,
  IsDateString,
  IsIn,
  IsObject,
  IsString,
} from 'class-validator';
import type { DireccionEntrega, Ciclo } from '../../dominio/entidades';
import type { EstadoSuscripcion } from '../../dominio/tipos';

const ESTADOS_SUSCRIPCION: EstadoSuscripcion[] = [
  'ACTIVA',
  'CANCELADA',
  'PAUSADA',
  'SUSPENDIDA',
];

export class CrearSuscripcionDto {
  @IsString()
  diaSemanaEntrega: string;

  @IsDateString()
  fechaInicio: string;

  @IsObject()
  direccionEntrega: DireccionEntrega;

  @IsIn(ESTADOS_SUSCRIPCION)
  estadoSuscripcion: EstadoSuscripcion;

  @IsArray()
  ciclos: Ciclo[];
}
