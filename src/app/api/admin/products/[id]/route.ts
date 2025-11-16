import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { AdminAccessError, ensureAdminSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

const CATEGORY_VALUES = ["privilege", "case", "booster", "cosmetic"] as const;
const STATUS_VALUES = ["ACTIVE", "HIDDEN", "ARCHIVED"] as const;

function handleAdminError(error: unknown) {
  if (error instanceof AdminAccessError) {
    return NextResponse.json({ message: "Недостаточно прав" }, { status: 403 });
  }
  throw error;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let session;
  try {
    session = await ensureAdminSession();
  } catch (error) {
    return handleAdminError(error);
  }

  const data = await request.json();
  const updates: Record<string, unknown> = {};

  if (typeof data.name === "string") updates.name = data.name.trim();
  if (typeof data.description === "string") updates.description = data.description.trim();
  if (typeof data.highlight === "string") {
    updates.highlight = data.highlight.trim() || null;
  } else if (data.highlight === null) {
    updates.highlight = null;
  }

  if (typeof data.category === "string") {
    if (!CATEGORY_VALUES.includes(data.category)) {
      return NextResponse.json({ message: "Некорректная категория" }, { status: 400 });
    }
    updates.category = data.category;
  }

  if (typeof data.price === "number") {
    if (!Number.isFinite(data.price) || data.price < 0) {
      return NextResponse.json({ message: "Некорректная цена" }, { status: 400 });
    }
    updates.price = Math.round(data.price);
  }

  if (typeof data.commands === "string") {
    updates.commands = data.commands.trim() || null;
  } else if (data.commands === null) {
    updates.commands = null;
  }

  if (typeof data.regionLimit === "number") {
    if (!Number.isFinite(data.regionLimit) || data.regionLimit < 0) {
      return NextResponse.json({ message: "Некорректное ограничение привата" }, { status: 400 });
    }
    updates.regionLimit = Math.round(data.regionLimit);
  } else if (data.regionLimit === null) {
    updates.regionLimit = null;
  }

  if (typeof data.easyDonateProductId === "string") {
    updates.easyDonateProductId = data.easyDonateProductId.trim() || null;
  } else if (data.easyDonateProductId === null) {
    updates.easyDonateProductId = null;
  }

  if (typeof data.easyDonateServerId === "number") {
    if (!Number.isFinite(data.easyDonateServerId) || data.easyDonateServerId <= 0) {
      return NextResponse.json({ message: "Некорректный ID сервера EasyDonate" }, { status: 400 });
    }
    updates.easyDonateServerId = Math.round(data.easyDonateServerId);
  } else if (data.easyDonateServerId === null) {
    updates.easyDonateServerId = null;
  }

  if (typeof data.privilegeRank === "number") {
    if (!Number.isFinite(data.privilegeRank) || data.privilegeRank <= 0) {
      return NextResponse.json({ message: "Некорректный порядковый номер привилегии" }, { status: 400 });
    }
    updates.privilegeRank = Math.round(data.privilegeRank);
  } else if (data.privilegeRank === null) {
    updates.privilegeRank = null;
  }

  if (typeof data.status === "string") {
    if (!STATUS_VALUES.includes(data.status)) {
      return NextResponse.json({ message: "Некорректный статус" }, { status: 400 });
    }
    updates.status = data.status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ message: "Нет изменений" }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data: updates
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "PRODUCT_UPDATE",
    entity: "Product",
    entityId: product.id,
    metadata: updates
  });

  return NextResponse.json(product);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  let session;
  try {
    session = await ensureAdminSession();
  } catch (error) {
    return handleAdminError(error);
  }

  const product = await prisma.$transaction(async (tx) => {
    const relatedOrders = await tx.order.findMany({
      where: { productId: params.id },
      select: { id: true }
    });

    if (relatedOrders.length > 0) {
      const orderIds = relatedOrders.map((order) => order.id);
      await tx.payment.deleteMany({ where: { orderId: { in: orderIds } } });
      await tx.order.deleteMany({ where: { id: { in: orderIds } } });
    }

    return tx.product.delete({
      where: { id: params.id }
    });
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "PRODUCT_DELETE",
    entity: "Product",
    entityId: product.id
  });

  return NextResponse.json({ success: true });
}
