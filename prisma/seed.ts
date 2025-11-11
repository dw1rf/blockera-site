import "dotenv/config";

import bcrypt from "bcryptjs";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const emailsEnv = process.env.SEED_ADMIN_EMAILS ?? process.env.SEED_ADMIN_EMAIL ?? "admin@blockera.ru";
  const adminEmails = emailsEnv
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  for (const email of adminEmails) {
    await prisma.user.upsert({
      where: { email },
      update: { hashedPassword, role: "ADMIN" },
      create: {
        email,
        name: "Администратор",
        hashedPassword,
        role: "ADMIN"
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
