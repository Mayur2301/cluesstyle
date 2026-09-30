// PATH: app/track-order/TrackOrderClient.tsx
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaSearch,
  FaBoxOpen,
  FaCog,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaExternalLinkAlt,
  FaWhatsapp,
  FaClock,
  FaChevronRight,
  FaFileAlt,
  FaPhoneAlt,
  FaShieldAlt,
  FaHeadset,
  FaArrowRight,
} from "react-icons/fa";
import { SELLER_PHONE_E164 } from "@/app/lib/company-info";

// Kept in sync with SHIPPING_PROVIDERS in app/lib/admin-orders.ts by hand —
// duplicated rather than imported for the same reason ShippingDetailsControl
// duplicates it: this is a client component and that file pulls in the raw
// DB pool at module scope.
//
// trackUrl builds a direct, AWB-prefilled link to that courier's own public
// tracking page when the courier supports one. Verify these still work
// before relying on them in production — courier tracking-page URL formats
// change without notice, and this wasn't tested against a live shipment on
// every courier. The admin-entered tracking_link (saved per order) is
// always tried FIRST and is far more reliable than these — these are only
// the fallback when no tracking_link was saved.
const COURIERS: Record<
  string,
  { label: string; trackUrl: ((awb: string) => string) | null }
> = {
  shiprocket: {
    label: "Shiprocket",
    trackUrl: (awb) => `https://shiprocket.co/tracking/${encodeURIComponent(awb)}`,
  },
  delhivery: {
    label: "Delhivery",
    trackUrl: (awb) => `https://www.delhivery.com/track-v2/package/${encodeURIComponent(awb)}`,
  },
  dtdc: {
    // DTDC doesn't have a reliable public "AWB in the URL" tracking link —
    // send customers to the tracking page and they paste the AWB in
    // themselves.
    label: "DTDC",
    trackUrl: () => `https://www.dtdc.in/tracking`,
  },
  tirupati: {
    // No public tracking website — always falls back to "contact us".
    label: "Tirupati Courier",
    trackUrl: null,
  },
  other: {
    label: "Courier Partner",
    trackUrl: null,
  },
};

interface TrackedOrder {
  order_ref: string;
  order_status: "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "paid" | "failed";
  product_name: string;
  quantity: number | null;
  selected_size: string | null;
  selected_color: string | null;
  shipping_provider: string | null;
  awb_number: string | null;
  tracking_link: string | null;
  created_at: string;
  updated_at: string;
}

const STEPS = [
  { key: "placed", label: "Order Placed", icon: FaBoxOpen },
  { key: "processing", label: "Processing", icon: FaCog },
  { key: "shipped", label: "Shipped", icon: FaTruck },
  { key: "delivered", label: "Delivered", icon: FaCheckCircle },
] as const;

