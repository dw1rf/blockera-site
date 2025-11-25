const SURCHARGE_ENDPOINT = "https://easydonate.ru/api/v3/plugin/EasyDonate.Surcharge/getDiscountFor";

interface SurchargeApiResponse {
  success?: boolean;
  response?: {
    discount?: number | string | null;
    target?: {
      id?: number | string | null;
    } | null;
  };
  response_message?: string;
  error_code?: number;
}

export interface SurchargeDiscount {
  amount: number;
  discountProductId?: string | null;
  targetProductId?: string | null;
}

interface FetchSurchargeParams {
  shopKey: string;
  username: string;
  productId: string;
  serverId?: number | null;
}

export async function fetchSurchargeDiscount({
  shopKey,
  username,
  productId,
  serverId
}: FetchSurchargeParams): Promise<SurchargeDiscount | null> {
  if (!shopKey || !username || !productId) {
    return null;
  }

  try {
    const endpoint = new URL(SURCHARGE_ENDPOINT);
    endpoint.searchParams.set("username", username);
    endpoint.searchParams.set("product_id", productId);
    if (typeof serverId === "number" && Number.isFinite(serverId) && serverId > 0) {
      endpoint.searchParams.set("server_id", String(Math.round(serverId)));
    }

    const response = await fetch(endpoint, {
      method: "GET",
      headers: { "Shop-Key": shopKey },
      cache: "no-store"
    });

    if (!response.ok) {
      console.warn("[surcharge] EasyDonate returned non-OK status", response.status);
      return null;
    }

    const payload = (await response.json()) as SurchargeApiResponse;
    if (!payload.success || !payload.response) {
      console.warn("[surcharge] No discount in payload", payload);
      return null;
    }

  const discountValue = Number(payload.response.discount);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    console.info("[surcharge] Discount is zero or invalid", {
      discount: payload.response.discount,
      target: payload.response.target
    });
    return null;
  }

    const normalizedDiscount = Math.round(discountValue);
    const discountProductId =
      typeof (payload.response as { id?: string | number }).id === "number" ||
      typeof (payload.response as { id?: string | number }).id === "string"
        ? String((payload.response as { id?: string | number }).id)
        : null;
    const targetProductId =
      typeof payload.response.target?.id === "number" || typeof payload.response.target?.id === "string"
        ? String(payload.response.target.id)
        : null;

    return {
      amount: normalizedDiscount,
      discountProductId,
      targetProductId
    };
  } catch (error) {
    console.warn("[surcharge] Failed to fetch discount", error);
    return null;
  }
}
