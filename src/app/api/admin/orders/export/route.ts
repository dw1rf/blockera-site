import { NextRequest, NextResponse } from "next/server";

import { AdminAccessError, ensureAdminSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { buildOrderFilter } from "@/lib/order-utils";

function handleAdminError(error: unknown) {
  if (error instanceof AdminAccessError) {
    return NextResponse.json({ message: "Недостаточно прав" }, { status: 403 });
  }
  throw error;
}

export async function GET(request: NextRequest) {
  try {
    await ensureAdminSession();
  } catch (error) {
    return handleAdminError(error);
  }

  const searchParams = request.nextUrl.searchParams;
  const where = buildOrderFilter({
    status: searchParams.get("status"),
    query: searchParams.get("query")?.trim()
  });

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: { name: true, price: true }
      },
      user: {
        select: { email: true }
      }
    }
  });

  const header = "ID;Статус;Игровой ник;Email;Товар;Цена;Создан";
  const rows = orders.map((order) =>
    [
      order.id,
      order.status,
      order.nickname,
      order.user?.email ?? "",
      order.product?.name ?? "",
      order.product?.price ?? "",
      order.createdAt.toISOString()
    ].join(";")
  );

  const csv = [header, ...rows].join("\n");
  const filename = `orders-${Date.now()}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
