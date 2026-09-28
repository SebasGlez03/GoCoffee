import { Module } from '@nestjs/common';
import { PlanesController } from './planes.controller';
import { PlanesService } from './planes.service';
import { PLAN_REPOSITORY } from './infra/planes.tokens';
import { PlanMemoriaRepository } from './infra/planes-memoria.repository';

@Module({
    controllers: [PlanesController],
    providers: [
        PlanesService,
        {
            provide: PLAN_REPOSITORY,
            useClass: PlanMemoriaRepository
        }
    ],
})
export class PlanesModule {}
