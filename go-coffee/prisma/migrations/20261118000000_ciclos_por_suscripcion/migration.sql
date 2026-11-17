ALTER TABLE `ciclos` ADD COLUMN `suscripcionId` INTEGER NULL;
-- Conserva los registros antiguos y copia cada vínculo, incluso si era compartido.
INSERT INTO `ciclos` (`fechaProgramada`, `numCiclo`, `IdCobro`, `IdEntrega`, `suscripcionId`)
SELECT c.`fechaProgramada`, c.`numCiclo`, c.`IdCobro`, c.`IdEntrega`, s.`id`
FROM `suscripciones` s JOIN `ciclos` c ON s.`IdCiclo` = c.`id`;
ALTER TABLE `suscripciones` DROP FOREIGN KEY `suscripciones_IdCiclo_fkey`;
ALTER TABLE `suscripciones` DROP COLUMN `IdCiclo`;
CREATE UNIQUE INDEX `ciclos_suscripcionId_numCiclo_key` ON `ciclos` (`suscripcionId`, `numCiclo`);
ALTER TABLE `ciclos` ADD CONSTRAINT `ciclos_suscripcionId_fkey`
FOREIGN KEY (`suscripcionId`) REFERENCES `suscripciones` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
