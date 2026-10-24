import type { EstadoPlan, FrecuenciaEntrega } from '../../dominio/tipos';

export interface PlanDTO {
  idPlan?: number;
  nombre: string;
  cantidadBolsas: number;
  precio: number;
  remplazadoPorId?: number;
  fechaCreacion: Date;
  estado: EstadoPlan;
  frecuenciaEntrega: FrecuenciaEntrega;
}
