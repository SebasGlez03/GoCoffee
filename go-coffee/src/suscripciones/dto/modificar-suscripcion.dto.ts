import {
  IsArray,
  IsDateString,
  IsIn,
  IsObject,
  IsOptional,
} from 'class-validator';
import type { DireccionEntrega, Ciclo } from '../../dominio/entidades';
import type { DiaSemana, EstadoSuscripcion } from '../../dominio/tipos';

const ESTADOS_SUSCRIPCION: EstadoSuscripcion[] = [
  'ACTIVA',
  'CANCELADA',
  'PAUSADA',
  'SUSPENDIDA',
];

const DIAS_SEMANA: DiaSemana[] = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO'
]

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
