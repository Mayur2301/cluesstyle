import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Deliberately its own env var — NOT process.env.NEXT_PUBLIC_APP_URL — since
// that one has pointed at a staging domain before (see app/sitemap.ts's
// history) and an email that goes out to real customers must never link
// back to a preview/staging URL by accident. SITE_ORIGIN is opt-in: set it
// in your .env to your current testing subdomain (e.g.
// "https://test.cluesstyle.com", no trailing slash) while you're testing —
// every link and image in this email is anchored here — then remove it (or
// point it at the real domain) before this goes live for real customers.
const SITE_URL = process.env.SITE_ORIGIN || "https://cluesstyle.com";

export interface InvoiceData {
  orderRef:          string;
  customerName:      string;
  customerEmail:     string;
  customerPhone:     string;
  productName:       string;
  productSlug:       string;
  productUrl:        string;
  productImageUrl?:  string; // real product image URL
  quantity:          number;
  selectedSize:      string | null;
  selectedColor:     string | null;
  deliveryType:      "standard" | "sameday";
  pricePerUnit:      number;
  sameDayCharge:     number;
  grandTotal:        number;
  addressLine1:      string;
  addressLine2:      string;
  addressCity:       string;
  addressState:      string;
  addressPincode:    string;
  razorpayPaymentId: string;
  createdAt:         string; // ISO string

