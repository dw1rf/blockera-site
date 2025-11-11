import { compare, hash } from "bcryptjs";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "./prisma";
import type { UserRole } from "@/types/roles";

const allowedAdminEmails = (process.env.SEED_ADMIN_EMAILS ?? process.env.ALLOWED_ADMIN_EMAILS ?? "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const defaultAdminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/sign-in"
  },
  providers: [
    CredentialsProvider({
      name: "Email и пароль",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const email = credentials.email.toLowerCase();
        const password = credentials.password;

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user && allowedAdminEmails.includes(email)) {
          if (password !== defaultAdminPassword) {
            return null;
          }

          const hashedPassword = await hash(defaultAdminPassword, 10);
          user = await prisma.user.create({
            data: {
              email,
              hashedPassword,
              role: "ADMIN",
              name: "Администратор"
            }
          });
        }

        if (!user) {
          return null;
        }

        const isValid = await compare(password, user.hashedPassword);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as { role: UserRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    }
  }
};
