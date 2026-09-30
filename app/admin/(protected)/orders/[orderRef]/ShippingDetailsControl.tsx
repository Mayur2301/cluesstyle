// PATH: app/admin/(protected)/orders/[orderRef]/ShippingDetailsControl.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Kept in sync with SHIPPING_PROVIDERS in app/lib/admin-orders.ts by hand —
// duplicated rather than imported because that file pulls in the raw DB
// pool at module scope, which isn't safe to bundle into client code.
const SHIPPING_PROVIDERS = [
  { value: "shiprocket", label: "Shiprocket" },
  { value: "tirupati", label: "Tirupati Courier" },
  { value: "delhivery", label: "Delhivery" },
  { value: "dtdc", label: "DTDC" },
  { value: "other", label: "Other" },
];

export default function ShippingDetailsControl({
  orderRef,
  initialProvider,
  initialTrackingLink,
  initialAwbNumber,
}: {
  orderRef: string;
  initialProvider: string | null;
  initialTrackingLink: string | null;
  initialAwbNumber: string | null;
}) {
  const router = useRouter();
  const [provider, setProvider] = useState(initialProvider ?? "");
  const [trackingLink, setTrackingLink] = useState(initialTrackingLink ?? "");
  const [awbNumber, setAwbNumber] = useState(initialAwbNumber ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const changed =
    provider !== (initialProvider ?? "") ||
    trackingLink !== (initialTrackingLink ?? "") ||
    awbNumber !== (initialAwbNumber ?? "");

  // The label needs a courier + AWB number that are actually SAVED (not
  // just typed into the form) — `!changed` means what's on screen matches
  // what's in the DB, which is what the /label route will read.
  const canPrintLabel = !!provider && !!awbNumber && !changed;

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/orders/${orderRef}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_provider: provider,
          tracking_link: trackingLink,
          awb_number: awbNumber,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        console.error("[ShippingDetailsControl] Non-JSON response:", res.status, rawText.slice(0, 500));
      }

      if (!res.ok) {
        setError(data?.error || `Could not save shipping details (HTTP ${res.status}).`);
        return;
      }

      setSaved(true);
      router.refresh();
    } catch (err) {
      console.error("[ShippingDetailsControl] Network/fetch error:", err);
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Same gate as the "Print Shipping Label" button — the WhatsApp template
  // reads courier + AWB straight from the DB, so it should only be sendable
  // once those are actually saved (not just typed into the form).
  async function handleSendUpdate() {
    setSending(true);
    setSendError(null);
    setSent(false);
    try {
      const res = await fetch(`/api/admin/orders/${orderRef}/send-shipping-update`, {
        method: "POST",
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        console.error("[ShippingDetailsControl] Non-JSON send response:", res.status, rawText.slice(0, 500));
      }

      if (!res.ok) {
        setSendError(data?.error || `Could not send the update (HTTP ${res.status}).`);
        return;
      }

      setSent(true);
    } catch (err) {
      console.error("[ShippingDetailsControl] Send network/fetch error:", err);
      setSendError("Network error — please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Shipped via</label>
          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              setSaved(false);
              setError(null);
            }}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white"
          >
            <option value="">-- Select courier --</option>
            {SHIPPING_PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">AWB number</label>
          <input
            type="text"
            value={awbNumber}
            onChange={(e) => {
              setAwbNumber(e.target.value);
              setSaved(false);
              setError(null);
            }}
            placeholder="e.g. 71234567890"
            maxLength={64}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tracking link</label>
          <input
            type="text"
            value={trackingLink}
            onChange={(e) => {
              setTrackingLink(e.target.value);
              setSaved(false);
              setError(null);
            }}
            placeholder="https://..."
            maxLength={512}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleSave}
          disabled={!changed || saving}
          className="text-sm font-semibold bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-colors"
        >
          {saving ? "Saving…" : "Save shipping details"}
        </button>
        <a
          href={canPrintLabel ? `/admin/orders/${orderRef}/label` : undefined}
          target="_blank"
          rel="noreferrer"
          title={canPrintLabel ? "" : "Save the courier and AWB number first"}
          aria-disabled={!canPrintLabel}
          className={`inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg px-4 py-2 border transition-colors ${
            canPrintLabel
              ? "text-gray-900 bg-white border-gray-300 hover:bg-gray-50"
              : "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed pointer-events-none"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.32 0a4.5 4.5 0 001.577-8.717M5.63 18a4.5 4.5 0 01-1.577-8.717m0 0a4.5 4.5 0 011.577-.827m10.74 0a4.5 4.5 0 011.578.827m0 0V6a1.5 1.5 0 00-1.5-1.5H8.25a1.5 1.5 0 00-1.5 1.5v3.283" />
          </svg>
          Print Shipping Label
        </a>
        <button
          onClick={() => {
            setSendError(null);
            setSent(false);
            handleSendUpdate();
          }}
          disabled={!canPrintLabel || sending}
          title={canPrintLabel ? "" : "Save the courier and AWB number first"}
          className={`inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg px-4 py-2 border transition-colors ${
            canPrintLabel && !sending
              ? "text-white bg-green-600 border-green-600 hover:bg-green-700"
              : "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          {sending ? "Sending…" : "Notify"}
        </button>
        {sent && <span className="text-xs text-green-600">WhatsApp update sent</span>}
        {sendError && <span className="text-xs text-red-600">{sendError}</span>}
        {trackingLink && !changed && (
          <a href={trackingLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
            Open tracking link →
          </a>
        )}
        {saved && !changed && <span className="text-xs text-green-600">Saved</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  );
}