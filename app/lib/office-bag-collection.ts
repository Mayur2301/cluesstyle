// ── Types ──────────────────────────────────────────────────────────────────────
// Mirrors tote-bag-collection.ts's Product shape for type compatibility with
// the rest of the app (ProductDetailClient.tsx, create-razorpay-order, etc).
// Office bags don't use every field here (no sizes, no GSM tiers, no color
// variants right now) — those fields are simply left unset on each product.

import type { QtyTier } from "@/app/lib/pricing";

export interface MediaItem {
  type: "image" | "video";
  src: string;
  poster?: string;
}

export interface ProductColor {
  label: string;
  hex: string;
  sku: string;
  media?: MediaItem[];
  // NOTE: office bags have no blank (unprinted) mockup photos yet, so
  // `blankMedia` is intentionally never set anywhere in this file. The logo
  // live-preview canvas simply won't have a mockup to draw on top of until
  // real blank photos are shot — that's fine, LogoUploadSection/the simple
  // upload box both work without it.
  blankMedia?: MediaItem[];
  sameDayAvailable?: boolean;
  banner?: {
    title: string;
    description: string;
    features: string[];
  };
  gsmMedia?: Record<number, MediaItem[]>;
}

export interface Offer {
  code: string;
  saveAmount: number;
  description: string;
  minOrder: number;
  discountPct: number;
}

export interface FabricMaterialProduct {
  id: string;
  name: string;
  image: string;
}

export interface FabricSubCategory {
  id: string;
  label: string;
  products: FabricMaterialProduct[];
}

export type FabricSubCategoryMap = {
  basic?: FabricSubCategory[];
  premium?: FabricSubCategory[];
};

export interface SizeOption {
  id: string;
  label: string;
  dimension: string;
  price: number;
  image: string;
  popular?: boolean;
  variantImages?: Record<string, string>;
}

export interface SizeDetail {
  dimension?: string;
  gsmVariants?: Record<number, {
    image?: string;
    price?: number;
    blankMedia?: MediaItem[];
  }>;
}

export interface GsmOption {
  value: number;
  label: string;
  features: string[];
  image?: string;
  price?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  basePrice: number;
  // Bulk tiers — attached to every product by attachSkus() and read by BOTH
  // the product page and the order APIs (create-razorpay-order /
  // create-cart-order), so the price shown is the price charged.
  qtyTiers?: QtyTier[];
  displayPrice: number;
  originalPrice: number;
  images: string[];
  media?: MediaItem[];
  printMethod?: string;
  quantityReq: number;
  priceRange: "budget" | "mid" | "premium";
  category: string;
  description?: string;
  features?: string[];
  material?: string;
  gsm?: number;
  turnaround?: string;
  sameDayTurnaround?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  colors?: ProductColor[];
  sizes?: string[];
  sizeDetails?: Record<string, SizeDetail>;
  inStock?: boolean;
  discount?: number;
  weight?: number;
  customizable?: boolean;
  logoUploadEnabled?: boolean;
  enabledLogoSides?: ("front" | "back" | "left" | "right")[];
  sameDayAvailable?: boolean;
  offer?: Offer;
  availablepatterns?: string;
  cardBg?: string;
  fabricSubCategories?: FabricSubCategoryMap;
  isStylePicker?: boolean;
  styleLabel?: string;
  styleSubtitle?: string;
  sizeOptions?: SizeOption[];
  isDefaultCategory?: boolean;
  isBasicPremiumCategory?: boolean;
  simpleVariantPicker?: boolean;
  gsmOptions?: GsmOption[];
  cardVariantPicker?: boolean;
  // Plan/Customized card copy + photos. Since office bags don't have a
  // separate "blank" vs "your-logo" mockup shot yet, both `plan.image` and
  // `custom.image` just point at the product's own real photo — swap in
  // dedicated photos later if you shoot them.
  designOptions?: {
    plan: { titleAccent: string; features: string[]; image: string };
    custom: { titleAccent: string; features: string[]; image: string };
  };
  fabricCategoryBanner?: Record<"basic" | "premium", {
    title: string;
    description: string;
    image: string;
    badges: string[];
  }>;
  fabricChoices?: Record<"basic" | "premium", {
    id: string;
    name: string;
    subtitle: string;
    image: string;
    cardImage?: string;
    products?: { id: string; name: string; image: string; images?: string[] }[];
  }[]>;
}

// ── Default Offer ──────────────────────────────────────────────────────────────

export const DEFAULT_OFFER: Offer = {
  code: "PREPAID5",
  saveAmount: 25,
  description: "Get EXTRA 5% OFF on all Prepaid orders above Rs.499.",
  minOrder: 499,
  discountPct: 5,
};

