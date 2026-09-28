import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SuscripcionesModule } from './suscripciones/suscripciones.module';
import { PlanesService } from './planes/planes.service';
import { PlanesController } from './planes/planes.controller';
import { PlanesModule } from './planes/planes.module';

@Module({
  imports: [SuscripcionesModule, PlanesModule],
  controllers: [AppController, PlanesController],
  providers: [AppService, PlanesService],
})
export class AppModule {}
