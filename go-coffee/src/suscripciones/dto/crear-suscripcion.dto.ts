import {
  IsArray,
  IsDateString,
  IsIn,
  IsObject
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

export class CrearSuscripcionDto {
  @IsIn(DIAS_SEMANA)
  diaSemanaEntrega: DiaSemana;

  @IsDateString()
  fechaInicio: string;

  @IsObject()
  direccionEntrega: DireccionEntrega;

  @IsIn(ESTADOS_SUSCRIPCION)
  estadoSuscripcion: EstadoSuscripcion;

  @IsArray()
  ciclos: Ciclo[];
}
