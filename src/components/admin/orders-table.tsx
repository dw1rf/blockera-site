"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { OrderSummary } from "@/types/orders";

interface Order {
  id: string;
  nickname: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  createdAt: string;
  promoCodeInput?: string | null;
  product: {
    name: string;
    price: number;
  };
  user: {
    email: string;
  };
}

export type OrdersTableOrder = Order;

interface Props {
  initialOrders: OrdersTableOrder[];
  initialSummary: OrderSummary;
}

export function OrdersTable({ initialOrders, initialSummary }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [summary, setSummary] = useState(initialSummary);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [exporting, setExporting] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 400);

  const handleStatusChange = async (id: string, status: Order["status"]) => {
    setError(null);
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.message ?? "Не удалось обновить заказ");
      return;
    }

    const updated = (await response.json()) as Order;
    setOrders((prev) => prev.map((order) => (order.id === updated.id ? { ...order, status: updated.status } : order)));
    // Refresh summary so цифры сходятся без перезагрузки
    void refresh();
  };

  const refresh = async () => {
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") {
      params.set("status", statusFilter);
    }
    if (debouncedSearch) {
      params.set("query", debouncedSearch);
    }
    const queryString = params.toString();
    const response = await fetch(`/api/admin/orders${queryString ? `?${queryString}` : ""}`);
    if (!response.ok) {
      setError("Не удалось получить список заказов");
      return;
    }
    const data = (await response.json()) as { orders: Order[]; summary: OrderSummary };
    setOrders(data.orders);
    setSummary(data.summary);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }
      if (debouncedSearch) {
        params.set("query", debouncedSearch);
      }
      const queryString = params.toString();
      const response = await fetch(`/api/admin/orders/export${queryString ? `?${queryString}` : ""}`);
      if (!response.ok) {
        throw new Error("export_failed");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orders-${Date.now()}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Не удалось сформировать файл");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, debouncedSearch]);

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-card backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold uppercase tracking-[0.2em] text-white">Заказы</h2>
          <p className="mt-2 text-sm text-white/60">
            Контролируйте оплату и выполнение заказов. Статусы помогают команде поддержки отслеживать прогресс.
          </p>
        </div>
        <Button variant="outline" onClick={refresh}>
          Обновить
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Всего заказов" value={summary.total.toString()} />
        <SummaryCard label="Выполнено" value={summary.statuses.COMPLETED.toString()} tone="success" />
        <SummaryCard label="В ожидании" value={summary.statuses.PENDING.toString()} tone="warning" />
        <SummaryCard
          label="Выручка"
          value={`${summary.revenue.toLocaleString("ru-RU")} ₽`}
          tone="primary"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-[200px,1fr]">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as Order["status"] | "ALL")}
          className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white outline-none focus:border-primary"
        >
          <option value="ALL">Все статусы</option>
          <option value="PENDING">В ожидании</option>
          <option value="COMPLETED">Выполнен</option>
          <option value="FAILED">Ошибка</option>
          <option value="CANCELLED">Отменён</option>
        </select>
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Поиск по нику, почте или товару"
          className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white outline-none focus:border-primary"
        />
      </div>
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
          {exporting ? "Формирование..." : "Экспорт CSV"}
        </Button>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 md:flex-row md:items-center"
          >
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-white/40">#{order.id.slice(0, 8)}</p>
                  <p className="text-white/80">
                    <span className="font-semibold text-white">{order.product.name}</span> — {order.product.price} ₽
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
              </div>
              <p className="text-sm text-white/60">Ник игрока: {order.nickname}</p>
              <p className="text-sm text-white/60">Email: {order.user.email}</p>
              {order.promoCodeInput ? (
                <p className="text-sm text-white/60">Промокод: {order.promoCodeInput}</p>
              ) : null}
              <p className="text-xs text-white/40">
                Создан: {new Date(order.createdAt).toLocaleString("ru-RU")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={order.status}
                onChange={(event) => handleStatusChange(order.id, event.target.value as Order["status"])}
                className="rounded-full border border-white/10 bg-midnight-light px-4 py-2 text-sm text-white/80 outline-none focus:border-primary"
              >
                <option value="PENDING">В ожидании</option>
                <option value="COMPLETED">Выполнен</option>
                <option value="FAILED">Ошибка</option>
                <option value="CANCELLED">Отменён</option>
              </select>
            </div>
          </div>
        ))}
        {orders.length === 0 ? <p className="text-sm text-white/40">Пока нет заказов.</p> : null}
      </div>
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

function SummaryCard({
  label,
  value,
  tone = "default"
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "primary";
}) {
  const toneMap: Record<string, string> = {
    default: "border-white/10 bg-white/[0.02]",
    success: "border-green-400/30 bg-green-400/5",
    warning: "border-yellow-400/30 bg-yellow-400/5",
    primary: "border-primary/30 bg-primary/5"
  };

  return (
    <div className={`rounded-2xl border p-4 text-white/70 ${toneMap[tone] ?? toneMap.default}`}>
      <p className="text-xs uppercase tracking-[0.35em] text-white/40">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

const statusLabels: Record<Order["status"], string> = {
  PENDING: "В ожидании",
  COMPLETED: "Выполнен",
  FAILED: "Ошибка",
  CANCELLED: "Отменён"
};

const statusStyles: Record<Order["status"], string> = {
  PENDING: "border-yellow-400/40 bg-yellow-400/10 text-yellow-200",
  COMPLETED: "border-green-400/40 bg-green-400/10 text-green-200",
  FAILED: "border-red-500/50 bg-red-500/10 text-red-200",
  CANCELLED: "border-orange-400/40 bg-orange-400/10 text-orange-200"
};

