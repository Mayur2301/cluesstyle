// PATH: app/lib/return-orders.ts
//
// Return-request data access + eligibility rules. Depends on the
// `return_requests` table — run scripts/return_requests.sql against your
// database before using anything here.

import { randomBytes } from "crypto";
import { query } from "@/app/lib/db";
import { getOrderByRef, getOrdersByCartGroup, type OrderDetail } from "@/app/lib/admin-orders";

export const RETURN_REASONS = [
  { value: "wrong_product", label: "Wrong Product Received" },
  { value: "damaged", label: "Product Damaged" },
  { value: "size_issue", label: "Size Issue" },
  { value: "changed_mind", label: "Changed My Mind" },
  { value: "printing_issue", label: "Printing/Design Issue" },
  { value: "other", label: "Other" },
] as const;
export type ReturnReason = (typeof RETURN_REASONS)[number]["value"];

export function isValidReturnReason(value: unknown): value is ReturnReason {
  return typeof value === "string" && RETURN_REASONS.some((r) => r.value === value);
}

const RETURN_STATUSES = ["requested", "approved", "rejected", "picked_up", "refunded", "cancelled"] as const;
export type ReturnStatus = (typeof RETURN_STATUSES)[number];

export function isValidReturnStatus(value: unknown): value is ReturnStatus {
  return typeof value === "string" && (RETURN_STATUSES as readonly string[]).includes(value);
}

// Return window, in days — matches the "Return request can be raised
// within 7 days of delivery" line in app/refund-policy.
export const RETURN_WINDOW_DAYS = 7;

export interface ReturnItem {
  order_ref: string;
  product_name: string;
  sku: string | null;
  quantity: number;
}

export interface ReturnRequestRow {
  id: number;
  return_ref: string;
  order_ref: string;
  cart_group_ref: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  items: ReturnItem[] | string; // native JSON column — usually pre-parsed, see parseReturnItems()
  reason: ReturnReason;
  reason_note: string | null;
  status: ReturnStatus;
  refund_amount: number | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

// Same reasoning as parseOrderCustomization() in admin-orders.ts — mysql2
// usually hands back a JSON column already parsed as an object/array, but
// some driver paths still return the raw string, so handle both.
export function parseReturnItems(raw: ReturnItem[] | string): ReturnItem[] {
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizePhoneLast10(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  return digits.slice(-10);
}

export function generateReturnRef(): string {
  return `RET-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export interface ReturnEligibilityResult {
  eligible: boolean;
  /** Human-readable reason shown to the customer when `eligible` is false. */
  reason?: string;
  order?: OrderDetail;
  /** Every order row sharing this order's cart_group_ref (or just [order] if it's a single-item order). */
  siblingItems?: OrderDetail[];
}

/**
 * Looks up an order by ref + phone (same "you need to know both" gate as
 * track-order) and checks whether it's currently eligible for a return
 * request: must be delivered, must be within RETURN_WINDOW_DAYS of
 * delivery, and must not already have an open return request against it.
 *
 * NOTE on the delivery-date check: the `orders` table doesn't have a
 * dedicated `delivered_at` timestamp — order_status is just flipped to
 * "delivered" via the admin panel, which also bumps `updated_at`. This
 * uses `updated_at` as a best-effort proxy for "when it was marked
 * delivered". That's only accurate as long as nothing else touches the
 * order after delivery (an admin note edit, a shipping-field tweak, etc.
 * would also bump updated_at and incorrectly extend the window). Add a
 * real `delivered_at` column (set once, only on the transition to
 * "delivered") if you need this to be exact.
 */
export async function checkReturnEligibility(
  orderRef: string,
  phone: string
): Promise<ReturnEligibilityResult> {
  const order = await getOrderByRef(orderRef);
  if (!order) {
    return { eligible: false, reason: "We couldn't find an order with that Order ID and phone number." };
  }

  const last10OnOrder = normalizePhoneLast10(order.customer_phone || "");
  const last10Entered = normalizePhoneLast10(phone);
  if (!last10OnOrder || last10OnOrder !== last10Entered) {
    return { eligible: false, reason: "We couldn't find an order with that Order ID and phone number." };
  }

  if (order.order_status === "cancelled") {
    return { eligible: false, reason: "This order was cancelled, so it isn't eligible for a return.", order };
  }

  if (order.order_status !== "delivered") {
    return {
      eligible: false,
      reason: "This order hasn't been marked as delivered yet — returns can only be raised after delivery.",
      order,
    };
  }

  const deliveredAt = new Date(order.updated_at);
  const daysSinceDelivered = (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceDelivered > RETURN_WINDOW_DAYS) {
    return {
      eligible: false,
      reason: `The ${RETURN_WINDOW_DAYS}-day return window for this order has passed.`,
      order,
    };
  }

  const openReturns = await query<{ id: number }[]>(
    `SELECT id FROM return_requests WHERE order_ref = ? AND status NOT IN ('rejected', 'cancelled') LIMIT 1`,
    [orderRef]
  );
  if (openReturns.length > 0) {
    return {
      eligible: false,
      reason: "A return request has already been raised for this order.",
      order,
    };
  }

  const siblingItems = order.cart_group_ref
    ? await getOrdersByCartGroup(order.cart_group_ref)
    : [order];

  return { eligible: true, order, siblingItems: siblingItems.length ? siblingItems : [order] };
}

export interface CreateReturnRequestInput {
  order_ref: string;
  cart_group_ref: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  items: ReturnItem[];
  reason: ReturnReason;
  reason_note: string | null;
}

export async function createReturnRequest(input: CreateReturnRequestInput): Promise<string> {
  const returnRef = generateReturnRef();
  await query(
    `INSERT INTO return_requests
       (return_ref, order_ref, cart_group_ref, customer_name, customer_phone, customer_email, items, reason, reason_note, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested')`,
    [
      returnRef,
      input.order_ref,
      input.cart_group_ref,
      input.customer_name,
      input.customer_phone,
      input.customer_email,
      JSON.stringify(input.items),
      input.reason,
      input.reason_note,
    ]
  );
  return returnRef;
}

export async function getReturnByRef(returnRef: string): Promise<ReturnRequestRow | null> {
  const rows = await query<ReturnRequestRow[]>(
    `SELECT * FROM return_requests WHERE return_ref = ? LIMIT 1`,
    [returnRef]
  );
  return rows[0] ?? null;
}

export async function listReturnRequests(limit = 100): Promise<ReturnRequestRow[]> {
  // mysql2's execute() (prepared statements) rejects a placeholder in the
  // LIMIT clause on some MySQL/MariaDB builds — "Incorrect arguments to
  // mysqld_stmt_execute". LIMIT must be inlined as a plain integer instead
  // of bound as `?`. Safe here since `limit` isn't user input, but we still
  // validate/coerce it before it reaches the SQL string.
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 100;
  return query<ReturnRequestRow[]>(
    `SELECT * FROM return_requests ORDER BY created_at DESC LIMIT ${safeLimit}`
  );
}
