import { createHmac, timingSafeEqual } from "crypto";

import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { issueThankYouCoupon } from "@/lib/coupons";
import { prisma } from "@/lib/prisma";

function isValidString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

type WebhookPayload = {
  payment_id?: string | number;
  cost?: string | number;
  customer?: string;
  signature?: string;
  [key: string]: unknown;
};

function parseWebhookPayload(rawBody: string): WebhookPayload | null {
  const trimmed = rawBody.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object") {
      return parsed as WebhookPayload;
    }
  } catch {
    // Fall through to try parsing as form-encoded data.
  }

  const params = new URLSearchParams(trimmed);
  if ([...params.keys()].length === 0) {
    return null;
  }

  const nestedPayload = params.get("payload");
  if (nestedPayload) {
    try {
      const parsed = JSON.parse(nestedPayload);
      if (parsed && typeof parsed === "object") {
        return parsed as WebhookPayload;
      }
    } catch {
      // Ignore nested payload parsing issues and fall back to plain params.
    }
  }

  const fallbackPayload: WebhookPayload = {};
  params.forEach((value, key) => {
    fallbackPayload[key] = value;
  });

  return Object.keys(fallbackPayload).length > 0 ? fallbackPayload : null;
}

export async function POST(request: Request) {
  const shopKey = process.env.EASYDONATE_SHOP_KEY;
  if (!shopKey) {
    console.error("[webhook] EASYDONATE_SHOP_KEY is not configured");
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const rawBody = await request.text();
  const payload = parseWebhookPayload(rawBody);
  if (!payload) {
    console.error("[webhook] Failed to parse payload", rawBody);
    return NextResponse.json({ success: false }, { status: 400 });
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("payment_id" in payload) ||
    !("cost" in payload) ||
    !("customer" in payload)
  ) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  if (!isValidString(payload.signature)) {
    console.warn("[webhook] Missing signature", payload);
  }

  const signatureSource = `${payload.payment_id}@${payload.cost}@${payload.customer}`;
  const expectedSignature = createHmac("sha256", shopKey).update(signatureSource).digest("hex");

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

  let isSignatureValid = false;
  try {
    const providedSignature = Buffer.from(payload.signature ?? "", "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    isSignatureValid =
      providedSignature.length === expectedBuffer.length && timingSafeEqual(providedSignature, expectedBuffer);
  } catch {
    isSignatureValid = false;
  }

  const costNumber = Number(payload.cost);
  const parsedAmount = Number.isFinite(costNumber) ? Math.round(costNumber) : paymentRecord.amount;

  if (!isSignatureValid) {
    const nicknameMatches = (payload.customer as string | undefined)?.toString()?.toLowerCase() ===
      paymentRecord.order.nickname.toLowerCase();
    const amountMatches = parsedAmount === paymentRecord.amount;
    if (!nicknameMatches || !amountMatches) {
      console.warn("[webhook] Invalid signature and fallback checks failed", {
        paymentId: externalPaymentId,
        cost: payload.cost,
        nicknameMatches,
        amountMatches
      });
      return NextResponse.json({ success: false }, { status: 400 });
    }
    console.warn("[webhook] Signature invalid, proceeding due to matching payment/amount", {
      paymentId: externalPaymentId
    });
  }

  const amount = parsedAmount;

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
