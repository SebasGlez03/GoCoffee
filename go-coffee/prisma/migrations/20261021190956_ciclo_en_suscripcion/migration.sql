-- AlterTable
ALTER TABLE "suscripciones" ADD COLUMN     "cicloIdCiclo" INTEGER;

-- AddForeignKey
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_cicloIdCiclo_fkey" FOREIGN KEY ("cicloIdCiclo") REFERENCES "ciclos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
