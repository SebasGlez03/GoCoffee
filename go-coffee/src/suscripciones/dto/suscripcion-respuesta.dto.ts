import { DireccionEntrega, Ciclo, Suscripcion } from "../../dominio/entidades";
import { DiaSemana, EstadoSuscripcion } from "../../dominio/tipos";


export interface SuscripcionResponseDto {
  id: number;
  usuarioId: number | null;
  plan: NonNullable<Suscripcion['plan']> | null;
  diaSemanaEntrega: DiaSemana;
  fechaInicio: string;
  direccionEntrega: DireccionEntrega;
  estadoSuscripcion: EstadoSuscripcion;
  ciclos: Ciclo[];
  ultimaEntregaPagada: {
    idEntrega: number;
    numCiclo: number;
    fechaProgramada: string;
    estadoEntrega: NonNullable<Ciclo['entrega']>['estadoEntrega'];
  } | null;
}

/*
    El profe puso esta explicacion y la voy a poner para no perderme tampoco.
    "Todo lo que sale de la API pasa por aqui: convierte (en este caso) los date a texto, ya que JSON no tiene tipo fecha"

    TODO: Aqui tengo la duda de si *estadoSuscripcion* va a regresar el texto del estado, o causara un error por ser un tipo.
*/
export function aSuscripcion(s: Suscripcion): SuscripcionResponseDto {
  const ultimaPagada = s.ciclos
    .filter((c) => c.cobro?.estado === 'PAGADO' && c.entrega && c.entrega.estadoEntrega !== 'SALTADA')
    .reduce<Ciclo | null>((ultima, c) => !ultima || c.entrega!.fechaProgramada > ultima.entrega!.fechaProgramada ? c : ultima, null);
  return {
    id: s.idSuscripcion,
    usuarioId: s.usuarioId,
    plan: s.plan ?? null,
    diaSemanaEntrega: s.diaSemanaEntrega,
    fechaInicio: s.fechaInicio.toISOString(),
    direccionEntrega: s.direccionEntrega,
    estadoSuscripcion: s.estadoSuscripcion,
    ciclos: s.ciclos,
    ultimaEntregaPagada: ultimaPagada?.entrega ? {
      idEntrega: ultimaPagada.entrega.idEntrega,
      numCiclo: ultimaPagada.numCiclo,
      fechaProgramada: ultimaPagada.entrega.fechaProgramada.toISOString(),
      estadoEntrega: ultimaPagada.entrega.estadoEntrega,
    } : null,
  };
}
