import { IsIn, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { MARCAS_TARJETA } from '../../contrato/contrato';
import type { MarcaTarjeta, MetodoPagoCuerpo } from '../../contrato/contrato';

/** Solo se guardan titular, marca y últimos 4 dígitos (nunca la tarjeta completa). */
export class MetodoPagoDto implements MetodoPagoCuerpo {
  @IsString()
  @MinLength(2, { message: 'Escribe el nombre del titular.' })
  @MaxLength(100)
  @Matches(/\S/, { message: 'Escribe el nombre del titular.' })
  titular!: string;

  @IsIn(MARCAS_TARJETA, { message: 'Elige una marca de tarjeta válida.' })
  marca!: MarcaTarjeta;

  @Matches(/^\d{4}$/, { message: 'Escribe los últimos 4 dígitos de la tarjeta.' })
  ultimos4!: string;
}
