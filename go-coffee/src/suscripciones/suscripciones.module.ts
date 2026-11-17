import { CiclosService } from './ciclos.service';
import { Module } from '@nestjs/common';
import { SuscripcionesController } from './suscripciones.controller';
import { SuscripcionesService } from './suscripciones.service';
import { SUSCRIPCIONES_REPOSITORY } from './suscripciones.tokens';
//cambio a Prisma porque ya no usamos el repositorio en memoria.
import { SuscripcionPrismaRepository } from './infra/suscripcion-prisma.repository';
import { PrismaService } from '../common/prisma/prisma.service';


@Module({
  controllers: [SuscripcionesController],
  providers: [
    SuscripcionesService,
    CiclosService,
    PrismaService,
    {
      provide: SUSCRIPCIONES_REPOSITORY,
      useClass: SuscripcionPrismaRepository,
    },
  ],
})
export class SuscripcionesModule {}
