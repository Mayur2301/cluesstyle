// PATH: app/return-order/ReturnOrderClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Caveat } from "next/font/google";
import {
  FaChevronRight,
  FaFileAlt,
  FaPhoneAlt,
  FaSearch,
  FaTimesCircle,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaCheckCircle,
  FaBoxOpen,
  FaPalette,
  FaExpandArrowsAlt,
  FaEllipsisH,
  FaClipboardList,
  FaQuestionCircle,
  FaCommentDots,
  FaEnvelope,
} from "react-icons/fa";
import { SELLER_PHONE_E164 } from "@/app/lib/company-info";

const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"] });

// Duplicated from app/lib/return-orders.ts on purpose — that file imports
// the raw DB pool (via admin-orders.ts) at module scope, which isn't safe
// to bundle into client code. Keep the `value`s in sync with
// RETURN_REASONS there; icons are purely presentational and only live
// here.
const RETURN_REASONS = [
  { value: "wrong_product", label: "Wrong Product Received", icon: FaBoxOpen, color: "text-red-500 bg-red-50" },
  { value: "damaged", label: "Product Damaged", icon: FaBoxOpen, color: "text-orange-500 bg-orange-50" },
  { value: "size_issue", label: "Size Issue", icon: FaExpandArrowsAlt, color: "text-blue-500 bg-blue-50" },
  { value: "changed_mind", label: "Changed My Mind", icon: FaUndo, color: "text-pink-500 bg-pink-50" },
  { value: "printing_issue", label: "Printing/Design Issue", icon: FaPalette, color: "text-fuchsia-500 bg-fuchsia-50" },
  { value: "other", label: "Other", icon: FaEllipsisH, color: "text-gray-500 bg-gray-100" },
] as const;

interface LookupItem {
  order_ref: string;
  product_name: string;
  product_sku: string | null;
  selected_size: string | null;
  selected_color: string | null;
  quantity: number;
  grand_total: string;
}

interface SelectedItem {
  selected: boolean;
  quantity: number;
}

const STEP_LABELS = ["Select Order", "Select Items to Return", "Tell Us the Reason", "Pickup & Refund"];

