import { Suscripcion } from "../../dominio/entidades";
import { Repository, NuevaSuscripcion } from "../../dominio/entidades-repo";


export interface SuscripcionRepository extends Omit<Repository<Suscripcion>, 'save'> {
  findById(id: number): Promise<Suscripcion | null>;
  findAll(usuarioId?: number): Promise<Suscripcion[]>;
  save(entidad: NuevaSuscripcion): Promise<Suscripcion>;
  update(entidad: Suscripcion): Promise<Suscripcion>;
  delete(id: number);
}
