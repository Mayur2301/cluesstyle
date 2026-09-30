// PATH: app/lib/cap-collection.ts
// ── Types ──────────────────────────────────────────────────────────────────────

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
// NOTE: this is the single source of truth for product pricing (displayPrice,
// sameDayAvailable, sizes, etc). The create-razorpay-order API route looks
// products up from this same array — never from anything sent by the client —
// so the amount charged can never drift from what's shown on the page.
type RawColor = Omit<ProductColor, "sku">;
type RawProduct = Omit<Product, "sku" | "colors"> & { colors?: RawColor[] };

const CATEGORY_PREFIX = "OST"; // Oversized T-Shirt

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
    return { ...p, sku: productSku, ...(colors ? { colors } : {}) } as Product;
  });
}
const rawProductsData: RawProduct[] = [
 {
    id: "1",
    name: "Premium Custom Logo Trucker Cap",
    slug: "premium-custom-logo-trucker-cap",
    styleLabel: "Trucker Cap",
    styleSubtitle: "Mesh Back",
    basePrice: 240,
    displayPrice: 599,
    originalPrice: 999,
    discount: 35.04,
    images: ["/office-bag/blue-office-bag/blue-office-bag-front.png"],
    media: [
      { type: "image", src: "/solid-polo-neck-colar/apple-green/apple-green-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/apple-green/apple-green-solid-polo-tshirt-back.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/white/left-facing.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/white/right-facing.webp" },
    ],
    printMethod: "DTF, Embroider,Screen Pritng",
    availablepatterns:"Half Sleeves, Drop Shoulder",
    quantityReq: 1,
    priceRange: "budget",
    category: "Oversized T-Shirt",
    description: "High-quality screen printing on sturdy canvas tote bags.",
    features: ["100% Ring-spun Cotton", "Compacted Pre-shrunk", "Bio-wash ", "Double needle stitch on the sleeves and bottom hem","Color fastness Guaranteed","Soft Flow Bleach / Dyed"],
    material: "Cotton, Loop Knitted Fabric, 220 GSM",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    colors: [

      {
          label: "Grey Trucker",
          hex: "#808080",
          sameDayAvailable: true,
          media: [
            { type: "image", src: "/cap-collections/trunker-cap/grey/grey-trucker-cap-front.webp" },
            { type: "image", src: "/cap-collections/trunker-cap/grey/grey-trucker-cap-back.webp" },
            { type: "image", src: "/cap-collections/trunker-cap/grey/grey-trucker-cap-right.webp" },
            { type: "image", src: "/cap-collections/trunker-cap/grey/grey-trucker-cap-left.webp" },
            { type: "image", src: "/cap-collections/trunker-cap/grey/grey-trucker-cap-top.webp" },
          ],
          blankMedia: [
            { type: "image", src: "/cap-collections/trunker-cap/grey/grey-trucker-cap-front.webp" },
            { type: "image", src: "/cap-collections/trunker-cap/grey/grey-trucker-cap-back.webp" },
             { type: "image", src: "/cap-collections/trunker-cap/grey/grey-trucker-cap-left.webp" },
            { type: "image", src: "/cap-collections/trunker-cap/grey/grey-trucker-cap-right.webp" },
          
          ],
        },

                {
            label: "Black Trucker",
            hex: "#000000",
            sameDayAvailable: true,
            media: [
              { type: "image", src: "/cap-collections/trunker-cap/black/black-trucker-cap-front.webp" },
              { type: "image", src: "/cap-collections/trunker-cap/black/black-trucker-cap-back.webp" },
              { type: "image", src: "/cap-collections/trunker-cap/black/black-trucker-cap-right.webp" },
              { type: "image", src: "/cap-collections/trunker-cap/black/black-trucker-cap-left.webp" },
              { type: "image", src: "/cap-collections/trunker-cap/black/black-trucker-cap-top.webp" },
            ],
            blankMedia: [
              { type: "image", src: "/cap-collections/trunker-cap/black/black-trucker-cap-front.webp" },
              { type: "image", src: "/cap-collections/trunker-cap/black/black-trucker-cap-back.webp" },
              { type: "image", src: "/cap-collections/trunker-cap/black/black-trucker-cap-left.webp" },
              { type: "image", src: "/cap-collections/trunker-cap/black/black-trucker-cap-right.webp" },
          
            ],
          },
       

            {
          label: "Golden Yellow Trucker",
          hex: "#FFD700",
          sameDayAvailable: true,
          media: [
            { type: "image", src: "/cap-collections/trunker-cap/golden-yellow/golden yellow-trucker-cap-front.webp" },
            { type: "image", src: "/cap-collections/trunker-cap/golden-yellow/golden yellow-trucker-cap-back.webp" },
            { type: "image", src: "/cap-collections/trunker-cap/golden-yellow/golden yellow-trucker-cap-left.webp" },
            { type: "image", src: "/cap-collections/trunker-cap/golden-yellow/golden yellow-trucker-cap-right.webp" },
            { type: "image", src: "/cap-collections/trunker-cap/golden-yellow/golden yellow-trucker-cap-top.webp" },
          ],
          blankMedia: [
           { type: "image", src: "/cap-collections/trunker-cap/golden-yellow/golden yellow-trucker-cap-front.webp" },
            { type: "image", src: "/cap-collections/trunker-cap/golden-yellow/golden yellow-trucker-cap-back.webp" },
              { type: "image", src: "/cap-collections/trunker-cap/golden-yellow/golden yellow-trucker-cap-right.webp" },
            { type: "image", src: "/cap-collections/trunker-cap/golden-yellow/golden yellow-trucker-cap-left.webp" },
          
          ],
        },


      

      {
        label: "Navy Blue Trucker",
        hex: "#000080",
        sameDayAvailable: true,
        media: [
          { type: "image", src: "/cap-collections/trunker-cap/navy-blue/navy-blue--trucker-cap-front.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/navy-blue/navy-blue--trucker-cap-back.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/navy-blue/navy-blue--trucker-cap-left.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/navy-blue/navy-blue--trucker-cap-right.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/navy-blue/navy-blue--trucker-cap-top.webp" },
        ],
        blankMedia: [
          { type: "image", src: "/cap-collections/trunker-cap/navy-blue/navy-blue--trucker-cap-front.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/navy-blue/navy-blue--trucker-cap-back.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/navy-blue/navy-blue--trucker-cap-right.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/navy-blue/navy-blue--trucker-cap-left.webp" },
        
        ],
      },


      {
        label: "Red Trucker",
        hex: "#FF0000",
        sameDayAvailable: true,
        media: [
          { type: "image", src: "/cap-collections/trunker-cap/red/red-trucker-cap-front.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/red/red-trucker-cap-back.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/red/red-trucker-cap-right.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/red/red-trucker-cap-left.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/red/red-trucker-cap-top.webp" },
        ],
        blankMedia: [
          { type: "image", src: "/cap-collections/trunker-cap/red/red-trucker-cap-front.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/red/red-trucker-cap-back.webp" },
            { type: "image", src: "/cap-collections/trunker-cap/red/red-trucker-cap-left.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/red/red-trucker-cap-right.webp" },
        
        ],
      },



      {
        label: "White Trucker",
        hex: "#FFFFFF",
        sameDayAvailable: true,
        media: [
          { type: "image", src: "/cap-collections/trunker-cap/white/white-trucker-cap-front.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/white/white-trucker-cap-back.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/white/white-trucker-cap-right.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/white/white-trucker-cap-left.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/white/white-trucker-cap-top.webp" },
        ],
        blankMedia: [
          { type: "image", src: "/cap-collections/trunker-cap/white/white-trucker-cap-front.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/white/white-trucker-cap-back.webp" },
            { type: "image", src: "/cap-collections/trunker-cap/white/white-trucker-cap-left.webp" },
          { type: "image", src: "/cap-collections/trunker-cap/white/white-trucker-cap-right.webp" },
        
        ],
      },



     
    ],
    inStock: true,
    weight: 300,
    customizable: true,
    logoUploadEnabled: true,
    enabledLogoSides: ["front"],
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
    id: "2",
   name: "Casual Caps",
    slug: "casual-premium-and-basic-cap",
    styleLabel: "Casual Cap",
    styleSubtitle: "Curved Visor",
    basePrice: 240,
     displayPrice: 599,
    originalPrice: 999,
    discount: 29,
    cardBg:"#f9f9f9",
    images: ["/office-bag/blue-office-bag/blue-office-bag-front.png"],
    media: [
       { type: "image", src: "/cap-collections/cotton-basic-cap/green/green-cotton-mix-basic-cap-front.webp" },
      { type: "image", src: "/cap-collections/cotton-basic-cap/green/green-cotton-mix-basic-cap-left.webp" },
      { type: "image", src: "/cap-collections/cotton-basic-cap/green/green-cotton-mix-basic-cap-right.webp" },
      { type: "image", src: "/cap-collections/cotton-basic-cap/green/green-cotton-mix-basic-cap-left.webp" },
       
    ],
    printMethod: "Screen Printing",
    quantityReq: 1,
    priceRange: "budget",
    category: "Oversized T-Shirt",
    description: "High-quality screen printing on sturdy canvas tote bags.",
    features: ["100% Canvas", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton Canvas, 180 GSM",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    isBasicPremiumCategory: true,
    fabricCategoryBanner: {
      basic: {
        title: "BASIC CAP",
        description: "Durable, lightweight & budget friendly caps for everyday use.",
        image: "/cap-collections/p2.webp",
        badges: ["Durable", "Lightweight", "Budget Friendly"],
      },
      premium: {
        title: "PREMIUM CAP",
        description: "Superior quality, better shape retention & a long-lasting premium finish.",
        image: "/cap-collections/p1.webp",
        badges: ["Premium Quality", "Long Lasting", "Superior Finish"],
      },
      
    },
    fabricChoices: {
      basic: [
        {
          id: "cotton-blend",
          name: "Cotton blend",
          subtitle: "Durable, Lightweight",
          image: "/cotton-banner/premium-100-cotton.webp",
          products: [
           {
              id: "cotton-blend-black",
              name: "Black Cotton Cap",
              image: "/cap-collections/cotton-basic-cap/black/black-cotton-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/cotton-basic-cap/black/black-cotton-mix-basic-cap-front.webp",
                "/cap-collections/cotton-basic-cap/black/black-cotton-mix-basic-cap-back.webp",
                "/cap-collections/cotton-basic-cap/black/black-cotton-mix-basic-cap-right.webp",
                "/cap-collections/cotton-basic-cap/black/black-cotton-mix-basic-cap-left.webp",
              ],
            },

             {
              id: "cotton-blend-gold-yellow",
              name: "Golden Yellow Cotton Cap",
              image: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-front.webp",
                "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-back.webp",
                "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-right.webp",
                "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-left.webp",
              ],
            },

            {
              id: "cotton-blend-green",
              name: "Green Cotton Cap",
              image: "/cap-collections/cotton-basic-cap/green/green-cotton-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/cotton-basic-cap/green/green-cotton-mix-basic-cap-front.webp",
                "/cap-collections/cotton-basic-cap/green/green-cotton-mix-basic-cap-back.webp",
                "/cap-collections/cotton-basic-cap/green/green-cotton-mix-basic-cap-right.webp",
                "/cap-collections/cotton-basic-cap/green/green-cotton-mix-basic-cap-left.webp",
              ],
            },

            {
              id: "cotton-blend-lemon-yellow",
              name: "Lemon Yellow Cotton Cap",
              image: "/cap-collections/cotton-basic-cap/lemon yellow/lemon-yellow-cotton-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/cotton-basic-cap/lemon yellow/lemon-yellow-cotton-mix-basic-cap-front.webp",
                "/cap-collections/cotton-basic-cap/lemon yellow/lemon-yellow-cotton-mix-basic-cap-back.webp",
                "/cap-collections/cotton-basic-cap/lemon yellow/lemon-yellow-cotton-mix-basic-cap-right.webp",
                "/cap-collections/cotton-basic-cap/lemon yellow/lemon-yellow-cotton-mix-basic-cap-left.webp",
              ],
            },

            {
              id: "cotton-blend-military-green",
              name: "Military Green Cotton Cap",
              image: "/cap-collections/cotton-basic-cap/militery green/militrery-green-cotton-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/cotton-basic-cap/militery green/militrery-green-cotton-mix-basic-cap-front.webp",
                "/cap-collections/cotton-basic-cap/militery green/militrery-green-cotton-mix-basic-cap-back.webp",
                "/cap-collections/cotton-basic-cap/militery green/militrery-green-cotton-mix-basic-cap-right.webp",
                "/cap-collections/cotton-basic-cap/militery green/militrery-green-cotton-mix-basic-cap-left.webp",
              ],
            },


             {
              id: "cotton-blend-navy-blue",
              name: "Navy Blue Cotton Cap",
              image: "/cap-collections/cotton-basic-cap/navy blue/navy-blue-cotton-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/cotton-basic-cap/navy blue/navy-blue-cotton-mix-basic-cap-front.webp",
                "/cap-collections/cotton-basic-cap/navy blue/navy-blue-cotton-mix-basic-cap-back.webp",
                "/cap-collections/cotton-basic-cap/navy blue/navy-blue-cotton-mix-basic-cap-right.webp",
                "/cap-collections/cotton-basic-cap/navy blue/navy-blue-cotton-mix-basic-cap-lefgt.webp",
              ],
            },


             {
              id: "cotton-blend-red",
              name: "Red Cotton Cap",
              image: "/cap-collections/cotton-basic-cap/red/red-cotton-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/cotton-basic-cap/red/red-cotton-mix-basic-cap-front.webp",
                "/cap-collections/cotton-basic-cap/red/red-cotton-mix-basic-cap-back.webp",
                "/cap-collections/cotton-basic-cap/red/red-cotton-mix-basic-cap-right.webp",
                "/cap-collections/cotton-basic-cap/red/red-cotton-mix-basic-cap-left.webp",
              ],
            },
             {
              id: "cotton-blend-royal-blue",
              name: "Royal Blue Cotton Cap",
              image: "/cap-collections/cotton-basic-cap/royal blue/royal-blue-cotton-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/cotton-basic-cap/royal blue/royal-blue-cotton-mix-basic-cap-front.webp",
                "/cap-collections/cotton-basic-cap/royal blue/royal-blue-cotton-mix-basic-cap-back.webp",
                "/cap-collections/cotton-basic-cap/royal blue/royal-blue-cotton-mix-basic-cap-right.webp",
                "/cap-collections/cotton-basic-cap/royal blue/royal-blue-cotton-mix-basic-cap-left.webp",
              ],
            },

            {
              id: "cotton-blend-sky-blue",
              name: "Sky blue Cotton Cap",
              image: "/cap-collections/cotton-basic-cap/sky blue/sky-blue-cotton-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/cotton-basic-cap/sky blue/sky-blue-cotton-mix-basic-cap-front.webp",
                "/cap-collections/cotton-basic-cap/sky blue/sky-blue-cotton-mix-basic-cap-back.webp",
                "/cap-collections/cotton-basic-cap/sky blue/sky-blue-cotton-mix-basic-cap-right.webp",
                "/cap-collections/cotton-basic-cap/sky blue/sky-blue-cotton-mix-basic-cap-left.webp",
              ],
            },

            {
              id: "cotton-blend-white",
              name: "White Cotton Cap",
              image: "/cap-collections/cotton-basic-cap/white/white-cotton-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/cotton-basic-cap/white/white-cotton-mix-basic-cap-front.webp",
                "/cap-collections/cotton-basic-cap/white/white-cotton-mix-basic-cap-back.webp",
                "/cap-collections/cotton-basic-cap/white/white-cotton-mix-basic-cap-right.webp",
                "/cap-collections/cotton-basic-cap/white/white-cotton-mix-basic-cap-left.webp",
              ],
            },


          ],
        },
                
        {
          id: "polyester-cotton-mix",
          name: "Polyester Cotton Mix",
          subtitle: "Durable, Lightweight",
          image: "/cotton-banner/basic-cotton.webp",
          products: [
            {
              id: "polyester-mix-gold-yellow",
              name: "Polyester Mix Gold Yellow",
              image: "/cap-collections/pc-mix-basic-cap/gold yello/gold-yellow-pc-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/pc-mix-basic-cap/gold yello/gold-yellow-pc-mix-basic-cap-front.webp",
                "/cap-collections/pc-mix-basic-cap/gold yello/gold-yellow-pc-mix-basic-cap-back.webp",
                "/cap-collections/pc-mix-basic-cap/gold yello/gold-yellow-pc-mix-basic-cap-right.webp",
                "/cap-collections/pc-mix-basic-cap/gold yello/gold-yellow-pc-mix-basic-cap-left.webp",
              ],
            },

            {
              id: "polyester-mix-black",
              name: "Polyester Mix Black",
              image: "/cap-collections/pc-mix-basic-cap/black/black-pc-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/pc-mix-basic-cap/black/black-pc-mix-basic-cap-front.webp",
                "/cap-collections/pc-mix-basic-cap/black/black-pc-mix-basic-cap-back1.webp",
                "/cap-collections/pc-mix-basic-cap/black/black-pc-mix-basic-cap-right.webp",
                "/cap-collections/pc-mix-basic-cap/black/black-pc-mix-basic-cap-left.webp",
              ],
            },

            {
              id: "polyester-mix-green",
              name: "Polyester Mix Green",
              image: "/cap-collections/pc-mix-basic-cap/green/green-pc-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/pc-mix-basic-cap/green/green-pc-mix-basic-cap-front.webp",
                "/cap-collections/pc-mix-basic-cap/green/green-pc-mix-basic-cap-back.webp",
                "/cap-collections/pc-mix-basic-cap/green/green-pc-mix-basic-cap-right.webp",
                "/cap-collections/pc-mix-basic-cap/green/green-pc-mix-basic-cap-left.webp",
              ],
            },

            

            {
              id: "polyester-mix-lemon-yellow",
              name: "Polyester Mix Lenom Yellow",
              image: "/cap-collections/pc-mix-basic-cap/lemon yellow/lemon-yellow-pc-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/pc-mix-basic-cap/lemon yellow/lemon-yellow-pc-mix-basic-cap-front.webp",
                "/cap-collections/pc-mix-basic-cap/lemon yellow/lemon-yellow-pc-mix-basic-cap-back.webp",
                "/cap-collections/pc-mix-basic-cap/lemon yellow/lemon-yellow-pc-mix-basic-cap-right.webp",
                "/cap-collections/pc-mix-basic-cap/lemon yellow/lemon-yellow-pc-mix-basic-cap-left.webp",
              ],
            },

            {
              id: "polyester-mix-sky-blue",
              name: "Polyester Mix Sky Blue",
              image: "/cap-collections/pc-mix-basic-cap/navy blue/navy-blue-pc-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/pc-mix-basic-cap/navy blue/navy-blue-pc-mix-basic-cap-front.webp",
                "/cap-collections/pc-mix-basic-cap/navy blue/navy-blue-pc-mix-basic-cap-back.webp",
                "/cap-collections/pc-mix-basic-cap/navy blue/navy-blue-pc-mix-basic-cap-right.webp",
                "/cap-collections/pc-mix-basic-cap/navy blue/navy-blue-pc-mix-basic-cap-left.webp",
              ],
            },

            {
              id: "polyester-mix-orange",
              name: "Polyester Mix Orange",
              image: "/cap-collections/pc-mix-basic-cap/orange/orange-pc-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/pc-mix-basic-cap/orange/orange-pc-mix-basic-cap-front.webp",
                "/cap-collections/pc-mix-basic-cap/orange/orange-pc-mix-basic-cap-back.webp",
                "/cap-collections/pc-mix-basic-cap/orange/orange-pc-mix-basic-cap-right.webp",
                "/cap-collections/pc-mix-basic-cap/orange/orange-pc-mix-basic-cap-left.webp",
              ],
            },

            {
              id: "polyester-mix-red",
              name: "Polyester Mix Red",
              image: "/cap-collections/pc-mix-basic-cap/red/red-pc-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/pc-mix-basic-cap/red/red-pc-mix-basic-cap-front.webp",
                "/cap-collections/pc-mix-basic-cap/red/red-pc-mix-basic-cap-back.webp",
                "/cap-collections/pc-mix-basic-cap/red/red-pc-mix-basic-cap-right1.webp",
                "/cap-collections/pc-mix-basic-cap/red/red-pc-mix-basic-cap-left.webp",
              ],
            },


            {
              id: "polyester-mix-white",
              name: "Polyester Mix White",
              image: "/cap-collections/pc-mix-basic-cap/white/white-pc-mix-basic-cap-front.webp",
              images: [
                "/cap-collections/pc-mix-basic-cap/white/white-pc-mix-basic-cap-front.webp",
                "/cap-collections/pc-mix-basic-cap/white/white-pc-mix-basic-cap-back.webp",
                "/cap-collections/pc-mix-basic-cap/white/white-pc-mix-basic-cap-right.webp",
                "/cap-collections/pc-mix-basic-cap/white/white-pc-mix-basic-cap-left.webp",
              ],
            },



          ],
        },

        
      ],
      premium: [
       {
          id: "premium-cap",
          name: "Velcro Caps",
          subtitle: "Durable, Lightweight",
          image: "/cotton-banner/basic-cotton.webp",
          // Pick whichever image you want shown on the card here — this is
          // independent of the products list below.
          cardImage: "/cap-collections/velcro.webp",
          products: [
           {
              id: "velcro-black",
              name: "Velcro Black Cap",
              image: "/cap-collections/velcro/black/black-velco-tap-cap-front.webp",
              images: [
                "/cap-collections/velcro/black/black-velco-tap-cap-front.webp",
                "/cap-collections/velcro/black/black-velco-tap-cap-back.webp",
                "/cap-collections/velcro/black/black-velco-tap-cap-right.webp",
                "/cap-collections/velcro/black/black-velco-tap-cap-left.webp",
                 "/cap-collections/velcro/black/black-velco-tap-cap-side.webp",
              ],
            },


            {
              id: "velcro-navy-blue",
              name: "Velcro Navy Blue Cap",
              image: "/cap-collections/velcro/navy blue/navy-lue-velco-tap-cap-front.webp",
              images: [
                "/cap-collections/velcro/navy blue/navy-lue-velco-tap-cap-front.webp",
                "/cap-collections/velcro/navy blue/navy-lue-velco-tap-cap-back.webp",
                "/cap-collections/velcro/navy blue/navy-lue-velco-tap-cap-right.webp",
                "/cap-collections/velcro/navy blue/navy-lue-velco-tap-cap-left.webp",
                 "/cap-collections/velcro/navy blue/navy-lue-velco-tap-cap-side.webp",
              ],
            },

              {
              id: "velcro-red",
              name: "Velcro Red Cap",
              image: "/cap-collections/velcro/red/red-velco-tap-cap-front.webp",
              images: [
                "/cap-collections/velcro/red/red-velco-tap-cap-front.webp",
                "/cap-collections/velcro/red/red-velco-tap-cap-back.webp",
                "/cap-collections/velcro/red/red-velco-tap-cap-right.webp",
                "/cap-collections/velcro/red/red-velco-tap-cap-left.webp",
                 "/cap-collections/velcro/red/red-velco-tap-cap-side.webp",
              ],
            },

             {
              id: "velcro-white",
              name: "Velcro White Cap",
              image: "/cap-collections/velcro/white/white-velco-tap-cap-front.webp",
              images: [
                "/cap-collections/velcro/white/white-velco-tap-cap-front.webp",
                "/cap-collections/velcro/white/white-velco-tap-cap-back.webp",
                "/cap-collections/velcro/white/white-velco-tap-cap-right.webp",
                "/cap-collections/velcro/white/white-velco-tap-cap-left.webp",
                 "/cap-collections/velcro/white/white-velco-tap-cap-side.webp",
              ],
            },




                        
          ],
        },
                
        {
          id: "metal-suspender-cap",
          name: "Metal Suspender Cap",
          subtitle: "Durable, Lightweight",
          image: "/cotton-banner/premium-cotton-blend.webp",
          cardImage: "/cap-collections/metal-suspender.webp",
          products: [
            {
              id: "metal-suspender-black-cap",
              name: "Black Suspender Cap",
              image: "/cap-collections/metal-suspender/black/black-Metal-Suspender-Buckles-cap-front.webp",
              images: [
                "/cap-collections/metal-suspender/black/black-Metal-Suspender-Buckles-cap-front.webp",
                "/cap-collections/metal-suspender/black/black-Metal-Suspender-Buckles-cap-back.webp",
                "/cap-collections/metal-suspender/black/black-Metal-Suspender-Buckles-cap-right.webp",
                "/cap-collections/metal-suspender/black/black-Metal-Suspender-Buckles-cap-left.webp",
                 "/cap-collections/metal-suspender/black/black-Metal-Suspender-Buckles-cap-side.webp",
              ],
            },


             {
              id: "metal-suspender-gold-cap",
              name: "Golden Suspender Cap",
              image: "/cap-collections/metal-suspender/golden yellow/golden-yellow-Metal-Suspender-Buckles-cap-front.webp",
              images: [
                "/cap-collections/metal-suspender/golden yellow/golden-yellow-Metal-Suspender-Buckles-cap-front.webp",
                "/cap-collections/metal-suspender/golden yellow/golden-yellow-Metal-Suspender-Buckles-cap-back.webp",
                "/cap-collections/metal-suspender/golden yellow/golden-yellow-Metal-Suspender-Buckles-cap-right.webp",
                "/cap-collections/metal-suspender/golden yellow/golden-yellow-Metal-Suspender-Buckles-cap-left.webp",
                 "/cap-collections/metal-suspender/golden yellow/golden-yellow-Metal-Suspender-Buckles-cap-side.webp",
              ],
            },

           {
              id: "metal-suspender-green-cap",
              name: "Green Suspender Cap",
              image: "/cap-collections/metal-suspender/green/green-Metal-Suspender-Buckles-tap-cap-front.webp",
              images: [
                "/cap-collections/metal-suspender/green/green-Metal-Suspender-Buckles-tap-cap-front.webp",
                "/cap-collections/metal-suspender/green/green-Metal-Suspender-Buckles-tap-cap-back.webp",
                "/cap-collections/metal-suspender/green/green-Metal-Suspender-Buckles-tap-cap-right.webp",
                "/cap-collections/metal-suspender/green/green-Metal-Suspender-Buckles-tap-cap-left.webp",
                 "/cap-collections/metal-suspender/green/green-Metal-Suspender-Buckles-tap-cap-side.webp",
              ],
            },



             {
              id: "metal-suspender-light-blue-cap",
              name: "light Blue Suspender Cap",
              image: "/cap-collections/metal-suspender/light blue/light-blue-Metal-Suspender-Buckles-cap-front.webp",
              images: [
                "/cap-collections/metal-suspender/light blue/light-blue-Metal-Suspender-Buckles-cap-front.webp",
                "/cap-collections/metal-suspender/light blue/light-blue-Metal-Suspender-Buckles-cap-back.webp",
                "/cap-collections/metal-suspender/light blue/light-blue-Metal-Suspender-Buckles-cap-right.webp",
                "/cap-collections/metal-suspender/light blue/light-blue-Metal-Suspender-Buckles-cap-left.webp",
                 "/cap-collections/metal-suspender/light blue/light-blue-Metal-Suspender-Buckles-cap-side.webp",
              ],
            },

             {
              id: "metal-suspender-navy-blue-cap",
              name: "Navy Blue Suspender Cap",
              image: "/cap-collections/metal-suspender/navy blue/navy-blue-Metal-Suspender-Buckles-cap-front.webp",
              images: [
                "/cap-collections/metal-suspender/navy blue/navy-blue-Metal-Suspender-Buckles-cap-front.webp",
                "/cap-collections/metal-suspender/navy blue/navy-blue-Metal-Suspender-Buckles-cap-back.webp",
                "/cap-collections/metal-suspender/navy blue/navy-blue-Metal-Suspender-Buckles-cap-right.webp",
                "/cap-collections/metal-suspender/navy blue/navy-blue-Metal-Suspender-Buckles-cap-left.webp",
                 "/cap-collections/metal-suspender/navy blue/navy-blue-Metal-Suspender-Buckles-cap-side.webp",
              ],
            },

             {
              id: "metal-suspender-olive-green-cap",
              name: "Olive Green Suspender Cap",
              image: "/cap-collections/metal-suspender/olive green/olive-green-Metal-Suspender-Buckles-cap-front.webp",
              images: [
                "/cap-collections/metal-suspender/olive green/olive-green-Metal-Suspender-Buckles-cap-front.webp",
                "/cap-collections/metal-suspender/olive green/olive-green-Metal-Suspender-Buckles-cap-back.webp",
                "/cap-collections/metal-suspender/olive green/olive-green-Metal-Suspender-Buckles-cap-right.webp",
                "/cap-collections/metal-suspender/olive green/olive-green-Metal-Suspender-Buckles-cap-left.webp",
                 "/cap-collections/metal-suspender/olive green/olive-green-Metal-Suspender-Buckles-cap-side.webp",
              ],
            },
            

             {
              id: "metal-suspender-red-cap",
              name: "Red Suspender Cap",
              image: "/cap-collections/metal-suspender/red/red-Metal-Suspender-Buckles-cap-front.webp",
              images: [
                "/cap-collections/metal-suspender/red/red-Metal-Suspender-Buckles-cap-front.webp",
                "/cap-collections/metal-suspender/red/red-Metal-Suspender-Buckles-cap-back.webp",
                "/cap-collections/metal-suspender/red/red-Metal-Suspender-Buckles-cap-right.webp",
                "/cap-collections/metal-suspender/red/red-Metal-Suspender-Buckles-cap-left.webp",
                 "/cap-collections/metal-suspender/red/red-Metal-Suspender-Buckles-cap-side.webp",
              ],
            },


              {
              id: "metal-suspender-royal-blue-cap",
              name: "Royal Blue Suspender Cap",
              image: "/cap-collections/metal-suspender/royal blue/royal-blue-Metal-Suspender-Buckles-cap-front.webp",
              images: [
                "/cap-collections/metal-suspender/royal blue/royal-blue-Metal-Suspender-Buckles-cap-front.webp",
                "/cap-collections/metal-suspender/royal blue/royal-blue-Metal-Suspender-Buckles-cap-back.webp",
                "/cap-collections/metal-suspender/royal blue/royal-blue-Metal-Suspender-Buckles-cap-right.webp",
                "/cap-collections/metal-suspender/royal blue/royal-blue-Metal-Suspender-Buckles-cap-left.webp",
                 "/cap-collections/metal-suspender/royal blue/royal-blue-Metal-Suspender-Buckles-cap-side.webp",
              ],
            },


            {
              id: "metal-suspender-white-cap",
              name: "White Suspender Cap",
              image: "/cap-collections/metal-suspender/white/white-Metal-Suspender-Buckles-cap-front.webp",
              images: [
                "/cap-collections/metal-suspender/white/white-Metal-Suspender-Buckles-cap-front.webp",
                "/cap-collections/metal-suspender/white/white-Metal-Suspender-Buckles-cap-back.webp",
                "/cap-collections/metal-suspender/white/white-Metal-Suspender-Buckles-cap-right.webp",
                "/cap-collections/metal-suspender/white/white-Metal-Suspender-Buckles-cap-left.webp",
                 "/cap-collections/metal-suspender/white/white-Metal-Suspender-Buckles-cap-side.webp",
              ],
            },
              
           
          ],
        },


        {
          id: "silver-buckle-cap",
          name: "Silver Buckle caps",
          subtitle: "Durable, Lightweight",
          image: "/cotton-banner/premium-100-cotton.webp",
          cardImage: "/cap-collections/silver-buckle.webp",
          products: [
          
            {
            id: "silver-buckle-beige",
            name: "Beige Silver Buckle Cap",
            image: "/cap-collections/silver-buckle/beige/baige-Metal-Slider-Silver-Buckle-cap-front.webp",
            images: [
              "/cap-collections/silver-buckle/beige/baige-Metal-Slider-Silver-Buckle-cap-front.webp",
              "/cap-collections/silver-buckle/beige/baige-Metal-Slider-Silver-Buckle-cap-back.webp",
              "/cap-collections/silver-buckle/beige/baige-Metal-Slider-Silver-Buckle-cap-right.webp",
              "/cap-collections/silver-buckle/beige/baige-Metal-Slider-Silver-Buckle-cap-left.webp",
              "/cap-collections/silver-buckle/beige/baige-Metal-Slider-Silver-Buckle-cap-side.webp",
            ],
            },

            {
              id: "silver-buckle-black",
              name: "Black Silver Buckle Cap",
              image: "/cap-collections/silver-buckle/black/black-Metal-Slider-Silver-Buckle-cap-front.webp",
              images: [
                "/cap-collections/silver-buckle/black/black-Metal-Slider-Silver-Buckle-cap-front.webp",
                "/cap-collections/silver-buckle/black/black-Metal-Slider-Silver-Buckle-cap-back.webp",
                "/cap-collections/silver-buckle/black/black-Metal-Slider-Silver-Buckle-cap-right.webp",
                "/cap-collections/silver-buckle/black/black-Metal-Slider-Silver-Buckle-cap-left.webp",
                "/cap-collections/silver-buckle/black/black-Metal-Slider-Silver-Buckle-cap-side.webp",
              ],
            },

            {
              id: "silver-buckle-bottle-green",
              name: "Bottle Green Silver Buckle Cap",
              image: "/cap-collections/silver-buckle/bottle-green/bottle-green-Metal-Slider-Silver-Buckle-cap-front.webp",
              images: [
                "/cap-collections/silver-buckle/bottle-green/bottle-green-Metal-Slider-Silver-Buckle-cap-front.webp",
                "/cap-collections/silver-buckle/bottle-green/bottle-green-Metal-Slider-Silver-Buckle-cap-back.webp",
                "/cap-collections/silver-buckle/bottle-green/bottle-green-Metal-Slider-Silver-Buckle-cap-right.webp",
                "/cap-collections/silver-buckle/bottle-green/bottle-green-Metal-Slider-Silver-Buckle-cap-left.webp",
                "/cap-collections/silver-buckle/bottle-green/bottle-green-Metal-Slider-Silver-Buckle-cap-side.webp",
              ],
            },

            {
            id: "silver-buckle-golden-yellow",
            name: "Golden Yellow Silver Buckle Cap",
            image: "/cap-collections/silver-buckle/golden-yellow/golen-yellow-Metal-Slider-Silver-Buckle-cap-front (1).webp",
            images: [
              "/cap-collections/silver-buckle/golden-yellow/golen-yellow-Metal-Slider-Silver-Buckle-cap-front (1).webp",
              "/cap-collections/silver-buckle/golden-yellow/golen-yellow-Metal-Slider-Silver-Buckle-cap-back.webp",
              "/cap-collections/silver-buckle/golden-yellow/golen-yellow-Metal-Slider-Silver-Buckle-cap-right.webp",
              "/cap-collections/silver-buckle/golden-yellow/golen-yellow-Metal-Slider-Silver-Buckle-cap-left.webp",
              "/cap-collections/silver-buckle/golden-yellow/golen-yellow-Metal-Slider-Silver-Buckle-cap-side.webp",
            ],
          },


          {
              id: "silver-buckle-navy-blue",
              name: "Navy Blue Silver Buckle Cap",
              image: "/cap-collections/silver-buckle/navy-blue/Navy-blue-Metal-Slider-Silver-Buckle-cap-front.webp",
              images: [
                "/cap-collections/silver-buckle/navy-blue/Navy-blue-Metal-Slider-Silver-Buckle-cap-front.webp",
                "/cap-collections/silver-buckle/navy-blue/Navy-blue-Metal-Slider-Silver-Buckle-cap-back.webp",
                "/cap-collections/silver-buckle/navy-blue/Navy-blue-Metal-Slider-Silver-Buckle-cap-right.webp",
                "/cap-collections/silver-buckle/navy-blue/Navy-blue-Metal-Slider-Silver-Buckle-cap-left.webp",
                "/cap-collections/silver-buckle/navy-blue/Navy-blue-Metal-Slider-Silver-Buckle-cap-side.webp",
              ],
            },


            {
              id: "silver-buckle-red",
              name: "Red Silver Buckle Cap",
              image: "/cap-collections/silver-buckle/red/red-Metal-Slider-Silver-Buckle-cap-front.webp",
              images: [
                "/cap-collections/silver-buckle/red/red-Metal-Slider-Silver-Buckle-cap-front.webp",
                "/cap-collections/silver-buckle/red/red-Metal-Slider-Silver-Buckle-cap-back.webp",
                "/cap-collections/silver-buckle/red/red-Metal-Slider-Silver-Buckle-cap-right.webp",
                "/cap-collections/silver-buckle/red/red-Metal-Slider-Silver-Buckle-cap-left.webp",
                "/cap-collections/silver-buckle/red/red-Metal-Slider-Silver-Buckle-cap-side.webp",
              ],
            },
            {
              id: "silver-buckle-royal-blue",
              name: "Royal Blue Silver Buckle Cap",
              image: "/cap-collections/silver-buckle/royal-blue/royal-blue-Metal-Slider-Silver-Buckle-cap-front.webp",
              images: [
                "/cap-collections/silver-buckle/royal-blue/royal-blue-Metal-Slider-Silver-Buckle-cap-front.webp",
                "/cap-collections/silver-buckle/royal-blue/royal-blue-Metal-Slider-Silver-Buckle-cap-back.webp",
                "/cap-collections/silver-buckle/royal-blue/royal-blue-Metal-Slider-Silver-Buckle-cap-right.webp",
                "/cap-collections/silver-buckle/royal-blue/royal-blue-Metal-Slider-Silver-Buckle-cap-left.webp",
                "/cap-collections/silver-buckle/royal-blue/royal-blue-Metal-Slider-Silver-Buckle-cap-side.webp",
              ],
            },
            {
              id: "silver-buckle-white",
              name: "White Silver Buckle Cap",
              image: "/cap-collections/silver-buckle/white/white-Metal-Slider-Silver-Buckle-cap-front.webp",
              images: [
                "/cap-collections/silver-buckle/white/white-Metal-Slider-Silver-Buckle-cap-front.webp",
                "/cap-collections/silver-buckle/white/white-Metal-Slider-Silver-Buckle-cap-back.webp",
                "/cap-collections/silver-buckle/white/white-Metal-Slider-Silver-Buckle-cap-right.webp",
                "/cap-collections/silver-buckle/white/white-Metal-Slider-Silver-Buckle-cap-left.webp",
                "/cap-collections/silver-buckle/white/white-Metal-Slider-Silver-Buckle-cap-side.webp",
              ],
            },



           
          ],
        },





      ],
    },
    
    colors: [
      // {
      //   label: "Apple Green Collar Tipping Polo",
      //   hex: "#99ef4f",
      //   media: [
      //     { type: "image", src: "/tipping-collar-t-shirt/apple-green-with-white/apple-green-tipping-white-collar-tshirt-front.webp" },
      //     { type: "image", src: "/tipping-collar-t-shirt/apple-green-with-white/apple-green-tipping-white-collar-tshirt-back.webp" },
      //     { type: "image", src: "/tipping-collar-t-shirt/apple-green-with-white/apple-green-tipping-white-collar-tshirt-left.webp" },
      //     { type: "image", src: "/tipping-collar-t-shirt/apple-green-with-white/apple-green-tipping-white-collar-tshirt-right.webp" },
      //      { type: "image", src: "/tipping-collar-t-shirt/apple-green-with-white/apple-green-tipping-white-collar-tshirt-info.webp" },
      //   ],
      // },

      

     

    ],
    inStock: true,
    weight: 300,
    customizable: true,
    logoUploadEnabled: true,
    sameDayAvailable: true,
    offer: DEFAULT_OFFER,
  },
  {
    id: "3",
   name: "Premium 6 Panel Flat Brim Snapback Cap",
    slug: "customized-caps",
    styleLabel: "Snapback Cap",
    styleSubtitle: "Flat Visor",
    isStylePicker: true,
    basePrice: 240,
     displayPrice: 599,
    originalPrice: 999,
    discount: 29,
    images: [""],
    media: [
      // { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-front.webp" },
          
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Oversized T-Shirt",
    description: "High-quality screen printing on sturdy canvas tote bags.",
    features: ["100% Canvas", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton Canvas, 180 GSM",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    fabricSubCategories: {
      basic: [
        {
          id: "pc-mix",
          label: "PC Mix",
          products: [
            { id: "pc-mix-navy", name: "PC Mix Navy", image: "/fabric-products/pc-mix-navy.webp" },
            { id: "pc-mix-black", name: "PC Mix Black", image: "/fabric-products/pc-mix-black.webp" },
          ],
        },
        {
          id: "basic-cotton",
          label: "Basic Cotton",
          products: [
            { id: "basic-cotton-white", name: "Basic Cotton White", image: "/fabric-products/basic-cotton-white.webp" },
            { id: "basic-cotton-grey", name: "Basic Cotton Grey", image: "/fabric-products/basic-cotton-grey.webp" },
          ],
        },

        {
          id: "basic-cotton-200",
          label: "Basic Cotton 200GSM",
          products: [
            { id: "basic-cotton-white", name: "Basic Cotton White", image: "/fabric-products/basic-cotton-white.webp" },
            { id: "basic-cotton-grey", name: "Basic Cotton Grey", image: "/fabric-products/basic-cotton-grey.webp" },
          ],
        },
      ],
      premium: [
        {
          id: "pure-cotton",
          label: "100% Pure Cotton",
          products: [
            { id: "pure-cotton-black", name: "Pure Cotton Black", image: "/fabric-products/pure-cotton-black.webp" },
            { id: "pure-cotton-olive", name: "Pure Cotton Olive", image: "/fabric-products/pure-cotton-olive.webp" },
          ],
        },
      ],
    },
    colors: [
      




     
    ],
    inStock: true,
    weight: 300,
    customizable: true,
    logoUploadEnabled: true,
    sameDayAvailable: true,
    offer: DEFAULT_OFFER,
  },
  {
    id: "4",
    name: "Basic Cotton Blend Caps",
    slug: "basic-cotton-blend-caps",
    styleLabel: "Basic Cotton Caps",
    styleSubtitle: "Mesh Back",
    basePrice: 240,
    displayPrice: 599,
    originalPrice: 999,
    discount: 35.04,
    images: ["/office-bag/blue-office-bag/blue-office-bag-front.png"],
    media: [
      { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-front.webp" },
      { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-left.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/white/left-facing.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/white/right-facing.webp" },
    ],
    printMethod: "DTF, Embroider,Screen Pritng",
    availablepatterns:"Half Sleeves, Drop Shoulder",
    quantityReq: 1,
    priceRange: "budget",
    category: "Oversized T-Shirt",
    description: "High-quality screen printing on sturdy canvas tote bags.",
    features: ["100% Ring-spun Cotton", "Compacted Pre-shrunk", "Bio-wash ", "Double needle stitch on the sleeves and bottom hem","Color fastness Guaranteed","Soft Flow Bleach / Dyed"],
    material: "Cotton, Loop Knitted Fabric, 220 GSM",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    colors: [
        
              {
                label: "Golden Yellow Cotton Cap",
                hex: "#FFD700",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-left.webp",
                  },
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-left.webp",
                  },
                ],
              },
              {
                label: "Black Cotton Cap",
                hex: "#000000",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/black/black-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/black/black-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/black/black-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/black/black-cotton-mix-basic-cap-left.webp",
                  },
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/black/black-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/black/black-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/black/black-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/black/black-cotton-mix-basic-cap-left.webp",
                  },
                ],
              },


              {
                label: "Green Cotton Cap",
                hex: "#008000",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/green/green-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/green/green-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/green/green-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/green/green-cotton-mix-basic-cap-left.webp",
                  },
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/green/green-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/green/green-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/green/green-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/green/green-cotton-mix-basic-cap-left.webp",
                  },
                ],
              },

              {
                label: "Lemon Yellow Cotton Cap",
                hex: "#FFF44F",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/lemon yellow/lemon-yellow-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/lemon yellow/lemon-yellow-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/lemon yellow/lemon-yellow-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/lemon yellow/lemon-yellow-cotton-mix-basic-cap-left.webp",
                  },
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/lemon yellow/lemon-yellow-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/lemon yellow/lemon-yellow-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/lemon yellow/lemon-yellow-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/lemon yellow/lemon-yellow-cotton-mix-basic-cap-left.webp",
                  },
                ],
              },

              {
                label: "Military Green Cotton Cap",
                hex: "#4B5320",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/militery green/militrery-green-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/militery green/militrery-green-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/militery green/militrery-green-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/militery green/militrery-green-cotton-mix-basic-cap-left.webp",
                  },
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/militery green/militrery-green-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/militery green/militrery-green-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/militery green/militrery-green-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/militery green/militrery-green-cotton-mix-basic-cap-left.webp",
                  },
                ],
              },

              {
                label: "Navy Blue Cotton Cap",
                hex: "#000080",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/navy blue/navy-blue-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/navy blue/navy-blue-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/navy blue/navy-blue-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/navy blue/navy-blue-cotton-mix-basic-cap-lefgt.webp",
                  },
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/navy blue/navy-blue-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/navy blue/navy-blue-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/navy blue/navy-blue-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/navy blue/navy-blue-cotton-mix-basic-cap-lefgt.webp",
                  },
                ],
              },

              {
                label: "Red Cotton Cap",
                hex: "#FF0000",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/red/red-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/red/red-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/red/red-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/red/red-cotton-mix-basic-cap-left.webp",
                  },
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/red/red-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/red/red-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/red/red-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/red/red-cotton-mix-basic-cap-left.webp",
                  },
                ],
              },

              {
                label: "Royal Blue Cotton Cap",
                hex: "#4169E1",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/royal blue/royal-blue-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/royal blue/royal-blue-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/royal blue/royal-blue-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/royal blue/royal-blue-cotton-mix-basic-cap-left.webp",
                  },
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/royal blue/royal-blue-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/royal blue/royal-blue-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/royal blue/royal-blue-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/royal blue/royal-blue-cotton-mix-basic-cap-left.webp",
                  },
                ],
              },

              {
                label: "Sky Blue Cotton Cap",
                hex: "#87CEEB",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/sky blue/sky-blue-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/sky blue/sky-blue-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/sky blue/sky-blue-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/sky blue/sky-blue-cotton-mix-basic-cap-left.webp",
                  },
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/sky blue/sky-blue-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/sky blue/sky-blue-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/sky blue/sky-blue-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/sky blue/sky-blue-cotton-mix-basic-cap-left.webp",
                  },
                ],
              },

              {
                label: "White Cotton Cap",
                hex: "#FFFFFF",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/white/white-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/white/white-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/white/white-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/white/white-cotton-mix-basic-cap-left.webp",
                  },
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/white/white-cotton-mix-basic-cap-front.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/white/white-cotton-mix-basic-cap-back.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/white/white-cotton-mix-basic-cap-right.webp",
                  },
                  {
                    type: "image",
                    src: "/cap-collections/cotton-basic-cap/white/white-cotton-mix-basic-cap-left.webp",
                  },
                ],
              },
            ],
          inStock: true,
          weight: 300,
          customizable: true,
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
          id: "5",
          name: "Basic Polyester Cotton Caps",
          slug: "basic-polyester-cotton-caps",
          styleLabel: "Basic Polyester Caps",
          styleSubtitle: "Mesh Back",
          basePrice: 240,
          displayPrice: 599,
          originalPrice: 999,
          discount: 35.04,
          images: ["/office-bag/blue-office-bag/blue-office-bag-front.png"],
          media: [
            { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-front.webp" },
            { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-left.webp" },
            // { type: "image", src: "/solid-polo-neck-colar/white/left-facing.webp" },
            // { type: "image", src: "/solid-polo-neck-colar/white/right-facing.webp" },
          ],
          printMethod: "DTF, Embroider,Screen Pritng",
          availablepatterns:"Half Sleeves, Drop Shoulder",
          quantityReq: 1,
          priceRange: "budget",
          category: "Oversized T-Shirt",
          description: "High-quality screen printing on sturdy canvas tote bags.",
          features: ["100% Ring-spun Cotton", "Compacted Pre-shrunk", "Bio-wash ", "Double needle stitch on the sleeves and bottom hem","Color fastness Guaranteed","Soft Flow Bleach / Dyed"],
          material: "Cotton, Loop Knitted Fabric, 220 GSM",
          turnaround: "5-7 business days",
          sameDayTurnaround: "By 8 PM today",
          rating: 4.3,
          reviewCount: 128,
          badge: "Best Seller",
          colors: [

            {
          label: "Polyester Mix Red",
          hex: "#FF0000",
          sameDayAvailable: true,
          media: [
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/red/red-pc-mix-basic-cap-front.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/red/red-pc-mix-basic-cap-back.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/red/red-pc-mix-basic-cap-right1.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/red/red-pc-mix-basic-cap-left.webp",
            },
          ],
          blankMedia: [
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/red/red-pc-mix-basic-cap-front.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/red/red-pc-mix-basic-cap-back.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/red/red-pc-mix-basic-cap-right1.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/red/red-pc-mix-basic-cap-left.webp",
            },
          ],
        },

        {
          label: "Polyester Mix Gold Yellow",
          hex: "#FFD700",
          sameDayAvailable: true,
          media: [
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/gold yello/gold-yellow-pc-mix-basic-cap-front.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/gold yello/gold-yellow-pc-mix-basic-cap-back.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/gold yello/gold-yellow-pc-mix-basic-cap-right.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/gold yello/gold-yellow-pc-mix-basic-cap-left.webp",
            },
          ],
          blankMedia: [
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/gold yello/gold-yellow-pc-mix-basic-cap-front.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/gold yello/gold-yellow-pc-mix-basic-cap-back.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/gold yello/gold-yellow-pc-mix-basic-cap-right.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/gold yello/gold-yellow-pc-mix-basic-cap-left.webp",
            },
          ],
        },

        {
          label: "Polyester Mix Black",
          hex: "#000000",
          sameDayAvailable: true,
          media: [
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/black/black-pc-mix-basic-cap-front.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/black/black-pc-mix-basic-cap-back1.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/black/black-pc-mix-basic-cap-right.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/black/black-pc-mix-basic-cap-left.webp",
            },
          ],
          blankMedia: [
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/black/black-pc-mix-basic-cap-front.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/black/black-pc-mix-basic-cap-back1.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/black/black-pc-mix-basic-cap-right.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/black/black-pc-mix-basic-cap-left.webp",
            },
          ],
        },

        {
          label: "Polyester Mix Green",
          hex: "#008000",
          sameDayAvailable: true,
          media: [
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/green/green-pc-mix-basic-cap-front.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/green/green-pc-mix-basic-cap-back.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/green/green-pc-mix-basic-cap-right.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/green/green-pc-mix-basic-cap-left.webp",
            },
          ],
          blankMedia: [
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/green/green-pc-mix-basic-cap-front.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/green/green-pc-mix-basic-cap-back.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/green/green-pc-mix-basic-cap-right.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/green/green-pc-mix-basic-cap-left.webp",
            },
          ],
        },

        {
          label: "Polyester Mix Lemon Yellow",
          hex: "#FFF44F",
          sameDayAvailable: true,
          media: [
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/lemon yellow/lemon-yellow-pc-mix-basic-cap-front.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/lemon yellow/lemon-yellow-pc-mix-basic-cap-back.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/lemon yellow/lemon-yellow-pc-mix-basic-cap-right.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/lemon yellow/lemon-yellow-pc-mix-basic-cap-left.webp",
            },
          ],
          blankMedia: [
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/lemon yellow/lemon-yellow-pc-mix-basic-cap-front.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/lemon yellow/lemon-yellow-pc-mix-basic-cap-back.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/lemon yellow/lemon-yellow-pc-mix-basic-cap-right.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/lemon yellow/lemon-yellow-pc-mix-basic-cap-left.webp",
            },
          ],
        },

        {
          label: "Polyester Mix Navy Blue",
          hex: "#000080",
          sameDayAvailable: true,
          media: [
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/navy blue/navy-blue-pc-mix-basic-cap-front.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/navy blue/navy-blue-pc-mix-basic-cap-back.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/navy blue/navy-blue-pc-mix-basic-cap-right.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/navy blue/navy-blue-pc-mix-basic-cap-left.webp",
            },
          ],
          blankMedia: [
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/navy blue/navy-blue-pc-mix-basic-cap-front.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/navy blue/navy-blue-pc-mix-basic-cap-back.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/navy blue/navy-blue-pc-mix-basic-cap-right.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/navy blue/navy-blue-pc-mix-basic-cap-left.webp",
            },
          ],
        },

        {
          label: "Polyester Mix Orange",
          hex: "#FFA500",
          sameDayAvailable: true,
          media: [
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/orange/orange-pc-mix-basic-cap-front.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/orange/orange-pc-mix-basic-cap-back.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/orange/orange-pc-mix-basic-cap-right.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/orange/orange-pc-mix-basic-cap-left.webp",
            },
          ],
          blankMedia: [
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/orange/orange-pc-mix-basic-cap-front.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/orange/orange-pc-mix-basic-cap-back.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/orange/orange-pc-mix-basic-cap-right.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/orange/orange-pc-mix-basic-cap-left.webp",
            },
          ],
        },

        

        {
          label: "Polyester Mix White",
          hex: "#FFFFFF",
          sameDayAvailable: true,
          media: [
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/white/white-pc-mix-basic-cap-front.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/white/white-pc-mix-basic-cap-back.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/white/white-pc-mix-basic-cap-right.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/white/white-pc-mix-basic-cap-left.webp",
            },
          ],
          blankMedia: [
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/white/white-pc-mix-basic-cap-front.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/white/white-pc-mix-basic-cap-back.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/white/white-pc-mix-basic-cap-right.webp",
            },
            {
              type: "image",
              src: "/cap-collections/pc-mix-basic-cap/white/white-pc-mix-basic-cap-left.webp",
            },
          ],
        },
      ],
    inStock: true,
    weight: 300,
    customizable: true,
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
    id: "6",
    name: "Urban Classic 6 Panel",
    slug: "urban-classic-6-panel-cap",
    styleLabel: "Urban Classic Cap",
    styleSubtitle: "Mesh Back",
    basePrice: 240,
    displayPrice: 599,
    originalPrice: 999,
    discount: 35.04,
    images: ["/office-bag/blue-office-bag/blue-office-bag-front.png"],
    media: [
      // { type: "image", src: "/solid-polo-neck-colar/apple-green/apple-green-solid-polo-tshirt-front.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/apple-green/apple-green-solid-polo-tshirt-back.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/white/left-facing.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/white/right-facing.webp" },
    ],
    printMethod: "DTF, Embroider,Screen Pritng",
    availablepatterns:"Half Sleeves, Drop Shoulder",
    quantityReq: 1,
    priceRange: "budget",
    category: "Oversized T-Shirt",
    description: "High-quality screen printing on sturdy canvas tote bags.",
    features: ["100% Ring-spun Cotton", "Compacted Pre-shrunk", "Bio-wash ", "Double needle stitch on the sleeves and bottom hem","Color fastness Guaranteed","Soft Flow Bleach / Dyed"],
    material: "Cotton, Loop Knitted Fabric, 220 GSM",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    colors: [

    {
  label: "Black Urban Classic",
  hex: "#000000",
  sameDayAvailable: true,
  media: [
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/black/black-urban-classic-front.webp" },
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/black/black-urban-classic-back.webp" },
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/black/black-urban-classic-right.webp" },
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/black/black-urban-classic-left.webp" },
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/black/black-urban-classic-top.webp" },
  ],
  blankMedia: [
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/black/black-urban-classic-front.webp" },
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/black/black-urban-classic-back.webp" },
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/black/black-urban-classic-left.webp" },
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/black/black-urban-classic-right.webp" },
  ],
},

{
  label: "White Urban Classic",
  hex: "#FFFFFF",
  sameDayAvailable: true,
  media: [
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/white/whtie-urban-classic-front.webp" },
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/white/whtie-urban-classic-back.webp" },
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/white/whtie-urban-classic-right.webp" },
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/white/whtie-urban-classic-left.webp" },
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/white/whtie-urban-classic-top.webp" },
  ],
  blankMedia: [
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/white/whtie-urban-classic-front.webp" },
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/white/whtie-urban-classic-back.webp" },
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/white/whtie-urban-classic-left.webp" },
    { type: "image", src: "/cap-collections/urban-classic-6-panel-caps/white/whtie-urban-classic-right.webp" },
  ],
},


     
    ],
    inStock: true,
    weight: 300,
    customizable: true,
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