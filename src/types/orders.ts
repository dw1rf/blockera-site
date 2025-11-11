export interface OrderSummary {
  total: number;
  revenue: number;
  statuses: {
    PENDING: number;
    COMPLETED: number;
    FAILED: number;
    CANCELLED: number;
  };
}
