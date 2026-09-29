import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SuscripcionesModule } from './suscripciones/suscripciones.module';
import { PlanesModule } from './planes/planes.module';

@Module({
  imports: [SuscripcionesModule, PlanesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
