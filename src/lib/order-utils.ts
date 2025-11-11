import { Prisma } from "@prisma/client";

import { writeAuditLog } from "./audit";
import { prisma } from "./prisma";
import type { OrderSummary } from "@/types/orders";
import type { OrderStatus } from "@/types/roles";

const DEFAULT_EXPIRATION_MINUTES = Number(process.env.ORDER_EXPIRATION_MINUTES ?? 30);

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    product: {
      select: { name: true; price: true };
    };
    user: {
      select: { email: true };
    };
    payment: true;
  };
}>;

export function buildOrderFilter(filters: { status?: string | null; query?: string | null }): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};
  const { status, query } = filters;

  if (status && status !== "ALL") {
    where.status = status as OrderStatus;
  }

  if (query) {
    const normalized = query.toLowerCase();
    const variants = normalized === query ? [query] : [query, normalized];
    where.OR = variants.flatMap((value) => [
      { nickname: { contains: value } },
      { user: { email: { contains: value } } },
      { product: { name: { contains: value } } }
    ]);
  }

  return where;
}

export function buildOrderSummary(orders: OrderWithRelations[]): OrderSummary {
  return orders.reduce<OrderSummary>(
    (acc, order) => {
      acc.total += 1;
      acc.revenue += order.status === "COMPLETED" ? order.product?.price ?? 0 : 0;
      if (order.status in acc.statuses) {
        acc.statuses[order.status as keyof OrderSummary["statuses"]] += 1;
      }
      return acc;
    },
    {
      total: 0,
      revenue: 0,
      statuses: {
        PENDING: 0,
        COMPLETED: 0,
        FAILED: 0,
        CANCELLED: 0
      }
    }
  );
}

export async function cancelExpiredOrders() {
  if (!DEFAULT_EXPIRATION_MINUTES || DEFAULT_EXPIRATION_MINUTES <= 0) {
    return 0;
  }
  const threshold = new Date(Date.now() - DEFAULT_EXPIRATION_MINUTES * 60 * 1000);
  const expiredOrders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      createdAt: { lt: threshold }
    },
    select: { id: true, userId: true }
  });

  if (expiredOrders.length === 0) {
    return 0;
  }

  const orderIds = expiredOrders.map((order) => order.id);

  await prisma.payment.updateMany({
    where: { orderId: { in: orderIds } },
    data: { status: "CANCELLED" }
  });

  await prisma.order.updateMany({
    where: { id: { in: orderIds } },
    data: { status: "CANCELLED" }
  });

  await Promise.all(
    expiredOrders.map((order) =>
      writeAuditLog({
        userId: order.userId,
        action: "ORDER_AUTO_CANCELLED",
        entity: "Order",
        entityId: order.id,
        metadata: { reason: "expired", auto: true }
      })
    )
  );

  return expiredOrders.length;
}