// Bulk tiers from the "Corporate Bag Pricing 2026" sheet — discounts come off
// the Single Piece sale price. 1-4 pieces = Single Piece (no discount).
export const OFFICE_BAG_QTY_TIERS: QtyTier[] = [
  { minQty: 5, maxQty: 24, discount: 5, label: "5-24" },
  { minQty: 25, maxQty: 49, discount: 10, label: "25-49" },
  { minQty: 50, maxQty: 99, discount: 15, label: "50-99" },
  { minQty: 100, maxQty: 249, discount: 20, label: "100-249" },
  { minQty: 250, maxQty: 499, discount: 25, label: "250-499" },
  { minQty: 500, maxQty: Infinity, discount: 30, label: "500+" },
];

// ── Products Data ──────────────────────────────────────────────────────────────
// Single source of truth for office bag pricing (displayPrice,
// sameDayAvailable, etc). The create-razorpay-order API route should look
// products up from this same array — never from anything sent by the client.

type RawColor = Omit<ProductColor, "sku">;
type RawProduct = Omit<Product, "sku" | "colors"> & { colors?: RawColor[] };

const CATEGORY_PREFIX = "BAG";

const COLOR_CODES: Record<string, string> = {
  white: "WHT",
  black: "BLK",
  natural: "NAT",
  navy: "NVY",
  "navy blue": "NVY",
  red: "RED",
  beige: "BEG",
  blue: "BLU",
};

function colorCode(label: string): string {
  const key = label.trim().toLowerCase();
  if (COLOR_CODES[key]) return COLOR_CODES[key];
  const fallback = key.replace(/[^a-z0-9]/g, "").slice(0, 3).toUpperCase();
  return fallback.padEnd(3, "X");
}

function attachSkus(raw: RawProduct[]): Product[] {
  return raw.map((p) => {
    const productSku = `${CATEGORY_PREFIX}-${p.id.padStart(3, "0")}`;
    const colors = p.colors?.map((c) => ({
      ...c,
      sku: `${productSku}-${colorCode(c.label)}`,
    }));
    return { ...p, sku: productSku, qtyTiers: OFFICE_BAG_QTY_TIERS, ...(colors ? { colors } : {}) } as Product;
  });
}

