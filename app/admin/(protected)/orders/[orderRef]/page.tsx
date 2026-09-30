// PATH: app/admin/(protected)/orders/[orderRef]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByRef, parseOrderCustomization } from "@/app/lib/admin-orders";
import { resolveOrderThumbnail } from "@/app/lib/admin-order-thumbnail";
import OrderStatusControl from "./OrderStatusControl";
import AdminNoteControl from "./AdminNoteControl";
import ShippingDetailsControl from "./ShippingDetailsControl";
import PrintButton from "./PrintButton";
import CancelOrderButton from "./CancelOrderButton";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  PAYMENT_STATUS_STYLES,
  ORDER_STATUS_STYLES,
  ORDER_STATUS_LABELS,
  DELIVERY_TYPE_LABELS,
} from "../../_components/format";

function Card({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <div id={id} className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-900 text-right">{value}</span>
    </div>
  );
}

const TIMELINE_STEPS = [
  { key: "placed", label: "Order Placed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
] as const;
const STEP_ORDER: Record<string, number> = { placed: 0, processing: 1, shipped: 2, delivered: 3 };

function TruckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}
function StoreIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75h-3.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
    </svg>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderRef: string }>;
}) {
  const { orderRef } = await params;
  const order = await getOrderByRef(orderRef);

  if (!order) notFound();

  const customization = parseOrderCustomization(order.customization);
  const fullAddress = [order.address_line1, order.address_line2, order.address_city, order.address_state, order.address_pincode]
    .filter(Boolean)
    .join(", ");
  const mapsHref = fullAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}` : null;
  const thumbnail = resolveOrderThumbnail(order.product_slug, order.selected_color);

  const isCancelled = order.order_status === "cancelled";
  const currentStepIndex = isCancelled ? -1 : STEP_ORDER[order.order_status] ?? 0;

  const subtotal = Number(order.price_per_unit) * Number(order.quantity ?? 0);

  const DELIVERY_INFO = [
    { key: "standard" as const, label: "Standard Delivery", sub: "Delivery in 5-7 days", icon: <TruckIcon />, color: "blue" },
    { key: "sameday" as const, label: "Same Day Delivery", sub: "Charges confirmed on call", icon: <BoltIcon />, color: "amber" },
    { key: "pickup" as const, label: "Self Pickup", sub: "Customer will collect in-store", icon: <StoreIcon />, color: "green" },
  ];
  const colorClasses: Record<string, { iconBg: string; ring: string }> = {
    blue: { iconBg: "bg-blue-100 text-blue-600", ring: "border-blue-400 bg-blue-50/40 ring-1 ring-blue-400" },
    amber: { iconBg: "bg-amber-100 text-amber-600", ring: "border-amber-400 bg-amber-50/40 ring-1 ring-amber-400" },
    green: { iconBg: "bg-green-100 text-green-600", ring: "border-green-400 bg-green-50/40 ring-1 ring-green-400" },
  };

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-400">
        <Link href="/admin/orders" className="hover:text-gray-700">Orders</Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-600">Order Details</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{order.order_ref}</h1>
          <p className="text-sm text-gray-500">Placed on {formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${PAYMENT_STATUS_STYLES[order.payment_status]}`}>
            Payment {order.payment_status === "paid" ? "Paid" : order.payment_status === "pending" ? "Pending" : "Failed"}
          </span>
          {order.payment_mode === "cod" && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-orange-50 text-orange-700 border-orange-100">
              COD
            </span>
          )}
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ORDER_STATUS_STYLES[order.order_status]}`}>
            {ORDER_STATUS_LABELS[order.order_status]}
          </span>
          <PrintButton />
        </div>
      </div>

      {isCancelled && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm text-red-700 font-medium">
          This order was cancelled. Fulfillment steps below no longer apply.
        </div>
      )}

      {/* Timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start">
            {TIMELINE_STEPS.map((step, i) => {
              const isDone = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={step.key} className="flex-1 flex items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isDone ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isDone ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span className={`text-[11px] font-semibold text-center leading-tight ${isDone ? "text-gray-900" : "text-gray-400"}`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] text-gray-400 text-center leading-tight">
                      {i === 0 ? formatDate(order.created_at) : isCurrent ? "In progress" : isDone ? "Done" : "Pending"}
                    </span>
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`flex-1 h-[2px] mx-1 -mt-5 rounded-full ${i < currentStepIndex ? "bg-emerald-400" : "bg-gray-100"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delivery mode info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DELIVERY_INFO.map((d) => {
          const isActive = order.delivery_type === d.key;
          const c = colorClasses[d.color];
          return (
            <div
              key={d.key}
              className={`relative flex items-center gap-3 rounded-2xl border p-3.5 ${isActive ? c.ring : "border-gray-100 bg-white"}`}
            >
              {isActive && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
              )}
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>{d.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">{d.label}</p>
                <p className="text-[11px] text-gray-400 leading-tight truncate">{d.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Left column ── */}
        <div className="space-y-4">
          <Card title="Product Details">
            <div className="flex gap-3 mb-3">
              <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                {thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnail} alt={order.product_name} className="w-full h-full object-contain" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{order.product_name}</p>
                <a href={order.product_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                  View product →
                </a>
              </div>
            </div>
            <Row label="SKU" value={order.product_sku} />
            <Row label="Color SKU" value={order.color_sku} />
            <Row label="Color" value={order.selected_color} />
            <Row label="Size" value={order.selected_size} />
            <Row label="Quantity" value={order.quantity} />
            <Row label="Print Type" value={customization?.printType} />
            <Row label="Fabric Type" value={customization?.fabricType} />
            <Row
              label="Delivery Type"
              value={
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {DELIVERY_TYPE_LABELS[order.delivery_type]}
                </span>
              }
            />
          </Card>

          {/* Colour/size breakdown for bulk multi-colour orders */}
          {Array.isArray(customization?.colorBreakdown) && customization.colorBreakdown.length > 0 && (
            <Card title="Colour / Size Breakdown">
              <div className="space-y-2">
                {customization.colorBreakdown.map((cb: { color: string; sizeBreakdown: Record<string, number> }, i: number) => {
                  const total = Object.values(cb.sizeBreakdown || {}).reduce((a, b) => a + (Number(b) || 0), 0);
                  return (
                    <div key={`${cb.color}-${i}`} className="flex items-start justify-between gap-3 text-xs bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                      <span className="font-bold text-gray-800 whitespace-nowrap">{cb.color}</span>
                      <span className="text-gray-600 text-right">
                        {Object.entries(cb.sizeBreakdown || {})
                          .filter(([, qty]) => Number(qty) > 0)
                          .map(([size, qty]) => `${size}×${qty}`)
                          .join(", ")}{" "}
                        <span className="text-gray-400">({total} pcs)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <Card title="Customer Details">
            <Row label="Name" value={order.customer_name} />
            <Row label="Phone" value={<a href={`tel:${order.customer_phone}`} className="hover:underline">{order.customer_phone}</a>} />
            <Row
              label="Alt. phone"
              value={customization?.altPhone ? <a href={`tel:${customization.altPhone}`} className="hover:underline">{customization.altPhone}</a> : null}
            />
            <Row
              label="Email"
              value={
                order.customer_email ? (
                  <a href={`mailto:${order.customer_email}`} className="text-blue-600 hover:underline">{order.customer_email}</a>
                ) : null
              }
            />
            <Row label="GSTIN" value={customization?.gstNumber ?? null} />
          </Card>

          <Card title="Shipping Address">
            <p className="text-sm text-gray-800 leading-relaxed mb-2">{fullAddress}</p>
            <div className="flex items-center gap-3">
              <a href={`tel:${order.customer_phone}`} className="text-xs text-gray-500 hover:text-gray-800">{order.customer_phone}</a>
              {mapsHref && (
                <a href={mapsHref} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                  View on Map →
                </a>
              )}
            </div>
          </Card>

          {/* Design Files — only for orders with an actual uploaded logo design */}
          {customization?.logoDesign && Object.keys(customization.logoDesign).length > 0 && (
            <Card title="🎨 Design Files">
              {order.design_pdf_url ? (
                <a
                  href={order.design_pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2.5 mb-4 transition-colors"
                >
                  Download production-ready design PDF
                </a>
              ) : (
                <div className="mb-4 space-y-1.5">
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    Design PDF hasn't been generated yet.
                  </p>
                  {order.design_pdf_error ? (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{order.design_pdf_error}</p>
                  ) : (
                    <p className="text-xs text-gray-400 px-1">No error was recorded — check server logs for {order.order_ref}.</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {Object.entries(customization.logoDesign as Record<string, { url: string; layers: any[] }>).map(([side, design]) => (
                  <div key={side} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={design.url} alt={`${side} design`} className="w-full h-full object-contain" />
                    </div>
                    <div className="p-2.5 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-gray-700 capitalize truncate">{side} Design</span>
                      <a
                        href={design.url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="text-[10px] font-semibold text-blue-600 hover:underline whitespace-nowrap"
                      >
                        ↓ Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Other customization */}
          {customization && (customization.sizeBreakdown || customization.note || customization.logoUrls) && (
            <Card title="Customization">
              {customization.sizeBreakdown && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">Size breakdown</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(customization.sizeBreakdown).map(([size, qty]) => (
                      <span key={size} className="text-xs bg-gray-100 rounded-full px-2.5 py-1">
                        {size}: {String(qty)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {customization.note && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 mb-1">Note from customer</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{customization.note}</p>
                </div>
              )}
              {customization.logoUrls && Object.keys(customization.logoUrls).length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2">Logo files</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(customization.logoUrls).map(([side, url]) => (
                      <a key={side} href={String(url)} target="_blank" rel="noreferrer" className="text-xs bg-blue-50 text-blue-700 rounded-full px-2.5 py-1 hover:underline">
                        {side}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Order Timeline */}
          <Card title="Order Timeline">
            <div className="space-y-4">
              {TIMELINE_STEPS.map((step, i) => {
                const isDone = !isCancelled && i <= currentStepIndex;
                const isCurrent = !isCancelled && i === currentStepIndex;
                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isDone ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isDone && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${isDone ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                      <p className="text-xs text-gray-400">
                        {i === 0 ? formatDateTime(order.created_at) : isCurrent ? "In progress" : isDone ? formatDateTime(order.updated_at) : "Pending"}
                      </p>
                    </div>
                  </div>
                );
              })}
              {isCancelled && (
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-red-500 text-white">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-red-600">Cancelled</p>
                    <p className="text-xs text-gray-400">{formatDateTime(order.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">
          <Card title="Pricing Details">
            <Row label={`Product Price (× ${order.quantity ?? 1})`} value={formatCurrency(subtotal)} />
            {Number(order.same_day_charge) > 0 && <Row label="Same-day charge" value={formatCurrency(Number(order.same_day_charge))} />}
            <Row label="GST (5%)" value={formatCurrency(Number(order.gst_amount))} />
            <div className="border-t border-gray-100 mt-2 pt-2 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">Grand Total</span>
              <span className="text-base font-extrabold text-gray-900">{formatCurrency(Number(order.grand_total))}</span>
            </div>
            {order.payment_mode === "cod" && (
              <div className="mt-3 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5 space-y-1 text-xs">
                <div className="flex justify-between text-orange-700"><span>Paid now (confirmation)</span><span className="font-bold">{formatCurrency(order.advance_amount)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Due on delivery (cash)</span><span className="font-semibold">{formatCurrency(order.cod_due_amount)}</span></div>
              </div>
            )}
          </Card>

          <Card title="Payment Status">
            <div className={`rounded-xl px-3.5 py-3 mb-3 ${order.payment_status === "paid" ? "bg-green-50 border border-green-100" : "bg-amber-50 border border-amber-100"}`}>
              <p className={`text-sm font-bold ${order.payment_status === "paid" ? "text-green-700" : "text-amber-700"}`}>
                {order.payment_status === "paid" ? "Paid" : order.payment_status === "pending" ? "Pending" : "Failed"}
              </p>
            </div>
            <Row label="Payment Method" value="Razorpay" />
            <Row label="Payment ID" value={order.razorpay_payment_id} />
            <Row label="Payment Date" value={formatDateTime(order.updated_at)} />
            {order.razorpay_payment_id && (
              <a
                href={`https://dashboard.razorpay.com/app/payments/${order.razorpay_payment_id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 text-xs text-blue-600 hover:underline"
              >
                View Payment Details →
              </a>
            )}
            {order.invoice_url && (
              <a href={order.invoice_url} target="_blank" rel="noreferrer" className="inline-block mt-1 text-xs text-blue-600 hover:underline">
                View invoice →
              </a>
            )}
          </Card>

          <Card title="Shipping (Manual Entry)" id="shipping">
            <ShippingDetailsControl
              orderRef={order.order_ref}
              initialProvider={order.shipping_provider}
              initialTrackingLink={order.tracking_link}
              initialAwbNumber={order.awb_number}
            />
          </Card>

          <Card title="Order Notes">
            <p className="text-xs text-gray-400 mb-1.5">Internal note (only visible to admins)</p>
            <AdminNoteControl orderRef={order.order_ref} initialNote={order.admin_note} />
            {customization?.note && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Customer note</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{customization.note}</p>
              </div>
            )}
          </Card>

          <Card title="Order Actions" id="status">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Update Status</p>
                <OrderStatusControl orderRef={order.order_ref} currentStatus={order.order_status} />
              </div>
              <a
                href={order.customer_email ? `mailto:${order.customer_email}` : undefined}
                className={`w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                  !order.customer_email ? "opacity-40 pointer-events-none" : ""
                }`}
              >
                Email Customer
              </a>
              <a
                href={order.invoice_url ?? undefined}
                target="_blank"
                rel="noreferrer"
                className={`w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                  !order.invoice_url ? "opacity-40 pointer-events-none" : ""
                }`}
              >
                Download Invoice
              </a>
              <button
                disabled
                title="Packing slip generation isn't wired up yet"
                className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 cursor-not-allowed"
              >
                Download Packing Slip
              </button>
              <div className="pt-1">
                <CancelOrderButton orderRef={order.order_ref} currentStatus={order.order_status} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}