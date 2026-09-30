/**
 * lib/invoice.ts
 *
 * Generates a formal invoice PNG (via Python/Pillow) and uploads it to
 * this project's own upload endpoint at webhook.cluesstyle.com
 * (api/upload-invoice.php) — a standalone script separate from the
 * WhatsApp media system (media.php), authenticated with a shared API
 * key rather than a browser session.
 *
 * Call this from your payment-verification route once the Razorpay
 * signature is confirmed and the order is marked "paid" in the DB.
 *
 * Requirements:
 *   - Python 3 + Pillow installed on the server
 *   - DejaVu Sans fonts at /usr/share/fonts/truetype/dejavu/
 *   - scripts/generate_invoice.py present in the project root
 *   - INVOICE_UPLOAD_KEY env var matching the webhook server's config.php
 */

import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";
import FormData from "form-data";

const execFileAsync = promisify(execFile);

// ── Types ────────────────────────────────────────────────────────────────────

export interface InvoiceData {
  orderRef: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;

  productName: string;
  selectedSize?: string | null;
  selectedColor?: string | null;
  quantity: number;

  pricePerUnit: number;
  sameDayCharge: number;
  grandTotal: number;

  customer: {
    name: string;
    phone: string;
    email?: string | null;
  };
  address: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
  };

  // ── Optional — all have sensible fallbacks in generate_invoice.py, so an
  // existing caller that doesn't pass these still renders a correct invoice;
  // fill them in for the exact look of the new template.
  /** Product photo URL for the item-row thumbnail — generate_invoice.py downloads it. */
  productImage?: string;
  productSku?: string;
  deliveryType?: "standard" | "sameday" | "pickup";
  /** Flat (not per-unit) embroidery/DTF charge, same figures computeEmbroideryCharge()/computeDtfCharge() produce elsewhere — shown as its own line under the product and folded into the item/subtotal math. At most one of these is ever non-zero. */
  embroideryCharge?: number;
  dtfCharge?: number;
  /**
   * "cod" vs "prepaid" — orders.payment_mode. For COD, Razorpay only ever
   * collects a small advance (orders.advance_amount, currently 5% of
   * grandTotal); the rest (orders.cod_due_amount) is collected in cash on
   * delivery and was NEVER actually paid online. Without this, the invoice
   * showed grandTotal as "Total Paid" for COD orders too, which is wrong —
   * it overstates what was actually charged. Omit for prepaid orders (or
   * pass "prepaid") to keep the old single "Total Paid" = grandTotal line.
   */
  paymentMode?: "cod" | "prepaid";
  /** What was actually captured by Razorpay right now — the COD advance for a "cod" order, or the same value as grandTotal for a "prepaid" one. */
  advanceAmountPaid?: number;
  /** Remaining balance to be collected in cash at delivery — 0 for prepaid orders. */
  codDueAmount?: number;
  /** Pre-formatted label, e.g. "Same-day (confirmed on call)" — overrides the plain default derived from deliveryType. */
  deliveryLabel?: string;
  /** Pre-formatted display strings — pass these so the invoice shows the SAME
   * date/time the order actually happened, in the customer's expected format,
   * rather than "now" (the script's fallback if these are omitted). */
  orderDate?: string;
  paymentDate?: string;
  /** e.g. "Payment Confirmed", "Refunded" — defaults to "Payment Confirmed". */
  orderStatus?: string;
  /** e.g. "Razorpay (Card)", "Razorpay (UPI)", "Cash on Delivery". */
  paymentMethod?: string;
  /** GST percentage actually charged — defaults to 5, matching the rest of the app (create-razorpay-order/create-cart-order). Do NOT pass 18 unless the real rate changes. */
  gstPercent?: number;
  /** Pre-computed GST amount — if omitted, the script computes it as gstPercent% of (subtotal + sameDayCharge), same formula used elsewhere. */
  gstAmount?: number;
  /** Overrides the default support contact info baked into the script (company-info.ts's phone by default). */
  supportPhone?: string;
  supportEmail?: string;
  supportHours?: string;
  /** URL the footer QR code encodes — defaults to https://cluesstyle.com. */
  qrUrl?: string;
}

export interface InvoiceUploadResult {
  /** Public URL returned by the upload endpoint */
  invoiceUrl: string;
  /** Local tmp path (already deleted after upload) */
  localPath: string;
}

// Every product catalog file (office-bag-collection.ts, t-shirts.ts, ...)
// stores `images` as SITE-RELATIVE paths, e.g.
// "/office-bag/blue-office-bag/blue-office-bag-front.webp" — correct for
// Next.js's <Image>, but meaningless to generate_invoice.py's Python
// urllib fetch, which needs a real absolute URL. Resolve it here, once,
// so both verify-razorpay-payment and verify-cart-payment stay in sync
// instead of each re-implementing this.
export function toAbsoluteProductImageUrl(path: string | undefined | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `https://cluesstyle.com${path.startsWith("/") ? path : `/${path}`}`;
}

// ── Constants ────────────────────────────────────────────────────────────────

const PYTHON_SCRIPT = path.join(
  process.cwd(),
  "scripts",
  "generate_invoice.py"
);

// A dedicated, standalone endpoint (api/upload-invoice.php on the webhook
// server) — NOT the same as the old /uploads/ path, which is blocked
// entirely for direct access and was never a working upload target in the
// first place. This is a separate script with its own auth (shared API
// key below) and its own storage folder, fully independent of the
// WhatsApp media system on the same domain.
const UPLOAD_ENDPOINT = "https://webhook.cluesstyle.com/api/upload-invoice.php";

// Shared secret with api/upload-invoice.php's INVOICE_UPLOAD_KEY — set this
// in your .env / hosting environment. Throwing early with a clear message
// beats a confusing 401 from the remote server if it's ever left unset.
const INVOICE_UPLOAD_KEY = process.env.INVOICE_UPLOAD_KEY;

