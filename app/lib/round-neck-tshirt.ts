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

// ── Fabric Sub-Categories (Basic Caps / Premium Caps) ────────────────────────
// e.g. Basic → [PC Mix, Basic Cotton]; Premium → [100% Pure Cotton, ...].
// Selecting a specific product swaps the main product image on the page.

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
  // Which print/upload sides are available for this product. Omit (undefined)
  // to allow all four sides — this is the default for every existing product.
  // Set explicitly to restrict a product to fewer sides (e.g. front-only caps);
  // the omitted sides show as greyed-out/disabled in the upload UI and preview.
  enabledLogoSides?: ("front" | "back" | "left" | "right")[];
  sameDayAvailable?: boolean;
  offer?: Offer;
  availablepatterns?:string;
  cardBg?: string;
  fabricSubCategories?: FabricSubCategoryMap;
  // "Custom category" hub page: when true, this product's page shows a
  // "Choose Style" (all products) + "Choose Color" (selected style's colors)
  // selector instead of Fabric Type / Designing / Material Selection.
  isStylePicker?: boolean;
  styleLabel?: string;     // short name shown under the style thumbnail, e.g. "Snapback Cap"
  styleSubtitle?: string;  // e.g. "Flat Visor"
  // "Default category" page: shows Plan/Customized (labeled "Fabric Type"),
  // feature badges, a "Choose Color" swatch row, and related category
  // products below — instead of the Basic/Premium fabric comparison,
  // Material Selection, and separate Designing sections.
  isDefaultCategory?: boolean;
  // Basic/Premium fabric-type page: shows the Basic/Premium comparison
  // cards (existing "Fabric Type" section), then a descriptive banner for
  // whichever one is selected, then a "Choose Fabric" material picker and
  // "Choose Color" — all scoped per category (basic vs premium).
  isBasicPremiumCategory?: boolean;
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
    // Optional: the small foreground image shown on premium cards (bottom-
    // right corner, over the fabric background). If omitted, falls back to
    // products[0].image so existing entries keep working unchanged.
    cardImage?: string;
    products?: { id: string; name: string; image: string; images?: string[] }[];
  }[]>;
  // This category's own bulk-quantity discount table — see
  // ROUNDNECK_QTY_TIERS below. Attached automatically to every product by
  // attachSkus(), same as `sku`, so nothing above needs to set it by hand.
  qtyTiers?: QtyTier[];
}

