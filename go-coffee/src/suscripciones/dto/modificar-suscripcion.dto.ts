import {
  IsArray,
  IsDateString,
  IsIn,
  IsObject,
  IsOptional,
} from 'class-validator';
import type { DireccionEntrega, Ciclo } from '../../dominio/entidades';
import type { DiaSemana, EstadoSuscripcion } from '../../dominio/tipos';
import { DIAS_SEMANA, ESTADOS_SUSCRIPCION} from '../../dominio/tipos';

export class ModificarSuscripcionDto {
  @IsOptional()
  @IsIn(DIAS_SEMANA)
  diaSemanaEntrega?: DiaSemana;

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
