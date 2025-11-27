import { NextRequest, NextResponse } from "next/server";

import { AdminAccessError, ensureAdminSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { buildOrderFilter, buildOrderSummary, cancelExpiredOrders } from "@/lib/order-utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  await cancelExpiredOrders();

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const query = searchParams.get("query")?.trim();

  const where = buildOrderFilter({ status, query });

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      },
      payment: true
    }
  });

  const summary = buildOrderSummary(orders);

  return NextResponse.json({ orders, summary });
}
