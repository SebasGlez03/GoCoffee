# GoCoffee · Equipo 6

Sistema de suscripciones de café en grano y molido. El repositorio tiene dos aplicaciones independientes:

| Carpeta | Qué es | Tecnología | Dirección local |
|---|---|---|---|
| `go-coffee/` | **Servicio** (Avance 2): API REST con las reglas del negocio | NestJS + Prisma + PostgreSQL | http://localhost:3000 |
| `go-coffee-frontend/` | **Portal del cliente** (Avance 3, storefront) | React + Vite + TypeScript | http://localhost:5173 |

El portal no toca la base de datos: le pide todo al servicio por HTTP.

---

## Requisitos

- **Node.js 20 o más reciente** (`node -v`)
- **PostgreSQL**: puede ser local o la base de Supabase del equipo (pide el `DATABASE_URL` al equipo)

---

## 1. Levantar el servicio (terminal 1)

```bash
cd go-coffee
npm install
```

Copia `.env.example` como `.env` y llena los valores:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/go_coffee"
JWT_SECRET="un-secreto-largo-cualquiera"
FRONTEND_URL="http://localhost:5173"
```

> `JWT_SECRET` es obligatorio: si falta, el servicio no arranca (ya no existe un secreto por defecto).

Prepara la base y los datos de ejemplo:

```bash
npx prisma generate            # genera el cliente de Prisma
npx prisma migrate deploy      # SOLO en una base nueva o vacía. Nunca "migrate reset" en la de Supabase
npx tsx src/datos/seed.ts      # crea admin@go-coffee.com y cliente@go-coffee.com (contraseña 123456)
npm run seed:planes            # crea los planes del catálogo (conserva los que ya existan)
```

Arranca el servicio:

```bash
npm run start:dev
```

- API: http://localhost:3000
- Documentación interactiva (Swagger): http://localhost:3000/docs
- En la terminal se ve cada petición con su código y su tiempo, por ejemplo `GET /planes 200 - 4.1 ms`.

## 2. Levantar el portal (terminal 2)

```bash
cd go-coffee-frontend
npm install
npm run dev
```

Abre http://localhost:5173.

### Cómo apuntar el portal al servicio

La dirección del servicio **no está escrita en el código**. Se configura en un solo lugar:

1. Copia `go-coffee-frontend/.env.example` como `go-coffee-frontend/.env`.
2. Cambia la variable:

```env
VITE_API_URL=http://localhost:3000
```

3. Reinicia `npm run dev` (Vite solo lee `.env` al arrancar).

Si no existe `.env`, el portal usa `http://localhost:3000`. Si cambias el puerto o el dominio del portal, agrega ese origen en `FRONTEND_URL` del `.env` del servicio (CORS).

---

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Cliente | cliente@go-coffee.com | 123456 |
| Administrador | admin@go-coffee.com | 123456 |

Cualquier persona puede crear su cuenta en `/registrar`; siempre se crea como **cliente**.

## Recorrido sugerido (para probar o grabar el video)

1. `/planes` → elegir un plan → **Iniciar sesión para suscribirme** (te regresa al plan después de entrar).
2. Llenar la dirección y el día → **Confirmar suscripción**.
3. **Mis suscripciones** → **Administrar**: pausar/reanudar, cambiar día, saltar una entrega, pedir cambio de plan, cancelar.
4. **Entregas**: próximas e historial. **Cobros**: método de pago e historial.
5. Como administrador, **Administración**: registrar un cobro *Fallido* y ver que la suscripción del cliente queda *Suspendida*; aprobar un cambio de plan.
6. Apagar el servicio (Ctrl+C en la terminal 1) y recargar el portal: aparece **"No hay conexión con GoCoffee"** con botón para reintentar.
7. Sesión vencida: en DevTools → Application → Local Storage, cambia `gocoffee.token` por cualquier texto y navega: el portal cierra la sesión y avisa.

## Pruebas

```bash
cd go-coffee && npm test            # pruebas unitarias del servicio
cd go-coffee && npm run test:dominio   # escenarios del dominio (Avance 1)
cd go-coffee-frontend && npm run lint && npm run build
```

## Problemas comunes

| Síntoma | Solución |
|---|---|
| `Falta la variable JWT_SECRET` | Crea `go-coffee/.env` a partir de `.env.example`. |
| El portal dice "No hay conexión con GoCoffee" | El servicio no está corriendo o `VITE_API_URL` apunta a otra dirección. |
| Error de CORS en la consola | Agrega la dirección del portal a `FRONTEND_URL` en `go-coffee/.env` y reinicia el servicio. |
| `Can't reach database server` | Revisa que PostgreSQL esté encendido y el `DATABASE_URL`. |

Más detalle: [`go-coffee/README.md`](go-coffee/README.md) (endpoints, códigos de respuesta y formato de error) y [`go-coffee-frontend/README.md`](go-coffee-frontend/README.md) (estructura del portal).
