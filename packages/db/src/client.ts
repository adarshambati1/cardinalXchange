import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  cardinalxchangePrisma?: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    process.env.DIRECT_URL ??
    "postgresql://postgres:postgres@localhost:54322/cardinalxchange",
});

export const prisma =
  globalForPrisma.cardinalxchangePrisma ?? new PrismaClient({ adapter });
globalForPrisma.cardinalxchangePrisma = prisma;
