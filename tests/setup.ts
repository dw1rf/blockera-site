import "dotenv/config";
import { execSync } from "node:child_process";

import { afterAll, beforeAll, beforeEach } from "vitest";

function configureTestDatabase() {
  const testDbUrl = process.env.TEST_DATABASE_URL;
  const testDirectUrl = process.env.TEST_DIRECT_URL;

  if (testDbUrl) {
    process.env.DATABASE_URL = testDbUrl;
    process.env.DIRECT_URL = testDirectUrl ?? process.env.DIRECT_URL ?? testDbUrl;
    return;
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not configured. Set TEST_DATABASE_URL for tests.");
  }

  const isLikelySafe =
    /localhost|127\.0\.0\.1|file:/i.test(dbUrl) || /_test|test_/i.test(dbUrl);

  if (!isLikelySafe) {
    throw new Error(
      [
        "TEST_DATABASE_URL is not set and DATABASE_URL does not look like a local test database.",
        "To avoid wiping production data, create a dedicated test database and set TEST_DATABASE_URL/TEST_DIRECT_URL before running tests."
      ].join(" ")
    );
  }
}

configureTestDatabase();

process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "test-secret";

beforeAll(() => {
  execSync("npx prisma db push --accept-data-loss", {
    stdio: "ignore",
    env: process.env
  });
});

beforeEach(async () => {
  const { prisma } = await import("@/lib/prisma");
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "Payment",
      "Order",
      "AuditLog",
      "Coupon",
      "Product",
      "User"
    RESTART IDENTITY CASCADE
  `);
});

afterAll(async () => {
  const { prisma } = await import("@/lib/prisma");
  await prisma.$disconnect();
});
