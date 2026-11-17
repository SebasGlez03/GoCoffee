import { CiclosService } from './ciclos.service';
import { CambiosPlanService } from './cambios-plan.service';
import { CambiosPlanController } from './cambios-plan.controller';
import { Module } from '@nestjs/common';
import { SuscripcionesController } from './suscripciones.controller';
import { SuscripcionesService } from './suscripciones.service';
import { SUSCRIPCIONES_REPOSITORY } from './suscripciones.tokens';
//cambio a Prisma porque ya no usamos el repositorio en memoria.
import { SuscripcionPrismaRepository } from './infra/suscripcion-prisma.repository';
import { PrismaService } from '../common/prisma/prisma.service';


@Module({
  controllers: [SuscripcionesController, CambiosPlanController],
  providers: [
    SuscripcionesService,
    CiclosService,
    CambiosPlanService,
    PrismaService,
    {
      provide: SUSCRIPCIONES_REPOSITORY,
      useClass: SuscripcionPrismaRepository,
    },
  ],
})
export class SuscripcionesModule {}
