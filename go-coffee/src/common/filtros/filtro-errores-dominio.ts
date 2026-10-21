import { ArgumentsHost, ExceptionFilter, HttpStatus, Catch, Logger } from '@nestjs/common';
import type { Response } from 'express';
import {
  ErrorDeDominio,
  ErrorDeReglaDeNegocios,
  ErrorDeValidacion,
  ErrorNoEncontrado,
} from '../../dominio/errores';

@Catch(ErrorDeDominio)
export class FiltroErroresDominio implements ExceptionFilter {
  private readonly logger = new Logger('Dominio');

  private codigoPara(error: ErrorDeDominio): number {
    if (error instanceof ErrorDeValidacion) {
      return HttpStatus.BAD_REQUEST; //400
    }
    if (error instanceof ErrorNoEncontrado) {
      return HttpStatus.NOT_FOUND; //404
    }
    if (error instanceof ErrorDeReglaDeNegocios) {
      return HttpStatus.UNPROCESSABLE_ENTITY; // 422
    }
    return HttpStatus.INTERNAL_SERVER_ERROR; //500
  }

  catch(error: ErrorDeDominio, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<{ url: string; method: string }>();
    const estado = this.codigoPara(error);

    this.logger.warn(`${req.method} ${req.url} -> ${estado} ${error.constructor.name}`);

    res.status(estado).json({
      statusCode: estado,
      error: error.constructor.name,
      message: error.message,
      path: req.url,
      timestamp: new Date().toISOString(),
    });

  }
}