function activeStepIndex(status: TrackedOrder["order_status"]): number {
  switch (status) {
    case "processing":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    default:
      return 0;
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ── Decorative product images ───────────────────────────────────────────
// Real files already in /public — both already include their own caption
// text/badge/arrow baked into the graphic, so nothing extra is drawn around
// them here (no wrapping circle, no separate caption, no badge chip).
const TSHIRT_IMAGE_SRC = "/track-order-tshirt.webp";
const BOX_IMAGE_SRC = "/box.webp";

export default function TrackOrderClient() {
  const [orderRef, setOrderRef] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderRef: orderRef.trim(), phone: phone.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Could not find that order. Please check the details and try again.");
        return;
      }
      setOrder(data.order);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const courier = order?.shipping_provider ? COURIERS[order.shipping_provider] : null;
  const trackHref =
    order?.tracking_link ||
    (order?.awb_number && courier?.trackUrl ? courier.trackUrl(order.awb_number) : null);

  const whatsappHref = `https://wa.me/${SELLER_PHONE_E164.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hi, I'd like help tracking my order."
  )}`;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Breadcrumb ── */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <nav className="text-xs text-gray-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <FaChevronRight className="w-2 h-2" />
          <span className="text-gray-800 font-medium">Track Order</span>
        </nav>
      </div>

      <div className="max-w-8xl mx-auto px-4 py-10 sm:py-14">
        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center gap-18">
          {/* ── Left image ── */}
          <div className="hidden lg:flex flex-1 justify-end">
            <div className="relative w-full max-w-sm h-80 xl:h-96">
              <Image
                src={TSHIRT_IMAGE_SRC}
                alt="Custom T-Shirts"
                fill
                className="object-contain"
                sizes="400px"
              />
            </div>
          </div>

          {/* ── Center form ── */}
          <div className="max-w-md w-full shrink-0 text-center">
            <span className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full px-4 py-2 mb-4">
              <FaTruck className="w-3.5 h-3.5" />
              Track Your Order
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Track Your <span className="text-orange-500">Order</span>
            </h1>
            <p className="mt-3 text-sm text-gray-500">
              Enter your Order ID and the phone number you used while ordering to check the status of your order in
              real-time.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 text-left"
            >
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                  <FaFileAlt className="w-3 h-3" /> Order ID
                </label>
                <input
                  type="text"
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                  placeholder="e.g. CS-10234"
                  required
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                  <FaPhoneAlt className="w-3 h-3" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-lg px-4 py-3 transition-colors"
              >
                <FaSearch className="w-3.5 h-3.5" />
                {loading ? "Searching…" : "Track Order"}
              </button>
              {error && (
                <p className="text-sm text-red-600 flex items-start gap-1.5">
                  <FaTimesCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <hr className="flex-1 border-gray-100" />
                <span className="text-[11px] font-medium text-gray-400">OR</span>
                <hr className="flex-1 border-gray-100" />
              </div>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
                    <FaWhatsapp className="w-4 h-4" />
                  </span>
                  <span className="text-left">
                    <span className="block text-sm font-semibold text-gray-900">Track via WhatsApp</span>
                    <span className="block text-xs text-gray-500">Get instant updates on WhatsApp</span>
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 rounded-full px-3 py-1.5 shrink-0">
                  Chat Now <FaArrowRight className="w-2.5 h-2.5" />
                </span>
              </a>
            </form>
          </div>

          {/* ── Right image ── */}
          <div className="hidden lg:flex flex-1 justify-start">
            <div className="relative w-full max-w-sm h-80 xl:h-96">
              <Image
                src={BOX_IMAGE_SRC}
                alt="Happiness Delivered"
                fill
                className="object-contain"
                sizes="400px"
              />
            </div>
          </div>
        </div>

        {/* ── Trust features row ── */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
          {[
            { icon: FaShieldAlt, title: "Secure & Safe", sub: "Your information is secure" },
            { icon: FaClock, title: "Real-time Updates", sub: "Get latest status instantly" },
            { icon: FaHeadset, title: "Need Help?", sub: "Our team is always here" },
            { icon: FaBoxOpen, title: "Easy Returns", sub: "Hassle-free process" },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex flex-col items-center gap-2">
              <span className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-700">
                <Icon className="w-4 h-4" />
              </span>
              <p className="text-sm font-semibold text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Order result ── */}
        {order && (
          <div className="mt-10 max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
              <h2 className="text-lg font-semibold text-gray-900">Order {order.order_ref}</h2>
              {order.order_status !== "cancelled" && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                  <FaClock className="w-3 h-3" /> Placed {formatDate(order.created_at)}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-6">
              {order.product_name}
              {order.quantity ? ` × ${order.quantity}` : ""}
              {order.selected_size ? ` · ${order.selected_size}` : ""}
              {order.selected_color ? ` · ${order.selected_color}` : ""}
            </p>

            {order.order_status === "cancelled" ? (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 rounded-lg px-4 py-3 text-sm font-medium">
                <FaTimesCircle className="w-4 h-4 flex-shrink-0" />
                This order has been cancelled.
              </div>
            ) : (
              <ol className="relative">
                {STEPS.map((step, i) => {
                  const active = activeStepIndex(order.order_status);
                  const done = i <= active;
                  const Icon = step.icon;
                  const isLast = i === STEPS.length - 1;
                  return (
                    <li key={step.key} className="relative pl-10 pb-8 last:pb-0">
                      {!isLast && (
                        <span
                          className={`absolute left-4 top-8 -translate-x-1/2 w-0.5 h-[calc(100%-1.5rem)] ${
                            i < active ? "bg-gray-900" : "bg-gray-200"
                          }`}
                        />
                      )}
                      <span
                        className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          done ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <p className={`text-sm font-semibold ${done ? "text-gray-900" : "text-gray-400"}`}>
                        {step.label}
                      </p>
                      {i === active && (
                        <p className="text-xs text-gray-500 mt-0.5">Current status</p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}

            {order.order_status !== "cancelled" && (order.shipping_provider || order.awb_number) && (
              <div className="mt-2 pt-5 border-t border-gray-100 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {order.shipping_provider && (
                    <div>
                      <p className="text-xs text-gray-400">Courier</p>
                      <p className="font-medium text-gray-900">
                        {courier?.label || order.shipping_provider}
                      </p>
                    </div>
                  )}
                  {order.awb_number && (
                    <div>
                      <p className="text-xs text-gray-400">AWB / Tracking No.</p>
                      <p className="font-medium text-gray-900">{order.awb_number}</p>
                    </div>
                  )}
                </div>

                {trackHref ? (
                  <a
                    href={trackHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg px-4 py-2 transition-colors"
                  >
                    Track on {courier?.label || "Courier"} Site <FaExternalLinkAlt className="w-3 h-3" />
                  </a>
                ) : order.awb_number ? (
                  <a
                    href={`https://wa.me/${SELLER_PHONE_E164.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Hi, please share the live tracking status for my order ${order.order_ref} (AWB ${order.awb_number}).`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg px-4 py-2 transition-colors"
                  >
                    <FaWhatsapp className="w-4 h-4" /> Ask us on WhatsApp
                  </a>
                ) : null}
              </div>
            )}

            {!order.shipping_provider && !order.awb_number && order.order_status === "processing" && (
              <p className="mt-2 pt-5 border-t border-gray-100 text-sm text-gray-500">
                Your order is being processed. Courier and tracking details will appear here once it's shipped.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}