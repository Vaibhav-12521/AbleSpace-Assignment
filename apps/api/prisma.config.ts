import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env for local work, or set it in the host environment before running prisma commands.',
  );
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: { url },
});
