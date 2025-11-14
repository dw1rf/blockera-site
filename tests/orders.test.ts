import { describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/prisma";
import { seedProductsIfEmpty } from "@/lib/product-seed";

import { PATCH as adminUpdateOrder } from "@/app/api/admin/orders/[id]/route";
import { POST as createOrder } from "@/app/api/orders/route";

vi.mock("@/lib/auth-utils", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth-utils")>("@/lib/auth-utils");
  return {
    ...actual,
    ensureAdminSession: vi.fn().mockResolvedValue({ user: { id: "admin-test-user" } })
  };
});

const jsonRequest = (url: string, method: string, body: unknown) =>
  new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

describe("orders flow", () => {
  it("creates public order and allows admin status change", async () => {
    await prisma.user.create({
      data: {
        id: "admin-test-user",
        email: "admin-test@example.com",
        hashedPassword: "hashed-password",
        role: "ADMIN"
      }
    });

    await seedProductsIfEmpty();
    const product = await prisma.product.findFirst({ where: { status: "ACTIVE" } });
    expect(product).not.toBeNull();

    const createResponse = await createOrder(
      jsonRequest("http://localhost/api/orders", "POST", {
        email: "steve@gmail.com",
        nickname: "PlayerOne",
        productId: product!.id
      })
    );

    expect(createResponse.status).toBe(201);
    const order = (await createResponse.json()) as { id: string };

    const user = await prisma.user.findUnique({ where: { email: "steve@gmail.com" } });
    expect(user?.role).toBe("USER");

    const audit = await prisma.auditLog.findMany();
    expect(audit.length).toBeGreaterThan(0);

    const patchResponse = await adminUpdateOrder(
      jsonRequest(`http://localhost/api/admin/orders/${order.id}`, "PATCH", {
        status: "COMPLETED"
      }),
      { params: { id: order.id } }
    );

    expect(patchResponse.status).toBe(200);
    const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    expect(updatedOrder?.status).toBe("COMPLETED");
  });
});
