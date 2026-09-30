// PATH: app/admin/(protected)/payments/PaymentMethodBadge.tsx

const METHOD_LABELS: Record<string, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Netbanking",
  wallet: "Wallet",
  emi: "EMI",
};

function MethodIcon({ method }: { method: string | null }) {
  const cls = "w-4 h-4 flex-shrink-0";
  switch (method) {
    case "upi":
      return (
        <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      );
    case "card":
      return (
        <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-9-6h19.5" />
          <rect x="2.25" y="6" width="19.5" height="13.5" rx="2" strokeWidth={1.8} />
        </svg>
      );
    case "netbanking":
      return (
        <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M2.25 9.75L12 3l9.75 6.75M4.5 9.75v11.25M19.5 9.75v11.25M9 21v-5.25a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5V21" />
        </svg>
      );
    case "wallet":
      return (
        <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 100 6h3.75A2.25 2.25 0 0021 13.5v-1.5zM3 6.75v10.5A2.25 2.25 0 005.25 19.5h13.5A2.25 2.25 0 0021 17.25v-6a2.25 2.25 0 00-2.25-2.25H5.25a2.25 2.25 0 01-2.25-2.25v0A2.25 2.25 0 015.25 4.5h9" />
        </svg>
      );
    case "emi":
      return (
        <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return (
        <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12V16.5zm9-4.5a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

// `method` is the raw Razorpay method (upi/card/...) or null when it isn't
// known yet (payment still pending/failed, or paid before this column
// existed). `isCod` adds a small tag noting only the 5% confirmation
// charge went through this method — the rest is cash on delivery, not a
// second payment method.
export default function PaymentMethodBadge({ method, isCod }: { method: string | null; isCod?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
        <MethodIcon method={method} />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-gray-800 truncate">{method ? METHOD_LABELS[method] ?? method : "—"}</p>
        {isCod && <p className="text-[10px] text-orange-600 font-semibold leading-tight">COD confirmation</p>}
      </div>
    </div>
  );
}

export { METHOD_LABELS };