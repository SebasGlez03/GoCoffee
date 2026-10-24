import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import type { FrecuenciaEntrega } from '../../dominio/tipos';

const FRECUENCIAS_ENTREGA: FrecuenciaEntrega[] = [
  'SEMANAL',
  'QUINCENAL',
  'MENSUAL',
];

export class CrearPlanDTO {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsInt()
  @Min(1)
  cantidadBolsas: number;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsIn(FRECUENCIAS_ENTREGA)
  frecuenciaEntrega: FrecuenciaEntrega;
}
