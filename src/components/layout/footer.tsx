import Link from "next/link";
import { MailIcon, SendIcon, MessageCircleIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-midnight-light/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">Blockera</p>
          <p className="text-sm text-white/60">
            Добро пожаловать на Blockera — погрузись в атмосферный майнкрафт-сервер с кастомными режимами и
            уникальной экономикой.
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Навигация</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-white/60">
            <Link href="/" className="hover:text-white">Главная</Link>
            <Link href="/donate" className="hover:text-white">Донат</Link>
            <Link href="#how-to-start" className="hover:text-white">Как начать</Link>
            <Link href="#faq" className="hover:text-white">FAQ</Link>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Контакты</p>
          <div className="space-y-2 text-sm text-white/60">
            <p className="flex items-center gap-2"><MailIcon className="h-4 w-4" /> support@blockera.ru</p>
            <p className="flex items-center gap-2"><SendIcon className="h-4 w-4" /> Телеграм: @blockera</p>
            <p className="flex items-center gap-2"><MessageCircleIcon className="h-4 w-4" /> Discord: blockera.gg</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 bg-black/30 py-6">
        <p className="text-center text-xs uppercase tracking-[0.4em] text-white/30">
          © {new Date().getFullYear()} Blockera. Все права защищены.
        </p>
      </div>
    </footer>
  );
}
