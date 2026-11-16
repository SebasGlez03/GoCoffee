import { 
  IsString, 
  IsNotEmpty, 
  IsInt, 
  IsNumber, 
  IsPositive, 
  IsIn , 
  Min 
} from 'class-validator';
import { FRECUENCIAS_ENTREGA } from '../../dominio/tipos';
import type { FrecuenciaEntrega } from '../../dominio/tipos';

export class CrearPlanDTO {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsInt()
  @Min(1)
  cantidadBolsas!: number;

  @IsNumber()
  @IsPositive()
  precio!: number;

  @IsIn(FRECUENCIAS_ENTREGA)
  frecuenciaEntrega!: FrecuenciaEntrega;
}