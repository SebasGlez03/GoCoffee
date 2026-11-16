/*
  Warnings:

  - You are about to drop the column `cicloIdCiclo` on the `suscripciones` table. All the data in the column will be lost.
  - You are about to drop the column `direccionEntregaIdDireccionEntrega` on the `suscripciones` table. All the data in the column will be lost.
  - You are about to drop the column `suscripcionIdSuscripcion` on the `usuarios` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "suscripciones" DROP CONSTRAINT "suscripciones_cicloIdCiclo_fkey";

-- DropForeignKey
ALTER TABLE "suscripciones" DROP CONSTRAINT "suscripciones_direccionEntregaIdDireccionEntrega_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_suscripcionIdSuscripcion_fkey";

-- AlterTable
ALTER TABLE "suscripciones" DROP COLUMN "cicloIdCiclo",
DROP COLUMN "direccionEntregaIdDireccionEntrega",
ADD COLUMN     "IdCiclo" INTEGER,
ADD COLUMN     "IdDireccionEntrega" INTEGER;

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "suscripcionIdSuscripcion",
ADD COLUMN     "IdSuscripcion" INTEGER;

-- CreateTable
CREATE TABLE "solicitudCambioPlanSuscritos" (
    "id" SERIAL NOT NULL,
    "idSuscripcion" INTEGER NOT NULL,
    "idPlanAnterior" INTEGER NOT NULL,
    "idPlanNuevo" INTEGER NOT NULL,
    "fechaNuevoCiclo" TIMESTAMP(3) NOT NULL,
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaResolucion" TIMESTAMP(3),
    "estadoSolicitud" TEXT NOT NULL,

    CONSTRAINT "solicitudCambioPlanSuscritos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_IdSuscripcion_fkey" FOREIGN KEY ("IdSuscripcion") REFERENCES "suscripciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_IdDireccionEntrega_fkey" FOREIGN KEY ("IdDireccionEntrega") REFERENCES "direccionesEntrega"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_IdCiclo_fkey" FOREIGN KEY ("IdCiclo") REFERENCES "ciclos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudCambioPlanSuscritos" ADD CONSTRAINT "solicitudCambioPlanSuscritos_idSuscripcion_fkey" FOREIGN KEY ("idSuscripcion") REFERENCES "suscripciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudCambioPlanSuscritos" ADD CONSTRAINT "solicitudCambioPlanSuscritos_idPlanAnterior_fkey" FOREIGN KEY ("idPlanAnterior") REFERENCES "planes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudCambioPlanSuscritos" ADD CONSTRAINT "solicitudCambioPlanSuscritos_idPlanNuevo_fkey" FOREIGN KEY ("idPlanNuevo") REFERENCES "planes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
