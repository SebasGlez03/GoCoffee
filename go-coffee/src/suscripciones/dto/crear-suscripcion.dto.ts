import { DireccionEntrega, Ciclo } from "src/dominio/entidades";
import { EstadoSuscripcion } from "src/dominio/tipos";

export interface CrearSuscripcionDto {
  diaSemanaEntrega: string;
  fechaInicio: Date;
  direccionEntrega: DireccionEntrega;
  estadoSuscripcion: EstadoSuscripcion;
  ciclos: Ciclo[];
}
