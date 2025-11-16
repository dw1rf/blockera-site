import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/prisma";

import { GET as listProducts, POST as createProduct } from "@/app/api/admin/products/route";
import { DELETE as deleteProduct, PATCH as updateProduct } from "@/app/api/admin/products/[id]/route";

const ensureAdminSessionMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth-utils", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth-utils")>("@/lib/auth-utils");
  return {
    ...actual,
    ensureAdminSession: ensureAdminSessionMock
  };
});

const jsonRequest = (url: string, method: string, body: unknown) =>
  new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

describe("admin products API", () => {
  it("creates, updates and deletes a product", async () => {
    const adminId = randomUUID();
    ensureAdminSessionMock.mockResolvedValue({ user: { id: adminId } });

    await prisma.user.create({
      data: {
        id: adminId,
        email: `${adminId}@example.com`, 
        hashedPassword: "hashed-password",
        role: "ADMIN"
      }
    });

    const createResponse = await createProduct(
      jsonRequest("http://localhost/api/admin/products", "POST", {
        name: "Test VIP",
        description: "Тестовое описание",
        price: 999,
        category: "privilege",
        highlight: "Новинка"
      })
    );

    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as { id: string; price: number };

    const updateResponse = await updateProduct(
      jsonRequest(`http://localhost/api/admin/products/${created.id}`, "PATCH", {
        price: 1299,
        status: "HIDDEN"
      }),
      { params: { id: created.id } }
    );

    expect(updateResponse.status).toBe(200);
    const updated = (await updateResponse.json()) as { price: number; status: string };
    expect(updated.price).toBe(1299);
    expect(updated.status).toBe("HIDDEN");

    const listResponse = await listProducts();
    const list = (await listResponse.json()) as Array<{ id: string }>;
    expect(list.some((product) => product.id === created.id)).toBe(true);

    const deleteResponse = await deleteProduct(new Request(`http://localhost/api/admin/products/${created.id}`), {
      params: { id: created.id }
    });
    expect(deleteResponse.status).toBe(200);

    const productsLeft = await prisma.product.findMany();
    expect(productsLeft).toHaveLength(0);

    const auditRows = await prisma.auditLog.findMany();
    expect(auditRows).not.toHaveLength(0);
  });
});





