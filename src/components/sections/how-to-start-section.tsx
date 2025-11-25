const steps = [
  {
    number: "01",
    title: "Установите Minecraft 1.20.4",
    description:
      "Используйте официальный лаунчер, Astralrinth или Modrinth, выберите версию от 1.20.4 и убедитесь, что игра запускается."
  },
  {
    number: "02",
    title: "Подключитесь к серверу",
    description:
      "Добавьте адрес blockera.goida.host в список серверов и подключайтесь. Белый список не требуется."
  },
  {
    number: "03",
    title: "Получите бонусы",
    description:
      "Играйте, участвуйте в ивентах и поддерживайте сервер донатом — так вы открываете новые возможности."
  }
];

export function HowToStartSection() {
  return (
    <section id="how-to-start" className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
        <span className="text-xs uppercase tracking-[0.4em] text-primary">Как начать</span>
        <h2 className="text-balance text-3xl font-semibold uppercase tracking-[0.2em] text-white md:text-4xl">
          Первые шаги на сервере
        </h2>
        <p className="text-base text-white/70">
          Всё просто: скачайте игру, добавьте наш адрес и зайдите. Ниже — краткая инструкция для новых игроков.
        </p>
      </div>

      <div className="mt-12 md:mt-16">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 [-mx-4] px-4 sm:gap-6 sm:px-6 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0 md:pb-0">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative flex min-w-[80%] snap-center flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-6 shadow-card backdrop-blur sm:min-w-[60%] md:min-w-0 md:p-8"
            >
              <span className="text-4xl font-semibold tracking-[0.1em] text-white/10 sm:text-5xl">{step.number}</span>
              <h3 className="mt-6 text-lg font-semibold text-white sm:text-xl">{step.title}</h3>
              <p className="mt-3 text-sm text-white/70">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
