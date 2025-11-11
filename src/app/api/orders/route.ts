import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { cancelExpiredOrders } from "@/lib/order-utils";

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
    data.email.length === 0 ||
    data.nickname.length === 0
  ) {
    return NextResponse.json({ message: "Invalid order payload" }, { status: 400 });
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

  const email = data.email.toLowerCase();
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

  const params = new URLSearchParams({
    customer: data.nickname.trim(),
    server_id: String(Math.round(resolvedServerId)),
    products: JSON.stringify({ [product.easyDonateProductId]: 1 }),
    email
  });

  if (successUrl) {
    params.set("success_url", successUrl);
  }

  let paymentUrl: string | null = null;
  let externalPaymentId: string | null = null;
  let externalCost: number = product.price;

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
        nickname: data.nickname,
        status: "PENDING"
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

  await writeAuditLog({
    userId: user.id,
    action: "ORDER_CREATE_PUBLIC",
    entity: "Order",
    entityId: order.id,
    metadata: {
      productId: product.id,
      price: product.price,
      paymentProvider: "EASYDONATE",
      externalPaymentId
    }
  });

  return NextResponse.json({ paymentUrl }, { status: 201 });
}
