import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { RespuestaError } from '../../contrato/contrato';
import {
  ErrorDeConflicto,
  ErrorDeDominio,
  ErrorDeReglaDeNegocios,
  ErrorDeValidacion,
  ErrorNoEncontrado,
} from '../../dominio/errores';

/**
 * Filtro único de errores. Toda respuesta con error sale con el mismo
 * formato (RespuestaError, declarado en src/contrato/contrato.ts):
 *
 *   { statusCode, error, message, path, timestamp }
 *
 * Códigos:
 *   400 ErrorDeValidacion o datos del cuerpo inválidos (ValidationPipe)
 *   401 sin token, token vencido o credenciales incorrectas
 *   403 el usuario no tiene el rol o no es dueño del recurso
 *   404 ErrorNoEncontrado
 *   409 ErrorDeConflicto y ErrorDeReglaDeNegocios (regla de negocio violada)
 *   500 cualquier error no previsto (sin detalles internos)
 */
@Catch()
export class FiltroErrores implements ExceptionFilter {
  private readonly logger = new Logger('Errores');

  catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const { estado, codigo, mensaje } = this.traducir(error);

    if (estado >= 500) {
      this.logger.error(
        `${req.method} ${req.originalUrl} -> ${estado}`,
        error instanceof Error ? error.stack : String(error),
      );
    } else {
      this.logger.warn(`${req.method} ${req.originalUrl} -> ${estado} ${codigo}`);
    }

    const cuerpo: RespuestaError = {
      statusCode: estado,
      error: codigo,
      message: mensaje,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    };
    res.status(estado).json(cuerpo);
  }

  private traducir(error: unknown): {
    estado: number;
    codigo: string;
    mensaje: string | string[];
  } {
    if (error instanceof ErrorDeDominio) {
      return {
        estado: this.codigoDominio(error),
        codigo: error.name || error.constructor.name,
        mensaje: error.message,
      };
    }

    if (error instanceof HttpException) {
      const estado = error.getStatus();
      const respuesta = error.getResponse();
      const mensaje =
        typeof respuesta === 'string'
          ? respuesta
          : ((respuesta as { message?: string | string[] }).message ??
            error.message);
      return { estado, codigo: this.nombreHttp(estado), mensaje };
    }

    return {
      estado: HttpStatus.INTERNAL_SERVER_ERROR,
      codigo: 'InternalServerError',
      mensaje: 'Ocurrió un error inesperado en el servidor.',
    };
  }

  private codigoDominio(error: ErrorDeDominio): number {
    if (error instanceof ErrorDeValidacion) return HttpStatus.BAD_REQUEST;
    if (error instanceof ErrorNoEncontrado) return HttpStatus.NOT_FOUND;
    if (error instanceof ErrorDeConflicto) return HttpStatus.CONFLICT;
    if (error instanceof ErrorDeReglaDeNegocios) return HttpStatus.CONFLICT;
    // Un error de dominio sin clasificar sigue siendo una regla de negocio
    // incumplida, no una falla del servidor.
    return HttpStatus.CONFLICT;
  }

  private nombreHttp(estado: number): string {
    const nombres: Record<number, string> = {
      400: 'BadRequest',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'NotFound',
      409: 'Conflict',
      422: 'UnprocessableEntity',
      429: 'TooManyRequests',
    };
    return nombres[estado] ?? (estado >= 500 ? 'InternalServerError' : 'Error');
  }
}
