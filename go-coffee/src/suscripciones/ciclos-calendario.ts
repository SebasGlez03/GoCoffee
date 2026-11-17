import { DiaSemana, FrecuenciaEntrega } from '../dominio/tipos';

export function siguienteFecha(fecha: Date, frecuencia: FrecuenciaEntrega): Date {
  const dias = { SEMANAL: 7, QUINCENAL: 15, MENSUAL: 31 }[frecuencia];
  if (!dias) throw new Error('Frecuencia de entrega inválida');
  const nueva = new Date(fecha);
  nueva.setUTCDate(nueva.getUTCDate() + dias);
  return nueva;
}

export function proximoDia(fecha: Date, dia: DiaSemana): Date {
  const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
  const nueva = new Date(fecha);
  nueva.setUTCDate(nueva.getUTCDate() + (dias.indexOf(dia) - nueva.getUTCDay() + 7) % 7);
  return nueva;
}
