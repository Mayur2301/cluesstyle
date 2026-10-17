// PATH: app/lib/product-catalog.ts
// Central registry of every product catalog in the app.
//
// Each category currently lives in its own file (oversized-products.ts,
// solid-polo-neck.ts, ...) with its own `productsData` array. Anything that
// needs to look a product up by slug — most importantly the order API route,
// which must never trust the client for price/sku/eligibility data — should
// go through `findProductBySlug` here instead of importing one catalog file
// directly. That way adding a new category later is a two-line change in
// this file, not a bug hunt in the API route.
//
// ── Adding a new category ──────────────────────────────────────────────────
//   1. import { productsData as XProducts } from "@/app/lib/x-products";
//   2. add XProducts to the CATALOGS array below.
// That's it — create-razorpay-order (and anything else using this registry)
// picks it up automatically.

import { productsData as oversizedProducts } from "@/app/lib/oversized-products";
import { productsData as soloPoloNeckProducts } from "@/app/lib/solid-polo-neck";
import { productsData as toteBagProducts } from "@/app/lib/tote-bag-collection";
import { isToteSlug, parseToteSelection, resolveToteVariantPrice } from "@/app/lib/tote-bag-pricing";
import { productsData as roundNeckProducts } from "@/app/lib/round-neck-tshirt";
import { productsData as hoodieProducts } from "@/app/lib/hoodies-collection";
import { productsData as badgeProducts } from "@/app/lib/badge-collection";
import { productsData as officeBagProducts } from "@/app/lib/office-bag-collection";
import { productsData as capCollectionProducts } from "@/app/lib/cap-collection";
import { productsData as fullSleevesProducts } from "@/app/lib/full-sleeves-collection";
// Minimal shape every catalog's Product must satisfy for order handling.
// Each category file can (and does) define its own richer local `Product`
// interface — TypeScript only needs the fields below to be present for the
// order route to work, so no changes to those files are required.
export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  displayPrice: number;
  sizes?: string[];
  logoUploadEnabled?: boolean;
  sameDayAvailable?: boolean;
  colors?: {
    label: string;
    sku: string;
    sameDayAvailable?: boolean;
  }[];
  // A category's own bulk-quantity discount table (e.g. TSHIRT_QTY_TIERS in
  // t-shirts.ts / solid-polo-neck.ts), attached to every product record in
  // that file. When present, create-razorpay-order MUST price using this
  // table instead of pricing.ts's global default — it's what the product
  // page actually showed the customer.
  qtyTiers?: { minQty: number; maxQty: number; discount: number; label: string }[];
  // Lowest per-unit price this category may be sold at; omit to use pricing.ts's
  // default floor. See getPricePerUnit in pricing.ts.
  minUnitPrice?: number;
  [key: string]: unknown; // category files carry extra fields we don't need here
}

const CATALOGS: CatalogProduct[][] = [
  oversizedProducts as unknown as CatalogProduct[],
  soloPoloNeckProducts as unknown as CatalogProduct[],
  toteBagProducts as unknown as CatalogProduct[],
  roundNeckProducts as unknown as CatalogProduct[],
  hoodieProducts as unknown as CatalogProduct[],
  badgeProducts as unknown as CatalogProduct[],
  officeBagProducts as unknown as CatalogProduct[],
  capCollectionProducts as unknown as CatalogProduct[],
  fullSleevesProducts as unknown as CatalogProduct[],

  // Next category goes here once it's built, e.g.:
  // newCategoryProducts as unknown as CatalogProduct[],
];

/**
 * Finds a product by slug across ALL registered catalogs.
 * Returns null if no catalog has a product with that slug.
 *
 * Slugs are expected to be unique across the whole app, not just within one
 * category — if two categories ever reuse a slug, this returns whichever
 * catalog is listed first in CATALOGS, so keep slugs globally unique.
 */
export function findProductBySlug(slug: string): CatalogProduct | null {
  for (const catalog of CATALOGS) {
    const found = catalog.find((p) => p.slug === slug);
    if (found) return found;
  }

  // Diagnostic only — remove once the catalog wiring is confirmed stable.
  console.error(
    "[product-catalog] No match for slug:", JSON.stringify(slug),
    "\n  oversized-products slugs:", oversizedProducts.map((p) => p.slug),
    "\n  solid-polo-neck slugs:   ", soloPoloNeckProducts.map((p) => p.slug),
    "\n  tote-bag-collection slugs:", toteBagProducts.map((p) => p.slug),
    "\n  round-neck-tshirt slugs: ", roundNeckProducts.map((p) => p.slug),
    "\n  hoodies-collection slugs:", hoodieProducts.map((p) => p.slug),
    "\n  badge-collection slugs:  ", badgeProducts.map((p) => p.slug),
    "\n  office-bag-collection slugs:", officeBagProducts.map((p) => p.slug),
    "\n  cap-collection slugs:    ", capCollectionProducts.map((p) => p.slug),
    "\n  full-sleeves-collection slugs:", fullSleevesProducts.map((p) => p.slug),
  );

  return null;
}
/**
 * Base per-unit price (before bulk discount) for the exact variant the
 * shopper chose. Most categories have one flat `displayPrice`; tote bags
 * price by size + GSM + Plain/Custom Print (tote-bag-pricing.ts), exactly as
 * the product page does. Returns null when a variant-priced product's
 * selection can't be resolved, so the caller can reject the order.
 */
export function resolveBaseUnitPrice(
  product: CatalogProduct,
  selectedSize: string | null | undefined,
  designMode: string | null | undefined
): number | null {
  if (!isToteSlug(product.slug)) return product.displayPrice;
  const { sizeKey, gsm } = parseToteSelection(selectedSize);
  const price = resolveToteVariantPrice(product.slug, {
    sizeKey,
    gsm,
    designMode: designMode === "custom" ? "custom" : "plan",
  });
  return price ? price.sale : null;
}