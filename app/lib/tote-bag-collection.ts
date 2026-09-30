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
  // Optional mini banner shown on simpleVariantPicker product pages (e.g.
  // Sample Kit) for whichever color is currently selected — a bold title,
  // a one-line description, and a few feature pills, matching the style of
  // the "BASIC CAP" banner reference. Reuses this color's own `media[0]` as
  // the banner photo, so no separate image field is needed here.
  banner?: {
    title: string;
    description: string;
    features: string[];
  };
  // Optional per-GSM-tier photo overrides for THIS color, keyed by the GSM
  // value (matching `gsmOptions[].value`, e.g. 150 or 330). When the shopper
  // has both a color and a GSM tier selected (simpleVariantPicker /
  // cardVariantPicker products), the live preview shows this color+GSM
  // combo's own photo — e.g. Natural at 150 GSM looks different from Natural
  // at 330 GSM. Falls back to this color's plain `media` for any GSM value
  // not listed here, so you only need to add entries for combos that
  // actually have distinct photos.
  gsmMedia?: Record<number, MediaItem[]>;
}

export interface Offer {
  code: string;
  saveAmount: number;
  description: string;
  minOrder: number;
  discountPct: number;
}

// ── Fabric Sub-Categories (Basic / Premium) ──────────────────────────────────

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

// "1. Choose Size" cards — used on style-picker products in place of
// "Choose Style" when this array is present. Not used by the individual
// (isDefaultCategory) products in this file, but kept for type compatibility
// with the rest of the app.
export interface SizeOption {
  id: string;
  label: string;
  dimension: string;
  price: number;
  image: string;
  popular?: boolean;
  // Optional per-color, per-GSM photo overrides for THIS size card — e.g.
  // Small in Natural at 150 GSM looks different from Small in Black at 330
  // GSM. Key format is `${colorLabel}:${gsmValue}`, e.g. "Natural:150" or
  // "Black:330". Falls back to the plain `image` above when the current
  // color+GSM combo isn't listed here (or when the product has no colors/
  // GSM options at all) — so you only need entries for combos that
  // actually have distinct photos.
  variantImages?: Record<string, string>;
}

// Optional per-size overrides for isDefaultCategory products (the tote bags
// in this file). `sizes` stays a plain string[] — e.g. ["12x14", "14x16"] —
// because the bulk "quantity per size" breakdown component elsewhere in the
// app expects that shape. `sizeDetails` is an add-on: key it by the exact
// string used in `sizes`, and fill in only what differs for that size (a
// different photo, a different price). Anything you don't set falls back to
// the product's own `displayPrice`/`media` on the size-picker grid — so a
// product with all sizes the same price/photo doesn't need this at all.
// A size can now come in more than one GSM (fabric weight) — e.g. the SAME
// "12x14" size might be sold at both 150 GSM and 330 GSM, each with its own
// photo and (optionally) its own price. That's what `gsmVariants` is for:
// keyed by the GSM number, one entry per weight you actually sell that size
// in. This is what fixes the "duplicate key" error you'd get from trying to
// list "12x14" twice in the same sizeDetails object (once per GSM) — now
// there's only ever ONE "12x14" entry, and the different GSMs live inside it.
//
// HOW TO ADD MORE PRODUCTS/SIZES LATER:
//   sizeDetails: {
//     "12x14": {
//       dimension: `12" x 14"`,        // shown once, same for every GSM of this size
//       gsmVariants: {
//         150: { image: "...", price: 199 },   // add/remove GSM keys as needed
//         330: { image: "...", price: 249 },   // any number of GSM weights allowed
//       },
//     },
//     "14x16": { ... },                 // repeat per size — same shape every time
//   },
// If a size only comes in ONE weight, just give `gsmVariants` a single key
// (e.g. only `330: {...}`) — the GSM picker on the page will simply not show
// for that size since there's nothing to choose between.
export interface SizeDetail {
  dimension?: string; // human label shown under the size, e.g. `18" x 20"` — shared across every GSM variant of this size
  // Multiple GSM variants for THIS size — key is the GSM value (150, 330,
  // etc). Each variant can have its own image/price/blankMedia. If a size
  // only comes in one GSM, just provide a single entry, e.g.
  // `gsmVariants: { 330: { image: "..." } }`.
  gsmVariants?: Record<number, {
    image?: string;      // overrides the product photo for this size+GSM combo
    price?: number;       // overrides displayPrice for this size+GSM combo
    // Blank (unprinted) photos for THIS size+GSM combo — front, back, left,
    // right — used only in the logo live-preview canvas. Falls back to the
    // selected color's `blankMedia` (and then to nothing) when not set here.
    blankMedia?: MediaItem[];
  }>;
}

