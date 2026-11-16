import * as bcrypt from 'bcryptjs';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client'; // mantén la ruta de importación que ya tiene el archivo en la línea 1-3
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb(
  process.env.DATABASE_URL ?? 'mysql://root:12345678@localhost:3306/go-coffee'
);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'admin@go-coffee.com';
  const clienteEmail = 'cliente@go-coffee.com';

  const passwordHashAdmin = await bcrypt.hash('123456', 10);
  const passwordHashCliente = await bcrypt.hash('123456', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: passwordHashAdmin,
      rol: 'ADMINISTRADOR',
    },
  });

  const cliente = await prisma.usuario.upsert({
    where: { email: clienteEmail },
    update: {},
    create: {
      email: clienteEmail,
      passwordHash: passwordHashCliente,
      rol: 'CLIENTE',
    },
  });

  console.log('Usuarios creados:');
  console.log(admin);
  console.log(cliente);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });