import { Inject, Injectable } from '@nestjs/common';
import { PLAN_REPOSITORY } from './infra/planes.tokens';
import { PlanMemoriaRepository } from './infra/planes-memoria.repository';
import { Plan } from '../dominio/entidades';
import { PlanNoEncontradoError } from './errores/errores';
import { CrearPlanDTO } from './dto/crearPlanDto';
import { PlanMapper } from './mapper/PlanMapper';
import { ModificarPlanDTO } from './dto/modificarPlanDTO';
import { EstadoPlan } from '../dominio/tipos';

@Injectable()
export class PlanesService {
    constructor
    (@Inject(PLAN_REPOSITORY) private readonly repo: PlanMemoriaRepository){
    }

    async buscarPlanPorId(id: number): Promise<Plan>{
        if (id === undefined || id === null || Number.isNaN(id) || id <= 0) {
            throw new Error("El ID proporcionado no es válido.");
        }

        const plan = await this.repo.findById(id);
        if (!plan) {
            throw new PlanNoEncontradoError(id);
        }

        return plan;
    }

    async buscarTodosLosPlanes(): Promise<Plan[]>{
        return this.repo.findAll();
    }

    async guardarNuevoPlan(dto: CrearPlanDTO): Promise<Plan>{
        if (!dto) {
            throw new Error("Los datos del plan son requeridos.");
        }
        if (!dto.nombre || dto.nombre.trim() === "") {
            throw new Error("El nombre del plan es obligatorio.");
        }
        if (dto.cantidadBolsas === undefined || dto.cantidadBolsas === null || dto.cantidadBolsas <= 0) {
            throw new Error("La cantidad de bolsas debe ser un número mayor a cero.");
        }
        if (dto.precio === undefined || dto.precio === null || dto.precio < 0) {
            throw new Error("El precio no puede ser negativo.");
        }
        if (!dto.frecuenciaEntrega) {
            throw new Error("La frecuencia de entrega es obligatoria.");
        }

        const nuevoPlan = PlanMapper.toDomain(dto);
        return await this.repo.save(nuevoPlan);
    }

    async modificarNuevoPlan(dto: ModificarPlanDTO): Promise<Plan>{
        if (!dto) {
            throw new Error("Los datos para modificar el plan son requeridos.");
        }

        if (dto.id === undefined || dto.id === null || Number.isNaN(dto.id) || dto.id <= 0) {
             throw new Error("El ID del plan a modificar es obligatorio y debe ser un número válido.");
        }

        const planExistente = await this.repo.findById(dto.id);
        if (!planExistente) {
            throw new PlanNoEncontradoError(dto.id);
        }

        if (dto.nombre !== undefined) {
            if (!dto.nombre || dto.nombre.trim() === "") {
                throw new Error("El nombre no puede estar vacío.");
            }
        }

        if (dto.cantidadBolsas !== undefined) {
            if (dto.cantidadBolsas <= 0) {
                throw new Error("La cantidad de bolsas debe ser mayor a cero.");
            }
        }   

        if (dto.precio !== undefined) {
            if (dto.precio < 0) {
                throw new Error("El precio no puede ser negativo.");
            }
        }
        const planModificado = PlanMapper.toUpdateDomain(dto, planExistente);

        return await this.repo.update(planModificado);
    }

    async eliminarPlan(id: number): Promise<void> {
        if (id === undefined || id === null || Number.isNaN(id) || id <= 0) {
            throw new Error("El ID proporcionado para eliminar no es válido.");
        }

        const plan = await this.repo.findById(id);
        if (!plan) {
            throw new PlanNoEncontradoError(id);
        }

        await this.repo.delete(id);
    }

    async buscarPlanesPorEstado(estado: EstadoPlan): Promise<Plan[]>{
        const estadosValidos: EstadoPlan[] = ['OBSOLETO', 'ACTUAL', 'INACTIVO'];

        if (!estado || !estadosValidos.includes(estado)) {
            throw new Error(`El estado no es válido) debe ser ${estadosValidos.join(', ')}`);
        }

        return await this.repo.findByEstado(estado);
    }

}
