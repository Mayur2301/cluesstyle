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
    name: "Solid Round Neck Collar",
    slug: "solid-round-neck-t-shirt",
    basePrice: 240,
    displayPrice: 599,
    originalPrice: 999,
    discount: 35.04,
    images: ["/office-bag/blue-office-bag/blue-office-bag-front.png"],
    media: [
      { type: "image", src: "/solid-round-neck/black/black-round-neck-tshirt-front.webp" },
      { type: "image", src: "/solid-round-neck/black/black-round-neck-tshirt-back.webp" },
      { type: "image", src: "/solid-round-neck/black/black-round-neck-tshirt-left.webp" },
      { type: "image", src: "/solid-round-neck/black/black-round-neck-tshirt-right.webp" },
      { type: "image", src: "/solid-round-neck/black/black-round-neck-tshirt-info.webp" },
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
        label: "Black",
        hex: "#000000",
        media: [
         { type: "image", src: "/solid-round-neck/black/black-round-neck-tshirt-front.webp" },
      { type: "image", src: "/solid-round-neck/black/black-round-neck-tshirt-back.webp" },
       { type: "image", src: "/solid-round-neck/black/black-round-neck-tshirt-left.webp" },
        { type: "image", src: "/solid-round-neck/black/black-round-neck-tshirt-right.webp" },
         { type: "image", src: "/solid-round-neck/black/black-round-neck-tshirt-info.webp" },
       
        ],
      },
      {
        label: "Grey",
        hex: "#a6abad",
        media: [
        { type: "image", src: "/solid-round-neck/grey/grey-round-neck-tshirt-front.webp" },
      { type: "image", src: "/solid-round-neck/grey/grey-round-neck-tshirt-back.webp" },
       { type: "image", src: "/solid-round-neck/grey/grey-round-neck-tshirt-left.webp" },
        { type: "image", src: "/solid-round-neck/grey/grey-round-neck-tshirt-right.webp" },
         { type: "image", src: "/solid-round-neck/grey/grey-round-neck-tshirt-info.webp" },
        ],
      },
      {
        label: "Navy Blue",
        hex: "#166485",
        media: [
      { type: "image", src: "/solid-round-neck/navy blue/navy-blue-round-neck-tshirt-front.webp" },
      { type: "image", src: "/solid-round-neck/navy blue/navy-blue-round-neck-tshirt-back.webp" },
       { type: "image", src: "/solid-round-neck/navy blue/navy-blue-round-neck-tshirt-left.webp" },
        { type: "image", src: "/solid-round-neck/navy blue/navy-blue-round-neck-tshirt-right.webp" },
         { type: "image", src: "/solid-round-neck/navy blue/navy-blue-round-neck-tshirt-info.webp" },
        ],
      },
      {
        label: "Red Round Neck",
        hex: "#e7d0b1",
        media: [
        { type: "image", src: "/solid-round-neck/red/red-round-neck-tshirt-front.webp" },
      { type: "image", src: "/solid-round-neck/red/red-round-neck-tshirt-back.webp" },
       { type: "image", src: "/solid-round-neck/red/red-round-neck-tshirt-left.webp" },
        { type: "image", src: "/solid-round-neck/red/red-round-neck-tshirt-right.webp" },
         { type: "image", src: "/solid-round-neck/red/red-round-neck-tshirt-info.webp" },
        ],
      },
     

      {
        label: "Miletry Green",
        hex: "#e7d0b1",
        media: [
        { type: "image", src: "/solid-round-neck/miletry green/military-green-round-neck-tshirt-front.webp" },
      { type: "image", src: "/solid-round-neck/miletry green/military-green-round-neck-tshirt-back.webp" },
       { type: "image", src: "/solid-round-neck/miletry green/military-green-round-neck-tshirt-left.webp" },
        { type: "image", src: "/solid-round-neck/miletry green/military-green-round-neck-tshirt-right.webp" },
         { type: "image", src: "/solid-round-neck/miletry green/military-green-round-neck-tshirt-info.webp" },
        ],
      },


       {
        label: "Royal Blue",
        hex: "#e7d0b1",
        media: [
        { type: "image", src: "/solid-round-neck/royal blue/royal-blue-round-neck-tshirt-front.webp" },
      { type: "image", src: "/solid-round-neck/royal blue/royal-blue-round-neck-tshirt-back.webp" },
       { type: "image", src: "/solid-round-neck/royal blue/royal-blue-round-neck-tshirt-left.webp" },
        { type: "image", src: "/solid-round-neck/royal blue/royal-blue-round-neck-tshirt-right.webp" },
         { type: "image", src: "/solid-round-neck/royal blue/royal-blue-round-neck-tshirt-info.webp" },
        ],
      },


       {
        label: "White",
        hex: "#e7d0b1",
        media: [
        { type: "image", src: "/solid-round-neck/white/white-round-neck-tshirt-front.webp" },
        { type: "image", src: "/solid-round-neck/white/white-round-neck-tshirt-back.webp" },
        { type: "image", src: "/solid-round-neck/white/white-round-neck-tshirt-left.webp" },
        { type: "image", src: "/solid-round-neck/white/white-round-neck-tshirt-right.webp" },
        { type: "image", src: "/solid-round-neck/white/white-round-neck-tshirt-info.webp" },
        ],
      },

    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL","3XL","4XL","5XL"],
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
    name: "Customized Round Neck",
    slug: "customized-round-neck",
    basePrice: 240,
     displayPrice: 599,
    originalPrice: 999,
    discount: 29,
    cardBg:"#f9f9f9",
    images: ["/office-bag/blue-office-bag/blue-office-bag-front.png"],
    media: [
      // { type: "image", src: "/solid-polo-neck-colar/red/front-facing.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/red/back-facing.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/red/left-facing.webp" },
      // { type: "image", src: "/solid-polo-neck-colar/red/right-facing.webp" },
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
        label: "Black Customized Round Neck",
        hex: "#000000",
        media: [
          { type: "image", src: "/round-neck-customized/black/black-round-neck-tshirt-front.webp" },
          { type: "image", src: "/round-neck-customized/black/black-round-neck-tshirt-back.webp" },
          { type: "image", src: "/round-neck-customized/black/black-round-neck-tshirt-left.webp" },
          { type: "image", src: "/round-neck-customized/black/black-round-neck-tshirt-right.webp" },
           { type: "image", src: "/round-neck-customized/black/black-round-neck-tshirt-info.webp" },
        ],
      },

      {
        label: "Grey Customizable T-shirt",
        hex: "#a39b9b",
        media: [
         { type: "image", src: "/round-neck-customized/grey/grey-round-neck-tshirt-front.webp" },
          { type: "image", src: "/round-neck-customized/grey/grey-round-neck-tshirt-back.webp" },
          { type: "image", src: "/round-neck-customized/grey/grey-round-neck-tshirt-left.webp" },
          { type: "image", src: "/round-neck-customized/grey/grey-round-neck-tshirt-right.webp" },
           { type: "image", src: "/round-neck-customized/grey/grey-round-neck-tshirt-info.webp" },
        ],
      },
            {
        label: "Green Miletary Round Neck",
        hex: "#002f07",
        media: [
          { type: "image", src: "/round-neck-customized/miletry green/military-green-round-neck-tshirt-front.webp" },
          { type: "image", src: "/round-neck-customized/miletry green/military-green-round-neck-tshirt-back.webp" },
          { type: "image", src: "/round-neck-customized/miletry green/military-green-round-neck-tshirt-left.webp" },
          { type: "image", src: "/round-neck-customized/miletry green/military-green-round-neck-tshirt-right.webp" },
           { type: "image", src: "/round-neck-customized/miletry green/military-green-round-neck-tshirt-info.webp" },
        ],
      },
      {
        label: "Navy Blue Round Neck",
        hex: "#003d82",
        media: [
             { type: "image", src: "/round-neck-customized/navy blue/navy-blue-round-neck-tshirt-front.webp" },
          { type: "image", src: "/round-neck-customized/navy blue/navy-blue-round-neck-tshirt-back.webp" },
          { type: "image", src: "/round-neck-customized/navy blue/navy-blue-round-neck-tshirt-left.webp" },
          { type: "image", src: "/round-neck-customized/navy blue/navy-blue-round-neck-tshirt-right.webp" },
           { type: "image", src: "/round-neck-customized/navy blue/navy-blue-round-neck-tshirt-info.webp" },
        ],
      },
      {
        label: "Red Customized Round Neck",
        hex: "#e70000",
        media: [
           { type: "image", src: "/round-neck-customized/red/red-round-neck-tshirt-front.webp" },
          { type: "image", src: "/round-neck-customized/red/red-round-neck-tshirt-back.webp" },
          { type: "image", src: "/round-neck-customized/red/red-round-neck-tshirt-left.webp" },
          { type: "image", src: "/round-neck-customized/red/red-round-neck-tshirt-right.webp" },
           { type: "image", src: "/round-neck-customized/red/red-round-neck-tshirt-info.webp" },

        ],
      },
      {
        label: "Royal Blue Round Neck",
        hex: "#001e2e",
        media: [
          { type: "image", src: "/round-neck-customized/royal blue/royal-blue-round-neck-tshirt-front.webp" },
          { type: "image", src: "/round-neck-customized/royal blue/royal-blue-round-neck-tshirt-back.webp" },
          { type: "image", src: "/round-neck-customized/royal blue/royal-blue-round-neck-tshirt-left.webp" },
          { type: "image", src: "/round-neck-customized/royal blue/royal-blue-round-neck-tshirt-right.webp" },
           { type: "image", src: "/round-neck-customized/royal blue/royal-blue-round-neck-tshirt-info.webp" },
        ],
      },
      {
        label: "White Customized Round Neck",
        hex: "#ffffff",
        media: [
         { type: "image", src: "/round-neck-customized/white/white-round-neck-tshirt-front.webp" },
          { type: "image", src: "/round-neck-customized/white/white-round-neck-tshirt-back.webp" },
          { type: "image", src: "/round-neck-customized/white/white-round-neck-tshirt-left.webp" },
          { type: "image", src: "/round-neck-customized/white/white-round-neck-tshirt-right.webp" },
           { type: "image", src: "/round-neck-customized/white/white-round-neck-tshirt-info.webp" },
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