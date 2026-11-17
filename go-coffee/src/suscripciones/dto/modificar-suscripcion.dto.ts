import { IsDateString, IsIn, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { DiaSemana, EstadoSuscripcion } from '../../dominio/tipos';
import { DIAS_SEMANA, ESTADOS_SUSCRIPCION } from '../../dominio/tipos';
import type { ModificarSuscripcionCuerpo } from '../../contrato/contrato';
import { DireccionEntregaDto } from './direccion-entrega.dto';

export class ModificarSuscripcionDto implements ModificarSuscripcionCuerpo {
  @IsOptional()
  @IsIn(DIAS_SEMANA, { message: 'Elige un día de entrega válido.' })
  diaSemanaEntrega?: DiaSemana;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DireccionEntregaDto)
  direccionEntrega?: DireccionEntregaDto;

  @IsOptional()
  @IsIn(ESTADOS_SUSCRIPCION, { message: 'Ese estado de suscripción no existe.' })
  estadoSuscripcion?: EstadoSuscripcion;
}
