// ── Types ──────────────────────────────────────────────────────────────────────
// Mirrors office-bag-collection.ts / sports-bag-collection.ts's Product shape
// for type compatibility with the rest of the app. Umbrellas don't use sizes,
// GSM tiers, or color variants right now — those fields are simply left unset.

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
  // NOTE: umbrellas have no blank (unprinted) mockup photos yet, so
  // `blankMedia` is intentionally never set anywhere in this file.
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
  // Plan/Customized card copy + photos. Since umbrellas don't have a
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

// ── Products Data ──────────────────────────────────────────────────────────────
// Single source of truth for umbrella pricing (displayPrice,
// sameDayAvailable, etc). The create-razorpay-order API route should look
// products up from this same array — never from anything sent by the client.

type RawColor = Omit<ProductColor, "sku">;
type RawProduct = Omit<Product, "sku" | "colors"> & { colors?: RawColor[] };

const CATEGORY_PREFIX = "UMB";

const COLOR_CODES: Record<string, string> = {
  white: "WHT",
  black: "BLK",
  navy: "NVY",
  "navy blue": "NVY",
  red: "RED",
  blue: "BLU",
  grey: "GRY",
  gray: "GRY",
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
    return { ...p, sku: productSku, ...(colors ? { colors } : {}) } as Product;
  });
}

