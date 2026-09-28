import { Suscripcion } from './entidades';

export interface Repository<T, ID = number> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entidad: T): Promise<T>;
  delete(id: ID): Promise<void>;
}

export type NuevaSuscripcion = Omit<Suscripcion, 'idSuscripcion'>

