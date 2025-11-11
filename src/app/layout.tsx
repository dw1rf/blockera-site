import type { Metadata } from "next";

import "./globals.css";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SessionProviderWrapper } from "@/components/providers/session-provider";
import { cn } from "@/lib/utils";


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
      <body className={cn("min-h-screen bg-midnight text-white")}> 
        <SessionProviderWrapper>
          <Header />
          <main className="pt-24">{children}</main>
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
