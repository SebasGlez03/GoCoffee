import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'; // mantén la ruta que tenía tu archivo
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly client: PrismaClient;

  constructor() {
    const adapter = new PrismaMariaDb(
      process.env.DATABASE_URL ?? 'mysql://root:12345678@localhost:3306/go-coffee'
    );
    this.client = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}