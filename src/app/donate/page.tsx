import type { Metadata } from "next";

import { DonateShop } from "@/components/donate/donate-shop";
import { CopyIpButton } from "@/components/copy-ip-button";

export const metadata: Metadata = {
  title: "\u0414\u043e\u043d\u0430\u0442-\u043c\u0430\u0433\u0430\u0437\u0438\u043d Blockera",
  description:
    "\u0412\u044b\u0431\u0438\u0440\u0430\u0439 \u043f\u0440\u0438\u0432\u0438\u043b\u0435\u0433\u0438\u0438, \u043a\u043e\u0441\u043c\u0435\u0442\u0438\u043a\u0443 \u0438 \u0431\u0443\u0441\u0442\u0435\u0440\u044b Blockera \u0431\u0435\u0437 pay-to-win \u0431\u0430\u0440\u044c\u0435\u0440\u043e\u0432. \u0414\u043e\u043d\u0430\u0442 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u0435 \u0441\u0435\u0440\u0432\u0435\u0440\u0430 \u0438 \u043d\u043e\u0432\u044b\u0435 \u0438\u0432\u0435\u043d\u0442\u044b."
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
            Выбирай привилегии и поддержку сервера без Pay-to-Win
          </h1>
          <p className="max-w-2xl text-base text-white/70 md:text-lg">
            Донат-магазин помогает оплачивать хостинг, запускать новые активности и поддерживать команду модераторов.
            Все предметы настроены так, чтобы не ломать баланс и честный PvP.
          </p>
          <CopyIpButton ipAddress="blockera.goida.host" />
        </div>

        <div className="mt-16">
          <DonateShop />
        </div>
      </div>
    </div>
  );
}
