# PostgreSQL / Supabase

El backend y los seeds usan @prisma/adapter-pg. El frontend sigue consultando la
misma API HTTP; no recibe credenciales de PostgreSQL.

## Configuración

Ejecuta los comandos desde go-coffee. Configura DATABASE_URL y JWT_SECRET en .env
(ignorado por Git). .env.example contiene ejemplos sin credenciales reales.

Para Supabase se usa SSL con verificación de certificado y nombre de servidor:

```
postgresql://postgres:TU_PASSWORD@db.TU_PROYECTO.supabase.co:5432/postgres?sslmode=verify-full&sslrootcert=certs%2Fsupabase-ca.crt
```

El certificado raíz público está en certs/supabase-ca.crt y debe distribuirse con
el backend. No es una contraseña ni una clave privada. Se obtuvo del servidor de
descargas de Supabase:
https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt
Referencia: https://supabase.com/docs/guides/platform/ssl-enforcement

```
npm install
npx prisma generate
npm run build
npm run start:dev
```

## Migraciones y respaldo

prisma.config.ts usa prisma/migrations-postgresql. Las migraciones MySQL originales
en prisma/migrations se conservan como historial y no deben ejecutarse en PostgreSQL.

En la base Supabase existente se registró como aplicada la migración inicial
20261124000000_init_postgresql, porque esas tablas ya estaban creadas. Después se
aplicó 20261125000000_actualizar_suscripciones. La conversión se realiza en una
transacción y guarda copias de todas las tablas de la aplicación y del historial
de migraciones en el esquema privado gocoffee_respaldo_20261125.

El historial de migraciones previo del equipo en Supabase se conserva; no se borró
ni se reescribieron sus checksums. Para actualizaciones posteriores:

```
npx prisma migrate deploy
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
```

En una base nueva, migrate deploy crea el esquema inicial y aplica la conversión.
En otra base ya poblada, primero se debe comparar su esquema antes de marcar una
migración como aplicada. No usar migrate reset contra la base compartida.

Se conservaron los registros existentes de Supabase; no se copiaron datos del
servidor MySQL local. Los propietarios antiguos solo se transfieren cuando la
relación anterior identifica un único usuario. Los registros sin propietario
conocido permanecen accesibles solo al administrador; no se asignan por conjetura.

## Verificación

```
npm test -- --runInBand
npx tsx test/cambio-plan.integration.ts
```

La prueba de integración crea datos propios y revierte la transacción al terminar.
No ejecutar seeds de usuarios de ejemplo contra una base compartida sin acordarlo
con el equipo. El seed de planes conserva los planes existentes.
