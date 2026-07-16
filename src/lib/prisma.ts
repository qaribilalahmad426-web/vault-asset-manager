import { PrismaClient } from "@prisma/client";

// Standard Next.js singleton pattern — prevents exhausting DB connections
// from hot-reloading in development.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

// `new PrismaClient()` reads and validates `DATABASE_URL` immediately at
// construction time — if it's undefined, Prisma throws right away. Next.js
// imports this module while statically analyzing routes during `next build`
// ("collecting page data"), which can happen before runtime environment
// variables are populated in some CI/deploy setups. Constructing eagerly at
// module scope would turn a missing env var into a *build* failure instead
// of the intended runtime failure.
//
// This Proxy defers the actual `new PrismaClient()` call to the first real
// property access (i.e. the first actual query, at request time), while
// every existing call site (`prisma.asset.findMany(...)`, etc.) keeps
// working completely unchanged. No connection string is defaulted here —
// construction just happens lazily instead of at import time.
function getPrismaInstance(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const instance = getPrismaInstance();
    return Reflect.get(instance as object, prop, instance);
  },
});
