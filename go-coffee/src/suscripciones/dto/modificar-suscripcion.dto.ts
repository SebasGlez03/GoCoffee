import {
  IsArray,
  IsDateString,
  IsIn,
  IsObject,
  IsOptional,
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

export class ModificarSuscripcionDto {
  @IsOptional()
  @IsString()
  diaSemanaEntrega?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsObject()
  direccionEntrega?: DireccionEntrega;

  @IsOptional()
  @IsIn(ESTADOS_SUSCRIPCION)
  estadoSuscripcion?: EstadoSuscripcion;
  
  @IsOptional()
  @IsArray()
  ciclos?: Ciclo[];
}
