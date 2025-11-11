import { prisma } from "../src/lib/prisma";
import { products } from "../src/lib/donate";

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        commands: product.commands ?? null,
        price: product.price,
        category: product.category,
        regionLimit: product.regionLimit ?? null,
        easyDonateProductId: product.easyDonateProductId ?? null,
        easyDonateServerId: product.easyDonateServerId ?? null,
        status: "ACTIVE"
      },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        commands: product.commands ?? null,
        price: product.price,
        category: product.category,
        regionLimit: product.regionLimit ?? null,
        easyDonateProductId: product.easyDonateProductId ?? null,
        easyDonateServerId: product.easyDonateServerId ?? null,
        status: "ACTIVE"
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Products synced");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
