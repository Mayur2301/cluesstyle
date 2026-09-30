// PATH: app/admin/(protected)/returns/ReturnStatusControl.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "requested", label: "Requested" },
  { value: "approved", label: "Approved" },
  { value: "picked_up", label: "Picked Up" },
  { value: "refunded", label: "Refunded" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

export default function ReturnStatusControl({
  returnRef,
  currentStatus,
}: {
  returnRef: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: string) {
    setStatus(next);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/returns/${returnRef}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Could not update status.");
        setStatus(currentStatus); // revert
        return;
      }
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setStatus(currentStatus);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <select
        value={status}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value)}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-800 disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}
