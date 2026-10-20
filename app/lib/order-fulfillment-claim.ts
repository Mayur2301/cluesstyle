// app/lib/order-fulfillment-claim.ts
//
// Post-payment work (invoice, confirmation email, WhatsApp, courier booking)
// must run exactly once per Razorpay payment. It can be started by the
// customer's browser (verify-razorpay-payment / verify-cart-payment) or by
// Razorpay's webhook, whichever arrives first - so "who flipped
// payment_status to paid" is the wrong test (if the webhook wins, the browser
// call would skip everything and no email goes out). Instead each starter
// atomically claims the order by stamping `fulfilled_at`; only the one whose
// UPDATE actually changed a row gets to run the work.
import type { Pool } from "mysql2/promise";

/**
 * Returns true if THIS caller should run the post-payment work.
 *
 * @param legacyDecision what the old "did my UPDATE mark it paid" test said.
 *   Used only if the `fulfilled_at` column hasn't been added to this database
 *   yet (see scripts/add-orders-fulfilled-at.sql), so the site keeps working
 *   exactly as before until the migration is run.
 */
export async function claimFulfillment(
  pool: Pool,
  razorpayOrderId: string,
  legacyDecision: boolean
): Promise<boolean> {
  try {
    const [result]: any = await pool.execute(
      `UPDATE orders
          SET fulfilled_at = NOW()
        WHERE razorpay_order_id = ? AND payment_status = 'paid' AND fulfilled_at IS NULL`,
      [razorpayOrderId]
    );
    return result.affectedRows > 0;
  } catch (err: any) {
    if (err?.code === "ER_BAD_FIELD_ERROR") {
      console.warn("[fulfillment] orders.fulfilled_at is missing - run scripts/add-orders-fulfilled-at.sql. Using legacy behaviour.");
      return legacyDecision;
    }
    throw err;
  }
}

/** True if the order has been paid but its post-payment work never started. */
export async function needsFulfillment(pool: Pool, razorpayOrderId: string): Promise<{ needed: boolean; isCart: boolean }> {
  try {
    const [rows]: any = await pool.execute(
      `SELECT cart_group_ref FROM orders
        WHERE razorpay_order_id = ? AND payment_status = 'paid' AND fulfilled_at IS NULL LIMIT 1`,
      [razorpayOrderId]
    );
    if (!rows.length) return { needed: false, isCart: false };
    return { needed: true, isCart: !!rows[0].cart_group_ref };
  } catch (err: any) {
    if (err?.code === "ER_BAD_FIELD_ERROR") return { needed: false, isCart: false };
    throw err;
  }
}
