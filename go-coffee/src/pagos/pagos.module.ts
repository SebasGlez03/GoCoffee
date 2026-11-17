import { Module } from '@nestjs/common';
import { SuscripcionesModule } from '../suscripciones/suscripciones.module';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';

@Module({
  imports: [SuscripcionesModule],
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}
