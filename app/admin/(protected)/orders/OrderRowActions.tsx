// PATH: app/admin/(protected)/orders/OrderRowActions.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function OrderRowActions({ orderRef, designPdfUrl }: { orderRef: string; designPdfUrl: string | null }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-lg hover:bg-gray-100 inline-flex items-center justify-center text-gray-400"
        aria-label="Actions"
      >
        •••
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg border border-gray-100 shadow-lg z-20 text-left overflow-hidden">
            <Link href={`/admin/orders/${orderRef}`} className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>
              View details
            </Link>
            <Link href={`/admin/orders/${orderRef}#status`} className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>
              Update status
            </Link>
            <Link href={`/admin/orders/${orderRef}#shipping`} className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>
              Manage shipping
            </Link>
            {designPdfUrl && (
              <a href={designPdfUrl} target="_blank" rel="noreferrer" className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>
                Download design PDF
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}