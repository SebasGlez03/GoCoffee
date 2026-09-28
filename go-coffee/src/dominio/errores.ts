export class DiaSemanaEntregadoVacio extends Error {
  constructor() {
    super('No se asigno un valor al dia de entrega');
  }
}

export class FechaVacia extends Error {
  constructor() {
    super('No se asigno un valor a la fecha');
  }
}

export class DireccionEntregaVacia extends Error {
  constructor() {
    super('No se asigno un valor a la direccion de entrega');
  }
}

export class EstadoSuscripcionVacio extends Error {
  constructor() {
    super('No se asigno un valor a el estado de la entrega');
  }
}

export class CiclosSuscripcionesVacios extends Error {
  constructor() {
    super('No se asignaron ciclos en la suscripcion');
  }
}
