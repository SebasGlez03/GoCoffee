import { Plan } from "../../dominio/entidades";
import { EstadoPlan } from "../../dominio/tipos";
import { PlanesRepository } from "../dominio/planes.repository";

export class PlanMemoriaRepository implements PlanesRepository{
    private planes: Plan[] = [];
    private siguienteId = 1;

    async findById(id: number): Promise<Plan | null> {
        const plan = this.planes.find((p) => p.idPlan === id);

        if(plan){
            const copiaPlan = {...plan};
            return Promise.resolve(copiaPlan);
        }
        else{
            return Promise.resolve(null);
        }
    }

    async findAll(): Promise<Plan[]> {
        const copiaPlanes = this.planes.map(plan => ({ ...plan }));
        return Promise.resolve(copiaPlanes);
    }

    async save(entidad: Plan): Promise<Plan> {
        entidad.idPlan = this.siguienteId++;
        this.planes.push({ ...entidad });
        return Promise.resolve({ ...entidad });
    }

    async update(entidad: Plan): Promise<Plan> {
        const index = this.planes.findIndex(p => p.idPlan === entidad.idPlan);
        if (index !== -1) {
            entidad.idPlan =  this.siguienteId++;
            this.planes[index].remplazadoPorId = this.siguienteId;
            this.planes[index].estado = "OBSOLETO";
            this.planes.push({...entidad});
        }

        return Promise.resolve({...entidad})
    }

    async delete(id: number): Promise<void> {
        this.planes = this.planes.filter(p => p.idPlan !== id);
        return Promise.resolve();
    }

    async findByEstado(estado: EstadoPlan): Promise<Plan[]> {
        const filtrados = this.planes.filter(p => p.estado === estado);
         return Promise.resolve(filtrados.map(p => ({ ...p })));
    }
}