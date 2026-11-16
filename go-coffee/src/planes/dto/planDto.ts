import { EstadoPlan, FrecuenciaEntrega } from "../../dominio/tipos";

export interface PlanDTO{
    nombre: string;
    cantidadBolsas: number;
    precio: number;
    remplazadoPorId?: number;
    fechaCreacion: Date;
    estado: EstadoPlan;
    frecuenciaEntrega: FrecuenciaEntrega;
}