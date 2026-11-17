import type { Ciclo, Suscripcion } from '../../dominio/entidades';
import type { SuscripcionRespuesta } from '../../contrato/contrato';

/**
 * La respuesta de una suscripción está declarada en el contrato compartido
 * (src/contrato/contrato.ts), que también usa el portal del cliente.
 */
export type SuscripcionResponseDto = SuscripcionRespuesta;


/*
    El profe puso esta explicacion y la voy a poner para no perderme tampoco.
    "Todo lo que sale de la API pasa por aqui: convierte (en este caso) los date a texto, ya que JSON no tiene tipo fecha"

    TODO: Aqui tengo la duda de si *estadoSuscripcion* va a regresar el texto del estado, o causara un error por ser un tipo.
*/
export function aSuscripcion(s: Suscripcion): SuscripcionResponseDto {
  const ultimaPagada = s.ciclos
    .filter(
      (c) =>
        c.cobro?.estado === 'PAGADO' &&
        c.entrega &&
        c.entrega.estadoEntrega !== 'SALTADA',
    )
    .reduce<Ciclo | null>(
      (ultima, c) =>
        !ultima || c.entrega!.fechaProgramada > ultima.entrega!.fechaProgramada
          ? c
          : ultima,
      null,
    );
  return {
    id: s.idSuscripcion,
    usuarioId: s.usuarioId,
    plan: s.plan ?? null,
    diaSemanaEntrega: s.diaSemanaEntrega,
    fechaInicio: s.fechaInicio.toISOString(),
    direccionEntrega: s.direccionEntrega,
    estadoSuscripcion: s.estadoSuscripcion,
    motivoSuspension: s.motivoSuspension ?? null,
    ciclos: s.ciclos,
    ultimaEntregaPagada: ultimaPagada?.entrega
      ? {
          idEntrega: ultimaPagada.entrega.idEntrega,
          numCiclo: ultimaPagada.numCiclo,
          fechaProgramada: ultimaPagada.entrega.fechaProgramada.toISOString(),
          estadoEntrega: ultimaPagada.entrega.estadoEntrega,
        }
      : null,
  };
}
