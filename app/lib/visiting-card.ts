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
  hasCertificateDesigner:boolean;
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
  // Collage-frame products only: the picture-slot layouts to choose from
  // (e.g. "Classic 7-Photo", "Gallery 15-Photo"). When present and non-empty,
  // the product page shows a "Collage Layout" picker as the very first step,
  // above Frame Sizes.
  collageLayouts?: CollageLayoutOption[];
  // Home Decor product only: an additional style/design picker (image
  // swatches — same visual as Choose Color) that sits below the rest of the
  // frame customization steps. Selecting one also drives the main product
  // gallery (thumbnail strip + big image), same pattern as material/color
  // pickers elsewhere. When present and non-empty, the product page shows
  // this section; other frame products just don't have this field set.
  homeDecorStyles?: HomeDecorStyleOption[];
  // Frame products (hasCertificateDesigner: true) show the certificate
  // upload/customize step. This controls WHICH admin-authored template
  // library it pulls from (see CERTIFICATE_CATEGORIES in
  // app/lib/admin-certificates.ts on the admin side) — e.g. Certificate
  // Frames uses "certificate" (the default, if omitted), Home Decor uses
  // "home-decor". Different products never see each other's designs.
  certificateCategory?: string;
}

// ── Home Decor style picker (Home Decor product only) ────────────────────────
export interface HomeDecorStyleOption {
  id: string;
  label: string;
  // Multiple photos per color/style — the first is used as the picker's
  // swatch thumbnail; selecting this option pushes the WHOLE array into the
  // main gallery (thumbnail strip + big image), same pattern as
  // CollageLayoutOption.images.
  images: string[];
}

// ── Collage Layouts (collage-frame products only) ────────────────────────────
export interface CollageLayoutOption {
  id: string;
  name: string;   // e.g. "Classic 7-Photo Collage Frame"
  image: string;      // sample-filled photo — used as the picker thumbnail
  blankImage: string; // blank/empty-slot canvas — used in the live preview once selected
  // Optional: every photo you have for this layout (front, angles, close-ups,
  // blank, etc.) — when present, this whole list drives the main product
  // gallery (thumbnail strip + main viewer) for whichever layout is active,
  // instead of just the two shots above. Falls back to [image, blankImage]
  // if omitted.
  images?: string[];
  photoCount: number;
}

// ── Frame Cutting / Profile Options ──────────────────────────────────────────
// Used by the "Profile / Cutting" step on frame product pages. Every style
// (e.g. PL-01) has THREE photos:
//   - `image`          — fixed placeholder/corner-sample shown in the picker
//                         grid at all times (doesn't change with orientation).
//   - `imagePortrait`  — shown in the live preview once this style is
//                         selected AND Mount Orientation (step 2) is Portrait.
//   - `imageLandscape` — shown in the live preview once this style is
//                         selected AND Mount Orientation is Landscape.

export interface FrameCuttingOption {
  id: string;    // e.g. "PL-01"
  code: string;  // same as id, kept separate for display clarity
  name: string;  // e.g. "Classic Plain"
  image: string;          // picker thumbnail (always shown, regardless of orientation)
  imagePortrait: string;  // live preview when selected + orientation = portrait
  imageLandscape: string; // live preview when selected + orientation = landscape
}

export type FrameCuttingCategoryId =
  | "plain"
  | "bevel"
  | "step"
  | "double-line"
  | "layered"
  | "ornate"
  | "textured";

export interface FrameCuttingCategory {
  id: FrameCuttingCategoryId;
  title: string;
  subtitle: string;
  // Longer blurb shown in the text panel below the 4 swatches on the
  // product page. Optional — falls back to `subtitle` if omitted.
  description?: string;
  options: FrameCuttingOption[];
}

