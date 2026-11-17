import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ESTADOS_COBRO, ESTADOS_ENTREGA } from '../../dominio/tipos';
import type { EstadoCobro, EstadoEntrega } from '../../dominio/tipos';
import type { FiltrosCiclosConsulta } from '../../contrato/contrato';

export class FiltrosCiclosDto implements FiltrosCiclosConsulta {
  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;

  @IsOptional()
  @IsIn(ESTADOS_ENTREGA)
  estadoEntrega?: EstadoEntrega;

  @IsOptional()
  @IsIn(ESTADOS_COBRO)
  estadoCobro?: EstadoCobro;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idSuscripcion?: number;
}
