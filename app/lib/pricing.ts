// ── Pricing & delivery configuration ────────────────────────────────────────────
// IMPORTANT: this file is imported by both the product page (client) and the
// create-razorpay-order API route (server). Never duplicate this logic anywhere
// else — if the client and server ever compute price differently, the amount
// shown on screen and the amount charged on Razorpay will drift apart.

export const COST_PER_UNIT = 240;

// Shape every category's bulk-quantity tier table must follow. Kept here so
// a category file (e.g. t-shirts.ts) can export its own tier table typed
// against this, and both the product page (display) and
// create-razorpay-order (actual charge) stay structurally compatible no
// matter which table they're given.
export interface QtyTier {
  minQty: number;
  maxQty: number;
  discount: number;
  label: string;
}

// Default/fallback tier table — used by any category that hasn't defined
// its own `qtyTiers` on its product records yet. Categories that DO define
// their own (see e.g. t-shirts.ts's TSHIRT_QTY_TIERS, attached to every
// product as `product.qtyTiers`) should pass that table into the functions
// below instead of relying on this default.
export const QTY_TIERS: QtyTier[] = [
   { minQty: 2, maxQty: 9, discount: 0, label: "2-9" },
  { minQty: 10, maxQty: 29, discount: 5, label: "10-29" },
  { minQty: 30, maxQty: 49, discount: 10, label: "30-49" },
  { minQty: 50, maxQty: 59, discount: 15, label: "50-59" },
  { minQty: 60, maxQty: 79, discount: 18, label: "60-79" },
  { minQty: 80, maxQty: 99, discount: 22, label: "80-99" },
  { minQty: 100, maxQty: Infinity, discount: 27, label: "100+" },
];

export const SAME_DAY_SURCHARGE = 80;

// ── Print side type ──────────────────────────────────────────────────────────
// Shared by both embroidery and DTF pricing below (and structurally
// identical to the `Side` type used in ProductDetailClient.tsx — that type
// can be passed straight into any of these functions).
export type PrintSide = "front" | "back" | "left" | "right";

// ── Embroidery pricing ───────────────────────────────────────────────────────
// Each side has its own price (front/back cost more to stitch than a sleeve),
// charged PER T-SHIRT — i.e. multiplied by quantity, since each shirt in the
// order needs those positions stitched.
export const EMBROIDERY_PRICE_PER_SIDE: Record<PrintSide, number> = {
  front: 70,
  back: 70,
  left: 45,
  right: 45,
};

// One-time design setup charge — flat, NOT multiplied by quantity or by the
// number of positions. Waived entirely once the order reaches the bulk
// threshold below.
export const EMBROIDERY_DESIGN_CHARGE = 700;
export const EMBROIDERY_DESIGN_CHARGE_FREE_MIN_QTY = 10;

/**
 * Total embroidery add-on for the order: sum of each selected side's own
 * price × quantity, plus a flat ₹700 one-time design charge — waived once
 * quantity reaches the bulk threshold (10+ shirts). Returns 0 if no sides
 * are selected (e.g. DTF, or embroidery chosen but no logo uploaded yet).
 */
export function computeEmbroideryCharge(quantity: number, activeSides: PrintSide[]): number {
  if (!activeSides || activeSides.length === 0) return 0;
  const perUnitCharge = activeSides.reduce((sum, side) => sum + (EMBROIDERY_PRICE_PER_SIDE[side] ?? 0), 0);
  const positionCharge = perUnitCharge * quantity;
  const designCharge = quantity >= EMBROIDERY_DESIGN_CHARGE_FREE_MIN_QTY ? 0 : EMBROIDERY_DESIGN_CHARGE;
  return positionCharge + designCharge;
}

/**
 * The exact, non-editable note line shown/sent for an embroidery order —
 * kept in one place so the UI banner, the OrderModal payload, and the main
 * component's payload can never drift out of sync with each other.
 * Returns null when there's nothing to say (DTF, or no sides uploaded yet).
 */
