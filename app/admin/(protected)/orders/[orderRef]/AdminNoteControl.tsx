// PATH: app/admin/(protected)/orders/[orderRef]/AdminNoteControl.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminNoteControl({
  orderRef,
  initialNote,
}: {
  orderRef: string;
  initialNote: string | null;
}) {
  const router = useRouter();
  const [note, setNote] = useState(initialNote ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const changed = note !== (initialNote ?? "");

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/orders/${orderRef}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_note: note }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        console.error("[AdminNoteControl] Non-JSON response:", res.status, rawText.slice(0, 500));
      }

      if (!res.ok) {
        setError(data?.error || `Could not save note (HTTP ${res.status}).`);
        return;
      }

      setSaved(true);
      router.refresh();
    } catch (err) {
      console.error("[AdminNoteControl] Network/fetch error:", err);
      setError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <textarea
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
          setError(null);
        }}
        placeholder="Internal note for this order — only visible to admins, never shown to the customer."
        rows={4}
        maxLength={2000}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-800 resize-y"
      />
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={handleSave}
          disabled={!changed || saving}
          className="text-sm font-semibold bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-colors"
        >
          {saving ? "Saving…" : "Save note"}
        </button>
        <span className="text-xs text-gray-400">{note.length}/2000</span>
        {saved && !changed && <span className="text-xs text-green-600">Saved</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  );
}