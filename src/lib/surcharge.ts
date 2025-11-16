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
  targetProductId?: string | null;
}

interface FetchSurchargeParams {
  shopKey: string;
  username: string;
  productId: string;
}

export async function fetchSurchargeDiscount({
  shopKey,
  username,
  productId
}: FetchSurchargeParams): Promise<SurchargeDiscount | null> {
  if (!shopKey || !username || !productId) {
    return null;
  }

  try {
    const endpoint = new URL(SURCHARGE_ENDPOINT);
    endpoint.searchParams.set("username", username);
    endpoint.searchParams.set("product_id", productId);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: { "Shop-Key": shopKey },
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as SurchargeApiResponse;
    if (!payload.success || !payload.response) {
      return null;
    }

    const discountValue = Number(payload.response.discount);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return null;
    }

    const normalizedDiscount = Math.round(discountValue);
    const targetProductId =
      typeof payload.response.target?.id === "number" || typeof payload.response.target?.id === "string"
        ? String(payload.response.target.id)
        : null;

    return {
      amount: normalizedDiscount,
      targetProductId
    };
  } catch (error) {
    console.warn("[surcharge] Failed to fetch discount", error);
    return null;
  }
}
