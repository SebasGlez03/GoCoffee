import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, Min } from 'class-validator';
import type { DireccionEntregaCuerpo } from '../../contrato/contrato';

export class DireccionEntregaDto implements DireccionEntregaCuerpo {
  @IsOptional()
  @IsInt()
  @Min(1)
  idDireccionEntrega?: number;

  @IsString()
  @IsNotEmpty({ message: 'Escribe la calle.' })
  calle!: string;

  @IsString()
  @Matches(/^\d{5}$/, { message: 'El código postal debe tener 5 dígitos.' })
  codigoPostal!: string;

  @IsString()
  @IsNotEmpty({ message: 'Escribe el número de la casa.' })
  numeroCasa!: string;

  @IsString()
  @IsNotEmpty({ message: 'Escribe el estado.' })
  estado!: string;
}
