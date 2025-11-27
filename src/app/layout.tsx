import type { Metadata } from "next";

import "./globals.css";

import Script from "next/script";

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
      <head>
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=105542413', 'ym');

              ym(105542413, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
            `
          }}
        />
      </head>
      <body className={cn("min-h-screen bg-midnight text-white")}> 
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              '<div><img src="https://mc.yandex.ru/watch/105542413" style="position:absolute; left:-9999px;" alt="" /></div>'
          }}
        />
        <SessionProviderWrapper>
          <Header />
          <main className="pt-24">{children}</main>
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
