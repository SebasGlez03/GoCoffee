-- La propiedad de las suscripciones se guarda en suscripciones.usuarioId.
ALTER TABLE `usuarios` DROP FOREIGN KEY `usuarios_IdSuscripcion_fkey`;
ALTER TABLE `usuarios` DROP COLUMN `IdSuscripcion`;
