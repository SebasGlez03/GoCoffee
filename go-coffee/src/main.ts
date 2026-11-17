import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SobreInterceptor } from './common/interceptores/sobre.interceptor';
import { obtenerSecretoJwt } from './config/jwt.config';

async function bootstrap() {
  // Falla al arrancar (y no a la primera petición) si falta JWT_SECRET.
  obtenerSecretoJwt();

  const app = await NestFactory.create(AppModule);

  // CORS solo para el origen del portal (configurable en .env).
  const origenes = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);
  app.enableCors({ origin: origenes, credentials: true });

  // La validación y el sobre se registran ANTES de app.listen().
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new SobreInterceptor());

  // Documentación interactiva en http://localhost:3000/docs
  const documento = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('GoCoffee API')
      .setDescription(
        'Servicio de suscripciones de café. Respuestas exitosas: { data, meta }. ' +
          'Errores: { statusCode, error, message, path, timestamp }.',
      )
      .setVersion('3.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('docs', app, documento);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
