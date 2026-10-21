-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "passwordHash" VARCHAR(72) NOT NULL,
    "rol" VARCHAR(20) NOT NULL DEFAULT 'CLIENTE',
    "suscripcionIdSuscripcion" INTEGER,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suscripciones" (
    "id" SERIAL NOT NULL,
    "diaSemana" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estadoSuscripcion" TEXT NOT NULL,
    "direccionEntregaIdDireccionEntrega" INTEGER,

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
    "cobrosIdCobro" INTEGER,
    "entregaIdEntrega" INTEGER,

    CONSTRAINT "ciclos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cobro" (
    "id" SERIAL NOT NULL,
    "fechaCobro" TIMESTAMP(3) NOT NULL,
    "estadoCobro" TEXT NOT NULL,

    CONSTRAINT "Cobro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entrega" (
    "id" SERIAL NOT NULL,
    "fechaEntrega" TIMESTAMP(3) NOT NULL,
    "estadoEntrega" TEXT NOT NULL,

    CONSTRAINT "Entrega_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_suscripcionIdSuscripcion_fkey" FOREIGN KEY ("suscripcionIdSuscripcion") REFERENCES "suscripciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_direccionEntregaIdDireccionEntrega_fkey" FOREIGN KEY ("direccionEntregaIdDireccionEntrega") REFERENCES "direccionesEntrega"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ciclos" ADD CONSTRAINT "ciclos_cobrosIdCobro_fkey" FOREIGN KEY ("cobrosIdCobro") REFERENCES "Cobro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ciclos" ADD CONSTRAINT "ciclos_entregaIdEntrega_fkey" FOREIGN KEY ("entregaIdEntrega") REFERENCES "Entrega"("id") ON DELETE SET NULL ON UPDATE CASCADE;
