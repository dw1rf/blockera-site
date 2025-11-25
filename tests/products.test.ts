import { describe, expect, it } from "vitest";

import { GET as getProducts } from "@/app/api/products/route";
import { prisma } from "@/lib/prisma";

const buildProductInput = (overrides: Partial<Parameters<typeof prisma.product.create>[0]["data"]> = {}) => ({
  name: overrides.name ?? "Test Product",
  description: overrides.description ?? "Visible in shop",
  price: overrides.price ?? 100,
  category: overrides.category ?? "privilege",
  status: overrides.status ?? "ACTIVE",
  highlight: overrides.highlight ?? null,
  commands: overrides.commands ?? null,
  regionLimit: overrides.regionLimit ?? null
});

describe("products API", () => {
  it("returns all non-hidden products regardless of status casing", async () => {
    const legacyActive = await prisma.product.create({
      data: buildProductInput({ name: "Legacy", status: "active" })
    });
    const properActive = await prisma.product.create({
      data: buildProductInput({ name: "Proper", status: "ACTIVE" })
    });

    const hiddenProduct = await prisma.product.create({
      data: buildProductInput({ name: "Hidden", status: "HIDDEN" })
    });
    const archivedProduct = await prisma.product.create({
      data: buildProductInput({ name: "Archived", status: "archived" })
    });

    const response = await getProducts();
    expect(response.status).toBe(200);
    const body = (await response.json()) as Array<{ id: string; name: string }>;
    const returnedIds = body.map((product) => product.id);

    expect(returnedIds).toContain(legacyActive.id);
    expect(returnedIds).toContain(properActive.id);
    expect(returnedIds).not.toContain(hiddenProduct.id);
    expect(returnedIds).not.toContain(archivedProduct.id);
  });
});
