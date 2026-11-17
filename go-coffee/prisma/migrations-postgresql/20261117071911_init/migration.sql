-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "passwordHash" VARCHAR(72) NOT NULL,
    "rol" VARCHAR(20) NOT NULL DEFAULT 'CLIENTE',

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "suscripciones" (
    "id" SERIAL NOT NULL,
    "planId" INTEGER NOT NULL,
    "diaSemana" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estadoSuscripcion" TEXT NOT NULL,
    "usuarioId" INTEGER,
    "IdDireccionEntrega" INTEGER,

    CONSTRAINT "suscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direccionesEntrega" (
    "id" SERIAL NOT NULL,
    "calle" TEXT NOT NULL,
    "codigoPostal" TEXT NOT NULL,
    "numeroCasa" TEXT NOT NULL,
    "estado" TEXT NOT NULL,

    CONSTRAINT "direccionesEntrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ciclos" (
    "id" SERIAL NOT NULL,
    "fechaProgramada" TIMESTAMP(3) NOT NULL,
    "numCiclo" INTEGER NOT NULL,
    "entregaPausada" BOOLEAN NOT NULL DEFAULT false,
    "planIdAplicado" INTEGER,
    "precioAplicado" DOUBLE PRECISION,
    "suscripcionId" INTEGER,
    "IdCobro" INTEGER,
    "IdEntrega" INTEGER,

    CONSTRAINT "ciclos_pkey" PRIMARY KEY ("id")
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
    "numCicloAplicacion" INTEGER NOT NULL DEFAULT 1,
    "precioAnterior" DOUBLE PRECISION,
    "precioNuevo" DOUBLE PRECISION,
    "nombreAnterior" TEXT,
    "nombreNuevo" TEXT,
    "fechaAplicacion" TIMESTAMP(3),

    CONSTRAINT "solicitudCambioPlanSuscritos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "suscripciones_usuarioId_idx" ON "suscripciones"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "ciclos_suscripcionId_numCiclo_key" ON "ciclos"("suscripcionId", "numCiclo");

-- AddForeignKey
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_planId_fkey" FOREIGN KEY ("planId") REFERENCES "planes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_IdDireccionEntrega_fkey" FOREIGN KEY ("IdDireccionEntrega") REFERENCES "direccionesEntrega"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ciclos" ADD CONSTRAINT "ciclos_suscripcionId_fkey" FOREIGN KEY ("suscripcionId") REFERENCES "suscripciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ciclos" ADD CONSTRAINT "ciclos_IdCobro_fkey" FOREIGN KEY ("IdCobro") REFERENCES "cobros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ciclos" ADD CONSTRAINT "ciclos_IdEntrega_fkey" FOREIGN KEY ("IdEntrega") REFERENCES "entregas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudCambioPlanSuscritos" ADD CONSTRAINT "solicitudCambioPlanSuscritos_idSuscripcion_fkey" FOREIGN KEY ("idSuscripcion") REFERENCES "suscripciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudCambioPlanSuscritos" ADD CONSTRAINT "solicitudCambioPlanSuscritos_idPlanAnterior_fkey" FOREIGN KEY ("idPlanAnterior") REFERENCES "planes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudCambioPlanSuscritos" ADD CONSTRAINT "solicitudCambioPlanSuscritos_idPlanNuevo_fkey" FOREIGN KEY ("idPlanNuevo") REFERENCES "planes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
