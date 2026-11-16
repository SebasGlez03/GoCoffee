export interface Plan {
    idPlan: number;
    nombre: string;
    cantidadBolsas: number;
    precio: number;
    fechaCreacion: Date;
    estado: EstadoPlan;
    frecuenciaEntrega: FrecuenciaEntrega;
}

export type EstadoPlan = 'OBSOLETO' | 'ACTUAL' | 'INACTIVO';

export type FrecuenciaEntrega = 'SEMANAL' | 'QUINCENAL' | 'MENSUAL';