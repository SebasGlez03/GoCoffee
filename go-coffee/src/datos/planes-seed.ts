import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// Datos de ejemplo: ajustar precios y cantidades antes de usarlos en producción.
const PLANES: Prisma.PlanCreateInput[] = [
  {
    nombre: 'Café Esencial',
    cantidadBolsas: 1,
    precio: 250,
    frecuenciaEntrega: 'MENSUAL',
    estado: 'ACTUAL',
  },
  {
    nombre: 'Café Entusiasta',
    cantidadBolsas: 2,
    precio: 450,
    frecuenciaEntrega: 'QUINCENAL',
    estado: 'ACTUAL',
  },
  {
    nombre: 'Café Experto',
    cantidadBolsas: 3,
    precio: 650,
    frecuenciaEntrega: 'SEMANAL',
    estado: 'ACTUAL',
  },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Configura DATABASE_URL en el archivo .env del backend.');
  }

  const adapter = new PrismaMariaDb(databaseUrl);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$transaction(async (tx) => {
      for (const data of PLANES) {
        const existente = await tx.plan.findFirst({
          where: { nombre: data.nombre },
        });

        // Conserva planes existentes, incluso si fueron desactivados o reemplazados.
        if (existente) continue;

        await tx.plan.create({ data });
      }
    });

    console.log('Seed de planes completado. Los planes existentes se conservaron.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Error al insertar los planes:', error);
  process.exitCode = 1;
});
