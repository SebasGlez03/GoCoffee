import { EstadoPlan, FrecuenciaEntrega } from "../../dominio/tipos";

export interface PlanDto{
    nombre: string;
    cantidadBolsas: number;
    precio: number;
    remplazadoPorId?: number;
    fechaCreacion: Date;
    estado: EstadoPlan;
    frecuenciaEntrega: FrecuenciaEntrega;
}