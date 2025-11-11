export type UserRole = "USER" | "ADMIN";

export const USER_ROLES: readonly UserRole[] = ["USER", "ADMIN"] as const;

export type ProductStatus = "ACTIVE" | "HIDDEN" | "ARCHIVED";
export const PRODUCT_STATUSES: readonly ProductStatus[] = ["ACTIVE", "HIDDEN", "ARCHIVED"] as const;

export type OrderStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
export const ORDER_STATUSES: readonly OrderStatus[] = ["PENDING", "COMPLETED", "FAILED", "CANCELLED"] as const;

export type PaymentStatus = "RECEIVED" | "REFUNDED" | "DISPUTED";
export const PAYMENT_STATUSES: readonly PaymentStatus[] = ["RECEIVED", "REFUNDED", "DISPUTED"] as const;
