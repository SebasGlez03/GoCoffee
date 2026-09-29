import { Suscripcion } from "../../dominio/entidades";
import { Repository, NuevaSuscripcion } from "../../dominio/entidades-repo";


export interface SuscripcionRepository extends Repository<Suscripcion> {
  findById(id: number): Promise<Suscripcion | null>;
  findAll(): Promise<Suscripcion[]>;
  save(entidad: NuevaSuscripcion): Promise<Suscripcion>;
  update(entidad: Suscripcion): Promise<Suscripcion>;
  delete(id: number);
}
