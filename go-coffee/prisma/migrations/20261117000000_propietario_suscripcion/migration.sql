-- Los registros sin propietario conocido permanecen accesibles solo al administrador.
ALTER TABLE `suscripciones` ADD COLUMN `usuarioId` INTEGER NULL;

-- Se transfiere la relacion anterior solo cuando identifica un unico propietario.
-- Las asociaciones ambiguas se conservan en usuarios.IdSuscripcion para su revision.
UPDATE `suscripciones` s
JOIN (
  SELECT `IdSuscripcion`, MIN(`id`) AS propietario
  FROM `usuarios`
  WHERE `IdSuscripcion` IS NOT NULL
  GROUP BY `IdSuscripcion`
  HAVING COUNT(*) = 1
) anterior ON anterior.`IdSuscripcion` = s.`id`
SET s.`usuarioId` = anterior.propietario;

CREATE INDEX `suscripciones_usuarioId_idx` ON `suscripciones`(`usuarioId`);
ALTER TABLE `suscripciones` ADD CONSTRAINT `suscripciones_usuarioId_fkey`
  FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
