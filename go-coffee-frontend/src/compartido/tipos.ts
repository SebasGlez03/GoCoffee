/*
 * Tipos de los datos que viajan entre el portal y el servicio.
 * NO se describen aquí: se importan del contrato que declara el propio
 * servicio (go-coffee/src/contrato/contrato.ts, alias "@contrato").
 * `Json<T>` convierte las fechas del servidor (Date) en texto ISO, que es
 * como llegan por la red.
 */
import type {
  CicloAdministracionRespuesta,
  CicloRespuesta,
  CobroRespuesta,
  CobroRegistradoRespuesta,
  Json,
  MetodoPagoRespuesta,
  OpcionesCambioPlanRespuesta,
  PlanRespuesta,
  SolicitudCambioPlanRespuesta,
  SuscripcionRespuesta,
} from '@contrato';

export type {
  CredencialesCuerpo,
  CrearSuscripcionCuerpo,
  DiaSemana,
  EstadoCobro,
  EstadoEntrega,
  EstadoSolicitud,
  EstadoSuscripcion,
  FiltrosCiclosConsulta,
  FrecuenciaEntrega,
  MarcaTarjeta,
  MetodoPagoCuerpo,
  PlanCambio,
  RegistrarCobroCuerpo,
  RespuestaError,
  RespuestaLogin,
  Rol,
  Sobre,
  UsuarioPublico as Usuario,
} from '@contrato';

export type Plan = Json<PlanRespuesta>;
export type Suscripcion = Json<SuscripcionRespuesta>;
export type Ciclo = Json<CicloRespuesta>;
export type OpcionesCambioPlan = Json<OpcionesCambioPlanRespuesta>;
export type SolicitudCambioPlan = Json<SolicitudCambioPlanRespuesta>;
export type MetodoPago = Json<MetodoPagoRespuesta>;
export type Cobro = Json<CobroRespuesta>;
export type CobroRegistrado = Json<CobroRegistradoRespuesta>;
export type CicloAdministracion = Json<CicloAdministracionRespuesta>;
