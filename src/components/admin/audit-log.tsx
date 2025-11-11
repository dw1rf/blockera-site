"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  user?: {
    email: string | null;
    id: string;
  } | null;
}

interface Props {
  initialLogs: AuditLog[];
}

export function AuditLogList({ initialLogs }: Props) {
  const [logs, setLogs] = useState(initialLogs);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const debouncedAction = useDebounce(actionFilter, 400);
  const debouncedEntity = useDebounce(entityFilter, 400);
  const debouncedSearch = useDebounce(searchTerm, 400);

  const loadLogs = useCallback(async () => {
    const params = new URLSearchParams();
    if (debouncedAction) params.set("action", debouncedAction);
    if (debouncedEntity) params.set("entity", debouncedEntity);
    if (debouncedSearch) params.set("query", debouncedSearch);

    const queryString = params.toString();
    const response = await fetch(`/api/admin/audit${queryString ? `?${queryString}` : ""}`);
    if (!response.ok) {
      setError("Не удалось загрузить журнал");
      return;
    }
    const data = (await response.json()) as AuditLog[];
    setLogs(data);
    setError(null);
  }, [debouncedAction, debouncedEntity, debouncedSearch]);

  useEffect(() => {
    void loadLogs();
    const interval = setInterval(() => {
      void loadLogs();
    }, 30_000);

    return () => clearInterval(interval);
  }, [loadLogs]);

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить событие из журнала?")) {
      return;
    }
    const response = await fetch(`/api/admin/audit/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Не удалось удалить событие");
      return;
    }
    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const resetFilters = () => {
    setActionFilter("");
    setEntityFilter("");
    setSearchTerm("");
  };

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-card backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold uppercase tracking-[0.2em] text-white">Журнал действий</h2>
          <p className="text-sm text-white/40">Показываются последние 30 событий</p>
        </div>
        <Button variant="outline" onClick={loadLogs}>
          Обновить
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={actionFilter}
          onChange={(event) => setActionFilter(event.target.value)}
          placeholder="Фильтр по действию"
          className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white outline-none focus:border-primary"
        />
        <input
          value={entityFilter}
          onChange={(event) => setEntityFilter(event.target.value)}
          placeholder="Фильтр по сущности"
          className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white outline-none focus:border-primary"
        />
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Поиск по ID или email"
          className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white outline-none focus:border-primary"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={resetFilters}>
          Сбросить
        </Button>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <ul className="space-y-3 text-sm text-white/60">
        {logs.map((log) => (
          <li key={log.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-white/80">{log.action}</span>
              <span className="text-xs text-white/40">
                {new Date(log.createdAt).toLocaleString("ru-RU")}
              </span>
            </div>
            <p className="mt-2 text-white/70">
              {log.entity} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ""}
            </p>
            <p className="text-xs text-white/50">Пользователь: {log.user?.email ?? "система"}</p>
            {log.metadata ? (
              <pre className="mt-2 rounded-xl bg-black/40 p-3 text-xs text-white/60">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            ) : null}
            <div className="mt-3 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="border-red-500/40 text-red-300 hover:bg-red-500/10"
                onClick={() => handleDelete(log.id)}
              >
                Удалить
              </Button>
            </div>
          </li>
        ))}
        {logs.length === 0 ? <li className="text-white/40">События пока отсутствуют.</li> : null}
      </ul>
    </div>
  );
}

function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
