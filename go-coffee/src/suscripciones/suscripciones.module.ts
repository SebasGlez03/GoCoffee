import { Module } from '@nestjs/common';
import { SuscripcionesController } from './suscripciones.controller';
import { SuscripcionesService } from './suscripciones.service';
import { SUSCRIPCIONES_REPOSITORY } from './suscripciones.tokens';
import { SuscripcionMemoriaRepository } from './infra/suscripcion-memoria.repository';

@Module({
  controllers: [SuscripcionesController],
  providers: [
    SuscripcionesService,
    {
      provide: SUSCRIPCIONES_REPOSITORY,
      useClass: SuscripcionMemoriaRepository,
    },
  ],
})
export class SuscripcionesModule {}
