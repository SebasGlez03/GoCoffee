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

export class SuscripcionInactivaError extends Error {
  constructor(idSuscripcion: number) {
    super(`No se pueden generar entregas para el id de suscripción ${idSuscripcion} porque no se encuentra en estado ACTIVA.`);
    this.name = 'SuscripcionInactivaError';
  }
}

export class EntregaDuplicadaError extends Error {
  constructor(numCiclo: number) {
    super(`No se puede generar la entrega: ya existe una entrega registrada para el ciclo ${numCiclo}.`);
    this.name = 'EntregaDuplicadaError';
  }
}

export class ModificacionEntregaEnProcesoError extends Error {
  constructor() {
    super('No se puede modificar ni cancelar una entrega que ya se encuentra Armada, Enviada o Entregada.');
    this.name = 'ModificacionEntregaEnProcesoError';
  }
}
