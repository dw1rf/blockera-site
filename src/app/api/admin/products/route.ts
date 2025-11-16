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

export async function GET() {
  try {
    await ensureAdminSession();
  } catch (error) {
    return handleAdminError(error);
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  let session;
  try {
    session = await ensureAdminSession();
  } catch (error) {
    return handleAdminError(error);
  }

  const data = await request.json();

  if (
    typeof data.name !== "string" ||
    typeof data.description !== "string" ||
    typeof data.category !== "string" ||
    typeof data.price !== "number"
  ) {
    return NextResponse.json({ message: "Некорректные данные" }, { status: 400 });
  }

  if (!Number.isFinite(data.price) || data.price < 0) {
    return NextResponse.json({ message: "Некорректная цена" }, { status: 400 });
  }

  if (!CATEGORY_VALUES.includes(data.category)) {
    return NextResponse.json({ message: "Некорректная категория" }, { status: 400 });
  }

  const commands = typeof data.commands === "string" ? data.commands.trim() : null;
  if (data.commands !== undefined && data.commands !== null && typeof data.commands !== "string") {
    return NextResponse.json({ message: "Некорректное поле команды" }, { status: 400 });
  }

  let regionLimit: number | null = null;
  if (typeof data.regionLimit === "number") {
    if (!Number.isFinite(data.regionLimit) || data.regionLimit < 0) {
      return NextResponse.json({ message: "Некорректное ограничение привата" }, { status: 400 });
    }
    regionLimit = Math.round(data.regionLimit);
  } else if (data.regionLimit !== undefined && data.regionLimit !== null) {
    return NextResponse.json({ message: "Некорректное ограничение привата" }, { status: 400 });
  }

  let easyDonateProductId: string | null = null;
  if (typeof data.easyDonateProductId === "string") {
    easyDonateProductId = data.easyDonateProductId.trim() || null;
  } else if (data.easyDonateProductId !== undefined && data.easyDonateProductId !== null) {
    return NextResponse.json({ message: "Некорректный ID товара EasyDonate" }, { status: 400 });
  }

  let easyDonateServerId: number | null = null;
  if (typeof data.easyDonateServerId === "number") {
    if (!Number.isFinite(data.easyDonateServerId) || data.easyDonateServerId <= 0) {
      return NextResponse.json({ message: "Некорректный ID сервера EasyDonate" }, { status: 400 });
    }
    easyDonateServerId = Math.round(data.easyDonateServerId);
  } else if (data.easyDonateServerId !== undefined && data.easyDonateServerId !== null) {
    return NextResponse.json({ message: "Некорректный ID сервера EasyDonate" }, { status: 400 });
  }

  let privilegeRank: number | null = null;
  if (typeof data.privilegeRank === "number") {
    if (!Number.isFinite(data.privilegeRank) || data.privilegeRank <= 0) {
      return NextResponse.json({ message: "Некорректный порядковый номер привилегии" }, { status: 400 });
    }
    privilegeRank = Math.round(data.privilegeRank);
  } else if (data.privilegeRank !== undefined && data.privilegeRank !== null) {
    return NextResponse.json({ message: "Некорректный порядковый номер привилегии" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name: data.name.trim(),
      description: data.description.trim(),
      category: data.category,
      price: Math.round(data.price),
      highlight:
        typeof data.highlight === "string" && data.highlight.trim().length > 0
          ? data.highlight.trim()
          : null,
      commands: commands && commands.length > 0 ? commands : null,
      regionLimit,
      easyDonateProductId,
      easyDonateServerId,
      privilegeRank,
      status: data.status && STATUS_VALUES.includes(data.status) ? data.status : "ACTIVE"
    }
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "PRODUCT_CREATE",
    entity: "Product",
    entityId: product.id,
    metadata: {
      name: product.name,
      price: product.price,
      status: product.status
    }
  });

  return NextResponse.json(product, { status: 201 });
}
