import type { Metadata } from "next";

import { DonateShop } from "@/components/donate/donate-shop";
import { CopyIpButton } from "@/components/copy-ip-button";

export const metadata: Metadata = {
  title: "Донат магазин",
  description:
    "Поддержи Blockera и получи мгновенный доступ к привилегиям, бустерам и косметическим предметам на сервере."
};

export default function DonatePage() {
  return (
    <div className="relative isolate bg-midnight">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.35),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(20,241,149,0.25),transparent_60%)]" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-28">
        <div className="flex flex-col items-start gap-6 rounded-3xl border border-white/10 bg-white/[0.05] p-12 text-left shadow-card backdrop-blur">
          <span className="text-xs uppercase tracking-[0.4em] text-primary">blockera donate</span>
          <h1 className="text-balance text-4xl font-semibold uppercase tracking-[0.2em] text-white md:text-5xl">
            Магазин привилегий и бустеров
          </h1>
          <p className="max-w-2xl text-base text-white/70 md:text-lg">
            Покупая привилегии и наборы, ты поддерживаешь развитие сервера. Все покупки обрабатываются автоматически
            через EasyDonate и выдаются моментально.
          </p>
          <CopyIpButton ipAddress="play.blockera.ru" />
        </div>

        <div className="mt-16">
          <DonateShop />
        </div>
      </div>
    </div>
  );
}