// ── Core ─────────────────────────────────────────────────────────────────────

/**
 * Generates a formal invoice PNG from `data` and uploads it to the
 * standalone invoice upload endpoint. Returns the public URL of the
 * uploaded file.
 *
 * Throws on any error so the caller can decide how to handle it
 * (e.g. log and continue, or surface to the client).
 */
export async function generateAndUploadInvoice(
  data: InvoiceData
): Promise<InvoiceUploadResult> {
  if (!INVOICE_UPLOAD_KEY) {
    throw new Error(
      "INVOICE_UPLOAD_KEY is not set — cannot authenticate with the invoice upload endpoint."
    );
  }

  // 1. Write PNG to a temp file ─────────────────────────────────────────────
  const tmpDir   = os.tmpdir();
  const filename = `invoice_${data.orderRef}_${Date.now()}.png`;
  const localPath = path.join(tmpDir, filename);

  const jsonArg = JSON.stringify(data);

  // Which Python command actually works differs by platform:
  //   - Most modern Linux servers (Ubuntu 20.04+/Debian, incl. typical
  //     aaPanel/BT-Panel hosting) only ship `python3` — plain `python`
  //     doesn't exist (spawn ENOENT).
  //   - Windows is the opposite: the official python.org installer only
  //     ever creates a `python.exe` command, never `python3.exe`. Any
  //     `python3` found on a Windows PATH is just the built-in Microsoft
  //     Store stub, which runs "successfully" (no ENOENT) but only prints
  //     an install nag and exits non-zero — a normal command failure, not
  //     a missing-binary error.
  // So don't special-case ENOENT: try python3 first (the common Linux
  // case) and fall back to python on ANY failure, keeping whichever
  // error is more informative if both fail.
  let stdout: string, stderr: string;
  try {
    ({ stdout, stderr } = await execFileAsync(
      "python3",
      [PYTHON_SCRIPT, jsonArg, localPath],
      { timeout: 20_000 }           // 20 s — generous for first-run font cache
    ));
  } catch (python3Err: any) {
    try {
      ({ stdout, stderr } = await execFileAsync(
        "python",
        [PYTHON_SCRIPT, jsonArg, localPath],
        { timeout: 20_000 }
      ));
    } catch (pythonErr: any) {
      throw new Error(
        `Could not run invoice script with either "python3" or "python". ` +
        `python3: ${python3Err?.message ?? python3Err} | python: ${pythonErr?.message ?? pythonErr}`
      );
    }
  }

  // Confirm the PNG was actually produced BEFORE deciding whether stderr
  // means anything failed. generate_invoice.py intentionally writes
  // non-fatal diagnostics to stderr for things it already recovered from
  // on its own — e.g. "[invoice] Could not fetch productImage ...: HTTP
  // Error 404" when a product photo 404s, which it handles by falling
  // back to a blank thumbnail and still finishing the invoice. Treating
  // ANY stderr output as fatal (the old behaviour) meant a single missing
  // product image aborted the WHOLE invoice — no invoice, no WhatsApp
  // send — over something the script had already worked around. The file
  // existing is the real signal of success; stderr is only used for the
  // error message when it's actually missing.
  let fileExists = true;
  try {
    await fs.access(localPath);
  } catch {
    fileExists = false;
  }

  if (!fileExists) {
    const reason = stderr?.trim() || "no output file was produced and no error was reported on stderr";
    throw new Error(`Invoice generation error: ${reason}`);
  }

  if (stderr) {
    // Pillow may emit deprecation warnings, and generate_invoice.py may
    // emit its own "[invoice] ..." recovery diagnostics (e.g. a product
    // image that failed to fetch) — neither means generation failed, so
    // just log them for visibility instead of throwing.
    const lines = stderr.trim().split("\n").filter(
      (l) => !l.toLowerCase().includes("deprecationwarning") &&
             !l.toLowerCase().includes("warning")
    );
    if (lines.length > 0) {
      console.warn(`[Invoice] Non-fatal diagnostics from generate_invoice.py: ${lines.join(" | ")}`);
    }
  }

  // 2. Upload to the standalone invoice endpoint ─────────────────────────────
  const fileBuffer = await fs.readFile(localPath);

  const form = new FormData();
  form.append("file", fileBuffer, {
    filename,
    contentType: "image/png",
  });
  // Used server-side only to make the stored filename traceable — the
  // actual "access control" on the read side is the random token
  // upload-invoice.php appends, not this value.
  form.append("orderRef", data.orderRef);

  const uploadRes = await fetch(UPLOAD_ENDPOINT, {
    method: "POST",
    headers: {
      ...form.getHeaders(),
      "X-Upload-Key": INVOICE_UPLOAD_KEY,
    },
    // @ts-ignore — Node 18 fetch accepts Buffer-backed FormData via .getBuffer()
    body: form.getBuffer(),
  });

  // Clean up local tmp file regardless of upload outcome
  await fs.unlink(localPath).catch(() => null);

  if (!uploadRes.ok) {
    const body = await uploadRes.text().catch(() => "");
    throw new Error(
      `Invoice upload failed (${uploadRes.status}): ${body}`
    );
  }

  // 3. Parse the URL from upload-invoice.php's response ──────────────────────
  //    Always returns { url: "https://..." } on success — see the PHP script.
  let invoiceUrl: string;
  try {
    const json = (await uploadRes.json()) as any;
    invoiceUrl = json?.url ?? "";

    if (!invoiceUrl) {
      throw new Error("No URL field found in upload response");
    }
  } catch (e: any) {
    throw new Error(`Failed to parse upload response: ${e.message}`);
  }

  return { invoiceUrl, localPath };
}