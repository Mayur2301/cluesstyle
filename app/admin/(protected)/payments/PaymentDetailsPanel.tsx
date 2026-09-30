// PATH: app/admin/(protected)/payments/PaymentDetailsPanel.tsx
import Link from "next/link";
import { getOrderByRef, parseOrderCustomization } from "@/app/lib/admin-orders";
import { resolveOrderThumbnail } from "@/app/lib/admin-order-thumbnail";
import { formatCurrency, formatDateTime } from "../_components/format";
import PaymentMethodBadge from "./PaymentMethodBadge";

export default async function PaymentDetailsPanel({ orderRef, closeHref }: { orderRef: string; closeHref: string }) {
  const order = await getOrderByRef(orderRef);

  if (!order) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900">Payment Details</h3>
          <Link href={closeHref} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">✕</Link>
        </div>
        <p className="text-sm text-gray-400">No order found for "{orderRef}".</p>
      </div>
    );
  }

  const customization = parseOrderCustomization(order.customization);
  const thumbnail = resolveOrderThumbnail(order.product_slug, order.selected_color);
  const variant = [order.selected_size, order.selected_color].filter(Boolean).join(" / ");

  const statusBanner =
    order.payment_status === "paid"
      ? { bg: "bg-green-50 border-green-100", icon: "bg-green-500", title: "Payment Successful", sub: "This payment has been completed." }
      : order.payment_status === "pending"
        ? { bg: "bg-amber-50 border-amber-100", icon: "bg-amber-500", title: "Payment Pending", sub: "This payment hasn't been confirmed yet." }
        : { bg: "bg-red-50 border-red-100", icon: "bg-red-500", title: "Payment Failed", sub: "This payment attempt did not go through." };

  const mailSubject = encodeURIComponent(`Your payment receipt — ${order.order_ref}`);
  const mailBody = encodeURIComponent(
    `Hi ${order.customer_name},\n\nThanks for your order ${order.order_ref}. ${
      order.invoice_url ? `You can view/download your invoice here: ${order.invoice_url}` : "Your receipt will be shared shortly."
    }\n\n— CluesStyle`
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5 sticky top-20">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Payment Details</h3>
        <Link href={closeHref} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">✕</Link>
      </div>

      {/* Status banner */}
      <div className={`rounded-xl border p-4 flex items-start gap-3 ${statusBanner.bg}`}>
        <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${statusBanner.icon}`}>
          {order.payment_status === "paid" ? (
            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : order.payment_status === "pending" ? (
            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            </svg>
          ) : (
            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </span>
        <div>
          <p className="text-sm font-bold text-gray-900">{statusBanner.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{statusBanner.sub}</p>
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between"><span className="text-gray-400">Order ID</span><Link href={`/admin/orders/${order.order_ref}`} className="text-blue-600 hover:underline font-medium">{order.order_ref}</Link></div>
        <div className="flex justify-between"><span className="text-gray-400">Customer</span><span className="text-gray-900">{order.customer_name}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="text-gray-900 font-bold">{formatCurrency(Number(order.grand_total))}</span></div>
        <div className="flex justify-between items-center"><span className="text-gray-400">Payment Method</span><PaymentMethodBadge method={order.payment_method} isCod={order.payment_mode === "cod"} /></div>
        <div className="flex justify-between"><span className="text-gray-400">Transaction ID</span><span className="text-gray-900 text-right break-all">{order.razorpay_payment_id ?? "—"}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Payment Date</span><span className="text-gray-900">{formatDateTime(order.updated_at)}</span></div>
        {order.payment_mode === "cod" && (
          <div className="flex justify-between"><span className="text-gray-400">Due on delivery</span><span className="text-orange-700 font-semibold">{formatCurrency(order.cod_due_amount)}</span></div>
        )}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">Order Details</p>
        <div className="flex gap-3">
          <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
            {thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnail} alt={order.product_name} className="w-full h-full object-contain" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{order.product_name}</p>
            <p className="text-xs text-gray-400">Qty: {order.quantity ?? "—"}{variant ? ` · ${variant}` : ""}</p>
            <p className="text-sm font-bold text-gray-900 mt-1">{formatCurrency(Number(order.grand_total))}</p>
          </div>
        </div>
        <Link href={`/admin/orders/${order.order_ref}`} className="inline-block mt-3 text-xs font-semibold text-blue-600 hover:underline">
          View Order →
        </Link>
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Actions</p>
        <a
          href={order.customer_email ? `mailto:${order.customer_email}?subject=${mailSubject}&body=${mailBody}` : undefined}
          className={`w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 hover:bg-blue-100 transition-colors ${
            !order.customer_email ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          Send Receipt to Customer
        </a>
        <a
          href={order.invoice_url ?? undefined}
          target="_blank"
          rel="noreferrer"
          className={`w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors ${
            !order.invoice_url ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          Download Payment Receipt
        </a>
        <button
          disabled
          title="Refunds aren't wired up to Razorpay yet"
          className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-red-400 bg-red-50/60 border border-red-100 rounded-xl px-4 py-2.5 cursor-not-allowed"
        >
          Issue Refund
        </button>
      </div>

      {(order.admin_note || customization?.note) && (
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Notes</p>
          {order.admin_note && <p className="text-sm text-gray-800 whitespace-pre-wrap">{order.admin_note}</p>}
          <Link href={`/admin/orders/${order.order_ref}#status`} className="inline-block mt-2 text-xs text-blue-600 hover:underline">
            Edit in full order →
          </Link>
        </div>
      )}
    </div>
  );
}