import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { AdminAccessError, ensureAdminSession } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

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

  const { searchParams } = request.nextUrl;
  const action = searchParams.get("action")?.trim();
  const entity = searchParams.get("entity")?.trim();
  const query = searchParams.get("query")?.trim();

  const where: Prisma.AuditLogWhereInput = {};
  const andFilters: Prisma.AuditLogWhereInput[] = [];

  if (action) {
    const normalized = action.toLowerCase();
    const filters: Prisma.AuditLogWhereInput[] = [{ action: { contains: action } }];
    if (normalized !== action) {
      filters.push({ action: { contains: normalized } });
    }
    andFilters.push({ OR: filters });
  }

  if (entity) {
    const normalized = entity.toLowerCase();
    const filters: Prisma.AuditLogWhereInput[] = [{ entity: { contains: entity } }];
    if (normalized !== entity) {
      filters.push({ entity: { contains: normalized } });
    }
    andFilters.push({ OR: filters });
  }

  if (query) {
    const normalized = query.toLowerCase();
    const filters: Prisma.AuditLogWhereInput[] = [
      { entityId: { contains: query } },
      { user: { email: { contains: query } } }
    ];
    if (normalized !== query) {
      filters.push(
        { entityId: { contains: normalized } },
        { user: { email: { contains: normalized } } }
      );
    }
    where.OR = filters;
  }

  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      user: {
        select: { email: true, id: true }
      }
    }
  });

  return NextResponse.json(
    logs.map((log) => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null
    }))
  );
}

