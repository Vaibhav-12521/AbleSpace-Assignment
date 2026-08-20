import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma 7 reads the CLI's connection URL from here (migrate / studio / db push).
// The runtime connection is made separately by the pg adapter in PrismaService.
// No `migrations.seed` entry: there is no global seed step. Every guest login
// creates its own workspace and populates it (WorkspaceBootstrapService), so an
// empty database is the correct starting state.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
