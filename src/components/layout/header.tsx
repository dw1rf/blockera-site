"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MenuIcon, XIcon, SendIcon, MessageCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Главная", href: "/" },
  { label: "Донат", href: "/donate" },
  { label: "Как начать", href: "/#how-to-start" },
  { label: "FAQ", href: "/#faq" }
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleToggle = () => setOpen((prev) => !prev);
  const closeMenu = () => setOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-midnight/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
          <div className="relative h-12 w-12">
            <Image
              src="/images/logo-earth.png"
              alt="Blockera Logo"
              fill
              priority
              className="rounded-xl object-contain"
            />
          </div>
          <div>
            <p className="text-lg font-semibold uppercase tracking-[0.3em] text-white/80">Blockera</p>
            <p className="text-xs uppercase tracking-[0.45em] text-white/40">minecraft</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isAnchor = item.href.startsWith("/#");
            const isActive = isAnchor
              ? pathname === "/"
              : item.href !== "/" && item.href !== "/#"
              ? pathname.startsWith(item.href)
              : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm uppercase tracking-[0.3em] text-white/60 transition hover:text-white",
                  isActive && "text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="outline" size="sm" className="gap-2">
            <SendIcon className="h-4 w-4" />
            Телеграм
          </Button>
          <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-purple-500">
            <MessageCircleIcon className="h-4 w-4" />
            Discord
          </Button>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-full border border-white/15 p-2 text-white/80 transition hover:text-white md:hidden"
          onClick={handleToggle}
          aria-label="Toggle Menu"
        >
          {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div className="space-y-6 border-t border-white/10 bg-midnight/95 px-6 pb-10 pt-6">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="text-sm uppercase tracking-[0.3em] text-white/70"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3">
            <Button variant="outline" className="gap-2">
              <SendIcon className="h-4 w-4" /> Телеграм
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-primary to-purple-500">
              <MessageCircleIcon className="h-4 w-4" /> Discord
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
