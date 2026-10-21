import { Module } from '@nestjs/common';
import { EntregasDominioService } from './entregas.service';
import { ENTREGAS_REPOSITORY } from './entregas.tokens';
import { EntregasPrismaRepository } from './infra/entregas-prisma.repository';
import { PrismaService } from '../common/prisma/prisma.service';

@Module({
  providers: [
    EntregasDominioService,
    PrismaService,
    {
      provide: ENTREGAS_REPOSITORY,
      useClass: EntregasPrismaRepository,
    },
  ],
  exports: [EntregasDominioService],
})
export class EntregasModule {}