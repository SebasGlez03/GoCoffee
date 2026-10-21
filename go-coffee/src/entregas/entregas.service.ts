import { Inject, Injectable } from '@nestjs/common';
import { Suscripcion, Entrega } from '../dominio/entidades';
import  { EstadoEntrega } from '../dominio/tipos';
import  { ENTREGAS_REPOSITORY } from './entregas.tokens';
import type { EntregasRepository } from './dominio/entregas.repository';
import {
  SuscripcionInactivaError,
  EntregaDuplicadaError,
  ModificacionEntregaEnProcesoError,
  SuscripcionCanceladaError,
} from '../dominio/errores';

@Injectable()
export class EntregasDominioService {
  constructor(
    @Inject(ENTREGAS_REPOSITORY)
    private readonly entregaRepo: EntregasRepository,
  ) {}

  async generarEntregaCiclo(
    suscripcion: Suscripcion,
    numCiclo: number,
    fechaProgramada: Date,
  ): Promise<Entrega> {
    if (suscripcion.estadoSuscripcion === 'CANCELADA') {
      throw new SuscripcionCanceladaError(suscripcion.idSuscripcion);
    }

    if (suscripcion.estadoSuscripcion !== 'ACTIVA') {
      throw new SuscripcionInactivaError(suscripcion.idSuscripcion);
    }

    const yaExisteCiclo = suscripcion.ciclos.some(
      (c) =>
        c.numCiclo === numCiclo &&
        c.entrega !== null &&
        c.entrega !== undefined,
    );

    if (yaExisteCiclo) {
      throw new EntregaDuplicadaError(numCiclo);
    }

    const nuevaEntrega: Entrega = {
      idEntrega: Date.now(),
      fechaProgramada,
      estadoEntrega: 'PROGRAMADA',
    };

    return await this.entregaRepo.save(nuevaEntrega);
  }

  validarModificacionEntrega(entrega: Entrega): void {
    const estadosBloqueados: EstadoEntrega[] = [
      'ARMADA',
      'ENVIADA',
      'ENTREGADA',
    ];

    if (estadosBloqueados.includes(entrega.estadoEntrega)) {
      throw new ModificacionEntregaEnProcesoError();
    }
  }
}
