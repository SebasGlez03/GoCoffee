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

export type DiaSemana =
  | 'LUNES'
  | 'MARTES'
  | 'MIERCOLES'
  | 'JUEVES'
  | 'VIERNES'
  | 'SABADO'
  | 'DOMINGO';

export type EstadoSuscripcion =
  'ACTIVA' | 'PAUSADA' | 'SUSPENDIDA' | 'CANCELADA';

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
  plan: Pick<
    Plan,
    'idPlan' | 'nombre' | 'cantidadBolsas' | 'precio' | 'frecuenciaEntrega'
  > | null;
  ultimaEntregaPagada: {
    idEntrega: number;
    numCiclo: number;
    fechaProgramada: string;
    estadoEntrega:
      'PROGRAMADA' | 'SALTADA' | 'ARMADA' | 'ENVIADA' | 'ENTREGADA';
  } | null;
  ciclos: CicloSuscripcion[];
  id: number;
  usuarioId: number | null;
  motivoSuspension?: string | null;
}

export interface CicloSuscripcion {
  idCiclo: number;
  numCiclo: number;
  fechaProgramada: string;
  planIdAplicado: number | null;
  precioAplicado: number | null;
  entrega: {
    idEntrega: number;
    fechaProgramada: string;
    estadoEntrega:
      'PROGRAMADA' | 'SALTADA' | 'ARMADA' | 'ENVIADA' | 'ENTREGADA';
  } | null;
  cobro: {
    idCobro: number;
    fechaCobro: string;
    estado: 'PAGADO' | 'FALLIDO';
  } | null;
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
  ciclosAplicacion: { numCiclo: number; fecha: string }[];
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

export interface MetodoPago {
  titular: string;
  marca: 'VISA' | 'MASTERCARD' | 'AMEX' | 'OTRA';
  ultimos4: string;
  actualizadoEn: string;
}

export interface Cobro {
  idCobro: number;
  fechaCobro: string;
  estadoCobro: 'PAGADO' | 'FALLIDO';
  monto: number | null;
  referencia: string | null;
  ciclo: {
    numCiclo: number;
    fechaProgramada: string;
    suscripcion: { idSuscripcion: number } | null;
  } | null;
  registradoPor: { email: string } | null;
}

export interface CicloAdministracion {
  idCiclo: number;
  numCiclo: number;
  fechaProgramada: string;
  entrega: CicloSuscripcion['entrega'];
  suscripcionId: number | null;
  suscripcion: {
    idSuscripcion: number;
    usuario: { email: string } | null;
    plan: { nombre: string };
  } | null;
  cobros: {
    idCobro: number;
    fechaCobro: string;
    estadoCobro: 'PAGADO' | 'FALLIDO';
    monto: number | null;
  }[];
}
