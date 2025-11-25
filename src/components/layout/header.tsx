"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { UrlObject } from "url";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { MenuIcon, MessageCircleIcon, SendIcon, XIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InternalNavItem = { label: string; href: Route | UrlObject };
type ExternalNavItem = { label: string; href: string; external: true };
type NavItem = InternalNavItem | ExternalNavItem;

const baseNavItems = [
  { label: "Главная", href: "/" as Route },
  { label: "Донат", href: "/donate" as Route },
  { label: "Как начать", href: { pathname: "/", hash: "how-to-start" } },
  { label: "FAQ", href: { pathname: "/", hash: "faq" } },
  { label: "Wiki", href: "https://blockera-2.gitbook.io/blockera.wiki/", external: true }
] satisfies ReadonlyArray<NavItem>;

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const isAdmin = session?.user.role === "ADMIN";
  const navItems = isAdmin ? [...baseNavItems, { label: "Админ", href: "/admin" as Route }] : baseNavItems;

  const handleToggle = () => setOpen((prev) => !prev);
  const closeMenu = () => setOpen(false);

  const renderNavLink = (item: NavItem, key: string, variant: "desktop" | "mobile") => {
    if ("external" in item && item.external) {
      return (
        <a
          key={key}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={variant === "mobile" ? closeMenu : undefined}
          className={cn(
            "text-sm uppercase tracking-[0.3em] transition hover:text-white",
            variant === "desktop" ? "text-white/60" : "text-white/70"
          )}
        >
          {item.label}
        </a>
      );
    }

    const internalHref = item.href as Route | UrlObject;
    const targetPath = typeof internalHref === "string" ? internalHref : internalHref.pathname ?? "/";
    const isAnchor = typeof internalHref !== "string" && Boolean(internalHref.hash);
    const isActive = isAnchor ? pathname === "/" : pathname.startsWith(targetPath === "/" ? "/" : targetPath);

    return (
      <Link
        key={key}
        href={internalHref}
        onClick={variant === "mobile" ? closeMenu : undefined}
        className={cn(
          "text-sm uppercase tracking-[0.3em] transition hover:text-white",
          variant === "desktop" ? "text-white/60" : "text-white/70",
          isActive && variant === "desktop" && "text-white"
        )}
      >
        {item.label}
      </Link>
    );
  };

  const renderNavList = (variant: "desktop" | "mobile") => (
    <>
      {navItems.map((item) => {
        const key =
          typeof item.href === "string"
            ? item.href
            : `${item.href.pathname ?? ""}${item.href.hash ?? ""}`;
        return renderNavLink(item, key, variant);
      })}
    </>
  );

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    closeMenu();
  };

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 bg-midnight/80 backdrop-blur-md transition-opacity duration-300">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
          <div className="h-12 w-12">
            <Image
              src="/images/logo.png"
              alt="Логотип Blockera"
              width={48}
              height={48}
              priority
              className="rounded-xl object-contain"
            />
          </div>
          <div>
            <p className="text-lg font-semibold uppercase tracking-[0.3em] text-white/80">Blockera</p>
            <p className="text-xs uppercase tracking-[0.45em] text-white/40">minecraft</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">{renderNavList("desktop")}</nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="https://t.me/Block_Era"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex items-center gap-2")}
          >
            <SendIcon className="h-4 w-4" />
            Telegram
          </a>
          <a
            href="https://discord.gg/c5xAPdHhZW"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "sm" }), "flex items-center gap-2 bg-gradient-to-r from-primary to-purple-500")}
          >
            <MessageCircleIcon className="h-4 w-4" />
            Discord
          </a>
          {isAdmin ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Выйти
            </Button>
          ) : null}
        </div>

        <button
          className="inline-flex items-center justify-center rounded-full border border-white/15 p-2 text-white/80 transition hover:text-white md:hidden"
          onClick={handleToggle}
          aria-label="Открыть меню"
        >
          {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "md:hidden absolute inset-x-0 top-full transition-opacity duration-200",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none invisible opacity-0"
        )}
      >
        <div className="mx-auto max-w-6xl space-y-6 border-t border-white/10 bg-midnight/95 px-6 pb-10 pt-6 shadow-xl">
          <nav className="flex flex-col gap-4">{renderNavList("mobile")}</nav>
          <div className="flex flex-col gap-3">
            <a
              href="https://t.me/Block_Era"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline" }), "flex items-center gap-2")}
              onClick={closeMenu}
            >
              <SendIcon className="h-4 w-4" /> Telegram
            </a>
            <a
              href="https://discord.gg/c5xAPdHhZW"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants(), "flex items-center gap-2 bg-gradient-to-r from-primary to-purple-500")}
              onClick={closeMenu}
            >
              <MessageCircleIcon className="h-4 w-4" /> Discord
            </a>
            {isAdmin ? (
              <Button variant="outline" onClick={handleSignOut}>
                Выйти
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
