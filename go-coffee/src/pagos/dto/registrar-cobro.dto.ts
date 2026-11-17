import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ESTADOS_COBRO } from '../../dominio/tipos';
import type { EstadoCobro } from '../../dominio/tipos';
import type { RegistrarCobroCuerpo } from '../../contrato/contrato';

export class RegistrarCobroDto implements RegistrarCobroCuerpo {
  @IsInt()
  @Min(1)
  idSuscripcion!: number;

  @IsInt()
  @Min(1)
  numCiclo!: number;

  @IsIn(ESTADOS_COBRO)
  estadoCobro!: EstadoCobro;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  referencia?: string;
}
