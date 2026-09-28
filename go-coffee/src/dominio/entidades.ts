import {
  EstadoCobro,
  EstadoEntrega,
  EstadoPlan,
  EstadoSolicitud,
  EstadoSuscripcion,
  FrecuenciaEntrega,
  Rol,
} from './tipos';

export interface Usuario {
  idUsuario: number;
  email: string;
  contrasenia: string;
  suscripciones: Suscripcion[];
  rol: Rol;
}

export interface Suscripcion {
  idSuscripcion: number;
  diaSemanaEntrega: string;
  fechaInicio: Date;
  direccionEntrega: DireccionEntrega;
  estadoSuscripcion: EstadoSuscripcion;
  ciclos: Ciclo[];
}

export interface DireccionEntrega {
  idDireccionEntrega: number;
  calle: string;
  codigoPostal: string;
  numeroCasa: string;
  estado: string;
}

// TODO: Hay que poner la especificacion de los planes en base al negocio del cafe
export interface Plan {
  idPlan: string;
  nombre: string;
  cantidadBolsas: number;
  precio: number;
  remplazadoPorId?: number;
  fechaCreacion: Date;
  estado: EstadoPlan;
  frecuenciaEntrega: FrecuenciaEntrega;
}

export interface Ciclo {
  idCiclo: number;
  fechaProgramada: Date;
  numCiclo: number;
  entrega: Entrega;
  cobro: Cobro;
}

export interface Cobro {
  idCobro: number;
  fechaCobro: Date;
  estado: EstadoCobro;
}

export interface Entrega {
  idEntrega: number;
  fechaProgramada: Date;
  estadoEntrega: EstadoEntrega;
}

export interface SolicitudCambioPlanSuscrito {
  id: number;
  suscripcion: Suscripcion;
  planAnterior: Plan;
  planNuevo: Plan;
  fechaNuevoCiclo: Date;
  fechaSolicitud: Date;
  fechaResolucion: Date;
  estadoSolicitud: EstadoSolicitud;
}
