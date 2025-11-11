import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { seedProductsIfEmpty } from "@/lib/product-seed";

export async function GET() {
  await seedProductsIfEmpty();

  const items = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { price: "asc" }
  });

  return NextResponse.json(items);
}
