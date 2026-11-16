import { Module } from '@nestjs/common';
import { PlanesController } from './planes.controller';
import { PlanesService } from './planes.service';
import { PLAN_REPOSITORY } from './infra/planes.tokens';
import { PlanPrismaRepository } from './infra/planes-prisma.repository';
import { PrismaService } from '../common/prisma/prisma.service';

@Module({
  controllers: [PlanesController],
  providers: [
    PlanesService,
    PrismaService,
    {
      provide: PLAN_REPOSITORY,
      useClass: PlanPrismaRepository,
    },
  ],
})
export class PlanesModule {}