import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика возврата | Blockera",
  description:
    "Пояснение условий возврата средств за покупки на сайте Blockera."
};

const TEXT = {
  badge: "Юридические документы",
  heading: "Политика возврата",
  intro:
    "Страница описывает порядок рассмотрения заявок на возврат средств за цифровые товары Blockera. Правила применимы ко всем привилегиям, бустерам, кейсам и косметике.",
  eligibilityTitle: "Сроки подачи заявки",
  eligibilityBody:
    "Заявка должна быть подана не позднее 14 календарных дней с момента покупки. Обратиться может только владелец платежа.",
  deniedTitle: "Возврат не оформляется, если",
  deniedList: [
    "Услуга уже получена и использована (например, открыт кейс или активирован бустер).",
    "Аккаунт был заблокирован за нарушение правил или умышленного вреда.",
    "Была открыта чарджбэк-претензия без предварительного обращения в Blockera."
  ],
  stepsTitle: "Как подать заявку",
  stepsList: [
    "Соберите чек или ID заказа, а также никнейм, указанный при оплате.",
    "Напишите на blockera.play@inbox.ru или откройте обращение через telegram бота @BlockEra_BOT.",
    "Дождитесь ответа команды (до 7 рабочих дней)."
  ],
  stepsBody:
    "При положительном решении средства возвращаются на исходный метод оплаты (срок зависит от платёжной системы).",
  disputesTitle: "Разрешение споров",
  disputesBody:
    "Мы предпочитаем решать вопросы напрямую. При чарджбэке без обращения в службу поддержки мы временно ограничим доступ к аккаунту до завершения расследования.",
  footer:
    "Политика действует с 6 ноября 2025 года. Об изменениях мы сообщаем на сайте и в Discord."
};

export default function RefundPolicyPage() {
  return (
    <div className="relative mx-auto max-w-4xl px-6 py-24">
      <div className="space-y-6">
        <span className="text-xs uppercase tracking-[0.4em] text-primary">
          {TEXT.badge}
        </span>
        <h1 className="text-3xl font-semibold uppercase tracking-[0.2em] text-white md:text-4xl">
          {TEXT.heading}
        </h1>
        <p className="text-base text-white/70">{TEXT.intro}</p>
      </div>

      <div className="mt-12 space-y-10 text-white/70">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            {TEXT.eligibilityTitle}
          </h2>
          <p>{TEXT.eligibilityBody}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            {TEXT.deniedTitle}
          </h2>
          <ul className="list-disc space-y-2 pl-6">
            {TEXT.deniedList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            {TEXT.stepsTitle}
          </h2>
          <ol className="list-decimal space-y-2 pl-6">
            {TEXT.stepsList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <p>{TEXT.stepsBody}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            {TEXT.disputesTitle}
          </h2>
          <p>{TEXT.disputesBody}</p>
        </section>

        <section className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm text-white/60">
          <p>{TEXT.footer}</p>
        </section>
      </div>
    </div>
  );
}
