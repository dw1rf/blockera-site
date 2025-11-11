import { prisma } from "./prisma";
import { products as staticProducts } from "./donate";

export async function seedProductsIfEmpty() {
  const existingCount = await prisma.product.count();
  if (existingCount > 0) {
    return;
  }

  await Promise.all(
    staticProducts.map((product) =>
      prisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          highlight: product.highlight ?? null,
          commands: product.commands ?? null,
          regionLimit: typeof product.regionLimit === "number" ? product.regionLimit : null,
          status: "ACTIVE"
        }
      })
    )
  );
}
