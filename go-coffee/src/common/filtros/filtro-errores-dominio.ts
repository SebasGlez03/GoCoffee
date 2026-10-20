import { ArgumentsHost, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import {
  ErrorDeDominio,
  ErrorDeReglaDeNegocios,
  ErrorDeValidacion,
  ErrorNoEncontrado,
} from '../../dominio/errores';

export class FiltroErroresDominio implements ExceptionFilter {
  catch(exception: ErrorDeDominio, host: ArgumentsHost) {
    const contexto = host.switchToHttp();
    const respuesta = contexto.getResponse<Response>();

    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof ErrorNoEncontrado) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof ErrorDeReglaDeNegocios) {
      status = HttpStatus.CONFLICT;
    } else if (exception instanceof ErrorDeValidacion) {
      status = HttpStatus.BAD_REQUEST;
    }

    respuesta.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }
}
