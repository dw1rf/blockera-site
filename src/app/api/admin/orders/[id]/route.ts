import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { AdminAccessError, ensureAdminSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (typeof body.status === "string" && ["PENDING", "COMPLETED", "FAILED", "CANCELLED"].includes(body.status)) {
    updates.status = body.status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ message: "Нет изменений" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: updates
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "ORDER_UPDATE",
    entity: "Order",
    entityId: order.id,
    metadata: updates
  });

  return NextResponse.json(order);
}
