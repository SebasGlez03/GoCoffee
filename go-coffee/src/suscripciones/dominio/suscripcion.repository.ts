import { NuevaSuscripcion, Repository } from 'src/dominio/entidades-repo';
import { Suscripcion } from 'src/dominio/entidades';

export interface SuscripcionRepository extends Repository<Suscripcion> {
  findById(id: number): Promise<Suscripcion | null>;
  findAll(): Promise<Suscripcion[]>;
  save(entidad: NuevaSuscripcion): Promise<Suscripcion>;
  delete(id: number);
}
