// Central data source for the Badge Collection product category.
//
// The Product/ProductColor types here are a full superset matching
// tote-bag-collection.ts's shape — this lets ProductDetailClient.tsx (the
// shared, richly-featured component with the image gallery, logo upload/
// live preview, checkout flow, reviews, etc.) be reused for badges without
// modification. Every tote-bag-specific field (sizeOptions, gsmOptions,
// designOptions, isStylePicker, etc.) is simply left undefined on every
// badge product — none of those flows apply here.

export interface MediaItem {
  type: "image" | "video";
  src: string;
  poster?: string;
}

export interface Offer {
  code: string;
  saveAmount: number;
  description: string;
  minOrder: number;
  discountPct: number;
}

export interface FabricMaterialProduct { id: string; name: string; image: string; }
export interface FabricSubCategory { id: string; label: string; products: FabricMaterialProduct[]; }
export type FabricSubCategoryMap = { basic?: FabricSubCategory[]; premium?: FabricSubCategory[]; };

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
  gsmVariants?: Record<number, { image?: string; price?: number; blankMedia?: MediaItem[] }>;
}

export interface GsmOption {
  value: number;
  label: string;
  features: string[];
  image?: string;
  price?: number;
}

export interface ProductColor {
  label: string;
  hex: string;
  sku?: string; // auto-filled by attachSkus()
  media?: MediaItem[];
  // Blank (unprinted) badge photo for the logo live-preview canvas — badges
  // are single-sided, so only index 0 (front) is ever used.
  blankMedia?: MediaItem[];
  sameDayAvailable?: boolean;
  banner?: { title: string; description: string; features: string[] };
  gsmMedia?: Record<number, MediaItem[]>;
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
  // Badges are single-sided — only ever "front".
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
  // Shape + pixel size of the dashed ring behind each size icon on the
  // "Select Size" cards. Omit to default to a 112x112 circle.
  sizeCardShape?: {
    shape: "circle" | "square" | "rectangle";
    width: number;
    height: number;
  };
  // Image shown inside the "Customize your badge" promo card, next to the
  // size options. Falls back to a shared default when a product doesn't set
  // its own.
  customizedPreviewImage?: string;
  // Icon shown next to the upload dropzone in step "Upload Your Logo".
  // Falls back to a generic upload icon when a product doesn't set its own.
  uploadIcon?: string;
  simpleVariantPicker?: boolean;
  gsmOptions?: GsmOption[];
  cardVariantPicker?: boolean;
  designOptions?: {
    plan: { titleAccent: string; features: string[]; image: string };
    custom: { titleAccent: string; features: string[]; image: string };
  };
  fabricCategoryBanner?: Record<"basic" | "premium", { title: string; description: string; image: string; badges: string[] }>;
  fabricChoices?: Record<"basic" | "premium", {
    id: string; name: string; subtitle: string; image: string; cardImage?: string;
    products?: { id: string; name: string; image: string; images?: string[] }[];
  }[]>;
}

export const DEFAULT_OFFER: Offer = {
  code: "PREPAID5",
  saveAmount: 25,
  description: "Get EXTRA 5% OFF on all Prepaid orders above Rs.499.",
  minOrder: 499,
  discountPct: 5,
};

