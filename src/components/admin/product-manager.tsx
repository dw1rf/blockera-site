"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

const CATEGORY_OPTIONS = [
  { value: "privilege", label: "Привилегия" },
  { value: "case", label: "Кейс" },
  { value: "booster", label: "Бустер" },
  { value: "cosmetic", label: "Косметика" }
] as const;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Активен" },
  { value: "HIDDEN", label: "Скрыт" },
  { value: "ARCHIVED", label: "Архив" }
] as const;

type CategoryValue = (typeof CATEGORY_OPTIONS)[number]["value"];
type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];

type FormState = {
  name: string;
  description: string;
  price: string;
  category: CategoryValue;
  highlight: string;
  commands: string;
  regionLimit: string;
  easyDonateProductId: string;
  easyDonateServerId: string;
};

type EditFormState = FormState & {
  status: StatusValue;
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: CategoryValue;
  status: StatusValue;
  highlight?: string | null;
  commands?: string | null;
  regionLimit?: number | null;
  easyDonateProductId?: string | null;
  easyDonateServerId?: number | null;
  createdAt: string;
}

export type ProductManagerProduct = Product;

interface Props {
  initialProducts: ProductManagerProduct[];
}

const createEmptyFormState = (): FormState => ({
  name: "",
  description: "",
  price: "",
  category: CATEGORY_OPTIONS[0]?.value ?? "privilege",
  highlight: "",
  commands: "",
  regionLimit: "",
  easyDonateProductId: "",
  easyDonateServerId: ""
});

const createEmptyEditState = (): EditFormState => ({
  ...createEmptyFormState(),
  status: STATUS_OPTIONS[0]?.value ?? "ACTIVE"
});

const formatRegionLimit = (value?: number | null) => {
  if (typeof value !== "number") {
    return "Без ограничений";
  }
  return `${value.toLocaleString("ru-RU")} блоков`;
};

const parseRegionLimit = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return Number.NaN;
  }
  return Math.round(numeric);
};

