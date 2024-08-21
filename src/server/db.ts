import { PrismaClient } from "@prisma/client";
import { fieldEncryptionExtension } from "prisma-field-encryption";

import { env } from "@/env";
import { Return } from "@prisma/client/runtime/library";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db =
  globalForPrisma.prisma ??
  createPrismaClient().$extends(fieldEncryptionExtension());

if (env.NODE_ENV !== "production")
  globalForPrisma.prisma = db as ReturnType<typeof createPrismaClient>;
