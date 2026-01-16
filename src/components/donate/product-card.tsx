"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { InfoIcon, ShoppingCartIcon, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import type { Product } from "@/lib/donate";
import { formatCurrency } from "@/lib/price";

const numberFormatter = new Intl.NumberFormat("ru-RU");

const PRODUCT_BACKGROUND_BY_ID: Record<string, string> = {
  creative: "/images/creative.png",
  moderator: "/images/moderator.png",
  admin: "/images/admin.png",
  drako: "/images/drako.png",
  soul: "/images/drako.png",
  platinum: "/images/platinum.png",
  ethereal: "/images/ethereal.png",
  immortal: "/images/immortal.png",
  shine: "/images/shine.png",
  babyera: "/images/babyera.png",
  legend: "/images/babyera.png"
};

const getProductBackgroundSrc = (id: string) => PRODUCT_BACKGROUND_BY_ID[id] ?? `/images/${id}.png`;

interface ProductCardProps {
  product: Product;
}

type LegalLink = { href: Route; label: string };

const TEXT = {
  buy: "Купить",
  closeDialog: "Закрыть окно",
  price: "Стоимость",
  description: "Описание",
  commands: "Команды",
  regionLimit: "Ограничение привата",
  legalInfo:
    "Перед оформлением заказа ознакомьтесь с документами ниже и подтвердите галочками.",
  successPrefix: "Игрок ",
  successSuffix:
    " добавлен в очередь на выдачу",
  nicknameLabel: "Никнейм игрока",
  nicknamePlaceholder: "Введите ник",
  cancel: "Отмена",
  continue: "Продолжить",
  closeButton: "Закрыть",

  payableLabel: "К оплате",

  discountLabel: "Скидка за уже купленные функции"
};

const AGREEMENTS = [
  {
    key: "terms",
    label:
      "Я прочитал и согласен с Пользовательским соглашением",
    href: "/legal/terms-of-service"
  },
  {
    key: "refund",
    label: "Я ознакомлен с Политикой возврата",
    href: "/legal/refund-policy"
  },
  {
    key: "privacy",
    label: "Я принимаю Политику конфиденциальности",
    href: "/legal/privacy-policy"
  }
] as const;

