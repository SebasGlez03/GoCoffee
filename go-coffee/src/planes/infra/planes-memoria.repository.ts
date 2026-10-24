import { Plan } from '../../dominio/entidades';
import { EstadoPlan } from '../../dominio/tipos';
import { PlanesRepository } from '../dominio/planes.repository';
import { IdInvalidoError, PlanNoEncontradoError } from '../../dominio/errores';

export class PlanMemoriaRepository implements PlanesRepository {
  private planes: Plan[] = [];
  private siguienteId = 1;

  async findById(id: number): Promise<Plan | null> {
    const plan = this.planes.find((p) => p.idPlan === id);

    if (plan) {
      const copiaPlan = { ...plan };
      return Promise.resolve(copiaPlan);
    } else {
      return Promise.resolve(null);
    }
  }

  async findAll(): Promise<Plan[]> {
    const copiaPlanes = this.planes.map((plan) => ({ ...plan }));
    return Promise.resolve(copiaPlanes);
  }

  async save(entidad: Plan): Promise<Plan> {
    entidad.idPlan = this.siguienteId++;
    this.planes.push({ ...entidad });
    return Promise.resolve({ ...entidad });
  }

  update(entidad: Plan): Promise<Plan> {
    if (entidad.idPlan === undefined) {
      return Promise.reject(new IdInvalidoError());
    }
    const index = this.planes.findIndex((p) => p.idPlan === entidad.idPlan);
    if (index === -1) {
      return Promise.reject(new PlanNoEncontradoError(entidad.idPlan));
    }

    const idPlanNuevo = this.siguienteId++;
    this.planes[index] = {
      ...this.planes[index],
      remplazadoPorId: idPlanNuevo,
      estado: 'OBSOLETO',
    };
    const planNuevo: Plan = {
      ...entidad,
      idPlan: idPlanNuevo,
      remplazadoPorId: undefined,
    };
    this.planes.push(planNuevo);

    return Promise.resolve({ ...planNuevo });
  }

  async delete(id: number): Promise<void> {
    this.planes = this.planes.filter((p) => p.idPlan !== id);
    return Promise.resolve();
  }

  async findByEstado(estado: EstadoPlan): Promise<Plan[]> {
    const filtrados = this.planes.filter((p) => p.estado === estado);
    return Promise.resolve(filtrados.map((p) => ({ ...p })));
  }
}
