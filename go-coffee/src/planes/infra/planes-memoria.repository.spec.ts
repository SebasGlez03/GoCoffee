import { Plan } from '../../dominio/entidades';
import { PlanNoEncontradoError } from '../../dominio/errores';
import { PlanMemoriaRepository } from './planes-memoria.repository';

describe('PlanMemoriaRepository', () => {
  let repository: PlanMemoriaRepository;

  const planBase: Plan = {
    nombre: 'Clásico',
    cantidadBolsas: 2,
    precio: 250,
    fechaCreacion: new Date('2026-01-01'),
    estado: 'ACTUAL',
    frecuenciaEntrega: 'SEMANAL',
  };

  beforeEach(() => {
    repository = new PlanMemoriaRepository();
  });

  it('conserva la relación entre el plan obsoleto y su reemplazo', async () => {
    const planOriginal = await repository.save({ ...planBase });
    const planNuevo = await repository.update({
      ...planOriginal,
      nombre: 'Clásico actualizado',
    });

    expect(planNuevo.idPlan).toBe(2);
    await expect(
      repository.findById(planOriginal.idPlan!),
    ).resolves.toMatchObject({
      estado: 'OBSOLETO',
      remplazadoPorId: planNuevo.idPlan,
    });
    await expect(repository.findById(planNuevo.idPlan!)).resolves.toMatchObject(
      {
        nombre: 'Clásico actualizado',
        estado: 'ACTUAL',
      },
    );
  });

  it('falla explícitamente al actualizar un plan inexistente', async () => {
    await expect(
      repository.update({ ...planBase, idPlan: 999 }),
    ).rejects.toThrow(PlanNoEncontradoError);
  });
});
