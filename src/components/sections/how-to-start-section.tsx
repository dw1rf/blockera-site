const steps = [
  {
    number: "01",
    title: "Установи Minecraft 1.20",
    description: "Выбери лицензионный лаунчер или TLauncher, обновись до версии 1.20 и подготовь аккаунт."
  },
  {
    number: "02",
    title: "Добавь сервер",
    description: "Открой список серверов и добавь адрес play.blockera.ru. Убедись, что пинг стабильный."
  },
  {
    number: "03",
    title: "Начни приключение",
    description: "Зайди в игру, выполни стартовый квест и получи набор новичка в центре спавна."
  }
];

export function HowToStartSection() {
  return (
    <section id="how-to-start" className="relative mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
        <span className="text-xs uppercase tracking-[0.4em] text-primary">как начать</span>
        <h2 className="text-balance text-3xl font-semibold uppercase tracking-[0.2em] text-white md:text-4xl">
          Присоединиться просто
        </h2>
        <p className="text-base text-white/70">
          Выполни три шага — и ты уже на сервере вместе с друзьями. Всё прозрачно и работает без задержек.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.number}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-8 shadow-card backdrop-blur"
          >
            <span className="text-5xl font-semibold tracking-[0.1em] text-white/10">{step.number}</span>
            <h3 className="mt-6 text-xl font-semibold text-white">{step.title}</h3>
            <p className="mt-3 text-sm text-white/70">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
