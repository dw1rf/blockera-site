"use client";

import { Suspense, useState } from "react";
import type { Route } from "next";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const callbackUrl = (searchParams.get("callbackUrl") as Route | null) ?? ("/admin" as Route);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl
    });

    setLoading(false);

    if (response?.error) {
      setError("Неверный email или пароль");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-semibold uppercase tracking-[0.3em] text-white">
        Вход в админ-панель
      </h1>
      <p className="mt-3 text-sm text-white/60">
        Авторизуйтесь под учетной записью администратора, чтобы управлять магазином, статистикой и
        настройками сервера.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <label className="flex flex-col gap-2 text-sm text-white/80">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-base text-white outline-none transition focus:border-primary focus:bg-white/[0.12]"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-white/80">
          Пароль
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-base text-white outline-none transition focus:border-primary focus:bg-white/[0.12]"
          />
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-500" disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </Button>
      </form>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-6 text-white/60">Загрузка...</div>}>
      <SignInForm />
    </Suspense>
  );
}
