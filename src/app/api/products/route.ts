import { NextResponse } from "next/server";

import type { ProductCategory } from "@/lib/donate";
import { fetchEasyDonateProducts, type EasyDonateProduct } from "@/lib/easydonate";
import { prisma } from "@/lib/prisma";
import { seedProductsIfEmpty } from "@/lib/product-seed";

const CATEGORY_VALUES: ProductCategory[] = ["privilege", "case", "booster", "cosmetic"];
const HIDDEN_STATUSES = new Set(["HIDDEN", "ARCHIVED"]);

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

const joinCommands = (commands: string[] | undefined): string | undefined => {
  if (!commands || commands.length === 0) {
    return undefined;
  }
  return commands.join("\n");
};

const buildEasyDonateMaps = async (
  serverIds: Set<number>,
  shopKey: string
): Promise<Map<number, Map<string, EasyDonateProduct>>> => {
  if (serverIds.size === 0) {
    return new Map();
  }

  const results = await Promise.all(
    [...serverIds].map(async (serverId) => {
      try {
        const products = await fetchEasyDonateProducts({ shopKey, serverId });
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

export async function GET() {
  await seedProductsIfEmpty();

  const allProducts = await prisma.product.findMany({
    orderBy: { price: "asc" }
  });
  const items = allProducts.filter((product) => isVisibleStatus(product.status));

  const shopKey = process.env.EASYDONATE_SHOP_KEY;
  const defaultServerId = toOptionalServerId(process.env.EASYDONATE_DEFAULT_SERVER_ID);

  let easyDonateProductsByServer = new Map<number, Map<string, EasyDonateProduct>>();

  if (shopKey) {
    const serverIds = new Set<number>();

    for (const product of items) {
      const serverId = toOptionalServerId(product.easyDonateServerId ?? defaultServerId);
      if (serverId) {
        serverIds.add(serverId);
      }
    }

    try {
      easyDonateProductsByServer = await buildEasyDonateMaps(serverIds, shopKey);
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
      "Cache-Control": "no-store"
    }
  });
}