  // ── Optional — all have sensible fallbacks below, matching the same
  // fields already used for the PDF invoice (app/lib/invoice.ts), so both
  // documents agree with each other instead of drifting apart.
  /** e.g. "Razorpay", "Razorpay (Advance) + Cash on Delivery". Defaults to "Razorpay". */
  paymentMethod?: string;
  /** Defaults to 5, matching the real site-wide rate (not the 18% placeholder the reference design screenshot showed). */
  gstPercent?: number;
  /** Flat (not per-unit) embroidery/DTF charge — at most one is ever non-zero. */
  embroideryCharge?: number;
  dtfCharge?: number;
  /** "cod" vs "prepaid" — see invoice.ts's matching field for the full explanation of why this changes the totals box. */
  paymentMode?: "cod" | "prepaid";
  advanceAmountPaid?: number;
  codDueAmount?: number;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function orderedOn(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/** "17 Sep 2026, 9:28 PM" — used under the "Order Confirmed" tracker step. */
function orderedOnWithTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${date}, ${time}`;
}

/** "17 September 2026 at 9:28 PM" — used for "Placed on" next to the order number. */
function placedOnFull(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${date} at ${time}`;
}

function expectedDelivery(iso: string, type: "standard" | "sameday"): string {
  if (type === "sameday") return "Today by 8 PM";
  const d = new Date(iso);
  const from = new Date(d); from.setDate(d.getDate() + 5);
  const to   = new Date(d); to.setDate(d.getDate() + 7);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${from.toLocaleDateString("en-IN", opts)} – ${to.toLocaleDateString("en-IN", opts)}`;
}

function buildInvoiceHtml(d: InvoiceData): string {
  const productTotal = d.pricePerUnit * d.quantity;
  const delivery      = expectedDelivery(d.createdAt, d.deliveryType);
  const ordered        = orderedOn(d.createdAt);
  const orderedFull    = orderedOnWithTime(d.createdAt);
  const placedFull      = placedOnFull(d.createdAt);
  const firstName      = d.customerName.trim().split(/\s+/)[0] || d.customerName;

  const orderUrl = `${SITE_URL}/dashboard/user/order/${d.orderRef}`;
  const trackUrl = `${SITE_URL}/track-order`;

  // See app/lib/invoice.ts's toAbsoluteProductImageUrl for the same
  // reasoning — catalog images are already absolute by the time they reach
  // here (the caller resolves them), so this is just "use it if present."
  const imgSrc = d.productImageUrl ?? null;

  const variantLine = [
    d.selectedSize  ? `Size: <strong>${d.selectedSize}</strong>`   : "",
    d.selectedColor ? `Color: <strong>${d.selectedColor}</strong>` : "",
  ].filter(Boolean).join(" &nbsp;|&nbsp; ");

  // Shared height for the Shipping Address card and the Estimated Delivery
  // card beneath it in the opposite column, so the two bottom cards line up
  // instead of Estimated Delivery looking like a short leftover banner.
  // Base fits name + title row + 2 address lines + phone; +23px per extra
  // address line (line-height:1.75 at 13px ≈ 23px) when addressLine2 is set.
  const SHIP_CARD_HEIGHT = 176 + (d.addressLine2 ? 23 : 0);

  const gstPct = d.gstPercent ?? 5;
  const embroideryCharge = d.embroideryCharge ?? 0;
  const dtfCharge = d.dtfCharge ?? 0;
  const isCod = d.paymentMode === "cod";
  const codDue = isCod ? (d.codDueAmount ?? 0) : 0;
  const advancePaid = d.advanceAmountPaid ?? d.grandTotal;
  const paymentMethod = d.paymentMethod ?? "Razorpay";

  const pricingRows: { label: string; value: string }[] = [
    { label: "Subtotal", value: fmt(productTotal) },
    ...(d.sameDayCharge > 0 ? [{ label: "Same-day delivery", value: fmt(d.sameDayCharge) }] : []),
    ...(embroideryCharge > 0 ? [{ label: "Embroidery charge", value: fmt(embroideryCharge) }] : []),
    ...(dtfCharge > 0 ? [{ label: "DTF print charge", value: fmt(dtfCharge) }] : []),
    { label: "Shipping", value: "Free" },
    { label: `GST (${gstPct}%)`, value: "Included" },
  ];

  // ── Order-progress tracker (4 steps) ───────────────────────────────────
  // This email is always sent the moment payment is confirmed, so "Order
  // Confirmed" is always the only completed step — "Ready to Ship" /
  // "Shipped" / "Delivered" are always still ahead. If a later shipping
  // update starts sending its own email, that one can advance which step
  // is marked done; nothing here needs to change for that.
  type Step = { icon: string; label: string; sub: string; done: boolean };
  const steps: Step[] = [
    { icon: "&#10003;", label: "Order Confirmed", sub: orderedFull, done: true },
    { icon: "&#128230;", label: "Ready to Ship", sub: "Soon", done: false },
    { icon: "&#128666;", label: "Shipped", sub: "Soon", done: false },
    { icon: "&#127968;", label: "Delivered", sub: `${delivery} (Estimated)`, done: false },
  ];

  const dotsRow = steps.map(s => `
        <td width="25%" align="center" valign="top">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td width="36" height="36" align="center" valign="middle" style="width:36px;height:36px;border-radius:18px;background-color:${s.done ? "#16a34a" : "#ffffff"};border:${s.done ? "0" : "2px solid #d1d5db"};color:${s.done ? "#ffffff" : "#9ca3af"};font-size:16px;font-family:Arial,Helvetica,sans-serif;line-height:${s.done ? "36px" : "32px"};">${s.icon}</td>
          </tr></table>
        </td>`).join("");

  const barsRow = steps.slice(0, 3).map((s) => `
        <td width="25%" style="padding:6px 4px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td height="4" style="height:4px;line-height:4px;font-size:0;background-color:${s.done ? "#16a34a" : "#e5e7eb"};border-radius:2px;">&nbsp;</td>
          </tr></table>
        </td>`).join("") + `<td width="25%" style="padding:6px 4px 0;"></td>`;

  const labelsRow = steps.map(s => `
        <td width="25%" align="center" style="padding-top:10px;font-size:12px;font-weight:600;color:${s.done ? "#111827" : "#9ca3af"};font-family:Arial,Helvetica,sans-serif;">${s.label}</td>`).join("");

  const subsRow = steps.map(s => `
        <td width="25%" align="center" style="padding-top:2px;font-size:11px;color:#9ca3af;font-family:Arial,Helvetica,sans-serif;">${s.sub}</td>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Order Confirmed – ${d.orderRef} | CluesStyle</title>
<style>
  body { margin:0; padding:0; background:#f3f4f6; font-family:Arial,Helvetica,sans-serif; color:#111; }
  .wrap { max-width:680px; margin:0 auto; background:#fff; }
  .card { border:1px solid #e5e7eb; border-radius:12px; }
  .label { margin:0 0 12px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#6b7280; }
  .ptable { width:100%; border-collapse:collapse; font-size:13px; }
  .ptable td { padding:4px 0; }
  .ptable .total td { padding-top:10px; border-top:1px solid #e5e7eb; font-size:14px; font-weight:700; color:#111; }
  a { color:inherit; }
</style>
</head>
<body>
<div class="wrap">

  <!-- Header -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-bottom:1px solid #f0f0f0;">
    <tr>
      <td style="padding:22px 40px 4px;" align="left" valign="middle">
        <img src="${SITE_URL}/cluesstyle-logo.webp" alt="CluesStyle" width="140" style="display:block;border:0;">
      </td>
      <td style="padding:22px 40px 4px;" align="right" valign="middle">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:.5px;color:#374151;font-family:Arial,Helvetica,sans-serif;">
          <a href="${SITE_URL}/products/apparels" style="color:#374151;text-decoration:none;">APPAREL</a>
          &nbsp;|&nbsp;<a href="${SITE_URL}/corporate-gifting" style="color:#374151;text-decoration:none;">CORPORATE GIFTING</a>
          &nbsp;|&nbsp;<a href="${SITE_URL}/products" style="color:#374151;text-decoration:none;">MERCHANDISE</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 18px;"></td>
      <td style="padding:0 40px 18px;" align="right">
        <p style="margin:0;font-size:12px;color:#9ca3af;font-style:italic;font-family:Arial,Helvetica,sans-serif;">Ideas Worn Better</p>
      </td>
    </tr>
  </table>

  <!-- Hero -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;">
    <tr>
      <td style="padding:40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>

          <td width="60%" valign="top">
            <span style="display:inline-block;background-color:#16a34a;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:.5px;padding:6px 14px;border-radius:20px;font-family:Arial,Helvetica,sans-serif;">&#10003; ORDER CONFIRMED</span>
            <h1 style="margin:16px 0 6px;font-size:26px;font-weight:800;color:#111827;font-family:Arial,Helvetica,sans-serif;">Thank you, ${firstName}!</h1>
            <p style="margin:0 0 10px;font-size:15px;font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">Your order has been confirmed.</p>
            <p style="margin:0 0 24px;font-size:14px;color:#4b5563;line-height:1.6;font-family:Arial,Helvetica,sans-serif;max-width:400px;">
              We've received your payment and your order is now being processed. We'll keep you updated on every step.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="padding-right:12px;">
                <a href="${orderUrl}" style="display:inline-block;background-color:#111827;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:13px 26px;border-radius:8px;font-family:Arial,Helvetica,sans-serif;">View Your Order &rarr;</a>
              </td>
              <td>
                <a href="${trackUrl}" style="display:inline-block;background-color:#ffffff;color:#111827;text-decoration:none;font-size:14px;font-weight:600;padding:12px 26px;border-radius:8px;border:1px solid #d1d5db;font-family:Arial,Helvetica,sans-serif;">Track Order</a>
              </td>
            </tr></table>
            <p style="margin:14px 0 0;font-size:12px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">You can also track your order anytime from your account.</p>
          </td>

          <!-- "Good Things Ahead!" side graphic — uses the real box.webp product
               photo (same asset already used on track-order/return-order) instead
               of an emoji stand-in. -->
          <td width="40%" valign="middle" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td align="center" style="padding-bottom:8px;">
                <span style="font-family:'Brush Script MT','Segoe Script',cursive;font-size:22px;color:#111827;">Good Things Ahead!</span>
              </td>
            </tr><tr>
              <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" style="background-color:#111827;border-radius:14px;"><tr>
                  <td style="padding:22px 26px;" align="center">
                    <img src="${SITE_URL}/box.webp" alt="Your CluesStyle order" width="120" style="display:block;border:0;border-radius:8px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;margin-top:10px;"><tr>
                      <td style="padding:6px 10px;" align="center">
                        <span style="font-size:10px;font-weight:700;color:#111827;font-family:Arial,Helvetica,sans-serif;">THANK YOU<br/>for being amazing!</span>
                      </td>
                    </tr></table>
                  </td>
                </tr></table>
              </td>
            </tr></table>
          </td>

        </tr></table>
      </td>
    </tr>
  </table>

  <!-- Order progress -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:32px 40px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
        <tr>
          <td align="left" style="font-size:15px;font-weight:700;color:#111827;font-family:Arial,Helvetica,sans-serif;">&#128230; Order Progress</td>
          <td align="right" style="font-size:12px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">
            Order No. <strong style="color:#111827;">${d.orderRef}</strong><br/>
            <span style="font-size:11px;">Placed on ${placedFull}</span>
          </td>
        </tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>${dotsRow}</tr>
        <tr>${barsRow}</tr>
        <tr>${labelsRow}</tr>
        <tr>${subsRow}</tr>
      </table>
    </td></tr>
  </table>

  <!-- Order details + Payment summary, each with its own second card
       (Shipping Address / Estimated Delivery) stacked directly beneath it
       in the SAME column, so both columns are the same width top-to-bottom. -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:0 40px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>

        <!-- LEFT column: Order Details, then Shipping Address -->
        <td width="50%" valign="top" style="padding-right:10px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="card"><tr><td style="padding:20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr>
              <td align="left" style="font-size:14px;font-weight:700;color:#111827;font-family:Arial,Helvetica,sans-serif;">&#128717; Order Details</td>
              <td align="right" style="font-size:11px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">1 Item</td>
            </tr></table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
              <td width="64" valign="top">
                ${imgSrc
                  ? `<img src="${imgSrc}" alt="${d.productName}" width="64" height="64" style="width:64px;height:64px;border-radius:8px;object-fit:cover;border:1px solid #e5e7eb;display:block;">`
                  : `<table role="presentation" width="64" height="64" cellpadding="0" cellspacing="0"><tr><td align="center" valign="middle" style="width:64px;height:64px;border-radius:8px;border:1px solid #e5e7eb;background-color:#f9fafb;font-size:22px;">&#128230;</td></tr></table>`}
              </td>
              <td valign="top" style="padding-left:14px;">
                <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">${d.productName}</p>
                ${variantLine ? `<p style="margin:0 0 3px;font-size:12px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">${variantLine}</p>` : ""}
                <p style="margin:0;font-size:12px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">Qty: <strong style="color:#111827;">${d.quantity}</strong></p>
              </td>
              <td valign="top" align="right" style="white-space:nowrap;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#111827;font-family:Arial,Helvetica,sans-serif;">${fmt(productTotal)}</p>
              </td>
            </tr></table>
          </td></tr></table>

          <!-- Shipping address — same width as Order Details above it. Also
               sets the shared CARD_HEIGHT (both the HTML height attribute,
               which Outlook respects, and CSS height, which everyone else
               does) so the Estimated Delivery card opposite it — usually
               much shorter on its own — renders at the exact same height
               instead of a mismatched short banner. -->
          <table role="presentation" width="100%" height="${SHIP_CARD_HEIGHT}" cellpadding="0" cellspacing="0" class="card" style="margin-top:12px;height:${SHIP_CARD_HEIGHT}px;"><tr><td style="padding:20px;" valign="top">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;"><tr>
              <td align="left" style="font-size:14px;font-weight:700;color:#111827;font-family:Arial,Helvetica,sans-serif;">&#128205; Shipping Address</td>
              <td align="right"><a href="${SITE_URL}/dashboard/user" style="font-size:12px;color:#16a34a;text-decoration:none;font-weight:600;font-family:Arial,Helvetica,sans-serif;">Edit</a></td>
            </tr></table>
            <p style="margin:0 0 3px;font-size:14px;font-weight:600;color:#111827;font-family:Arial,Helvetica,sans-serif;">${d.customerName}</p>
            <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.75;font-family:Arial,Helvetica,sans-serif;">
              ${d.addressLine1}${d.addressLine2 ? `,<br/>${d.addressLine2}` : ""}<br/>
              ${d.addressCity}, ${d.addressState} – ${d.addressPincode}<br/>
              India
            </p>
            <p style="margin:10px 0 0;font-size:13px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">&#128222; ${d.customerPhone}</p>
          </td></tr></table>
        </td>

        <!-- RIGHT column: Payment Summary, then Estimated Delivery -->
        <td width="50%" valign="top" style="padding-left:10px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="card"><tr><td style="padding:20px;">
            <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#111827;font-family:Arial,Helvetica,sans-serif;">&#128179; Payment Summary</p>
            <table class="ptable">
              <tbody>
                ${pricingRows.map(r => `
                <tr>
                  <td style="color:#6b7280;">${r.label}</td>
                  <td style="text-align:right;color:#111;font-weight:500;">${r.value}</td>
                </tr>`).join("")}
              </tbody>
              <tfoot>
                ${isCod && codDue ? `
                <tr class="total">
                  <td style="color:#16a34a;">Paid Now (Advance)</td>
                  <td style="text-align:right;color:#16a34a;">${fmt(advancePaid)}</td>
                </tr>
                <tr>
                  <td style="padding-top:6px;color:#ea580c;font-weight:700;font-size:13px;">Due on Delivery (COD)</td>
                  <td style="padding-top:6px;text-align:right;color:#ea580c;font-weight:700;font-size:13px;">${fmt(codDue)}</td>
                </tr>` : `
                <tr class="total">
                  <td style="color:#16a34a;">Total Paid</td>
                  <td style="text-align:right;color:#16a34a;">${fmt(d.grandTotal)}</td>
                </tr>`}
                <tr>
                  <td style="padding-top:10px;color:#9ca3af;font-size:11px;">Payment Method</td>
                  <td style="padding-top:10px;text-align:right;color:#6b7280;font-size:11px;">${paymentMethod}</td>
                </tr>
              </tfoot>
            </table>
          </td></tr></table>

          <!-- Estimated delivery — same width AND height as the Shipping
               Address card opposite it (SHIP_CARD_HEIGHT), content centered
               vertically since its own content is shorter than a full
               address block. -->
          <table role="presentation" width="100%" height="${SHIP_CARD_HEIGHT}" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:12px;margin-top:12px;height:${SHIP_CARD_HEIGHT}px;"><tr>
            <td style="padding:18px 20px;" valign="middle" height="${SHIP_CARD_HEIGHT}">
              <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                <td valign="top" style="font-size:20px;padding-right:12px;">&#128666;</td>
                <td valign="top">
                  <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#166534;font-family:Arial,Helvetica,sans-serif;">Estimated Delivery: ${delivery}</p>
                  <p style="margin:0;font-size:12px;color:#4d7c62;font-family:Arial,Helvetica,sans-serif;">Delivery times are estimated and may vary based on location.</p>
                </td>
              </tr></table>
            </td>
          </tr></table>
        </td>

      </tr></table>
    </td></tr>
  </table>

  <!-- Trust badges -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:0 40px 32px;border-top:1px solid #f0f0f0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding-top:24px;"><tr>
        <td width="25%" align="center" style="font-family:Arial,Helvetica,sans-serif;">
          <div style="font-size:20px;">&#9989;</div>
          <p style="margin:6px 0 0;font-size:12px;font-weight:600;color:#111827;">Secure Payments</p>
          <p style="margin:2px 0 0;font-size:10px;color:#9ca3af;">100% safe &amp; encrypted</p>
        </td>
        <td width="25%" align="center" style="font-family:Arial,Helvetica,sans-serif;">
          <div style="font-size:20px;">&#128257;</div>
          <p style="margin:6px 0 0;font-size:12px;font-weight:600;color:#111827;">Easy Returns</p>
          <p style="margin:2px 0 0;font-size:10px;color:#9ca3af;">15 days return policy</p>
        </td>
        <td width="25%" align="center" style="font-family:Arial,Helvetica,sans-serif;">
          <div style="font-size:20px;">&#128666;</div>
          <p style="margin:6px 0 0;font-size:12px;font-weight:600;color:#111827;">Pan India Delivery</p>
          <p style="margin:2px 0 0;font-size:10px;color:#9ca3af;">Fast &amp; reliable</p>
        </td>
        <td width="25%" align="center" style="font-family:Arial,Helvetica,sans-serif;">
          <div style="font-size:20px;">&#127911;</div>
          <p style="margin:6px 0 0;font-size:12px;font-weight:600;color:#111827;">Dedicated Support</p>
          <p style="margin:2px 0 0;font-size:10px;color:#9ca3af;">We're here to help</p>
        </td>
      </tr></table>
    </td></tr>
  </table>

  <!-- Thanks banner -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f3ff;">
    <tr><td style="padding:24px 40px;" align="center">
      <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#111827;font-family:Arial,Helvetica,sans-serif;">&#127873; Thanks for shopping with CluesStyle!</p>
      <p style="margin:0 0 14px;font-size:12px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;">Follow us for new arrivals, offers and inspiration.</p>
    </td></tr>
  </table>

  <!-- Footer -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111827;">
    <tr><td style="padding:36px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>

        <td width="34%" valign="top">
          <img src="${SITE_URL}/cluesstyle-white-logo.png" alt="CluesStyle" width="130" style="display:block;border:0;margin-bottom:10px;">
          <p style="margin:0 0 10px;font-size:10px;letter-spacing:1px;color:#9ca3af;font-family:Arial,Helvetica,sans-serif;">CUSTOMIZE &nbsp;|&nbsp; PRINT &nbsp;|&nbsp; BRAND &nbsp;|&nbsp; GIFT</p>
          <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Your one-stop destination for custom apparel, corporate gifts, print solutions and more.</p>
        </td>

        <td width="22%" valign="top" style="font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#ffffff;">Quick Links</p>
          <p style="margin:0 0 8px;font-size:12px;"><a href="${trackUrl}" style="color:#9ca3af;text-decoration:none;">Track Order</a></p>
          <p style="margin:0 0 8px;font-size:12px;"><a href="${SITE_URL}/return-order" style="color:#9ca3af;text-decoration:none;">Return Order</a></p>
          <p style="margin:0 0 8px;font-size:12px;"><a href="${SITE_URL}/contact-us" style="color:#9ca3af;text-decoration:none;">Help Center</a></p>
          <p style="margin:0;font-size:12px;"><a href="${SITE_URL}/contact-us" style="color:#9ca3af;text-decoration:none;">Contact Us</a></p>
        </td>

        <td width="22%" valign="top" style="font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#ffffff;">Our Products</p>
          <p style="margin:0 0 8px;font-size:12px;"><a href="${SITE_URL}/products/apparels" style="color:#9ca3af;text-decoration:none;">T-Shirts</a></p>
          <p style="margin:0 0 8px;font-size:12px;"><a href="${SITE_URL}/products/apparels/hoodies" style="color:#9ca3af;text-decoration:none;">Hoodies</a></p>
          <p style="margin:0;font-size:12px;"><a href="${SITE_URL}/products/bags/tote-bag" style="color:#9ca3af;text-decoration:none;">Tote Bags</a></p>
        </td>

        <td width="22%" valign="top" style="font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#ffffff;">Need Help?</p>
          <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;">&#128222; +91 90043 63902</p>
          <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;">&#9993; support@cluesstyle.com</p>
          <p style="margin:0;font-size:12px;color:#9ca3af;">&#128337; Mon – Sat, 10 AM – 8 PM</p>
        </td>

      </tr></table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border-top:1px solid #1f2937;"><tr>
        <td style="padding-top:18px;font-size:11px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;" valign="middle">
          &copy; ${new Date().getFullYear()} CluesStyle.com. All rights reserved.
        </td>
        <td align="right" style="padding-top:18px;font-size:11px;font-family:Arial,Helvetica,sans-serif;" valign="middle">
          <a href="${SITE_URL}/privacy-policy" style="color:#9ca3af;text-decoration:none;">Privacy Policy</a>
          <span style="color:#374151;"> &nbsp;|&nbsp; </span>
          <a href="${SITE_URL}/terms-and-condition" style="color:#9ca3af;text-decoration:none;">Terms &amp; Conditions</a>
          <span style="color:#374151;"> &nbsp;|&nbsp; </span>
          <a href="${SITE_URL}/contact-us" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding-top:10px;font-size:10px;color:#4b5563;font-family:Arial,Helvetica,sans-serif;">
          Order ${d.orderRef} &nbsp;·&nbsp; ${placedFull}
        </td>
      </tr></table>
    </td></tr>
  </table>

</div>
</body>
</html>`;
}

export async function sendInvoiceEmail(data: InvoiceData): Promise<void> {
  const html = buildInvoiceHtml(data);
  await transporter.sendMail({
    from: `"CluesStyle Orders" <${process.env.EMAIL_USER}>`,
    to: data.customerEmail,
    subject: `Order Confirmed – ${data.orderRef} | CluesStyle`,
    html,
  });
}