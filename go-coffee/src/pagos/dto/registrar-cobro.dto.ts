import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class RegistrarCobroDto {
  @IsInt()
  @Min(1)
  idSuscripcion!: number;

  @IsInt()
  @Min(1)
  numCiclo!: number;

  @IsIn(['PAGADO', 'FALLIDO'])
  estadoCobro!: 'PAGADO' | 'FALLIDO';

  @IsOptional()
  @IsString()
  @MaxLength(160)
  referencia?: string;
}
