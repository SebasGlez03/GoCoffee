ALTER TABLE `ciclos` ADD COLUMN `planIdAplicado` INTEGER NULL, ADD COLUMN `precioAplicado` DOUBLE NULL;
UPDATE `ciclos` c JOIN `suscripciones` s ON s.`id` = c.`suscripcionId`
JOIN `planes` p ON p.`id` = s.`planId`
SET c.`planIdAplicado` = p.`id`;
-- No inventa precios históricos para ciclos anteriores.
ALTER TABLE `solicitudCambioPlanSuscritos`
ADD COLUMN `numCicloAplicacion` INTEGER NOT NULL DEFAULT 1,
ADD COLUMN `precioAnterior` DOUBLE NULL,
ADD COLUMN `precioNuevo` DOUBLE NULL,
ADD COLUMN `nombreAnterior` VARCHAR(191) NULL,
ADD COLUMN `nombreNuevo` VARCHAR(191) NULL,
ADD COLUMN `fechaAplicacion` DATETIME(3) NULL;
