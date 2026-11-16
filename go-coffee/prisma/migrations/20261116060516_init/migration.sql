-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(160) NOT NULL,
    `passwordHash` VARCHAR(72) NOT NULL,
    `rol` VARCHAR(20) NOT NULL DEFAULT 'CLIENTE',
    `IdSuscripcion` INTEGER NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `cantidadBolsas` INTEGER NOT NULL,
    `precio` DOUBLE NOT NULL,
    `frecuenciaEntrega` VARCHAR(191) NOT NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` VARCHAR(191) NOT NULL DEFAULT 'ACTUAL',
    `remplazadoPorId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suscripciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `planId` INTEGER NOT NULL,
    `diaSemana` VARCHAR(191) NOT NULL,
    `fechaInicio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estadoSuscripcion` VARCHAR(191) NOT NULL,
    `IdDireccionEntrega` INTEGER NULL,
    `IdCiclo` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `direccionesEntrega` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `calle` VARCHAR(191) NOT NULL,
    `codigoPostal` VARCHAR(191) NOT NULL,
    `numeroCasa` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ciclos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fechaProgramada` DATETIME(3) NOT NULL,
    `numCiclo` INTEGER NOT NULL,
    `IdCobro` INTEGER NULL,
    `IdEntrega` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cobros` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fechaCobro` DATETIME(3) NOT NULL,
    `estadoCobro` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entregas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fechaEntrega` DATETIME(3) NOT NULL,
    `estadoEntrega` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `solicitudCambioPlanSuscritos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idSuscripcion` INTEGER NOT NULL,
    `idPlanAnterior` INTEGER NOT NULL,
    `idPlanNuevo` INTEGER NOT NULL,
    `fechaNuevoCiclo` DATETIME(3) NOT NULL,
    `fechaSolicitud` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaResolucion` DATETIME(3) NULL,
    `estadoSolicitud` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_IdSuscripcion_fkey` FOREIGN KEY (`IdSuscripcion`) REFERENCES `suscripciones`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `suscripciones` ADD CONSTRAINT `suscripciones_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `planes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `suscripciones` ADD CONSTRAINT `suscripciones_IdDireccionEntrega_fkey` FOREIGN KEY (`IdDireccionEntrega`) REFERENCES `direccionesEntrega`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `suscripciones` ADD CONSTRAINT `suscripciones_IdCiclo_fkey` FOREIGN KEY (`IdCiclo`) REFERENCES `ciclos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ciclos` ADD CONSTRAINT `ciclos_IdCobro_fkey` FOREIGN KEY (`IdCobro`) REFERENCES `cobros`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ciclos` ADD CONSTRAINT `ciclos_IdEntrega_fkey` FOREIGN KEY (`IdEntrega`) REFERENCES `entregas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `solicitudCambioPlanSuscritos` ADD CONSTRAINT `solicitudCambioPlanSuscritos_idSuscripcion_fkey` FOREIGN KEY (`idSuscripcion`) REFERENCES `suscripciones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `solicitudCambioPlanSuscritos` ADD CONSTRAINT `solicitudCambioPlanSuscritos_idPlanAnterior_fkey` FOREIGN KEY (`idPlanAnterior`) REFERENCES `planes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `solicitudCambioPlanSuscritos` ADD CONSTRAINT `solicitudCambioPlanSuscritos_idPlanNuevo_fkey` FOREIGN KEY (`idPlanNuevo`) REFERENCES `planes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
