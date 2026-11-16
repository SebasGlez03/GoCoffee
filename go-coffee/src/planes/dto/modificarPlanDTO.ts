import { 
  IsInt, 
  IsString, 
  IsNumber, 
  IsPositive, 
  IsIn, 
  IsOptional, 
  Min, 
  IsNotEmpty 
} from 'class-validator';
import { 
  ESTADOS_PLAN, 
  FRECUENCIAS_ENTREGA 
} from '../../dominio/tipos';

import type{ 
  EstadoPlan, 
  FrecuenciaEntrega 
} from '../../dominio/tipos';

export class ModificarPlanDTO {
  @IsInt()
  @Min(1)
  id!: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  cantidadBolsas?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  precio?: number;

  @IsOptional()
  @IsIn(FRECUENCIAS_ENTREGA)
  frecuenciaEntrega?: FrecuenciaEntrega;

  @IsOptional()
  @IsIn(ESTADOS_PLAN)
  estadoPlan?: EstadoPlan;
}