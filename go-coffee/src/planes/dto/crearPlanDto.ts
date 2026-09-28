import { FrecuenciaEntrega } from "../../dominio/tipos";

export interface CrearPlanDTO {
    nombre: string;
    cantidadBolsas: number;
    precio: number;
    frecuenciaEntrega: FrecuenciaEntrega;
}