export function getEmbroideryAutoNote(quantity: number, activeSides: PrintSide[]): string | null {
  if (!activeSides || activeSides.length === 0) return null;
  const numPositions = activeSides.length;
  const charge = computeEmbroideryCharge(quantity, activeSides);
  const designSuffix = quantity < EMBROIDERY_DESIGN_CHARGE_FREE_MIN_QTY ? " + design charge" : "";
  return `Embroidery selected — ${numPositions} position${numPositions !== 1 ? "s" : ""}${designSuffix} (+₹${charge})`;
}

// ── DTF pricing ──────────────────────────────────────────────────────────────
// Each side has its own price, charged PER T-SHIRT — same idea as embroidery
// above. Unlike embroidery, DTF has NO one-time design charge at any
// quantity — printing a design straight onto the transfer film doesn't need
// the extra manual digitizing/setup work embroidery does.
export const DTF_PRICE_PER_SIDE: Record<PrintSide, number> = {
  front: 80,
  back: 130,
  left: 35,
  right: 35,
};

/**
 * Total DTF add-on for the order: sum of each selected side's own price ×
 * quantity. No design charge, ever — that's the one difference from
 * computeEmbroideryCharge. Returns 0 if no sides are selected.
 */
export function computeDtfCharge(quantity: number, activeSides: PrintSide[]): number {
  if (!activeSides || activeSides.length === 0) return 0;
  const perUnitCharge = activeSides.reduce((sum, side) => sum + (DTF_PRICE_PER_SIDE[side] ?? 0), 0);
  return perUnitCharge * quantity;
}

/**
 * The exact, non-editable note line shown/sent for a DTF order — mirrors
 * getEmbroideryAutoNote above so the UI banner, OrderModal payload, and main
 * component payload never drift out of sync. Returns null when there's
 * nothing to say (embroidery, or no sides uploaded yet).
 */
export function getDtfAutoNote(quantity: number, activeSides: PrintSide[]): string | null {
  if (!activeSides || activeSides.length === 0) return null;
  const numPositions = activeSides.length;
  const charge = computeDtfCharge(quantity, activeSides);
  return `DTF selected — ${numPositions} position${numPositions !== 1 ? "s" : ""} (+₹${charge})`;
}

export const MUMBAI_PINCODES = new Set([
  // Mumbai
  "400001","400002","400003","400004","400005","400006","400007","400008","400009","400010",
  "400011","400012","400013","400014","400015","400016","400017","400018","400019","400020",
  "400021","400022","400023","400024","400025","400026","400027","400028","400029","400030",
  "400031","400032","400033","400034","400035","400036","400037","400038","400039","400040",
  "400041","400042","400043","400044","400045","400046","400047","400048","400049","400050",
  "400051","400052","400053","400054","400055","400056","400057","400058","400059","400060",
  "400061","400062","400063","400064","400065","400066","400067","400068","400069","400070",
  "400071","400072","400073","400074","400075","400076","400077","400078","400079","400080",
  "400081","400082","400083","400084","400085","400086","400087","400088","400089","400090",
  "400091","400092","400093","400094","400095","400096","400097","400098","400099","400100",
  "400101","400102","400103","400104",

  // Thane
  "400601","400602","400603","400604","400605","400606","400607","400608","400610","400615",

  // Navi Mumbai
  "400614","400701","400703","400705","400706","400708","400709","400710",

  // Airoli / Ghansoli / Rabale / Koparkhairane
  "400701","400708","400709",

  // Belapur / Nerul / Seawoods
  "400614","400614","400706","400614","400708",

  // Panvel / Kamothe / Kharghar / Taloja
  "410206","410208","410209","410210","410218",

  // Mira Road / Bhayandar
  "401101","401104","401105","401107",

  // Vasai
  "401201","401202","401203","401204","401205","401207","401208","401209",

  // Nalasopara
  "401203","401209",

  // Virar
  "401301","401303","401304","401305",
]);

