// PATH: app/admin/(protected)/orders/page.tsx
import { query } from "@/app/lib/db";
import Link from "next/link";
import type { RecentOrder } from "@/app/lib/admin-stats";
import { getDeliveryBreakdown } from "@/app/lib/admin-stats";
import { resolveOrderThumbnail } from "@/app/lib/admin-order-thumbnail";
import {
  parseOrderFilters,
  buildOrderWhere,
  filtersToQueryString,
} from "@/app/lib/admin-order-filters";
import {
  formatCurrency,
  formatDateTime,
  PAYMENT_STATUS_STYLES,
  ORDER_STATUS_STYLES,
  ORDER_STATUS_LABELS,
  DELIVERY_TYPE_STYLES,
  DELIVERY_TYPE_LABELS,
} from "../_components/format";
import OrdersDeliveryCards from "./OrdersDeliveryCards";
import OrdersFilterBar from "./OrdersFilterBar";
import OrderRowActions from "./OrderRowActions";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

interface OrderRow extends RecentOrder {
  product_slug: string | null;
  selected_color: string | null;
  selected_size: string | null;
  shipping_provider: string | null;
  awb_number: string | null;
  tracking_link: string | null;
}

function ShippingCell({ order }: { order: OrderRow }) {
  if (order.delivery_type === "pickup") {
    return <span className="text-xs text-gray-400">N/A</span>;
  }
  if (order.shipping_provider) {
    return (
      <div className="text-xs">
        <p className="font-medium text-gray-700">{order.shipping_provider}</p>
        {order.awb_number && <p className="text-gray-400">AWB: {order.awb_number}</p>}
      </div>
    );
  }
  return <span className="text-xs text-gray-400">Not Shipped</span>;
}

function ShippingActionButton({ order }: { order: OrderRow }) {
  if (order.delivery_type === "pickup") {
    return (
      <Link
        href={`/admin/orders/${order.order_ref}#status`}
        className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-1.5 hover:bg-green-100 whitespace-nowrap"
      >
        Mark Picked
      </Link>
    );
  }
  if (order.shipping_provider) {
    return (
      <Link
        href={`/admin/orders/${order.order_ref}#shipping`}
        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 hover:bg-blue-100 whitespace-nowrap"
      >
        View Shipping
      </Link>
    );
  }
  return (
    <Link
      href={`/admin/orders/${order.order_ref}#shipping`}
      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-100 whitespace-nowrap"
    >
      Add Shipping
    </Link>
  );
}

function buildPageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result: (number | "...")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  }
  return result;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; size?: string; q?: string; delivery?: string; status?: string; payment?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const filters = parseOrderFilters(sp);
  const page = Math.max(1, Number(sp.page) || 1);
  const pageSize = PAGE_SIZE_OPTIONS.includes(Number(sp.size)) ? Number(sp.size) : DEFAULT_PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  const { whereSql, params } = buildOrderWhere(filters);

  const [orders, countRows, deliveryBreakdown] = await Promise.all([
    query<OrderRow[]>(
      `SELECT order_ref, customer_name, product_name, product_slug, selected_color, selected_size, quantity,
              grand_total, payment_status, order_status, created_at, design_pdf_url, delivery_type, payment_mode,
              advance_amount, cod_due_amount, shipping_provider, awb_number, tracking_link
       FROM orders
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ${pageSize} OFFSET ${offset}`,
      params
    ),
    query<{ c: number }[]>(`SELECT COUNT(*) AS c FROM orders ${whereSql}`, params),
    getDeliveryBreakdown(),
  ]);

  const total = Number(countRows[0]?.c ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  // Query string carrying every active filter, WITHOUT `delivery` or `page`
  // — used by the delivery cards/tabs to switch delivery type while keeping
  // search/date/status/payment filters intact.
  const filtersNoDelivery = { ...filters, delivery: null };
  const qsWithoutDelivery = filtersToQueryString(filtersNoDelivery, pageSize !== DEFAULT_PAGE_SIZE ? { size: pageSize } : undefined);
  const baseQs = filtersToQueryString(filters, pageSize !== DEFAULT_PAGE_SIZE ? { size: pageSize } : undefined);
  const pageHref = (p: number) => `?${baseQs ? `${baseQs}&` : ""}page=${p}`;
  const exportHref = `/api/admin/orders/export?${baseQs}`;

  const TABS: { key: "all" | "standard" | "sameday" | "pickup"; label: string; count: number }[] = [
    { key: "all", label: "All Orders", count: deliveryBreakdown.all },
    { key: "standard", label: "Standard", count: deliveryBreakdown.standard },
    { key: "sameday", label: "Same Day", count: deliveryBreakdown.sameday },
    { key: "pickup", label: "Self Pickup", count: deliveryBreakdown.pickup },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">Manage, process and track all your orders.</p>
        </div>
        <a
          href="mailto:support@cluesstyle.com?subject=Manual%20order%20request"
          title="Manual order creation isn't wired up yet — this opens an email to support in the meantime."
          className="inline-flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 transition-colors w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Order
        </a>
      </div>

      <OrdersDeliveryCards
        standard={deliveryBreakdown.standard}
        sameday={deliveryBreakdown.sameday}
        pickup={deliveryBreakdown.pickup}
        active={filters.delivery}
        queryStringWithout={qsWithoutDelivery}
      />

      <OrdersFilterBar
        initialQ={filters.q}
        initialDelivery={filters.delivery ?? ""}
        initialStatus={filters.status ?? ""}
        initialPayment={filters.payment ?? ""}
        initialFrom={filters.from ?? ""}
        initialTo={filters.to ?? ""}
      />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => {
              const isActive = (t.key === "all" && !filters.delivery) || filters.delivery === t.key;
              const href = t.key === "all" ? `?${qsWithoutDelivery}` : `?${qsWithoutDelivery ? `${qsWithoutDelivery}&` : ""}delivery=${t.key}`;
              return (
                <Link
                  key={t.key}
                  href={href}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                    isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t.label} ({t.count.toLocaleString("en-IN")})
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={exportHref}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export
            </a>
            <button
              disabled
              title="Bulk actions aren't wired up yet"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 cursor-not-allowed"
            >
              Bulk Actions
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">No orders match these filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="px-5 py-2.5 font-medium w-8">
                    <input type="checkbox" className="rounded border-gray-300" disabled title="Bulk selection isn't wired up yet" />
                  </th>
                  <th className="px-5 py-2.5 font-medium">Order ID</th>
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">Product(s)</th>
                  <th className="px-5 py-2.5 font-medium">Items</th>
                  <th className="px-5 py-2.5 font-medium">Total</th>
                  <th className="px-5 py-2.5 font-medium">Payment</th>
                  <th className="px-5 py-2.5 font-medium">Delivery</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">Shipping</th>
                  <th className="px-5 py-2.5 font-medium">Date</th>
                  <th className="px-5 py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o) => {
                  const thumb = resolveOrderThumbnail(o.product_slug, o.selected_color);
                  const variant = [o.selected_size, o.selected_color].filter(Boolean).join(" / ");
                  return (
                    <tr key={o.order_ref} className="hover:bg-gray-50/60">
                      <td className="px-5 py-3">
                        <input type="checkbox" className="rounded border-gray-300" disabled title="Bulk selection isn't wired up yet" />
                      </td>
                      <td className="px-5 py-3 font-medium whitespace-nowrap">
                        <Link href={`/admin/orders/${o.order_ref}`} className="text-blue-600 hover:underline">
                          {o.order_ref}
                        </Link>
                        {o.design_pdf_url && (
                          <span className="ml-2 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 rounded-full px-2 py-0.5">
                            🎨
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-700 whitespace-nowrap">{o.customer_name}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5 max-w-[220px]">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                            {thumb ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={thumb} alt={o.product_name} className="w-full h-full object-contain" />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-800 truncate">{o.product_name}</p>
                            {variant && <p className="text-xs text-gray-400 truncate">{variant}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{o.quantity ?? "—"}</td>
                      <td className="px-5 py-3 font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(Number(o.grand_total))}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border capitalize ${PAYMENT_STATUS_STYLES[o.payment_status]}`}>
                          {o.payment_status}
                        </span>
                        {o.payment_mode === "cod" && (
                          <span className="block mt-1 text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-full px-2 py-0.5 w-fit">
                            COD · due {formatCurrency(o.cod_due_amount)}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${DELIVERY_TYPE_STYLES[o.delivery_type]}`}>
                          {DELIVERY_TYPE_LABELS[o.delivery_type]}
                        </span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${ORDER_STATUS_STYLES[o.order_status]}`}>
                          {ORDER_STATUS_LABELS[o.order_status]}
                        </span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5 items-start">
                          <ShippingCell order={o} />
                          <ShippingActionButton order={o} />
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{formatDateTime(o.created_at)}</td>
                      <td className="px-5 py-3 whitespace-nowrap text-right">
                        <OrderRowActions orderRef={o.order_ref} designPdfUrl={o.design_pdf_url} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span>
            Showing {total === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, total)} of {total.toLocaleString("en-IN")} orders
          </span>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Rows per page</span>
              <div className="flex items-center gap-1">
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <Link
                    key={s}
                    href={`?${filtersToQueryString(filters, { size: s })}`}
                    className={`px-2 py-1 rounded-md border ${
                      s === pageSize ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href={pageHref(Math.max(1, currentPage - 1))}
                aria-disabled={currentPage <= 1}
                className={`w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 ${
                  currentPage <= 1 ? "text-gray-300 pointer-events-none" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                ‹
              </Link>
              {buildPageList(currentPage, totalPages).map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="w-7 h-7 flex items-center justify-center text-gray-300">
                    ...
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={pageHref(p)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-medium ${
                      p === currentPage ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {p}
                  </Link>
                )
              )}
              <Link
                href={pageHref(Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage >= totalPages}
                className={`w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 ${
                  currentPage >= totalPages ? "text-gray-300 pointer-events-none" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                ›
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}