// A fabric-thickness tier for products that use the simple "Choose Color +
// Choose GSM + Quantity" purchase flow (set `simpleVariantPicker: true` on
// the product to use it) — e.g. "150 GSM / Lightweight" vs "330 GSM / Heavy
// & Premium", each with its own feature bullets, swatch photo, and optional
// price. This is a product-level choice (not per-size, since these products
// don't use `sizes` at all).
export interface GsmOption {
  value: number;      // 150
  label: string;      // "Lightweight", "Heavy & Premium"
  features: string[]; // bullet list shown on the card, e.g. "Light & Easy to Carry"
  image?: string;      // fabric swatch/texture photo shown on the card
  price?: number;      // overrides displayPrice for this GSM tier only
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
  gsm?: number; // fabric weight (grams per sq. metre) — fallback when a size in sizeDetails doesn't set its own
  turnaround?: string;
  sameDayTurnaround?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  colors?: ProductColor[];
  // Size labels for this product — put whatever you actually sell here,
  // e.g. ["12x14", "14x16", "16x18", "18x20"]. Order shown = order listed.
  sizes?: string[];
  // Optional: give any of the sizes above their own photo/price/dimension
  // text. Only needed for sizes that should differ from the product default.
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
  // "Default category" page: this product's own detail page — shows
  // Plan/Customized (labeled "Fabric Type"), feature badges, a "Choose
  // Color" swatch row, and related category products below. This is what
  // every individual (non-style-picker) tote bag product in this file uses.
  isDefaultCategory?: boolean;
  isBasicPremiumCategory?: boolean;
  // When true, the product page skips EVERYTHING else — Plan/Customized
  // fabric type, logo upload/live-preview, size breakdown, delivery
  // selection — and instead shows just: Choose Color, Choose Fabric GSM
  // (from `gsmOptions` below), a quantity stepper, and a single order
  // button. This is an early-return branch inside ProductDetailClient.tsx
  // itself (not a separate component) — see the `simpleVariantPicker` check
  // near the top of that file's JSX return. Use `colors` as usual for the
  // color step.
  simpleVariantPicker?: boolean;
  gsmOptions?: GsmOption[];
  // When true, the page shows the "card" style flow used by the Customized
  // Tote Bag: 1. Choose Size (from `sizeOptions`, radio-circle cards with a
  // dimension diagram + "Popular" badge), 2. Choose Color + 3. Fabric/GSM
  // (the same green card row simpleVariantPicker products use), then
  // 4. Customized (the Plan/Customized cards below, with copy/images pulled
  // from `designOptions` instead of the generic cap defaults). Unlike
  // simpleVariantPicker, this does NOT hide quantity/delivery/logo upload —
  // it only swaps which "picker" sections are shown and how they're styled.
  cardVariantPicker?: boolean;
  // Overrides the Plan/Customized cards' copy + photos for cardVariantPicker
  // products. Falls back to the generic cap-oriented defaults hardcoded in
  // ProductDetailClient.tsx when not set.
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
// NOTE: this is the single source of truth for product pricing (displayPrice,
// sameDayAvailable, sizes, etc). The create-razorpay-order API route looks
// products up from this same array — never from anything sent by the client —
// so the amount charged can never drift from what's shown on the page.
type RawColor = Omit<ProductColor, "sku">;
type RawProduct = Omit<Product, "sku" | "colors"> & { colors?: RawColor[] };

const CATEGORY_PREFIX = "TOTE";

const COLOR_CODES: Record<string, string> = {
  white: "WHT",
  black: "BLK",
  natural: "NAT",
  navy: "NVY",
  "navy blue": "NVY",
  red: "RED",
  beige: "BEG",
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

// I picked four starter products as a working example — swap names/slugs/
// content or add more entries as needed.
//
// The first two (Sample Kit, Customized) deliberately have NO `sizes` array:
// a product without sizes (or with only one) skips the size-picker grid
// entirely and its card on the listing page links straight to the product
// detail page — see the `hasSizeChoice` check in tote-bag.tsx's ProductCard.
const rawProductsData: RawProduct[] = [
  {
    id: "1",
    name: "Sample Kit Tote Bag",
    slug: "tote-bag-sample-kit",
    // This product uses the minimal purchase flow — see `simpleVariantPicker`
    // on the Product interface. No Plan/Customized, no logo upload, no size
    // breakdown — just color, fabric GSM, quantity, and an order button.
    simpleVariantPicker: true,
    basePrice: 540,
    displayPrice: 599, // baseline (150 GSM) price — 330 GSM overrides via gsmOptions below
    originalPrice: 999,
    discount: 40,
    images: [""],
    media: [
      { type: "image", src: "/tote-bag-collection/sample-kit-tote-bag-1.webp" },
     
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Tote Bag",
    description: "A curated sample kit so you can feel the fabric and check print quality before placing a bulk order.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant"],
    material: "Cotton Canvas",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.3,
    reviewCount: 1500,
    badge: "Best Seller",
    // "Choose Color" step — rendered as photo cards (not hex dots) by the
    // simpleVariantPicker branch inside ProductDetailClient.tsx.
    colors: [
      {
        label: "Natural",
        hex: "#E8DCC8",
        media: [{ type: "image", src: "/tote-bag-collection/sample-kit-tote-bag-1.webp" }],
        banner: {
          title: "Natural Canvas Tote Bag",
          description: "Unbleached, earthy canvas that pairs well with any print — a soft, everyday staple.",
          features: ["Eco-Friendly", "Sturdy Handles", "Reusable"],
        },
        // Natural at 150 GSM vs 330 GSM look visibly different (thinner vs
        // thicker weave) — swap these placeholder paths for the real photos.
        gsmMedia: {
          150: [{ type: "image", src: "/tote-bag-collection/sample-kit/natural-sample-kit.webp" }],
          330: [{ type: "image", src: "/tote-bag-collection/sample-kit/natural-sample-kit.webp" }],
        },
      },
      {
        label: "Black",
        hex: "#111111",
        media: [{ type: "image", src: "/tote-bag-collection/sample-kit-tote-bag-2.webp" }],
        banner: {
          title: "Black Canvas Tote Bag",
          description: "A classic black canvas that hides everyday wear and pairs with any design.",
          features: ["Stain-Resistant Look", "Sturdy Handles", "Reusable"],
        },
        gsmMedia: {
          150: [{ type: "image", src: "/tote-bag-collection/sample-kit/black-sample-kit.webp" }],
          330: [{ type: "image", src: "/tote-bag-collection/sample-kit/black-sample-kit.webp" }],
        },
      },
    ],
    // "Choose the fabric thickness that suits your need" step.
    gsmOptions: [
      {
        value: 150,
        label: "Lightweight",
        features: ["Light & Easy to Carry", "Economical Choice", "Promotions Use"],
        image: "/tote-bag-collection/premium-100-cotton.webp",
        // no `price` override — uses the product's own displayPrice (₹599)
      },
      {
        value: 330,
        label: "Heavy & Premium",
        features: ["Thicker & Extra Strong", "Reusable Fabric", "Branding Use"],
        image: "/tote-bag-collection/premium-100-cotton.webp",
        price: 699, // premium fabric costs more
      },
    ],
    // No `sizes` here — this is a single fixed-size sample kit.
    inStock: true,
    weight: 150,
    customizable: false,
    sameDayAvailable: true,
    offer: DEFAULT_OFFER,
  },
  {
    id: "2",
    name: "Customized Tote Bag",
    slug: "customized-tote-bag",
    isDefaultCategory: true,
    cardVariantPicker: true,
    basePrice: 180,
    displayPrice: 199, // baseline (Small size) price — other sizes override via sizeOptions below
    originalPrice: 349,
    discount: 43,
    images: [""],
    media: [
      { type: "image", src: "/tote-bag-collection/customize1.webp" },
       { type: "image", src: "/tote-bag-collection/customize2.webp" },
     
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Tote Bag",
    description: "Fully customizable tote bag — pick a size, color, and fabric, then add your own design.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant"],
    material: "Cotton Canvas",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.9,
    reviewCount: 2500,
    // "1. Choose Size" — radio-circle cards with a dimension diagram image,
    // a "Popular" badge, and per-size pricing. Swap the placeholder `image`
    // paths for real width/height diagram photos of each size.
    sizeOptions: [
      {
        id: "small",
        label: "Small",
        dimension: "12 x 14 inch",
        price: 199,
        image: "/tote-bag-collection/150gsm-natural-tote-bag/natural-150GSM-small-1.webp",
        variantImages: {
          "Natural:150": "/tote-bag-collection/150gsm-natural-tote-bag/natural-150GSM-small-1.webp",
          "Natural:330": "/tote-bag-collection/330gsm-natural-tote-bag/natural-330GSM-small-1.webp",
          "Black:150": "/tote-bag-collection/black/150-gsm/black-150GSM-small-1.webp",
          "Black:330": "/tote-bag-collection/black/330-gsm/black-330GSM-small-1.webp",
        },
      },
      {
        id: "medium",
        label: "Medium",
        dimension: "14 x 16 inch",
        price: 219,
        image: "/tote-bag-collection/150gsm-natural-tote-bag/natural-150GSM-medium-2.webp",
        popular: true,
        variantImages: {
          "Natural:150": "/tote-bag-collection/150gsm-natural-tote-bag/natural-150GSM-medium-2.webp",
          "Natural:330": "/tote-bag-collection/330gsm-natural-tote-bag/natural-330GSM-medium-2.webp",
          "Black:150": "/tote-bag-collection/black/150-gsm/black-150GSM-small-2.webp",
          "Black:330": "/tote-bag-collection/black/330-gsm/black-330GSM-medium-2.webp",
        },
      },
      {
        id: "large",
        label: "Large",
        dimension: "16 x 18 inch",
        price: 249,
        image: "/tote-bag-collection/150gsm-natural-tote-bag/natural-150GSM-large-3.webp",
        variantImages: {
          "Natural:150": "/tote-bag-collection/150gsm-natural-tote-bag/natural-150GSM-large-3.webp",
          "Natural:330": "/tote-bag-collection/330gsm-natural-tote-bag/natural-330GSM-large-3.webp",
          "Black:150": "/tote-bag-collection/black/150-gsm/black-150GSM-small-3.webp",
          "Black:330": "/tote-bag-collection/black/330-gsm/black-330GSM-large-3.webp",
        },
      },
      {
        id: "xl",
        label: "XL",
        dimension: "18 x 20 inch",
        price: 279,
        image: "/tote-bag-collection/150gsm-natural-tote-bag/natural-150GSM-extra-large-4.webp",
        variantImages: {
          "Natural:150": "/tote-bag-collection/150gsm-natural-tote-bag/natural-150GSM-extra-large-4.webp",
          "Natural:330": "/tote-bag-collection/330gsm-natural-tote-bag/natural-330GSM-extra-large-4.webp",
          "Black:150": "/tote-bag-collection/black/150-gsm/black-150GSM-small-4.webp",
          "Black:330": "/tote-bag-collection/black/330-gsm/black-330GSM-extra-large-4.webp",
        },
      },
    ],
    // "2. Choose Color"
    colors: [
      {
        label: "Natural",
        hex: "#E8DCC8",
        // Every entry here becomes a thumbnail — the FIRST one is also what
        // shows on the "Choose Color" card, so keep a clean product photo up
        // front. Promotional/collage graphics (like the extras below) work
        // fine as additional gallery thumbnails, just not as the very first
        // entry, or they'll show up as the color card's thumbnail too.
        media: [
          { type: "image", src: "/tote-bag-collection/330gsm/natural-330-gsm-bg.webp" },
          { type: "image", src: "/tote-bag-collection/150gsm-natural-tote-bag/tote-bag-extra-1.webp" },
          { type: "image", src: "/tote-bag-collection/150gsm-natural-tote-bag/tote-bag-extra-2.webp" },
          { type: "image", src: "/tote-bag-collection/150gsm-natural-tote-bag/tote-bag-extra-3.webp" },
        ],
        // Blank (unprinted) photo for the logo live-preview canvas — front
        // and back both use the SAME photo/block (no separate back shot).
        blankMedia: [
          { type: "image", src: "/tote-bag-collection/natural-tote-bag.webp" },
          { type: "image", src: "/tote-bag-collection/natural-tote-bag.webp" },
        ],
        banner: {
          title: "Natural Canvas Tote Bag",
          description: "Unbleached, earthy canvas that pairs well with any print — a soft, everyday staple.",
          features: ["Eco-Friendly", "Sturdy Handles", "Reusable"],
        },
        // No `gsmMedia` here — `sizeOptions[].variantImages` already supplies
        // the size+color+GSM-specific hero photo (and does it more
        // precisely, per size). Keeping gsmMedia too would take priority
        // over the real `media` gallery above and hide it whenever a GSM
        // tier is selected — which is why only 2 thumbnails were showing
        // instead of all 5.
      },
      {
        label: "Black",
        hex: "#111111",
        media: [
          { type: "image", src: "/tote-bag-collection/330gsm/black-330-gsm-bg.webp" },
          { type: "image", src: "/tote-bag-collection/black/150-gsm/black-extra-1.webp" },
          { type: "image", src: "/tote-bag-collection/black/150-gsm/black-extra-2.webp" },
          { type: "image", src: "/tote-bag-collection/black/150-gsm/black-extra-3.webp" },
        ],
        blankMedia: [
          { type: "image", src: "/tote-bag-collection/black-tote-bag.webp" },
          { type: "image", src: "/tote-bag-collection/black-tote-bag.webp" },
        ],
        banner: {
          title: "Black Canvas Tote Bag",
          description: "A classic black canvas that hides everyday wear and pairs with any design.",
          features: ["Stain-Resistant Look", "Sturdy Handles", "Reusable"],
        },
        // Same as Natural above — no gsmMedia, sizeOptions.variantImages
        // already covers this.
      },
    ],
    // "3. Fabric/GSM"
    gsmOptions: [
      {
        value: 150,
        label: "Lightweight",
        features: ["Light & Easy to Carry", "Economical Choice", "Promotions Use"],
        image: "/tote-bag-collection/premium-100-cotton.webp",
        // no `price` override — uses the selected size's own price
      },
      {
        value: 330,
        label: "Heavy & Premium",
        features: ["Thicker & Extra Strong", "Reusable Fabric", "Branding Use"],
        image: "/tote-bag-collection/premium-100-cotton.webp",
        price: 699, // premium fabric costs more, overrides the size price when selected
      },
    ],
    // "4. Customized" — Plan (I'll design later) vs Customized (add your own
    // design) cards, replacing the generic cap copy/images with tote copy.
    designOptions: {
      plan: {
        titleAccent: "(Solid Plain Bag)",
        features: ["Plain bag without any design", "Perfect for Labels & Embroidery"],
        image: "/tote-bag-collection/natural-plain-1.webp",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/tote-bag-collection/customize plain-1.webp",
      },
    },
    // No `sizes` here — this product uses `sizeOptions` (a single pick, with
    // its own price/diagram) instead of the bulk multi-size breakdown that
    // `sizes: string[]` drives elsewhere in the app.
    inStock: true,
    weight: 150,
    customizable: true,
    logoUploadEnabled: true,
    // Only Front and Back are offered for this product — no Left/Right
    // upload boxes or preview tabs.
    enabledLogoSides: ["front", "back"],
    sameDayAvailable: true,
    offer: DEFAULT_OFFER,
  },
  {
    id: "3",
    name: "Natural Canvas Tote Bag",
    slug: "natural-canvas-tote-bag",
    isDefaultCategory: true,
    basePrice: 180,
    displayPrice: 199,
    originalPrice: 349,
    discount: 43,
    images: [""],
    media: [
      { type: "image", src: "/tote-bag-collection/330gsm/natural-330-gsm-bg.webp" },
      { type: "image", src: "/tote-bag-collection/natural-your-logo-here-bg.webp" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Tote Bag",
    description: "Natural unbleached canvas tote bag — sturdy, reusable, and ready for your logo or design.",
    features: ["100% Canvas", "Screen printed", "Wash-resistant", "Eco-friendly"],
    material: "Natural Cotton Canvas",
    gsm: 330, // fallback fabric weight if a size below doesn't set its own
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.4,
    reviewCount: 96,
    badge: "Best Seller",
    colors: [
      {
        label: "Natural",
        hex: "#E8DCC8",
        media: [
          { type: "image", src: "/tote-bag-collection/natural-tote-bag-bg.webp" },
            { type: "image", src: "/tote-bag-collection/150gsm-natural-tote-bag/tote-bag-extra-1.webp" },
              { type: "image", src: "/tote-bag-collection/150gsm-natural-tote-bag/tote-bag-extra-2.webp" },
                { type: "image", src: "/tote-bag-collection/150gsm-natural-tote-bag/tote-bag-extra-3.webp" },

        ],
      },
    ],
    sizes: ["12x14", "14x16", "16x18", "18x20"],
    // "1. Fabric Type" — Plan (plain bag) vs Customized (your design) cards.
    // Reuses this product's own media[] photos, which are already exactly
    // this: a plain bag shot and a "your logo here" mockup.
    designOptions: {
      plan: {
        titleAccent: "(Solid Plain Bag)",
        features: ["Plain bag without any design", "Perfect for Labels & Embroidery"],
        image: "/tote-bag-collection/natural-plain-1.webp",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/tote-bag-collection/natural-your-logo-here-bg.webp",
      },
    },
    sizeDetails: {
      // CHANGED: each size below now has a `gsmVariants` object instead of a
      // flat image/gsm/price — this is the fix for the duplicate-key error.
      // Your existing 330gsm photos are untouched, just moved one level
      // deeper under `gsmVariants[330]`. I added 150gsm as NEW placeholder
      // paths (following the same "150gsm-natural-tote-bag/" folder you
      // already use for this product's color photos) — swap those four
      // paths for your real 150gsm shots whenever you have them; nothing
      // else needs to change.
      "12x14": {
        dimension: `12" x 14"`,
        gsmVariants: {
          150: {
            image: "/tote-bag-collection/150gsm-natural-tote-bag/natural-150GSM-small-1.webp", // placeholder — replace with real 150gsm photo
            blankMedia: [
              { type: "image", src: "/tote-bag-collection/natural-tote-bag-bg.webp" },
              { type: "image", src: "/tote-bag-collection/natural-tote-bag-bg.webp" },
            ],
          },
          330: {
            image: "/tote-bag-collection/330gsm-natural-tote-bag/natural-330GSM-small-1.webp",
            blankMedia: [
              { type: "image", src: "/tote-bag-collection/natural-tote-bag-bg.webp" },
              { type: "image", src: "/tote-bag-collection/natural-tote-bag-bg.webp" },
            ],
          },
        },
      },
      "14x16": {
        dimension: `14" x 16"`,
        gsmVariants: {
          150: {
            image: "/tote-bag-collection/150gsm-natural-tote-bag/natural-150GSM-medium-2.webp", // placeholder — replace with real 150gsm photo
            blankMedia: [
              { type: "image", src: "/tote-bag-collection/natural-tote-bag-bg.webp" },
              { type: "image", src: "/tote-bag-collection/natural-tote-bag-bg.webp" },
            ],
          },
          330: {
            image: "/tote-bag-collection/330gsm-natural-tote-bag/natural-330GSM-medium-2.webp",
            blankMedia: [
              { type: "image", src: "/tote-bag-collection/natural-tote-bag-bg.webp" },
              { type: "image", src: "/tote-bag-collection/natural-tote-bag-bg.webp" },
            ],
          },
        },
      },
      "16x18": {
        dimension: `16" x 18"`,
        gsmVariants: {
          150: {
            image: "/tote-bag-collection/150gsm-natural-tote-bag/natural-150GSM-large-3.webp", // placeholder — replace with real 150gsm photo
            blankMedia: [
              { type: "image", src: "/tote-bag-collection/natural-tote-bag-bg.webp" },
              { type: "image", src: "/tote-bag-collection/natural-tote-bag-bg.webp" },
            ],
          },
          330: {
            image: "/tote-bag-collection/330gsm-natural-tote-bag/natural-330GSM-large-3.webp",
            blankMedia: [
              { type: "image", src: "/tote-bag-collection/natural-tote-bag-bg.webp" },
              { type: "image", src: "/tote-bag-collection/natural-tote-bag-bg.webp" },
            ],
          },
        },
      },
      "18x20": {
        dimension: `18" x 20"`,
        gsmVariants: {
          150: {
            image: "/tote-bag-collection/150gsm-natural-tote-bag/natural-tote-bag-18x20.webp", // placeholder — replace with real 150gsm photo
            blankMedia: [
              { type: "image", src: "/tote-bag-collection/natural-tote-bag-bg.webp" },
              { type: "image", src: "/tote-bag-collection/natural-tote-bag-bg.webp" },
            ],
          },
          330: {
            image: "/tote-bag-collection/330gsm-natural-tote-bag/natural-330GSM-extra-large-4.webp",
            price: 249, // kept from your original — example of a size+GSM combo costing more
            blankMedia: [
              { type: "image", src: "/tote-bag-collection/natural-tote-bag-bg.webp" },
              { type: "image", src: "/tote-bag-collection/natural-tote-bag-bg.webp" },
            ],
          },
        },
      },

      // 150gsm 

      
    },
    inStock: true,
    weight: 200,
    customizable: true,
    logoUploadEnabled: true,
    // A tote bag only has a front and back panel — no sleeves/sides like a
    // t-shirt would, so Left/Right don't apply here.
    enabledLogoSides: ["front", "back"],
    sameDayAvailable: true,
    offer: DEFAULT_OFFER,
  },
  {
    id: "4",
    name: "Black Canvas Tote Bag",
    slug: "black-canvas-tote-bag",
    isDefaultCategory: true,
    basePrice: 180,
    displayPrice: 199,
    originalPrice: 349,
    discount: 43,
    images: [""],
   media: [
      { type: "image", src: "/tote-bag-collection/black/330-gsm/black-330-gsm-bg.webp" },
      { type: "image", src: "/tote-bag-collection/black/330-gsm/black-your-logo-here.webp" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Tote Bag",
    description: "Classic black canvas tote bag — sturdy, reusable, and ready for your logo or design.",
    features: ["100% Canvas", "Screen printed", "Wash-resistant", "Eco-friendly"],
    material: "Cotton Canvas",
    gsm: 330, // fallback fabric weight if a size below doesn't set its own
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.5,
    reviewCount: 110,
    badge: "Best Seller",
    colors: [
      {
        label: "Black",
        hex: "#111111",
        media: [
          { type: "image", src: "/tote-bag-collection/330gsm/black-330-gsm-bg.webp" },
          { type: "image", src: "/tote-bag-collection/black/150-gsm/black-extra-1.webp" },
          { type: "image", src: "/tote-bag-collection/black/150-gsm/black-extra-2.webp" }, // FIXED: was a duplicate of extra-1
          { type: "image", src: "/tote-bag-collection/black/150-gsm/black-extra-3.webp" }, // FIXED: was a duplicate of extra-1
        ],
      },
    ],
    sizes: ["12x14", "14x16", "16x18", "18x20"],
    // "1. Fabric Type" — Plan (plain bag) vs Customized (your design) cards.
    // FIXED: these were pointing at Natural's photos (natural-plain-1.webp /
    // natural-your-logo-here-bg.webp) — now use Black's own real media[]
    // photos already defined above.
    designOptions: {
      plan: {
        titleAccent: "(Solid Plain Bag)",
        features: ["Plain bag without any design", "Perfect for Labels & Embroidery"],
        image: "/tote-bag-collection/black/330-gsm/black-330-gsm-bg.webp",
      },
      custom: {
        titleAccent: "(Add Your Design)",
        features: ["Add your logo or artwork", "Choose printing or embroidery"],
        image: "/tote-bag-collection/black/330-gsm/black-your-logo-here.webp",
      },
    },
    sizeDetails: {
      // Same gsmVariants restructuring as Natural above. Your real 330gsm
      // photos are kept exactly as they were — just moved under
      // `gsmVariants[330]`. 150gsm paths are NEW placeholders following the
      // "black/150-gsm/" folder you already use — replace with real photos
      // whenever you have them.
      "12x14": {
        dimension: `12" x 14"`,
        gsmVariants: {
          150: {
            image: "/tote-bag-collection/black/150-gsm/black-150GSM-small-1.webp", // placeholder — replace with real 150gsm photo
            blankMedia: [
              { type: "image", src: "/tote-bag-collection/black/150-gsm/black-330-gsm-bg.webp" },
              { type: "image", src: "/tote-bag-collection/black/150-gsm/black-330-gsm-bg.webp" },
            ],
          },
          330: {
            image: "/tote-bag-collection/black/330-gsm/black-330GSM-small-1.webp",
            blankMedia: [
              { type: "image", src: "/tote-bag-collection/330gsm/black-330-gsm-bg.webp" },
              { type: "image", src: "/tote-bag-collection/330gsm/black-330-gsm-bg.webp" },
            ],
          },
        },
      },
      "14x16": {
        dimension: `14" x 16"`,
        gsmVariants: {
          150: {
            image: "/tote-bag-collection/black/150-gsm/black-150GSM-small-3.webp", // placeholder — replace with real 150gsm photo
            blankMedia: [
              { type: "image", src: "/tote-bag-collection/330gsm/black-330-gsm-bg.webp" },
              { type: "image", src: "/tote-bag-collection/330gsm/black-330-gsm-bg.webp" },
            ],
          },
          330: {
            image: "/tote-bag-collection/black/330-gsm/black-330GSM-medium-2.webp",
            blankMedia: [
              { type: "image", src: "/tote-bag-collection/330gsm/black-330-gsm-bg.webp" },
              { type: "image", src: "/tote-bag-collection/330gsm/black-330-gsm-bg.webp" },
            ],
          },
        },
      },
      "16x18": {
        dimension: `16" x 18"`,
        gsmVariants: {
          150: {
            image: "/tote-bag-collection/black/150-gsm/black-150GSM-small-3.webp", // placeholder — replace with real 150gsm photo
            blankMedia: [
              { type: "image", src: "/tote-bag-collection/330gsm/black-330-gsm-bg.webp" },
              { type: "image", src: "/tote-bag-collection/330gsm/black-330-gsm-bg.webp" },
            ],
          },
          330: {
            image: "/tote-bag-collection/black/330-gsm/black-330GSM-large-3.webp",
            blankMedia: [
              { type: "image", src: "/tote-bag-collection/330gsm/black-330-gsm-bg.webp" },
              { type: "image", src: "/tote-bag-collection/330gsm/black-330-gsm-bg.webp" },
            ],
          },
        },
      },
      "18x20": {
        dimension: `18" x 20"`,
        gsmVariants: {
          150: {
            image: "/tote-bag-collection/black/150-gsm/black-150GSM-small-4.webp", // placeholder — replace with real 150gsm photo
            blankMedia: [
              { type: "image", src: "/tote-bag-collection/330gsm/black-330-gsm-bg.webp" },
              { type: "image", src: "/tote-bag-collection/330gsm/black-330-gsm-bg.webp" },
            ],
          },
          330: {
            image: "/tote-bag-collection/black/330-gsm/black-330GSM-extra-large-4.webp",
            price: 249, // kept from your original — example of a size+GSM combo costing more
            blankMedia: [
              { type: "image", src: "/tote-bag-collection/330gsm/black-330-gsm-bg.webp" },
              { type: "image", src: "/tote-bag-collection/330gsm/black-330-gsm-bg.webp" },
            ],
          },
        },
      },
    },
    inStock: true,
    weight: 200,
    customizable: true,
    logoUploadEnabled: true,
    // A tote bag only has a front and back panel — no sleeves/sides like a
    // t-shirt would, so Left/Right don't apply here.
    enabledLogoSides: ["front", "back"],
    sameDayAvailable: true,
    offer: DEFAULT_OFFER,
  },
];

export const productsData: Product[] = attachSkus(rawProductsData);