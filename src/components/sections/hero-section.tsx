"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";

import { CopyIpButton } from "@/components/copy-ip-button";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const floatingY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  return (
    <section ref={ref} className="relative isolate overflow-hidden">
      <div className="absolute inset-0">
        <motion.div style={{ y: backgroundY }} className="absolute inset-0">
          <Image
            src="/images/hero-bg.svg"
            alt="Подземный мир Minecraft"
            fill
            priority
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-midnight/80 to-midnight" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-16 px-6 pb-28 pt-40 text-center">
        <motion.div style={{ y: floatingY }} className="flex flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/70">
            <SparklesIcon className="h-3.5 w-3.5" /> сезон 3 уже запущен
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold uppercase leading-tight tracking-[0.2em] text-white drop-shadow-[0_20px_60px_rgba(20,20,60,0.75)] md:text-6xl">
            Исследуй Blockera — твой новый мир Minecraft
          </h1>
          <p className="max-w-2xl text-base text-white/70 md:text-lg">
            Уникальные данжи, кастомные ивенты, честная экономика и мгновенная выдача привилегий. Подключайся уже
            сегодня и стань частью растущего сообщества Blockera.
          </p>
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <CopyIpButton ipAddress="play.blockera.ru" />
            <Button variant="outline" className="gap-2 border-white/30 bg-white/5">
              <ArrowRightIcon className="h-4 w-4" /> Подробнее о сервере
            </Button>
          </div>
        </motion.div>

        <motion.div
          style={{ y: floatingY }}
          className="grid w-full gap-6 md:grid-cols-3"
        >
          {cards.map((card) => (
            <div
              key={card.title}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-card backdrop-blur-sm"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
              <p className="text-xs uppercase tracking-[0.35em] text-primary/80">{card.tag}</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-wide text-white">{card.title}</h3>
              <p className="mt-3 text-sm text-white/65">{card.description}</p>
              <Link href={card.href} className="mt-6 inline-flex items-center text-sm font-medium text-primary">
                {card.link}
              </Link>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const cards = [
  {
    tag: "community",
    title: "1 500+ активных игроков",
    description: "Ежедневные заходы, совместные ивенты и дружелюбный дискорд-сервер с модераторами 24/7.",
    link: "Присоединиться к Discord",
    href: "#community"
  },
  {
    tag: "progress",
    title: "Экономика с прогрессом",
    description: "Фермы, торговцы и уникальные предметы, которые влияют на развитие и PvP баланс.",
    link: "Узнать особенности",
    href: "#features"
  },
  {
    tag: "support",
    title: "Поддержка EasyDonate",
    description: "Оплачивай донат в пару кликов и получай привилегии автоматически через RCON.",
    link: "Перейти к донату",
    href: "/donate"
  }
];
