import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

/**
 * Registra cada petición con su método, ruta, código de respuesta y
 * tiempo en milisegundos. Ejemplo:  GET /planes 200 - 12 ms
 */
@Injectable()
export class RegistroPeticionesMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const inicio = process.hrtime.bigint();
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - inicio) / 1_000_000;
      const linea = `${req.method} ${req.originalUrl} ${res.statusCode} - ${ms.toFixed(1)} ms`;
      if (res.statusCode >= 500) this.logger.error(linea);
      else if (res.statusCode >= 400) this.logger.warn(linea);
      else this.logger.log(linea);
    });
    next();
  }
}
