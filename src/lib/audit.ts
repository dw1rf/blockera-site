import { Prisma } from "@prisma/client";

import { prisma } from "./prisma";

interface AuditPayload {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function writeAuditLog(payload: AuditPayload) {
  const { userId = null, action, entity, entityId = null, metadata } = payload;

  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId ?? undefined,
        metadata: metadata ? JSON.stringify(metadata) : undefined
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      console.warn("[audit] Unable to link audit entry to user, storing without userId", {
        action,
        entity,
        entityId
      });

      await prisma.auditLog.create({
        data: {
          userId: null,
          action,
          entity,
          entityId: entityId ?? undefined,
          metadata: metadata ? JSON.stringify(metadata) : undefined
        }
      });
      return;
    }

    throw error;
  }
}
