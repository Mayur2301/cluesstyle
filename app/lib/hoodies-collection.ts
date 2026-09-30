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
  // HOODIES_QTY_TIERS below. Attached automatically to every product by
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
// IMPORTANT: these numbers are this category's ACTUAL current tiers —
// copied as-is from the global default table in app/lib/pricing.ts
// (QTY_TIERS), which is what this product's page and checkout both fell
// back to before this field existed. Do not change these values as part of
// this refactor — that would silently change live pricing.
export const HOODIES_QTY_TIERS: QtyTier[] = [
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

const CATEGORY_PREFIX = "HDY"; // Hoodies

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
    return { ...p, sku: productSku, qtyTiers: HOODIES_QTY_TIERS, ...(colors ? { colors } : {}) } as Product;
  });
}
const rawProductsData: RawProduct[] = [
 
  // {
  //   id: "1",
  //  name: "Customized Hoodies",
  //   slug: "customized-hoodies",
  //   styleLabel: "Customized Hoodies",
  //   styleSubtitle: "Hoodies",
  //   isStylePicker: true,
  //   basePrice: 240,
  //    displayPrice: 599,
  //   originalPrice: 999,
  //   discount: 29,
  //   images: [""],
  //   media: [
  //     // { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-front.webp" },
          
  //   ],
  //   quantityReq: 1,
  //   priceRange: "budget",
  //   category: "Oversized T-Shirt",
  //   description: "High-quality screen printing on sturdy canvas tote bags.",
  //   features: ["100% Canvas", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
  //   material: "Premium Cotton Canvas, 180 GSM",
  //   turnaround: "5-7 business days",
  //   sameDayTurnaround: "By 8 PM today",
  //   rating: 4.3,
  //   reviewCount: 128,
  //   badge: "Best Seller",
  //   fabricSubCategories: {
      
  //   },
  //   colors: [
      

  //   ],
  //   sizes: ["XS", "S", "M", "L", "XL", "XXL","3XL","4XL","5XL","6XL"],
  //   inStock: true,
  //   weight: 300,
  //   customizable: true,
  //   logoUploadEnabled: true,
  //   sameDayAvailable: true,
  //   offer: DEFAULT_OFFER,
  // },
  {
    id: "2",
    name: "Zipper Hoodies",
    slug: "zipper-hoodies",
    styleLabel: "Zipper Hoodie",
    styleSubtitle: "Mesh Back",
    basePrice: 949,
    displayPrice: 949,
    originalPrice: 1499,
    discount: 35.04,
    images: ["/zipper-solid-hoodie/black/zipper-black-solid-hoodie-front.webp"],
    media: [
      //{ type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-front.webp" },
      //{ type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-left.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/white/left-facing.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/white/right-facing.webp" },
    ],
    printMethod: "DTF, Embroider,Screen Pritng",
    availablepatterns:"Full Sleeves",
    quantityReq: 1,
    priceRange: "budget",
    category: "Hoodies",
    description: "High-quality screen printing on sturdy canvas tote bags.",
    features: ["300–320 GSM","Eco-friendly manufactured", "Brushed on the inside", "Ultra soft", "Zipper","Kangaroo pockets","Soft Flow Bleach / Dyed"],
    material: "Cotton rich fabric,300–320 GSM,Bio-washed Fabric",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    colors: [
        
              {
                label: "Black Zipper Hoodie",
                title: "Black  Solid Zipper Hoodie",
                hex: "#0b0b0b",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/black/zipper-black-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/black/zipper-black-solid-hoodie-open-zip.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/black/zipper-black-solid-hoodie-left.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/black/zipper-black-solid-hoodie-right.webp",
                  },
                 
                   {
                    type: "image",
                    src: "/zipper-solid-hoodie/black/zipper-black-solid-hoodie-info.webp",
                  },
                  
                 
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/black/zipper-black-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/black/zipper-black-solid-hoodie-back.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/black/zipper-black-solid-hoodie-right.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/black/zipper-black-solid-hoodie-left.webp",
                  },
                ],
              },

              {
                label: "Grey Melange Zipper Hoodie",
                title: "Grey Melange Solid Zipper Hoodie",
                hex: "#a49797",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/grey-melange/zipper-grey-melange-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/grey-melange/zipper-grey-melange-solid-hoodie-front-open-zip.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/grey-melange/zipper-grey-melange-solid-hoodie-left.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/grey-melange/zipper-grey-melange-solid-hoodie-front-open-right.webp",
                  },
                 
                   {
                    type: "image",
                    src: "/zipper-solid-hoodie/grey-melange/zipper-grey-melange-solid-hoodie-back.webp",
                  },
                   {
                    type: "image",
                    src: "/zipper-solid-hoodie/grey-melange/zipper-grey-melange-solid-hoodie-info.webp",
                  },
                 
                ],
                blankMedia: [
                   {
                    type: "image",
                    src: "/zipper-solid-hoodie/grey-melange/zipper-grey-melange-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/grey-melange/zipper-grey-melange-solid-hoodie-back.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/grey-melange/zipper-grey-melange-solid-hoodie-front-open-right.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/grey-melange/zipper-grey-melange-solid-hoodie-left.webp",
                  },
                ],
              },

              {
                label: "Ice Blue Zipper Hoodie",
                title: "Ice Blue Solid Zipper Hoodie",
                hex: "#41bccd",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/ice-blue/zipper-ice-blue-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/ice-blue/zipper-ice-blue-solid-hoodie-front-open-zip.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/ice-blue/zipper-ice-blue-solid-hoodie-left.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/ice-blue/zipper-ice-blue-solid-hoodie-right.webp",
                  },
                 
                   {
                    type: "image",
                    src: "/zipper-solid-hoodie/ice-blue/zipper-ice-blue-solid-hoodie-back.webp",
                  },
                   {
                    type: "image",
                    src: "/zipper-solid-hoodie/ice-blue/zipper-ice-blue-solid-hoodie-info.webp",
                  },
                 
                ],
                blankMedia: [
                   {
                    type: "image",
                    src: "/zipper-solid-hoodie/ice-blue/zipper-ice-blue-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/ice-blue/zipper-ice-blue-solid-hoodie-back.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/ice-blue/zipper-ice-blue-solid-hoodie-right.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/ice-blue/zipper-ice-blue-solid-hoodie-left.webp",
                  },
                ],
              },
              
              {
                label: "Navy Blue Zipper Hoodie",
                title: "Navy Blue Solid Zipper Hoodie",
                hex: "#1f56d7",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/navy-blue/zipper-navy-blue-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/navy-blue/zipper-navy-blue-solid-hoodie-open-zip.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/navy-blue/zipper-navy-blue-solid-hoodie-right.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/navy-blue/zipper-navy-blue-solid-hoodie-left.webp",
                  },
                 
                   {
                    type: "image",
                    src: "/zipper-solid-hoodie/navy-blue/zipper-navy-blue-solid-hoodie-back.webp",
                  },
                   {
                    type: "image",
                    src: "/zipper-solid-hoodie/navy-blue/zipper-navy-blue-solid-hoodie-info.webp",
                  },
                 
                ],
                blankMedia: [
                   {
                    type: "image",
                    src: "/zipper-solid-hoodie/navy-blue/zipper-navy-blue-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/navy-blue/zipper-navy-blue-solid-hoodie-back.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/navy-blue/zipper-navy-blue-solid-hoodie-right.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/navy-blue/zipper-navy-blue-solid-hoodie-left.webp",
                  },
                ],
              },

               {
                label: "White Zipper Hoodie",
                title: "White Solid Zipper Hoodie",
                hex: "#fafafa",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/white/zipper-white-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/white/zipper-white-solid-hoodie-front-open-zip.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/white/zipper-white-solid-hoodie-right.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/white/zipper-white-solid-hoodie-left.webp",
                  },
                 
                   {
                    type: "image",
                    src: "/zipper-solid-hoodie/white/zipper-white-solid-hoodie-back.webp",
                  },
                   {
                    type: "image",
                    src: "/zipper-solid-hoodie/white/zipper-white-solid-hoodie-info.webp",
                  },
                 
                ],
                blankMedia: [
                   {
                    type: "image",
                    src: "/zipper-solid-hoodie/white/zipper-white-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/white/zipper-white-solid-hoodie-back.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/white/zipper-white-solid-hoodie-right.webp",
                  },
                  {
                    type: "image",
                    src: "/zipper-solid-hoodie/white/zipper-white-solid-hoodie-left.webp",
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



        {
    id: "3",
    name: "Pullover Hoodies",
    slug: "pull-over-hoodies",
    styleLabel: "Pull Over Hoodie",
    styleSubtitle: "",
    basePrice: 899,
    displayPrice: 899,
    originalPrice: 1299,
    discount: 35.04,
    images: ["/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-front.webp"],
    media: [
     // { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-front.webp" },
     // { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-left.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/white/left-facing.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/white/right-facing.webp" },
    ],
    printMethod: "DTF, Embroider,Screen Pritng",
    availablepatterns:"Full Sleeves",
    quantityReq: 1,
    priceRange: "budget",
    category: "Hoodies",
    description: "High-quality screen printing on sturdy canvas tote bags.",
    features: ["300–320 GSM","Eco-friendly manufactured", "Brushed on the inside", "Ultra soft", "Zipper","Kangaroo pockets","Soft Flow Bleach / Dyed"],
    material: "Cotton rich fabric,300–320 GSM,Bio-washed Fabric",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    colors: [
        
              {
                label: "Ice Blue Pull Over Hoodie",
                title: "Ice Blue Pull Over Hoodie",
                hex: "#53afc1",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-back.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-right.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-left.webp",
                  },
                 
                   {
                    type: "image",
                    src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-info.webp",
                  },
                  
                 
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-back.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-right.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-left.webp",
                  },
                ],
              },

                {
                label: "Grey Melange Pull Over Hoodie",
                title: "Grey Melange Pull Over Hoodie",
                hex: "#b1a2a2",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/grey-melange/pullover-grey-melange-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/grey-melange/pullover-grey-melange-solid-hoodie-back.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/grey-melange/pullover-grey-melange-solid-hoodie-right.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/grey-melange/pullover-grey-melange-solid-hoodie-left.webp",
                  },
                 
                   {
                    type: "image",
                    src: "/solid-pull-over-hoodie/grey-melange/pullover-grey-melange-solid-hoodie-info.webp",
                  },
                  
                 
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/grey-melange/pullover-grey-melange-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/grey-melange/pullover-grey-melange-solid-hoodie-back.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/grey-melange/pullover-grey-melange-solid-hoodie-right.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/grey-melange/pullover-grey-melange-solid-hoodie-left.webp",
                  },
                 
                ],
              },

                {
                label: "Black Pull Over Hoodie",
                title: "Black Pull Over Hoodie",
                hex: "#0d0d0d",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/black/pullover-black-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/black/pullover-black-solid-hoodie-back.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/black/pullover-black-solid-hoodie-right.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/black/pullover-black-solid-hoodie-left.webp",
                  },
                 
                   {
                    type: "image",
                    src: "/solid-pull-over-hoodie/black/pullover-black-solid-hoodie-info.webp",
                  },
                  
                 
                ],
                blankMedia: [
                   {
                    type: "image",
                    src: "/solid-pull-over-hoodie/black/pullover-black-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/black/pullover-black-solid-hoodie-back.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/black/pullover-black-solid-hoodie-right.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/black/pullover-black-solid-hoodie-left.webp",
                  },
                 
                ],
              },


              {
                label: "White Pull Over Hoodie",
                title: "White Pull Over Hoodie",
                hex: "#f7f2f2",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/white/pullover-white-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/white/pullover-white-solid-hoodie-back.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/white/pullover-white-solid-hoodie-right.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/white/pullover-white-solid-hoodie-left.webp",
                  },
                 
                   {
                    type: "image",
                    src: "/solid-pull-over-hoodie/white/pullover-white-solid-hoodie-info.webp",
                  },
                  
                 
                ],
                blankMedia: [
                   {
                    type: "image",
                    src: "/solid-pull-over-hoodie/white/pullover-white-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/white/pullover-white-solid-hoodie-back.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/white/pullover-white-solid-hoodie-right.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/white/pullover-white-solid-hoodie-left.webp",
                  },
                 
                 
                ],
              },
               {
                label: "Navy Blue Pull Over Hoodie",
                title: "Navy Blue Pull Over Hoodie",
                hex: "#f7f2f2",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/navy-blue/pullover-navy-blue-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/navy-blue/pullover-navy-blue-solid-hoodie-back.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/navy-blue/pullover-navy-blue-solid-hoodie-right.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/navy-blue/pullover-navy-blue-solid-hoodie-left.webp",
                  },
                 
                   {
                    type: "image",
                    src: "/solid-pull-over-hoodie/navy-blue/pullover-navy-blue-solid-hoodie-info.webp",
                  },
                  
                 
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/navy-blue/pullover-navy-blue-solid-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/navy-blue/pullover-navy-blue-solid-hoodie-back.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/navy-blue/pullover-navy-blue-solid-hoodie-right.webp",
                  },
                  {
                    type: "image",
                    src: "/solid-pull-over-hoodie/navy-blue/pullover-navy-blue-solid-hoodie-left.webp",
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



    {
    id: "4",
    name: "Sleeveless Hoodies",
    slug: "sleeveless-hoodies",
    // No sleeves on this style — only front/back can carry a logo, so hide
    // the left/right side tabs in the live preview entirely.
    enabledLogoSides: ["front", "back"],
    styleLabel: "Pull Over Hoodie",
    styleSubtitle: "",
    basePrice: 999,
    displayPrice: 999,
    originalPrice: 1699,
    discount: 35.04,
    images: ["/sleeveless-hoodie/customize/white-customize/customize-white-sleevesless-hoodie-1.webp"],
    media: [
     // { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-front.webp" },
     // { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-left.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/white/left-facing.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/white/right-facing.webp" },
    ],
    printMethod: "DTF, Embroider,Screen Pritng",
    availablepatterns:"Sleeveless",
    quantityReq: 1,
    priceRange: "budget",
    category: "Hoodies",
    description: "High-quality screen printing on sturdy canvas tote bags.",
    features: ["300–320 GSM","Eco-friendly manufactured", "Brushed on the inside", "Ultra soft", "Zipper","Kangaroo pockets","Soft Flow Bleach / Dyed"],
    material: "Cotton rich fabric,300–320 GSM,Bio-washed Fabric",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    colors: [
        
              {
                label: "White Sleeveless Hoodie",
                title: "White Sleeveless Hoodie",
                hex: "#f2f3f4",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/customize/white-customize/customize-white-sleevesless-hoodie-1.webp",
                  },
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/customize/white-customize/customize-white-sleevesless-hoodie-2.webp",
                  },
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/customize/white-customize/customize-white-sleevesless-hoodie-3.webp",
                  },
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/customize/white-customize/white-sleeveless-hoodie-left-right.webp",
                  },
                 
                   {
                    type: "image",
                    src: "/sleeveless-hoodie/customize/white-customize/white-sleeveless-hoodie-left-all-view.webp",
                  },
                  
                 
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/solid/white/white-sleeveless-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/solid/white/white-sleeveless-hoodie-back.webp",
                  },
                  
                ],
              },

               {
                label: "Navy Blue Sleeveless Hoodie",
                title: "Navy Blue Sleeveless Hoodie",
                hex: "#412cb8",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/customize/navy-blue/customize-navy-blue-sleevesless-hoodie-1.webp",
                  },
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/customize/navy-blue/customize-navy-blue-sleevesless-hoodie-2.webp",
                  },
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/customize/navy-blue/customize-navy-blue-sleevesless-hoodie-3.webp",
                  },
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/customize/navy-blue/navy-blue-sleeveless-hoodie-all-view.webp",
                  },
                 
                   {
                    type: "image",
                    src: "/sleeveless-hoodie/customize/navy-blue/navy-blue-sleeveless-hoodie-fabric.webp",
                  },
                  
                 
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/solid/navy-blue/navy-blue-sleeveless-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/solid/navy-blue/navy-blue-sleeveless-hoodie-back.webp",
                  },
                  
                ],
              },

                {
                label: "Black Sleeveless Hoodie",
                title: "Black Sleeveless Hoodie",
                hex: "#0f0f0f",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/customize/black/customize-black-sleevesless-hoodie-1.webp",
                  },
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/customize/black/customize-black-sleevesless-hoodie-2.webp",
                  },
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/customize/black/customize-black-sleevesless-hoodie-3.webp",
                  },
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/customize/black/black-sleeveless-hoodie-fabric.webp",
                  },
                 
                   {
                    type: "image",
                    src: "/sleeveless-hoodie/customize/black/black-sleeveless-hoodie-all-view.webp",
                  },
                  
                 
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/solid/black/black-sleeveless-hoodie-front.webp",
                  },
                  {
                    type: "image",
                    src: "/sleeveless-hoodie/solid/black/black-sleeveless-hoodie-back.webp",
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