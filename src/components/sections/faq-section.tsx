const faqs = [
  {
    question: "Какие способы оплаты доступны?",
    answer:
      "Используем платёжный сервис EasyDonate: банковские карты, кошельки и мобильная связь. Платёж проходит за несколько минут."
  },
  {
    question: "Можно ли играть без доната?",
    answer:
      "Конечно. Донат ускоряет прогресс, но все возможности доступны и без него. Мы против Pay‑to‑Win и следим за балансом."
  },
  {
    question: "Где получить поддержку?",
    answer:
      "Пишите в Discord в канал #support или на почту support@blockera.ru. Отвечаем в течение 24 часов."
  },
  {
    question: "Какую версию Minecraft поддерживаем?",
    answer:
      "Рекомендуемая версия от: 1.20.4, лицензия/пиратская версия"
  }
];

export function FaqSection() {
  return (
    <section id="faq" className="relative mx-auto max-w-6xl px-6 pb-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
        <span className="text-xs uppercase tracking-[0.4em] text-primary">FAQ</span>
        <h2 className="text-balance text-3xl font-semibold uppercase tracking-[0.2em] text-white md:text-4xl">
          Частые вопросы
        </h2>
        <p className="text-base text-white/70">
          Если не нашли ответ, напишите нам. Мы постоянно обновляем раздел FAQ и стараемся быть полезными.
        </p>
      </div>

      <div className="mt-16 space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-card backdrop-blur"
          >
            <summary className="cursor-pointer text-left text-lg font-semibold text-white outline-none transition group-open:text-primary">
              {faq.question}
            </summary>
            <p className="mt-3 text-sm text-white/70">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
