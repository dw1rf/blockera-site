import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { cancelExpiredOrders } from "@/lib/order-utils";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { fetchSurchargeDiscount, type SurchargeDiscount } from "@/lib/surcharge";
import type { Coupon } from "@prisma/client";

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export async function POST(request: Request) {
  const data = await request.json();

  const shopKey = process.env.EASYDONATE_SHOP_KEY;
  const defaultServerIdEnv = process.env.EASYDONATE_DEFAULT_SERVER_ID;
  const successUrl = process.env.EASYDONATE_SUCCESS_URL;

  await cancelExpiredOrders();

  if (!shopKey) {
    console.error("[orders] EASYDONATE_SHOP_KEY is not configured");
    return NextResponse.json({ message: "Оплата временно недоступна. Попробуйте позже." }, { status: 500 });
  }

  if (
    typeof data.email !== "string" ||
    typeof data.productId !== "string" ||
    typeof data.nickname !== "string" ||
    (data.promoCode && typeof data.promoCode !== "string") ||
    data.email.length === 0 ||
    data.nickname.length === 0
  ) {
    return NextResponse.json({ message: "Invalid order payload" }, { status: 400 });
  }

  if (!isValidEmail(data.email)) {
    return NextResponse.json({ message: "������� ��������� email" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product || product.status !== "ACTIVE") {
    return NextResponse.json({ message: "Product unavailable" }, { status: 404 });
  }

  if (!product.easyDonateProductId) {
    return NextResponse.json({ message: "Товар пока нельзя оплатить через сайт. Напишите поддержке." }, { status: 400 });
  }

  const resolvedServerId = product.easyDonateServerId ?? (defaultServerIdEnv ? Number(defaultServerIdEnv) : null);
  if (!resolvedServerId || !Number.isFinite(resolvedServerId) || resolvedServerId <= 0) {
    console.error("[orders] Missing EasyDonate server ID for product", product.id);
    return NextResponse.json({ message: "Товар временно недоступен. Попробуйте позже." }, { status: 500 });
  }

  const email = data.email.trim().toLowerCase();
  const nickname = data.nickname.trim();
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const randomPassword = await hash(Math.random().toString(36).slice(-12), 10);
    user = await prisma.user.create({
      data: {
        email,
        hashedPassword: randomPassword,
        role: "USER"
      }
    });
  }

  let completedPrivileges: Array<{
    productId: string;
    product: { id: string; name: string | null; price: number; privilegeRank: number | null };
  }> = [];

  if (product.category === "privilege") {
    completedPrivileges = await prisma.order.findMany({
      where: {
        nickname,
        status: "COMPLETED",
        product: { category: "privilege" }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            privilegeRank: true
          }
        }
      }
    });

    const duplicatePrivilege = completedPrivileges.find((order) => order.productId === product.id);
    if (duplicatePrivilege) {
      return NextResponse.json({ message: "Этот ник уже обладает этой привилегией" }, { status: 400 });
    }

    const targetRank = typeof product.privilegeRank === "number" ? product.privilegeRank : null;
    if (targetRank !== null) {
      let highestPrivilege = completedPrivileges.reduce<
        (typeof completedPrivileges)[number] | null
      >((best, current) => {
        const currentRank = current.product?.privilegeRank ?? null;
        if (typeof currentRank !== "number") {
          return best;
        }
        if (!best) {
          return current;
        }
        const bestRank = best.product?.privilegeRank ?? null;
        if (typeof bestRank !== "number" || currentRank > bestRank) {
          return current;
        }
        return best;
      }, null);

      if (
        highestPrivilege &&
        typeof highestPrivilege.product?.privilegeRank === "number" &&
        highestPrivilege.product.privilegeRank >= targetRank
      ) {
        const currentName = highestPrivilege.product.name ?? "другая привилегия";
        return NextResponse.json(
          {
            message: `Нельзя купить привилегию ниже текущей (${currentName})`
          },
          { status: 400 }
        );
      }
    }
  }

  let surchargeDiscount: SurchargeDiscount | null = null;
  let ownedPrivilegeCredit = 0;

  if (product.category === "privilege") {
    const highestOwned = completedPrivileges
      .filter((order) => typeof order.product?.privilegeRank === "number")
      .reduce<(typeof completedPrivileges)[number] | null>((best, current) => {
        const currentRank = current.product?.privilegeRank ?? null;
        if (typeof currentRank !== "number") return best;
        if (!best) return current;
        const bestRank = best.product?.privilegeRank ?? null;
        if (typeof bestRank !== "number" || currentRank > bestRank) return current;
        return best;
      }, null);

    if (
      highestOwned &&
      typeof highestOwned.product?.privilegeRank === "number" &&
      typeof product.privilegeRank === "number" &&
      highestOwned.product.privilegeRank < product.privilegeRank &&
      typeof highestOwned.product.price === "number"
    ) {
      ownedPrivilegeCredit = Math.max(0, highestOwned.product.price);
    }

    if (product.easyDonateProductId) {
      surchargeDiscount = await fetchSurchargeDiscount({
        shopKey,
        username: nickname,
        productId: product.easyDonateProductId,
        serverId: resolvedServerId
      });
    }
  }

  const selectedEasyDonateProductId = surchargeDiscount?.discountProductId ?? product.easyDonateProductId;
  if (!selectedEasyDonateProductId) {
    console.error("[orders] Missing EasyDonate product ID for payment");
    return NextResponse.json({ message: "Товар пока нельзя оплатить через сайт. Напишите поддержке." }, { status: 400 });
  }

  const params = new URLSearchParams({
    customer: nickname,
    server_id: String(Math.round(resolvedServerId)),
    products: JSON.stringify({ [selectedEasyDonateProductId]: 1 }),
    email
  });

  if (successUrl) {
    params.set("success_url", successUrl);
  }

  let paymentUrl: string | null = null;
  let externalPaymentId: string | null = null;

  const appliedSurchargeRaw = Math.max(surchargeDiscount?.amount ?? 0, ownedPrivilegeCredit);
  const appliedSurcharge = Math.min(appliedSurchargeRaw, product.price);
  const subtotalAfterSurcharge = Math.max(product.price - appliedSurcharge, 0);

  let appliedCoupon: Coupon | null = null;
  let couponDiscountAmount = 0;
  let normalizedPromoCode: string | null = null;

  if (typeof data.promoCode === "string" && data.promoCode.trim().length > 0) {
    normalizedPromoCode = data.promoCode.trim().toUpperCase();
    appliedCoupon = await prisma.coupon.findUnique({ where: { code: normalizedPromoCode ?? undefined } });

    if (!appliedCoupon) {
      return NextResponse.json({ message: "Промокод не найден" }, { status: 400 });
    }
    if (appliedCoupon.used) {
      return NextResponse.json({ message: "Промокод уже использован" }, { status: 400 });
    }
    if (appliedCoupon.expiresAt <= new Date()) {
      return NextResponse.json({ message: "Срок действия промокода истёк" }, { status: 400 });
    }
    if (appliedCoupon.issuedForEmail && appliedCoupon.issuedForEmail !== email) {
      return NextResponse.json({ message: "Промокод привязан к другому адресу" }, { status: 400 });
    }

    const percentDiscount = Math.min(Math.max(appliedCoupon.discountPercent, 0), 100);
    couponDiscountAmount = Math.floor((subtotalAfterSurcharge * percentDiscount) / 100);

    if (normalizedPromoCode) {
      params.set("coupon", normalizedPromoCode);
    }
  }

  const expectedCost = Math.max(subtotalAfterSurcharge - couponDiscountAmount, 0);

  let externalCost: number = expectedCost;

  try {
    const easydonateResponse = await fetch(`https://easydonate.ru/api/v3/shop/payment/create?${params.toString()}`, {
      method: "GET",
      headers: {
        "Shop-Key": shopKey
      },
      cache: "no-store"
    });

    const payload = (await easydonateResponse.json()) as {
      success?: boolean;
      response?: {
        url?: string;
        payment?: {
          id: number | string;
          cost?: number;
        };
      };
      response_code?: number;
      response_message?: string;
    };

    if (!easydonateResponse.ok || !payload.success || !payload.response?.url || !payload.response.payment?.id) {
      console.error("[orders] EasyDonate payment/create failed", payload);
      const fallbackMessage =
        typeof payload.response === "string"
          ? payload.response
          : payload.response_message ?? "Не удалось создать платёж. Попробуйте ещё раз.";
      return NextResponse.json({ message: fallbackMessage }, { status: 502 });
    }

    paymentUrl = payload.response.url;
    externalPaymentId = String(payload.response.payment.id);
    if (typeof payload.response.payment.cost === "number") {
      externalCost = Math.round(payload.response.payment.cost);
    }
  } catch (error) {
    console.error("[orders] EasyDonate request error", error);
    return NextResponse.json({ message: "Платёжный сервис недоступен. Попробуйте позже." }, { status: 502 });
  }

  if (!paymentUrl || !externalPaymentId) {
    return NextResponse.json({ message: "Не удалось получить ссылку на оплату" }, { status: 502 });
  }

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        userId: user!.id,
        productId: product.id,
        nickname,
        status: "PENDING",
        promoCodeInput: normalizedPromoCode
      },
      include: {
        product: true
      }
    });

    await tx.payment.create({
      data: {
        orderId: createdOrder.id,
        provider: "EASYDONATE",
        amount: externalCost,
        currency: "RUB",
        status: "PENDING",
        externalId: externalPaymentId
      }
    });

    return createdOrder;
  });

  const totalDiscount = product.price > externalCost ? product.price - externalCost : 0;

  await writeAuditLog({
    userId: user.id,
    action: "ORDER_CREATE_PUBLIC",
    entity: "Order",
    entityId: order.id,
    metadata: {
      productId: product.id,
      price: product.price,
      paymentProvider: "EASYDONATE",
      payableAmount: externalCost,
      externalPaymentId,
      surchargeDiscount: appliedSurcharge > 0 ? appliedSurcharge : undefined,
      requestedSurchargeDiscount: surchargeDiscount?.amount ?? undefined,
      surchargeTargetProductId: surchargeDiscount?.targetProductId ?? undefined,
      promoCode: normalizedPromoCode ?? undefined,
      couponDiscountAmount: couponDiscountAmount > 0 ? couponDiscountAmount : undefined
    }
  });

  return NextResponse.json(
    {
      paymentUrl,
      payableAmount: externalCost,
      discount: totalDiscount
    },
    { status: 201 }
  );
}
