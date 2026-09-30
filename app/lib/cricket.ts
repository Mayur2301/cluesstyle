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
}
export interface ComboPackOption {
  packSize: number;            // 3, 4, 5...
  packPrice: number;           // flat price for the whole pack
  originalPackPrice?: number;  // for strikethrough / "you save"
  label?: string;              // "Pack of 3" (auto-generated if omitted)
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
  comboPacks?: ComboPackOption[];
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
    name: "Solid Polo T-Shirts",
    slug: "solid-polo-t-shirts",
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
    comboPacks: [
  { packSize: 3, packPrice: 1499, originalPackPrice: 1997, label: "Pack of 3" },
  { packSize: 4, packPrice: 1899, originalPackPrice: 2596, label: "Pack of 4" },
  { packSize: 5, packPrice: 2299, originalPackPrice: 3195, label: "Pack of 5" },
],
    colors: [
      {
        label: "Green",
        hex: "#77ff1d",
        media: [
        { type: "image", src: "/solid-polo-neck-colar/apple-green/apple-green-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/apple-green/apple-green-solid-polo-tshirt-back.webp" },
       
        ],
      },
      {
        label: "Aqua",
        hex: "#66bade",
        media: [
          { type: "image", src: "/solid-polo-neck-colar/aqua/aqua-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/aqua/aqua-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Aqua Marine",
        hex: "#166485",
        media: [
         { type: "image", src: "/solid-polo-neck-colar/aquamarinne/aquamarine-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/aquamarinne/aquamarine-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Beige",
        hex: "#e7d0b1",
        media: [
         { type: "image", src: "/solid-polo-neck-colar/beige/beige-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/beige/beige-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Berry",
        hex: "#e3caac",
        media: [
       { type: "image", src: "/solid-polo-neck-colar/berry/berry-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/berry/berry-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Black",
        hex: "#030303",
        media: [
        { type: "image", src: "/solid-polo-neck-colar/black/blck-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/black/blck-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Black Malange",
        hex: "#31322d",
        media: [
          { type: "image", src: "/solid-polo-neck-colar/black-melange/black-melange-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/black-melange/black-melange-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Chestnut",
        hex: "#8b3d16",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/chestnut/chestnut-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/chestnut/chestnut-solid-polo-tshirt-back.webp" },
        ],
      },

      {
        label: "Cocoa",
        hex: "#673302",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/cocoa/cocoa-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/cocoa/cocoa-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Coral Green",
        hex: "#33a49e",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/coral green/coral-green-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/coral green/coral-green-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Cream",
        hex: "#e2d0a1",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/cream/crean-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/cream/crean-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Dark Denim",
        hex: "#275693",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/dark denim/dark-denim-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/dark denim/dark-denim-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Denim",
        hex: "#3e4b72",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/denim/denim-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/denim/denim-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Electric Blue",
        hex: "#2848c0",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/electric blue/electric-blue-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/electric blue/electric-blue-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Emerald",
        hex: "#237237",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/emerald/emerald-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/emerald/emerald-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Forest Green",
        hex: "#0b571e",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/forest green/forest green-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/forest green/forest green-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Grey",
        hex: "#7e7e7e",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/grey/grey-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/grey/grey-solid-polo-tshirt-bck.webp" },
        ],
      },


       {
        label: "Imperial Blue",
        hex: "#1066bd",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/imperial-blue/imperial-blue-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/imperial-blue/imperial-blue-solid-polo-tshirt-back.webp" },
        ],
      },


       {
        label: "Lemon",
        hex: "#eeee5b",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/lemon/lemon-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/lemon/lemon-solid-polo-tshirt-back.webp" },
        ],
      },


       {
        label: "Light Denim",
        hex: "#5273ab",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/light denim/light-denim-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/light denim/light-denim-solid-polo-tshirt-back.webp" },
        ],
      },


       {
        label: "Lime Green",
        hex: "#eee967",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/lime green/lime-green-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/lime green/lime-green-solid-polo-tshirt-back.webp" },
        ],
      },


       {
        label: "magenta",
        hex: "#e88f7b",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/magenta/magenta-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/magenta/magenta-solid-polo-tshirt-back.webp" },
        ],
      },


       {
        label: "maroon",
        hex: "#8b3a28",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/maroon/maroon-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/maroon/maroon-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Military Green",
        hex: "#457a67",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/military green/military-green-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/military green/military-green-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "mulberry",
        hex: "#5d3155",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/mulberry/mulberry-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/mulberry/mulberry-solid-polo-tshirt-back.webp" },
        ],
      },

       {
        label: "natural",
        hex: "#f6e2dd",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/natural/natural-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/natural/natural-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Orange",
        hex: "#fec403",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/orange/orange-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/orange/orange-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Peach",
        hex: "#e48772",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/peach/peach-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/peach/peach-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Pink",
        hex: "#f525b6",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/pink/pink-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/pink/pink-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Red",
        hex: "#e92b00",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/red/red-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/red/red-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Royal Blue",
        hex: "#2d5ed2",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/royal blue/royal-blue-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/royal blue/royal-blue-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Sky",
        hex: "#7bc7e8",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/sky/sky-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/sky/sky-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Sunflower",
        hex: "#fff700",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/sunflower/sunflower-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/sunflower/sunflower-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "Tangerine",
        hex: "#e88f7b",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/tangerine/tangerine-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/tangerine/tangerine-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "True Navy",
        hex: "#e88f7b",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/true navy/true-navy-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/true navy/true-navy-solid-polo-tshirt-back.webp" },
        ],
      },
       {
        label: "True Blue",
        hex: "#276cbc",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/true blue/true-blue-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/true blue/true-blue-solid-polo-tshirt-front.webp" },
        ],
      },

      {
        label: "Turquoise Blue",
        hex: "#276cbc",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/turquoise blue/turquoise-blue-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/turquoise blue/turquoise-blue-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "White",
        hex: "#ffffff",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/white/white-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/white/white-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "white melange",
        hex: "#f8f9fa",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/white melange/white-melange-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/white melange/white-melange-solid-polo-tshirt-back.webp" },
        ],
      },
      {
        label: "Wine",
        hex: "#276cbc",
        media: [
           { type: "image", src: "/solid-polo-neck-colar/wine/wine-solid-polo-tshirt-front.webp" },
      { type: "image", src: "/solid-polo-neck-colar/wine/wine-solid-polo-tshirt-back.webp" },
        ],
      },


    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    inStock: true,
    weight: 300,
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
    basePrice: 240,
     displayPrice: 599,
    originalPrice: 999,
    discount: 29,
    cardBg:"#f9f9f9",
    images: ["/office-bag/blue-office-bag/blue-office-bag-front.png"],
    media: [
      { type: "image", src: "/solid-polo-neck-colar/red/front-facing.webp" },
      { type: "image", src: "/solid-polo-neck-colar/red/back-facing.webp" },
      { type: "image", src: "/solid-polo-neck-colar/red/left-facing.webp" },
      { type: "image", src: "/solid-polo-neck-colar/red/right-facing.webp" },
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
    colors: [
      {
        label: "Apple Green Collar Tipping Polo",
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
        label: "Lavendar",
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
        label: "Beige",
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
        label: "ICE BLUE",
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
        label: "Carbon Grey",
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
        label: "Black",
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
        label: "Electric Blue Collar Tipping Polo",
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
        label: "Forest Green Collar Tipping Polo",
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
        label: "Light Denim Collar Tipping Polo",
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
        label: "Magenta Collar Tipping Polo",
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
        label: "Maroon Collar Tipping Polo",
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
        label: "Military Collar Tipping Polo",
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
        label: "Military Collar Tipping Polo",
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
        label: "Navy Collar Tipping Polo",
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
        label: "Ocean Blue Collar Tipping Polo",
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
        label: "Red Collar Tipping Polo",
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
        label: "Sky Blue Collar Tipping Polo",
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
        label: "Tangerine Collar Tipping Polo",
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
        label: "Torquoise Blue Collar Tipping Polo",
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
        label: "White Melange Collar Tipping Polo",
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
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
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
    basePrice: 240,
     displayPrice: 599,
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
    category: "Oversized T-Shirt",
    description: "High-quality screen printing on sturdy canvas tote bags.",
    features: ["100% Canvas", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton Canvas, 180 GSM",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    colors: [
      {
        label: "AppleGreen",
        hex: "#008f07",
        media: [
          { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-side.webp" },
          { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-side-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/APPLE GREEN/custom-logo-apple-green-solid-polo-tshirt-side-info.webp" },
        ],
      },

      {
        label: "Aqua",
        hex: "#0cc2bf",
        media: [
          { type: "image", src: "/solid-polo-t-shirt/aqua/custom-logo-aqua-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/aqua/custom-logo-aqua-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/aqua/custom-logo-aqua-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/aqua/custom-logo-aqua-solid-polo-tshirt-side.webp" },
          { type: "image", src: "/solid-polo-t-shirt/aqua/custom-logo-aqua-solid-polo-tshirt-info.webp" },
        ],
      },
      {
        label: "AquaMarine",
        hex: "#015c6a",
        media: [
          { type: "image", src: "/solid-polo-t-shirt/aquamarinne/custom-logo-aquamarine-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/aquamarinne/custom-logo-aquamarine-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/aquamarinne/custom-logo-aquamarine-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/aquamarinne/custom-logo-aquamarine-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/aquamarinne/custom-logo-aquamarine-solid-polo-tshirt-info.webp" },
        ],
      },
            {
        label: "BEIGE",
        hex: "#f0b7ba",
        media: [
          { type: "image", src: "/solid-polo-t-shirt/BEIGE/custom-logo-beige-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/BEIGE/custom-logo-beige-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/BEIGE/custom-logo-beige-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/BEIGE/custom-logo-beige-solid-polo-tshirt-right.webp" },
           { type: "image", src: "/solid-polo-t-shirt/BEIGE/custom-logo-beige-solid-polo-tshirt-info.webp" },
        ],
      },
      {
        label: "Berry",
        hex: "#522a2a",
        media: [
          { type: "image", src: "/solid-polo-t-shirt/berry/custom-logo-berry-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/berry/custom-logo-berry-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/berry/custom-logo-berry-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/berry/custom-logo-berry-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/berry/custom-logo-berry-solid-polo-tshirt-info.webp" },
        ],
      },
      {
        label: "Solid Black",
        hex: "#000000",
        media: [
          { type: "image", src: "/solid-polo-t-shirt/black/custom-logo-black-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black/custom-logo-black-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black/custom-logo-black-solid-polo-tshirt-side.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black/custom-logo-black-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black/custom-logo-black-solid-polo-tshirt-info.webp" },
        ],
      },
      {
        label: "Black Melange",
        hex: "#31322d",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/black melange/custom-logo-black-melange-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black melange/custom-logo-black-melange-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black melange/custom-logo-black-melange-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black melange/custom-logo-black-melange-solid-polo-tshirt-side.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black melange/custom-logo-black-melange-solid-polo-tshirt-info.webp" },
          
        ],
      },
      {
        label: "Black Melange Solid",
        hex: "#000000",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/black melange/custom-logo-black-melange-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black melange/custom-logo-black-melange-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black melange/custom-logo-black-melange-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black melange/custom-logo-black-melange-solid-polo-tshirt-side.webp" },
          { type: "image", src: "/solid-polo-t-shirt/black melange/custom-logo-black-melange-solid-polo-tshirt-info.webp" },
        ],
      },


      {
        label: "Bottle Green",
        hex: "#0d3b2c",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/bottle green/custom-logo-bottle-green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/bottle green/custom-logo-bottle-green-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/bottle green/custom-logo-bottle-green-solid-polo-tshirt-side2.webp" },
          { type: "image", src: "/solid-polo-t-shirt/bottle green/custom-logo-bottle-green-solid-polo-tshirt-info.webp" },
          
        ],
      },

      {
        label: "Chestnut",
        hex: "#e4dbdb",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/chestnut/custom-logo-chestnut-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/chestnut/custom-logo-chestnut-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/chestnut/custom-logo-chestnut-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/chestnut/custom-logo-chestnut-solid-polo-tshirt-right.webp" },
           { type: "image", src: "/solid-polo-t-shirt/chestnut/custom-logo-chestnut-solid-polo-tshirt-info.webp" },
          
        ],
      },

       {
        label: "Cocoa",
        hex: "#e4dbdb",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/cocoa/custom-logo-cocoa-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/cocoa/custom-logo-cocoa-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/cocoa/custom-logo-cocoa-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/cocoa/custom-logo-cocoa-solid-polo-tshirt-right.webp" },
           { type: "image", src: "/solid-polo-t-shirt/cocoa/custom-logo-cocoa-solid-polo-tshirt-info.webp" },
          
        ],
      },


       {
        label: "Coral Green",
        hex: "#e4dbdb",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/coral green/custom-logo-coral-green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/coral green/custom-logo-coral-green-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/coral green/custom-logo-coral-green-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/coral green/custom-logo-coral-green-solid-polo-tshirt-right.webp" },
           { type: "image", src: "/solid-polo-t-shirt/coral green/custom-logo-coral-green-solid-polo-tshirt-info.webp" },
          
        ],
      },


      {
        label: "Cream",
        hex: "#e4dbdb",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/cream/custom-logo-crean-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/cream/custom-logo-crean-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/cream/custom-logo-crean-solid-polo-tshirt-front-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/cream/custom-logo-crean-solid-polo-tshirt-front-right.webp" },
           { type: "image", src: "/solid-polo-t-shirt/cream/custom-logo-crean-solid-polo-tshirt-front-info.webp" },
          
        ],
      },

    {
        label: "dark denim",
        hex: "#e4dbda",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/dark denim/custom-logo-dark-denim-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/dark denim/custom-logo-dark-denim-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/dark denim/custom-logo-dark-denim-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/dark denim/custom-logo-dark-denim-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/dark denim/custom-logo-dark-denim-solid-polo-tshirt-info.webp" },
          
        ],
      },

