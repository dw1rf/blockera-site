"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDownIcon, FilterIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { categoryFilters, type Product, type ProductCategory } from "@/lib/donate";

import { ProductCard } from "./product-card";

const sortOptions = [
  { value: "popular", label: "По популярности" },
  { value: "price-asc", label: "Цена по возрастанию" },
  { value: "price-desc", label: "Цена по убыванию" }
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

type ProductResponse = Product & {
  status?: string | null;
};

export function DonateShop() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">("all");
  const [sort, setSort] = useState<SortValue>("popular");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        const response = await fetch("/api/products", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Не удалось получить список товаров");
        }
        const data = (await response.json()) as ProductResponse[];
        if (!isMounted) return;
        setProducts(
          data.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            highlight: item.highlight,
            commands: item.commands ?? undefined,
            regionLimit: item.regionLimit ?? undefined
          }))
        );
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let list: Product[] = products;

    if (activeCategory !== "all") {
      list = list.filter((product) => product.category === activeCategory);
    }

    if (query.trim()) {
      const text = query.trim().toLowerCase();
      list = list.filter((product) =>
        [product.name, product.description].some((field) => field.toLowerCase().includes(text))
      );
    }

    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      default:
        list = [...list];
    }

    return list;
  }, [products, activeCategory, query, sort]);

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4">
        <div className="relative flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.05] px-6 py-4">
          <SearchIcon className="h-5 w-5 text-white/40" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
            placeholder="Введите название или описание товара"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {categoryFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={filter.value === activeCategory ? "default" : "outline"}
              className={
                filter.value === activeCategory
                  ? "bg-gradient-to-r from-primary to-purple-500"
                  : "border-white/20"
              }
              onClick={() => setActiveCategory(filter.value)}
            >
              <FilterIcon className="mr-2 h-4 w-4" /> {filter.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              variant={option.value === sort ? "default" : "outline"}
              size="sm"
              className={
                option.value === sort
                  ? "bg-gradient-to-r from-primary to-purple-500"
                  : "border-white/20 text-white/70"
              }
              onClick={() => setSort(option.value)}
            >
              <ArrowUpDownIcon className="mr-2 h-4 w-4" /> {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center text-white/60">
            Загрузка ассортимента...
          </div>
        ) : error ? (
          <div className="col-span-full rounded-3xl border border-red-500/30 bg-red-500/10 p-12 text-center text-red-200">
            {error}
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <div className="col-span-full rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center text-white/60">
            По заданным параметрам ничего не найдено. Попробуйте изменить фильтры.
          </div>
        )}
      </div>
    </div>
  );
}
