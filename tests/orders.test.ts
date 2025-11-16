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

const originalFetch = globalThis.fetch;
const fetchMock = vi.fn();

describe("orders flow", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as typeof globalThis.fetch;
    process.env.EASYDONATE_SHOP_KEY = "test-shop-key";
    process.env.EASYDONATE_DEFAULT_SERVER_ID = "12345";
    process.env.EASYDONATE_SUCCESS_URL = "https://blockera.test/success";
  });

  afterAll(() => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      // @ts-expect-error cleanup fetch stub when not available
      delete globalThis.fetch;
    }
  });

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

    const discountValue = Math.min(100, Math.max(product!.price - 1, 0));
    const expectedCost = product!.price - discountValue;

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          response: { discount: discountValue, target: { id: product!.id } }
        }),
        { status: 200 }
      )
    );

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          response: {
            url: "https://pay.easydonate.test/ABC123",
            payment: { id: "payment-1", cost: expectedCost }
          }
        }),
        { status: 200 }
      )
    );

    const createResponse = await createOrder(
      jsonRequest("http://localhost/api/orders", "POST", {
        email: "steve@gmail.com",
        nickname: "PlayerOne",
        productId: product!.id
      })
    );

    expect(createResponse.status).toBe(201);
    const body = (await createResponse.json()) as { paymentUrl?: string; payableAmount?: number; discount?: number };
    expect(body.paymentUrl).toBeTypeOf("string");
    expect(body.payableAmount).toBe(expectedCost);
    expect(body.discount).toBe(product!.price - expectedCost);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const user = await prisma.user.findUnique({ where: { email: "steve@gmail.com" } });
    expect(user?.role).toBe("USER");

    const storedOrder = await prisma.order.findFirstOrThrow({ where: { userId: user!.id } });

    const audit = await prisma.auditLog.findMany();
    expect(audit.length).toBeGreaterThan(0);

    const patchResponse = await adminUpdateOrder(
      jsonRequest(`http://localhost/api/admin/orders/${storedOrder.id}`, "PATCH", {
        status: "COMPLETED"
      }),
      { params: { id: storedOrder.id } }
    );

    expect(patchResponse.status).toBe(200);
    const updatedOrder = await prisma.order.findUnique({ where: { id: storedOrder.id } });
    expect(updatedOrder?.status).toBe("COMPLETED");
  });
});
