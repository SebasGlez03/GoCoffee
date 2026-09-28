export class PlanNoEncontradoError extends Error {
  constructor(idPlan: number) {
    super(`No existe el idPlan ${idPlan}`);
  }
}