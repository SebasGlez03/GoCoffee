import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  ValidateNested,
  IsArray,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DIAS_SEMANA,
  ESTADOS_SUSCRIPCION,
} from '../../dominio/tipos';
import type { DiaSemana, EstadoSuscripcion } from '../../dominio/tipos';

class DireccionEntregaDto {
  @IsInt()
  @Min(1)
  idDireccionEntrega?: number;

  @IsString()
  @IsNotEmpty()
  calle!: string;

  @IsString()
  @IsNotEmpty()
  codigoPostal!: string;

  @IsString()
  @IsNotEmpty()
  numeroCasa!: string;

  @IsString()
  @IsNotEmpty()
  estado!: string;
}

export class CrearSuscripcionDto {
  @IsInt()
  @Min(1)
  planId!: number;

  @IsEnum(DIAS_SEMANA)
  diaSemanaEntrega!: DiaSemana;

  @IsDateString()
  fechaInicio!: string;

  @ValidateNested()
  @Type(() => DireccionEntregaDto)
  direccionEntrega!: DireccionEntregaDto;

  @IsEnum(ESTADOS_SUSCRIPCION)
  estadoSuscripcion!: EstadoSuscripcion;

  @IsArray()
  ciclos!: any[];
}