export function ProductCard({ product }: ProductCardProps) {
  const [backgroundFailed, setBackgroundFailed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [payableAmount, setPayableAmount] = useState<number | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [agreements, setAgreements] = useState<Record<(typeof AGREEMENTS)[number]["key"], boolean>>({
    terms: false,
    refund: false,
    privacy: false
  });

  const legalLinks = useMemo<LegalLink[]>(
    () => [
      { href: "/legal/refund-policy", label: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430" },
      {
        href: "/legal/terms-of-service",
        label: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u043E\u0435 \u0441\u043E\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435"
      },
      {
        href: "/legal/privacy-policy",
        label: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438"
      }
    ],
    []
  );

  const commandItems = useMemo(() => {
    if (!product.commands) {
      return [];
    }
    return product.commands
      .split(/\r?\n/)
      .map((item) =>
        item
          .trim()
          .replace(/^[-вЂ“вЂў\s]+/, "")
          .replace(/^(РєРѕРјР°РЅРґС‹?|commands?)\s*:\s*/i, "")
          .trim()
      )
      .filter(Boolean);
  }, [product.commands]);

  const formattedRegionLimit = useMemo(() => {
    if (typeof product.regionLimit !== "number") {
      return null;
    }
    return numberFormatter.format(product.regionLimit);
  }, [product.regionLimit]);

  const backgroundSrc = getProductBackgroundSrc(product.id);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNickname("");
    setEmail("");
    setIsSubmitted(false);
    setSubmitError(null);
    setSubmitLoading(false);
    setPayableAmount(null);
    setAppliedDiscount(null);
    setAgreements({ terms: false, refund: false, privacy: false });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nickname.trim() || !email.trim()) {
      setSubmitError("РЈРєР°Р¶РёС‚Рµ РЅРёРє РёРіСЂРѕРєР° Рё email РґР»СЏ СЃРІСЏР·Рё.");
      return;
    }
    if (!allAgreed) {
      setSubmitError("РџРѕРґС‚РІРµСЂРґРёС‚Рµ РѕР·РЅР°РєРѕРјР»РµРЅРёРµ СЃ РґРѕРєСѓРјРµРЅС‚Р°РјРё.");
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);
    setPayableAmount(null);
    setAppliedDiscount(null);

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        nickname: nickname.trim(),
        email: email.trim(),
        promoCode: promoCode.trim() || undefined
      })
    });

    setSubmitLoading(false);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setSubmitError(body.message ?? "РќРµ СѓРґР°Р»РѕСЃСЊ РѕС„РѕСЂРјРёС‚СЊ Р·Р°РєР°Р·.");
      return;
    }
    const body = (await response.json().catch(() => ({}))) as {
      paymentUrl?: string;
      payableAmount?: number;
      discount?: number;
    };
    setPayableAmount(typeof body?.payableAmount === "number" ? body.payableAmount : null);
    setAppliedDiscount(typeof body?.discount === "number" ? body.discount : null);
    if (body?.paymentUrl) {
      setPaymentUrl(body.paymentUrl);
      setIsSubmitted(true);
      try {
        window.location.href = body.paymentUrl;
      } catch {
        // ignore navigation errors
      }
    } else {
      setPaymentUrl(null);
      setIsSubmitted(true);
    }
  };

  const toggleAgreement = (key: (typeof AGREEMENTS)[number]["key"]) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allAgreed = useMemo(() => Object.values(agreements).every(Boolean), [agreements]);
  const canContinue = allAgreed && nickname.trim().length > 0 && email.trim().length > 0;

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const body = document.body;
    if (isModalOpen) {
      body.classList.add("donate-modal-open");
    } else {
      body.classList.remove("donate-modal-open");
    }
    return () => {
      body.classList.remove("donate-modal-open");
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-card backdrop-blur">
        {!backgroundFailed ? (
          <div className="pointer-events-none absolute inset-0 z-0">
            <Image
              src={backgroundSrc}
              alt=""
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover opacity-35 transition-transform duration-700 group-hover:scale-105"
              onError={() => setBackgroundFailed(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-midnight/10 via-midnight/70 to-midnight/95" />
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
        </div>
        {product.highlight ? (
          <span className="absolute right-6 top-6 z-20 inline-flex rounded-full border border-primary/40 bg-primary/20 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-primary">
            {product.highlight}
          </span>
        ) : null}

        <div className="relative z-20 flex flex-1 flex-col">
          <div className="flex items-start gap-3">
            <h3 className="text-2xl font-semibold text-white">{product.name}</h3>
            <p className="ml-auto text-lg font-semibold text-primary">{formatCurrency(product.price)}</p>
          </div>
          <div className="mt-4 flex flex-1 flex-col gap-4">
            <p className="text-sm text-white/70">{product.description}</p>
            {commandItems.length > 0 ? (
              <div className="min-h-[140px] max-h-[140px] space-y-2 overflow-y-auto rounded-2xl border border-white/5 bg-white/[0.02] p-4 pr-2 text-sm text-white/70">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">{TEXT.commands}</p>
                <ul className="space-y-1">
                  {commandItems.map((entry, index) => (
                    <li key={`${product.id}-card-command-${index}`} className="flex gap-2">
                      <span className="text-primary">-</span>
                      <span className="flex-1">{entry}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="min-h-[140px]" />
            )}
            {formattedRegionLimit ? (
              <p className="mt-auto text-xs uppercase tracking-[0.35em] text-white/50">
                {TEXT.regionLimit}: <span className="ml-2 text-white/80">{formattedRegionLimit} блоков</span>
              </p>
            ) : null}
          </div>
          <div className="pt-6">
            <Button
              className="w-full gap-2 bg-gradient-to-r from-primary to-purple-500"
              onClick={openModal}
              aria-haspopup="dialog"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              {TEXT.buy}
            </Button>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`product-${product.id}-title`}
            className="relative z-10 w-full max-w-5xl rounded-[32px] border border-white/10 bg-midnight/95 p-6 text-white shadow-neon sm:p-8 lg:p-10 max-h-[85vh] overflow-y-auto lg:max-h-none lg:overflow-visible"
          >
            <button
              type="button"
              aria-label={TEXT.closeDialog}
              onClick={closeModal}
              className="absolute right-4 top-4 text-white/60 transition hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <header className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-start">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">Вы выбрали</p>
                <h2 id={`product-${product.id}-title`} className="text-3xl font-semibold text-white">
                  {product.name}
                </h2>
              </div>
              <div className="ml-auto flex flex-col items-end text-right">
                <span className="text-xs uppercase tracking-[0.35em] text-white/40">{TEXT.price}</span>
                <p className="text-4xl font-semibold text-primary">{formatCurrency(product.price)}</p>
                {product.highlight ? (
                  <span className="mt-2 inline-flex rounded-full border border-primary/40 bg-primary/20 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-primary">
                    {product.highlight}
                  </span>
                ) : null}
              </div>
            </header>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <section className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/80">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/40">{TEXT.description}</p>
                  <p className="mt-3 leading-relaxed text-white/80">{product.description}</p>
                </div>
                {commandItems.length > 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/80">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/40">{TEXT.commands}</p>
                    <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      {commandItems.map((entry, index) => (
                        <li key={`${product.id}-modal-command-${index}`} className="flex gap-2">
                          <span className="text-primary">-</span>
                          <span className="flex-1">{entry}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {formattedRegionLimit ? (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/80">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/40">{TEXT.regionLimit}</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{formattedRegionLimit} блоков</p>
                  </div>
                ) : null}
              </section>

              <section className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-black/30 p-6 text-sm text-white/70">
                  <div className="flex items-start gap-3">
                    <InfoIcon className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-base text-white/80">{TEXT.legalInfo}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {legalLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={buttonVariants({ variant: "outline", size: "sm" })}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {AGREEMENTS.map((agreement) => (
                      <label key={agreement.key} className="flex cursor-pointer items-start gap-3 text-sm text-white/80">
                        <input
                          type="checkbox"
                          checked={agreements[agreement.key]}
                          onChange={() => toggleAgreement(agreement.key)}
                          className="mt-0.5 h-4 w-4 cursor-pointer rounded border-white/40 bg-white/10 text-primary focus:ring-primary"
                        />
                        <span>
                          {agreement.label}{" "}
                          <Link href={agreement.href} className="text-primary hover:underline" target="_blank">
                            Подробнее
                          </Link>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {isSubmitted ? (
                  <div className="space-y-4 rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-6 text-sm text-emerald-100">
                    <div>
                      {TEXT.successPrefix}
                      <span className="font-semibold text-white">{nickname}</span>
                      {TEXT.successSuffix}
                    </div>
                    {typeof payableAmount === "number" ? (
                      <p className="text-base text-white">
                        {TEXT.payableLabel}: <span className="font-semibold">{formatCurrency(payableAmount)}</span>
                      </p>
                    ) : null}
                    {typeof appliedDiscount === "number" && appliedDiscount > 0 ? (
                      <p className="text-sm text-white/80">
                        {TEXT.discountLabel}: {formatCurrency(appliedDiscount)}
                      </p>
                    ) : null}
                    {paymentUrl ? (
                      <a
                        href={paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full rounded-2xl border border-primary/40 bg-primary/20 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary/30"
                      >
                        Перейти к оплате
                      </a>
                    ) : null}
                    <Button className="w-full" onClick={closeModal}>
                      {TEXT.closeButton}
                    </Button>
                  </div>
                ) : (
                  <form className="space-y-5 rounded-3xl border border-white/10 bg-black/30 p-6" onSubmit={handleSubmit}>
                    <label className="flex flex-col gap-2 text-sm text-white/80">
                      Email для чека
                      <input
                        value={email}
                        type="email"
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="steve@gmail.com"
                        className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-base text-white outline-none transition focus:border-primary focus:bg-white/[0.12]"
                      />
                    </label>
                <label className="flex flex-col gap-2 text-sm text-white/80">
                  {TEXT.nicknameLabel}
                  <input
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    placeholder={TEXT.nicknamePlaceholder}
                    className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-base text-white outline-none transition focus:border-primary focus:bg-white/[0.12]"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-white/80">
                  Промокод (если есть)
                  <input
                    value={promoCode}
                    onChange={(event) => setPromoCode(event.target.value)}
                    placeholder="Введите промокод"
                    className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-base text-white outline-none transition focus:border-primary focus:bg-white/[0.12]"
                  />
                </label>
                    {submitError ? <p className="text-sm text-red-400">{submitError}</p> : null}
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/20 text-white/80"
                        onClick={closeModal}
                      >
                        {TEXT.cancel}
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-primary to-purple-500"
                        disabled={!canContinue || submitLoading}
                      >
                        {submitLoading ? "Отправка..." : TEXT.continue}
                      </Button>
                    </div>
                  </form>
                )}
              </section>
            </div>
          </div>
        </div>
      ) : null}

    </>
  );
}
