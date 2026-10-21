import { Module } from '@nestjs/common';
import { SuscripcionesModule } from './suscripciones/suscripciones.module';
import { PlanesModule } from './planes/planes.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { FiltroErroresDominio } from './common/filtros/filtro-errores-dominio';
import { SobreInterceptor } from './common/interceptores/sobre.interceptor';

@Module({
  imports: [SuscripcionesModule, PlanesModule],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: FiltroErroresDominio },
    { provide: APP_INTERCEPTOR, useClass: SobreInterceptor}
  ],
})
export class AppModule {}
