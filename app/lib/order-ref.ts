// PATH: app/lib/order-ref.ts
import { query } from "@/app/lib/db";

const MAX_ATTEMPTS = 20;

export async function generateOrderRef(): Promise<string> {
  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    const ref = `CS-${year}${randomPart}`;

    const existing = await query<{ id: number }[]>(
      `SELECT id FROM orders WHERE order_ref = ? LIMIT 1`,
      [ref]
    );
    if (existing.length === 0) return ref;
  }

  throw new Error("Could not generate a unique order ref — too many collisions.");
}

// Cart-checkout groups several `orders` rows (one per cart item) under one
// payment — cart_group_ref is what links them, separate from each row's own
// order_ref. Same "CS<year><4-digit>" idea, but with a "G" (group) marker
// right after the year so it reads as a distinct kind of reference at a
// glance instead of looking like a regular order number, e.g. "CSG-20261234".
export async function generateCartGroupRef(): Promise<string> {
  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    const ref = `CS-${year}${randomPart}`;

    const existing = await query<{ id: number }[]>(
      `SELECT id FROM orders WHERE cart_group_ref = ? LIMIT 1`,
      [ref]
    );
    if (existing.length === 0) return ref;
  }

  throw new Error("Could not generate a unique cart group ref — too many collisions.");
}