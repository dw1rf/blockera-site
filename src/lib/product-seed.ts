import { Prisma } from "@prisma/client";

import { prisma } from "./prisma";
import { products as staticProducts } from "./donate";

const canSeedAtRuntime = () =>
  process.env.NODE_ENV !== "production" || process.env.RUNTIME_SEED_PRODUCTS === "true";

type SeedOptions = {
  force?: boolean;
};

const isTransientConnectionError = (error: unknown) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    return /closed the connection|ECONNRESET|ConnectionReset/i.test(error.message);
  }
  return error instanceof Error && /closed the connection|ECONNRESET|ConnectionReset/i.test(error.message);
};

const toNullableNumber = (value: number | undefined) => (typeof value === "number" ? value : null);

const buildProductPayload = (product: (typeof staticProducts)[number]) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  category: product.category,
  privilegeRank: typeof product.privilegeRank === "number" ? product.privilegeRank : null,
  highlight: product.highlight ?? null,
  commands: product.commands ?? null,
  regionLimit: typeof product.regionLimit === "number" ? product.regionLimit : null,
  status: "ACTIVE",
  easyDonateProductId: product.easyDonateProductId ?? null,
  easyDonateServerId: toNullableNumber(product.easyDonateServerId)
});

async function syncExistingMappings() {
  await Promise.all(
    staticProducts.map((product) =>
      prisma.product
        .update({
          where: { id: product.id },
          data: {
            easyDonateProductId: product.easyDonateProductId ?? null,
            easyDonateServerId: toNullableNumber(product.easyDonateServerId),
            privilegeRank: typeof product.privilegeRank === "number" ? product.privilegeRank : null
          }
        })
        .catch((error) => {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            return null;
          }
          throw error;
        })
    )
  );
}

export async function seedProductsIfEmpty(options: SeedOptions = {}) {
  if (!options.force && !canSeedAtRuntime()) {
    await syncExistingMappings();
    return;
  }

  const attemptSeed = async () => {
    const existingCount = await prisma.product.count();
    if (existingCount > 0) {
      await syncExistingMappings();
      return;
    }

    await prisma.product.createMany({
      data: staticProducts.map((product) => buildProductPayload(product)),
      skipDuplicates: true
    });

    await syncExistingMappings();
  };

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await attemptSeed();
      return;
    } catch (error) {
      if (!isTransientConnectionError(error) || attempt === 1) {
        if (options.force) {
          throw error;
        }
        console.warn("[seed] Unable to ensure products are seeded", error);
        return;
      }

      console.warn("[seed] Transient DB issue while seeding, retrying...", error);
      try {
        await prisma.$disconnect();
      } catch {
        // ignore disconnect errors
      }
    }
  }
}
