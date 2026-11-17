/*
 * CONTRATO HTTP DE GO_COFFEE
 * ------------------------------------------------------------------
 * Este archivo describe, UNA SOLA VEZ, la forma de los datos que viajan
 * entre el servicio (este backend) y el portal del cliente
 * (go-coffee-frontend). El portal importa estos mismos tipos con
 * `import type` (alias "@contrato"), así que si aquí cambia un campo,
 * el portal deja de compilar hasta que se ajuste.
 *
 * REGLA: aquí solo van tipos y constantes puras. No importar Nest,
 * Prisma, class-validator ni nada que dependa del servidor.
 *
 * Las respuestas se describen tal como las produce el servicio (con
 * objetos Date). Lo que llega al portal es `Json<T>`: el mismo tipo con
 * las fechas convertidas a texto ISO, que es lo que hace JSON.
 */
import type {
  DiaSemana,
  EstadoCobro,
  EstadoEntrega,
  EstadoPlan,
  EstadoSolicitud,
  EstadoSuscripcion,
  FrecuenciaEntrega,
  Rol,
} from '../dominio/tipos';

/** Listas de valores válidos (las mismas que valida el servicio). */
export {
  DIAS_SEMANA,
  ESTADOS_COBRO,
  ESTADOS_ENTREGA,
  ESTADOS_PLAN,
  ESTADOS_SOLICITUD,
  ESTADOS_SUSCRIPCION,
  FRECUENCIAS_ENTREGA,
  ROLES,
} from '../dominio/tipos';

export type {
  DiaSemana,
  EstadoCobro,
  EstadoEntrega,
  EstadoPlan,
  EstadoSolicitud,
  EstadoSuscripcion,
  FrecuenciaEntrega,
  Rol,
};

/** Convierte un tipo del servidor a lo que realmente viaja por JSON. */
export type Json<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? Json<U>[]
    : T extends object
      ? { [K in keyof T]: Json<T[K]> }
      : T;

/* ------------------------------------------------------------------ */
/* Formato uniforme de respuesta                                       */
/* ------------------------------------------------------------------ */

/** Toda respuesta exitosa viene envuelta en este sobre (SobreInterceptor). */
export interface Sobre<T> {
  data: T;
  meta: {
    ruta: string;
    duracionMs: number;
    timestamp: string;
  };
}

/** Toda respuesta con error tiene esta forma (FiltroErrores). */
export interface RespuestaError {
  statusCode: number;
  /** Código del error: nombre del error de dominio o nombre HTTP. */
  error: string;
  /** Texto para el usuario; en errores de validación es una lista. */
  message: string | string[];
  path: string;
  timestamp: string;
}

/* ------------------------------------------------------------------ */
/* Autenticación                                                        */
/* ------------------------------------------------------------------ */

export interface CredencialesCuerpo {
  email: string;
  password: string;
}

export interface UsuarioPublico {
  idUsuario: number;
  email: string;
  rol: Rol;
}

export interface RespuestaLogin {
  access_token: string;
  user: UsuarioPublico;
}

/* ------------------------------------------------------------------ */
/* Planes                                                              */
/* ------------------------------------------------------------------ */

export interface PlanRespuesta {
  idPlan?: number;
  nombre: string;
  cantidadBolsas: number;
  precio: number;
  remplazadoPorId?: number;
  fechaCreacion: Date;
  estado: EstadoPlan;
  frecuenciaEntrega: FrecuenciaEntrega;
}

/* ------------------------------------------------------------------ */
/* Suscripciones                                                       */
/* ------------------------------------------------------------------ */

export interface DireccionEntregaCuerpo {
  idDireccionEntrega?: number;
  calle: string;
  codigoPostal: string;
  numeroCasa: string;
  estado: string;
}

export interface CrearSuscripcionCuerpo {
  planId: number;
  diaSemanaEntrega: DiaSemana;
  /** Fecha ISO futura. */
  fechaInicio: string;
  direccionEntrega: DireccionEntregaCuerpo;
  estadoSuscripcion: EstadoSuscripcion;
}

export interface ModificarSuscripcionCuerpo {
  diaSemanaEntrega?: DiaSemana;
  fechaInicio?: string;
  direccionEntrega?: DireccionEntregaCuerpo;
  estadoSuscripcion?: EstadoSuscripcion;
}

export interface PlanDeSuscripcion {
  idPlan: number;
  nombre: string;
  cantidadBolsas: number;
  precio: number;
  frecuenciaEntrega: FrecuenciaEntrega;
}

