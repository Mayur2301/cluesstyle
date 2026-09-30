// PATH: app/admin/(protected)/_components/format.ts
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDayLabel(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// "17 Sept, 11:24 AM" — used wherever both date and time matter (recent
// orders lists), as opposed to formatDate()'s date-only "17 Sept 2026".
export function formatDateTime(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const datePart = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const timePart = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${datePart}, ${timePart}`;
}

export const PAYMENT_STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-50 text-green-700 border-green-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  failed: "bg-red-50 text-red-700 border-red-100",
};

export const ORDER_STATUS_STYLES: Record<string, string> = {
  processing: "bg-blue-50 text-blue-700 border-blue-100",
  shipped: "bg-purple-50 text-purple-700 border-purple-100",
  delivered: "bg-green-50 text-green-700 border-green-100",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const DELIVERY_TYPE_STYLES: Record<string, string> = {
  standard: "bg-blue-50 text-blue-700 border-blue-100",
  sameday: "bg-orange-50 text-orange-700 border-orange-100",
  pickup: "bg-green-50 text-green-700 border-green-100",
};

export const DELIVERY_TYPE_LABELS: Record<string, string> = {
  standard: "Standard",
  sameday: "Same Day",
  pickup: "Self Pickup",
};