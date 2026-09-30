// PATH: app/admin/(protected)/orders/[orderRef]/OrderStatusControl.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_LABELS } from "../../_components/format";

const STATUSES = ["processing", "shipped", "delivered", "cancelled"] as const;

export default function OrderStatusControl({
  orderRef,
  currentStatus,
}: {
  orderRef: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/orders/${orderRef}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: status }),
      });

      // Read as text first — if the server returned an HTML error page
      // (500, a middleware redirect, etc.) instead of JSON, res.json()
      // would throw and we'd lose all detail. This way we can always show
      // SOMETHING useful instead of a generic fallback.
      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        console.error("[OrderStatusControl] Non-JSON response:", res.status, rawText.slice(0, 500));
      }

      if (!res.ok) {
        setError(data?.error || `Update failed (HTTP ${res.status}). Check server logs / browser console for details.`);
        return;
      }

      setSaved(true);
      router.refresh();
    } catch (err) {
      console.error("[OrderStatusControl] Network/fetch error:", err);
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  const changed = status !== currentStatus;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setSaved(false);
          setError(null);
        }}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <button
        onClick={handleSave}
        disabled={!changed || saving}
        className="text-sm font-semibold bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-colors"
      >
        {saving ? "Saving…" : "Update"}
      </button>
      {saved && !changed && <span className="text-xs text-green-600">Saved</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}