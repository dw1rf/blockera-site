const faqs = [
  {
    question: 'Как быстро приходит привилегия после покупки?',
    answer:
      'Сразу после подтверждения оплаты система отправляет команду на сервер по RCON, и привилегия появится в течение 10–20 секунд.'
  },
  {
    question: 'Можно ли оплатить без комиссий и скрытых платежей?',
    answer:
      'Да, мы поддерживаем проверенные платёжные сервисы. Выбирайте тот, который удобен именно вам: банковские карты, электронные кошельки или мобильные платежи.'
  },
  {
    question: 'Где получить помощь, если привилегия не пришла?',
    answer:
      'Напишите в наш Discord-сервер в канал #support или создайте обращение на сайте. Команда поддержки поможет в течение 24 часов.'
  },
  {
    question: 'Какой версии Minecraft соответствует сервер?',
    answer:
      'Основная версия сервера — 1.20.1, но поддерживается и совместимость с клиентами 1.19. Убедитесь, что игра запускается через официальный лаунчер Mojang.'
  }
];

export function FaqSection() {
  return (
    <section id="faq" className="relative mx-auto max-w-6xl px-6 pb-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
        <span className="text-xs uppercase tracking-[0.4em] text-primary">faq</span>
        <h2 className="text-balance text-3xl font-semibold uppercase tracking-[0.2em] text-white md:text-4xl">
          Частые вопросы и ответы
        </h2>
        <p className="text-base text-white/70">
          Если не нашли нужный ответ, напишите нам в Discord или на почту support@blockera.ru.
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
