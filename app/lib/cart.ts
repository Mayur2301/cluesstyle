// lib/cart.ts
import { SAME_DAY_SURCHARGE, type DeliveryType } from "./pricing";

// Mirrors the OrderCustomization shape create-razorpay-order/route.ts
// already accepts from the "Buy Now" flow — kept in sync by hand so a
// customized product added to CART carries exactly the same design data
// through to checkout as the direct Buy Now flow does. Only the fields
// actually used by product pages so far are included; add more here (and
// to create-cart-order/route.ts's matching type) if a future product page
// needs something new.
export interface CartItemCustomization {
  note?: string;
  printType?: string;
  fabricType?: string;
  capType?: string;
  logoUrls?: Record<string, string>;
  logoDesign?: Record<
    string,
    { url: string; layers: { x: number; y: number; scale: number; rotation: number }[] }
  >;
  printSides?: string[];
  badgeStyleSlug?: string;
  colorBreakdown?: { color: string; sizeBreakdown: Record<string, number> }[];
}

export interface CartItem {
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string;
  quantity: number;
  size: string | null;
  sizeBreakdown?: Record<string, number>;
  color: string | null;
  // Tote bags only: "plan" (plain) vs "custom" (custom print) — the server
  // needs it to price the line. Omitted for every other product.
  designMode?: "plan" | "custom";
  deliveryType: DeliveryType;
  // Base price per unit ONLY (no embroidery/DTF/same-day) — same meaning
  // as before. Use embroideryCharge/dtfCharge below for those.
  pricePerUnit: number;
  sameDayCharge: number;
  // Flat, already-computed embroidery/DTF charge for this line (NOT per
  // unit) — mirrors computeEmbroideryCharge()/computeDtfCharge() in
  // pricing.ts, which product pages already call for the Buy Now flow.
  // Optional/0 for plain products that don't use logo customization.
  embroideryCharge?: number;
  dtfCharge?: number;
  // pricePerUnit * quantity + embroideryCharge + dtfCharge + sameDayCharge
  lineTotal: number;
  addedAt: number;
  customizationNote?: string;
  // Full logo/embroidery/DTF customization payload — present only for
  // products with logo upload enabled. When present, this item is NEVER
  // merged with another cart entry (see addToCart below), since two
  // different logo designs must never be collapsed into one line.
  customization?: CartItemCustomization;
}

const CART_KEY = "cluesstyle_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

function hasCustomization(item: CartItem): boolean {
  return !!(
    item.customization &&
    (item.customization.logoDesign ||
      item.customization.logoUrls ||
      item.customization.printType ||
      item.customization.colorBreakdown)
  );
}

/**
 * Adds an item to the cart, merging quantities if the same plain
 * product/size/color/delivery combo already exists. A customized item
 * (logo design, embroidery/DTF, colour+size bulk breakdown) is NEVER
 * merged into an existing line — even a matching product/size/color —
 * because two different logo designs collapsed into one line would lose
 * one of them. Each "Add to Cart" on a customized product always adds a
 * new, separate line.
 */
export function addToCart(item: CartItem): CartItem[] {
  const cart = getCart();

  const idx = hasCustomization(item)
    ? -1
    : cart.findIndex(
        (c) =>
          !hasCustomization(c) &&
          c.productId === item.productId &&
          c.size === item.size &&
          c.color === item.color &&
          c.designMode === item.designMode &&
          c.deliveryType === item.deliveryType
      );

  if (idx >= 0) {
    const newQuantity = cart[idx].quantity + item.quantity;
    const sameDayCharge = item.deliveryType === "sameday" ? SAME_DAY_SURCHARGE * newQuantity : 0;

    const mergedBreakdown: Record<string, number> | undefined =
      cart[idx].sizeBreakdown || item.sizeBreakdown
        ? { ...(cart[idx].sizeBreakdown ?? {}) }
        : undefined;

    if (mergedBreakdown && item.sizeBreakdown) {
      for (const [size, qty] of Object.entries(item.sizeBreakdown)) {
        mergedBreakdown[size] = (mergedBreakdown[size] ?? 0) + qty;
      }
    }

    cart[idx] = {
      ...cart[idx],
      quantity: newQuantity,
      sizeBreakdown: mergedBreakdown,
      sameDayCharge,
      lineTotal: cart[idx].pricePerUnit * newQuantity + sameDayCharge,
    };
  } else {
    cart.push(item);
  }

  saveCart(cart);
  return cart;
}

/**
 * Removes exactly one cart line, identified by its unique `addedAt`
 * timestamp — NOT by product/size/color, since two customized lines for
 * the same product/size/color (different logo designs) must be
 * removable independently.
 */
export function removeFromCart(addedAt: number): CartItem[] {
  const cart = getCart().filter((c) => c.addedAt !== addedAt);
  saveCart(cart);
  return cart;
}

/** Removes several cart lines at once, identified by their `addedAt` timestamps (used by the cart page's "select items → Remove All" flow). */
export function removeManyFromCart(addedAts: number[]): CartItem[] {
  const remove = new Set(addedAts);
  const cart = getCart().filter((c) => !remove.has(c.addedAt));
  saveCart(cart);
  return cart;
}

/**
 * Updates a cart line's quantity from the +/- stepper on the cart page.
 * `pricePerUnit` is kept exactly as it was when the item was added (it may
 * reflect a bulk-quantity discount tier picked on the product page at that
 * original quantity), and embroidery/DTF charges are kept flat rather than
 * recomputed — both are the same simplification `addToCart`'s merge path
 * already makes. This keeps the cart's total an ESTIMATE; the real total is
 * always re-validated server-side in create-cart-order/verify-cart-payment
 * before anything is charged, same as every other price shown pre-checkout.
 */
export function updateQuantity(addedAt: number, quantity: number): CartItem[] {
  const cart = getCart();
  const idx = cart.findIndex((c) => c.addedAt === addedAt);
  if (idx < 0 || quantity < 1) return cart;

  const item = cart[idx];
  const perUnitSameDay = item.quantity > 0 ? item.sameDayCharge / item.quantity : 0;
  const sameDayCharge = item.deliveryType === "sameday" ? Math.round(perUnitSameDay * quantity) : item.sameDayCharge;

  cart[idx] = {
    ...item,
    quantity,
    sameDayCharge,
    lineTotal: item.pricePerUnit * quantity + sameDayCharge + (item.embroideryCharge ?? 0) + (item.dtfCharge ?? 0),
  };

  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  saveCart([]);
}

export function getCartCount(): number {
  return getCart().reduce((sum, c) => sum + c.quantity, 0);
}