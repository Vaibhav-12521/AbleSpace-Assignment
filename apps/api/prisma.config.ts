import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma 7 reads the CLI's connection URL from here (migrate / studio / db push).
// The runtime connection is made separately by the pg adapter in PrismaService.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
