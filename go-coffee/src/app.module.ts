import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SuscripcionesModule } from './suscripciones/suscripciones.module';
import { PlanesModule } from './planes/planes.module';
import { EntregasModule } from './entregas/entregas.module';
import { APP_FILTER } from '@nestjs/core';
import { FiltroErroresDominio } from './common/filtros/filtro-errores-dominio';

@Module({
  imports: [SuscripcionesModule, PlanesModule, EntregasModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: FiltroErroresDominio },
  ],
})
export class AppModule {}