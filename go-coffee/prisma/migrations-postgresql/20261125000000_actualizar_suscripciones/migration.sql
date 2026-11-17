BEGIN;

-- Respaldo separado del esquema público antes de convertir las relaciones.
CREATE SCHEMA "gocoffee_respaldo_20261125";
REVOKE ALL ON SCHEMA "gocoffee_respaldo_20261125" FROM PUBLIC;
CREATE TABLE "gocoffee_respaldo_20261125"."usuarios" AS TABLE "public"."usuarios";
CREATE TABLE "gocoffee_respaldo_20261125"."planes" AS TABLE "public"."planes";
CREATE TABLE "gocoffee_respaldo_20261125"."suscripciones" AS TABLE "public"."suscripciones";
CREATE TABLE "gocoffee_respaldo_20261125"."ciclos" AS TABLE "public"."ciclos";
CREATE TABLE "gocoffee_respaldo_20261125"."entregas" AS TABLE "public"."entregas";
CREATE TABLE "gocoffee_respaldo_20261125"."cobros" AS TABLE "public"."cobros";
CREATE TABLE "gocoffee_respaldo_20261125"."direccionesEntrega" AS TABLE "public"."direccionesEntrega";
CREATE TABLE "gocoffee_respaldo_20261125"."solicitudCambioPlanSuscritos" AS TABLE "public"."solicitudCambioPlanSuscritos";
CREATE TABLE "gocoffee_respaldo_20261125"."_prisma_migrations" AS TABLE "public"."_prisma_migrations";

ALTER TABLE "ciclos" ADD COLUMN "entregaPausada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "planIdAplicado" INTEGER,
ADD COLUMN "precioAplicado" DOUBLE PRECISION,
ADD COLUMN "suscripcionId" INTEGER;
ALTER TABLE "suscripciones" ADD COLUMN "usuarioId" INTEGER;

-- Transfiere únicamente las asociaciones con un propietario inequívoco.
UPDATE "suscripciones" s SET "usuarioId" = anterior.propietario
FROM (SELECT "IdSuscripcion", MIN(id) AS propietario FROM "usuarios"
WHERE "IdSuscripcion" IS NOT NULL GROUP BY "IdSuscripcion" HAVING COUNT(*) = 1) anterior
WHERE anterior."IdSuscripcion" = s.id;

-- Copia cada vínculo de ciclo anterior, sin borrar ciclos originales ni huérfanos.
INSERT INTO "ciclos" ("fechaProgramada", "numCiclo", "IdCobro", "IdEntrega", "suscripcionId", "planIdAplicado")
SELECT c."fechaProgramada", c."numCiclo", c."IdCobro", c."IdEntrega", s.id, s."planId"
FROM "suscripciones" s JOIN "ciclos" c ON c.id = s."IdCiclo";

ALTER TABLE "suscripciones" DROP CONSTRAINT "suscripciones_IdCiclo_fkey";
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_IdSuscripcion_fkey";
ALTER TABLE "suscripciones" DROP COLUMN "IdCiclo";
ALTER TABLE "usuarios" DROP COLUMN "IdSuscripcion";

ALTER TABLE "solicitudCambioPlanSuscritos" ADD COLUMN "fechaAplicacion" TIMESTAMP(3),
ADD COLUMN "nombreAnterior" TEXT, ADD COLUMN "nombreNuevo" TEXT,
ADD COLUMN "numCicloAplicacion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "precioAnterior" DOUBLE PRECISION, ADD COLUMN "precioNuevo" DOUBLE PRECISION;

CREATE UNIQUE INDEX "ciclos_suscripcionId_numCiclo_key" ON "ciclos"("suscripcionId", "numCiclo");
CREATE INDEX "suscripciones_usuarioId_idx" ON "suscripciones"("usuarioId");
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_usuarioId_fkey"
FOREIGN KEY ("usuarioId") REFERENCES "usuarios"(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ciclos" ADD CONSTRAINT "ciclos_suscripcionId_fkey"
FOREIGN KEY ("suscripcionId") REFERENCES "suscripciones"(id) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
