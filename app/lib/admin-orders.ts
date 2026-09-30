// PATH: app/lib/admin-orders.ts
// PATH: app/lib/admin-orders.ts
import { query } from "@/app/lib/db";

export interface OrderDetail {
  id: number;
  order_ref: string;
  // Set on cart-checkout orders (app/api/create-cart-order/route.ts) — all
  // line items paid for in the same checkout share this value, so it's
  // used to find sibling items (e.g. for returns). NULL for single-item
  // "Buy Now" orders.
  cart_group_ref: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  payment_status: "pending" | "paid" | "failed";

  product_id: string;
  product_name: string;
  product_slug: string;
  product_sku: string | null;
  color_sku: string | null;
  product_url: string;

  quantity: number | null;
  selected_size: string | null;
  selected_color: string | null;
  delivery_type: "standard" | "sameday" | "pickup";

  price_per_unit: string;
  same_day_charge: string;
  gst_amount: string;
  grand_total: string;

  // "cod" orders only had 5% charged via Razorpay (advance_amount) —
  // cod_due_amount is the balance still to collect in cash on delivery.
  payment_mode: "prepaid" | "cod";
  // The actual Razorpay method used (upi/card/netbanking/wallet/emi/...),
  // fetched from Razorpay after signature verification — see
  // verify-razorpay-payment/route.ts. NULL for orders paid before this
  // column existed, or if Razorpay's API call failed at payment time.
  payment_method: string | null;
  advance_amount: number;
  cod_due_amount: number;

  customer_name: string;
  customer_phone: string;
  customer_email: string | null;

  address_line1: string;
  address_line2: string | null;
  address_city: string;
  address_state: string;
  address_pincode: string;

  customization: string | null; // raw JSON string from the DB

  created_at: string;
  updated_at: string;
  order_status: "processing" | "shipped" | "delivered" | "cancelled";
  invoice_url: string | null;
  design_pdf_url: string | null;
  // Set whenever design-PDF generation is skipped or throws, so the admin
  // sees WHY (no blank garment photos matched, generation error, etc.)
  // instead of just a generic "hasn't been generated yet". Cleared back to
  // NULL whenever generation succeeds.
  design_pdf_error: string | null;
  admin_note: string | null;

  // Manually entered by admin — separate from the automated
  // Shiprocket/Delhivery API integrations (used e.g. for couriers not
  // wired up yet, like Tirupati or DTDC, or self-pickup/manual dispatch).
  shipping_provider: string | null;
  tracking_link: string | null;
  awb_number: string | null;
}

// Shared with ShippingDetailsControl.tsx (a client component, so it can't
// import this file directly — admin-orders.ts pulls in the raw DB pool at
// module scope, which isn't safe to bundle into client code). Keep both
// copies in sync if this list changes.
export const SHIPPING_PROVIDERS = [
  { value: "shiprocket", label: "Shiprocket" },
  { value: "tirupati", label: "Tirupati Courier" },
  { value: "delhivery", label: "Delhivery" },
  { value: "dtdc", label: "DTDC" },
  { value: "other", label: "Other" },
] as const;

export function isValidShippingProvider(value: unknown): value is string {
  return typeof value === "string" && SHIPPING_PROVIDERS.some((p) => p.value === value);
}

export async function getOrderByRef(orderRef: string): Promise<OrderDetail | null> {
  const rows = await query<OrderDetail[]>(
    `SELECT * FROM orders WHERE order_ref = ? LIMIT 1`,
    [orderRef]
  );
  return rows[0] ?? null;
}

// All order rows sharing a cart_group_ref — i.e. every line item from the
// same cart checkout as `orderRef` (including `orderRef` itself). Used by
// the return-order flow's "Select Items to Return" step so a multi-item
// cart order can be returned as one request instead of forcing a separate
// return per line item.
export async function getOrdersByCartGroup(cartGroupRef: string): Promise<OrderDetail[]> {
  return query<OrderDetail[]>(
    `SELECT * FROM orders WHERE cart_group_ref = ? ORDER BY id ASC`,
    [cartGroupRef]
  );
}

const VALID_ORDER_STATUSES = ["processing", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof VALID_ORDER_STATUSES)[number];

export function isValidOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (VALID_ORDER_STATUSES as readonly string[]).includes(value);
}

// `customization` is a native MySQL JSON column, so mysql2 already returns
// it pre-parsed as a plain JS object on most rows — NOT a string. Only a
// raw string needs JSON.parse() here (some driver/config paths still hand
// back the raw text). Calling JSON.parse() unconditionally on an
// already-parsed object silently throws and this used to swallow it and
// return null — which is why the whole "Product Customization" card (logo
// files, size breakdown, notes, etc.) never rendered on the admin order
// page even when the column clearly had data. Mirrors the equivalent
// parseCustomization() in verify-razorpay-payment/route.ts.
export function parseOrderCustomization(raw: string | Record<string, any> | null): Record<string, any> | null {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}