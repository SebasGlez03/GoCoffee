import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FiltroErrores } from './common/filtros/filtro-errores';
import { RegistroPeticionesMiddleware } from './common/middleware/registro-peticiones.middleware';
import { EntregasModule } from './entregas/entregas.module';
import { PagosModule } from './pagos/pagos.module';
import { PlanesModule } from './planes/planes.module';
import { SuscripcionesModule } from './suscripciones/suscripciones.module';

@Module({
  imports: [
    SuscripcionesModule,
    PlanesModule,
    EntregasModule,
    AuthModule,
    PagosModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_FILTER, useClass: FiltroErrores }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RegistroPeticionesMiddleware).forRoutes('*path');
  }
}
