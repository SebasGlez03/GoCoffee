/*
  Warnings:

  - You are about to drop the column `cobrosIdCobro` on the `ciclos` table. All the data in the column will be lost.
  - You are about to drop the column `entregaIdEntrega` on the `ciclos` table. All the data in the column will be lost.
  - You are about to drop the `Cobro` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Entrega` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `idPlan` to the `suscripciones` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ciclos" DROP CONSTRAINT "ciclos_cobrosIdCobro_fkey";

-- DropForeignKey
ALTER TABLE "ciclos" DROP CONSTRAINT "ciclos_entregaIdEntrega_fkey";

-- AlterTable
ALTER TABLE "ciclos" DROP COLUMN "cobrosIdCobro",
DROP COLUMN "entregaIdEntrega",
ADD COLUMN     "IdCobro" INTEGER,
ADD COLUMN     "IdEntrega" INTEGER;

-- AlterTable
ALTER TABLE "suscripciones" ADD COLUMN     "idPlan" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Cobro";

-- DropTable
DROP TABLE "Entrega";

-- CreateTable
CREATE TABLE "planes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantidadBolsas" INTEGER NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "frecuenciaEntrega" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'ACTUAL',
    "remplazadoPorId" INTEGER,

    CONSTRAINT "planes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cobros" (
    "id" SERIAL NOT NULL,
    "fechaCobro" TIMESTAMP(3) NOT NULL,
    "estadoCobro" TEXT NOT NULL,

    CONSTRAINT "cobros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas" (
    "id" SERIAL NOT NULL,
    "fechaEntrega" TIMESTAMP(3) NOT NULL,
    "estadoEntrega" TEXT NOT NULL,

    CONSTRAINT "entregas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_idPlan_fkey" FOREIGN KEY ("idPlan") REFERENCES "planes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ciclos" ADD CONSTRAINT "ciclos_IdCobro_fkey" FOREIGN KEY ("IdCobro") REFERENCES "cobros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ciclos" ADD CONSTRAINT "ciclos_IdEntrega_fkey" FOREIGN KEY ("IdEntrega") REFERENCES "entregas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
