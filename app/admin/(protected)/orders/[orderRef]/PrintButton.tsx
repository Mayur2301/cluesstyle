// PATH: app/admin/(protected)/orders/[orderRef]/PrintButton.tsx
"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl px-3.5 py-2 hover:bg-gray-50"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.32 0a4.5 4.5 0 001.577-8.717M5.63 18a4.5 4.5 0 01-1.577-8.717m0 0a4.5 4.5 0 011.577-.827m10.74 0a4.5 4.5 0 011.578.827m0 0V6a1.5 1.5 0 00-1.5-1.5H8.25a1.5 1.5 0 00-1.5 1.5v3.283" />
      </svg>
      Print
    </button>
  );
}