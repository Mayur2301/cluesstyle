// PATH: app/admin/(protected)/payments/page.tsx
import Link from "next/link";
import { query } from "@/app/lib/db";
import { formatCurrency, formatDateTime, PAYMENT_STATUS_STYLES } from "../_components/format";
import { parsePaymentFilters, buildPaymentWhere, paymentFiltersToQueryString, PaymentFilterState } from "@/app/lib/admin-payment-filters";
import { resolveOrderThumbnail } from "@/app/lib/admin-order-thumbnail";
import PaymentMethodBadge from "./PaymentMethodBadge";
import PaymentsFilterBar from "./PaymentsFilterBar";
import PaymentsDateRangeButton from "./PaymentsDateRangeButton";
import PaymentDetailsPanel from "./PaymentDetailsPanel";

const PAGE_SIZE = 10;

interface PaymentRow {
  order_ref: string;
  customer_name: string;
  product_name: string;
  product_slug: string | null;
  selected_color: string | null;
  grand_total: string;
  payment_status: "pending" | "paid" | "failed";
  payment_mode: "prepaid" | "cod";
  payment_method: string | null;
  razorpay_payment_id: string | null;
  cod_due_amount: number;
  created_at: string;
  updated_at: string;
}

function StatCard({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: "green" | "amber" | "orange" }) {
  const iconBg = tone === "green" ? "bg-green-50 text-green-600" : tone === "amber" ? "bg-amber-50 text-amber-600" : "bg-orange-50 text-orange-600";
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
          </svg>
        </span>
      </div>
      <p className="text-xl font-bold text-gray-900 mt-2">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
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

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string; q?: string; method?: string; status?: string; type?: string;
    tab?: string; from?: string; to?: string; details?: string;
  }>;
}) {
  const sp = await searchParams;
  const filters = parsePaymentFilters(sp);
  const page = Math.max(1, Number(sp.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // Tabs are a shortcut that overrides status/mode on top of whatever
  // else is active (search, method, type, date range) — same pattern as
  // the Orders page's delivery tabs.
  const tab = (["all", "paid", "pending", "cod", "failed"].includes(sp.tab ?? "") ? sp.tab : "all") as
    "all" | "paid" | "pending" | "cod" | "failed";

  const tabFilters: PaymentFilterState = { ...filters };
  if (tab === "paid") { tabFilters.status = "paid"; tabFilters.mode = null; }
  else if (tab === "pending") { tabFilters.status = "pending"; tabFilters.mode = null; }
  else if (tab === "failed") { tabFilters.status = "failed"; tabFilters.mode = null; }
  else if (tab === "cod") { tabFilters.mode = "cod"; tabFilters.status = null; }

  const { whereSql, params } = buildPaymentWhere(tabFilters);

  // Tab counts always reflect the OTHER active filters (search/method/type/
  // date) but not each other's status/mode override, so switching tabs
  // shows how many rows *that* tab would have given the rest of the filter
  // state — same idea as the Orders page's delivery-tab counts.
  const countFor = (over: Partial<PaymentFilterState>) => {
    const { whereSql: w, params: p } = buildPaymentWhere({ ...filters, ...over });
    return query<{ c: number }[]>(`SELECT COUNT(*) AS c FROM orders ${w}`, p).then((r) => Number(r[0]?.c ?? 0));
  };

  const [rows, totalRows, allCount, paidCount, pendingCount, codCount, failedCount, totals] = await Promise.all([
    query<PaymentRow[]>(
      `SELECT order_ref, customer_name, product_name, product_slug, selected_color, grand_total,
              payment_status, payment_mode, payment_method, razorpay_payment_id, cod_due_amount,
              created_at, updated_at
       FROM orders
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
      params
    ),
    query<{ c: number }[]>(`SELECT COUNT(*) AS c FROM orders ${whereSql}`, params),
    countFor({ status: null, mode: null }),
    countFor({ status: "paid", mode: null }),
    countFor({ status: "pending", mode: null }),
    countFor({ mode: "cod", status: null }),
    countFor({ status: "failed", mode: null }),
    // Real aggregates only — no fabricated "Refunds" total, since no
    // refund tracking exists anywhere in this codebase.
    query<{ collected: string | null; pending: string | null; cod_due: string | null }[]>(
      `SELECT
         SUM(CASE WHEN payment_status = 'paid' THEN grand_total - CASE WHEN payment_mode = 'cod' THEN cod_due_amount ELSE 0 END ELSE 0 END) AS collected,
         SUM(CASE WHEN payment_status = 'pending' THEN grand_total ELSE 0 END) AS pending,
         SUM(CASE WHEN payment_status = 'paid' AND payment_mode = 'cod' THEN cod_due_amount ELSE 0 END) AS cod_due
       FROM orders`
    ),
  ]);

  const total = Number(totalRows[0]?.c ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const totalCollected = Number(totals[0]?.collected ?? 0);
  const totalPending = Number(totals[0]?.pending ?? 0);
  const totalCodDue = Number(totals[0]?.cod_due ?? 0);

  const baseQs = paymentFiltersToQueryString(filters, tab !== "all" ? { tab } : undefined);
  const qsNoTab = paymentFiltersToQueryString(filters);
  const qsWithTab = paymentFiltersToQueryString(filters, tab !== "all" ? { tab } : undefined);
  const pageHref = (p: number) => `?${baseQs ? `${baseQs}&` : ""}page=${p}`;
  const exportHref = `/api/admin/payments/export?${paymentFiltersToQueryString(tabFilters)}`;
  const detailsOrderRef = sp.details ?? null;
  const closeDetailsHref = `?${qsWithTab}`;

  const TABS: { key: typeof tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: allCount },
    { key: "paid", label: "Paid", count: paidCount },
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "cod", label: "COD", count: codCount },
    { key: "failed", label: "Failed", count: failedCount },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500">Track collected, pending and COD-due amounts across all orders.</p>
        </div>
        <div className="flex items-center gap-2">
          <PaymentsDateRangeButton initialFrom={filters.from ?? ""} initialTo={filters.to ?? ""} />
          <a
            href={exportHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 hover:bg-gray-50 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Collected" value={formatCurrency(totalCollected)} sub="Paid orders, minus COD balance still due" tone="green" />
        <StatCard label="Pending Payments" value={formatCurrency(totalPending)} sub="Awaiting payment confirmation" tone="amber" />
        <StatCard label="COD to Collect" value={formatCurrency(totalCodDue)} sub="Balance due on delivery for paid COD orders" tone="orange" />
      </div>

      <div className={`grid grid-cols-1 ${detailsOrderRef ? "xl:grid-cols-3" : ""} gap-4 items-start`}>
        <div className={detailsOrderRef ? "xl:col-span-2 space-y-4" : "space-y-4"}>
          <PaymentsFilterBar
            initialQ={filters.q}
            initialMethod={filters.method ?? ""}
            initialStatus={filters.status ?? ""}
            initialType={filters.type ?? ""}
          />

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 pt-4 pb-3 flex flex-wrap gap-2 border-b border-gray-100">
              {TABS.map((t) => {
                const href = t.key === "all" ? `?${qsNoTab}` : `?${qsNoTab ? `${qsNoTab}&` : ""}tab=${t.key}`;
                return (
                  <Link
                    key={t.key}
                    href={href}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                      tab === t.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t.label} ({t.count.toLocaleString("en-IN")})
                  </Link>
                );
              })}
            </div>

            {rows.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-400">No payments match these filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                      <th className="px-5 py-2.5 font-medium">Order ID</th>
                      <th className="px-5 py-2.5 font-medium">Customer</th>
                      <th className="px-5 py-2.5 font-medium">Amount</th>
                      <th className="px-5 py-2.5 font-medium">Method</th>
                      <th className="px-5 py-2.5 font-medium">Transaction ID</th>
                      <th className="px-5 py-2.5 font-medium">Status</th>
                      <th className="px-5 py-2.5 font-medium">Date &amp; Time</th>
                      <th className="px-5 py-2.5 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rows.map((p) => (
                      <tr key={p.order_ref} className={`hover:bg-gray-50/60 ${detailsOrderRef === p.order_ref ? "bg-blue-50/40" : ""}`}>
                        <td className="px-5 py-3 font-medium whitespace-nowrap">
                          <Link href={`/admin/orders/${p.order_ref}`} className="text-blue-600 hover:underline">
                            {p.order_ref}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-gray-700 whitespace-nowrap">{p.customer_name}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className="font-semibold text-gray-900">{formatCurrency(Number(p.grand_total))}</span>
                          {p.payment_mode === "cod" && (
                            <span className="block mt-1 text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-full px-2 py-0.5 w-fit">
                              COD · due {formatCurrency(p.cod_due_amount)}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <PaymentMethodBadge method={p.payment_method} isCod={p.payment_mode === "cod"} />
                        </td>
                        <td className="px-5 py-3 text-gray-500 whitespace-nowrap text-xs">{p.razorpay_payment_id ?? "—"}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full border capitalize ${PAYMENT_STATUS_STYLES[p.payment_status]}`}>
                            {p.payment_status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{formatDateTime(p.created_at)}</td>
                        <td className="px-5 py-3 whitespace-nowrap text-right">
                          <Link
                            href={`?${qsNoTab ? `${qsNoTab}&` : ""}${tab !== "all" ? `tab=${tab}&` : ""}details=${p.order_ref}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 hover:bg-blue-100 whitespace-nowrap"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
              <span>
                Showing {total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, total)} of {total.toLocaleString("en-IN")} payments
              </span>
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

        {detailsOrderRef && (
          <div className="xl:col-span-1">
            <PaymentDetailsPanel orderRef={detailsOrderRef} closeHref={closeDetailsHref} />
          </div>
        )}
      </div>
    </div>
  );
}