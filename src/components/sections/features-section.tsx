import { FlameIcon, ShieldIcon, UsersIcon } from "lucide-react";

const features = [
  {
    icon: <FlameIcon className="h-6 w-6" />,
    title: "Ивенты каждую неделю",
    description: "PvP турниры, паркур-челленджи и рейды на боссов с ценными наградами для всей команды.",
    highlight: "Собирай партию и участвуй в рейдах"
  },
  {
    icon: <ShieldIcon className="h-6 w-6" />,
    title: "Честный античит",
    description: "Продвинутая защита сервера блокирует читеров, а команда модераторов следит за порядком 24/7.",
    highlight: "Играй без волнений и лагов"
  },
  {
    icon: <UsersIcon className="h-6 w-6" />,
    title: "Сообщество единомышленников",
    description: "Создавай гильдии, обменивайся ресурсами и строй города вместе с другими игроками.",
    highlight: "Вступай в гильдии на Discord"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
        <span className="text-xs uppercase tracking-[0.4em] text-primary">возможности</span>
        <h2 className="text-balance text-3xl font-semibold uppercase tracking-[0.2em] text-white md:text-4xl">
          Контент, который не дает заскучать
        </h2>
        <p className="text-base text-white/70">
          Мы объединяем лучшие практики выживания, кастомных модификаций и соревновательного геймплея для
          долгосрочного прогресса.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-card backdrop-blur"
          >
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              {feature.icon}
            </div>
            <h3 className="mt-6 text-xl font-semibold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm text-white/70">{feature.description}</p>
            <p className="mt-6 text-sm font-medium text-primary">{feature.highlight}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