export function ProductManager({ initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState<FormState>(() => createEmptyFormState());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>(() => createEmptyEditState());
  const [loading, setLoading] = useState(false);
  const [editLoadingId, setEditLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => setForm(createEmptyFormState());
  const resetEditForm = () => setEditForm(createEmptyEditState());

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      setLoading(false);
      setError("Некорректная цена");
      return;
    }

    const parsedRegionLimit = parseRegionLimit(form.regionLimit);
    if (Number.isNaN(parsedRegionLimit)) {
      setLoading(false);
      setError("Некорректное ограничение привата");
      return;
    }

    const easyDonateProductId = form.easyDonateProductId.trim();
    const easyDonateServerIdRaw = form.easyDonateServerId.trim();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Math.round(price),
      category: form.category,
      highlight: form.highlight.trim() || null,
      commands: form.commands.trim() || null,
      regionLimit: parsedRegionLimit,
      easyDonateProductId: easyDonateProductId || null
    } as Record<string, unknown>;

    if (easyDonateServerIdRaw) {
      const easyDonateServerId = Number(easyDonateServerIdRaw);
      if (!Number.isFinite(easyDonateServerId) || easyDonateServerId <= 0) {
        setLoading(false);
        setError("Некорректный ID сервера EasyDonate");
        return;
      }
      payload.easyDonateServerId = Math.round(easyDonateServerId);
    }

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.message ?? "Не удалось создать товар");
      return;
    }

    const product = (await response.json()) as Product;
    setProducts((prev) => [product, ...prev]);
    resetForm();
  };

  const handleUpdate = async (id: string, updates: Record<string, unknown>) => {
    setError(null);
    const response = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.message ?? "Не удалось обновить товар");
      return null;
    }

    const updated = (await response.json()) as Product;
    setProducts((prev) => prev.map((product) => (product.id === updated.id ? updated : product)));
    return updated;
  };

  const handleDelete = async (id: string) => {
    setError(null);
    const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.message ?? "Не удалось удалить товар");
      return;
    }

    if (editingId === id) {
      setEditingId(null);
      resetEditForm();
    }

    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setError(null);
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      highlight: product.highlight ?? "",
      commands: product.commands ?? "",
      regionLimit: typeof product.regionLimit === "number" ? product.regionLimit.toString() : "",
      easyDonateProductId: product.easyDonateProductId ?? "",
      easyDonateServerId: typeof product.easyDonateServerId === "number" ? product.easyDonateServerId.toString() : "",
      status: product.status
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLoadingId(null);
    resetEditForm();
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;

    setEditLoadingId(editingId);
    setError(null);

    const price = Number(editForm.price);
    if (!Number.isFinite(price) || price < 0) {
      setEditLoadingId(null);
      setError("Некорректная цена");
      return;
    }

    const parsedRegionLimit = parseRegionLimit(editForm.regionLimit);
    if (Number.isNaN(parsedRegionLimit)) {
      setEditLoadingId(null);
      setError("Некорректное ограничение привата");
      return;
    }

    const easyDonateProductId = editForm.easyDonateProductId.trim();
    const easyDonateServerIdRaw = editForm.easyDonateServerId.trim();

    const payload = {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      price: Math.round(price),
      category: editForm.category,
      highlight: editForm.highlight.trim() || null,
      commands: editForm.commands.trim() || null,
      regionLimit: parsedRegionLimit,
      status: editForm.status,
      easyDonateProductId: easyDonateProductId || null
    } as Record<string, unknown>;

    if (easyDonateServerIdRaw) {
      const easyDonateServerId = Number(easyDonateServerIdRaw);
      if (!Number.isFinite(easyDonateServerId) || easyDonateServerId <= 0) {
        setEditLoadingId(null);
        setError("Некорректный ID сервера EasyDonate");
        return;
      }
      payload.easyDonateServerId = Math.round(easyDonateServerId);
    } else {
      payload.easyDonateServerId = null;
    }

    const updated = await handleUpdate(editingId, payload);
    setEditLoadingId(null);

    if (updated) {
      cancelEdit();
    }
  };

  return (
    <div className="space-y-10 rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-card backdrop-blur">
      <div>
        <h2 className="text-2xl font-semibold uppercase tracking-[0.2em] text-white">
          Управление товарами
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Добавляйте, редактируйте и скрывайте позиции донат-магазина. Изменения сохраняются в базе данных.
        </p>
      </div>

      <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
        <input
          required
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="Название"
          className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:bg-white/[0.12]"
        />
        <select
          value={form.category}
          onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as CategoryValue }))}
          className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:bg-white/[0.12]"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} className="bg-midnight text-white">
              {option.label}
            </option>
          ))}
        </select>
        <textarea
          required
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="Описание"
          className="md:col-span-2 h-24 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:bg-white/[0.12]"
        />
        <textarea
          value={form.commands}
          onChange={(event) => setForm((prev) => ({ ...prev, commands: event.target.value }))}
          placeholder="Команды (каждый пункт с новой строки)"
          className="md:col-span-2 h-24 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:bg-white/[0.12]"
        />
        <input
          required
          type="number"
          min={0}
          value={form.price}
          onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
          placeholder="Цена (в рублях)"
          className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:bg-white/[0.12]"
        />
        <input
          type="number"
          min={0}
          value={form.regionLimit}
          onChange={(event) => setForm((prev) => ({ ...prev, regionLimit: event.target.value }))}
          placeholder="Ограничение привата (в блоках)"
          className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:bg-white/[0.12]"
        />
        <input
          value={form.highlight}
          onChange={(event) => setForm((prev) => ({ ...prev, highlight: event.target.value }))}
          placeholder="Отметка/лейбл (необязательно)"
          className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:bg-white/[0.12]"
        />
        <input
          value={form.easyDonateProductId}
          onChange={(event) => setForm((prev) => ({ ...prev, easyDonateProductId: event.target.value }))}
          placeholder="ID товара в EasyDonate (обязательно для оплаты)"
          className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:bg-white/[0.12]"
        />
        <input
          type="number"
          min={0}
          value={form.easyDonateServerId}
          onChange={(event) => setForm((prev) => ({ ...prev, easyDonateServerId: event.target.value }))}
          placeholder="ID сервера EasyDonate (если отличается от общего)"
          className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition focus:border-primary focus:bg-white/[0.12]"
        />
        <div className="md:col-span-2 flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-primary to-purple-500 px-8"
          >
            {loading ? "Сохранение..." : "Добавить товар"}
          </Button>
        </div>
      </form>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-[0.2em] text-white/80 uppercase">Список товаров</h3>
        <div className="space-y-3">
          {products.map((product) => {
            const isEditing = editingId === product.id;
            return (
              <div key={product.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-white/40">#{product.id.slice(0, 8)}</p>
                    <p className="text-xl font-semibold text-white">{product.name}</p>
                    <p className="text-sm text-white/60 whitespace-pre-wrap">{product.description}</p>
                    {product.highlight ? (
                      <p className="text-xs uppercase tracking-[0.3em] text-primary">{product.highlight}</p>
                    ) : null}
                    {product.commands ? (
                      <div className="text-sm text-white/60">
                        <p className="text-white/50">Команды:</p>
                        <pre className="whitespace-pre-wrap text-white/70">{product.commands}</pre>
                      </div>
                    ) : null}
                    <p className="text-sm text-white/50">
                      Категория: <span className="text-white/80">{product.category}</span>
                    </p>
                    <p className="text-sm text-white/50">
                      Ограничение привата: <span className="text-white/80">{formatRegionLimit(product.regionLimit)}</span>
                    </p>
                <p className="text-sm text-primary">Цена: {product.price.toLocaleString("ru-RU")} ₽</p>
                <p className="text-xs text-white/40">
                  EasyDonate товар: {product.easyDonateProductId ?? "не привязан"}
                </p>
                <p className="text-xs text-white/40">
                  EasyDonate сервер: {product.easyDonateServerId ?? "по умолчанию"}
                </p>
              </div>
                  <div className="flex flex-col gap-3 md:w-64">
                    <select
                      className="rounded-full border border-white/10 bg-midnight-light px-4 py-2 text-sm text-white/80 outline-none focus:border-primary"
                      value={product.status}
                      onChange={(event) =>
                        handleUpdate(product.id, { status: event.target.value as StatusValue })
                      }
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-midnight text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Button
                        variant="outline"
                        className="border-white/20 text-white/80 hover:bg-white/10"
                        onClick={() => (isEditing ? cancelEdit() : startEdit(product))}
                      >
                        {isEditing ? "Закрыть" : "Редактировать"}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-500/40 text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDelete(product.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <form
                    className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                    onSubmit={handleEditSubmit}
                  >
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        required
                        value={editForm.name}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Название"
                        className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-2 text-sm text-white outline-none focus:border-primary"
                      />
                      <select
                        value={editForm.category}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, category: event.target.value as CategoryValue }))
                        }
                        className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-2 text-sm text-white outline-none focus:border-primary"
                      >
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value} className="bg-midnight text-white">
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <textarea
                        required
                        value={editForm.description}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                        placeholder="Описание"
                        className="md:col-span-2 min-h-[96px] rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-2 text-sm text-white outline-none focus:border-primary"
                      />
                      <textarea
                        value={editForm.commands}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, commands: event.target.value }))
                        }
                        placeholder="Команды"
                        className="md:col-span-2 min-h-[96px] rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-2 text-sm text-white outline-none focus:border-primary"
                      />
                      <input
                        required
                        type="number"
                        min={0}
                        value={editForm.price}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, price: event.target.value }))}
                        placeholder="Цена"
                        className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-2 text-sm text-white outline-none focus:border-primary"
                      />
                      <input
                        type="number"
                        min={0}
                        value={editForm.regionLimit}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, regionLimit: event.target.value }))}
                        placeholder="Ограничение привата"
                        className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-2 text-sm text-white outline-none focus:border-primary"
                      />
                      <input
                        value={editForm.highlight}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, highlight: event.target.value }))}
                        placeholder="Отметка"
                        className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-2 text-sm text-white outline-none focus:border-primary"
                      />
                      <input
                        value={editForm.easyDonateProductId}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, easyDonateProductId: event.target.value }))}
                        placeholder="ID товара в EasyDonate"
                        className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-2 text-sm text-white outline-none focus:border-primary"
                      />
                      <input
                        type="number"
                        min={0}
                        value={editForm.easyDonateServerId}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, easyDonateServerId: event.target.value }))}
                        placeholder="ID сервера EasyDonate"
                        className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-2 text-sm text-white outline-none focus:border-primary"
                      />
                      <select
                        value={editForm.status}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, status: event.target.value as StatusValue }))
                        }
                        className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-2 text-sm text-white outline-none focus:border-primary"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value} className="bg-midnight text-white">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/20 text-white/70"
                        onClick={cancelEdit}
                      >
                        Отменить
                      </Button>
                      <Button
                        type="submit"
                        disabled={editLoadingId === product.id}
                        className="bg-gradient-to-r from-primary to-purple-500"
                      >
                        {editLoadingId === product.id ? "Сохранение..." : "Сохранить"}
                      </Button>
                    </div>
                  </form>
                ) : null}
              </div>
            );
          })}
          {products.length === 0 ? (
            <p className="text-sm text-white/40">Пока нет товаров. Добавьте первый с помощью формы выше.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
