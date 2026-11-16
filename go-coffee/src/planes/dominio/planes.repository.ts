import { Plan } from "../../dominio/entidades";
import { Repository } from "../../dominio/entidades-repo";
import { EstadoPlan } from "../../dominio/tipos";


export interface PlanesRepository extends Repository<Plan>{
    findByEstado(estado: EstadoPlan): Promise<Plan[]>
}