// ── Bulk quantity tiers (this category's own — NOT shared with other
// product categories) ───────────────────────────────────────────────────────
// This table is attached to every product below (see attachSkus) as
// `product.qtyTiers`, so BOTH the product page (ProductDetailClient, for
// what's shown) and create-razorpay-order (for what's actually charged)
// read it from the same place and can never drift apart.
//
// IMPORTANT: these numbers are round-neck-t-shirt's ACTUAL current tiers —
// copied as-is from the global default table in app/lib/pricing.ts
// (QTY_TIERS), which is what this product's page and checkout both fell
// back to before this field existed. Do not change these values as part of
// this refactor — that would silently change live pricing.
export const ROUNDNECK_QTY_TIERS: QtyTier[] = [
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

const CATEGORY_PREFIX = "RNT"; // Round Neck T-Shirt

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
    return { ...p, sku: productSku, qtyTiers: ROUNDNECK_QTY_TIERS, ...(colors ? { colors } : {}) } as Product;
  });
}
const rawProductsData: RawProduct[] = [
 
  {
    id: "1",
   name: "Customized Round Neck Tshirt",
    slug: "customized-round-neck-tshirt",
    styleLabel: "Snapback Cap",
    styleSubtitle: "Flat Visor",
    isStylePicker: true,
    basePrice: 399,
     displayPrice: 399,
    originalPrice: 799,
    discount: 29,
    images: [""],
    media: [
      // { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-front.webp" },
          
    ],
    quantityReq: 1,
    priceRange: "budget",
   category: "Round Neck Regular Fit T-Shirt",
    description: "High-quality screen printing on sturdy canvas tote bags.",
    features: ["Approximately – 180 GSM (5.9 ounces)", "100% Ring-spun Cotton (Melange colours contain a % of polyester)", "Bio-wash Fabric", "Compacted Pre-shrunk","Double needle stitch on the sleeves and bottom hem","Color fastness Guaranteed","Available Sizes Small to 6XL"],
    material: "100% Ring-spun Cotton, 180 GSM, Bio-wash Fabric",
    printMethod: "DTF, Embroider,Screen Pritng",
    availablepatterns:"Half Sleeves",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    fabricSubCategories: {
      
    },
    colors: [
        
              {
                title:"Red Round Neck Customized T-shirt | Regular Fit 180 GSM Bio-wash Fabric",
                label: "Red Round Neck Customized T-shirt | Regular Fit 180 GSM Bio-wash Fabric",
                hex: "#0b0b0b",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-front.webp",
                  },

                  {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-back.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-right.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-left.webp",
                  },
                 
                 {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-info.webp",
                  },
                 
                 
                  
                 
                ],
                blankMedia: [
                 {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-front.webp",
                  },

                  {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-back.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-right.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-left.webp",
                  },
                ],
              },

              
              {
                title:"Black Round Neck Customized T-shirt | Regular Fit 180 GSM Bio-wash Fabric",
                label: "Black Round Neck Customized T-shirt | Regular Fit 180 GSM Bio-wash Fabric",
                hex: "#0b0b0b",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-front.webp",
                  },

                  {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-back.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-right.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-left.webp",
                  },
                 
                 {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-info.webp",
                  },
                 
                 
                  
                 
                ],
                blankMedia: [
                {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-front.webp",
                  },

                  {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-back.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-right.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-left.webp",
                  },
                 
                 
                ],
              },

            { 
              title:"Grey Melange Round Neck Customized T-shirt | Regular Fit 180 GSM Bio-wash Fabric",
                label: "Grey Round Neck Tshirt",
                hex: "#0b0b0b",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-front.webp",
                  },

                  {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-back.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-right.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-left.webp",
                  },
                 
                 {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-info.webp",
                  },
                 
                 
                  
                 
                ],
                blankMedia: [
               {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-front.webp",
                  },

                  {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-back.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-right.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-left.webp",
                  },
                 
                 
                ],
              },

              {
                title:"White Round Neck Customized  T-shirt | Regular Fit 180 GSM Bio-wash Fabric",
                label: "White Round Neck Tshirt",
                hex: "#ffffff",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-front.webp",
                  },

                  {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-back.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-right.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-left.webp",
                  },
                 
                 {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-info.webp",
                  },
                 
                 
                  
                 
                ],
                blankMedia: [
                {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-front.webp",
                  },

                  {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-back.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-right.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-left.webp",
                  },
                 
                 
                ],
              },
              {
                title:"Military Green Round Neck Customized T-shirt | Regular Fit 180 GSM Bio-wash Fabric",
                label: "Military Green Round Neck Tshirt",
                hex: "#4B5320",
                sameDayAvailable: true,
                media: [
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-front.webp",
                    },
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-back.webp",
                    },
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-right.webp",
                    },
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-left.webp",
                    },
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-info.webp",
                    },
                ],
                blankMedia: [
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-front.webp",
                    },
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-back.webp",
                    },
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-right.webp",
                    },
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-left.webp",
                    },
                ],
                },


                {
                  title:"True Navy Round Neck Customized T-shirt | Regular Fit 180 GSM Bio-wash Fabric",
          label: "Navy Blue Round Neck Tshirt",
          hex: "#000080",
          sameDayAvailable: true,
          media: [
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-front.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-back.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-right.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-left.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-info.webp",
            },
          ],
          blankMedia: [
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-front.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-back.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-right.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-left.webp",
            },
          ],
        },


        {
          title:"Royal Blue Round Neck Customized T-shirt | Regular Fit 180 GSM Bio-wash Fabric",
          label: "Royal Blue Round Neck Tshirt",
          hex: "#4169E1",
          sameDayAvailable: true,
          media: [
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-front.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-back.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-right.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-left.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-info.webp",
            },
          ],
          blankMedia: [
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-front.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-back.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-right.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-left.webp",
            },
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
    id: "2",
    name: "Round Neck TShirts",
    slug: "round-neck-tshirts",
    styleLabel: "",
    styleSubtitle: "Mesh Back",
    basePrice: 399,
    displayPrice: 399,
    originalPrice: 799,
    discount: 35.04,
    images: ["/office-bag/blue-office-bag/blue-office-bag-front.png"],
    media: [
      { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-front.webp" },
      { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-left.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/white/left-facing.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/white/right-facing.webp" },
    ],
    printMethod: "DTF, Embroider,Screen Pritng",
    availablepatterns:"Half Sleeves",
    quantityReq: 1,
    priceRange: "budget",
    category: "Round Neck Regular Fit T-Shirt",
    description: "High-quality screen printing on sturdy canvas tote bags.",
    features: ["Approximately – 180 GSM (5.9 ounces)", "100% Ring-spun Cotton (Melange colours contain a % of polyester)", "Bio-wash Fabric", "Compacted Pre-shrunk","Double needle stitch on the sleeves and bottom hem","Color fastness Guaranteed","Available Sizes Small to 6XL"],
    material: "100% Ring-spun Cotton, 180 GSM, Bio-wash Fabric",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    colors: [
        
              {
                title:"Red DTG Round Neck T-shirt | 180 GSM Bio-wash Fabric",
                label: "Red DTG Round Neck T-shirt | 180 GSM Bio-wash Fabric",
                hex: "#0b0b0b",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-front.webp",
                  },

                  {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-back.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-right.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-left.webp",
                  },
                 
                 {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-info.webp",
                  },
                 
                 
                  
                 
                ],
                blankMedia: [
                 {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-front.webp",
                  },

                  {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-back.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-right.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/red/red-round-neck-tshirt-left.webp",
                  },
                ],
              },

              
              {
                title:"Black DTG Round Neck T-shirt | 180 GSM Bio-wash Fabric",
                label: "Black DTG Round Neck T-shirt | 180 GSM Bio-wash Fabric",
                hex: "#0b0b0b",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-front.webp",
                  },

                  {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-back.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-right.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-left.webp",
                  },
                 
                 {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-info.webp",
                  },
                 
                 
                  
                 
                ],
                blankMedia: [
                {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-front.webp",
                  },

                  {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-back.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-right.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/black/black-round-neck-tshirt-left.webp",
                  },
                 
                 
                ],
              },

            { 
              title:"Grey Melange DTG Round Neck T-shirt | 180 GSM Bio-wash Fabric",
                label: "Grey Round Neck Tshirt",
                hex: "#0b0b0b",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-front.webp",
                  },

                  {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-back.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-right.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-left.webp",
                  },
                 
                 {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-info.webp",
                  },
                 
                 
                  
                 
                ],
                blankMedia: [
               {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-front.webp",
                  },

                  {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-back.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-right.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/grey/grey-round-neck-tshirt-left.webp",
                  },
                 
                 
                ],
              },

              {
                title:"White DTG Round Neck T-shirt | 180 GSM Bio-wash Fabric",
                label: "White Round Neck Tshirt",
                hex: "#ffffff",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-front.webp",
                  },

                  {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-back.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-right.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-left.webp",
                  },
                 
                 {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-info.webp",
                  },
                 
                 
                  
                 
                ],
                blankMedia: [
                {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-front.webp",
                  },

                  {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-back.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-right.webp",
                  },
                 

                  {
                    type: "image",
                    src: "/solid-round-neck/white/white-round-neck-tshirt-left.webp",
                  },
                 
                 
                ],
              },
              {
                title:"Military Green DTG Round Neck T-shirt | 180 GSM Bio-wash Fabric",
                label: "Military Green Round Neck Tshirt",
                hex: "#4B5320",
                sameDayAvailable: true,
                media: [
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-front.webp",
                    },
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-back.webp",
                    },
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-right.webp",
                    },
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-left.webp",
                    },
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-info.webp",
                    },
                ],
                blankMedia: [
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-front.webp",
                    },
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-back.webp",
                    },
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-right.webp",
                    },
                    {
                    type: "image",
                    src: "/solid-round-neck/miletry-green/military-green-round-neck-tshirt-left.webp",
                    },
                ],
                },


                {
                  title:"True Navy DTG Round Neck T-shirt | 180 GSM Bio-wash Fabric",
          label: "Navy Blue Round Neck Tshirt",
          hex: "#000080",
          sameDayAvailable: true,
          media: [
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-front.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-back.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-right.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-left.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-info.webp",
            },
          ],
          blankMedia: [
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-front.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-back.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-right.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/navy-blue/navy-blue-round-neck-tshirt-left.webp",
            },
          ],
        },


        {
          title:"Royal Blue DTG Round Neck T-shirt | 180 GSM Bio-wash Fabric",
          label: "Royal Blue Round Neck Tshirt",
          hex: "#4169E1",
          sameDayAvailable: true,
          media: [
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-front.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-back.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-right.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-left.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-info.webp",
            },
          ],
          blankMedia: [
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-front.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-back.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-right.webp",
            },
            {
              type: "image",
              src: "/solid-round-neck/royal-blue/royal-blue-round-neck-tshirt-left.webp",
            },
          ],
        },
              
            ],
            sizes: ["XS", "S", "M", "L", "XL", "XXL","3XL","4XL","5XL","6XL"],
          inStock: true,
          weight: 300,
          customizable: false,
          logoUploadEnabled: true,
          isDefaultCategory: true,
          sameDayAvailable: true,
          offer: {
            code: "PREPAID5",
            saveAmount: 64,
            description: "Get EXTRA 5% OFF on all Prepaid orders above Rs.1299.",
            minOrder: 1299,
            discountPct: 5,
          },
        },



      



    

];
export const productsData: Product[] = attachSkus(rawProductsData);