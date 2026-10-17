// app/lib/tote-bag-pricing.ts
//
// Single source of truth for tote-bag prices (from the "FINAL TOTE BAG MRP +
// SALE + BULK PRICING" sheet). Imported by BOTH the product page and the
// order APIs (create-razorpay-order / create-cart-order) so the amount shown
// on the page is always the amount charged.
import type { QtyTier } from "@/app/lib/pricing";

// Bulk tiers (same for every tote product except sample kits). Quantities
// 1-4 are "Single Piece" (no discount); Bulk starts at 5.
export const TOTE_BAG_QTY_TIERS: QtyTier[] = [
  { minQty: 5, maxQty: 24, discount: 5, label: "5-24" },
  { minQty: 25, maxQty: 49, discount: 10, label: "25-49" },
  { minQty: 50, maxQty: 99, discount: 15, label: "50-99" },
  { minQty: 100, maxQty: 249, discount: 20, label: "100-249" },
  { minQty: 250, maxQty: 499, discount: 25, label: "250-499" },
  { minQty: 500, maxQty: Infinity, discount: 30, label: "500+" },
];

// Sample kits are already sold close to cost, so they get no bulk discount.
export const TOTE_SAMPLE_KIT_QTY_TIERS: QtyTier[] = [];

// Tote prices are all below pricing.ts's default floor (₹260), so totes
// disable that floor.
export const TOTE_MIN_UNIT_PRICE = 0;

export type ToteDesignMode = "plan" | "custom";
export interface TotePrice { sale: number; mrp: number }

// Size-card id (Customized Tote Bag) -> size key used in the table below.
export const TOTE_SIZE_OPTION_TO_KEY: Record<string, string> = {
  small: "12x14",
  medium: "14x16",
  large: "16x18",
  xl: "18x20",
};

// [plain, custom] per size key and GSM.
const P = (sale: number, mrp: number): TotePrice => ({ sale, mrp });
const TOTE_PRICES: Record<string, Record<number, { plain: TotePrice; custom: TotePrice }>> = {
  "12x14": {
    150: { plain: P(150, 230), custom: P(150, 230) },
    330: { plain: P(160, 240), custom: P(190, 290) },
  },
  "14x16": {
    150: { plain: P(160, 240), custom: P(160, 240) },
    330: { plain: P(180, 270), custom: P(200, 300) },
  },
  "16x18": {
    150: { plain: P(170, 260), custom: P(170, 260) },
    330: { plain: P(190, 290), custom: P(220, 330) },
  },
  "18x20": {
    150: { plain: P(170, 260), custom: P(180, 270) },
    330: { plain: P(210, 320), custom: P(230, 350) },
  },
};

const SAMPLE_KIT_PRICES: Record<number, TotePrice> = {
  150: P(600, 900),
  330: P(1400, 2100),
};

export const TOTE_SAMPLE_KIT_SLUG = "tote-bag-sample-kit";

export function isToteSlug(slug: string): boolean {
  return (
    slug === TOTE_SAMPLE_KIT_SLUG ||
    slug === "customized-tote-bag" ||
    slug === "natural-canvas-tote-bag" ||
    slug === "black-canvas-tote-bag"
  );
}

export function getToteQtyTiers(slug: string): QtyTier[] {
  return slug === TOTE_SAMPLE_KIT_SLUG ? TOTE_SAMPLE_KIT_QTY_TIERS : TOTE_BAG_QTY_TIERS;
}

export function resolveToteVariantPrice(
  slug: string,
  v: { sizeKey?: string | null; gsm?: number | null; designMode?: ToteDesignMode | null }
): TotePrice | null {
  const gsm = v.gsm ?? null;
  if (gsm == null) return null;
  if (slug === TOTE_SAMPLE_KIT_SLUG) return SAMPLE_KIT_PRICES[gsm] ?? null;
  if (!v.sizeKey) return null;
  const row = TOTE_PRICES[v.sizeKey]?.[gsm];
  if (!row) return null;
  return v.designMode === "custom" ? row.custom : row.plain;
}

// Parses the human-readable selection string the cart / Buy Now flow already
// sends as `selectedSize` — "12x14 — 150 GSM", "Small — 330 GSM" or
// "330 GSM" (sample kit) — into a size key + GSM.
export function parseToteSelection(selectedSize: string | null | undefined): { sizeKey: string | null; gsm: number | null } {
  if (!selectedSize) return { sizeKey: null, gsm: null };
  const gsmMatch = selectedSize.match(/(\d+)\s*GSM/i);
  const gsm = gsmMatch ? Number(gsmMatch[1]) : null;
  const sizePart = selectedSize.split("—")[0].trim();
  let sizeKey: string | null = null;
  if (/^\d+\s*x\s*\d+$/i.test(sizePart)) sizeKey = sizePart.replace(/\s+/g, "").toLowerCase();
  else if (TOTE_SIZE_OPTION_TO_KEY[sizePart.toLowerCase()]) sizeKey = TOTE_SIZE_OPTION_TO_KEY[sizePart.toLowerCase()];
  return { sizeKey, gsm };
}