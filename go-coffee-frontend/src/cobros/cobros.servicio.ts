import { api } from '../compartido/api/cliente';
import type { Cobro, MetodoPago, MetodoPagoCuerpo } from '../compartido/tipos';

export function traerMetodoPago() {
  return api.obtener<MetodoPago | null>('/cobros/metodo-pago');
}

export function guardarMetodoPago(datos: MetodoPagoCuerpo) {
  return api.reemplazar<MetodoPago>('/cobros/metodo-pago', datos);
}

export function traerHistorialCobros() {
  return api.obtener<Cobro[]>('/cobros/historial');
}
