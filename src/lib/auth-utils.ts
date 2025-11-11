import { getServerSession } from "next-auth";

import { authOptions } from "./auth";
import { prisma } from "./prisma";

export class AdminAccessError extends Error {
  constructor() {
    super("Недостаточно прав");
  }
}

export async function ensureAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new AdminAccessError();
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "ADMIN") {
    throw new AdminAccessError();
  }
  return session;
}