export interface CicloRespuesta {
  idCiclo: number;
  numCiclo: number;
  fechaProgramada: Date;
  planIdAplicado?: number | null;
  precioAplicado?: number | null;
  entrega: {
    idEntrega: number;
    fechaProgramada: Date;
    estadoEntrega: EstadoEntrega;
  } | null;
  cobro: {
    idCobro: number;
    fechaCobro: Date;
    estado: EstadoCobro;
  } | null;
}

export interface SuscripcionRespuesta {
  id: number;
  usuarioId: number | null;
  plan: PlanDeSuscripcion | null;
  diaSemanaEntrega: DiaSemana;
  fechaInicio: string;
  direccionEntrega: DireccionEntregaCuerpo & { idDireccionEntrega: number };
  estadoSuscripcion: EstadoSuscripcion;
  motivoSuspension?: string | null;
  ciclos: CicloRespuesta[];
  ultimaEntregaPagada: {
    idEntrega: number;
    numCiclo: number;
    fechaProgramada: string;
    estadoEntrega: EstadoEntrega;
  } | null;
}

/* ------------------------------------------------------------------ */
/* Cambios de plan                                                     */
/* ------------------------------------------------------------------ */

export interface PlanCambio {
  planId: number;
  nombre: string;
  precio: number;
  cantidadBolsas: number;
  frecuenciaEntrega: FrecuenciaEntrega;
}

export interface OpcionesCambioPlanRespuesta {
  planes: PlanCambio[];
  numCicloAplicacion: number;
  fechaNuevoCiclo: Date;
  ciclosAplicacion: { numCiclo: number; fecha: Date }[];
}

export interface SolicitarCambioPlanCuerpo {
  planId: number;
  precioEsperado: number;
  numCicloAplicacion: number;
}

export interface ResolverCambioPlanCuerpo {
  aceptar: boolean;
}

export interface SolicitudCambioPlanRespuesta {
  idSolicitud: number;
  idSuscripcion: number;
  planAnterior: PlanCambio;
  planNuevo: PlanCambio;
  nombreAnterior: string | null;
  nombreNuevo: string | null;
  precioAnterior: number | null;
  precioNuevo: number | null;
  numCicloAplicacion: number;
  fechaNuevoCiclo: Date;
  fechaSolicitud: Date;
  fechaResolucion: Date | null;
  fechaAplicacion: Date | null;
  estadoSolicitud: EstadoSolicitud;
  suscripcion: {
    usuarioId: number | null;
    usuario: { email: string } | null;
  };
}

/* ------------------------------------------------------------------ */
/* Cobros y método de pago                                              */
/* ------------------------------------------------------------------ */

export const MARCAS_TARJETA = ['VISA', 'MASTERCARD', 'AMEX', 'OTRA'] as const;
export type MarcaTarjeta = (typeof MARCAS_TARJETA)[number];

export interface MetodoPagoCuerpo {
  titular: string;
  marca: MarcaTarjeta;
  ultimos4: string;
}

export interface MetodoPagoRespuesta extends MetodoPagoCuerpo {
  actualizadoEn: Date;
}

export interface CobroRespuesta {
  idCobro: number;
  fechaCobro: Date;
  estadoCobro: EstadoCobro;
  monto: number | null;
  referencia: string | null;
  ciclo: {
    numCiclo: number;
    fechaProgramada: Date;
    suscripcion: { idSuscripcion: number } | null;
  } | null;
  registradoPor: { email: string } | null;
}

/** Respuesta de POST /cobros (backoffice). */
export interface CobroRegistradoRespuesta
  extends Omit<CobroRespuesta, 'ciclo'> {
  cicloId: number | null;
}

export interface RegistrarCobroCuerpo {
  idSuscripcion: number;
  numCiclo: number;
  estadoCobro: EstadoCobro;
  referencia?: string;
}

/* ------------------------------------------------------------------ */
/* Administración (backoffice)                                          */
/* ------------------------------------------------------------------ */

export interface FiltrosCiclosConsulta {
  desde?: string;
  hasta?: string;
  estadoEntrega?: EstadoEntrega;
  estadoCobro?: EstadoCobro;
  idSuscripcion?: number;
}

export interface CicloAdministracionRespuesta {
  idCiclo: number;
  numCiclo: number;
  fechaProgramada: Date;
  suscripcionId: number | null;
  entrega: {
    idEntrega: number;
    fechaEntrega: Date;
    estadoEntrega: EstadoEntrega;
  } | null;
  suscripcion: {
    idSuscripcion: number;
    usuario: { email: string } | null;
    plan: { nombre: string };
  } | null;
  cobros: {
    idCobro: number;
    fechaCobro: Date;
    estadoCobro: EstadoCobro;
    monto: number | null;
  }[];
}
