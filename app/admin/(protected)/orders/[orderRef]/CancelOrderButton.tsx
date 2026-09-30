// PATH: app/admin/(protected)/orders/[orderRef]/CancelOrderButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelOrderButton({ orderRef, currentStatus }: { orderRef: string; currentStatus: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadyCancelled = currentStatus === "cancelled";

  async function handleCancel() {
    if (!window.confirm(`Cancel order ${orderRef}? This sets its status to Cancelled.`)) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderRef}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: "cancelled" }),
      });
      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        console.error("[CancelOrderButton] Non-JSON response:", res.status, rawText.slice(0, 500));
      }
      if (!res.ok) {
        setError(data?.error || `Could not cancel order (HTTP ${res.status}).`);
        return;
      }
      router.refresh();
    } catch (err) {
      console.error("[CancelOrderButton] Network/fetch error:", err);
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleCancel}
        disabled={alreadyCancelled || saving}
        className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {alreadyCancelled ? "Order Cancelled" : saving ? "Cancelling…" : "Cancel Order"}
      </button>
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}