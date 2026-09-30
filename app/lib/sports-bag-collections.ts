// ── Types ──────────────────────────────────────────────────────────────────────
// Mirrors office-bag-collection.ts / tote-bag-collection.ts's Product shape for
// type compatibility with the rest of the app. Sports bags don't use sizes,
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
  // NOTE: sports bags have no blank (unprinted) mockup photos yet, so
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
  // Plan/Customized card copy + photos. Since sports bags don't have a
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
// Single source of truth for sports bag pricing (displayPrice,
// sameDayAvailable, etc). The create-razorpay-order API route should look
// products up from this same array — never from anything sent by the client.

type RawColor = Omit<ProductColor, "sku">;
type RawProduct = Omit<Product, "sku" | "colors"> & { colors?: RawColor[] };

const CATEGORY_PREFIX = "SPB";

const COLOR_CODES: Record<string, string> = {
  white: "WHT",
  black: "BLK",
  natural: "NAT",
  navy: "NVY",
  "navy blue": "NVY",
  red: "RED",
  beige: "BEG",
  blue: "BLU",
  grey: "GRY",
  gray: "GRY",
  lime: "LIM",
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

// All eight products use the plain "isDefaultCategory" flow: Plan/Customized
// cards (4. Customized), the simple front-logo upload box, quantity
// (Single Piece/Bulk Order), delivery (standard only — no same-day for this
// category), then Add to Cart / Checkout Now. No sizes, no GSM tiers, no
// color swatches — none of that applies to sports bags right now.
const rawProductsData: RawProduct[] = [
  {
    id: "1",
    name: "Vibrant Lime DrawString Bag",
    slug: "vibrant-lime-drawstring-bag",
    isDefaultCategory: true,
    basePrice: 240,
    displayPrice: 499,
    originalPrice: 699,
    discount: 29,
    images: [
      "/sports-bag/neon-bag-front-view.png",
      "/sports-bag/neon-bag-with-kit.png",
      "/sports-bag/neon-bag-logo.png",
      "/sports-bag/neon-bag-side-view.png",
      "/sports-bag/man-wearing-sports-bag.png",
      "/sports-bag/neon-bag-speficiation.png",
    ],
    media: [
      { type: "image", src: "/sports-bag/neon-bag-front-view.png" },
      { type: "image", src: "/sports-bag/neon-bag-with-kit.png" },
      { type: "image", src: "/sports-bag/neon-bag-side-view.png" },
      { type: "image", src: "/sports-bag/man-wearing-sports-bag.png" },
      { type: "image", src: "/sports-bag/neon-bag-speficiation.png" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Sports Bag",
    description: "A vibrant lime drawstring bag built for the gym — lightweight, durable, and easy to sling on.",
    features: ["Water-resistant fabric", "Reinforced drawstring closure", "Breathable mesh pocket", "Lightweight & durable"],
    material: "Premium Polyester, 300D",
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
        image: "/sports-bag/neon-bag-front-view.png",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/sports-bag/neon-bag-front-view.png",
      },
    },
    offer: DEFAULT_OFFER,
  },
  {
    id: "2",
    name: "Red Drawstring Bag",
    slug: "red-drawstring-bag",
    isDefaultCategory: true,
    basePrice: 240,
    displayPrice: 899,
    originalPrice: 1199,
    discount: 25,
    images: [
      "/red-sports-bag/red-sports-bag-front-view.png",
      "/red-sports-bag/red-sports-bag-side-view.png",
    ],
    media: [
      { type: "image", src: "/red-sports-bag/red-sports-bag-front-view.png" },
      { type: "image", src: "/red-sports-bag/red-sports-bag-side-view.png" },
      { type: "image", src: "/red-sports-bag/red-sports-bag-back-view.png" },
      { type: "image", src: "/red-sports-bag/red-sports-bag-open.png" },
      { type: "image", src: "/red-sports-bag/red-sports-bag-specifications.png" },
      { type: "image", src: "/red-sports-bag/red-sports-bag-wearing-man.png" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Sports Bag",
    description: "A bold red drawstring bag with a roomy main compartment — built for daily training sessions.",
    features: ["Water-resistant fabric", "Reinforced drawstring closure", "Breathable mesh pocket", "Lightweight & durable"],
    material: "Premium Polyester, 300D",
    turnaround: "7-10 business days",
    rating: 4.6,
    reviewCount: 85,
    badge: "Prime",
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
        image: "/red-sports-bag/red-sports-bag-front-view.png",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/red-sports-bag/red-sports-bag-front-view.png",
      },
    },
    offer: DEFAULT_OFFER,
  },
  {
    id: "3",
    name: "Blue Drawstring Bag",
    slug: "blue-drawstring-bag",
    isDefaultCategory: true,
    basePrice: 240,
    displayPrice: 899,
    originalPrice: 1199,
    discount: 25,
    images: [
      "/blue-sport-bag/blue-sports-bag-front.png",
    ],
    media: [
      { type: "image", src: "/blue-sport-bag/blue-sports-bag-front.png" },
      { type: "image", src: "/blue-sport-bag/blue-sports-bag-side.png" },
      { type: "image", src: "/blue-sport-bag/blue-sports-bag-logo.png" },
      { type: "image", src: "/blue-sport-bag/blue-sport-bag-man-wearing.png" },
      { type: "image", src: "/blue-sport-bag/blue-sport-bag-open.png" },
      { type: "image", src: "/blue-sport-bag/blue-sport-bag-specification.png" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Sports Bag",
    description: "A classic blue drawstring bag — sturdy, spacious, and ready for the field or the gym.",
    features: ["Water-resistant fabric", "Reinforced drawstring closure", "Breathable mesh pocket", "Lightweight & durable"],
    material: "Premium Polyester, 300D",
    turnaround: "7-10 business days",
    rating: 4.6,
    reviewCount: 85,
    badge: "Prime",
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
        image: "/blue-sport-bag/blue-sports-bag-front.png",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/blue-sport-bag/blue-sports-bag-front.png",
      },
    },
    offer: DEFAULT_OFFER,
  },
  {
    id: "4",
    name: "Black Drawstring Bag",
    slug: "black-drawstring-bag",
    isDefaultCategory: true,
    basePrice: 240,
    displayPrice: 899,
    originalPrice: 1199,
    discount: 25,
    images: [
      "/black-sports-bag/black-sports-bag-front-view.png",
      "/black-sports-bag/black-sports-bag-back-view.png",
    ],
    media: [
      { type: "image", src: "/black-sports-bag/black-sports-bag-front-view.png" },
      { type: "image", src: "/black-sports-bag/black-sports-bag-back-view.png" },
      { type: "image", src: "/black-sports-bag/black-sports-bag-logo-view.png" },
      { type: "image", src: "/black-sports-bag/black-sports-bag-side-view.png" },
      { type: "image", src: "/black-sports-bag/man-wearing-black-sports-bag.png" },
      { type: "image", src: "/black-sports-bag/product-specification.png" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Sports Bag",
    description: "A versatile black drawstring bag that goes with everything — simple, sturdy, everyday carry.",
    features: ["Water-resistant fabric", "Reinforced drawstring closure", "Breathable mesh pocket", "Lightweight & durable"],
    material: "Premium Polyester, 300D",
    turnaround: "7-10 business days",
    rating: 4.6,
    reviewCount: 85,
    badge: "Prime",
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
        image: "/black-sports-bag/black-sports-bag-front-view.png",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/black-sports-bag/black-sports-bag-front-view.png",
      },
    },
    offer: DEFAULT_OFFER,
  },
  {
    id: "5",
    name: "Grey Drawstring Bag",
    slug: "grey-drawstring-bag",
    isDefaultCategory: true,
    basePrice: 240,
    displayPrice: 899,
    originalPrice: 1199,
    discount: 25,
    images: [
      "/grey-sports-bag/grey-sports-bag-front-logo-view.png",
      "/grey-sports-bag/grey-sports-bag-front-view.png",
    ],
    media: [
      { type: "image", src: "/grey-sports-bag/grey-sports-bag-front-logo-view.png" },
      { type: "image", src: "/grey-sports-bag/grey-sports-bag-front-view.png" },
      { type: "image", src: "/grey-sports-bag/grey-sports-bag-back-view.png" },
      { type: "image", src: "/grey-sports-bag/grey-sports-bag-side-view.png" },
      { type: "image", src: "/grey-sports-bag/grey-sports-bag-specification.png" },
      { type: "image", src: "/grey-sports-bag/man-wearing-sports-grey-bag.png" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Sports Bag",
    description: "A subtle grey drawstring bag with a clean look — an easy daily companion for training gear.",
    features: ["Water-resistant fabric", "Reinforced drawstring closure", "Breathable mesh pocket", "Lightweight & durable"],
    material: "Premium Polyester, 300D",
    turnaround: "7-10 business days",
    rating: 4.6,
    reviewCount: 85,
    badge: "Prime",
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
        image: "/grey-sports-bag/grey-sports-bag-front-view.png",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/grey-sports-bag/grey-sports-bag-front-view.png",
      },
    },
    offer: DEFAULT_OFFER,
  },
  {
    id: "6",
    name: "Sport Red Gym Bag",
    slug: "sport-red-gym-bag",
    isDefaultCategory: true,
    basePrice: 240,
    displayPrice: 899,
    originalPrice: 1199,
    discount: 25,
    images: [
      "/sports-red-gym-bag/sport-red-gym-bag-front.png",
      "/sports-red-gym-bag/sport-red-gym-bag-open.png",
    ],
    media: [
      { type: "image", src: "/sports-red-gym-bag/sport-red-gym-bag-front.png" },
      { type: "image", src: "/sports-red-gym-bag/sport-red-gym-bag-open.png" },
      { type: "image", src: "/sports-red-gym-bag/sport-red-gy-bag-spec-2.png" },
      { type: "image", src: "/sports-red-gym-bag/sport-red-gym-bag-spec-1.png" },
      { type: "image", src: "/sports-red-gym-bag/sport-red-gym-bag-with-man.png" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    // FIXED: was mistakenly labeled "Tote Bags" — this is a gym bag.
    category: "Sports Bag",
    description: "A spacious red gym bag with a wide main opening — built to carry a full kit with room to spare.",
    features: ["Wide-mouth main compartment", "Reinforced base panel", "Separate shoe pocket", "Heavy-duty zippers"],
    material: "Premium Polyester, 600D",
    turnaround: "7-10 business days",
    rating: 4.6,
    reviewCount: 85,
    badge: "Prime",
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
        image: "/sports-red-gym-bag/sport-red-gym-bag-front.png",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/sports-red-gym-bag/sport-red-gym-bag-front.png",
      },
    },
    offer: DEFAULT_OFFER,
  },
  {
    id: "7",
    name: "Sport Black Gym Bag",
    slug: "sports-black-gym-bag",
    isDefaultCategory: true,
    basePrice: 240,
    displayPrice: 899,
    originalPrice: 1199,
    discount: 25,
    images: [
      "/sports-black-gym-bag/sports-black-gym-bag-front.png",
      "/sports-black-gym-bag/black-gym-bag-open.png",
    ],
    media: [
      { type: "image", src: "/sports-black-gym-bag/black-gym-bag-open.png" },
      { type: "image", src: "/sports-black-gym-bag/sports-black-gym-bag-front.png" },
      { type: "image", src: "/sports-black-gym-bag/black-gym-bag-front.png" },
      { type: "image", src: "/sports-black-gym-bag/black-gym-bag-spec2.png" },
      { type: "image", src: "/sports-black-gym-bag/sport-black-gym-bag-spec1.png" },
      { type: "image", src: "/sports-black-gym-bag/man-with-black-gym-bag.png" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    // FIXED: was mistakenly labeled "Tote Bags" — this is a gym bag.
    category: "Sports Bag",
    description: "A no-nonsense black gym bag — durable construction with a dedicated shoe compartment.",
    features: ["Wide-mouth main compartment", "Reinforced base panel", "Separate shoe pocket", "Heavy-duty zippers"],
    material: "Premium Polyester, 600D",
    turnaround: "7-10 business days",
    rating: 4.6,
    reviewCount: 85,
    badge: "Prime",
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
        image: "/sports-black-gym-bag/sports-black-gym-bag-front.png",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/sports-black-gym-bag/sports-black-gym-bag-front.png",
      },
    },
    offer: DEFAULT_OFFER,
  },
  {
    id: "8",
    name: "Sport Grey Gym Bag",
    slug: "sport-grey-gym-bag",
    isDefaultCategory: true,
    basePrice: 240,
    displayPrice: 899,
    originalPrice: 1199,
    discount: 25,
    images: [
      "/sports-grey-gym-bag/sports-gym-grey-bag.png",
      "/sports-grey-gym-bag/grey-gym-bag-in-gyn.png",
    ],
    media: [
      { type: "image", src: "/sports-grey-gym-bag/grey-gym-bag-in-gyn.png" },
      { type: "image", src: "/sports-grey-gym-bag/grey-gym-bag-on-stairs.png" },
      { type: "image", src: "/sports-grey-gym-bag/sports-gym-grey-bag.png" },
      { type: "image", src: "/sports-grey-gym-bag/grey-gym-bag-product-specification.png" },
      { type: "image", src: "/sports-grey-gym-bag/grey-gym-bag-product-specif.png" },
      { type: "image", src: "/sports-grey-gym-bag/man-wearing-grey-sports-bag.png" },
      { type: "image", src: "/sports-grey-gym-bag/men-carrying-grey-gym-bag.png" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    // FIXED: was mistakenly labeled "Tote Bags" — this is a gym bag.
    category: "Sports Bag",
    description: "A rugged grey gym bag with a roomy interior — built for gear that has to keep up with you.",
    features: ["Wide-mouth main compartment", "Reinforced base panel", "Separate shoe pocket", "Heavy-duty zippers"],
    material: "Premium Polyester, 600D",
    turnaround: "7-10 business days",
    rating: 4.6,
    reviewCount: 85,
    badge: "Prime",
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
        image: "/sports-grey-gym-bag/sports-gym-grey-bag.png",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/sports-grey-gym-bag/sports-gym-grey-bag.png",
      },
    },
    offer: DEFAULT_OFFER,
  },
];

export const productsData: Product[] = attachSkus(rawProductsData);