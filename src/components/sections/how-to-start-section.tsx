const steps = [
  {
    number: "01",
    title: "Установите Minecraft 1.20.4",
    description:
      "Используйте официальный лаунчер, Modrinth или TLauncher, выберите версию от 1.20.4 и убедитесь, что игра запускается."
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
    <section id="how-to-start" className="relative mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
        <span className="text-xs uppercase tracking-[0.4em] text-primary">Как начать</span>
        <h2 className="text-balance text-3xl font-semibold uppercase tracking-[0.2em] text-white md:text-4xl">
          Первые шаги на сервере
        </h2>
        <p className="text-base text-white/70">
          Всё просто: скачайте игру, добавьте наш адрес и зайдите. Ниже — краткая инструкция для новых игроков.
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
