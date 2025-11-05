const faqs = [
  {
    question: "Как быстро выдается привилегия после доната?",
    answer: "Сразу после подтверждения оплаты через EasyDonate бот отправляет команду на сервер по RCON. Привилегия появится в течение 10-20 секунд."
  },
  {
    question: "Можно ли играть без доната?",
    answer: "Да, все основные механики доступны бесплатно. Донат ускоряет прогресс и дает косметические плюшки, но не ломает баланс."
  },
  {
    question: "Что делать, если я столкнулся с багом?",
    answer: "Сообщи в Discord-канал #support или напиши модератору. Мы фиксируем критические ошибки в течение 24 часов."
  },
  {
    question: "Какая версия Minecraft поддерживается?",
    answer: "Сервер работает на 1.20.1 с обратной совместимостью 1.19. Обновления выходят вместе с крупными патчами Mojang."
  }
];

export function FaqSection() {
  return (
    <section id="faq" className="relative mx-auto max-w-6xl px-6 pb-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
        <span className="text-xs uppercase tracking-[0.4em] text-primary">faq</span>
        <h2 className="text-balance text-3xl font-semibold uppercase tracking-[0.2em] text-white md:text-4xl">
          Ответы на популярные вопросы
        </h2>
        <p className="text-base text-white/70">
          Если не нашел ответ — загляни в Discord или напиши нам на почту support@blockera.ru
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
