# GoCoffee · Servicio (NestJS)

API REST con las reglas del negocio de suscripciones de café. La usa el portal del cliente (`../go-coffee-frontend`).

Cómo instalarlo y arrancarlo: ver el [README de la raíz](../README.md). Documentación interactiva: **http://localhost:3000/docs** (Swagger).

## Variables de entorno (`.env`)

| Variable | Obligatoria | Ejemplo | Para qué |
|---|---|---|---|
| `DATABASE_URL` | Sí | `postgresql://postgres:pass@localhost:5432/go_coffee` | Conexión a PostgreSQL |
| `JWT_SECRET` | Sí | `un-secreto-largo` | Firma de los tokens. Sin ella el servicio no arranca |
| `JWT_EXPIRA_EN` | No | `7d` | Duración de la sesión |
| `PORT` | No | `3000` | Puerto del servicio |
| `FRONTEND_URL` | No | `http://localhost:5173` | Origen(es) permitidos por CORS, separados por coma |

## Base de datos

```bash
npx prisma generate          # cliente de Prisma
npx prisma migrate deploy    # aplica prisma/migrations-postgresql (base nueva)
npx tsx src/datos/seed.ts    # usuarios admin@go-coffee.com y cliente@go-coffee.com (123456)
npm run seed:planes          # planes del catálogo
```

## Formato de las respuestas

**Éxito** (todas las rutas, `SobreInterceptor`):

```json
{ "data": { }, "meta": { "ruta": "/planes", "duracionMs": 4, "timestamp": "2026-11-17T20:47:01.191Z" } }
```

**Error** (todas las rutas, `FiltroErrores`):

```json
{
  "statusCode": 409,
  "error": "SuscripcionDuplicadaError",
  "message": "Ya tienes una suscripción a este plan.",
  "path": "/suscripciones",
  "timestamp": "2026-11-17T20:47:01.492Z"
}
```

`error` es el nombre del error de dominio (o el nombre HTTP: `BadRequest`, `Unauthorized`…). En errores de validación `message` es una lista de textos.

| Código | Cuándo |
|---|---|
| 200 / 201 | Consulta u operación exitosa |
| 400 | Datos inválidos (ValidationPipe o `ErrorDeValidacion`) |
| 401 | Sin token, token vencido o credenciales incorrectas |
| 403 | El rol no alcanza o el recurso es de otro usuario |
| 404 | No existe (`ErrorNoEncontrado`) |
| 409 | Se viola una regla de negocio (`ErrorDeReglaDeNegocios`, `ErrorDeConflicto`) |
| 500 | Error no previsto (sin detalles internos) |

Los tipos de cada cuerpo y respuesta están declarados una sola vez en **`src/contrato/contrato.ts`**. El portal importa ese mismo archivo, así que el dato se describe una sola vez en las dos puntas.

## Endpoints

Rol: **P** = público, **C** = cliente, **A** = administrador.

| Método y ruta | Rol | Respuestas |
|---|---|---|
| `POST /auth/register` | P | 201, 400, 409 correo repetido. Siempre crea rol CLIENTE |
| `POST /auth/login` | P | 200 token, 400, 401 |
| `GET /auth/me` | C/A | 200, 401 |
| `GET /planes` | P | 200 |
| `GET /planes/estado/:estado` | P | 200, 400 estado inválido |
| `GET /planes/:id` | P | 200, 400, 404 |
| `POST /planes` · `PUT /planes` · `DELETE /planes/:id` | A | 200/201, 400, 401, 403, 404 |
| `GET /suscripciones` | C/A | 200. El cliente solo recibe las suyas |
| `GET /suscripciones/:id` | C/A | 200, 401, 403 ajena, 404 |
| `POST /suscripciones` | C/A | 201, 400, 401, 409 duplicada o fecha pasada |
| `PATCH /suscripciones/:id` | C/A | 200, 400, 401, 403, 404, 409 cancelada o cobro pendiente. Pausar, reanudar, cancelar, cambiar día |
| `POST /suscripciones/:id/ciclos/:numCiclo/saltar` | C/A | 201, 400, 401, 403, 404, 409 entrega pagada, armada o pasada |
| `GET /suscripciones/:id/cambios-plan/opciones` | C/A | 200, 401, 403, 404 |
| `GET /suscripciones/:id/cambios-plan` | C/A | 200, 401, 403, 404 |
| `POST /suscripciones/:id/cambios-plan` | C/A | 201, 400, 401, 403, 404, 409 |
| `GET /cambios-plan` | A | 200, 401, 403 |
| `PATCH /cambios-plan/:id/resolucion` | A | 200, 400, 401, 403, 404, 409 ya resuelta |
| `GET /cobros/metodo-pago` · `PUT /cobros/metodo-pago` | C/A | 200, 400, 401 |
| `GET /cobros/historial` | C/A | 200, 401 |
| `POST /cobros` | A | 201, 400, 401, 403, 404, 409 ciclo saltado o ya pagado |
| `GET /administracion/ciclos` | A | 200, 400 filtros, 401, 403 |

## Cómo se atienden las reglas del negocio

| Regla | Dónde |
|---|---|
| Pausa / reanudación | `PATCH /suscripciones/:id` con `estadoSuscripcion: PAUSADA/ACTIVA`. Pausada no genera entregas ni cobros (`CiclosService`) |
| Salto de una entrega | `POST .../ciclos/:numCiclo/saltar`. La entrega queda SALTADA y no se cobra. No se puede si ya está pagada, armada, enviada o es pasada |
| Cancelación | `PATCH` con `CANCELADA`. Las entregas pagadas se conservan; `ultimaEntregaPagada` indica la última que recibirá |
| Generación de entregas | `CiclosService` revisa cada minuto y mantiene un ciclo futuro por suscripción activa, sin duplicar (`@@unique([suscripcionId, numCiclo])`) |
| Cobros | Manuales: el administrador registra PAGADO o FALLIDO (`POST /cobros`). Un FALLIDO suspende la suscripción; al pagarse, se reactiva |
| Cambio de plan | El cliente elige el ciclo; queda pendiente hasta que el administrador lo aprueba y se aplica al llegar ese ciclo |
| Reporte de cajas | `GET /administracion/ciclos` filtra por fechas y estado de entrega; el reporte consolidado por plan es parte del backoffice (siguiente avance) |

Más detalle en [`src/suscripciones/CICLOS.md`](src/suscripciones/CICLOS.md) y en [`POSTGRESQL.md`](POSTGRESQL.md).

## Estructura

```
src/
  contrato/         Tipos compartidos con el portal (cuerpos y respuestas)
  dominio/          Entidades, enumerados y errores de dominio
  auth/             Registro, login, JWT, guards y repositorio de usuarios
  planes/           Catálogo de planes (dto/, infra/, mapper/)
  suscripciones/    Suscripciones, ciclos y cambios de plan
  pagos/            Método de pago y cobros
  entregas/         Servicio de entregas
  common/           Filtro de errores, interceptor del sobre, log de peticiones, Prisma
  config/           Configuración (secreto JWT)
```
