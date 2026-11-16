export interface Plan {
    idPlan: number;
    nombre: string;
    cantidadBolsas: number;
    precio: number;
    remplazadoPorId?: number;
    fechaCreacion?: Date;
    estado?: EstadoPlan;
    frecuenciaEntrega: FrecuenciaEntrega;
}

export type EstadoPlan = 'OBSOLETO' | 'ACTUAL' | 'INACTIVO';

export type FrecuenciaEntrega = 'SEMANAL' | 'QUINCENAL' | 'MENSUAL';

export interface Sesion {
  token: string;
  usuario: Usuario;
}

export interface Usuario {
  idUsuario: number;
  email: string;
  rol: 'CLIENTE' | 'ADMINISTRADOR';
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}