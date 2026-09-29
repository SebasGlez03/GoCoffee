import { DireccionEntrega, Ciclo } from "../../dominio/entidades";
import { EstadoSuscripcion } from "../../dominio/tipos";

export interface ModificarSuscripcionDto {
  id: number;
  diaSemanaEntrega?: string;
  fechaInicio?: Date;
  direccionEntrega?: DireccionEntrega;
  estadoSuscripcion?: EstadoSuscripcion;
  ciclos?: Ciclo[];
}