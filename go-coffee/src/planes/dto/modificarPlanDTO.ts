import { EstadoPlan, FrecuenciaEntrega } from "../../dominio/tipos";

export interface ModificarPlanDTO {
    id: number;
    nombre?: string;
    cantidadBolsas?: number;
    precio?: number;
    frecuenciaEntrega?: FrecuenciaEntrega;
    estadoPlan?: EstadoPlan;
}