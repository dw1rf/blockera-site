import { NextResponse } from "next/server";

import { products as staticProducts, type ProductCategory } from "@/lib/donate";
import { fetchEasyDonateProducts, type EasyDonateProduct } from "@/lib/easydonate";
import { prisma } from "@/lib/prisma";
import { seedProductsIfEmpty } from "@/lib/product-seed";

const CATEGORY_VALUES: ProductCategory[] = ["privilege", "case", "booster", "cosmetic"];
const HIDDEN_STATUSES = new Set(["HIDDEN", "ARCHIVED"]);
const PRODUCTS_DB_TIMEOUT_MS = 10_000;
const PRODUCTS_EASYDONATE_TIMEOUT_MS = 8_000;

const normalizeCategory = (value: string): ProductCategory => {
  const next = value as ProductCategory;
  return CATEGORY_VALUES.includes(next) ? next : "privilege";
};

const toOptionalServerId = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      return Math.round(numeric);
    }
  }
  return undefined;
};

class TimeoutError extends Error {
  readonly label: string;
  readonly timeoutMs: number;

  constructor(label: string, timeoutMs: number) {
    super(`${label} timed out after ${timeoutMs}ms`);
    this.name = "TimeoutError";
    this.label = label;
    this.timeoutMs = timeoutMs;
  }
}

const toOptionalTimeoutMs = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      return Math.round(numeric);
    }
  }
  return undefined;
};

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return promise;
  }

  return await new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new TimeoutError(label, timeoutMs)), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
};

const joinCommands = (commands: string[] | undefined): string | undefined => {
  if (!commands || commands.length === 0) {
    return undefined;
  }
  return commands.join("\n");
};

const buildEasyDonateMaps = async (
  serverIds: Set<number>,
  shopKey: string,
  timeoutMs: number
): Promise<Map<number, Map<string, EasyDonateProduct>>> => {
  if (serverIds.size === 0) {
    return new Map();
  }

  const results = await Promise.all(
    [...serverIds].map(async (serverId) => {
      try {
        const products = await fetchEasyDonateProducts({ shopKey, serverId, timeoutMs });
        return [serverId, new Map(products.map((product) => [product.id, product]))] as const;
      } catch (error) {
        console.error(`[products] Failed to fetch EasyDonate products for server ${serverId}`, error);
        return null;
      }
    })
  );

  return new Map(results.filter((entry): entry is [number, Map<string, EasyDonateProduct>] => entry !== null));
};

const isVisibleStatus = (status: string | null | undefined) => {
  if (typeof status !== "string") {
    return true;
  }
  const normalized = status.trim().toUpperCase();
  if (normalized.length === 0 || normalized === "ACTIVE") {
    return true;
  }
  return !HIDDEN_STATUSES.has(normalized);
};

type ProductItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: string | null;
  highlight: string | null;
  commands: string | null;
  regionLimit: number | null;
  easyDonateProductId: string | null;
  easyDonateServerId: number | null;
};

export async function GET() {
  const shopKey = process.env.EASYDONATE_SHOP_KEY;
  const defaultServerId = toOptionalServerId(process.env.EASYDONATE_DEFAULT_SERVER_ID);
  const dbTimeoutMs = toOptionalTimeoutMs(process.env.PRODUCTS_DB_TIMEOUT_MS) ?? PRODUCTS_DB_TIMEOUT_MS;
  const easyDonateTimeoutMs =
    toOptionalTimeoutMs(process.env.PRODUCTS_EASYDONATE_TIMEOUT_MS) ?? PRODUCTS_EASYDONATE_TIMEOUT_MS;

  let usedStaticFallback = false;
  const timings: Array<[name: string, durationMs: number]> = [];

  const withTiming = async <T,>(name: string, task: () => Promise<T>) => {
    const start = Date.now();
    try {
      return await task();
    } finally {
      timings.push([name, Date.now() - start]);
    }
  };

  const toStaticFallback = () =>
    staticProducts.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      status: "ACTIVE",
      highlight: product.highlight ?? null,
      commands: product.commands ?? null,
      regionLimit: typeof product.regionLimit === "number" ? product.regionLimit : null,
      easyDonateProductId: product.easyDonateProductId ?? null,
      easyDonateServerId: typeof product.easyDonateServerId === "number" ? product.easyDonateServerId : null
    }));

  let items: ProductItem[];

  try {
    await withTiming("seed", () => withTimeout(seedProductsIfEmpty(), dbTimeoutMs, "seedProductsIfEmpty"));
    const allProducts = await withTiming("db", () =>
      withTimeout(
        prisma.product.findMany({
          orderBy: { price: "asc" }
        }),
        dbTimeoutMs,
        "prisma.product.findMany"
      )
    );
    items = allProducts.filter((product) => isVisibleStatus(product.status));
  } catch (error) {
    console.error("[products] Failed to load products from database", error);

    if (process.env.NODE_ENV === "production" && process.env.PRODUCTS_ALLOW_STATIC_FALLBACK !== "true") {
      return NextResponse.json(
        { message: "Не удалось получить список товаров" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    usedStaticFallback = true;
    items = toStaticFallback().filter((product) => isVisibleStatus(product.status));
  }

  let easyDonateProductsByServer = new Map<number, Map<string, EasyDonateProduct>>();

  if (shopKey && process.env.NODE_ENV !== "test") {
    const serverIds = new Set<number>();

    for (const product of items) {
      const serverId = toOptionalServerId(product.easyDonateServerId ?? defaultServerId);
      if (serverId) {
        serverIds.add(serverId);
      }
    }

    try {
      easyDonateProductsByServer = await withTiming("easydonate", () =>
        buildEasyDonateMaps(serverIds, shopKey, easyDonateTimeoutMs)
      );
    } catch (error) {
      console.error("[products] EasyDonate sync failed", error);
    }
  }

  const products = items.map((item) => {
    const resolvedServerId = toOptionalServerId(item.easyDonateServerId ?? defaultServerId);
    const easyProducts = resolvedServerId ? easyDonateProductsByServer.get(resolvedServerId) : undefined;
    const easyProduct =
      item.easyDonateProductId && easyProducts ? easyProducts.get(item.easyDonateProductId) : undefined;

    const commandsFromEasy = joinCommands(easyProduct?.commands);

    return {
      id: item.id,
      name: easyProduct?.name?.trim().length ? easyProduct.name : item.name,
      description: easyProduct?.description?.trim().length ? easyProduct.description : item.description,
      price: easyProduct?.price ?? item.price,
      category: normalizeCategory(item.category),
      highlight: item.highlight ?? undefined,
      commands: item.commands ?? commandsFromEasy,
      regionLimit: typeof item.regionLimit === "number" ? item.regionLimit : undefined,
      easyDonateProductId: item.easyDonateProductId ?? undefined,
      easyDonateServerId: resolvedServerId ?? undefined
    };
  });

  return NextResponse.json(products, {
    headers: {
      "Cache-Control": "no-store",
      "X-Products-Source": usedStaticFallback ? "static" : "database",
      "Server-Timing": timings.map(([name, durationMs]) => `${name};dur=${durationMs}`).join(", ")
    }
  });
}
