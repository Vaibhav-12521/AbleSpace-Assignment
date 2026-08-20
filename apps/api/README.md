# Pyramid API

NestJS + Prisma backend for the Pyramid task manager. See the
[root README](../../README.md) for architecture, the API reference, and setup.

```bash
npm install
cp .env.example .env      # DATABASE_URL, JWT_SECRET
npx prisma migrate dev
npm run start:dev         # http://localhost:3001
npm test                  # unit tests, no database needed
```