// Edit the `imagePortrait` / `imageLandscape` strings below directly to point
// at your real assets (paths resolve from the `public/` folder, e.g.
// "/frame-cuttings/plain/pl-01-portrait.webp" → public/frame-cuttings/plain/pl-01-portrait.webp).
export const FRAME_CUTTING_CATEGORIES: FrameCuttingCategory[] = [
  {
    id: "plain",
    title: "Plain / Minimal",
    subtitle: "Clean and simple profile for a timeless look.",
    description: "A minimalist edge that keeps the focus entirely on your certificate — no ornamentation, no distraction. Works well in offices, studies, and anywhere a clean, modern look is preferred over an ornate one.",
    options: [
      {
        id: "PL-01",
        code: "PL-01",
        name: "Classic Plain",
        image: "/frames/plain-and-minimal/classic-plain.webp",
        imagePortrait: "/frames/plain-and-minimal/classic plain-full-portrait.webp",
        imageLandscape: "/frames/plain-and-minimal/classic plain-full-landscape.webp",
      },
      {
        id: "PL-02",
        code: "PL-02",
        name: "Matte Finish",
        image: "/frames/plain-and-minimal/matte-finish.webp",
        imagePortrait: "/frames/plain-and-minimal/matte-finish-full-portrait.webp",
        imageLandscape: "/frames/plain-and-minimal/matte-finish-full-landscape.webp",
      },
      {
        id: "PL-03",
        code: "PL-03",
        name: "Wood Grain",
        image: "/frames/plain-and-minimal/sleek-black.webp",
        imagePortrait: "/frames/plain-and-minimal/sleek-black-full-portrait.webp",
        imageLandscape: "/frames/plain-and-minimal/sleek-black-full-landscape.webp",
      },
      {
        id: "PL-04",
        code: "PL-04",
        name: "Sleek Black",
        image: "/frames/plain-and-minimal/wood-grain.webp",
        imagePortrait: "/frames/plain-and-minimal/wood-grain-full-portrait.webp",
        imageLandscape: "/frames/plain-and-minimal/wood-grain-full-landscape.webp",
      },
    ],
  },
  {
    id: "bevel",
    title: "Bevel / Angled",
    subtitle: "Slanted edges for a modern and elegant look.",
    description: "The angled inner edge catches light and adds a subtle sense of depth without overwhelming the certificate itself. A popular middle ground between a plain frame and something more decorative.",
    options: [
      {
        id: "BV-01",
        code: "BV-01",
        name: "Natural Bevel",
        image: "/frames/bevel/black-bevel.webp",
        imagePortrait: "/frames/bevel/black-bevel-portrait.webp",
        imageLandscape: "/frames/bevel/black-bevel-landscape.webp",
      },
      {
        id: "BV-02",
        code: "BV-02",
        name: "Silver Bevel",
        image: "/frames/bevel/gold-bevel.webp",
        imagePortrait: "/frames/bevel/gold-bevel-portrait.webp",
        imageLandscape: "/frames/bevel/gold-bevel-landscape.webp",
      },
      {
        id: "BV-03",
        code: "BV-03",
        name: "Black Bevel",
        image: "/frames/bevel/natural-bevel.webp",
        imagePortrait: "/frames/bevel/natural-bevel-portrait.webp",
        imageLandscape: "/frames/bevel/natural-bevel-landscape.webp",
      },
      {
        id: "BV-04",
        code: "BV-04",
        name: "Gold Bevel",
        image: "/frames/bevel/silver-bevel.webp",
        imagePortrait: "/frames/bevel/silver-bevel-portrait.webp",
        imageLandscape: "/frames/bevel/silver-bevel-landscape.webp",
      },
    ],
  },
  {
    id: "step",
    title: "Step / Layered",
    subtitle: "Multi-level profile for added depth and dimension.",
    description: "Each level of the profile is finished separately, so the layered look holds up close as well as from across a room. Adds noticeable dimension for a modest step up in price.",
    options: [
      {
        id: "ST-01",
        code: "ST-01",
        name: "Classic Step",
        image: "/frames/step/classic-step.webp",
        imagePortrait: "/frames/step/classic-step-portrait.webp",
        imageLandscape: "/frames/step/classic-step-landscape.webp",
      },
      {
        id: "ST-02",
        code: "ST-02",
        name: "Modern Step",
        image: "/frames/step/dual-step.webp",
        imagePortrait: "/frames/step/dual-step-portrait.webp",
        imageLandscape: "/frames/step/dual-step-landscape.webp",
      },
      {
        id: "ST-03",
        code: "ST-03",
        name: "Dual Step",
        image: "/frames/step/modern step.webp",
        imagePortrait: "/frames/step/modern step-portrait.webp",
        imageLandscape: "/frames/step/modern step-landscape.webp",
      },
      {
        id: "ST-04",
        code: "ST-04",
        name: "Premium Step",
        image: "/frames/step/premium step.webp",
        imagePortrait: "/frames/step/premium-step-portrait.webp",
        imageLandscape: "/frames/step/premium-step-landscape.webp",
      },
    ],
  },
  {
    id: "double-line",
    title: "Double Line / Accent",
    subtitle: "Two lines or accent strips for a refined look.",
    description: "A thin accent line running parallel to the frame edge — enough to feel deliberate and finished without competing with the certificate's own borders or seals.",
    options: [
      {
        id: "DL-01",
        code: "DL-01",
        name: "Black Gold Line",
        image: "/frames/double-line/black-gold-line.webp",
        imagePortrait: "/frames/double-line/black-gold-line-portrait.webp",
        imageLandscape: "/frames/double-line/black-gold-line-landscape.webp",
      },
      {
        id: "DL-02",
        code: "DL-02",
        name: "Silver Line",
        image: "/frames/double-line/champagne line.webp",
        imagePortrait: "/frames/double-line/champagne-line-portrait.webp",
        imageLandscape: "/frames/double-line/champagne-line-landscape.webp",
      },
      {
        id: "DL-03",
        code: "DL-03",
        name: "Wood Gold Line",
        image: "/frames/double-line/silver-line.webp",
        imagePortrait: "/frames/double-line/silver-line-portrait.webp",
        imageLandscape: "/frames/double-line/silver-line-landscape.webp",
      },
      {
        id: "DL-04",
        code: "DL-04",
        name: "Champagne Line",
        image: "/frames/double-line/wood-gold-line.webp",
        imagePortrait: "/frames/double-line/wood-gold-line-portrait.webp",
        imageLandscape: "/frames/double-line/wood-gold-line-landscape.webp",
      },
    ],
  },
  {
    id: "layered",
    title: "Layered / Multi-tone",
    subtitle: "Stacked tones for a rich, dimensional edge.",
    description: "Two tones stacked together for a richer, more dimensional edge than a single-material frame. Pairs well with certificates that already have gold or metallic detailing.",
    options: [
      {
        id: "LY-01",
        code: "LY-01",
        name: "Walnut Layer",
        image: "/frames/layered/black-layered.webp",
        imagePortrait: "/frames/layered/black-layered-portrait.webp",
        imageLandscape: "/frames/layered/black-layered-landscape.webp",
      },
      {
        id: "LY-02",
        code: "LY-02",
        name: "Ash Layer",
        image: "/frames/layered/gold-layered.webp",
        imagePortrait: "/frames/layered/gold-layered-portrait.webp",
        imageLandscape: "/frames/layered/gold-layered-landscape.webp",
      },
       {
        id: "LY-03",
        code: "LY-03",
        name: "Ash Layer",
        image: "/frames/layered/walnut-layered.webp",
        imagePortrait: "/frames/layered/walnut-layered-portrait.webp",
        imageLandscape: "/frames/layered/walnut-layered-landscape.webp",
      },
       {
        id: "LY-04",
        code: "LY-04",
        name: "Ash Layer",
        image: "/frames/layered/white-layered.webp",
        imagePortrait: "/frames/layered/white-layered-portrait.webp",
        imageLandscape: "/frames/layered/white-layered-landscape.webp",
      },
    ],
  },
  {
    id: "ornate",
    title: "Ornate / Decorative",
    subtitle: "Intricate detailing for a classic, ornamental look.",
    description: "Hand-detailed patterning along the full profile for a classic, ceremonial feel — best suited to formal awards, degrees, and recognitions meant to be displayed prominently.",
    options: [
      {
        id: "OR-01",
        code: "OR-01",
        name: "Baroque Gold",
        image: "/frames/ornate/antique-gold.webp",
        imagePortrait: "/frames/ornate/antique-gold-portrait.webp",
        imageLandscape: "/frames/ornate/antique-gold-landscape.webp",
      },
      {
        id: "OR-02",
        code: "OR-02",
        name: "Antique Bronze",
        image: "/frames/ornate/floral-carved.webp",
        imagePortrait: "/frames/ornate/floral-carved-portrait.webp",
        imageLandscape: "/frames/ornate/floral-carved-landscape.webp",
      },
       {
        id: "OR-03",
        code: "OR-03",
        name: "Antique Bronze",
        image: "/frames/ornate/royal-carved.webp",
        imagePortrait: "/frames/ornate/royal-carved-portrait.webp",
        imageLandscape: "/frames/ornate/royal-carved-landscape.webp",
      },
       {
        id: "OR-04",
        code: "OR-04",
        name: "Antique Bronze",
        image: "/frames/ornate/victorian.webp",
        imagePortrait: "/frames/ornate/victorian-portrait.webp",
        imageLandscape: "/frames/ornate/victorian-landscape.webp",
      },
    ],
  },
  {
    id: "textured",
    title: "Textured / Woven",
    subtitle: "Woven or textured finish for a tactile, artisanal look.",
    description: "A woven or textured finish that reads as tactile and artisanal in person, not just visually. A good fit for certificates being framed as keepsakes rather than office wall pieces.",
    options: [
      {
        id: "TX-01",
        code: "TX-01",
        name: "Woven Linen",
        image: "/frames/textured/black-gold.webp",
        imagePortrait: "/frames/textured/black-gold-portrait.webp",
        imageLandscape: "/frames/textured/black-gold-landscape.webp",
      },
      {
        id: "TX-02",
        code: "TX-02",
        name: "Rattan Weave",
        image: "/frames/textured/metalic-texture.webp",
        imagePortrait: "/frames/textured/metalic-texture-portrait.webp",
        imageLandscape: "/frames/textured/metalic-texture-landscape.webp",
      },

       {
        id: "TX-03",
        code: "TX-03",
        name: "Rattan Weave",
        image: "/frames/textured/engraved.webp",
        imagePortrait: "/frames/textured/engraved-portrait.webp",
        imageLandscape: "/frames/textured/engraved-landscape.webp",
      },

       {
        id: "TX-04",
        code: "TX-04",
        name: "Rattan Weave",
        image: "/frames/textured/stone-texture.webp",
        imagePortrait: "/frames/textured/stone-texture-portrait.webp",
        imageLandscape: "/frames/textured/stone-texture-landscape.webp",
      },
    ],
  },
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
    hasCertificateDesigner:false,
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
      
    },
    colors: [
      

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
    name: "Golden Frames",
    slug: "golden-frames",
    styleLabel: "Zipper Hoodie",
    styleSubtitle: "Mesh Back",
    basePrice: 240,
    displayPrice: 599,
    originalPrice: 999,
    discount: 35.04,
    images: ["/frames/plain-and-minimal/classic plain-full-portrait.webp"],
    media: [
      // { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-front.webp" },
      // { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-left.webp" },
      { type: "image", src: "/frames/certificate/certificate-frames1.webp" },
      { type: "image", src: "/frames/certificate/certificate-frames2.webp" },
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
                label: "Certificate Frames",
                hex: "#e3d447",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/frames/certificate/certificate-frames1.webp",
                  },

                  {
                    type: "image",
                    src: "/frames/certificate/certificate-frames2.webp",
                  },

                                   
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/frames/plain-and-minimal/classic plain-full-portrait.webp",
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
          enabledLogoSides: ["front"],       // hides back/left/right everywhere, like the hoodie fix
            hasCertificateDesigner: true,      // swaps in the certificate canvas + pencil button
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
    basePrice: 240,
    displayPrice: 599,
    originalPrice: 999,
    hasCertificateDesigner:false,
    discount: 35.04,
    images: ["/frames/Classic 7-Photo Collage Frame/Classic-7-photo-collage-frame-1.webp"],
    media: [
     // { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-front.webp" },
     // { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-left.webp" },
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
        
              // {
              //   label: "Ice Blue Pull Over Hoodie",
              //   hex: "#53afc1",
              //   sameDayAvailable: true,
              //   media: [
              //     {
              //       type: "image",
              //       src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-front.webp",
              //     },
              //     {
              //       type: "image",
              //       src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-back.webp",
              //     },
              //     {
              //       type: "image",
              //       src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-right.webp",
              //     },
              //     {
              //       type: "image",
              //       src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-left.webp",
              //     },
                 
              //      {
              //       type: "image",
              //       src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-info.webp",
              //     },
                  
                 
              //   ],
              //   blankMedia: [
              //     {
              //       type: "image",
              //       src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-front.webp",
              //     },
              //     {
              //       type: "image",
              //       src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-back.webp",
              //     },
              //     {
              //       type: "image",
              //       src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-right.webp",
              //     },
              //     {
              //       type: "image",
              //       src: "/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-left.webp",
              //     },
              //   ],
              // },

               
             
              
            ],
            sizes: ["XS", "S", "M", "L", "XL", "XXL","3XL","4XL","5XL","6XL"],
          inStock: true,
          weight: 300,
          customizable: false,
          logoUploadEnabled: true,
          isDefaultCategory: true,
          sameDayAvailable: true,
          // `image` = sample-filled photo (picker thumbnail). `blankImage` =
          // blank canvas (live preview once "Customized" is picked).
          // `images` = every shot you have for that layout — drives the main
          // product gallery (thumbnail strip + main viewer). Add as many as
          // you have; NOTE the extra entries below are placeholder paths —
          // fill in whatever additional angles/shots you actually have.
          collageLayouts: [
            {
              id: "classic-7",
              name: "Classic 7 Collage",
              image: "/frames/Classic 7-Photo Collage Frame/Classic 7-Photo Collage Frame.webp",
              blankImage: "/frames/Classic 7-Photo Collage Frame/Classic-7-photo-collage-frame-3.webp",
              images: [
                "/frames/Classic 7-Photo Collage Frame/Classic 7-Photo Collage Frame.webp",
                "/frames/Classic 7-Photo Collage Frame/Classic-7-photo-collage-frame-2.webp",
                "/frames/Classic 7-Photo Collage Frame/Classic-7-photo-collage-frame-3.webp",
              ],
              photoCount: 7,
            },
            {
              id: "gallery-12",
              name: "Gallery 17 Collage",
              image: "/frames/Gallery 12-Photo Collage Frame/Gallery 12-Photo Collage Frame.webp",
              blankImage: "/frames/Gallery 12-Photo Collage Frame/Gallery 17-Photo Collage Frame-3.webp",
              images: [
                "/frames/Gallery 12-Photo Collage Frame/Gallery 12-Photo Collage Frame.webp",
                "/frames/Gallery 12-Photo Collage Frame/Gallery 17-Photo Collage Frame-2.webp",
                "/frames/Gallery 12-Photo Collage Frame/Gallery 17-Photo Collage Frame-3.webp",
              ],
              photoCount: 17,
            },
            {
              id: "portrait-9",
              name: "Portrait 9 Collage",
              image: "/frames/Portrait 9-Photo Collage Frame/Portrait 9-Photo Collage Frame.webp",
              blankImage: "/frames/Portrait 9-Photo Collage Frame/Portrait-9-photo-collage-frame-3.webp",
              images: [
                "/frames/Portrait 9-Photo Collage Frame/Portrait 9-Photo Collage Frame.webp",
                "/frames/Portrait 9-Photo Collage Frame/Portrait-9-photo-collage-frame-2.webp",
                "/frames/Portrait 9-Photo Collage Frame/Portrait-9-photo-collage-frame-3.webp",
              ],
              photoCount: 9,
            },
            {
              id: "square-9",
              name: "Square 9 Collage",
              image: "/frames/Square 9-Photo Collage Frame/Square 9-Photo Collage Frame.webp",
              blankImage: "/frames/Square 9-Photo Collage Frame/Square9-photo-collage-frame-3.webp",
              images: [
                "/frames/Square 9-Photo Collage Frame/Square 9-Photo Collage Frame.webp",
                "/frames/Square 9-Photo Collage Frame/Square9-photo-collage-frame-2.webp",
                "/frames/Square 9-Photo Collage Frame/Square9-photo-collage-frame-3.webp",
              ],
              photoCount: 9,
            },
          ],
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
    name: "Home Decors",
    slug: "home-decor",
    styleLabel: "Zipper Hoodie",
    styleSubtitle: "Mesh Back",
    basePrice: 240,
    displayPrice: 599,
    originalPrice: 999,
    discount: 35.04,
    images: ["/frames/plain-and-minimal/classic plain-full-portrait.webp"],
    media: [
      // { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-front.webp" },
      // { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-left.webp" },
      { type: "image", src: "/frames/home-decor/home-decor.webp" },
      { type: "image", src: "/frames/home-decor/home-decor2.webp" },
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
                label: "Certificate Frames",
                hex: "#e3d447",
                sameDayAvailable: true,
                media: [
                  {
                    type: "image",
                    src: "/frames/home-decor/home-decor.webp",
                  },

                  {
                    type: "image",
                    src: "/frames/home-decor/home-decor2.webp",
                  },

                                   
                ],
                blankMedia: [
                  {
                    type: "image",
                    src: "/frames/plain-and-minimal/classic plain-full-portrait.webp",
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
          enabledLogoSides: ["front"],       // hides back/left/right everywhere, like the hoodie fix
            hasCertificateDesigner: true,      // swaps in the certificate canvas + pencil button
          certificateCategory: "home-decor",   // its own separate template library in the admin Certificates section
          // NOTE: placeholder image paths for the style picker below — drop
          // your real photos in at these paths under `public/`. Each color
          // has multiple photos (front, angle, etc.) — add/remove entries
          // in each `images` array to match what you actually have, and add
          // as many more colors as you have (the "+N More" tile already
          // handles any count).
          homeDecorStyles: [
            {
              id: "green",
              label: "Green",
              images: [
                "/frames/home-decor/home-decor.webp",
                "/frames/home-decor/home-decor2.webp",
              ],
            },
            {
              id: "teal",
              label: "Teal",
              images: [
                "/frames/home-decor/styles/teal-1.webp",
                "/frames/home-decor/styles/teal-2.webp",
              ],
            },
            {
              id: "navy",
              label: "Navy",
              images: [
                "/frames/home-decor/styles/navy-1.webp",
                "/frames/home-decor/styles/navy-2.webp",
              ],
            },
            {
              id: "maroon",
              label: "Maroon",
              images: [
                "/frames/home-decor/styles/maroon-1.webp",
                "/frames/home-decor/styles/maroon-2.webp",
              ],
            },
            {
              id: "mustard",
              label: "Mustard",
              images: [
                "/frames/home-decor/styles/mustard-1.webp",
                "/frames/home-decor/styles/mustard-2.webp",
              ],
            },
            {
              id: "grey",
              label: "Grey",
              images: [
                "/frames/home-decor/styles/grey-1.webp",
                "/frames/home-decor/styles/grey-2.webp",
              ],
            },
          ],
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
    name: "Memory Frames",
    slug: "memory-frames",
    styleLabel: "Pull Over Hoodie",
    styleSubtitle: "",
    basePrice: 240,
    displayPrice: 599,
    originalPrice: 999,
    hasCertificateDesigner:false,
    discount: 35.04,
    images: ["/frames/Classic 7-Photo Collage Frame/Classic-7-photo-collage-frame-1.webp"],
    media: [
     // { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-front.webp" },
     // { type: "image", src: "/cap-collections/cotton-basic-cap/gold yellow/gold-yellow-cotton-mix-basic-cap-left.webp" },
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
        
             
              
            ],
            sizes: ["XS", "S", "M", "L", "XL", "XXL","3XL","4XL","5XL","6XL"],
          inStock: true,
          weight: 300,
          customizable: false,
          logoUploadEnabled: true,
          isDefaultCategory: true,
          sameDayAvailable: true,
          // `image` = sample-filled photo (picker thumbnail). `blankImage` =
          // blank canvas (live preview once "Customized" is picked).
          // `images` = every shot you have for that layout — drives the main
          // product gallery (thumbnail strip + main viewer). Add as many as
          // you have; NOTE the extra entries below are placeholder paths —
          // fill in whatever additional angles/shots you actually have.
          collageLayouts: [
            {
              id: "classic-7",
              name: "Classic 7 Collage",
              image: "/frames/memories-frames/memories.webp",
              blankImage: "/frames/memories-frames/memory-frame.webp",
              images: [
                "/frames/memories-frames/memories.webp",
                "/frames/memories-frames/memories-frames2.webp",
                
              ],
              photoCount: 3,
            },
            // {
            //   id: "gallery-12",
            //   name: "Gallery 17 Collage",
            //   image: "/frames/Gallery 12-Photo Collage Frame/Gallery 12-Photo Collage Frame.webp",
            //   blankImage: "/frames/Gallery 12-Photo Collage Frame/Gallery 17-Photo Collage Frame-3.webp",
            //   images: [
            //     "/frames/Gallery 12-Photo Collage Frame/Gallery 12-Photo Collage Frame.webp",
            //     "/frames/Gallery 12-Photo Collage Frame/Gallery 17-Photo Collage Frame-2.webp",
            //     "/frames/Gallery 12-Photo Collage Frame/Gallery 17-Photo Collage Frame-3.webp",
            //   ],
            //   photoCount: 17,
            // },
            // {
            //   id: "portrait-9",
            //   name: "Portrait 9 Collage",
            //   image: "/frames/Portrait 9-Photo Collage Frame/Portrait 9-Photo Collage Frame.webp",
            //   blankImage: "/frames/Portrait 9-Photo Collage Frame/Portrait-9-photo-collage-frame-3.webp",
            //   images: [
            //     "/frames/Portrait 9-Photo Collage Frame/Portrait 9-Photo Collage Frame.webp",
            //     "/frames/Portrait 9-Photo Collage Frame/Portrait-9-photo-collage-frame-2.webp",
            //     "/frames/Portrait 9-Photo Collage Frame/Portrait-9-photo-collage-frame-3.webp",
            //   ],
            //   photoCount: 9,
            // },
            // {
            //   id: "square-9",
            //   name: "Square 9 Collage",
            //   image: "/frames/Square 9-Photo Collage Frame/Square 9-Photo Collage Frame.webp",
            //   blankImage: "/frames/Square 9-Photo Collage Frame/Square9-photo-collage-frame-3.webp",
            //   images: [
            //     "/frames/Square 9-Photo Collage Frame/Square 9-Photo Collage Frame.webp",
            //     "/frames/Square 9-Photo Collage Frame/Square9-photo-collage-frame-2.webp",
            //     "/frames/Square 9-Photo Collage Frame/Square9-photo-collage-frame-3.webp",
            //   ],
            //   photoCount: 9,
            // },
          ],
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