// "pickup" = customer collects in person from the store — no delivery
// charge either way, and no courier is booked for it (see
// verify-razorpay-payment.ts). Adding it here is backward compatible:
// every existing caller only ever passes "standard" or "sameday", and
// computeOrderTotal below already treats anything that isn't "sameday" as
// free, so "pickup" needs no further changes to the pricing math itself.
export type DeliveryType = "standard" | "sameday" | "pickup";

// ── Same-day delivery slots ──────────────────────────────────────────────────
// Single source of truth for the slot options shown once a pincode checks out
// as serviceable — kept here (not hardcoded in the component) for the same
// reason as everything else in this file: the server needs the exact same
// list to validate whatever slot id the client sends back with the order.
export interface SameDaySlot {
  id: string;
  label: string;
  /** 24-hour clock, used to grey out a slot once its window has passed today. */
  startHour: number;
  endHour: number;
}

export const SAME_DAY_SLOTS: SameDaySlot[] = [
  { id: "9-12",  label: "9:00 AM – 12:00 PM", startHour: 9,  endHour: 12 },
  { id: "12-15", label: "12:00 PM – 3:00 PM", startHour: 12, endHour: 15 },
  { id: "15-18", label: "3:00 PM – 6:00 PM",  startHour: 15, endHour: 18 },
];

// How long it takes to prepare/pack an order before it can be handed off for
// delivery. A slot is only offered if there's still enough time left before
// its end for prep + delivery — e.g. with a 2-hour prep time, ordering at
// 1:30 PM leaves only 1.5 hours before the 12:00–3:00 PM slot ends, so that
// slot is correctly greyed out even though its window technically hasn't
// closed yet.
export const SAME_DAY_PREP_HOURS = 2;

/**
 * True once there's no longer enough lead time left before a slot's end for
 * prep + delivery — either because the slot has fully ended, or because it's
 * ending soon enough that starting prep "now" wouldn't finish in time.
 */
export function isSlotPast(
  slot: SameDaySlot,
  now: Date = new Date(),
  prepHours: number = SAME_DAY_PREP_HOURS
): boolean {
  const nowDecimalHours = now.getHours() + now.getMinutes() / 60;
  return nowDecimalHours + prepHours >= slot.endHour;
}

export function getDiscountForQty(qty: number, tiers: QtyTier[] = QTY_TIERS): number {
  let discount = 0;
  for (const tier of tiers) {
    if (qty >= tier.minQty) discount = tier.discount;
  }
  return discount;
}

/**
 * Returns a whole-rupee integer. Rounding here — rather than leaving a
 * fractional rupee value floating around — is what guarantees the price
 * shown on the page, the cart total, and the amount sent to Razorpay are
 * always exactly the same number.
 *
 * `tiers` defaults to the global QTY_TIERS above, but a category with its
 * own bulk-quantity table (e.g. t-shirts.ts's product.qtyTiers) should
 * always pass it explicitly — and pass the SAME table on both the product
 * page and create-razorpay-order, or the price shown and the price charged
 * will drift apart.
 */
export function getPricePerUnit(displayPrice: number, qty: number, tiers: QtyTier[] = QTY_TIERS): number {
  const discountPct = getDiscountForQty(qty, tiers);
  const discounted = displayPrice * (1 - discountPct / 100);
  return Math.round(Math.max(discounted, COST_PER_UNIT + 20));
}

export function computeOrderTotal({
  displayPrice,
  quantity,
  deliveryType,
  tiers = QTY_TIERS,
}: {
  displayPrice: number;
  quantity: number;
  deliveryType: DeliveryType;
  tiers?: QtyTier[];
}) {
  const pricePerUnit = getPricePerUnit(displayPrice, quantity, tiers);
  const sameDayCharge = deliveryType === "sameday" ? SAME_DAY_SURCHARGE * quantity : 0;
  const grandTotal = pricePerUnit * quantity + sameDayCharge;
  return { pricePerUnit, sameDayCharge, grandTotal };
}