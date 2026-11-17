import { PrismaPg } from '@prisma/adapter-pg';

export function crearAdaptadorPostgres() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !/^postgres(?:ql)?:\/\//.test(connectionString)) {
    throw new Error('Configura DATABASE_URL con una conexión PostgreSQL (postgresql://usuario:password@host:5432/base).');
  }
  return new PrismaPg({ connectionString });
}
