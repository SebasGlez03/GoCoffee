import { Suscripcion, Entrega } from '../dominio/entidades';
import { EstadoEntrega } from '../dominio/tipos';
import { EntregaRepository } from '../entregas/infra/entregas-repo';
import { 
  SuscripcionInactivaError,
  EntregaDuplicadaError,
  ModificacionEntregaEnProcesoError,
  SuscripcionCanceladaError,
} from '../dominio/errores';

export class EntregasDominioService {
  constructor(private readonly entregaRepo: EntregaRepository) {}

  async generarEntregaCiclo(
    suscripcion: Suscripcion,
    numCiclo: number,
    fechaProgramada: Date,
  ): Promise<Entrega> {
    // no se generan entregas para sscricpiones canceladas.
    if (suscripcion.estadoSuscripcion == 'CANCELADA') {
      throw new SuscripcionCanceladaError(suscripcion.idSuscripcion);
    }
    // no se generan entregas para suscripciones que no estén activas ('PAUSADA', 'SUSPENDIDA')
    if (suscripcion.estadoSuscripcion !== 'ACTIVA') {
      throw new SuscripcionInactivaError(suscripcion.idSuscripcion);
    }

    // no se duplica la entrega de un mismo ciclo
    const yaExisteCiclo = suscripcion.ciclos.some(
      (c) => c.numCiclo === numCiclo && c.entrega !== null && c.entrega !== undefined,
    );

    if (yaExisteCiclo) {
      throw new EntregaDuplicadaError(numCiclo);
    }

    // Crear la nueva entrega con valor directo de tipo EstadoEntrega
    const nuevaEntrega: Entrega = {
      idEntrega: Date.now(),
      fechaProgramada,
      estadoEntrega: 'PROGRAMADA',
    };

    return await this.entregaRepo.save(nuevaEntrega);
  }

  
  // Valida si una entrega permite pausas o saltos (impidiendo cambios si ya está armada, enviada o entregada)
  validarModificacionEntrega(entrega: Entrega): void {
    const estadosBloqueados: EstadoEntrega[] = ['ARMADA', 'ENVIADA', 'ENTREGADA'];

    if (estadosBloqueados.includes(entrega.estadoEntrega)) {
      throw new ModificacionEntregaEnProcesoError();
    }
  }
}