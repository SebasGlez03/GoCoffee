import { Entrega } from "../../dominio/entidades";
import { Repository, NuevaEntrega } from "../../dominio/entidades-repo";

export interface EntregasRepository extends Repository<Entrega>{
    findById(id: number): Promise<Entrega | null>;
    findAll(): Promise<Entrega[]>;
    save(entidad: NuevaEntrega): Promise<Entrega>;
    update(entidad: Entrega): Promise<Entrega>;
    delete(id: number);
}
