import { execSync } from "node:child_process";

import { afterAll, beforeAll, beforeEach } from "vitest";

process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "test-secret";

beforeAll(() => {
  execSync("npx prisma db push --accept-data-loss", {
    stdio: "ignore",
    env: process.env
  });
});

beforeEach(async () => {
  const { prisma } = await import("@/lib/prisma");
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  const { prisma } = await import("@/lib/prisma");
  await prisma.$disconnect();
});
