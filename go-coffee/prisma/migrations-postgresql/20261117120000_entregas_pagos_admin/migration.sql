-- Preserve the existing one-charge-per-cycle link before allowing charge history.
ALTER TABLE "cobros" ADD COLUMN "cicloId" INTEGER;
ALTER TABLE "cobros" ADD COLUMN "monto" DOUBLE PRECISION;
ALTER TABLE "cobros" ADD COLUMN "referencia" TEXT;
ALTER TABLE "cobros" ADD COLUMN "registradoPorId" INTEGER;
ALTER TABLE "cobros" ALTER COLUMN "fechaCobro" SET DEFAULT CURRENT_TIMESTAMP;

UPDATE "cobros" AS cobro
SET "cicloId" = ciclo."id"
FROM "ciclos" AS ciclo
WHERE ciclo."IdCobro" = cobro."id";

ALTER TABLE "ciclos" DROP CONSTRAINT "ciclos_IdCobro_fkey";
ALTER TABLE "ciclos" DROP COLUMN "IdCobro";
ALTER TABLE "suscripciones" ADD COLUMN "motivoSuspension" TEXT;

ALTER TABLE "cobros"
  ADD CONSTRAINT "cobros_cicloId_fkey"
  FOREIGN KEY ("cicloId") REFERENCES "ciclos"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cobros"
  ADD CONSTRAINT "cobros_registradoPorId_fkey"
  FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "cobros_cicloId_fechaCobro_idx" ON "cobros"("cicloId", "fechaCobro");

CREATE TABLE "metodosPago" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "titular" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "ultimos4" VARCHAR(4) NOT NULL,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "metodosPago_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "metodosPago_usuarioId_key" ON "metodosPago"("usuarioId");

ALTER TABLE "metodosPago"
  ADD CONSTRAINT "metodosPago_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
