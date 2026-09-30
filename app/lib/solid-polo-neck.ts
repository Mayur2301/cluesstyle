// ── Types ──────────────────────────────────────────────────────────────────────

import type { QtyTier } from "@/app/lib/pricing";
export type { QtyTier };

export interface MediaItem {
  type: "image" | "video";
  src: string;
  poster?: string;
}

export interface ProductColor {
  label: string;
  title: string;
  hex: string;
  sku: string;
  media?: MediaItem[];
  // Blank (unprinted) shirt photos for this color — front, back, left, right.
  // Used only in the logo live-preview canvas on customizable products.
  blankMedia?: MediaItem[];
  // Per-color same-day delivery override. If omitted, the color inherits
  // the product-level `sameDayAvailable` value — so you only need to set
  // this explicitly on colors that DIFFER from the product default
  // (e.g. a color that's out of stock for same-day dispatch).
  sameDayAvailable?: boolean;
}

export interface Offer {
  code: string;
  saveAmount: number;
  description: string;
  minOrder: number;
  discountPct: number;
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
  turnaround?: string;
  sameDayTurnaround?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  colors?: ProductColor[];
  sizes?: string[];
  inStock?: boolean;
  discount?: number;
  weight?: number;
  customizable?: boolean;
  logoUploadEnabled?: boolean;  
  sameDayAvailable?: boolean;
  offer?: Offer;
  availablepatterns?:string;
  cardBg?: string;
  // This category's own bulk-quantity discount table — see TSHIRT_QTY_TIERS
  // above. Attached automatically to every product by attachSkus(), same as
  // `sku`, so nothing below needs to set it by hand.
  qtyTiers?: QtyTier[];
}

// ── Bulk quantity tiers (this category's own — NOT shared with other
// product categories) ───────────────────────────────────────────────────────
// Each category can define its own bulk breakpoints/discounts. This table is
// attached to every product below (see attachSkus) as `product.qtyTiers`, so
// BOTH the product page (ProductDetailClient, for what's shown) and
// create-razorpay-order (for what's actually charged) read it from the same
// place and can never drift apart. To change t-shirt bulk pricing, edit only
// this array — do not fork the numbers into ProductDetailClient.tsx.
//
// IMPORTANT: this file is a byte-for-byte duplicate of solid-polo-neck.ts
// (pre-existing in this codebase). Keep this array identical in both files.
export const TSHIRT_QTY_TIERS: QtyTier[] = [
  { minQty: 4, maxQty: 9, discount: 0, label: "4-9" },
  { minQty: 10, maxQty: 29, discount: 5, label: "10-29" },
  { minQty: 30, maxQty: 49, discount: 10, label: "30-49" },
  { minQty: 50, maxQty: 59, discount: 15, label: "50-59" },
  { minQty: 60, maxQty: 79, discount: 18, label: "60-79" },
  { minQty: 80, maxQty: 99, discount: 22, label: "80-99" },
  { minQty: 100, maxQty: Infinity, discount: 27, label: "100+" },
];

// ── Default Offer ──────────────────────────────────────────────────────────────

export const DEFAULT_OFFER: Offer = {
  code: "PREPAID5",
  saveAmount: 25,
  description: "Get EXTRA 5% OFF on all Prepaid orders above Rs.499.",
  minOrder: 499,
  discountPct: 5,
};

// ── Products Data ──────────────────────────────────────────────────────────────
// NOTE: this is the single source of truth for product pricing (displayPrice,
// sameDayAvailable, sizes, etc). The create-razorpay-order API route looks
// products up from this same array — never from anything sent by the client —
// so the amount charged can never drift from what's shown on the page.
type RawColor = Omit<ProductColor, "sku">;
type RawProduct = Omit<Product, "sku" | "colors"> & { colors?: RawColor[] };

const CATEGORY_PREFIX = "PTS"; // Oversized T-Shirt

