// PATH: app/lib/admin-payment-filters.ts
// Shared WHERE-clause builder for the admin Payments list — used by both
// the paginated /admin/payments page and the /api/admin/payments/export
// CSV route, so the two can never drift apart on what counts as "matching
// the current filters". Mirrors app/lib/admin-order-filters.ts's shape.

// Razorpay's own fixed method enum — these are the only values the
// `payment_method` column can ever hold (see verify-razorpay-payment's
// razorpayInstance.payments.fetch() call), so this list is exhaustive, not
// a guess.
export const PAYMENT_METHOD_FILTERS = ["upi", "card", "netbanking", "wallet", "emi"] as const;
export const PAYMENT_STATUS_FILTERS = ["paid", "pending", "failed"] as const;
export const ORDER_TYPE_FILTERS = ["standard", "sameday", "pickup"] as const;

export interface PaymentFilterParams {
  q?: string;
  method?: string;
  status?: string;
  type?: string;
  // Payment mode (prepaid vs cod) — a tab-only shortcut (the mockup's "COD"
  // tab), not exposed as its own dropdown alongside method/status/type.
  mode?: string;
  from?: string;
  to?: string;
}

export interface PaymentFilterState {
  q: string;
  method: (typeof PAYMENT_METHOD_FILTERS)[number] | null;
  status: (typeof PAYMENT_STATUS_FILTERS)[number] | null;
  type: (typeof ORDER_TYPE_FILTERS)[number] | null;
  mode: "prepaid" | "cod" | null;
  from: string | null;
  to: string | null;
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(new Date(value).getTime());
}

export function parsePaymentFilters(raw: PaymentFilterParams): PaymentFilterState {
  return {
    q: (raw.q ?? "").trim(),
    method: PAYMENT_METHOD_FILTERS.includes(raw.method as any) ? (raw.method as any) : null,
    status: PAYMENT_STATUS_FILTERS.includes(raw.status as any) ? (raw.status as any) : null,
    type: ORDER_TYPE_FILTERS.includes(raw.type as any) ? (raw.type as any) : null,
    mode: raw.mode === "prepaid" || raw.mode === "cod" ? raw.mode : null,
    from: raw.from && isValidDate(raw.from) ? raw.from : null,
    to: raw.to && isValidDate(raw.to) ? raw.to : null,
  };
}

export function buildPaymentWhere(filters: PaymentFilterState): { whereSql: string; params: any[] } {
  const clauses: string[] = [];
  const params: any[] = [];

  if (filters.q) {
    clauses.push("(order_ref LIKE ? OR customer_name LIKE ? OR razorpay_payment_id LIKE ?)");
    const like = `%${filters.q}%`;
    params.push(like, like, like);
  }
  if (filters.method) {
    clauses.push("payment_method = ?");
    params.push(filters.method);
  }
  if (filters.status) {
    clauses.push("payment_status = ?");
    params.push(filters.status);
  }
  if (filters.type) {
    clauses.push("delivery_type = ?");
    params.push(filters.type);
  }
  if (filters.mode) {
    clauses.push("payment_mode = ?");
    params.push(filters.mode);
  }
  if (filters.from) {
    clauses.push("DATE(created_at) >= ?");
    params.push(filters.from);
  }
  if (filters.to) {
    clauses.push("DATE(created_at) <= ?");
    params.push(filters.to);
  }

  return {
    whereSql: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

export function paymentFiltersToQueryString(filters: PaymentFilterState, extra?: Record<string, string | number | undefined>): string {
  const parts: string[] = [];
  if (filters.q) parts.push(`q=${encodeURIComponent(filters.q)}`);
  if (filters.method) parts.push(`method=${filters.method}`);
  if (filters.status) parts.push(`status=${filters.status}`);
  if (filters.type) parts.push(`type=${filters.type}`);
  if (filters.mode) parts.push(`mode=${filters.mode}`);
  if (filters.from) parts.push(`from=${filters.from}`);
  if (filters.to) parts.push(`to=${filters.to}`);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v !== undefined && v !== "") parts.push(`${k}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.join("&");
}