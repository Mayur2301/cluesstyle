// lib/razorpay.ts

import Razorpay from "razorpay";
import crypto from "crypto";

const RAZORPAY_BASE = "https://api.razorpay.com/v1";

/* -------------------------------------------------------------------------- */
/*                               Razorpay SDK                                 */
/* -------------------------------------------------------------------------- */

export const razorpayInstance = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/* -------------------------------------------------------------------------- */
/*                                  Types                                     */
/* -------------------------------------------------------------------------- */

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/* -------------------------------------------------------------------------- */
/*                             Helper Functions                               */
/* -------------------------------------------------------------------------- */

function authHeader(): string {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured on the server");
  }

  return (
    "Basic " +
    Buffer.from(`${keyId}:${keySecret}`).toString("base64")
  );
}

/* -------------------------------------------------------------------------- */
/*                           Create Order (Fetch API)                         */
/* -------------------------------------------------------------------------- */

export async function createRazorpayOrder(params: {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const res = await fetch(`${RAZORPAY_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Razorpay order creation failed: ${errorText}`
    );
  }

  return res.json();
}

/* -------------------------------------------------------------------------- */
/*                          Create Order (SDK Method)                         */
/* -------------------------------------------------------------------------- */

export async function createOrderWithSDK(params: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  return (await razorpayInstance.orders.create(
    params
  )) as RazorpayOrder;
}

/* -------------------------------------------------------------------------- */
/*                        Verify Payment Signature                            */
/* -------------------------------------------------------------------------- */

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured");
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(signature || "");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  );
}

/* -------------------------------------------------------------------------- */
/*                        Verify Webhook Signature                            */
/* -------------------------------------------------------------------------- */

export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error(
      "RAZORPAY_WEBHOOK_SECRET is not configured"
    );
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(signature || "");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  );
}