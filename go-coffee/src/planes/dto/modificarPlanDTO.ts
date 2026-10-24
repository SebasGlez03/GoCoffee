import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import type { EstadoPlan, FrecuenciaEntrega } from '../../dominio/tipos';

const FRECUENCIAS_ENTREGA: FrecuenciaEntrega[] = [
  'SEMANAL',
  'QUINCENAL',
  'MENSUAL',
];
const ESTADOS_PLAN: EstadoPlan[] = ['OBSOLETO', 'ACTUAL', 'INACTIVO'];

export class ModificarPlanDTO {
  @IsInt()
  @Min(1)
  id: number;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  cantidadBolsas?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precio?: number;

  @IsOptional()
  @IsIn(FRECUENCIAS_ENTREGA)
  frecuenciaEntrega?: FrecuenciaEntrega;

  @IsOptional()
  @IsIn(ESTADOS_PLAN)
  estadoPlan?: EstadoPlan;
}
