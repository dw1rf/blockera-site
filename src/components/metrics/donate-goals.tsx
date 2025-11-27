type DonateGoalsProps = {
  status?: string | null;
};

/**
 * Простейший блок с сообщением об оплате и общим призывом.
 * Оригинальный компонент отсутствовал в репозитории, поэтому добавлен минимальный заглушечный вариант,
 * чтобы страница доната собиралась и могла показывать результат платежа.
 */
export function DonateGoals({ status }: DonateGoalsProps) {
  const isSuccess = status === "success";
  const isFailure = status === "failed" || status === "error";

  return (
    <section className="mx-auto mt-10 max-w-6xl px-6 pb-16">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-white shadow-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Поддержка сервера</p>
            <h2 className="text-2xl font-semibold uppercase tracking-[0.2em] text-white md:text-3xl">
              Спасибо за донат!
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Ваши покупки помогают оплачивать хостинг, развивать ивенты и добавлять новые привилегии.
            </p>
            {isSuccess ? (
              <p className="mt-2 text-sm text-emerald-300">Оплата успешно завершена.</p>
            ) : null}
            {isFailure ? (
              <p className="mt-2 text-sm text-red-300">Оплата не завершена. Попробуйте ещё раз или свяжитесь с поддержкой.</p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/10 px-5 py-3 text-sm text-white">
            Присоединяйтесь к нашему Discord: <span className="font-semibold">discord.gg/c5xAPdHhZW</span>
          </div>
        </div>
      </div>
    </section>
  );
}
