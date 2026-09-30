export interface MediaItem {
  type: "image" | "video";
  src: string;
  poster?: string;
}

// Kept only so page.tsx's color-selector code (currently unused for ID
// cards, since no product sets `colors`) still type-checks correctly.
export interface ProductColor {
  label: string;
  hex: string;
  media?: MediaItem[];
  blankMedia?: MediaItem[];
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
  // Drives which /products/identity-cards/category/[category] grid this
  // product shows up in. Must match a slug in categories.ts.
  categorySlug: "corporate" | "school" | "event";
  description?: string;
  features?: string[];
  material?: string;
  turnaround?: string;
  sameDayTurnaround?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  colors?: ProductColor[]; // ID cards don't use this — leave undefined on every product
  sizes?: string[];        // ID cards don't use this — leave undefined on every product
  // Blank (unprinted) card template shown in the live-preview canvas —
  // separate from `media`, which is the finished demo card shown in the
  // main product gallery.
  blankMedia?: MediaItem[];
  inStock?: boolean;
  discount?: number;
  weight?: number;
  customizable?: boolean;
  logoUploadEnabled?: boolean;
  sameDayAvailable?: boolean;
  offer?: Offer;
  availablepatterns?: string;
  cardBg?: string;
}

export const DEFAULT_OFFER: Offer = {
  code: "PREPAID5",
  saveAmount: 25,
  description: "Get EXTRA 5% OFF on all Prepaid orders above Rs.499.",
  minOrder: 499,
  discountPct: 5,
};

export const productsData: Product[] = [
  {
    id: "1",
    name: "Employee ID Card",
    slug: "employee-id-card",
    sku: "IDC-001",
    basePrice: 40,
    displayPrice: 99,
    originalPrice: 149,
    discount: 34,
    images: ["/id-cards/blue-card/CS-ID-1.webp", "/id-cards/blue-card/CS-ID-2.webp"],
    media: [
      { type: "image", src: "/id-cards/blue-card/CS-ID-1.webp" },
      { type: "image", src: "/id-cards/blue-card/CS-ID-2.webp" },
    ],
    // Blank/black card template used only for the live-preview canvas
    blankMedia: [
      { type: "image", src: "/id-cards/blue-card/ID-CARD-P1.webp" },
      { type: "image", src: "/id-cards/blue-card/ID-CARD-P2.webp" },
    ],
    printMethod: "PVC Digital Print",
    quantityReq: 1,
    priceRange: "budget",
    category: "ID Cards",
    categorySlug: "corporate",
    description: "Durable PVC employee ID card with QR code and photo slot.",
    features: ["Waterproof PVC", "UV-resistant print", "Optional RFID chip", "Free lanyard punch hole"],
    material: "PVC, 0.76mm CR80",
    turnaround: "3-5 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.6,
    reviewCount: 84,
    badge: "Best Seller",
    inStock: true,
    weight: 5,
    customizable: true,
    logoUploadEnabled: true,
    sameDayAvailable: true,
    offer: DEFAULT_OFFER,
  },
];