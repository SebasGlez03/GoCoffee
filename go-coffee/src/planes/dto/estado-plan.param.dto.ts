import { IsIn } from 'class-validator';
import { ESTADOS_PLAN } from '../../dominio/tipos';
import type { EstadoPlan } from '../../dominio/tipos';

/** Valida el parámetro :estado de GET /planes/estado/:estado. */
export class EstadoPlanParamDto {
  @IsIn(ESTADOS_PLAN, {
    message: `El estado debe ser uno de: ${ESTADOS_PLAN.join(', ')}.`,
  })
  estado!: EstadoPlan;
}
