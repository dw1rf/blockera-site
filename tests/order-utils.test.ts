import { randomUUID } from "node:crypto";

import { describe, expect, it, beforeEach } from "vitest";

import { prisma } from "@/lib/prisma";
import { seedProductsIfEmpty } from "@/lib/product-seed";
import { buildOrderSummary, cancelExpiredOrders, type OrderWithRelations } from "@/lib/order-utils";

const createOrder = async (status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED", minutesAgo = 0) => {
  const product = await prisma.product.findFirst();
  if (!product) {
    throw new Error("No product available for tests");
  }

  const user = await prisma.user.create({
    data: {
      email: `${status}-${minutesAgo}-${randomUUID()}@example.com`,
      hashedPassword: "hashed",
      role: "USER"
    }
  });

  return prisma.order.create({
    data: {
      userId: user.id,
      productId: product.id,
      nickname: `${status}-player`,
      status,
      createdAt: new Date(Date.now() - minutesAgo * 60 * 1000)
    }
  });
};

describe("order utils", () => {
  beforeEach(async () => {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "Payment",
        "Order",
        "AuditLog",
        "Coupon",
        "Product",
        "User"
      RESTART IDENTITY CASCADE
    `);
    await seedProductsIfEmpty();
  });

  it("builds summary for orders", async () => {
    await createOrder("COMPLETED");
    await createOrder("COMPLETED");
    await createOrder("PENDING");

    const orders = (await prisma.order.findMany({
      include: {
        product: { select: { name: true, price: true } },
        user: { select: { email: true } },
        payment: true
      }
    })) as OrderWithRelations[];

    const summary = buildOrderSummary(orders);
    expect(summary.total).toBe(3);
    expect(summary.statuses.COMPLETED).toBe(2);
    expect(summary.statuses.PENDING).toBe(1);
    expect(summary.revenue).toBeGreaterThan(0);
  });

  it("cancels expired pending orders and logs audit", async () => {
    process.env.ORDER_EXPIRATION_MINUTES = "30";

    const recent = await createOrder("PENDING", 5);
    const expired = await createOrder("PENDING", 60);

    const cancelled = await cancelExpiredOrders();
    expect(cancelled).toBe(1);

    const refreshedExpired = await prisma.order.findUnique({ where: { id: expired.id } });
    expect(refreshedExpired?.status).toBe("CANCELLED");

    const refreshedRecent = await prisma.order.findUnique({ where: { id: recent.id } });
    expect(refreshedRecent?.status).toBe("PENDING");

    const auditRecords = await prisma.auditLog.findMany({ where: { entityId: expired.id } });
    expect(auditRecords.length).toBeGreaterThan(0);
  });
});