      {
        label: "Solid denim",
        hex: "#e4dbda",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/denim/custom-logo-denim-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/denim/custom-logo-denim-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/denim/custom-logo-denim-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/denim/custom-logo-denim-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/denim/custom-logo-denim-solid-polo-tshirt-info.webp" },
          
        ],
      },

       {
        label: "Electric Blue",
        hex: "#e4dbda",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/electric blue/custom-logo-electric-blue-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/electric blue/custom-logo-electric-blue-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/electric blue/custom-logo-electric-blue-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/electric blue/custom-logo-electric-blue-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/electric blue/custom-logo-electric-blue-solid-polo-tshirt-info.webp" },
          
        ],
      },

      {
        label: "Electric Blue",
        hex: "#e4dbda",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/electric blue/custom-logo-electric-blue-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/electric blue/custom-logo-electric-blue-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/electric blue/custom-logo-electric-blue-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/electric blue/custom-logo-electric-blue-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/electric blue/custom-logo-electric-blue-solid-polo-tshirt-info.webp" },
          
        ],
      },
    {
        label: "Emerald",
        hex: "#054529",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/emerald/custom-logo-emerald-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/emerald/custom-logo-emerald-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/emerald/custom-logo-emerald-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/emerald/custom-logo-emerald-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/emerald/custom-logo-emerald-solid-polo-tshirt-info.webp" },
          
        ],
      },

      {
        label: "Forest Green",
        hex: "#054529",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/forest green/custom-logo-forest green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/forest green/custom-logo-forest green-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/forest green/custom-logo-forest green-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/forest green/custom-logo-forest green-solid-polo-tshirt-right.webp" },
           { type: "image", src: "/solid-polo-t-shirt/forest green/custom-logo-forest green-solid-polo-tshirt-info.webp" },
          
        ],
      },


      {
        label: "Grey Solid",
        hex: "#054529",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/grey/custom-logo-grey-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/grey/custom-logo-grey-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/grey/custom-logo-grey-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/grey/custom-logo-grey-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/grey/custom-logo-grey-solid-polo-tshirt-info.webp" },
          
        ],
      },


      {
        label: "Grey Melange",
        hex: "#a7aaa9",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/grey melange/custom-logo-grey-melange-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/grey melange/custom-logo-grey-melange-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/grey melange/custom-logo-grey-melange-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/grey melange/custom-logo-grey-melange-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/grey melange/custom-logo-grey-melange-solid-polo-tshirt-info.webp" },
          
        ],
      },

 
      {
        label: "Lemon Solid Polo T-shirt",
        hex: "#f2f250",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/lemon/custom-logo-lemon-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/lemon/custom-logo-lemon-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/lemon/custom-logo-lemon-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/lemon/custom-logo-lemon-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/lemon/custom-logo-lemon-solid-polo-tshirt-info.webp" },
          
        ],
      },

      {
        label: "Light Denim Polo T-shirt",
        hex: "#559e9b",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/light denim/custom-logo-light-denim-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/light denim/custom-logo-light-denim-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/light denim/custom-logo-light-denim-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/light denim/custom-logo-light-denim-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/light denim/custom-logo-light-denim-solid-polo-tshirt-info.webp" },
          
        ],
      },

      {
        label: "Lime Green Polo T-shirt",
        hex: "#559e9b",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/lime green/custom-logo-lime-green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/lime green/custom-logo-lime-green-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/lime green/custom-logo-lime-green-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/lime green/custom-logo-lime-green-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/lime green/custom-logo-lime-green-solid-polo-tshirt-info.webp" },
          
        ],
      },

      {
        label: "Magenta Polo T-shirt",
        hex: "#559e9b",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/magenta/custom-logo-magenta-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/magenta/custom-logo-magenta-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/magenta/custom-logo-magenta-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/magenta/custom-logo-magenta-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/magenta/custom-logo-magenta-solid-polo-tshirt-info.webp" },
          
        ],
      },


      {
        label: "Maroon Polo T-shirt",
        hex: "#5f592e",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/maroon/custom-logo-maroon-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/maroon/custom-logo-maroon-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/maroon/custom-logo-maroon-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/maroon/custom-logo-maroon-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/maroon/custom-logo-maroon-solid-polo-tshirt-info.webp" },
          
        ],
      },

    {
        label: "Military Green Polo T-shirt",
        hex: "#0a6051",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/military green/custom-logo-military-green-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/military green/custom-logo-military-green-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/military green/custom-logo-military-green-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/military green/custom-logo-military-green-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/military green/custom-logo-military-green-solid-polo-tshirt-info.webp" },
          
        ],
      },
    {
        label: "Mulberry Polo T-shirt",
        hex: "#0a6051",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/mulberry/custom-logo-mulberry-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/mulberry/custom-logo-mulberry-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/mulberry/custom-logo-mulberry-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/mulberry/custom-logo-mulberry-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/mulberry/custom-logo-mulberry-solid-polo-tshirt-info.webp" },
          
        ],
      },

      {
        label: "Natural Polo T-shirt",
        hex: "#eeeeee",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/natural/custom-logo-natural-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/natural/custom-logo-natural-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/natural/custom-logo-natural-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/natural/custom-logo-natural-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/natural/custom-logo-natural-solid-polo-tshirt-info.webp" },
          
        ],
      },

       {
        label: "Orange Polo T-shirt",
        hex: "#eeeeee",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/orange/custom-logo-orange-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/orange/custom-logo-orange-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/orange/custom-logo-orange-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/orange/custom-logo-orange-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/orange/custom-logo-orange-solid-polo-tshirt-info.webp" },
          
        ],
      },

       {
        label: "Peach Polo T-shirt",
        hex: "#eeeeee",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/peach/custom-logo-peach-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/peach/custom-logo-peach-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/peach/custom-logo-peach-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/peach/custom-logo-peach-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/peach/custom-logo-peach-solid-polo-tshirt-info.webp" },
          
        ],
      },


      {
        label: "Peach Polo T-shirt",
        hex: "#eeeeee",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/peach/custom-logo-peach-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/peach/custom-logo-peach-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/peach/custom-logo-peach-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/peach/custom-logo-peach-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/peach/custom-logo-peach-solid-polo-tshirt-info.webp" },
          
        ],
      },

      {
        label: "Pink Polo T-shirt",
        hex: "#e4a9a9",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/pink/custom-logo-pink-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/pink/custom-logo-pink-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/pink/custom-logo-pink-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/pink/custom-logo-pink-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/pink/custom-logo-pink-solid-polo-tshirt-info.webp" },
          
        ],
      },


      {
        label: "Red Polo T-shirt",
        hex: "#e40202",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/red/custom-logo-red-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/red/custom-logo-red-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/red/custom-logo-red-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/red/custom-logo-red-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/red/custom-logo-red-solid-polo-tshirt-info.webp" },
          
        ],
      },


      {
        label: "Royal Blue Polo T-shirt",
        hex: "#0062ff",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/royal blue/custom-logo-royal-blue-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/royal blue/custom-logo-royal-blue-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/royal blue/custom-logo-royal-blue-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/royal blue/custom-logo-royal-blue-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/royal blue/custom-logo-royal-blue-solid-polo-tshirt-info.webp" },
          
        ],
      },


        {
        label: "Sky Polo T-shirt",
        hex: "#417ee0",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/sky/custom-logo-sky-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/sky/custom-logo-sky-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/sky/custom-logo-sky-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/sky/custom-logo-sky-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/sky/custom-logo-sky-solid-polo-tshirt-info.webp" },
          
        ],
      },

       {
        label: "Sunflower Polo T-shirt",
        hex: "#c1ff16",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/sunflower/custom-logo-sunflower-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/sunflower/custom-logo-sunflower-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/sunflower/custom-logo-sunflower-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/sunflower/custom-logo-sunflower-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/sunflower/custom-logo-sunflower-solid-polo-tshirt-info.webp" },
          
        ],
      },


      
       {
        label: "Tangerine Polo T-shirt",
        hex: "#fa8100",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/tangerine/custom-logo-tangerine-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/tangerine/custom-logo-tangerine-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/tangerine/custom-logo-tangerine-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/tangerine/custom-logo-tangerine-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/tangerine/custom-logo-tangerine-solid-polo-tshirt-info.webp" },
          
        ],
      },


         {
        label: "True Blue Polo T-shirt",
        hex: "#0f3ea3",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/true blue/custom-logo-true-blue-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/true blue/custom-logo-true-blue-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/true blue/custom-logo-true-blue-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/true blue/custom-logo-true-blue-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/true blue/custom-logo-true-blue-solid-polo-tshirt-info.webp" },
          
        ],
      },

        {
        label: "True Navy Polo T-shirt",
        hex: "#486ebe",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/true navy/custom-logo-true-navy-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/true navy/custom-logo-true-navy-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/true navy/custom-logo-true-navy-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/true navy/custom-logo-true-navy-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/true navy/custom-logo-true-navy-solid-polo-tshirt-info.webp" },
          
        ],
      },


       {
        label: "Turquoise Blue Solid Polo T-shirt",
        hex: "#486ebe",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/turquoise blue/custom-logo-turquoise-blue-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/turquoise blue/custom-logo-turquoise-blue-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/turquoise blue/custom-logo-turquoise-blue-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/turquoise blue/custom-logo-turquoise-blue-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/turquoise blue/custom-logo-turquoise-blue-solid-polo-tshirt-info.webp" },
          
        ],
      },


        {
        label: "White Solid Polo T-shirt",
        hex: "#ffffff",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/white/custom-logo-white-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/white/custom-logo-white-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/white/custom-logo-white-solid-polo-tshirt-left.webp" },
          { type: "image", src: "/solid-polo-t-shirt/white/custom-logo-white-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/white/custom-logo-white-solid-polo-tshirt-info.webp" },
          
        ],
      },

       {
        label: "White Melange Solid Polo T-shirt",
        hex: "#ffffff",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/white melange/custom-logo-white-melange-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/white melange/custom-logo-white-melange-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/white melange/custom-logo-white-melange-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/white melange/custom-logo-white-melange-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/white melange/custom-logo-white-melange-solid-polo-tshirt-info.webp" },
          
        ],
      },


      {
        label: "White Melange Solid Polo T-shirt",
        hex: "#ffffff",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/white melange/custom-logo-white-melange-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/white melange/custom-logo-white-melange-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/white melange/custom-logo-white-melange-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/white melange/custom-logo-white-melange-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/white melange/custom-logo-white-melange-solid-polo-tshirt-info.webp" },
          
        ],
      },

    {
        label: "Wine Solid Polo T-shirt",
        hex: "#383737",
        media: [
         { type: "image", src: "/solid-polo-t-shirt/wine/custom-logo-wine-solid-polo-tshirt-front.webp" },
          { type: "image", src: "/solid-polo-t-shirt/wine/custom-logo-wine-solid-polo-tshirt-back.webp" },
          { type: "image", src: "/solid-polo-t-shirt/wine/custom-logo-wine-solid-polo-tshirt-right.webp" },
          { type: "image", src: "/solid-polo-t-shirt/wine/custom-logo-wine-solid-polo-tshirt-side.webp" },
           { type: "image", src: "/solid-polo-t-shirt/wine/custom-logo-wine-solid-polo-tshirt-info.webp" },
          
        ],
      },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
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
    basePrice: 240,
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
    category: "Oversized T-Shirt",
    description: "High-quality screen printing on sturdy canvas tote bags.",
    features: ["100% Canvas", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton Canvas, 180 GSM",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    colors: [
      {
        label: "Black with White Tipping Polo",
        hex: "#010101",
        media: [
        { type: "image", src: "/custom-tipping-polo/black with white/custom-tipping-poloblack with whitecustom-tipping-poloblack with white.webp" },
      { type: "image", src: "/custom-tipping-polo/black with white/custom-logo-black-white-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/black with white/custom-logo-black-white-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/black with white/custom-logo-black-white-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/black with white/custom-logo-black-white-tipping-white-collar-tshirt-info.webp" },
        ],
      },

      {
        label: "Apple Green Tipping Polo",
        hex: "#20ff0c",
        media: [
           { type: "image", src: "/custom-tipping-polo/apple-green/custom-logoapple-green-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/apple-green/custom-logo-apple-green-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/apple-green/custom-logoapple-green-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/apple-green/custom-logoapple-green-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/apple-green/custom-logoapple-green-tipping-white-collar-tshirt-info.webp" },
        ],
      },
      {
        label: "Beige with black tipping polo",
        hex: "#e8acac",
        media: [
           { type: "image", src: "/custom-tipping-polo/beige with black/custom-logobeige-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/beige with black/custom-logobeige-tipping-black-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/beige with black/custom-logobeige-tipping-black-collar-tshirt-left-side.webp" },
      { type: "image", src: "/custom-tipping-polo/beige with black/custom-logobeige-tipping-black-collar-tshirt-right-side.webp" },
      { type: "image", src: "/custom-tipping-polo/beige with black/custom-logobeige-tipping-black-collar-tshirt-info.webp" },
        ],
      },
      {
        label: "Black Melange with White Tipping Polo",
        hex: "#000000",
        media: [
             { type: "image", src: "/custom-tipping-polo/black melange with white/custom-logoblack-melange-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/black melange with white/custom-logoblack-melange-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/black melange with white/custom-logo-black-melange-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/black melange with white/custom-logo-black-melange-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/black melange with white/custom-logo-black-melange-tipping-white-collar-tshirt-info.webp" },
        ],
      },
            {
        label: "Black with Red Tipping Polo",
        hex: "#1b1814",
        media: [
       { type: "image", src: "/custom-tipping-polo/black with red/custom-logo-black-tipping-red-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/black with red/custom-logo-black-tipping-red-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/black with red/custom-logo-black-tipping-red-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/black with red/custom-logo-black-tipping-red-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/black with red/custom-logo-black-tipping-red-collar-tshirt-info.webp" },
        ],
      },
      {
        label: "Black with Royal Blue Tipping Polo",
        hex: "#222527",
        media: [
          { type: "image", src: "/custom-tipping-polo/black with royal blue/custom-logo-black-tipping-royal-blue-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/black with royal blue/custom-logo-black-tipping-royal-blue-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/black with royal blue/custom-logo-black-tipping-royal-blue-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/black with royal blue/custom-logo-black-tipping-royal-blue-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/black with royal blue/custom-logo-black-tipping-royal-blue-collar-tshirt-info.webp" },
        ],
      },
      {
        label: "Cream with Black Tippig Polo",
        hex: "#fbffe9",
        media: [
          { type: "image", src: "/custom-tipping-polo/cream with black/custom-logo-cream-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/cream with black/custom-logo-cream-tipping-black-collar-tshirt-black.webp" },
      { type: "image", src: "/custom-tipping-polo/cream with black/custom-logo-cream-tipping-black-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/cream with black/custom-logo-cream-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/cream with black/custom-logo-cream-tipping-black-collar-tshirt-info.webp" },
        ],
      },
      {
        label: "Dark Denim with White Tipping Polo",
        hex: "#549dba",
        media: [
           { type: "image", src: "/custom-tipping-polo/dark denim with white/custom-logo-dark-denim-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/dark denim with white/custom-logo-dark-denim-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/dark denim with white/custom-logo-dark-denim-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/dark denim with white/custom-logo-dark-denim-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/dark denim with white/custom-logo-dark-denim-tipping-white-collar-tshirt-info.webp" },
        ],
      },

      {
        label: "Denim with White Tipping Polo",
        hex: "#467486",
        media: [
           { type: "image", src: "/custom-tipping-polo/denim with white/custom-logo-denim-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/denim with white/custom-logo-denim-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/denim with white/custom-logo-denim-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/denim with white/custom-logo-denim-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/denim with white/custom-logo-denim-tipping-white-collar-tshirt-info.webp" },
        ],
      },


      {
        label: "Electric Blue with White Tipping Polo",
        hex: "#312b6c",
        media: [
           { type: "image", src: "/custom-tipping-polo/electric blue with white/custom-logo-electric-blue-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/electric blue with white/custom-logo-electric-blue-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/electric blue with white/custom-logo-electric-blue-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/electric blue with white/custom-logo-electric-blue-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/electric blue with white/custom-logo-electric-blue-tipping-white-collar-tshirt-info.webp" },
        ],
      },


       {
        label: "Forest Green with White Tipping Polo",
        hex: "#3cc74a",
        media: [
           { type: "image", src: "/custom-tipping-polo/forest green with white/custom-logo-forest-green-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/forest green with white/custom-logo-forest-green-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/forest green with white/custom-logo-forest-green-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/forest green with white/custom-logo-forest-green-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/forest green with white/custom-logo-forest-green-tipping-white-collar-tshirt-info.webp" },
        ],
      },


       {
        label: "Grey with Black Tipping Polo",
        hex: "#676666",
        media: [
           { type: "image", src: "/custom-tipping-polo/grey with black/custom-logo-grey-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/grey with black/custom-logo-grey-tipping-black-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/grey with black/custom-logo-grey-tipping-black-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/grey with black/custom-logo-grey-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/grey with black/custom-logo-grey-tipping-black-collar-tshirt-info.webp" },
        ],
      },
      {
        label: "Light Denim with White Tipping Polo",
        hex: "#55aeb0",
        media: [
           { type: "image", src: "/custom-tipping-polo/light denim with white/custom-logo-light-denim-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/light denim with white/custom-logo-light-denim-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/light denim with white/custom-logo-light-denim-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/light denim with white/custom-logo-light-denim-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/light denim with white/custom-logo-light-denim-tipping-white-collar-tshirt-info.webp" },
        ],
      },

      {
        label: "Magenta with White Tipping Polo",
        hex: "#a300c4",
        media: [
           { type: "image", src: "/custom-tipping-polo/magenta with white/custom-logo-magenta-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/magenta with white/custom-logo-magenta-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/magenta with white/custom-logo-magenta-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/magenta with white/custom-logo-magenta-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/magenta with white/custom-logo-magenta-tipping-white-collar-tshirt-inf.webp" },
        ],
      },

      {
        label: "Maroon with White Tipping Polo",
        hex: "#6d3616",
        media: [
           { type: "image", src: "/custom-tipping-polo/maroon with white/custom-logo-maroon-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/maroon with white/custom-logo-maroon-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/maroon with white/custom-logo-maroon-tipping-white-collar-tshirt-lefT.webp" },
      { type: "image", src: "/custom-tipping-polo/maroon with white/custom-logo-maroon-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/maroon with white/custom-logo-maroon-tipping-white-collar-tshirt-info.webp" },
        ],
      },

      {
        label: "Military Green Tipping Polo",
        hex: "#2dcc47",
        media: [
           { type: "image", src: "/custom-tipping-polo/militry green/custom-logo-militery-green-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/militry green/custom-logo-militery-green-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/militry green/custom-logo-militery-green-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/militry green/custom-logo-militery-green-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/militry green/custom-logo-militery-green-tipping-white-collar-tshirt-info.webp" },
        ],
      },


      {
        label: "Navy Blue with White Tipping Polo",
        hex: "#2572b9",
        media: [
           { type: "image", src: "/custom-tipping-polo/navy blue with white/custom-logo-navy-blue-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/navy blue with white/custom-logo-navy-blue-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/navy blue with white/custom-logo-navy-blue-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/navy blue with white/custom-logo-navy-blue-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/navy blue with white/custom-logo-navy-blue-tipping-white-collar-tshirt-info.webp" },
        ],
      },


       {
        label: "Ocean Blue with Black Tipping Polo",
        hex: "#6da4d8",
        media: [
           { type: "image", src: "/custom-tipping-polo/ocean blue with black/custom-logo-ocean-blue-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/ocean blue with black/custom-logo-ocean-blue-tipping-black-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/ocean blue with black/custom-logo-ocean-blue-tipping-black-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/ocean blue with black/custom-logo-ocean-blue-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/ocean blue with black/custom-logo-ocean-blue-tipping-black-collar-tshirt-info.webp" },
        ],
      },


      {
        label: "Red with Black Tipping Polo",
        hex: "#df2500",
        media: [
           { type: "image", src: "/custom-tipping-polo/red with black/custom-logo-red-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/red with black/custom-logo-red-tipping-black-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/red with black/custom-logo-red-tipping-black-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/red with black/custom-logo-vred-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/red with black/custom-logo-red-tipping-black-collar-tshirt-info.webp" },
        ],
      },


       {
        label: "Red with White Tipping Polo",
        hex: "#a71c00",
        media: [
           { type: "image", src: "/custom-tipping-polo/red with white/custom-logo-red-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/red with white/custom-logo-red-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/red with white/custom-logo-red-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/red with white/custom-logo-red-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/red with white/custom-logo-red-tipping-white-collar-tshirt-info.webp" },
        ],
      },


      
       {
        label: "Royal Blue with White Tipping Polo",
        hex: "#0a40e2",
        media: [
           { type: "image", src: "/custom-tipping-polo/royal blue with white/custom-logo-royal-blue-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/royal blue with white/custom-logo-royal-blue-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/royal blue with white/custom-logo-royal-blue-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/royal blue with white/custom-logo-royal-blue-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/royal blue with white/custom-logo-royal-blue-tipping-white-collar-tshirt-info.webp" },
        ],
      },


      {
        label: "Sky Blue with Black Tipping Polo",
        hex: "#486dda",
        media: [
           { type: "image", src: "/custom-tipping-polo/sky blue with black/custom-logo-sky-blue-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/sky blue with black/custom-logo-sky-blue-tipping-black-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/sky blue with black/custom-logo-sky-blue-tipping-black-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/sky blue with black/custom-logo-sky-blue-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/sky blue with black/custom-logo-sky-blue-tipping-black-collar-tshirt-info.webp" },
        ],
      },


       {
        label: "Tangerine with White Tipping Polo",
        hex: "#f39602",
        media: [
           { type: "image", src: "/custom-tipping-polo/tangerine wth white/custom-logo-tangerine-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/tangerine wth white/custom-logo-tangerine-tipping-white-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/tangerine wth white/custom-logo-tangerine-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/tangerine wth white/custom-logo-tangerine-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/tangerine wth white/custom-logo-tangerine-tipping-white-collar-tshirt-info.webp" },
        ],
      },


        {
        label: "Turquoise Blue with White Tipping Polo",
        hex: "#75e5ce",
        media: [
           { type: "image", src: "/custom-tipping-polo/turquoise blue with white/custom-logo-turquoise-blue-tipping-white-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/turquoise blue with white/custom-logo-turquoise-blue-tipping-white-collar-tshirt-black.webp" },
      { type: "image", src: "/custom-tipping-polo/turquoise blue with white/custom-logo-turquoise-blue-tipping-white-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/turquoise blue with white/custom-logo-turquoise-blue-tipping-white-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/turquoise blue with white/custom-logo-turquoise-blue-tipping-white-collar-tshirt-info.webp" },
        ],
      },


       {
        label: "White Melange with Black Tipping Polo",
        hex: "#fdffff",
        media: [
           { type: "image", src: "/custom-tipping-polo/white melange with black/custom-logo-white-melange-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/white melange with black/custom-logo-white-melange-tipping-black-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/white melange with black/custom-logo-white-melange-tipping-black-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/white melange with black/custom-logo-white-melange-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/white melange with black/custom-logo-white-melange-tipping-black-collar-tshirt-info.webp" },
        ],
      },


       {
        label: "White with Black Tipping Polo",
        hex: "#ffffff",
        media: [
           { type: "image", src: "/custom-tipping-polo/white with black/custom-logo-white-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/white with black/custom-logo-white-tipping-black-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/white with black/custom-logo-white-tipping-black-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/white with black/custom-logo-white-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/white with black/custom-logo-white-tipping-black-collar-tshirt-info.webp" },
        ],
      },

       {
        label: "White with Blue Tipping Polo",
        hex: "#ffffff",
        media: [
           { type: "image", src: "/custom-tipping-polo/white with blue/custom-logo-white-tipping-royal-blue-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/white with blue/custom-logo-white-tipping-royal-blue-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/white with blue/custom-logo-white-tipping-royal-blue-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/white with blue/custom-logo-white-tipping-royal-blue-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/white with blue/custom-logo-white-tipping-royal-blue-collar-tshirt-info.webp" },
        ],
      },


       {
        label: "White with Red Tipping Polo",
        hex: "#ffffff",
        media: [
           { type: "image", src: "/custom-tipping-polo/white with red/custom-logo-white-tipping-red-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/white with red/custom-logo-white-tipping-red-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/white with red/custom-logo-white-tipping-red-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/white with red/custom-logo-white-tipping-red-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/white with red/custom-logo-white-tipping-red-collar-tshirt-info.webp" },
        ],
      },


       {
        label: "White with Red Tipping Polo",
        hex: "#ffffff",
        media: [
           { type: "image", src: "/custom-tipping-polo/yellow with black/custom-logo-yellow-tipping-black-collar-tshirt-front.webp" },
      { type: "image", src: "/custom-tipping-polo/yellow with black/custom-logo-yellow-tipping-black-collar-tshirt-back.webp" },
      { type: "image", src: "/custom-tipping-polo/yellow with black/custom-logo-yellow-tipping-black-collar-tshirt-left.webp" },
      { type: "image", src: "/custom-tipping-polo/yellow with black/custom-logo-yellow-tipping-black-collar-tshirt-right.webp" },
      { type: "image", src: "/custom-tipping-polo/yellow with black/custom-logo-yellow-tipping-black-collar-tshirt-info.webp" },
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