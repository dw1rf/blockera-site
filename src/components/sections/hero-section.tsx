import Image from "next/image";
import Link from "next/link";
import { ShieldIcon, SparklesIcon, UsersIcon } from "lucide-react";

import { CopyIpButton } from "@/components/copy-ip-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HERO_TEXT = {
  badge: "Сервер выживания Minecraft",
  heading:
    " Blockera — приключение, которое не становится рутиной",
  description:
    " Исследуйте выживание с честным балансом, сезонными событиями без pay‑to‑win. Собирайте друзей, стройте базы и побеждайте в соревновательных активностях.",
  donateLink: "Перейти в магазин",
  statsTitleVersion: "Версия Java",
  statsTitlePlayers: " Вместимость",
  statsTitleCommunity: "Сообщество",
  statsValueVersion: "1.20.x",
  statsValuePlayers: "500 онлайн",
  statsValueCommunity: "discord.gg/c5xAPdHhZW",
  reasonsTitle: "Почему игроки остаются",
  quickFactsTitle: "Коротко о главном",
  quickFacts: [
    "Выделенный хостинг в Европе.",
    "Ежедневные бэкапы и защита от гриферов.",
    "Ответ поддержки до 10 минут."
  ]
} as const;

const heroHighlights = [
{
    icon: <SparklesIcon className="h-5 w-5" />,
    title: "Сезонные события",
    description: "Еженедельные квесты и дропы от команды гейм-дизайна."
  },
  {
    icon: <ShieldIcon className="h-5 w-5" />,
    title: "Честная игра",
    description: "Правила сервера и античит держат PvP честным 24/7."
  },
  {
    icon: <UsersIcon className="h-5 w-5" />,
    title: "Активное сообщество",
    description: "Отзывчивая команда и живой Discord — легко собрать пати."
  }
] as const;

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-midnight-light/30">
      <div className="pointer-events-none absolute inset-0">
        <Image src="/images/hero-bg.svg" alt="" fill priority className="object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/10 via-midnight/80 to-midnight" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-28 md:grid-cols-[minmax(0,1fr)_400px] md:pb-32 md:pt-32">
        <div className="space-y-8">
          <span className="text-xs uppercase tracking-[0.4em] text-primary">{HERO_TEXT.badge}</span>
          <h1 className="text-balance text-4xl font-semibold uppercase leading-tight tracking-[0.15em] text-white md:text-5xl">
            {HERO_TEXT.heading}
          </h1>
          <p className="max-w-xl text-base text-white/70 md:text-lg">{HERO_TEXT.description}</p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <CopyIpButton ipAddress="blockera.goida.host" />
            <Link
              href="/donate"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "w-full gap-2 border-white/20 sm:w-auto"
              )}
            >
              {HERO_TEXT.donateLink}
            </Link>
          </div>
          <dl className="grid gap-6 text-sm text-white/70 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-[0.35em] text-white/40">{HERO_TEXT.statsTitleVersion}</dt>
              <dd className="mt-2 text-lg font-semibold text-white">{HERO_TEXT.statsValueVersion}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.35em] text-white/40">{HERO_TEXT.statsTitlePlayers}</dt>
              <dd className="mt-2 text-lg font-semibold text-white">{HERO_TEXT.statsValuePlayers}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.35em] text-white/40">{HERO_TEXT.statsTitleCommunity}</dt>
              <dd className="mt-2 text-lg font-semibold text-white">{HERO_TEXT.statsValueCommunity}</dd>
            </div>
          </dl>
        </div>

        <div className="relative hidden md:block">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/30 via-transparent to-purple-500/20 blur-3xl" />
          <div className="relative h-full rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">{HERO_TEXT.reasonsTitle}</p>
            <div className="mt-8 space-y-6">
              {heroHighlights.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    {item.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-medium text-white">{item.title}</p>
                    <p className="text-sm text-white/60">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-white/60">
              <p className="font-medium uppercase tracking-[0.3em] text-white/50">{HERO_TEXT.quickFactsTitle}</p>
              <ul className="mt-4 space-y-2">
                {HERO_TEXT.quickFacts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
