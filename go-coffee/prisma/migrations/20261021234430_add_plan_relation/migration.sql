/*
  Warnings:

  - You are about to drop the column `idPlan` on the `suscripciones` table. All the data in the column will be lost.
  - Added the required column `planId` to the `suscripciones` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "suscripciones" DROP CONSTRAINT "suscripciones_idPlan_fkey";

-- AlterTable
ALTER TABLE "suscripciones" DROP COLUMN "idPlan",
ADD COLUMN     "planId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_planId_fkey" FOREIGN KEY ("planId") REFERENCES "planes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