export default function ReturnOrderClient() {
  const [step, setStep] = useState(1); // 1-4, or 5 = success
  const [success, setSuccess] = useState(false);
  const [returnRef, setReturnRef] = useState("");

  // Step 1
  const [orderRef, setOrderRef] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<LookupItem[]>([]);

  // Step 2
  const [selection, setSelection] = useState<Record<string, SelectedItem>>({});

  // Step 3
  const [reason, setReason] = useState<string>("");
  const [reasonNote, setReasonNote] = useState("");

  // Step 4
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleFetchOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/return-order/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderRef: orderRef.trim(), phone: phone.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.eligible === false) {
        setError(data?.error || "This order isn't eligible for a return.");
        return;
      }
      setItems(data.items || []);
      const initialSelection: Record<string, SelectedItem> = {};
      for (const it of data.items || []) {
        initialSelection[it.order_ref] = { selected: false, quantity: 1 };
      }
      setSelection(initialSelection);
      setStep(2);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggleItem(ref: string) {
    setSelection((prev) => ({ ...prev, [ref]: { ...prev[ref], selected: !prev[ref].selected } }));
  }

  function setQty(ref: string, qty: number, max: number) {
    setSelection((prev) => ({ ...prev, [ref]: { ...prev[ref], quantity: Math.max(1, Math.min(qty, max)) } }));
  }

  const selectedRefs = items.filter((it) => selection[it.order_ref]?.selected);

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/return-order/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderRef: orderRef.trim(),
          phone: phone.trim(),
          items: selectedRefs.map((it) => ({ order_ref: it.order_ref, quantity: selection[it.order_ref].quantity })),
          reason,
          reasonNote,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setSubmitError(data?.error || "Could not submit your return request. Please try again.");
        return;
      }
      setReturnRef(data.returnRef);
      setSuccess(true);
    } catch {
      setSubmitError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const whatsappHref = `https://wa.me/${SELLER_PHONE_E164.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hi, I'd like help with a return request."
  )}`;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Breadcrumb ── */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <nav className="text-xs text-gray-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <FaChevronRight className="w-2 h-2" />
          
          
          <span className="text-gray-800 font-medium">Return Order</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        {/* ── Hero ── */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
          <div className="max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Request a <span className="text-blue-600">Return</span>
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Not satisfied? No worries! You can easily request a return or refund.
            </p>

            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              {[
                { icon: FaTruck, color: "bg-blue-100 text-blue-600", title: "Hassle-Free Returns", sub: "Quick and easy process" },
                { icon: FaShieldAlt, color: "bg-green-100 text-green-600", title: "Secure & Safe", sub: "100% secure process" },
                { icon: FaBoxOpen, color: "bg-orange-100 text-orange-600", title: "Refund to Original Payment", sub: "Fast and reliable" },
              ].map(({ icon: Icon, color, title, sub }) => (
                <div key={title} className="flex items-start gap-2.5">
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{title}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center shrink-0">
            <div className="relative w-56 h-56">
              <Image src="/box.webp" alt="Easy Returns" fill className="object-contain" sizes="224px" />
            </div>
            <p className={`${caveat.className} text-2xl text-gray-700 -mt-2`}>Easy Returns, Happier You!</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* ── Left: stepper card ── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
            {success ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Return request submitted</h2>
                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                  We&apos;ve received your request. Our team will review it and reach out on{" "}
                  <span className="font-medium text-gray-700">{phone}</span> shortly.
                </p>
                <p className="mt-4 text-sm font-semibold text-gray-900">Return ID: {returnRef}</p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/track-order" className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50">
                    Track Your Orders
                  </Link>
                  <Link href="/products" className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            ) : (
              STEP_LABELS.map((label, i) => {
                const stepNum = i + 1;
                const isActive = stepNum === step;
                const isDone = stepNum < step;
                return (
                  <div key={label} className="relative pl-11 pb-8 last:pb-0">
                    {i < STEP_LABELS.length - 1 && (
                      <span
                        className={`absolute left-4 top-9 -translate-x-1/2 w-0.5 h-[calc(100%-2rem)] ${
                          isDone ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                    <span
                      className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : isDone
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isDone ? <FaCheckCircle className="w-4 h-4" /> : stepNum}
                    </span>

                    <p className={`font-semibold ${isActive || isDone ? "text-gray-900" : "text-gray-400"}`}>{label}</p>

                    {/* ── Step 1 content ── */}
                    {isActive && stepNum === 1 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-4">
                          Enter your Order ID and registered phone number to fetch your order details.
                        </p>
                        <form onSubmit={handleFetchOrder} className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                                <FaFileAlt className="w-3 h-3" /> Order ID
                              </label>
                              <input
                                type="text"
                                required
                                value={orderRef}
                                onChange={(e) => setOrderRef(e.target.value)}
                                placeholder="e.g. CS-10234"
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-800"
                              />
                            </div>
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                                <FaPhoneAlt className="w-3 h-3" /> Phone Number
                              </label>
                              <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="e.g. 9876543210"
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-800"
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-lg px-4 py-3 transition-colors"
                          >
                            <FaSearch className="w-3.5 h-3.5" />
                            {loading ? "Fetching…" : "Fetch Order"}
                          </button>
                          {error && (
                            <p className="text-sm text-red-600 flex items-start gap-1.5">
                              <FaTimesCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              {error}
                            </p>
                          )}
                        </form>
                      </div>
                    )}

                    {/* ── Step 2 content ── */}
                    {isActive && stepNum === 2 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-4">Choose which item(s) and quantities you want to return.</p>
                        <div className="space-y-3">
                          {items.map((it) => {
                            const sel = selection[it.order_ref] || { selected: false, quantity: 1 };
                            return (
                              <label
                                key={it.order_ref}
                                className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer ${
                                  sel.selected ? "border-blue-500 bg-blue-50/40" : "border-gray-200"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={sel.selected}
                                  onChange={() => toggleItem(it.order_ref)}
                                  className="rounded accent-blue-600"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">{it.product_name}</p>
                                  <p className="text-xs text-gray-500">
                                    {[it.selected_size, it.selected_color].filter(Boolean).join(" · ")} · Ordered Qty {it.quantity}
                                  </p>
                                </div>
                                {sel.selected && it.quantity > 1 && (
                                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.preventDefault()}>
                                    <button
                                      type="button"
                                      onClick={() => setQty(it.order_ref, sel.quantity - 1, it.quantity)}
                                      className="w-7 h-7 rounded-full border border-gray-300 text-sm"
                                    >
                                      −
                                    </button>
                                    <span className="text-sm w-4 text-center">{sel.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => setQty(it.order_ref, sel.quantity + 1, it.quantity)}
                                      className="w-7 h-7 rounded-full border border-gray-300 text-sm"
                                    >
                                      +
                                    </button>
                                  </div>
                                )}
                              </label>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          disabled={selectedRefs.length === 0}
                          onClick={() => setStep(3)}
                          className="mt-5 w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-900 text-white text-sm font-semibold disabled:opacity-50 hover:bg-gray-800"
                        >
                          Continue
                        </button>
                      </div>
                    )}

                    {/* ── Step 3 content ── */}
                    {isActive && stepNum === 3 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-4">Help us understand why you&apos;re returning this.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {RETURN_REASONS.map(({ value, label, icon: Icon, color }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setReason(value)}
                              className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center ${
                                reason === value ? "border-blue-500 bg-blue-50/40" : "border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <span className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                                <Icon className="w-4 h-4" />
                              </span>
                              <span className="text-xs font-medium text-gray-800">{label}</span>
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={reasonNote}
                          onChange={(e) => setReasonNote(e.target.value)}
                          placeholder="Add any extra details (optional)"
                          rows={3}
                          className="mt-4 w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-800"
                        />
                        <div className="mt-5 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="px-5 py-3 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            disabled={!reason}
                            onClick={() => setStep(4)}
                            className="flex-1 sm:flex-none px-6 py-3 rounded-lg bg-gray-900 text-white text-sm font-semibold disabled:opacity-50 hover:bg-gray-800"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── Step 4 content ── */}
                    {isActive && stepNum === 4 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-4">Review your request before submitting.</p>
                        <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
                          <div>
                            <p className="text-xs text-gray-400">Items</p>
                            {selectedRefs.map((it) => (
                              <p key={it.order_ref} className="text-sm text-gray-800">
                                {it.product_name} × {selection[it.order_ref].quantity}
                              </p>
                            ))}
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Reason</p>
                            <p className="text-sm text-gray-800">
                              {RETURN_REASONS.find((r) => r.value === reason)?.label}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Pickup Address</p>
                            <p className="text-sm text-gray-800">Same as your delivery address on file.</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Refund</p>
                            <p className="text-sm text-gray-800">To your original payment method, within 5–7 business days of pickup.</p>
                          </div>
                        </div>

                        {submitError && (
                          <p className="mt-3 text-sm text-red-600 flex items-start gap-1.5">
                            <FaTimesCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {submitError}
                          </p>
                        )}

                        <div className="mt-5 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setStep(3)}
                            className="px-5 py-3 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={handleSubmit}
                            className="flex-1 sm:flex-none px-6 py-3 rounded-lg bg-gray-900 text-white text-sm font-semibold disabled:opacity-50 hover:bg-gray-800"
                          >
                            {submitting ? "Submitting…" : "Submit Return Request"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* ── Right: info card ── */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-2">
              <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <FaClipboardList className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-gray-900 mt-1.5">Need to Return an Item?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Check your order details, select the item(s) and share the reason. We&apos;ll take care of the rest.
            </p>
            <ul className="space-y-3">
              {[
                "Easy return within 7 days",
                "Pickup from your location",
                "Instant order tracking",
                "Refund to original payment method",
              ].map((line) => (
                <li key={line} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <FaCheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Our Return Policy / Need Help ── */}
        <div className="grid sm:grid-cols-2 gap-6 mt-10">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-9 h-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <FaShieldAlt className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-gray-900">Our Return Policy</h3>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-600">
              <li>Return request can be raised within 7 days of delivery.</li>
              <li>Product must be unused, unwashed and in original condition.</li>
              <li>Custom printed products can only be returned if there is a defect or we made an error.</li>
              <li>Refund will be processed to your original payment method within 5–7 business days after we receive the item.</li>
            </ul>
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                <FaQuestionCircle className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-gray-900">Need Help?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Our support team is always here to help you.</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-800">
                <FaCommentDots className="w-4 h-4 text-blue-500" /> Live Chat
              </a>
              <a href={`tel:${SELLER_PHONE_E164}`} className="flex items-center gap-2 text-gray-800">
                <FaPhoneAlt className="w-4 h-4 text-green-500" /> Call Us
              </a>
              <a href="mailto:support@cluesstyle.com" className="flex items-center gap-2 text-gray-800">
                <FaEnvelope className="w-4 h-4 text-orange-500" /> Email Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
