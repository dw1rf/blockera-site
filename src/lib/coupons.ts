import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";
import { sendCouponEmail } from "@/lib/email";

export async function issueThankYouCoupon(params: { email: string; userId?: string; orderId: string }) {
  const code = `BLOCKERA-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const coupon = await prisma.coupon.create({
    data: {
      code,
      discountPercent: 10,
      expiresAt,
      issuedForEmail: params.email.toLowerCase(),
      issuedForUserId: params.userId ?? null,
      issuedForOrderId: params.orderId
    }
  });

  const sent = await sendCouponEmail({ to: params.email, code: coupon.code, expiresAt });
  if (!sent) {
    console.warn("[coupon] Coupon email was not sent", { orderId: params.orderId, email: params.email });
  }
}
