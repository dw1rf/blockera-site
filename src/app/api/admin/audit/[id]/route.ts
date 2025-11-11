import { NextResponse } from "next/server";

import { writeAuditLog } from "@/lib/audit";
import { AdminAccessError, ensureAdminSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

function handleAdminError(error: unknown) {
  if (error instanceof AdminAccessError) {
    return NextResponse.json({ message: "Недостаточно прав" }, { status: 403 });
  }
  throw error;
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  let session;
  try {
    session = await ensureAdminSession();
  } catch (error) {
    return handleAdminError(error);
  }

  const log = await prisma.auditLog.delete({
    where: { id: params.id }
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "AUDIT_DELETE",
    entity: "AuditLog",
    entityId: log.id,
    metadata: { deletedAction: log.action }
  });

  return NextResponse.json({ success: true });
}
