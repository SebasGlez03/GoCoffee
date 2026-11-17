import { api } from '../compartido/api/cliente';
import type { Plan } from '../compartido/tipos';

/** Catálogo público: solo los planes vigentes (estado ACTUAL). */
export function traerPlanesVigentes() {
  return api.obtener<Plan[]>('/planes/estado/ACTUAL');
}

export function traerPlan(id: number) {
  return api.obtener<Plan>(`/planes/${id}`);
}
