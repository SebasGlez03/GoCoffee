export interface Plan {
    idPlan: number;
    nombre: string;
    cantidadBolsas: number;
    precio: number;
    remplazadoPorId?: number;
    fechaCreacion?: Date;
    estado?: EstadoPlan;
    frecuenciaEntrega: FrecuenciaEntrega;
}

export type EstadoPlan = 'OBSOLETO' | 'ACTUAL' | 'INACTIVO';

export type FrecuenciaEntrega = 'SEMANAL' | 'QUINCENAL' | 'MENSUAL';

export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';

export type EstadoSuscripcion = 'ACTIVA' | 'PAUSADA' | 'SUSPENDIDA' | 'CANCELADA';

export interface CrearSuscripcion {
  planId: number;
  diaSemanaEntrega: DiaSemana;
  fechaInicio: string;
  direccionEntrega: {
    idDireccionEntrega?: number;
    calle: string;
    codigoPostal: string;
    numeroCasa: string;
    estado: string;
  };
  estadoSuscripcion: EstadoSuscripcion;

}

export interface Sesion {
  token: string;
  usuario: Usuario;
}

export interface Suscripcion extends Omit<CrearSuscripcion, 'planId'> {
  plan: Pick<Plan, 'idPlan' | 'nombre' | 'cantidadBolsas' | 'precio' | 'frecuenciaEntrega'> | null;
  ultimaEntregaPagada: {
    idEntrega: number;
    numCiclo: number;
    fechaProgramada: string;
    estadoEntrega: 'PROGRAMADA' | 'SALTADA' | 'ARMADA' | 'ENVIADA' | 'ENTREGADA';
  } | null;
  ciclos: unknown[];
  id: number;
  usuarioId: number | null;
}

export interface Usuario {
  idUsuario: number;
  email: string;
  rol: 'CLIENTE' | 'ADMINISTRADOR';
}

export interface PlanCambio {
  planId: number;
  nombre: string;
  precio: number;
  cantidadBolsas: number;
  frecuenciaEntrega: FrecuenciaEntrega;
}

export interface OpcionesCambioPlan {
  planes: PlanCambio[];
  numCicloAplicacion: number;
  fechaNuevoCiclo: string;
}

export interface SolicitudCambioPlan {
  idSolicitud: number;
  idSuscripcion: number;
  planAnterior: PlanCambio;
  planNuevo: PlanCambio;
  nombreAnterior: string | null;
  nombreNuevo: string | null;
  precioAnterior: number | null;
  precioNuevo: number | null;
  numCicloAplicacion: number;
  fechaNuevoCiclo: string;
  fechaSolicitud: string;
  fechaResolucion: string | null;
  fechaAplicacion: string | null;
  estadoSolicitud: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
  suscripcion: { usuarioId: number | null; usuario: { email: string } | null };
}
