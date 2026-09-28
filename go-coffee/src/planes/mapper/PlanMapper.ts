import { Plan } from "../../dominio/entidades";
import { CrearPlanDTO } from "../dto/crearPlanDto";
import { ModificarPlanDTO } from "../dto/modificarPlanDTO";
import { PlanDTO } from "../dto/planDto";

export class PlanMapper{
    static toDomain(dto: CrearPlanDTO): Plan{
        return {
            nombre: dto.nombre,
            cantidadBolsas: dto.cantidadBolsas,
            precio: dto.precio,
            fechaCreacion: new Date(),
            frecuenciaEntrega: dto.frecuenciaEntrega,
            estado: 'ACTUAL'
        }
    }

    static toUpdateDomain(dto: ModificarPlanDTO, planExistente: Plan): Plan {
        return {
            idPlan: planExistente.idPlan,
            nombre: dto.nombre ?? planExistente.nombre,
            cantidadBolsas: dto.cantidadBolsas ?? planExistente.cantidadBolsas,
            precio: dto.precio ?? planExistente.precio,
            frecuenciaEntrega: dto.frecuenciaEntrega ?? planExistente.frecuenciaEntrega,
            estado: dto.estadoPlan ?? planExistente.estado,
            fechaCreacion: new Date()
        };
    }

    static toDto(plan: Plan): PlanDTO {
        return {
            nombre: plan.nombre,
            cantidadBolsas: plan.cantidadBolsas,
            precio: plan.precio,
            remplazadoPorId: plan.remplazadoPorId ?? undefined,
            fechaCreacion: plan.fechaCreacion,
            estado: plan.estado,
            frecuenciaEntrega: plan.frecuenciaEntrega,
        }
    }
}