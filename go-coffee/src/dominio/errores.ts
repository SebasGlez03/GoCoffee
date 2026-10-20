// Error general
export class ErrorDeDominio extends Error {}

// Clasificacion de errores
export class ErrorDeValidacion extends ErrorDeDominio {}
export class ErrorNoEncontrado extends ErrorDeDominio {}
export class ErrorDeReglaDeNegocios extends ErrorDeDominio {}

// Errores de validacion (HTTP 400)
export class DiaSemanaEntregadoVacio extends ErrorDeValidacion {
  constructor() {
    super('No se asigno un valor al dia de entrega');
    this.name = 'DiaSemanaEntregadoVacio';
  }
}

export class FechaVacia extends ErrorDeValidacion {
  constructor() {
    super('No se asigno un valor a la fecha');
    this.name = 'FechaVacia'
  }
}

export class DireccionEntregaVacia extends ErrorDeValidacion {
  constructor() {
    super('No se asigno un valor a la direccion de entrega');
    this.name = 'DireccionEntregaVacia'
  }
}

export class EstadoSuscripcionVacio extends ErrorDeValidacion {
  constructor() {
    super('No se asigno un valor a el estado de la entrega');
    this.name = 'EstadoSuscripcionVacio'
  }
}

export class CiclosSuscripcionesVacios extends ErrorDeValidacion {
  constructor() {
    super('No se asignaron ciclos en la suscripcion');
    this.name = 'CiclosSuscripcionesVacios'
  }
}

export class IdInvalidoError extends ErrorDeValidacion {
  constructor() {
    super('El ID proporcionado no es válido.');
    this.name = 'IdInvalidoError'
  }
}

export class PlanDatosRequeridosError extends ErrorDeValidacion {
  constructor() {
    super('Los datos del plan son requeridos.');
    this.name = 'PlanDatosRequeridosError'
  }
}

export class NombrePlanVacioError extends ErrorDeValidacion {
  constructor() {
    super('El nombre del plan es obligatorio y no puede estar vacio.');
    this.name = 'NombrePlanVacioError'
  }
}

export class CantidadBolsasInvalidaError extends ErrorDeValidacion {
  constructor() {
    super('La cantidad de bolsas debe ser un número mayor a cero.');
    this.name = 'CantidadBolsasInvalidaError'
  }
}

export class PrecioInvalidoError extends ErrorDeValidacion {
  constructor() {
    super('El precio no es un valor válido.');
    this.name = 'PrecioInvalidoError'
  }
}

export class FrecuenciaPlanInvalidoError extends ErrorDeValidacion {
  constructor() {
    super('La frecuencia de entrega es obligatoria.');
    this.name = 'FrecuenciaPlanInvalidoError'
  }
}

export class EstadoPlanInvalidoError extends ErrorDeValidacion {
  constructor(estado: string, estadosValidos: string[]) {
    super(
      `El estado "${estado}" no es válido; debe ser uno de : ${estadosValidos.join(', ')}.`,
    );
    this.name = 'EstadoPlanInvalidoError'
  }
}

// No encontrados (HTTP 404)
export class SuscripcionNoEncontradaError extends ErrorNoEncontrado {
  constructor(idSuscripcion: number) {
    super(`No existe la suscripción con id ${idSuscripcion}.`);
    this.name = 'SuscripcionNoEncontradaError'
  }
}

export class PlanNoEncontradoError extends ErrorNoEncontrado {
  constructor(idPlan: number) {
    super(`No existe el idPlan ${idPlan}.`);
    this.name = 'PlanNoEncontradoError'
  }
}

// Reglas de negocio (HTTP 409)
export class SuscripcionInactivaError extends ErrorDeReglaDeNegocios {
  constructor(idSuscripcion: number) {
    super(
      `No se pueden generar entregas para el id de suscripción ${idSuscripcion} porque no se encuentra en estado ACTIVA.`,
    );
    this.name = 'SuscripcionInactivaError'
  }
}

export class SuscripcionCanceladaError extends ErrorDeReglaDeNegocios {
  constructor(idSuscripcion: number) {
    super(
      `La suscripción ${idSuscripcion} está cancelada; no se permiten modificaciones ni generación de entregas.`,
    );
    this.name = 'SuscripcionCanceladaError'
  }
}

export class EntregaDuplicadaError extends ErrorDeReglaDeNegocios {
  constructor(numCiclo: number) {
    super(
      `No se puede generar la entrega: ya existe una entrega registrada para el ciclo ${numCiclo}.`,
    );
    this.name = 'EntregaDuplicadaError'
  }
}

export class ModificacionEntregaEnProcesoError extends ErrorDeReglaDeNegocios {
  constructor() {
    super(
      'No se puede modificar ni cancelar una entrega que ya se encuentra Armada, Enviada o Entregada.',
    );
    this.name = 'ModificacionEntregaEnProcesoError'
  }
}

export class CambioRetroactivoError extends ErrorDeReglaDeNegocios {
  constructor(fechaSolicitada: Date) {
    super(
      `No se permite un cambio con fecha retroactiva: ${fechaSolicitada.toISOString().split('T')[0]}.`,
    );
    this.name = 'CambioRetroactivoError'
  }
}
