import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности | Blockera",
  description:
    "Как Blockera сборает, хранит и защищает данные игроков и покупателей."
};

const TEXT = {
  badge: "Юридические документы",
  heading: "Политика конфиденциальности",
  intro:
    "Мы заботимся о прозрачности. Ниже описано, какие данные мы собираем, почему они нужны и как вы можете управлять согласием.",
  sections: [
    {
      title: "Какую информацию мы собираем",
      items: [
        "Никнейм, UUID и логи игры для модерации.",
        "Контакты, указанные при обращении в поддержку.",
        "Данные о транзакциях (ID заказа, платёжный оператор, время)."
      ]
    },
    {
      title: "Зачем необходимы эти данные",
      body:
        "Данные нужны для выдачи покупок, борьбы с мошенничеством и поддержённого сервиса. Агрегированная аналитика помогает планировать ивенты без использования профилей для рекламы."
    },
    {
      title: "Сроки хранения",
      body:
        "Записи о покупках хранятся до 24 месяцев, а тикеты поддержки — до 12 месяцев. Мы можем устранить данные раньше, если нет юридических обязанностей или споров."
    },
    {
      title: "Передача данных",
      body:
        "Мы не продаём личные данные. Передача сведений возможна только платёжным партнёрам, античиту или органам власти по закону."
    },
    {
      title: "Ваши права",
      body:
        "Вы можете запросить копию данных, их исправление или удаление, написав на blockera.play@inbox.ru. Мы отвечаем в течение 7 дней."
    }
  ],
  footer:
    "Документ действует с 6 ноября 2025 года. Мы объявим об обновлениях на сайте и в Discord."
};

type Section = (typeof TEXT.sections)[number];

function hasItems(section: Section): section is Section & { items: string[] } {
  return Array.isArray((section as { items?: unknown }).items);
}

function hasBody(section: Section): section is Section & { body: string } {
  return typeof (section as { body?: unknown }).body === "string";
}

export default function PrivacyPolicyPage() {
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
        {TEXT.sections.map((section) => (
          <section key={section.title} className="space-y-4">
            <h2 className="text-xl font-semibold text-white">{section.title}</h2>
            {hasItems(section) ? (
              <ul className="list-disc space-y-2 pl-6">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : hasBody(section) ? (
              <p>{section.body}</p>
            ) : null}
          </section>
        ))}

        <section className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm text-white/60">
          <p>{TEXT.footer}</p>
        </section>
      </div>
    </div>
  );
}