// All five products use the plain "isDefaultCategory" flow: Plan/Customized
// cards (4. Customized), the simple front-logo upload box, quantity
// (Single Piece/Bulk Order), delivery (standard only — no same-day for this
// category), then Add to Cart / Checkout Now. No sizes, no GSM tiers, no
// color swatches — none of that applies to office bags right now.
const rawProductsData: RawProduct[] = [
  {
    id: "1",
    name: "Modern and Minimalist Backpack 22L Black With Laptop Compartment",
    slug: "Modern-and-Minimalist-Backpack-22L-Black-With-Laptop-Compartment",
    isDefaultCategory: true,
    basePrice: 240,
    displayPrice: 1999,
    originalPrice: 2999,
    discount: 33,
    images: [
      "/office-bag/blue-office-bag/blue-office-bag-front.webp",
      "/office-bag/blue-office-bag/blue-office-bag-back.webp",
      "/office-bag/blue-office-bag/blue-office-bag-measure.webp",
      "/office-bag/blue-office-bag/blue-office-bag-details.webp",
      "/office-bag/blue-office-bag/wearing-blue-office-bag.webp",
    ],
    media: [
      { type: "image", src: "/office-bag/blue-office-bag/blue-office-bag-back.webp" },
      { type: "image", src: "/office-bag/blue-office-bag/blue-office-bag-measure.webp" },
      { type: "image", src: "/office-bag/blue-office-bag/blue-office-bag-details.webp" },
      { type: "image", src: "/office-bag/blue-office-bag/wearing-blue-office-bag.webp" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Office Bag",
    description: "A modern, minimalist 22L backpack with a padded laptop compartment — built for the daily commute.",
    features: ["Water-resistant fabric", "Padded laptop compartment", "Ergonomic straps", "Multiple organizer pockets"],
    material: "Premium Polyester, 900D",
    turnaround: "5-7 business days",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    inStock: true,
    weight: 300,
    customizable: true,
    logoUploadEnabled: true,
    enabledLogoSides: ["front"],
    sameDayAvailable: false,
    designOptions: {
      plan: {
        titleAccent: "(Solid Plan Bag)",
        features: ["Plain bag without any design", "Perfect for brand label or embroidery"],
        image: "/office-bag/blue-office-bag/blue-office-bag-front.webp",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/office-bag/blue-office-bag/blue-office-bag-front.webp",
      },
    },
    offer: DEFAULT_OFFER,
  },
  {
    id: "2",
    name: "Mini Office Bag",
    slug: "mini-office-bag",
    isDefaultCategory: true,
    basePrice: 240,
    displayPrice: 2099,
    originalPrice: 3199,
    discount: 34,
    images: [
      "/mini-office-bag/mini-office-bag-front.webp",
      "/mini-office-bag/mini-office-bag-cross-side.webp",
    ],
    media: [
      { type: "image", src: "/mini-office-bag/mini-office-bag-side.webp" },
      { type: "image", src: "/mini-office-bag/mini-office-bag-side-information.webp" },
      { type: "image", src: "/mini-office-bag/mini-office-bag-back.webp" },
      { type: "image", src: "/mini-office-bag/mini-office-bag-2.webp" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Office Bag",
    description: "A compact office bag sized for the essentials — ideal for a light daily carry.",
    features: ["Compact & lightweight", "Durable stitching", "Cross-body strap", "Multiple compartments"],
    material: "Premium Polyester, 900D",
    turnaround: "5-7 business days",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    inStock: true,
    weight: 300,
    customizable: true,
    logoUploadEnabled: true,
    enabledLogoSides: ["front"],
    sameDayAvailable: false,
    designOptions: {
      plan: {
        titleAccent: "(Solid Plan Bag)",
        features: ["Plain bag without any design", "Perfect for brand label or embroidery"],
        image: "/mini-office-bag/mini-office-bag-front.webp",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/mini-office-bag/mini-office-bag-front.webp",
      },
    },
    offer: DEFAULT_OFFER,
  },
  {
    id: "3",
    name: "Office Executive Bag",
    slug: "office-executive-bag",
    isDefaultCategory: true,
    basePrice: 240,
    displayPrice: 2299,
    originalPrice: 3499,
    discount: 34,
    images: [
      "/office-executive-bag/executive-bag-model-side-view.webp",
      "/office-executive-bag/executive-bag-model-front-back-side-view.webp",
    ],
    media: [
      { type: "image", src: "/office-executive-bag/executive-bag-model-front-view.webp" },
      { type: "image", src: "/office-executive-bag/executive-bag-model-side-view.webp" },
      { type: "image", src: "/office-executive-bag/executive-bag-model-front-back-side-view.webp" },
      { type: "image", src: "/office-executive-bag/executive-bag-model-informaion.webp" },
      { type: "image", src: "/office-executive-bag/executive-bag-model-inner-side-informaion.webp" },
      { type: "image", src: "/office-executive-bag/executive-bag-model-front.webp" },
      { type: "image", src: "/office-executive-bag/executive-bag-model-side.webp" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Office Bag",
    description: "A sharp executive bag built for the boardroom — structured, professional, and spacious.",
    features: ["Structured silhouette", "Premium finish", "Padded laptop sleeve", "Multiple organizer pockets"],
    material: "Premium Polyester, 900D",
    turnaround: "5-7 business days",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    inStock: true,
    weight: 300,
    customizable: true,
    logoUploadEnabled: true,
    enabledLogoSides: ["front"],
    sameDayAvailable: false,
    designOptions: {
      plan: {
        titleAccent: "(Solid Plan Bag)",
        features: ["Plain bag without any design", "Perfect for brand label or embroidery"],
        image: "/office-executive-bag/executive-bag-model-front-view.webp",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/office-executive-bag/executive-bag-model-front-view.webp",
      },
    },
    offer: DEFAULT_OFFER,
  },
  {
    id: "4",
    name: "Office Laptop Bag",
    slug: "office-laptop-bag",
    isDefaultCategory: true,
    basePrice: 240,
    displayPrice: 2199,
    originalPrice: 3299,
    discount: 33,
    images: [
      "/office-laptop-bag/office-laptop-bag-front.webp",
      "/office-laptop-bag/office-laptop-bag-back.webp",
    ],
    media: [
      { type: "image", src: "/office-laptop-bag/office-laptop-bag-front.webp" },
      { type: "image", src: "/office-laptop-bag/office-laptop-bag-back.webp" },
      { type: "image", src: "/office-laptop-bag/office-laptop-bag-side.webp" },
      { type: "image", src: "/office-laptop-bag/man-carrying-office-laptop-bag.webp" },
      { type: "image", src: "/office-laptop-bag/office-laptop-bag-specification.webp" },
      { type: "image", src: "/office-laptop-bag/officel-pducts-bag.webp" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Office Bag",
    description: "A dedicated laptop bag with a protective, padded compartment for safe daily commutes.",
    features: ["Padded laptop compartment", "Shock-resistant lining", "Durable zippers", "Slim, professional profile"],
    material: "Premium Polyester, 900D",
    turnaround: "5-7 business days",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    inStock: true,
    weight: 300,
    customizable: true,
    logoUploadEnabled: true,
    enabledLogoSides: ["front"],
    sameDayAvailable: false,
    designOptions: {
      plan: {
        titleAccent: "(Solid Plan Bag)",
        features: ["Plain bag without any design", "Perfect for brand label or embroidery"],
        image: "/office-laptop-bag/office-laptop-bag-front.webp",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/office-laptop-bag/office-laptop-bag-front.webp",
      },
    },
    offer: DEFAULT_OFFER,
  },
 
];

export const productsData: Product[] = attachSkus(rawProductsData);