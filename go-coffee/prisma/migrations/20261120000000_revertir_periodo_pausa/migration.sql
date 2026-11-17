-- Alinea MySQL con el esquema actual tras descartar las pausas por periodo.
ALTER TABLE `suscripciones`
  DROP COLUMN `pausaFin`,
  DROP COLUMN `pausaInicio`;
