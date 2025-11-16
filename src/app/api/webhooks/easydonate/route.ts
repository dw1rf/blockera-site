import { createHmac, timingSafeEqual } from "crypto";

import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { issueThankYouCoupon } from "@/lib/coupons";
import { prisma } from "@/lib/prisma";

function isValidString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export async function POST(request: Request) {
  const shopKey = process.env.EASYDONATE_SHOP_KEY;
  if (!shopKey) {
    console.error("[webhook] EASYDONATE_SHOP_KEY is not configured");
    return NextResponse.json({ success: false }, { status: 500 });
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch (error) {
    console.error("[webhook] Failed to parse JSON", error);
    return NextResponse.json({ success: false }, { status: 400 });
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("payment_id" in payload) ||
    !("cost" in payload) ||
    !("customer" in payload) ||
    !isValidString(payload.signature)
  ) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const signatureSource = `${payload.payment_id}@${payload.cost}@${payload.customer}`;
  const expectedSignature = createHmac("sha256", shopKey).update(signatureSource).digest("hex");

  let providedSignature: Buffer;
  let expectedBuffer: Buffer;
  try {
    providedSignature = Buffer.from(payload.signature, "hex");
    expectedBuffer = Buffer.from(expectedSignature, "hex");
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  if (
    providedSignature.length !== expectedBuffer.length ||
    !timingSafeEqual(providedSignature, expectedBuffer)
  ) {
    console.warn("[webhook] Invalid signature", payload.payment_id);
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const externalPaymentId = String(payload.payment_id);
  const paymentRecord = await prisma.payment.findFirst({
    where: { externalId: externalPaymentId },
    include: {
      order: {
        select: {
          id: true,
          userId: true,
          promoCodeInput: true,
          user: { select: { email: true } }
        }
      }
    }
  });

  if (!paymentRecord || !paymentRecord.order) {
    console.warn("[webhook] Payment not found", externalPaymentId);
    return NextResponse.json({ success: true });
  }

  const costNumber = Number(payload.cost);
  const amount = Number.isFinite(costNumber) ? Math.round(costNumber) : paymentRecord.amount;

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        amount,
        status: "RECEIVED",
        currency: "RUB",
        provider: "EASYDONATE"
      }
    }),
    prisma.order.update({
      where: { id: paymentRecord.order.id },
      data: { status: "COMPLETED" }
    })
  ]);

  await writeAuditLog({
    userId: paymentRecord.order.userId,
    action: "PAYMENT_RECEIVED",
    entity: "Order",
    entityId: paymentRecord.order.id,
    metadata: {
      provider: "EASYDONATE",
      externalPaymentId,
      amount
    }
  });

  if (paymentRecord.order.promoCodeInput) {
    await prisma.coupon.updateMany({
      where: {
        code: paymentRecord.order.promoCodeInput,
        used: false
      },
      data: {
        used: true,
        usedAt: new Date()
      }
    });
  }

  const couponAlreadyIssued = await prisma.coupon.findFirst({
    where: { issuedForOrderId: paymentRecord.order.id }
  });

  if (!couponAlreadyIssued && paymentRecord.order.user?.email) {
    try {
      await issueThankYouCoupon({
        email: paymentRecord.order.user.email,
        userId: paymentRecord.order.userId,
        orderId: paymentRecord.order.id
      });
    } catch (error) {
      console.error("[webhook] Failed to issue thank-you coupon", error);
    }
  }

  return NextResponse.json({ success: true });
}
