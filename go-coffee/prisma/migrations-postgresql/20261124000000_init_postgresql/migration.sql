-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."ciclos" (
    "id" SERIAL NOT NULL,
    "fechaProgramada" TIMESTAMP(3) NOT NULL,
    "numCiclo" INTEGER NOT NULL,
    "IdCobro" INTEGER,
    "IdEntrega" INTEGER,

    CONSTRAINT "ciclos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cobros" (
    "id" SERIAL NOT NULL,
    "fechaCobro" TIMESTAMP(3) NOT NULL,
    "estadoCobro" TEXT NOT NULL,

    CONSTRAINT "cobros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."direccionesEntrega" (
    "id" SERIAL NOT NULL,
    "calle" TEXT NOT NULL,
    "codigoPostal" TEXT NOT NULL,
    "numeroCasa" TEXT NOT NULL,
    "estado" TEXT NOT NULL,

    CONSTRAINT "direccionesEntrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."entregas" (
    "id" SERIAL NOT NULL,
    "fechaEntrega" TIMESTAMP(3) NOT NULL,
    "estadoEntrega" TEXT NOT NULL,

    CONSTRAINT "entregas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."planes" (
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
CREATE TABLE "public"."solicitudCambioPlanSuscritos" (
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

-- CreateTable
CREATE TABLE "public"."suscripciones" (
    "id" SERIAL NOT NULL,
    "diaSemana" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estadoSuscripcion" TEXT NOT NULL,
    "IdCiclo" INTEGER,
    "IdDireccionEntrega" INTEGER,
    "planId" INTEGER NOT NULL,

    CONSTRAINT "suscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "passwordHash" VARCHAR(72) NOT NULL,
    "rol" VARCHAR(20) NOT NULL DEFAULT 'CLIENTE',
    "IdSuscripcion" INTEGER,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "public"."usuarios"("email" ASC);

-- AddForeignKey
ALTER TABLE "public"."ciclos" ADD CONSTRAINT "ciclos_IdCobro_fkey" FOREIGN KEY ("IdCobro") REFERENCES "public"."cobros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ciclos" ADD CONSTRAINT "ciclos_IdEntrega_fkey" FOREIGN KEY ("IdEntrega") REFERENCES "public"."entregas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solicitudCambioPlanSuscritos" ADD CONSTRAINT "solicitudCambioPlanSuscritos_idPlanAnterior_fkey" FOREIGN KEY ("idPlanAnterior") REFERENCES "public"."planes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solicitudCambioPlanSuscritos" ADD CONSTRAINT "solicitudCambioPlanSuscritos_idPlanNuevo_fkey" FOREIGN KEY ("idPlanNuevo") REFERENCES "public"."planes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solicitudCambioPlanSuscritos" ADD CONSTRAINT "solicitudCambioPlanSuscritos_idSuscripcion_fkey" FOREIGN KEY ("idSuscripcion") REFERENCES "public"."suscripciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."suscripciones" ADD CONSTRAINT "suscripciones_IdCiclo_fkey" FOREIGN KEY ("IdCiclo") REFERENCES "public"."ciclos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."suscripciones" ADD CONSTRAINT "suscripciones_IdDireccionEntrega_fkey" FOREIGN KEY ("IdDireccionEntrega") REFERENCES "public"."direccionesEntrega"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."suscripciones" ADD CONSTRAINT "suscripciones_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."planes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_IdSuscripcion_fkey" FOREIGN KEY ("IdSuscripcion") REFERENCES "public"."suscripciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
