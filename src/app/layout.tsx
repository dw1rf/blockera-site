import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import "./globals.css";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";

const headingFont = Poppins({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
  display: "swap"
});

const bodyFont = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Blockera — Minecraft сервер",
    template: "%s | Blockera"
  },
  description:
    "Blockera — премиальный Minecraft сервер с уникальными игровыми режимами, системой доната и мгновенной выдачей привилегий.",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-midnight text-white", headingFont.variable, bodyFont.variable)}>
        <Header />
        <main className="pt-24">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