const COLOR_CODES: Record<string, string> = {
  white: "WHT",
  red: "RED",
  "navy blue": "NVY",
  lavender: "LAV",
  lavendar: "LAV",
  beige: "BEG",
  "ice blue": "ICE-BLUE",
  "carbon grey": "CG-GRAY",
  black: "BLK",
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
    return { ...p, sku: productSku, qtyTiers: TSHIRT_QTY_TIERS, ...(colors ? { colors } : {}) } as Product;
  });
}
const rawProductsData: RawProduct[] = [
 {
    id: "1",
    name: "Solid Polo T-Shirts",
    slug: "solid-polo-t-shirts",
    basePrice: 499,
    displayPrice: 499,
    originalPrice: 799,
    discount: 35.04,
    images: ["/office-bag/blue-office-bag/blue-office-bag-front.png"],
    media: [
      { type: "image", src: "/solid-polo-neck-colar/apple-green/apple-green-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/apple-green/apple-green-solid-polo-tshirt-back.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/white/left-facing.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/white/right-facing.webp" },
    ],
    printMethod: "DTF, Embroider,Screen Pritng",
    availablepatterns:"Half Sleeves",
    quantityReq: 1,
    priceRange: "budget",
    category: "Solid Polo T-Shirt",
    description: "High-quality screen printing on sturdy canvas tote bags.",
    features: ["250 – 260 gsm", "100% combed ring-spun cotton", "Compacted Pre-shrunk", "Double needle stitch on the shoulder, sleeves and side slits on the bottom hem","3 Button placket with dyed to match buttons and bottom box stitch","Soft flow dyed","Color fastness Guaranteed"],
    material: "100% Cotton, Cotton pique fabric, 260 GSM",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    colors: [
      {
        label: "Green Solid Polo T-Shirt",
        title: "Green Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#77ff1d",
        media: [
        { type: "image", src: "/solid-polo-neck-colar/apple-green/apple-green-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/apple-green/apple-green-solid-polo-tshirt-back.webp" },
       
        ],
      },
      {
        label: "Aqua Solid Polo T-Shirt",
        title: "Aqua Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#66bade",
        media: [
          { type: "image", src: "/solid-polo-neck-colar/aqua/aqua-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/aqua/aqua-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Aqua Marine Solid Polo T-Shirt",
        title: "Aqua Marine Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#166485",
        media: [
         { type: "image", src: "/solid-polo-neck-colar/aquamarinne/aquamarine-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/aquamarinne/aquamarine-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Beige Solid Polo T-Shirt",
        title: "Beige Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#e7d0b1",
        media: [
         { type: "image", src: "/solid-polo-neck-colar/beige/beige-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/beige/beige-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Berry Solid Polo T-Shirt",
        title: "Berry Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#e3caac",
        media: [
       { type: "image", src: "/solid-polo-neck-colar/berry/berry-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/berry/berry-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Black Solid Polo T-Shirt",
        title: "Black Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#030303",
        media: [
        { type: "image", src: "/solid-polo-neck-colar/black/blck-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/black/blck-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Black Melange Solid Polo T-Shirt",
        title: "Black Melange Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#31322d",
        media: [
          { type: "image", src: "/solid-polo-neck-colar/black-melange/black-melange-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/black-melange/black-melange-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Chestnut Solid Polo T-Shirt",
        title: "Chestnut Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#8b3d16",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/chestnut/chestnut-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/chestnut/chestnut-solid-polo-tshirt-back.webp" },
        ],
      },

      {
        label: "Cocoa Solid Polo T-Shirt",
        title: "Cocoa Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#673302",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/cocoa/cocoa-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/cocoa/cocoa-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Coral Green Solid Polo T-Shirt",
        title: "Coral Green Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#33a49e",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/coral green/coral-green-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/coral green/coral-green-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Cream Solid Polo T-Shirt",
        title: "Cream Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#e2d0a1",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/cream/crean-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/cream/crean-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Dark Denim Solid Polo T-Shirt",
        title: "Dark Denim Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#275693",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/dark denim/dark-denim-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/dark denim/dark-denim-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Denim Solid Polo T-Shirt",
        title: "Denim Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#3e4b72",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/denim/denim-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/denim/denim-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Electric Blue Solid Polo T-Shirt",
        title: "Electric Blue Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#2848c0",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/electric blue/electric-blue-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/electric blue/electric-blue-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Emerald Solid Polo T-Shirt",
        title: "Emerald Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#237237",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/emerald/emerald-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/emerald/emerald-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Forest Green Solid Polo T-Shirt",
        title: "Forest Green Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#0b571e",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/forest green/forest green-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/forest green/forest green-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Grey Solid Polo T-Shirt",
        title: "Grey Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#7e7e7e",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/grey/grey-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/grey/grey-solid-polo-tshirt-bck.webp" },
        ],
      },


       {
        label: "Imperial Blue Solid Polo T-Shirt",
        title: "Imperial Blue Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#1066bd",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/imperial-blue/imperial-blue-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/imperial-blue/imperial-blue-solid-polo-tshirt-back.webp" },
        ],
      },


       {
        label: "Lemon Solid Polo T-Shirt",
        title: "Lemon Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#eeee5b",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/lemon/lemon-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/lemon/lemon-solid-polo-tshirt-back.webp" },
        ],
      },


       {
        label: "Light Denim Solid Polo T-Shirt",
        title: "Light Denim Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#5273ab",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/light denim/light-denim-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/light denim/light-denim-solid-polo-tshirt-back.webp" },
        ],
      },


       {
        label: "Lime Green Solid Polo T-Shirt",
        title: "Lime Green Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#eee967",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/lime green/lime-green-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/lime green/lime-green-solid-polo-tshirt-back.webp" },
        ],
      },


       {
        label: "Magenta Solid Polo T-Shirt",
        title: "Magenta Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#e88f7b",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/magenta/magenta-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/magenta/magenta-solid-polo-tshirt-back.webp" },
        ],
      },


       {
        label: "Maroon Solid Polo T-Shirt",
        title: "Maroon Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#8b3a28",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/maroon/maroon-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/maroon/maroon-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Military Green Solid Polo T-Shirt",
        title: "Military Green Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#457a67",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/military green/military-green-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/military green/military-green-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Mulberry Solid Polo T-Shirt",
        title: "Mulberry Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#5d3155",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/mulberry/mulberry-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/mulberry/mulberry-solid-polo-tshirt-back.webp" },
        ],
      },

       {
        label: "Natural Solid Polo T-Shirt",
        title: "Natural Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#f6e2dd",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/natural/natural-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/natural/natural-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Orange Solid Polo T-Shirt",
        title: "Orange Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#fec403",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/orange/orange-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/orange/orange-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Peach Solid Polo T-Shirt",
        title: "Peach Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#e48772",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/peach/peach-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/peach/peach-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Pink Solid Polo T-Shirt",
        title: "Pink Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#f525b6",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/pink/pink-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/pink/pink-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Red Solid Polo T-Shirt",
        title: "Red Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#e92b00",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/red/red-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/red/red-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Royal Blue Solid Polo T-Shirt",
        title: "Royal Blue Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#2d5ed2",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/royal blue/royal-blue-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/royal blue/royal-blue-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Sky Solid Polo T-Shirt",
        title: "Sky Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#7bc7e8",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/sky/sky-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/sky/sky-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Sunflower Solid Polo T-Shirt",
        title: "Sunflower Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#fff700",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/sunflower/sunflower-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/sunflower/sunflower-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Tangerine Solid Polo T-Shirt",
        title: "Tangerine Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#e88f7b",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/tangerine/tangerine-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/tangerine/tangerine-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "True Navy Solid Polo T-Shirt",
        title: "True Navy Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#e88f7b",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/true navy/true-navy-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/true navy/true-navy-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "True Royal Blue Solid Polo T-Shirt",
        title: "True Royal Blue Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#276cbc",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/true blue/true-blue-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/true blue/true-blue-solid-polo-tshirt-front.webp" },
        ],
      },

      {
        label: "Turquoise Blue Solid Polo T-Shirt",
        title: "Turquoise Blue Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#276cbc",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/turquoise blue/turquoise-blue-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/turquoise blue/turquoise-blue-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "White Solid Polo T-Shirt",
        title: "White Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#ffffff",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/white/white-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/white/white-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Off White Melange Solid Polo T-Shirt",
        title: "Off White Melange Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#f8f9fa",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/white melange/white-melange-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/white melange/white-melange-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Wine Solid Polo T-Shirt",
        title: "Wine Solid Polo T-Shirt | 260 GSM Cotton Polo Shirt",
        hex: "#276cbc",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/wine/wine-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/wine/wine-solid-polo-tshirt-back.webp" },
        ],
      },


    ],
      sizes: ["XS", "S", "M", "L", "XL", "XXL","3XL","4XL","5XL","6XL"],
    inStock: true,
    weight: 250,
    customizable: true,
    sameDayAvailable: true,
    offer: {
      code: "PREPAID5",
      saveAmount: 64,
      description: "Get EXTRA 5% OFF on all Prepaid orders above Rs.1299.",
      minOrder: 1299,
      discountPct: 5,
    },
  },
  {
    id: "2",
    name: "Red Oversized T-Shirts",
    slug: "tipping-collar-polo-t-shirts",
    basePrice: 549,
     displayPrice: 549,
    originalPrice: 899,
    discount: 29,
    availablepatterns:"Half Sleeves",
    cardBg:"#f9f9f9",
    
    images: ["/office-bag/blue-office-bag/blue-office-bag-front.png"],
    media: [
      { type: "image", src: "/solid-polo-neck-colar/red/front-facing.webp" },
      { type: "image", src: "/solid-polo-neck-colar/red/back-facing.webp" },
      { type: "image", src: "/solid-polo-neck-colar/red/left-facing.webp" },
      { type: "image", src: "/solid-polo-neck-colar/red/right-facing.webp" },
    ],
    printMethod: "DTF & Embriodery",
    quantityReq: 1,
    priceRange: "budget",
    category: "Polo Neck Tipping TShirts",
    description: "High-quality screen printing on sturdy canvas tote bags.",
    features: ["250 – 260 gsm", "100% combed ring-spun cotton", "Pique knit", "Compacted Pre-shrunk","Double needle stitch on the shoulder, sleeves and bottom hem","3 Button placket with dyed to match buttons and bottom","Soft flow dyed","Colour fastness Guaranteed"],
    material: "100% Cotton, Cotton pique fabric, 260 GSM",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    colors: [
      {
        label: "Apple Green with White Tipping",
        title: "Apple Green Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#99ef4f",
        media: [
          { type: "image", src: "/tipping-collar-t-shirt/apple-green-with-white/apple-green-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/apple-green-with-white/apple-green-tipping-white-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/apple-green-with-white/apple-green-tipping-white-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/apple-green-with-white/apple-green-tipping-white-collar-tshirt-right.webp" },
           { type: "image", src: "/tipping-collar-t-shirt/apple-green-with-white/apple-green-tipping-white-collar-tshirt-info.webp" },
        ],
      },

      {
        label: "Beige with Black Collar Tipping Polo",
        title: "Beige Collar with Black Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#eedddd",
        media: [
          { type: "image", src: "/tipping-collar-t-shirt/beige-with-black/beige-tipping-black-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/beige-with-black/beige-tipping-black-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/beige-with-black/beige-tipping-black-collar-tshirt-left-side.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/beige-with-black/beige-tipping-black-collar-tshirt-right-side.webp" },
           { type: "image", src: "/tipping-collar-t-shirt/beige-with-black/beige-tipping-black-collar-tshirt-info.webp" },
        ],
      },
            {
        label: "Black Melange with White Tipping Collar Polo",
        title: "Black Melange Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#0c142a",
        media: [
          { type: "image", src: "/tipping-collar-t-shirt/black melange with white/black-melange-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/black melange with white/black-melange-tipping-white-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/black melange with white/black-melange-tipping-white-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/black melange with white/black-melange-tipping-white-collar-tshirt-right.webp" },
           { type: "image", src: "/tipping-collar-t-shirt/black melange with white/black-melange-tipping-white-collar-tshirt-info.webp" },
        ],
      },
      {
        label: "Black with Red Tipping Polo T-Shirt",
        title: "Black Collar with Red Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#b497da",
        media: [
          { type: "image", src: "/tipping-collar-t-shirt/black-with-red/black-tipping-red-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/black-with-red/black-tipping-red-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/black-with-red/black-tipping-red-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/black-with-red/black-tipping-red-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/black-with-red/black-tipping-red-collar-tshirt-info.webp" },
        ],
      },
      {
        label: "Black with Royal Blue Tipping",
        title: "Black Collar with Royal Blue Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#e3caac",
        media: [
          { type: "image", src: "/tipping-collar-t-shirt/black-with-royal-blue/black-tipping-royal-blue-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/black-with-royal-blue/black-tipping-royal-blue-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/black-with-royal-blue/black-tipping-royal-blue-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/black-with-royal-blue/black-tipping-royal-blue-collar-tshirt-right.webp" },
           { type: "image", src: "/tipping-collar-t-shirt/black-with-royal-blue/black-tipping-royal-blue-collar-tshirt-info.webp" },
        ],
      },
      {
        label: "Black Collar with White Tipping",
        title: "Black Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#aedaf2",
        media: [
          { type: "image", src: "/tipping-collar-t-shirt/black-with-white/black-white-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/black-with-white/black-white-tipping-white-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/black-with-white/black-white-tipping-white-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/black-with-white/black-white-tipping-white-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/black-with-white/black-white-tipping-white-collar-tshirt-info.webp" },
        ],
      },
      {
        label: "Cream Collar with Black Tipping Polo",
        title: "Cream Collar with Black Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#31322d",
        media: [
          { type: "image", src: "/tipping-collar-t-shirt/cream-with-black/cream-tipping-black-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/cream-with-black/cream-tipping-black-collar-tshirt-black.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/cream-with-black/cream-tipping-black-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/cream-with-black/cream-tipping-black-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/cream-with-black/cream-tipping-black-collar-tshirt-info.webp" },
        ],
      },
      {
        label: "Dark Denim with White Tipping Polo",
        title: "Dark Denim Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/dark denim with white/dark-denim-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/dark denim with white/dark-denim-tipping-white-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/dark denim with white/dark-denim-tipping-white-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/dark denim with white/dark-denim-tipping-white-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/dark denim with white/dark-denim-tipping-white-collar-tshirt-info.webp" },
        ],
      },

      {
        label: "Denim with White Collar Tipping Polo",
        title: "Denim Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/denim-with-white/denim-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/denim-with-white/denim-tipping-white-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/denim-with-white/denim-tipping-white-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/denim-with-white/denim-tipping-white-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/denim-with-white/denim-tipping-white-collar-tshirt-info.webp" },
        ],
      },
      {
        label: "Electric Blue Collar with White Tipping Polo",
        title: "Electric Blue Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/electric-blue-with-white/electric-blue-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/electric-blue-with-white/electric-blue-tipping-white-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/electric-blue-with-white/electric-blue-tipping-white-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/electric-blue-with-white/electric-blue-tipping-white-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/electric-blue-with-white/electric-blue-tipping-white-collar-tshirt-info.webp" },
        ],
      },

      {
        label: "Forest Green Collar with White Tipping Polo",
        title: "Forest Green Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/forest-green-with-white/forest-green-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/forest-green-with-white/forest-green-tipping-white-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/forest-green-with-white/forest-green-tipping-white-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/forest-green-with-white/forest-green-tipping-white-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/forest-green-with-white/forest-green-tipping-white-collar-tshirt-info.webp" },
        ],
      },

       {
        label: "Grey with Black Collar Tipping Polo",
        title: "Grey Collar with Black Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/grey with black/grey-tipping-black-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/grey with black/grey-tipping-black-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/grey with black/grey-tipping-black-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/grey with black/grey-tipping-black-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/grey with black/grey-tipping-black-collar-tshirt-info.webp" },
        ],
      },

      {
        label: "Light Denim Collar with White Tipping Polo",
        title: "Light Denim Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/light-denim-with-white/light-denim-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/light-denim-with-white/light-denim-tipping-white-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/light-denim-with-white/light-denim-tipping-white-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/light-denim-with-white/light-denim-tipping-white-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/light-denim-with-white/light-denim-tipping-white-collar-tshirt-info.webp" },
        ],
      },

      {
        label: "Magenta Collar with White Tipping Polo",
        title: "Magenta Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/magenta-with-white/magenta-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/magenta-with-white/magenta-tipping-white-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/magenta-with-white/magenta-tipping-white-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/magenta-with-white/magenta-tipping-white-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/magenta-with-white/magenta-tipping-white-collar-tshirt-info.webp" },
        ],
      },

       {
        label: "Maroon Collar with White Tipping Polo",
        title: "Maroon Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/maroon-with-white/maroon-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/maroon-with-white/maroon-tipping-white-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/maroon-with-white/maroon-tipping-white-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/maroon-with-white/maroon-tipping-white-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/maroon-with-white/maroon-tipping-white-collar-tshirt-info.webp" },
        ],
      },
 {
        label: "Military Green Collar with White Tipping Polo",
        title: "Military Green Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/militry-green/militery-green-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/militry-green/militery-green-tipping-white-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/militry-green/militery-green-tipping-white-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/militry-green/militery-green-tipping-white-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/militry-green/militery-green-tipping-white-collar-tshirt-info.webp" },
        ],
      },

      
       {
        label: "Navy Collar with White Tipping Polo",
        title: "Navy Blue Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/navy-blue-with-white/navy-blue-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/navy-blue-with-white/navy-blue-tipping-white-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/navy-blue-with-white/navy-blue-tipping-white-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/navy-blue-with-white/navy-blue-tipping-white-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/navy-blue-with-white/navy-blue-tipping-white-collar-tshirt-info.webp" },
        ],
      },

      {
        label: "Ocean Blue Collar with Black Tipping Polo",
        title: "Ocean Blue Collar with Black Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/ocean-blue-with-black/ocean-blue-tipping-black-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/ocean-blue-with-black/ocean-blue-tipping-black-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/ocean-blue-with-black/ocean-blue-tipping-black-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/ocean-blue-with-black/ocean-blue-tipping-black-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/ocean-blue-with-black/ocean-blue-tipping-black-collar-tshirt-info.webp" },
        ],
      },

      {
        label: "Red Collar with Black Tipping Polo",
        title: "Red Collar with Black Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/red-with-black/red-tipping-black-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/red-with-black/red-tipping-black-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/red-with-black/red-tipping-black-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/red-with-black/red-tipping-black-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/red-with-black/red-tipping-black-collar-tshirt-info.webp" },
        ],
      },

      {
        label: "Red with White Collar Tipping Polo",
        title: "Red Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/red-with-white/red-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/red-with-white/red-tipping-white-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/red-with-white/red-tipping-white-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/red-with-white/red-tipping-white-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/red-with-white/red-tipping-white-collar-tshirt-info.webp" },
        ],
      },


      {
        label: "Royal Blue with White Collar Tipping Polo",
        title: "Royal Blue Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/royal-blue-with-white/royal-blue-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/royal-blue-with-white/royal-blue-tipping-white-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/royal-blue-with-white/royal-blue-tipping-white-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/royal-blue-with-white/royal-blue-tipping-white-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/royal-blue-with-white/royal-blue-tipping-white-collar-tshirt-info.webp" },
        ],
      },

       {
        label: "Sky Blue Collar with Black Tipping Polo",
        title: "Sky Blue Collar with Black Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/sky-blue-with-black/sky-blue-tipping-black-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/sky-blue-with-black/sky-blue-tipping-black-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/sky-blue-with-black/sky-blue-tipping-black-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/sky-blue-with-black/sky-blue-tipping-black-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/sky-blue-with-black/sky-blue-tipping-black-collar-tshirt-info.webp" },
        ],
      },

       {
        label: "Tangerine Collar with White Tipping Polo",
        title: "Tangerine Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/tangerine-with-white/tangerine-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/tangerine-with-white/tangerine-tipping-white-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/tangerine-with-white/tangerine-tipping-white-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/tangerine-with-white/tangerine-tipping-white-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/tangerine-with-white/tangerine-tipping-white-collar-tshirt-info.webp" },
        ],
      },

      {
        label: "Torquoise Blue Collar with White Tipping Polo",
        title: "Turquoise Blue Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/turquoise-blue-with-white/turquoise-blue-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/turquoise-blue-with-white/turquoise-blue-tipping-white-collar-tshirt-black.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/turquoise-blue-with-white/turquoise-blue-tipping-white-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/turquoise-blue-with-white/turquoise-blue-tipping-white-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/turquoise-blue-with-white/turquoise-blue-tipping-white-collar-tshirt-info.webp" },
        ],
      },

      {
        label: "White Melange Collar with Black Tipping Polo",
        title: "White Melange Collar with Black Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/white-melange-with-black/white-melange-tipping-black-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/white-melange-with-black/white-melange-tipping-black-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/white-melange-with-black/white-melange-tipping-black-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/white-melange-with-black/white-melange-tipping-black-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/white-melange-with-black/white-melange-tipping-black-collar-tshirt-info.webp" },
        ],
      },

      {
        label: "White Melange with Black Collar Tipping Polo",
        title: "White Collar with Black Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/white-with-black/white-tipping-black-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/white-with-black/white-tipping-black-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/white-with-black/white-tipping-black-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/white-with-black/white-tipping-black-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/white-with-black/white-tipping-black-collar-tshirt-info.webp" },
        ],
      },


      {
        label: "White with Royal Blue Collar Tipping Polo",
        title: "White Collar with Royal Blue Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/white-with-blue/white-tipping-royal-blue-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/white-with-blue/white-tipping-royal-blue-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/white-with-blue/white-tipping-royal-blue-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/white-with-blue/white-tipping-royal-blue-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/white-with-blue/white-tipping-royal-blue-collar-tshirt-info.webp" },
        ],
      },

      {
        label: "White with Red Collar Tipping Polo",
        title: "White Collar with Red Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/white-with-red/white-tipping-red-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/white-with-red/white-tipping-red-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/white-with-red/white-tipping-red-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/white-with-red/white-tipping-red-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/white-with-red/white-tipping-red-collar-tshirt-info.webp" },
        ],
      },

      {
        label: "Yellow with Black Collar Tipping Polo",
        title: "Yellow Collar with Black Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
            { type: "image", src: "/tipping-collar-t-shirt/yellow-with-black/yellow-tipping-black-collar-tshirt-front.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/yellow-with-black/yellow-tipping-black-collar-tshirt-back.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/yellow-with-black/yellow-tipping-black-collar-tshirt-left.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/yellow-with-black/yellow-tipping-black-collar-tshirt-right.webp" },
          { type: "image", src: "/tipping-collar-t-shirt/yellow-with-black/yellow-tipping-black-collar-tshirt-info.webp" },
        ],
      },

    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL","3XL","4XL","5XL","6XL"],
    inStock: true,
    weight: 300,
    customizable: true,
    sameDayAvailable: true,
    offer: DEFAULT_OFFER,
  },
  {
    id: "3",
    name: "Custom Solid Polo T-Shirt",
    slug: "customized-solid-polo-t-shirt",
    basePrice: 575,
     displayPrice: 575,
    originalPrice: 999,
    discount: 29,
    images: ["/office-bag/blue-office-bag/blue-office-bag-front.png"],
    media: [
      { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-side.webp" },
          { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-side-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-side-info.webp" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    availablepatterns:"Half Sleeves",
    category: "Custom Solid Polo T-Shirt",
    description: "High-quality screen printing on sturdy canvas tote bags.",
    features: ["250 – 260 gsm", "100% combed ring-spun cotton", "Compacted Pre-shrunk", "Double needle stitch on the shoulder, sleeves and side slits on the bottom hem","3 Button placket with dyed to match buttons and bottom box stitch","Soft flow dyed","Color fastness Guaranteed"],
    material: "100% Cotton, Cotton pique fabric, 260 GSM",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
     printMethod: "DTF & Embriodery",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    colors: [
      {
        label: "AppleGreen",
        title: "AppleGreen Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#008f07",
        sameDayAvailable: true,
        media: [
          { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-back.webp" },
           { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-side.webp" },
          
            { type: "image", src: "/solid-polo-neck-colar/apple-green/apple-green-solid-polo-tshirt-left.webp" },
            { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-side-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-side-info.webp" },
        ],
         blankMedia: [
            { type: "image", src: "/solid-polo-neck-colar/apple-green/apple-green-solid-polo-tshirt-front.webp" },
            { type: "image", src: "/solid-polo-neck-colar/apple-green/apple-green-solid-polo-tshirt-back.webp" },
           { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-side.webp" },
             { type: "image", src: "/solid-polo-neck-colar/apple-green/apple-green-solid-polo-tshirt-left.webp" },
             
              ],
      },

      {
        label: "Aqua",
        title: "Aqua Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#0cc2bf",
        sameDayAvailable: true,
        media: [
          { type: "image", src: "/solid-polo-t-shirt/aqua/custom-logo-aqua-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/aqua/custom-logo-aqua-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/aqua/custom-logo-aqua-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/aqua/custom-logo-aqua-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/aqua/custom-logo-aqua-solid-polo-tshirt-side.webp" },
          { type: "image", src: "/solid-polo-t-shirt/aqua/custom-logo-aqua-solid-polo-tshirt-info.webp" },
        ],
        blankMedia: [
            { type: "image", src: "/solid-polo-neck-colar/aqua/aqua-solid-polo-tshirt-front.webp" },
            { type: "image", src: "/solid-polo-neck-colar/aqua/aqua-solid-polo-tshirt-back.webp" },
            { type: "image", src: "/solid-polo-t-shirt/aqua/custom-logo-aqua-solid-polo-tshirt-right.webp" },
            { type: "image", src: "/solid-polo-t-shirt/aqua/custom-logo-aqua-solid-polo-tshirt-left.webp" },

        ],
      },
      {
        label: "AquaMarine",
        title: "AquaMarine Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#015c6a",
        media: [
          { type: "image", src: "/solid-polo-t-shirt/aquamarinne/custom-logo-aquamarine-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/aquamarinne/custom-logo-aquamarine-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/aquamarinne/custom-logo-aquamarine-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/aquamarinne/custom-logo-aquamarine-solid-polo-tshirt-right.webp" },
           { type: "image", src: "/solid-polo-t-shirt/aquamarinne/custom-polo-solid-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/aquamarinne/custom-logo-aquamarine-solid-polo-tshirt-info.webp" },
        ],
        blankMedia: [
            { type: "image", src: "/solid-polo-neck-colar/aquamarinne/aquamarine-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/aquamarinne/aquamarine-solid-polo-tshirt-back.webp" },
      { type: "image", src: "/solid-polo-t-shirt/aquamarinne/custom-logo-aquamarine-solid-polo-tshirt-right.webp" },
       { type: "image", src: "/solid-polo-t-shirt/aquamarinne/custom-polo-solid-left.webp" },
        ],
      },
            {
        label: "BEIGE",
        title: "Beige Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#f0b7ba",
        media: [
          { type: "image", src: "/solid-polo-t-shirt/BEIGE/custom-logo-beige-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/BEIGE/custom-logo-beige-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/BEIGE/custom-logo-beige-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/BEIGE/custom-logo-beige-solid-polo-tshirt-right.webp" },
           { type: "image", src: "/solid-polo-t-shirt/BEIGE/custom-logo-beige-solid-polo-tshirt-info.webp" },
        ],

        blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/beige/beige-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/beige/beige-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-t-shirt/BEIGE/custom-logo-beige-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/beige/custom-beige-solid-left.webp" },
         
        ],

      },
      {
        label: "Berry",
        title: "Berry Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#522a2a",
        media: [
          { type: "image", src: "/solid-polo-t-shirt/berry/custom-logo-berry-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/berry/custom-logo-berry-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/berry/custom-logo-berry-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/berry/custom-logo-berry-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/berry/custom-logo-berry-solid-polo-tshirt-info.webp" },
        ],
          blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/berry/berry-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/berry/berry-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/berry/custom-logo-berry-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/berry/custom-berry-left.webp" },
         
        ],
      },
      {
        label: "Solid Black",
        title: "Black Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
          { type: "image", src: "/solid-polo-t-shirt/black/custom-logo-black-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black/custom-logo-black-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black/custom-logo-black-solid-polo-tshirt-side.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black/custom-logo-black-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black/custom-logo-black-solid-polo-tshirt-info.webp" },
        ],
         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/black/blck-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/black/blck-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/black/custom-logo-black-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/black/custom-logo-black-left.webp" },
         
        ],
      },
      {
        label: "Black Melange",
        title: "Black Melange Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#31322d",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/black melange/custom-logo-black-melange-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black melange/custom-logo-black-melange-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black melange/custom-logo-black-melange-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black melange/custom-logo-black-melange-solid-polo-tshirt-side.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black melange/custom-logo-black-melange-solid-polo-tshirt-info.webp" },
          
        ],

         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/black-melange/black-melange-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/black-melange/black-melange-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/black-melange/custom-logo-black-melange-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/black-melange/custom-black-malenge-left.webp" },
         
        ],

      },
      


      {
        label: "Bottle Green",
        title: "Bottle Green Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#0d3b2c",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/bottle green/custom-logo-bottle-green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/bottle green/custom-logo-bottle-green-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/bottle green/custom-logo-bottle-green-solid-polo-tshirt-side2.webp" },
          { type: "image", src: "/solid-polo-t-shirt/bottle green/custom-logo-bottle-green-solid-polo-tshirt-info.webp" },
          
        ],
          blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/bottle-green/bottle-green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/bottle-green/bottle-green-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/bottle-green/bottle-green-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/bottle-green/bottle-green-left.webp" },
         
        ],
      },

      {
        label: "Chestnut",
        title: "Chestnut Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#e4dbdb",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/chestnut/custom-logo-chestnut-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/chestnut/custom-logo-chestnut-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/chestnut/custom-logo-chestnut-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/chestnut/custom-logo-chestnut-solid-polo-tshirt-right.webp" },
           { type: "image", src: "/solid-polo-t-shirt/chestnut/custom-logo-chestnut-solid-polo-tshirt-info.webp" },
          
        ],
         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/chestnut/chestnut-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/chestnut/chestnut-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/chestnut/custom-logo-chestnut-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/chestnut/chestnut-left.webp" },
         
        ],
      },

       {
        label: "Cocoa",
        title: "Cocoa Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#e4dbdb",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/cocoa/custom-logo-cocoa-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/cocoa/custom-logo-cocoa-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/cocoa/custom-logo-cocoa-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/cocoa/custom-logo-cocoa-solid-polo-tshirt-right.webp" },
           { type: "image", src: "/solid-polo-t-shirt/cocoa/custom-logo-cocoa-solid-polo-tshirt-info.webp" },
          
        ],

         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/cocoa/cocoa-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/cocoa/cocoa-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/cocoa/custom-logo-cocoa-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/cocoa/cocoa-view-left.webp" },
         
        ],

      },


       {
        label: "Coral Green",
        title: "Coral Green Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#e4dbdb",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/coral green/custom-logo-coral-green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/coral green/custom-logo-coral-green-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/coral green/custom-logo-coral-green-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/coral green/custom-logo-coral-green-solid-polo-tshirt-right.webp" },
           { type: "image", src: "/solid-polo-t-shirt/coral green/custom-logo-coral-green-solid-polo-tshirt-info.webp" },
          
        ],

         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/coral green/coral-green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/coral green/coral-green-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/coral green/custom-logo-coral-green-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-neck-colar/coral green/coral-green-left.webp" },
         
        ],

      },


      {
        label: "Cream",
        title: "Cream Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#e4dbdb",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/cream/custom-logo-crean-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/cream/custom-logo-crean-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/cream/custom-logo-crean-solid-polo-tshirt-front-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/cream/custom-logo-crean-solid-polo-tshirt-front-right.webp" },
           { type: "image", src: "/solid-polo-t-shirt/cream/custom-logo-crean-solid-polo-tshirt-front-info.webp" },
          
        ],

        blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/cream/crean-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/cream/crean-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/cream/custom-logo-crean-solid-polo-tshirt-front-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/cream/cream-polo-left-side.webp" },
         
        ],

      },

    {
        label: "dark denim",
        title: "Dark Denim Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#e4dbda",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/dark denim/custom-logo-dark-denim-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/dark denim/custom-logo-dark-denim-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/dark denim/custom-logo-dark-denim-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/dark denim/custom-logo-dark-denim-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/dark denim/custom-logo-dark-denim-solid-polo-tshirt-info.webp" },
          
        ],

        blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/dark denim/dark-denim-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/dark denim/dark-denim-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/dark denim/custom-logo-dark-denim-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/dark denim/dark-denim-left.webp" },
         
        ],

      },

      {
        label: "Solid denim",
        title: "Denim Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#e4dbda",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/denim/custom-logo-denim-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/denim/custom-logo-denim-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/denim/custom-logo-denim-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/denim/custom-logo-denim-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/denim/custom-logo-denim-solid-polo-tshirt-info.webp" },
          
        ],

        blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/denim/denim-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/denim/denim-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/denim/custom-logo-denim-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-neck-colar/denim/denim-solid-left.webp" },
         
        ],

      },

       

      {
        label: "Electric Blue",
        title: "Electric Blue Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#e4dbda",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/electric blue/custom-logo-electric-blue-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/electric blue/custom-logo-electric-blue-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/electric blue/custom-logo-electric-blue-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/electric blue/custom-logo-electric-blue-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/electric blue/custom-logo-electric-blue-solid-polo-tshirt-info.webp" },
          
        ],

        blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/electric blue/electric-blue-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/electric blue/electric-blue-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/electric blue/electric-blue-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/electric blue/electric-blue-solid-polo-tshirt-left.webp" },
         
        ],

      },
    {
        label: "Emerald",
        title: "Emerald Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#054529",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/emerald/custom-logo-emerald-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/emerald/custom-logo-emerald-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/emerald/custom-logo-emerald-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/emerald/custom-logo-emerald-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/emerald/custom-logo-emerald-solid-polo-tshirt-info.webp" },
          
        ],

         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/emerald/emerald-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/emerald/emerald-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/emerald/custom-logo-emerald-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-neck-colar/emerald/emerald-solid-left.webp" },
         
        ],

      },

      {
        label: "Forest Green",
        title: "Forest Green Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#054529",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/forest green/custom-logo-forest green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/forest green/custom-logo-forest green-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/forest green/custom-logo-forest green-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/forest green/custom-logo-forest green-solid-polo-tshirt-right.webp" },
           { type: "image", src: "/solid-polo-t-shirt/forest green/custom-logo-forest green-solid-polo-tshirt-info.webp" },
          
        ],

         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/forest green/forest green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/forest green/forest green-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/forest green/custom-logo-forest green-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-neck-colar/forest green/forest-green-left-view.webp" },
         
        ],

      },


      {
        label: "Grey Solid",
        title: "Grey Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#054529",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/grey/custom-logo-grey-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/grey/custom-logo-grey-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/grey/custom-logo-grey-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/grey/custom-logo-grey-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/grey/custom-logo-grey-solid-polo-tshirt-info.webp" },
          
        ],

         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/grey/grey-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/grey/grey-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/grey/custom-logo-grey-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/grey/grey-solid-polo-left.webp" },
         
        ],

      },


      {
        label: "Grey Melange",
        title: "Grey Melange Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#a7aaa9",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/grey melange/custom-logo-grey-melange-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/grey melange/custom-logo-grey-melange-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/grey melange/custom-logo-grey-melange-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/grey melange/custom-logo-grey-melange-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/grey melange/custom-logo-grey-melange-solid-polo-tshirt-info.webp" },
          
        ],

          blankMedia: [
        { type: "image", src: "/solid-polo-t-shirt/grey melange/grey-melange-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/grey melange/grey-melange-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-t-shirt/grey melange/custom-logo-grey-melange-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/grey melange/grey-melange-left.webp" },
         
        ],


      },

 
      {
        label: "Lemon Solid Polo T-shirt",
        title: "Lemon Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#f2f250",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/lemon/custom-logo-lemon-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/lemon/custom-logo-lemon-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/lemon/custom-logo-lemon-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/lemon/custom-logo-lemon-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/lemon/custom-logo-lemon-solid-polo-tshirt-info.webp" },
          
        ],

        blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/lemon/lemon-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/lemon/lemon-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/lemon/custom-logo-lemon-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-neck-colar/lemon/lemon-left-side.webp" },
         
        ],

      },

      {
        label: "Light Denim Polo T-shirt",
        title: "Light Denim Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#559e9b",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/light denim/custom-logo-light-denim-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/light denim/custom-logo-light-denim-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/light denim/custom-logo-light-denim-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/light denim/custom-logo-light-denim-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/light denim/custom-logo-light-denim-solid-polo-tshirt-info.webp" },
          
        ],

         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/light denim/light-denim-solid-polo-tshirt-side.webp" },
          { type: "image", src: "/solid-polo-neck-colar/light denim/light-denim-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/light denim/custom-logo-light-denim-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/light denim/light-denim-left.webp" },
         
        ],

      },

      {
        label: "Lime Green Polo T-shirt",
        title: "Lime Green Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#559e9b",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/lime green/custom-logo-lime-green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/lime green/custom-logo-lime-green-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/lime green/custom-logo-lime-green-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/lime green/custom-logo-lime-green-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/lime green/custom-logo-lime-green-solid-polo-tshirt-info.webp" },
          
        ],

         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/lime green/lime-green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/lime green/lime-green-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/lime green/custom-logo-lime-green-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/lime green/lime-green-left.webp" },
         
        ],
      },

      {
        label: "Magenta Polo T-shirt",
        title: "Magenta Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#559e9b",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/magenta/custom-logo-magenta-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/magenta/custom-logo-magenta-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/magenta/custom-logo-magenta-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/magenta/custom-logo-magenta-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/magenta/custom-logo-magenta-solid-polo-tshirt-info.webp" },
          
        ],

          blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/magenta/magenta-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/magenta/magenta-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/magenta/custom-logo-magenta-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-neck-colar/magenta/magenta-left-side.webp" },
         
        ],

      },


      {
        label: "Maroon Polo T-shirt",
        title: "Maroon Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#5f592e",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/maroon/custom-logo-maroon-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/maroon/custom-logo-maroon-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/maroon/custom-logo-maroon-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/maroon/custom-logo-maroon-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/maroon/custom-logo-maroon-solid-polo-tshirt-info.webp" },
          
        ],

        blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/maroon/maroon-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/maroon/maroon-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/maroon/custom-logo-maroon-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/maroon/maroon-left-side.webp" },
         
        ],

      },

    {
        label: "Military Green Polo T-shirt",
        title: "Military Green Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#0a6051",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/military green/custom-logo-military-green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/military green/custom-logo-military-green-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/military green/custom-logo-military-green-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/military green/custom-logo-military-green-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/military green/custom-logo-military-green-solid-polo-tshirt-info.webp" },
          
        ],

         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/military green/military-green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/military green/military-green-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/military green/custom-logo-military-green-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/military green/military-green-left.webp" },
         
        ],
      },
    {
        label: "Mulberry Polo T-shirt",
        title: "Mulberry Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#0a6051",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/mulberry/custom-logo-mulberry-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/mulberry/custom-logo-mulberry-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/mulberry/custom-logo-mulberry-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/mulberry/custom-logo-mulberry-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/mulberry/custom-logo-mulberry-solid-polo-tshirt-info.webp" },
          
        ],

        blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/mulberry/mulberry-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/mulberry/mulberry-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/mulberry/custom-logo-mulberry-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/mulberry/mulberry-left-side.webp" },
         
        ],

      },

      {
        label: "Natural Polo T-shirt",
        title: "Natural Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#eeeeee",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/natural/custom-logo-natural-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/natural/custom-logo-natural-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/natural/custom-logo-natural-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/natural/custom-logo-natural-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/natural/custom-logo-natural-solid-polo-tshirt-info.webp" },
          
        ],

        blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/natural/natural-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/natural/natural-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/natural/custom-logo-natural-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/natural/natural-left-side.webp" },
         
        ],

      },

       {
        label: "Orange Polo T-shirt",
        title: "Orange Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#eeeeee",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/orange/custom-logo-orange-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/orange/custom-logo-orange-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/orange/custom-logo-orange-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/orange/custom-logo-orange-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/orange/custom-logo-orange-solid-polo-tshirt-info.webp" },
          
        ],
         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/orange/orange-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/orange/orange-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/orange/custom-logo-orange-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-neck-colar/orange/orange-left-side.webp" },
         
        ],

      },

       {
        label: "Peach Polo T-shirt",
        title: "Peach Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#eeeeee",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/peach/custom-logo-peach-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/peach/custom-logo-peach-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/peach/custom-logo-peach-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/peach/custom-logo-peach-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/peach/custom-logo-peach-solid-polo-tshirt-info.webp" },
          
        ],
        blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/peach/peach-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/peach/peach-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/peach/custom-logo-peach-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/peach/peach-left-side.webp" },
         
        ],

      },


      {
        label: "Red Polo T-shirt",
        title: "Red Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#e40202",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/red/custom-logo-red-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/red/custom-logo-red-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/red/custom-logo-red-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/red/custom-logo-red-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/red/custom-logo-red-solid-polo-tshirt-info.webp" },
          
        ],
        blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/red/red-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/red/red-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/red/custom-logo-red-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/red/red-left-side.webp" },
         
        ],

      },


      {
        label: "Royal Blue Polo T-shirt",
        title: "Royal Blue Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#0062ff",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/royal blue/custom-logo-royal-blue-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/royal blue/custom-logo-royal-blue-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/royal blue/custom-logo-royal-blue-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/royal blue/custom-logo-royal-blue-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/royal blue/custom-logo-royal-blue-solid-polo-tshirt-info.webp" },
          
        ],
        blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/royal blue/royal-blue-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/royal blue/royal-blue-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/royal blue/custom-logo-royal-blue-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/royal blue/royal-blue-left-side.webp" },
         
        ],

      },


        {
        label: "Sky Polo T-shirt",
        title: "Sky Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#417ee0",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/sky/custom-logo-sky-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/sky/custom-logo-sky-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/sky/custom-logo-sky-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/sky/custom-logo-sky-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/sky/custom-logo-sky-solid-polo-tshirt-info.webp" },
          
        ],

        blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/sky/sky-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/sky/sky-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/sky/custom-logo-sky-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/sky/sky-blue-left.webp" },
         
        ],


      },

       {
        label: "Sunflower Polo T-shirt",
        title: "Sunflower Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#c1ff16",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/sunflower/custom-logo-sunflower-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/sunflower/custom-logo-sunflower-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/sunflower/custom-logo-sunflower-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/sunflower/custom-logo-sunflower-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/sunflower/custom-logo-sunflower-solid-polo-tshirt-info.webp" },
          
        ],

         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/sunflower/sunflower-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/sunflower/sunflower-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/sunflower/custom-logo-sunflower-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/sunflower/sunflower-left-side.webp" },
         
        ],


      },


      
       {
        label: "Tangerine Polo T-shirt",
        title: "Tangerine Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#fa8100",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/tangerine/custom-logo-tangerine-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/tangerine/custom-logo-tangerine-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/tangerine/custom-logo-tangerine-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/tangerine/custom-logo-tangerine-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/tangerine/custom-logo-tangerine-solid-polo-tshirt-info.webp" },
          
        ],

         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/tangerine/tangerine-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/tangerine/tangerine-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/tangerine/custom-logo-tangerine-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-neck-colar/tangerine/tangerine-left-side.webp" },
         
        ],

      },


         {
        label: "True Blue Polo T-shirt",
        title: "True Blue Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#0f3ea3",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/true blue/custom-logo-true-blue-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/true blue/custom-logo-true-blue-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/true blue/custom-logo-true-blue-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/true blue/custom-logo-true-blue-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/true blue/custom-logo-true-blue-solid-polo-tshirt-info.webp" },
          
        ],


         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/true blue/true-blue-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/true blue/true-blue-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/true blue/custom-logo-true-blue-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/true blue/true-blue-left-side.webp" },
         
        ],

      },

        {
        label: "True Navy Polo T-shirt",
        title: "True Navy Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#486ebe",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/true navy/custom-logo-true-navy-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/true navy/custom-logo-true-navy-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/true navy/custom-logo-true-navy-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/true navy/custom-logo-true-navy-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/true navy/custom-logo-true-navy-solid-polo-tshirt-info.webp" },
          
        ],

        blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/true navy/true-navy-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/true navy/true-navy-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/true navy/custom-logo-true-navy-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/true navy/true-navy-left-side.webp" },
         
        ],


      },


       {
        label: "Turquoise Blue Solid Polo T-shirt",
        title: "Turquoise Blue Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#486ebe",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/turquoise blue/custom-logo-turquoise-blue-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/turquoise blue/custom-logo-turquoise-blue-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/turquoise blue/custom-logo-turquoise-blue-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/turquoise blue/custom-logo-turquoise-blue-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/turquoise blue/custom-logo-turquoise-blue-solid-polo-tshirt-info.webp" },
          
        ],

         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/turquoise blue/turquoise-blue-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/turquoise blue/turquoise-blue-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/turquoise blue/custom-logo-turquoise-blue-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/turquoise blue/turquoise-left-side.webp" },
         
        ],
      },


        {
        label: "White Solid Polo T-shirt",
        title: "White Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#ffffff",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/white/custom-logo-white-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/white/custom-logo-white-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/white/custom-logo-white-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/white/custom-logo-white-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/white/custom-logo-white-solid-polo-tshirt-info.webp" },
          
        ],

        blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/white/white-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/white/white-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/white/custom-logo-white-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-neck-colar/white/white-left-side.webp" },
         
        ],

        

      },

       {
        label: "White Melange Solid Polo T-shirt",
        title: "White Melange Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#ffffff",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/white melange/custom-logo-white-melange-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/white melange/custom-logo-white-melange-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/white melange/custom-logo-white-melange-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/white melange/custom-logo-white-melange-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/white melange/custom-logo-white-melange-solid-polo-tshirt-info.webp" },
          
        ],

         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/white melange/white-melange-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/white melange/white-melange-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/white melange/custom-logo-white-melange-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/white melange/white-malange-left-side.webp" },
         
        ],

      },


      

    {
        label: "Wine Solid Polo T-shirt",
        title: "Wine Solid Polo T-Shirt | Customize 260 GSM Cotton Polo Shirt",
        hex: "#383737",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/wine/custom-logo-wine-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/wine/custom-logo-wine-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/wine/custom-logo-wine-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/wine/custom-logo-wine-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/wine/custom-logo-wine-solid-polo-tshirt-info.webp" },
          
        ],

         blankMedia: [
        { type: "image", src: "/solid-polo-neck-colar/wine/wine-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-neck-colar/wine/wine-solid-polo-tshirt-back.webp" },
         { type: "image", src: "/solid-polo-neck-colar/wine/custom-logo-wine-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-neck-colar/wine/wine-left-side.webp" },
         
        ],


      },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL","3XL","4XL","5XL","6XL"],
    inStock: true,
    weight: 300,
    customizable: true,
    logoUploadEnabled: true,
    sameDayAvailable: true,
    offer: DEFAULT_OFFER,
  },
  {
    id: "4",
    name: "Customized Tiping Polo Collection",
    slug: "customized-tipping-polo-t-shirt",
    basePrice: 599,
    displayPrice: 599,
    originalPrice: 999,
    discount: 29,
    images: ["/office-bag/blue-office-bag/blue-office-bag-front.png"],
    media: [
      { type: "image", src: "/custom-tipping-polo/black with white/custom-tipping-poloblack with whitecustom-tipping-poloblack with white.webp" },
      { type: "image", src: "/custom-tipping-polo/black with white/custom-logo-black-white-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/black with white/custom-logo-black-white-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/black with white/custom-logo-black-white-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/black with white/custom-logo-black-white-tipping-white-collar-tshirt-info.webp" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Customize Polo Neck Tipping TShirt",
    description: "High-quality screen printing on sturdy canvas tote bags.",
    features: ["250 – 260 gsm", "100% combed ring-spun cotton", "Pique knit", "Compacted Pre-shrunk","Double needle stitch on the shoulder, sleeves and bottom hem","3 Button placket with dyed to match buttons and bottom","Soft flow dyed","Colour fastness Guaranteed"],
    material: "100% Cotton, Cotton pique fabric, 260 GSM",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
     printMethod: "DTF & Embriodery",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    colors: [
      {
        label: "Black with White Tipping Polo",
        title: "Black Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#010101",
        media: [
        { type: "image", src: "/custom-tipping-polo/black with white/custom-tipping-poloblack with whitecustom-tipping-poloblack with white.webp" },
      { type: "image", src: "/custom-tipping-polo/black with white/custom-logo-black-white-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/black with white/custom-logo-black-white-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/black with white/custom-logo-black-white-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/black with white/custom-logo-black-white-tipping-white-collar-tshirt-info.webp" },
        ],

        blankMedia: [
            { type: "image", src: "/custom-tipping-polo/black with white/black-white-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/custom-tipping-polo/black with white/black-white-tipping-white-collar-tshirt-back.webp" },
          { type: "image", src: "/custom-tipping-polo/black with white/custom-logo-black-white-tipping-white-collar-tshirt-right.webp" },
           { type: "image", src: "/custom-tipping-polo/black with white/custom-logo-black-white-tipping-white-collar-tshirt-left.webp" },
          
        ],
      },

      {
        label: "Apple Green with White Tipping Polo",
        title: "Apple Green Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#20ff0c",
        media: [
           { type: "image", src: "/custom-tipping-polo/apple-green/custom-logoapple-green-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/apple-green/custom-logo-apple-green-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/apple-green/custom-logoapple-green-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/apple-green/custom-logoapple-green-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/apple-green/custom-logoapple-green-tipping-white-collar-tshirt-info.webp" },
        ],

        
      blankMedia: [
            { type: "image", src: "/custom-tipping-polo/apple-green/apple-green-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/custom-tipping-polo/apple-green/apple-green-tipping-white-collar-tshirt-back.webp" },
         { type: "image", src: "/custom-tipping-polo/apple-green/custom-logoapple-green-tipping-white-collar-tshirt-right.webp" },
         { type: "image", src: "/custom-tipping-polo/apple-green/custom-logoapple-green-tipping-white-collar-tshirt-left.webp" },
          
        ],

      },
      {
        label: "Beige with black tipping polo",
        title: "Beige Collar with Black Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#e8acac",
        media: [
           { type: "image", src: "/custom-tipping-polo/beige with black/custom-logobeige-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/beige with black/custom-logobeige-tipping-black-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/beige with black/custom-logobeige-tipping-black-collar-tshirt-left-side.webp" },
      { type: "image", src: "/custom-tipping-polo/beige with black/custom-logobeige-tipping-black-collar-tshirt-right-side.webp" },
      { type: "image", src: "/custom-tipping-polo/beige with black/custom-logobeige-tipping-black-collar-tshirt-info.webp" },
        ],

         blankMedia: [
            { type: "image", src: "/custom-tipping-polo/beige with black/beige-tipping-black-collar-tshirt-front.webp" },
             { type: "image", src: "/custom-tipping-polo/beige with black/beige-tipping-black-collar-tshirt-back.webp" },
          { type: "image", src: "/custom-tipping-polo/beige with black/custom-logobeige-tipping-black-collar-tshirt-right-side.webp" },
        { type: "image", src: "/custom-tipping-polo/beige with black/custom-logobeige-tipping-black-collar-tshirt-left-side.webp" },
      
          
        ],
      },
      {
        label: "Black Melange with White Tipping Polo",
        title: "Black Melange Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#000000",
        media: [
             { type: "image", src: "/custom-tipping-polo/black melange with white/custom-logoblack-melange-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/black melange with white/custom-logoblack-melange-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/black melange with white/custom-logo-black-melange-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/black melange with white/custom-logo-black-melange-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/black melange with white/custom-logo-black-melange-tipping-white-collar-tshirt-info.webp" },
        ],

        blankMedia: [
          { type: "image", src: "/custom-tipping-polo/black melange with white/black-melange-tipping-white-collar-tshirt-front.webp" },
          { type: "image", src: "/custom-tipping-polo/black melange with white/black-melange-tipping-white-collar-tshirt-back.webp" },
          { type: "image", src: "/custom-tipping-polo/black melange with white/custom-logo-black-melange-tipping-white-collar-tshirt-right.webp" },
            { type: "image", src: "/custom-tipping-polo/black melange with white/custom-logo-black-melange-tipping-white-collar-tshirt-left.webp" },
      
          
        ],

      },
            {
        label: "Black with Red Tipping Polo",
        title: "Black Collar with Red Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#1b1814",
        media: [
       { type: "image", src: "/custom-tipping-polo/black with red/custom-logo-black-tipping-red-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/black with red/custom-logo-black-tipping-red-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/black with red/custom-logo-black-tipping-red-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/black with red/custom-logo-black-tipping-red-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/black with red/custom-logo-black-tipping-red-collar-tshirt-info.webp" },
        ],

        blankMedia: [
         { type: "image", src: "/custom-tipping-polo/black with red/black-tipping-red-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/black with red/black-tipping-red-collar-tshirt-back.webp" },
     
      { type: "image", src: "/custom-tipping-polo/black with red/custom-logo-black-tipping-red-collar-tshirt-right.webp" },
       { type: "image", src: "/custom-tipping-polo/black with red/custom-logo-black-tipping-red-collar-tshirt-left.webp" },
 
          
        ],

      },
      {
        label: "Black with Royal Blue Tipping Polo",
        title: "Black Collar with Royal Blue Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#222527",
        media: [
          { type: "image", src: "/custom-tipping-polo/black with royal blue/custom-logo-black-tipping-royal-blue-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/black with royal blue/custom-logo-black-tipping-royal-blue-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/black with royal blue/custom-logo-black-tipping-royal-blue-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/black with royal blue/custom-logo-black-tipping-royal-blue-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/black with royal blue/custom-logo-black-tipping-royal-blue-collar-tshirt-info.webp" },
        ],

        blankMedia: [
                 { type: "image", src: "/custom-tipping-polo/black with royal blue/black-tipping-royal-blue-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/black with royal blue/black-tipping-royal-blue-collar-tshirt-back.webp" },
      
      { type: "image", src: "/custom-tipping-polo/black with royal blue/custom-logo-black-tipping-royal-blue-collar-tshirt-right.webp" },
 { type: "image", src: "/custom-tipping-polo/black with royal blue/custom-logo-black-tipping-royal-blue-collar-tshirt-left.webp" },
          
        ],

      },
      {
        label: "Cream with Black Tippig Polo",
        title: "Cream with Black Collar Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#fbffe9",
        media: [
          { type: "image", src: "/custom-tipping-polo/cream with black/custom-logo-cream-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/cream with black/custom-logo-cream-tipping-black-collar-tshirt-black.webp" },
      { type: "image", src: "/custom-tipping-polo/cream with black/custom-logo-cream-tipping-black-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/cream with black/custom-logo-cream-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/cream with black/custom-logo-cream-tipping-black-collar-tshirt-info.webp" },
        ],

         blankMedia: [
      { type: "image", src: "/custom-tipping-polo/cream with black/cream-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/cream with black/cream-tipping-black-collar-tshirt-black.webp" },
      { type: "image", src: "/custom-tipping-polo/cream with black/custom-logo-cream-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/cream with black/custom-logo-cream-tipping-black-collar-tshirt-left.webp" },
      
          
        ],
      },
      {
        label: "Dark Denim with White Tipping Polo",
        title: "Dark Denim Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#549dba",
        media: [
           { type: "image", src: "/custom-tipping-polo/dark denim with white/custom-logo-dark-denim-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/dark denim with white/custom-logo-dark-denim-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/dark denim with white/custom-logo-dark-denim-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/dark denim with white/custom-logo-dark-denim-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/dark denim with white/custom-logo-dark-denim-tipping-white-collar-tshirt-info.webp" },
        ],
     blankMedia: [
      { type: "image", src: "/custom-tipping-polo/dark denim with white/dark-denim-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/dark denim with white/dark-denim-tipping-white-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/dark denim with white/custom-logo-dark-denim-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/dark denim with white/custom-logo-dark-denim-tipping-white-collar-tshirt-left.webp" },

           
        ],
        
      },

      {
        label: "Denim with White Tipping Polo",
        title: "Denim Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#467486",
        media: [
           { type: "image", src: "/custom-tipping-polo/denim with white/custom-logo-denim-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/denim with white/custom-logo-denim-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/denim with white/custom-logo-denim-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/denim with white/custom-logo-denim-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/denim with white/custom-logo-denim-tipping-white-collar-tshirt-info.webp" },
        ],

         blankMedia: [
      { type: "image", src: "/custom-tipping-polo/denim with white/denim-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/denim with white/denim-tipping-white-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/denim with white/custom-logo-denim-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/denim with white/custom-logo-denim-tipping-white-collar-tshirt-left.webp" },

           
        ],

      },


      {
        label: "Electric Blue with White Tipping Polo",
        title: "Electric Blue Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#312b6c",
        media: [
           { type: "image", src: "/custom-tipping-polo/electric blue with white/custom-logo-electric-blue-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/electric blue with white/custom-logo-electric-blue-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/electric blue with white/custom-logo-electric-blue-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/electric blue with white/custom-logo-electric-blue-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/electric blue with white/custom-logo-electric-blue-tipping-white-collar-tshirt-info.webp" },
        ],

         blankMedia: [
     { type: "image", src: "/custom-tipping-polo/electric blue with white/electric-blue-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/electric blue with white/electric-blue-tipping-white-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/electric blue with white/custom-logo-electric-blue-tipping-white-collar-tshirt-right.webp" },

      { type: "image", src: "/custom-tipping-polo/electric blue with white/custom-logo-electric-blue-tipping-white-collar-tshirt-left.webp" },
         ],
      },


       {
        label: "Forest Green with White Tipping Polo",
        title: "Forest Green Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#3cc74a",
        media: [
           { type: "image", src: "/custom-tipping-polo/forest green with white/custom-logo-forest-green-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/forest green with white/custom-logo-forest-green-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/forest green with white/custom-logo-forest-green-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/forest green with white/custom-logo-forest-green-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/forest green with white/custom-logo-forest-green-tipping-white-collar-tshirt-info.webp" },
        ],

        
         blankMedia: [
       { type: "image", src: "/custom-tipping-polo/forest green with white/forest-green-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/forest green with white/forest-green-tipping-white-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/forest green with white/custom-logo-forest-green-tipping-white-collar-tshirt-right.webp" },

      { type: "image", src: "/custom-tipping-polo/forest green with white/custom-logo-forest-green-tipping-white-collar-tshirt-left.webp" },
         ],

      },


       {
        label: "Grey with Black Tipping Polo",
        title: "Grey Collar with Black Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#676666",
        media: [
           { type: "image", src: "/custom-tipping-polo/grey with black/custom-logo-grey-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/grey with black/custom-logo-grey-tipping-black-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/grey with black/custom-logo-grey-tipping-black-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/grey with black/custom-logo-grey-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/grey with black/custom-logo-grey-tipping-black-collar-tshirt-info.webp" },
        ],

         blankMedia: [
        { type: "image", src: "/custom-tipping-polo/grey with black/grey-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/grey with black/grey-tipping-black-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/grey with black/custom-logo-grey-tipping-black-collar-tshirt-right.webp" },

      { type: "image", src: "/custom-tipping-polo/grey with black/custom-logo-grey-tipping-black-collar-tshirt-left.webp" },
      
         ],

      },
      {
        label: "Light Denim with White Tipping Polo",
        title: "Light Denim Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#55aeb0",
        media: [
           { type: "image", src: "/custom-tipping-polo/light denim with white/custom-logo-light-denim-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/light denim with white/custom-logo-light-denim-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/light denim with white/custom-logo-light-denim-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/light denim with white/custom-logo-light-denim-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/light denim with white/custom-logo-light-denim-tipping-white-collar-tshirt-info.webp" },
        ],

         blankMedia: [
         { type: "image", src: "/custom-tipping-polo/light denim with white/light-denim-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/light denim with white/light-denim-tipping-white-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/light denim with white/custom-logo-light-denim-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/light denim with white/custom-logo-light-denim-tipping-white-collar-tshirt-left.webp" },
     
      
         ],

      },

      {
        label: "Magenta with White Tipping Polo",
        title: "Magenta Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#a300c4",
        media: [
           { type: "image", src: "/custom-tipping-polo/magenta with white/custom-logo-magenta-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/magenta with white/custom-logo-magenta-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/magenta with white/custom-logo-magenta-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/magenta with white/custom-logo-magenta-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/magenta with white/custom-logo-magenta-tipping-white-collar-tshirt-inf.webp" },
        ],

        blankMedia: [
       { type: "image", src: "/custom-tipping-polo/magenta with white/magenta-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/magenta with white/magenta-tipping-white-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/magenta with white/custom-logo-magenta-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/magenta with white/custom-logo-magenta-tipping-white-collar-tshirt-left.webp" },
     
      
         ],

      },

      {
        label: "Maroon with White Tipping Polo",
        title: "Maroon Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#6d3616",
        media: [
           { type: "image", src: "/custom-tipping-polo/maroon with white/custom-logo-maroon-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/maroon with white/custom-logo-maroon-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/maroon with white/custom-logo-maroon-tipping-white-collar-tshirt-lefT.webp" },
      { type: "image", src: "/custom-tipping-polo/maroon with white/custom-logo-maroon-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/maroon with white/custom-logo-maroon-tipping-white-collar-tshirt-info.webp" },
        ],
          blankMedia: [
       { type: "image", src: "/custom-tipping-polo/maroon with white/maroon-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/maroon with white/maroon-tipping-white-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/maroon with white/custom-logo-maroon-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/maroon with white/custom-logo-maroon-tipping-white-collar-tshirt-lefT.webp" },
     
      
         ],

      },

      {
        label: "Military Green with White Tipping Polo",
        title: "Military Green Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#2dcc47",
        media: [
           { type: "image", src: "/custom-tipping-polo/militry green/custom-logo-militery-green-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/militry green/custom-logo-militery-green-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/militry green/custom-logo-militery-green-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/militry green/custom-logo-militery-green-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/militry green/custom-logo-militery-green-tipping-white-collar-tshirt-info.webp" },
        ],

          blankMedia: [
        { type: "image", src: "/custom-tipping-polo/militry green/militery-green-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/militry green/militery-green-tipping-white-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/militry green/custom-logo-militery-green-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/militry green/custom-logo-militery-green-tipping-white-collar-tshirt-left.webp" },
     
      
         ],

      },


      {
        label: "Navy Blue with White Tipping Polo",
        title: "Navy Blue Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#2572b9",
        media: [
           { type: "image", src: "/custom-tipping-polo/navy blue with white/custom-logo-navy-blue-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/navy blue with white/custom-logo-navy-blue-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/navy blue with white/custom-logo-navy-blue-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/navy blue with white/custom-logo-navy-blue-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/navy blue with white/custom-logo-navy-blue-tipping-white-collar-tshirt-info.webp" },
        ],

         blankMedia: [
        { type: "image", src: "/custom-tipping-polo/navy blue with white/navy-blue-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/navy blue with white/navy-blue-tipping-white-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/navy blue with white/custom-logo-navy-blue-tipping-white-collar-tshirt-right.webp" },

      { type: "image", src: "/custom-tipping-polo/navy blue with white/custom-logo-navy-blue-tipping-white-collar-tshirt-left.webp" },
     
      
         ],

      },


       {
        label: "Ocean Blue with Black Tipping Polo",
        title: "Ocean Blue Collar with Black Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#6da4d8",
        media: [
           { type: "image", src: "/custom-tipping-polo/ocean blue with black/custom-logo-ocean-blue-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/ocean blue with black/custom-logo-ocean-blue-tipping-black-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/ocean blue with black/custom-logo-ocean-blue-tipping-black-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/ocean blue with black/custom-logo-ocean-blue-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/ocean blue with black/custom-logo-ocean-blue-tipping-black-collar-tshirt-info.webp" },
        ],

        blankMedia: [
          { type: "image", src: "/custom-tipping-polo/ocean blue with black/ocean-blue-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/ocean blue with black/ocean-blue-tipping-black-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/ocean blue with black/custom-logo-ocean-blue-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/ocean blue with black/custom-logo-ocean-blue-tipping-black-collar-tshirt-left.webp" },
      
         ],

      },


      {
        label: "Red with Black Tipping Polo",
        title: "Red Collar with Black Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#df2500",
        media: [
           { type: "image", src: "/custom-tipping-polo/red with black/custom-logo-red-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/red with black/custom-logo-red-tipping-black-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/red with black/custom-logo-red-tipping-black-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/red with black/custom-logo-vred-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/red with black/custom-logo-red-tipping-black-collar-tshirt-info.webp" },
        ],

         blankMedia: [
          { type: "image", src: "/custom-tipping-polo/red with black/red-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/red with black/red-tipping-black-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/red with black/custom-logo-vred-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/red with black/custom-logo-red-tipping-black-collar-tshirt-left.webp" },
      
         ],

      },


       {
        label: "Red with White Tipping Polo",
        title: "Red Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#a71c00",
        media: [
           { type: "image", src: "/custom-tipping-polo/red with white/custom-logo-red-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/red with white/custom-logo-red-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/red with white/custom-logo-red-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/red with white/custom-logo-red-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/red with white/custom-logo-red-tipping-white-collar-tshirt-info.webp" },
        ],

         blankMedia: [
             { type: "image", src: "/custom-tipping-polo/red with white/red-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/red with white/red-tipping-white-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/red with white/custom-logo-red-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/red with white/custom-logo-red-tipping-white-collar-tshirt-left.webp" },
         ],

      },


      
       {
        label: "Royal Blue with White Tipping Polo",
        title: "Royal Blue Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#0a40e2",
        media: [
           { type: "image", src: "/custom-tipping-polo/royal blue with white/custom-logo-royal-blue-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/royal blue with white/custom-logo-royal-blue-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/royal blue with white/custom-logo-royal-blue-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/royal blue with white/custom-logo-royal-blue-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/royal blue with white/custom-logo-royal-blue-tipping-white-collar-tshirt-info.webp" },
        ],

        blankMedia: [
             { type: "image", src: "/custom-tipping-polo/royal blue with white/royal-blue-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/royal blue with white/royal-blue-tipping-white-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/royal blue with white/custom-logo-royal-blue-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/royal blue with white/custom-logo-royal-blue-tipping-white-collar-tshirt-left.webp" },
         ],

      },


      {
        label: "Sky Blue with Black Tipping Polo",
        title: "Sky Blue Collar with Black Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#486dda",
        media: [
           { type: "image", src: "/custom-tipping-polo/sky blue with black/custom-logo-sky-blue-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/sky blue with black/custom-logo-sky-blue-tipping-black-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/sky blue with black/custom-logo-sky-blue-tipping-black-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/sky blue with black/custom-logo-sky-blue-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/sky blue with black/custom-logo-sky-blue-tipping-black-collar-tshirt-info.webp" },
        ],

        blankMedia: [
             { type: "image", src: "/custom-tipping-polo/sky blue with black/sky-blue-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/sky blue with black/sky-blue-tipping-black-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/sky blue with black/custom-logo-sky-blue-tipping-black-collar-tshirt-right.webp" },

      { type: "image", src: "/custom-tipping-polo/sky blue with black/custom-logo-sky-blue-tipping-black-collar-tshirt-left.webp" },
         ],

      },


       {
        label: "Tangerine with White Tipping Polo",
        title: "Tangerine Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#f39602",
        media: [
           { type: "image", src: "/custom-tipping-polo/tangerine wth white/custom-logo-tangerine-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/tangerine wth white/custom-logo-tangerine-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/tangerine wth white/custom-logo-tangerine-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/tangerine wth white/custom-logo-tangerine-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/tangerine wth white/custom-logo-tangerine-tipping-white-collar-tshirt-info.webp" },
        ],
         blankMedia: [
           { type: "image", src: "/custom-tipping-polo/tangerine wth white/tangerine-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/tangerine wth white/tangerine-tipping-white-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/tangerine wth white/custom-logo-tangerine-tipping-white-collar-tshirt-right.webp" },

      { type: "image", src: "/custom-tipping-polo/tangerine wth white/custom-logo-tangerine-tipping-white-collar-tshirt-left.webp" },
         ],

      },


        {
        label: "Turquoise Blue with White Tipping Polo",
        title: "Turquoise Blue Collar with White Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#75e5ce",
        media: [
           { type: "image", src: "/custom-tipping-polo/turquoise blue with white/custom-logo-turquoise-blue-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/turquoise blue with white/custom-logo-turquoise-blue-tipping-white-collar-tshirt-black.webp" },
      { type: "image", src: "/custom-tipping-polo/turquoise blue with white/custom-logo-turquoise-blue-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/turquoise blue with white/custom-logo-turquoise-blue-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/turquoise blue with white/custom-logo-turquoise-blue-tipping-white-collar-tshirt-info.webp" },
        ],

         blankMedia: [
             { type: "image", src: "/custom-tipping-polo/turquoise blue with white/turquoise-blue-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/turquoise blue with white/turquoise-blue-tipping-white-collar-tshirt-black.webp" },
            { type: "image", src: "/custom-tipping-polo/turquoise blue with white/custom-logo-turquoise-blue-tipping-white-collar-tshirt-right.webp" },

      { type: "image", src: "/custom-tipping-polo/turquoise blue with white/custom-logo-turquoise-blue-tipping-white-collar-tshirt-left.webp" },
         ],

      },


       {
        label: "White Melange with Black Tipping Polo",
        title: "White Melange Collar with Black Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#fdffff",
        media: [
           { type: "image", src: "/custom-tipping-polo/white melange with black/custom-logo-white-melange-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/white melange with black/custom-logo-white-melange-tipping-black-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/white melange with black/custom-logo-white-melange-tipping-black-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/white melange with black/custom-logo-white-melange-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/white melange with black/custom-logo-white-melange-tipping-black-collar-tshirt-info.webp" },
        ],

         blankMedia: [
              { type: "image", src: "/custom-tipping-polo/white melange with black/white-melange-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/white melange with black/white-melange-tipping-black-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/white melange with black/custom-logo-white-melange-tipping-black-collar-tshirt-right.webp" },

      { type: "image", src: "/custom-tipping-polo/white melange with black/custom-logo-white-melange-tipping-black-collar-tshirt-left.webp" },
         ],

      },


       {
        label: "White with Black Tipping Polo",
        title: "White Collar with Black Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#ffffff",
        media: [
           { type: "image", src: "/custom-tipping-polo/white with black/custom-logo-white-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/white with black/custom-logo-white-tipping-black-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/white with black/custom-logo-white-tipping-black-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/white with black/custom-logo-white-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/white with black/custom-logo-white-tipping-black-collar-tshirt-info.webp" },
        ],

        blankMedia: [
             { type: "image", src: "/custom-tipping-polo/white with black/white-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/white with black/white-tipping-black-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/white with black/custom-logo-white-tipping-black-collar-tshirt-right.webp" },

      { type: "image", src: "/custom-tipping-polo/white with black/custom-logo-white-tipping-black-collar-tshirt-left.webp" },
      
         ],


      },

       {
        label: "White with Blue Tipping Polo",
        title: "White Collar with Blue Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#ffffff",
        media: [
           { type: "image", src: "/custom-tipping-polo/white with blue/custom-logo-white-tipping-royal-blue-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/white with blue/custom-logo-white-tipping-royal-blue-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/white with blue/custom-logo-white-tipping-royal-blue-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/white with blue/custom-logo-white-tipping-royal-blue-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/white with blue/custom-logo-white-tipping-royal-blue-collar-tshirt-info.webp" },
        ],

        blankMedia: [
              { type: "image", src: "/custom-tipping-polo/white with blue/white-tipping-royal-blue-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/white with blue/white-tipping-royal-blue-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/white with blue/custom-logo-white-tipping-royal-blue-collar-tshirt-right.webp" },

      { type: "image", src: "/custom-tipping-polo/white with blue/custom-logo-white-tipping-royal-blue-collar-tshirt-left.webp" },
      
         ],

      },


       {
        label: "White with Red Tipping Polo",
        title: "White Collar with Red Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#ffffff",
        media: [
           { type: "image", src: "/custom-tipping-polo/white with red/custom-logo-white-tipping-red-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/white with red/custom-logo-white-tipping-red-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/white with red/custom-logo-white-tipping-red-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/white with red/custom-logo-white-tipping-red-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/white with red/custom-logo-white-tipping-red-collar-tshirt-info.webp" },
        ],

         blankMedia: [
            { type: "image", src: "/custom-tipping-polo/white with red/white-tipping-red-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/white with red/white-tipping-red-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/white with red/custom-logo-white-tipping-red-collar-tshirt-right.webp" },

      { type: "image", src: "/custom-tipping-polo/white with red/custom-logo-white-tipping-red-collar-tshirt-left.webp" },
      
         ],

      },


       {
        label: "Yellow with Black Tipping Polo",
        title: "Yellow Collar with Black Tipping Polo T-shirt | 260 GSM Cotton Polo Shirt",
        hex: "#ffffff",
        media: [
           { type: "image", src: "/custom-tipping-polo/yellow with black/custom-logo-yellow-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/yellow with black/custom-logo-yellow-tipping-black-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/yellow with black/custom-logo-yellow-tipping-black-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/yellow with black/custom-logo-yellow-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/yellow with black/custom-logo-yellow-tipping-black-collar-tshirt-info.webp" },
        ],


         blankMedia: [
      { type: "image", src: "/custom-tipping-polo/yellow with black/yellow-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/yellow with black/yellow-tipping-black-collar-tshirt-back.webp" },
            { type: "image", src: "/custom-tipping-polo/yellow with black/custom-logo-yellow-tipping-black-collar-tshirt-right.webp" },

      { type: "image", src: "/custom-tipping-polo/yellow with black/custom-logo-yellow-tipping-black-collar-tshirt-left.webp" },
      
         ],

      },


    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL","3XL","4XL","5XL"],
    inStock: true,
    weight: 300,
    customizable: true,
    logoUploadEnabled: true,
    sameDayAvailable: true,
    offer: DEFAULT_OFFER,
  },
 

  

];
export const productsData: Product[] = attachSkus(rawProductsData);