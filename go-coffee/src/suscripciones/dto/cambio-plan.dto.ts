import { IsBoolean, IsInt, IsNumber, Min } from 'class-validator';
import type {
  ResolverCambioPlanCuerpo,
  SolicitarCambioPlanCuerpo,
} from '../../contrato/contrato';

export class SolicitarCambioDto implements SolicitarCambioPlanCuerpo {
  @IsInt() @Min(1) planId!: number;
  @IsNumber() @Min(0) precioEsperado!: number;
  @IsInt() @Min(1) numCicloAplicacion!: number;
}

export class ResolverCambioDto implements ResolverCambioPlanCuerpo {
  @IsBoolean() aceptar!: boolean;
}
