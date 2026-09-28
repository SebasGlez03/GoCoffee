import { Suscripcion, DireccionEntrega, Ciclo } from 'src/dominio/entidades';
import { EstadoSuscripcion } from 'src/dominio/tipos';

export interface SuscripcionResponseDto {
  id: number;
  diaSemanaEntrega: string;
  fechaInicio: string;
  direccionEntrega: DireccionEntrega;
  estadoSuscripcion: EstadoSuscripcion;
  ciclos: Ciclo[];
}

/*
    El profe puso esta explicacion y la voy a poner para no perderme tampoco.
    "Todo lo que sale de la API pasa por aqui: convierte (en este caso) los date a texto, ya que JSON no tiene tipo fecha"

    TODO: Aqui tengo la duda de si *estadoSuscripcion* va a regresar el texto del estado, o causara un error por ser un tipo.
*/
export function aSuscripcion(s: Suscripcion): SuscripcionResponseDto {
  return {
    id: s.idSuscripcion,
    diaSemanaEntrega: s.diaSemanaEntrega,
    fechaInicio: s.fechaInicio.toISOString(),
    direccionEntrega: s.direccionEntrega,
    estadoSuscripcion: s.estadoSuscripcion,
    ciclos: s.ciclos,
  };
}
