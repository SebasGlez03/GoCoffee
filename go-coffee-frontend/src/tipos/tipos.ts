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
