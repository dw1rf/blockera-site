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
const sessionMaxAge = 60 * 60 * 24 * 30;
const sessionUpdateAge = 60 * 60 * 24;
const secureCookies = process.env.NEXTAUTH_URL?.startsWith("https://") ?? process.env.NODE_ENV === "production";
const cookiePrefix = secureCookies ? "__Secure-" : "";
const cookieDomain = process.env.NEXTAUTH_COOKIE_DOMAIN?.trim();
const baseCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: secureCookies,
  domain: cookieDomain && cookieDomain.length > 0 ? cookieDomain : undefined
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: sessionMaxAge,
    updateAge: sessionUpdateAge
  },
  jwt: {
    maxAge: sessionMaxAge
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/sign-in"
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        ...baseCookieOptions,
        httpOnly: true,
        maxAge: sessionMaxAge
      }
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        ...baseCookieOptions,
        httpOnly: false,
        maxAge: sessionMaxAge
      }
    },
    csrfToken: {
      name: `${cookiePrefix}next-auth.csrf-token`,
      options: {
        ...baseCookieOptions,
        httpOnly: false,
        maxAge: sessionMaxAge
      }
    }
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
