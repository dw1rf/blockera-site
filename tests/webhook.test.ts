import { createHmac } from "node:crypto";

import { describe, expect, it, beforeEach } from "vitest";

import { POST as easyDonateWebhook } from "@/app/api/webhooks/easydonate/route";
import { prisma } from "@/lib/prisma";
import { seedProductsIfEmpty } from "@/lib/product-seed";

const buildRequest = (body: unknown) =>
  new Request("http://localhost/api/webhooks/easydonate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

async function createOrderWithPayment() {
  await seedProductsIfEmpty();
  const product = await prisma.product.findFirstOrThrow();

  const user = await prisma.user.create({
    data: {
      email: "webhook-user@example.com",
      hashedPassword: "hashed-password",
      role: "USER"
    }
  });

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      productId: product.id,
      nickname: "WebhookPlayer",
      status: "PENDING"
    }
  });

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: "EASYDONATE",
      amount: 0,
      currency: "RUB",
      status: "PENDING",
      externalId: "ext-payment"
    }
  });

  return { product, order, payment };
}

describe("EasyDonate webhook", () => {
  beforeEach(() => {
    process.env.EASYDONATE_SHOP_KEY = "test-shop-key";
  });

  it("marks payment as received and completes the order with a valid signature", async () => {
    const { product, order, payment } = await createOrderWithPayment();

    const payload = {
      payment_id: payment.externalId,
      cost: product.price.toString(),
      customer: order.nickname
    } as { payment_id: string; cost: string; customer: string; signature?: string };

    payload.signature = createHmac("sha256", process.env.EASYDONATE_SHOP_KEY!)
      .update(`${payload.payment_id}@${payload.cost}@${payload.customer}`)
      .digest("hex");

    const response = await easyDonateWebhook(buildRequest(payload));
    expect(response.status).toBe(200);
    const body = (await response.json()) as { success: boolean };
    expect(body.success).toBe(true);

    const updatedPayment = await prisma.payment.findUnique({ where: { id: payment.id } });
    expect(updatedPayment?.status).toBe("RECEIVED");
    expect(updatedPayment?.amount).toBe(product.price);

    const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    expect(updatedOrder?.status).toBe("COMPLETED");

    const auditRecords = await prisma.auditLog.findMany({
      where: { entityId: order.id, action: "PAYMENT_RECEIVED" }
    });
    expect(auditRecords.length).toBe(1);
  });

  it("rejects payloads with invalid signatures", async () => {
    const { order, payment } = await createOrderWithPayment();

    const response = await easyDonateWebhook(
      buildRequest({
        payment_id: payment.externalId,
        cost: "999",
        customer: order.nickname,
        signature: "deadbeef"
      })
    );

    expect(response.status).toBe(400);

    const stalePayment = await prisma.payment.findUnique({ where: { id: payment.id } });
    expect(stalePayment?.status).toBe("PENDING");

    const staleOrder = await prisma.order.findUnique({ where: { id: order.id } });
    expect(staleOrder?.status).toBe("PENDING");
  });
});
