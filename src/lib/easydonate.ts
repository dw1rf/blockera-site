const EASYDONATE_API_BASE_URL = "https://easydonate.ru/api/v3";
const PRODUCT_CACHE_TTL_MS = 1000 * 60 * 3; // cache EasyDonate payloads for 3 minutes

type EasyDonateProductsResponse = {
  success?: boolean;
  response?: unknown;
  response_message?: string;
  error_code?: number;
};

type EasyDonateProductPayload = {
  id: number;
  name?: string | null;
  price?: number | string | null;
  description?: string | null;
  type?: string | null;
  commands?: Array<string | null> | null;
  image?: string | null;
  sort_index?: number | null;
};

export interface EasyDonateProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  commands: string[];
  image?: string | null;
  sortIndex?: number | null;
}

interface FetchProductsOptions {
  shopKey: string;
  serverId: number;
  skipCache?: boolean;
  cacheTtlMs?: number;
}

type CacheEntry = {
  expiresAt: number;
  data: EasyDonateProduct[];
};

const cacheByServer = new Map<number, CacheEntry>();

const toInteger = (value: number | string | null | undefined): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.round(parsed);
    }
  }
  return 0;
};

const normalizeProduct = (payload: EasyDonateProductPayload): EasyDonateProduct => ({
  id: String(payload.id),
  name: payload.name?.trim() ?? "",
  description: payload.description?.trim() ?? "",
  price: toInteger(payload.price ?? 0),
  type: payload.type ?? "unknown",
  commands: Array.isArray(payload.commands)
    ? payload.commands
        .filter((command): command is string => typeof command === "string" && command.trim().length > 0)
        .map((command) => command.trim())
    : [],
  image: payload.image ?? null,
  sortIndex: typeof payload.sort_index === "number" ? payload.sort_index : null
});

export async function fetchEasyDonateProducts({
  shopKey,
  serverId,
  skipCache = false,
  cacheTtlMs = PRODUCT_CACHE_TTL_MS
}: FetchProductsOptions): Promise<EasyDonateProduct[]> {
  if (!Number.isFinite(serverId) || serverId <= 0) {
    throw new Error("EasyDonate server ID is not configured");
  }

  const cached = cacheByServer.get(serverId);
  if (!skipCache && cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const endpoint = new URL("/shop/products", EASYDONATE_API_BASE_URL);
  endpoint.searchParams.set("server_id", String(Math.round(serverId)));

  const response = await fetch(endpoint, {
    headers: {
      "Shop-Key": shopKey
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`EasyDonate request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as EasyDonateProductsResponse;
  if (!payload.success || !Array.isArray(payload.response)) {
    const message =
      typeof payload.response === "string" && payload.response.length > 0
        ? payload.response
        : payload.response_message ?? "Не удалось получить товары EasyDonate";
    throw new Error(message);
  }

  const products = payload.response.map((item) => normalizeProduct(item as EasyDonateProductPayload));

  cacheByServer.set(serverId, {
    data: products,
    expiresAt: Date.now() + (cacheTtlMs > 0 ? cacheTtlMs : PRODUCT_CACHE_TTL_MS)
  });

  return products;
}
