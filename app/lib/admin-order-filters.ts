// PATH: app/lib/admin-order-filters.ts
// Shared WHERE-clause builder for the admin orders list — used by both the
// paginated /admin/orders page and the /api/admin/orders/export CSV route,
// so the two can never drift apart on what counts as "matching the current
// filters".

export const ORDER_DELIVERY_FILTERS = ["standard", "sameday", "pickup"] as const;
export const ORDER_STATUS_FILTERS = ["processing", "shipped", "delivered", "cancelled"] as const;
export const PAYMENT_STATUS_FILTERS = ["paid", "pending", "failed"] as const;

export interface OrderFilterParams {
  q?: string;
  delivery?: string;
  status?: string;
  payment?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}

export interface OrderFilterState {
  q: string;
  delivery: (typeof ORDER_DELIVERY_FILTERS)[number] | null;
  status: (typeof ORDER_STATUS_FILTERS)[number] | null;
  payment: (typeof PAYMENT_STATUS_FILTERS)[number] | null;
  from: string | null;
  to: string | null;
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(new Date(value).getTime());
}

export function parseOrderFilters(raw: OrderFilterParams): OrderFilterState {
  return {
    q: (raw.q ?? "").trim(),
    delivery: ORDER_DELIVERY_FILTERS.includes(raw.delivery as any) ? (raw.delivery as any) : null,
    status: ORDER_STATUS_FILTERS.includes(raw.status as any) ? (raw.status as any) : null,
    payment: PAYMENT_STATUS_FILTERS.includes(raw.payment as any) ? (raw.payment as any) : null,
    from: raw.from && isValidDate(raw.from) ? raw.from : null,
    to: raw.to && isValidDate(raw.to) ? raw.to : null,
  };
}

export function buildOrderWhere(filters: OrderFilterState): { whereSql: string; params: any[] } {
  const clauses: string[] = [];
  const params: any[] = [];

  if (filters.q) {
    clauses.push("(order_ref LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR product_name LIKE ?)");
    const like = `%${filters.q}%`;
    params.push(like, like, like, like);
  }
  if (filters.delivery) {
    clauses.push("delivery_type = ?");
    params.push(filters.delivery);
  }
  if (filters.status) {
    clauses.push("order_status = ?");
    params.push(filters.status);
  }
  if (filters.payment) {
    clauses.push("payment_status = ?");
    params.push(filters.payment);
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

// Builds a query string carrying every currently-active filter (but not
// pagination) — used to keep filters intact across tab clicks, sort, page
// links, and the export link.
export function filtersToQueryString(filters: OrderFilterState, extra?: Record<string, string | number | undefined>): string {
  const parts: string[] = [];
  if (filters.q) parts.push(`q=${encodeURIComponent(filters.q)}`);
  if (filters.delivery) parts.push(`delivery=${filters.delivery}`);
  if (filters.status) parts.push(`status=${filters.status}`);
  if (filters.payment) parts.push(`payment=${filters.payment}`);
  if (filters.from) parts.push(`from=${filters.from}`);
  if (filters.to) parts.push(`to=${filters.to}`);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v !== undefined && v !== "") parts.push(`${k}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.join("&");
}