const rawProductsData: Omit<Product, "sku">[] = [
  {
    id: "1",
    name: "Customized Badges",
    slug: "customized-badges",
    basePrice: 39,
    displayPrice: 49,
    originalPrice: 89,
    discount: 45,
    images: [""],
    media: [
      { type: "image", src: "/badge-collection/custom.webp" },
      { type: "image", src: "/badge-collection/dummy-images/custome-round badges-1.webp" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Badge",
    description: "Fully customizable badge — upload your own design and pick your size.",
    features: ["Durable metal finish", "Full-color print", "Scratch-resistant coating"],
    material: "Metal / Epoxy",
    turnaround: "3-5 business days",
    sameDayTurnaround: "By 8 PM today",
    sameDayAvailable: true,
    rating: 4.7,
    reviewCount: 58,
    badge: "Best Seller",
    sizes: ["32mm", "56mm"],
    customizable: true,
    logoUploadEnabled: true,
    enabledLogoSides: ["front"],
    inStock: true,
    weight: 10,
    offer: DEFAULT_OFFER,
    // Shows the "Choose Badge Type" thumbnail row (Round Pin / Rectangle /
    // Fridge Magnet / Shirt Magnet) above "Select Size" on this product's
    // page only — picking one swaps the photos/live-preview shown without
    // navigating away, via ProductDetailClient's isStylePicker handling.
    isStylePicker: true,
  },
   {
    id: "2",
    name: "Round Pin Badge",
    slug: "round-pin-badge",
    basePrice: 29,
    displayPrice: 39,
    originalPrice: 69,
    discount: 43,
    images: [""],
    media: [
      { type: "image", src: "/badge-collection/round-pin-badge/round-pin-badges-2.webp" },
      { type: "image", src: "/badge-collection/round-pin-badge/round-pin-badges-3.webp" }
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Badge",
    description: "Clean silver-finish badge with a sharp, modern shine.",
    features: ["Durable metal finish", "Polished silver coating", "Secure pin backing"],
    uploadIcon:"/badge-collection/upload-icons/round-pin.webp",
    material: "Metal",
    turnaround: "3-5 business days",
    sameDayAvailable: true,
    rating: 4.5,
    reviewCount: 29,
    sizes: ["32mm", "56mm"],
    colors: [
      {
        label: "Grey",
        hex: "#f3f1f1",
        media: [
           { type: "image", src: "/badge-collection/round-pin-badge/round-pin-badges-2.webp" },
      { type: "image", src: "/badge-collection/round-pin-badge/round-pin-badges-3.webp" },
       { type: "image", src: "/badge-collection/round-pin-badge/round-pin-badges-1 (1).webp" },
        { type: "image", src: "/badge-collection/round-pin-badge/round-pin-badges-4.webp" },
        ],
        blankMedia: [{ type: "image", src: "/badge-collection/round-pin-badge/round-pin-badges.webp" }],
      },
    ],
    customizable: false,
    customizedPreviewImage: "/badge-collection/round-pin-badge/round-magnet-badges-4.webp",
    
    logoUploadEnabled: true,
    enabledLogoSides: ["front"],
    inStock: true,
    weight: 10,
    offer: DEFAULT_OFFER,
  },

   {
    id: "3",
    name: "Round Magnet Badge",
    slug: "round-magnet-badge",
    basePrice: 29,
    displayPrice: 39,
    originalPrice: 69,
    discount: 43,
    images: [""],
    media: [
      { type: "image", src: "/badge-collection/round-magnet-badge/round-magnet-badges-1.webp" },
      { type: "image", src: "/badge-collection/round-magnet-badge/round-magnet-badges-2.webp" }
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Badge",
    description: "Clean silver-finish badge with a sharp, modern shine.",
    features: ["Durable metal finish", "Polished silver coating", "Secure pin backing"],
    uploadIcon:"/badge-collection/upload-icons/round-magnet.webp",
    material: "Metal",
    turnaround: "3-5 business days",
    sameDayAvailable: true,
    rating: 4.5,
    reviewCount: 29,
     sizes: ["32mm", "56mm"],
    colors: [
      {
        label: "Grey",
        hex: "#f3f1f1",
        media: [
            { type: "image", src: "/badge-collection/round-magnet-badge/round-magnet-badges-1.webp" },
      { type: "image", src: "/badge-collection/round-magnet-badge/round-magnet-badges-2.webp" },
      { type: "image", src: "/badge-collection/round-magnet-badge/round-magnet-badges-3.webp" },
      { type: "image", src: "/badge-collection/round-magnet-badge/constent.webp" },

        ],
        blankMedia: [{ type: "image", src: "/badge-collection/round-magnet-badge/round-magnet-badges.webp" }],
      },
    ],
    customizable: false,
    customizedPreviewImage: "/badge-collection/round-magnet-badge/round-magnet-badges-4.webp",
    
    logoUploadEnabled: true,
    enabledLogoSides: ["front"],
    inStock: true,
    weight: 10,
    offer: DEFAULT_OFFER,
  },

 {
    id: "4",
    name: "Square Pin Badge",
    slug: "square-pin-badge",
    basePrice: 29,
    displayPrice: 39,
    originalPrice: 69,
    discount: 43,
    images: [""],
    media: [
      { type: "image", src: "/badge-collection/square-pin-badge/squre-pin-badges-1.webp" },
      { type: "image", src: "/badge-collection/square-pin-badge/squre-pin-badges-3.webp" }
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Badge",
    description: "Clean silver-finish badge with a sharp, modern shine.",
    features: ["Durable metal finish", "Polished silver coating", "Secure pin backing"],
    uploadIcon:"/badge-collection/upload-icons/squre-pin.webp",
    material: "Metal",
    turnaround: "3-5 business days",
    sameDayAvailable: true,
    rating: 4.5,
    reviewCount: 29,
    sizes: ["50mm", "60mm"],
    colors: [
      {
        label: "Grey",
        hex: "#f3f1f1",
        media: [
           { type: "image", src: "/badge-collection/square-pin-badge/squre-pin-badges-1.webp" },
      { type: "image", src: "/badge-collection/square-pin-badge/squre-pin-badges-3.webp" },
        { type: "image", src: "/badge-collection/square-pin-badge/squre-pin-badges-2.webp" },
      { type: "image", src: "/badge-collection/square-pin-badge/squre-pin-badges-4.webp" },

        ],
        blankMedia: [{ type: "image", src: "/badge-collection/square-pin-badge/squre-pin-badges.webp" }],
      },
    ],
    customizable: false,
    sizeCardShape: { shape: "square", width: 100, height: 100 },
    customizedPreviewImage: "/badge-collection/square-pin-badge/squre-magnet-badges-4.webp",
    
    logoUploadEnabled: true,
    enabledLogoSides: ["front"],
    inStock: true,
    weight: 10,
    offer: DEFAULT_OFFER,
  },


  {
    id: "5",
    name: "Square Magnet Badge",
    slug: "square-magnet-badge",
    basePrice: 29,
    displayPrice: 39,
    originalPrice: 69,
    discount: 43,
    images: [""],
    media: [{ type: "image", src: "/badge-collection/square-magnet-badge/squre-magnet-badges-1.webp" },
      { type: "image", src: "/badge-collection/square-magnet-badge/squre-magnet-badges-2.webp" },

    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Badge",
    description: "Sleek matte black badge — durable, lightweight, and ready to wear.",
    features: ["Durable metal finish", "Matte black coating", "Secure pin backing"],
    material: "Metal",
    turnaround: "3-5 business days",
    sizeCardShape: { shape: "square", width: 100, height: 100 },
    sameDayAvailable: true,
    rating: 4.5,
    reviewCount: 34,
    sizes: ["32mm", "56mm"],
    colors: [
      {
        label: "Sky Blue",
        hex: "#45d7de",
        media: [
          { type: "image", src: "/badge-collection/square-magnet-badge/squre-magnet-badges-1.webp" },
          { type: "image", src: "/badge-collection/square-magnet-badge/squre-magnet-badges-3.webp" },
      { type: "image", src: "/badge-collection/square-magnet-badge/squre-magnet-badges-2.webp" },
    ],
        blankMedia: [{ type: "image", src: "/badge-collection/square-magnet-badge/plain-squre-magnet.webp" }],
      },
    ],
    customizedPreviewImage: "/badge-collection/square-magnet-badge/squre-magnet-badges-4.webp",
    uploadIcon:"/badge-collection/upload-icons/squre-magnet.webp",
    customizable: true,
    logoUploadEnabled: true,
    enabledLogoSides: ["front"],
    inStock: true,
    weight: 10,
    offer: DEFAULT_OFFER,
  },

  
  
  {
    id: "6",
    name: "Rectangle Pin Badge",
    slug: "rectangle-pin-badge",
    basePrice: 29,
    displayPrice: 39,
    originalPrice: 69,
    discount: 43,
    images: [""],
    media: [{ type: "image", src: "/badge-collection/rectangle-pin-badges/rectangle-badge-1.webp" },
      { type: "image", src: "/badge-collection/rectangle-pin-badges/rectangle-badge-2.webp" }


    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Badge",
    description: "Classic gold-finish badge with a premium, polished look.",
    features: ["Durable metal finish", "Polished gold coating", "Secure pin backing"],
    material: "Metal",
    turnaround: "3-5 business days",
    sameDayAvailable: true,
    rating: 4.6,
    reviewCount: 41,
    sizeCardShape: { shape: "square", width: 220, height: 85 },
    customizedPreviewImage: "/badge-collection/rectangle-pin-badges/custome-rectangle-badges.webp",
    sizes: ["68x24mm"],
    colors: [
      {
        label: "White",
        hex: "#fdfcf7",
        media: [
          { type: "image", src: "/badge-collection/rectangle-pin-badges/rectangle-badge-1.webp" },
      { type: "image", src: "/badge-collection/rectangle-pin-badges/rectangle-badge-2.webp" },
      { type: "image", src: "/badge-collection/rectangle-pin-badges/on-badge1.webp" }
        ],
        blankMedia: [{ type: "image", src: "/badge-collection/rectangle-pin-badges/live-plain-custome-rectangle-badges.webp" }],
      },
    ],
    customizable: true,
    uploadIcon:"/badge-collection/upload-icons/rectangle-pin.webp",
    logoUploadEnabled: true,
    enabledLogoSides: ["front"],
    inStock: true,
    weight: 10,
    offer: DEFAULT_OFFER,
  },
  {
    id: "7",
    name: "Rectangle Magnet Badge",
    slug: "rectangle-magnet-badge",
    basePrice: 29,
    displayPrice: 39,
    originalPrice: 69,
    discount: 43,
    images: [""],
    media: [
      { type: "image", src: "/badge-collection/rectangle-magnet-badge/rectangle-magnet-badges-1.webp" },
      { type: "image", src: "/badge-collection/rectangle-magnet-badge/rectangle-magnet-badges-2.webp" }
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Badge",
    description: "Clean silver-finish badge with a sharp, modern shine.",
    features: ["Durable metal finish", "Polished silver coating", "Secure pin backing"],
    uploadIcon:"/badge-collection/upload-icons/rectangle-magnet.webp",
    material: "Metal",
    turnaround: "3-5 business days",
    sameDayAvailable: true,
    rating: 4.5,
    reviewCount: 29,
    sizes: ["68x24mm"],
    colors: [
      {
        label: "Grey",
        hex: "#f3f1f1",
        media: [
            { type: "image", src: "/badge-collection/rectangle-magnet-badge/rectangle-magnet-badges-1.webp" },
      { type: "image", src: "/badge-collection/rectangle-magnet-badge/rectangle-magnet-badges-2.webp" },
      { type: "image", src: "/badge-collection/rectangle-magnet-badge/rectangle-magnet-badges-3.webp" },
      { type: "image", src: "/badge-collection/rectangle-magnet-badge/constent.webp" },

        ],
        blankMedia: [{ type: "image", src: "/badge-collection/rectangle-magnet-badge/rectangle-mangnet-badges.webp" }],
      },
    ],
    customizable: false,
    customizedPreviewImage: "/badge-collection/rectangle-magnet-badge/rectangle-magnet-badges-4.webp",
    sizeCardShape: { shape: "square", width: 220, height: 85 },
    logoUploadEnabled: true,
    enabledLogoSides: ["front"],
    inStock: true,
    weight: 10,
    offer: DEFAULT_OFFER,
  },


  


];

function attachSkus(products: Omit<Product, "sku">[]): Product[] {
  return products.map((p) => {
    const productSku = `BADGE-${p.id.padStart(3, "0")}`;
    return {
      ...p,
      sku: productSku,
      colors: p.colors?.map((c) => ({
        ...c,
        sku: `${productSku}-${c.label.toUpperCase().replace(/\s+/g, "")}`,
      })),
    } as Product;
  });
}

export const productsData: Product[] = attachSkus(rawProductsData);