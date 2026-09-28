import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SuscripcionesModule } from './suscripciones/suscripciones.module';

@Module({
  imports: [SuscripcionesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
