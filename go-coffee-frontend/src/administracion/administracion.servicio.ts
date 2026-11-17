import { api } from '../compartido/api/cliente';
import type {
  CicloAdministracion,
  CobroRegistrado,
  FiltrosCiclosConsulta,
  RegistrarCobroCuerpo,
  SolicitudCambioPlan,
} from '../compartido/tipos';

export function traerCiclos(filtros: FiltrosCiclosConsulta) {
  return api.obtener<CicloAdministracion[]>('/administracion/ciclos', filtros);
}

export function registrarCobro(datos: RegistrarCobroCuerpo) {
  return api.crear<CobroRegistrado>('/cobros', datos);
}

export function traerSolicitudesCambio() {
  return api.obtener<SolicitudCambioPlan[]>('/cambios-plan');
}

export function resolverSolicitud(idSolicitud: number, aceptar: boolean) {
  return api.modificar<SolicitudCambioPlan>(`/cambios-plan/${idSolicitud}/resolucion`, { aceptar });
}
