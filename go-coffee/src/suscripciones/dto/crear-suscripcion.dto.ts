import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DIAS_SEMANA, ESTADOS_SUSCRIPCION } from '../../dominio/tipos';
import type { DiaSemana, EstadoSuscripcion } from '../../dominio/tipos';
import type { CrearSuscripcionCuerpo } from '../../contrato/contrato';
import { DireccionEntregaDto } from './direccion-entrega.dto';

export class CrearSuscripcionDto implements CrearSuscripcionCuerpo {
  @IsInt()
  @Min(1)
  planId!: number;

  @IsEnum(DIAS_SEMANA, { message: 'Elige un día de entrega válido.' })
  diaSemanaEntrega!: DiaSemana;

  @IsDateString({}, { message: 'La fecha de inicio no es válida.' })
  fechaInicio!: string;

  @ValidateNested()
  @Type(() => DireccionEntregaDto)
  direccionEntrega!: DireccionEntregaDto;

  @IsEnum(ESTADOS_SUSCRIPCION)
  estadoSuscripcion!: EstadoSuscripcion;

  /**
   * Los ciclos los genera el servidor. Se acepta el campo solo vacío
   * para no romper clientes anteriores que mandaban "ciclos": [].
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(0, {
    message: 'Los ciclos los genera el servidor; no los envíes.',
  })
  ciclos?: never[];
}
