import { DireccionEntrega, Cobro, Entrega, Ciclo, Suscripcion } from "../dominio/entidades";

/*

Ejemplo de implementacion.

interface PrestamoRepository extends Repository<Prestamo> {
  findByLibro(libroId: string): Promise<Prestamo[]>;
}

*/


/*
idSuscripcion: number;
  diaSemanaEntrega: string;
  fechaInicio: Date;
  direccionEntrega: DireccionEntrega;
  estadoSuscripcion: EstadoSuscripcion;
  ciclos: Ciclo[];
*/

/*
export interface DireccionEntrega {
  idDireccionEntrega: number;
  calle: string;
  codigoPostal: string;
  numeroCasa: string;
  estado: string;
}
*/

export const DIRECCIONES_ENTREGAS: DireccionEntrega[] = [
  { idDireccionEntrega: 1, calle: "Manzana", codigoPostal: "123", numeroCasa: "123", estado: "Sonora"},
  { idDireccionEntrega: 2, calle: "Calabaza", codigoPostal: "321", numeroCasa: "321", estado: "Sinaloa"},
  { idDireccionEntrega: 3, calle: "Pepino", codigoPostal: "111", numeroCasa: "111", estado: "Chihuahua"}
];

export const COBRO: Cobro[] = [
    {idCobro: 1, estado: "FALLIDO", fechaCobro: new Date()},
    {idCobro: 2, estado: "PAGADO", fechaCobro: new Date()},
    {idCobro: 3, estado: "PAGADO", fechaCobro: new Date()},
]

export const ENTREGA: Entrega[] = [
    {idEntrega: 1, estadoEntrega: "ARMADA", fechaProgramada: new Date()},
    {idEntrega: 2, estadoEntrega: "ENTREGADA", fechaProgramada: new Date()},
    {idEntrega: 3, estadoEntrega: "ENVIADA", fechaProgramada: new Date()},
]

export const CICLOS: Ciclo[] = [
    {idCiclo: 1, cobro: COBRO[0], entrega: ENTREGA[0], fechaProgramada: new Date(), numCiclo: 1},
    {idCiclo: 2, cobro: COBRO[2], entrega: ENTREGA[2], fechaProgramada: new Date(), numCiclo: 2},
    {idCiclo: 3, cobro: COBRO[3], entrega: ENTREGA[3], fechaProgramada: new Date(), numCiclo: 3},
]

export const SUSCRIPCIONES: Suscripcion[] = [
    {idSuscripcion: 1, diaSemanaEntrega: "12", fechaInicio: new Date(), direccionEntrega: DIRECCIONES_ENTREGAS[0], estadoSuscripcion: "ACTIVA", ciclos: CICLOS},
    {idSuscripcion: 2, diaSemanaEntrega: "1", fechaInicio: new Date(), direccionEntrega: DIRECCIONES_ENTREGAS[2], estadoSuscripcion: "ACTIVA", ciclos: CICLOS},
    {idSuscripcion: 3, diaSemanaEntrega: "4", fechaInicio: new Date(), direccionEntrega: DIRECCIONES_ENTREGAS[3], estadoSuscripcion: "ACTIVA", ciclos: CICLOS},
] 