// All four products use the plain "isDefaultCategory" flow: Plan/Customized
// cards (4. Customized), the simple front-logo upload box, quantity
// (Single Piece/Bulk Order), delivery (standard only — no same-day for this
// category), then Add to Cart / Checkout Now. No sizes, no GSM tiers, no
// color swatches — none of that applies to umbrellas right now.
const rawProductsData: RawProduct[] = [
  {
    id: "1",
    name: "Smart Fold Umbrella",
    slug: "smart-fold-umbrella",
    isDefaultCategory: true,
    basePrice: 240,
    displayPrice: 499,
    originalPrice: 699,
    discount: 29,
    images: [
      "/Smart-Fold-Umbrella/smartFold-umbrella-front.png",
      "/Smart-Fold-Umbrella/smartFold-umbrella-open.png",
    ],
    media: [
      { type: "image", src: "/Smart-Fold-Umbrella/smartFold-umbrella-front.png" },
      { type: "image", src: "/Smart-Fold-Umbrella/smartFold-umbrella-open.png" },
      { type: "image", src: "/Smart-Fold-Umbrella/smartFold-umbrella-top.png" },
      { type: "image", src: "/Smart-Fold-Umbrella/smartFold-umbrella-fold.png" },
      { type: "image", src: "/Smart-Fold-Umbrella/smartFold-umbrella-close.png" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Umbrella",
    description: "A compact smart-fold umbrella that collapses down to pocket size — easy to carry, quick to open.",
    features: ["Wind-resistant frame", "Compact folding design", "Quick-dry fabric", "Anti-slip grip handle"],
    material: "190T Pongee Fabric, Fiberglass Ribs",
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
        titleAccent: "(Solid Plan Umbrella)",
        features: ["Plain umbrella without any design", "Perfect for brand label or embroidery"],
        image: "/Smart-Fold-Umbrella/smartFold-umbrella-front.png",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/Smart-Fold-Umbrella/smartFold-umbrella-front.png",
      },
    },
    offer: DEFAULT_OFFER,
  },
  {
    id: "2",
    name: "Portable UV Protection Umbrella",
    slug: "portable-uv-protection-umbrella-auto-open-and-wind-resistant",
    isDefaultCategory: true,
    basePrice: 240,
    displayPrice: 499,
    originalPrice: 699,
    discount: 29,
    images: [
      "/uv-protection-umbrella/portable-UV-protection-umbrella-front-open.png",
      "/uv-protection-umbrella/portable-UV-protection-umbrella-front.png",
    ],
    media: [
      { type: "image", src: "/uv-protection-umbrella/portable-UV-protection-umbrella-front-open.png" },
      { type: "image", src: "/uv-protection-umbrella/portable-UV-protection-umbrella-front.png" },
      { type: "image", src: "/uv-protection-umbrella/portable-UV-protection-umbrella-fold-front.png" },
      { type: "image", src: "/uv-protection-umbrella/portable-UV-protection-umbrella-filddown.png" },
      { type: "image", src: "/uv-protection-umbrella/portable-UV-protection-umbrella-back.png" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Umbrella",
    description: "An auto-open, wind-resistant umbrella with UV-protective coating — built for everyday commuting.",
    features: ["UV protective coating", "Auto-open mechanism", "Wind-resistant frame", "Portable folding design"],
    material: "190T Pongee Fabric, Fiberglass Ribs",
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
        titleAccent: "(Solid Plan Umbrella)",
        features: ["Plain umbrella without any design", "Perfect for brand label or embroidery"],
        image: "/uv-protection-umbrella/portable-UV-protection-umbrella-front.png",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/uv-protection-umbrella/portable-UV-protection-umbrella-front.png",
      },
    },
    offer: DEFAULT_OFFER,
  },
  {
    id: "3",
    name: "UV Mini Purse Umbrella",
    slug: "uv-mini-purse-umbrella",
    isDefaultCategory: true,
    basePrice: 240,
    displayPrice: 499,
    originalPrice: 699,
    discount: 29,
    images: [
      "/uv-mini-purse-umbrella/UV-mini-purse-umbrella-front.png",
      "/uv-mini-purse-umbrella/UV-mini-purse-umbrella-open-cross.png",
    ],
    media: [
      { type: "image", src: "/uv-mini-purse-umbrella/UV-mini-purse-umbrella-front.png" },
      { type: "image", src: "/uv-mini-purse-umbrella/UV-mini-purse-umbrella-open-cross.png" },
      { type: "image", src: "/uv-mini-purse-umbrella/UV-mini-purse-umbrella-informative.png" },
      { type: "image", src: "/uv-mini-purse-umbrella/portable-UV-protection-umbrella-filddown.png" },
      { type: "image", src: "/uv-mini-purse-umbrella/UV-mini-purse-umbrella-topcross.png" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Umbrella",
    description: "A tiny purse-sized umbrella with UV protection — slips into any bag without taking up space.",
    features: ["Ultra-compact mini size", "UV protective coating", "Fits in a purse or pocket", "Lightweight frame"],
    material: "190T Pongee Fabric, Fiberglass Ribs",
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
        titleAccent: "(Solid Plan Umbrella)",
        features: ["Plain umbrella without any design", "Perfect for brand label or embroidery"],
        image: "/uv-mini-purse-umbrella/UV-mini-purse-umbrella-front.png",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/uv-mini-purse-umbrella/UV-mini-purse-umbrella-front.png",
      },
    },
    offer: DEFAULT_OFFER,
  },
  {
    id: "4",
    name: "C Handle Inverted Umbrella",
    slug: "c-handle-inverted-umbrella",
    isDefaultCategory: true,
    basePrice: 240,
    displayPrice: 499,
    originalPrice: 699,
    discount: 29,
    images: [
      "/C-Handle-Inverted-Umbrella/C-Handle-inverted-umbrella-front-fold.png",
      "/C-Handle-Inverted-Umbrella/C-Handle-inverted-umbrella-frontside-open.png",
    ],
    media: [
      { type: "image", src: "/C-Handle-Inverted-Umbrella/C-Handle-inverted-umbrella-front-fold.png" },
      { type: "image", src: "/C-Handle-Inverted-Umbrella/C-Handle-inverted-umbrella-frontside-open.png" },
      { type: "image", src: "/C-Handle-Inverted-Umbrella/C-Handle-inverted-umbrella-close-front.png" },
      { type: "image", src: "/C-Handle-Inverted-Umbrella/C-Handle-inverted-umbrella-side-open.png" },
      { type: "image", src: "/C-Handle-Inverted-Umbrella/C-Handle-inverted-umbrella-side-open2.png" },
      { type: "image", src: "/C-Handle-Inverted-Umbrella/C-Handle-inverted-umbrella-information.png" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Umbrella",
    description: "An inverted, reverse-folding umbrella with a C-shaped handle — closes dry-side-in for easy car and doorway use.",
    features: ["Reverse/inverted folding", "C-shaped ergonomic handle", "Double-layer wind-resistant canopy", "Stands upright on its own"],
    material: "190T Pongee Fabric, Fiberglass Ribs",
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
        titleAccent: "(Solid Plan Umbrella)",
        features: ["Plain umbrella without any design", "Perfect for brand label or embroidery"],
        image: "/C-Handle-Inverted-Umbrella/C-Handle-inverted-umbrella-front-fold.png",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/C-Handle-Inverted-Umbrella/C-Handle-inverted-umbrella-front-fold.png",
      },
    },
    offer: DEFAULT_OFFER,
  },
];

export const productsData: Product[] = attachSkus(rawProductsData);