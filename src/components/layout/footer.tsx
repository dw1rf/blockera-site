import Link from "next/link";
import type { Route } from "next";
import type { UrlObject } from "url";
import { MailIcon, MessageCircleIcon, SendIcon } from "lucide-react";

type InternalNavLink = { label: string; href: Route | UrlObject };
type ExternalNavLink = { label: string; href: string; external: true };

const NAV_LINKS: ReadonlyArray<InternalNavLink | ExternalNavLink> = [
  { label: "Главная", href: "/" as Route },
  { label: "Донат", href: "/donate" as Route },
  { label: "Как начать", href: { pathname: "/", hash: "how-to-start" } },
  { label: "FAQ", href: { pathname: "/", hash: "faq" } },
  { label: "Wiki", href: "https://blockera-2.gitbook.io/blockera.wiki/", external: true }
];

const LEGAL_LINKS: ReadonlyArray<{ label: string; href: Route }> = [
  { label: "Условия использования", href: "/legal/terms-of-service" as Route },
  { label: "Политика возврата", href: "/legal/refund-policy" as Route },
  { label: "Политика конфиденциальности", href: "/legal/privacy-policy" as Route }
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-midnight-light/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-3 lg:grid-cols-3">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Навигация</p>
          <div className="grid grid-cols-2 gap-y-2 text-sm text-white/70 sm:gap-x-6">
            {NAV_LINKS.map((link) => {
              const key = typeof link.href === "string" ? link.href : `${link.href.pathname ?? ""}${link.href.hash ?? ""}`;
              if ("external" in link && link.external) {
                return (
                  <a
                    key={key}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-white"
                  >
                    {link.label}
                  </a>
                );
              }
              const internalLink = link as InternalNavLink;
              return (
                <Link key={key} href={internalLink.href} className="transition hover:text-white">
                  {internalLink.label}
                </Link>
              );
            })}
          </div>
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-white/50">Документы</p>
            <div className="flex flex-col gap-1 text-sm text-white/70">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3РµРј] text-white/50">Связь и поддержка</p>
          <div className="space-y-2 text-sm text-white/70">
            <p className="flex items-center gap-2">
              <SendIcon className="h-4 w-4" /> Telegram:{" "}
              <a href="https://t.me/BlockEra_BOT" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                @BlockEra_BOT
              </a>
            </p>
            <p className="flex items-center gap-2">
              <MailIcon className="h-4 w-4" /> Поддержка:{" "}
              <a href="mailto:blockera.play@inbox.ru" className="hover:text-white">
                blockera.play@inbox.ru
              </a>
            </p>
            <p className="flex items-center gap-2">
              <MessageCircleIcon className="h-4 w-4" /> Discord:{" "}
              <a href="https://discord.gg/c5xAPdHhZW" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                discord.gg/c5xAPdHhZW
              </a>
            </p>
            <p className="flex items-center gap-2">
              <SendIcon className="h-4 w-4" /> TikTok:{" "}
              <a href="https://www.tiktok.com/@blockera.official" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                @blockera.official
              </a>
            </p>
          </div>
        </div>

        <div className="space-y-3 lg:px-6 lg:text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Правовая информация</p>
          <div className="mx-auto space-y-3 rounded-3xl border border-white/10 bg-black/30 p-4 text-center text-sm text-white/70 lg:max-w-sm">
            <div className="space-y-1 text-white/80">
              <p>Самозанятый: Макаренко Александр Андреевич</p>
              <p>ИНН: 246411323680</p>
            </div>
            <p className="text-white/60">
              Все платежи и услуги предоставляются в соответствии с законодательством РФ. Для вопросов по оферте и закрывающим документам обращайтесь в поддержку.
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 bg-black/30 py-6">
        <p className="text-center text-xs uppercase tracking-[0.4em] text-white/30">
          © {new Date().getFullYear()} 2025 Blockera. Все права защищены.
        </p>
      </div>
    </footer>
  );
}


