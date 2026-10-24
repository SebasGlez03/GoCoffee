import { Inject, Injectable } from '@nestjs/common';
import { PLAN_REPOSITORY } from './infra/planes.tokens';
import type { PlanesRepository } from './dominio/planes.repository';
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
import { EstadoPlan, FrecuenciaEntrega } from '../dominio/tipos';

@Injectable()
export class PlanesService {
  constructor(
    @Inject(PLAN_REPOSITORY) private readonly repo: PlanesRepository,
  ) {}

  async buscarPlanPorId(id: number): Promise<Plan> {
    if (!Number.isInteger(id) || id <= 0) {
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
    if (!Number.isInteger(dto.cantidadBolsas) || dto.cantidadBolsas <= 0) {
      throw new CantidadBolsasInvalidaError();
    }
    if (!Number.isFinite(dto.precio) || dto.precio < 0) {
      throw new PrecioInvalidoError();
    }
    const frecuenciasValidas: FrecuenciaEntrega[] = [
      'SEMANAL',
      'QUINCENAL',
      'MENSUAL',
    ];
    if (!frecuenciasValidas.includes(dto.frecuenciaEntrega)) {
      throw new FrecuenciaPlanInvalidoError();
    }

    const nuevoPlan = PlanMapper.toDomain(dto);
    return await this.repo.save(nuevoPlan);
  }

  async modificarNuevoPlan(dto: ModificarPlanDTO): Promise<Plan> {
    if (!dto) {
      throw new PlanDatosRequeridosError();
    }

    if (!Number.isInteger(dto.id) || dto.id <= 0) {
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
      if (!Number.isInteger(dto.cantidadBolsas) || dto.cantidadBolsas <= 0) {
        throw new CantidadBolsasInvalidaError();
      }
    }

    if (dto.precio !== undefined) {
      if (!Number.isFinite(dto.precio) || dto.precio < 0) {
        throw new PrecioInvalidoError();
      }
    }
    if (
      dto.frecuenciaEntrega !== undefined &&
      !['SEMANAL', 'QUINCENAL', 'MENSUAL'].includes(dto.frecuenciaEntrega)
    ) {
      throw new FrecuenciaPlanInvalidoError();
    }
    const estadosValidos: EstadoPlan[] = ['OBSOLETO', 'ACTUAL', 'INACTIVO'];
    if (
      dto.estadoPlan !== undefined &&
      !estadosValidos.includes(dto.estadoPlan)
    ) {
      throw new EstadoPlanInvalidoError(dto.estadoPlan, estadosValidos);
    }
    const planModificado = PlanMapper.toUpdateDomain(dto, planExistente);

    return await this.repo.update(planModificado);
  }

  async eliminarPlan(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
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
