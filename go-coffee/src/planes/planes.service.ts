import { Inject, Injectable } from '@nestjs/common';
import { PLAN_REPOSITORY } from './infra/planes.tokens';
import { PlanMemoriaRepository } from './infra/planes-memoria.repository';
import { Plan } from '../dominio/entidades';
import {
  CantidadBolsasInvalidaError,
  EstadoPlanInvalidoError,
  FrecuenciaPlanInvalidoError,
  IdInvalidoError,
  NombrePlanVacioError,
  PlanDatosRequeridosError,
  PlanNoEncontradoError,
  PrecioInvalidoError,
} from '../dominio/errores';
import { CrearPlanDTO } from './dto/crearPlanDto';
import { PlanMapper } from './mapper/PlanMapper';
import { ModificarPlanDTO } from './dto/modificarPlanDTO';
import { EstadoPlan } from '../dominio/tipos';

@Injectable()
export class PlanesService {
  constructor(
    @Inject(PLAN_REPOSITORY) private readonly repo: PlanMemoriaRepository,
  ) {}

  async buscarPlanPorId(id: number): Promise<Plan> {
    if (id === undefined || id === null || Number.isNaN(id) || id <= 0) {
      throw new IdInvalidoError();
    }

    const plan = await this.repo.findById(id);
    if (!plan) {
      throw new PlanNoEncontradoError(id);
    }

    return plan;
  }

  async buscarTodosLosPlanes(): Promise<Plan[]> {
    return this.repo.findAll();
  }

  async guardarNuevoPlan(dto: CrearPlanDTO): Promise<Plan> {
    if (!dto) {
      throw new PlanDatosRequeridosError();
    }
    if (!dto.nombre || dto.nombre.trim() === '') {
      throw new NombrePlanVacioError();
    }
    if (
      dto.cantidadBolsas === undefined ||
      dto.cantidadBolsas === null ||
      dto.cantidadBolsas <= 0
    ) {
      throw new CantidadBolsasInvalidaError();
    }
    if (dto.precio === undefined || dto.precio === null || dto.precio < 0) {
      throw new PrecioInvalidoError();
    }
    if (!dto.frecuenciaEntrega) {
      throw new FrecuenciaPlanInvalidoError();
    }

    const nuevoPlan = PlanMapper.toDomain(dto);
    return await this.repo.save(nuevoPlan);
  }

  async modificarNuevoPlan(dto: ModificarPlanDTO): Promise<Plan> {
    if (!dto) {
      throw new PlanDatosRequeridosError();
    }

    if (
      dto.id === undefined ||
      dto.id === null ||
      Number.isNaN(dto.id) ||
      dto.id <= 0
    ) {
      throw new IdInvalidoError();
    }

    const planExistente = await this.repo.findById(dto.id);
    if (!planExistente) {
      throw new PlanNoEncontradoError(dto.id);
    }

    if (dto.nombre !== undefined) {
      if (!dto.nombre || dto.nombre.trim() === '') {
        throw new NombrePlanVacioError();
      }
    }

    if (dto.cantidadBolsas !== undefined) {
      if (dto.cantidadBolsas <= 0) {
        throw new CantidadBolsasInvalidaError();
      }
    }

    if (dto.precio !== undefined) {
      if (dto.precio < 0) {
        throw new PrecioInvalidoError();
      }
    }
    const planModificado = PlanMapper.toUpdateDomain(dto, planExistente);

    return await this.repo.update(planModificado);
  }

  async eliminarPlan(id: number): Promise<void> {
    if (id === undefined || id === null || Number.isNaN(id) || id <= 0) {
      throw new IdInvalidoError();
    }

    const plan = await this.repo.findById(id);
    if (!plan) {
      throw new PlanNoEncontradoError(id);
    }

    await this.repo.delete(id);
  }

  async buscarPlanesPorEstado(estado: EstadoPlan): Promise<Plan[]> {
    const estadosValidos: EstadoPlan[] = ['OBSOLETO', 'ACTUAL', 'INACTIVO'];

    if (!estado || !estadosValidos.includes(estado)) {
      throw new EstadoPlanInvalidoError(estado, estadosValidos);
    }

    return await this.repo.findByEstado(estado);
  }
}
