import { Suscripcion } from "../../dominio/entidades";
import { Repository, NuevaSuscripcion } from "../../dominio/entidades-repo";


export interface SuscripcionRepository extends Omit<Repository<Suscripcion>, 'save'> {
  // Busca una suscripción no cancelada; las canceladas se conservan como historial.
  findByUsuarioYPlan(usuarioId: number, planId: number): Promise<Suscripcion | null>;
  findById(id: number): Promise<Suscripcion | null>;
  findAll(usuarioId?: number): Promise<Suscripcion[]>;
  save(entidad: NuevaSuscripcion): Promise<Suscripcion>;
  update(entidad: Suscripcion): Promise<Suscripcion>;
  delete(id: number);
}
