const steps = [
  {
    number: "01",
    title: "Обнови Minecraft до 1.20",
    description:
      "Скачай официальный лаунчер или TLauncher, выбери актуальную версию 1.20 и убедись, что установлены все необходимые файлы."
  },
  {
    number: "02",
    title: "Добавь сервер в список",
    description:
      "Открой раздел многопользовательской игры и укажи адрес blockera.goida.host. Проверь стабильность пинга и сохрани сервер в избранное."
  },
  {
    number: "03",
    title: "Войди и начинай приключение",
    description:
      "Запускайся, знакомься с хабом и следуй подсказкам модераторов. Активируй стартовый набор и присоединяйся к ивентам."
  }
];

export function HowToStartSection() {
  return (
    <section id="how-to-start" className="relative mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
        <span className="text-xs uppercase tracking-[0.4em] text-primary">
          Как начать играть
        </span>
        <h2 className="text-balance text-3xl font-semibold uppercase tracking-[0.2em] text-white md:text-4xl">
          Подключайся за пару шагов
        </h2>
        <p className="text-base text-white/70">
          Собрали короткий чек-лист, чтобы ты не потерялся в настройках. Возьми актуальную версию клиента, добавь наш сервер и залетай в блокерское приключение.
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
