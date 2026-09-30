// PATH: app/lib/sitemap-data.ts
//
// Single source of truth for every link on the site's sitemap — used by
// both app/sitemap.ts (the machine-readable sitemap.xml Google reads) and
// app/sitemap/SitemapPage.tsx (the human-readable /sitemap page the footer
// already links to). Built by walking every product category's real data
// file rather than hand-typing URLs, so the two stay in sync automatically.
//
// See the long comment in app/sitemap.ts for exactly which routes were
// deliberately left out (dead duplicate routes, coming-soon jerseys,
// orphaned dynamic routes nothing links to, etc.) and why.

export interface SitemapLink {
  label: string;
  href: string;
  /** Relative importance, 0–1. Only consumed by sitemap.ts. */
  priority?: number;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
}

export interface SitemapGroup {
  /** A category landing page, with its own product/sub-category links nested under it. */
  label: string;
  href: string;
  priority?: number;
  changeFrequency?: SitemapLink["changeFrequency"];
  children?: SitemapLink[];
}

export interface SitemapSection {
  title: string;
  /** Plain links (static pages) shown directly under the section heading. */
  links?: SitemapLink[];
  /** Category landing pages, each with its own nested products. */
  groups?: SitemapGroup[];
}

export const SITEMAP_SECTIONS: SitemapSection[] = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/", priority: 1.0, changeFrequency: "daily" },
      { label: "All Products", href: "/products", priority: 0.9, changeFrequency: "daily" },
      { label: "Apparels", href: "/apparels", priority: 0.8 },
      { label: "Accessories", href: "/accessories", priority: 0.8 },
      { label: "Sports Wear", href: "/sports-wear", priority: 0.6 },
      { label: "Same-Day Delivery", href: "/same-day-delivery", priority: 0.7 },
      { label: "Bulk Orders", href: "/bulk-order", priority: 0.6 },
      { label: "Corporate Gifting", href: "/corporate-gifting", priority: 0.6 },
      { label: "Personalized Gifts", href: "/personalized-gifts", priority: 0.6 },
      { label: "Print on Demand", href: "/print-on-demand", priority: 0.6 },
      { label: "Blogs", href: "/blogs", priority: 0.6, changeFrequency: "daily" },
    ],
  },
  {
    title: "Customize Your Own",
    links: [
      { label: "Custom T-Shirt", href: "/customized-your-t-shirt", priority: 0.5 },
      { label: "Custom Bag", href: "/customized-your-bag", priority: 0.5 },
      { label: "Custom Bottle", href: "/customized-your-bottle", priority: 0.5 },
      { label: "Custom Caps", href: "/customized-your-caps", priority: 0.5 },
    ],
  },
  {
    title: "Apparels",
    groups: [
      {
        label: "Polo T-Shirts",
        href: "/products/apparels/polo-t-shirt",
        priority: 0.7,
        children: [
          { label: "Solid Polo T-Shirts", href: "/products/apparels/polo-t-shirt/solid-polo-t-shirts" },
          { label: "Tipping Collar Polo T-Shirts", href: "/products/apparels/polo-t-shirt/tipping-collar-polo-t-shirts" },
          { label: "Customized Solid Polo T-Shirt", href: "/products/apparels/polo-t-shirt/customized-solid-polo-t-shirt" },
          { label: "Customized Tipping Polo T-Shirt", href: "/products/apparels/polo-t-shirt/customized-tipping-polo-t-shirt" },
        ],
      },
      {
        label: "Hoodies",
        href: "/products/apparels/hoodies",
        priority: 0.7,
        children: [
          { label: "Customized Hoodies", href: "/products/apparels/hoodies/customized-hoodies" },
          { label: "Zipper Hoodies", href: "/products/apparels/hoodies/zipper-hoodies" },
          { label: "Pull-Over Hoodies", href: "/products/apparels/hoodies/pull-over-hoodies" },
          { label: "Sleeveless Hoodies", href: "/products/apparels/hoodies/sleeveless-hoodies" },
        ],
      },
      {
        label: "Full Sleeves Shirts",
        href: "/products/apparels/full-sleeves-shirt",
        priority: 0.7,
        children: [
          { label: "Customized Full Sleeve Shirt", href: "/products/apparels/full-sleeves-shirt/customized-full-sleeve-shirt" },
          { label: "Plain Full Sleeve Shirt", href: "/products/apparels/full-sleeves-shirt/plain-full-sleeve-shirt" },
          { label: "Dot Textured Shirts", href: "/products/apparels/full-sleeves-shirt/dot-textured-shirts" },
        ],
      },
      {
        label: "Round Neck T-Shirts",
        href: "/products/apparels/round-neck-t-shirt",
        priority: 0.7,
        children: [
          { label: "Customized Round Neck T-Shirt", href: "/products/apparels/round-neck-t-shirt/customized-round-neck-tshirt" },
          { label: "Round Neck T-Shirts", href: "/products/apparels/round-neck-t-shirt/round-neck-tshirts" },
        ],
      },
      {
        label: "Oversized T-Shirts",
        href: "/products/apparels/oversized-t-shirt",
        priority: 0.7,
        children: [
          { label: "Customized Oversized T-Shirt", href: "/products/apparels/oversized-t-shirt/customized-oversized-tshirt" },
          { label: "Oversized T-Shirt", href: "/products/apparels/oversized-t-shirt/oversized-tshirt" },
        ],
      },
    ],
  },
  {
    title: "Bags",
    groups: [
      {
        label: "Office Bags",
        href: "/products/bags/office-bag",
        priority: 0.7,
        children: [
          { label: "22L Backpack with Laptop Compartment", href: "/products/bags/office-bag/Modern-and-Minimalist-Backpack-22L-Black-With-Laptop-Compartment" },
          { label: "Mini Office Bag", href: "/products/bags/office-bag/mini-office-bag" },
          { label: "Office Executive Bag", href: "/products/bags/office-bag/office-executive-bag" },
          { label: "Office Laptop Bag", href: "/products/bags/office-bag/office-laptop-bag" },
        ],
      },
      {
        label: "Tote Bags",
        href: "/products/bags/tote-bag",
        priority: 0.7,
        children: [
          { label: "Tote Bag Sample Kit", href: "/products/bags/tote-bag/tote-bag-sample-kit" },
          { label: "Customized Tote Bag", href: "/products/bags/tote-bag/customized-tote-bag" },
          { label: "Natural Canvas Tote Bag", href: "/products/bags/tote-bag/natural-canvas-tote-bag" },
          { label: "Black Canvas Tote Bag", href: "/products/bags/tote-bag/black-canvas-tote-bag" },
        ],
      },
    ],
  },
  {
    title: "Drinkware",
    groups: [
      {
        label: "Stainless Steel Bottles",
        href: "/products/drinkware/stainless-steel-bottles",
        priority: 0.7,
        children: [{ label: "Black Stainless Steel UP Bottle", href: "/products/drinkware/stainless-steel-bottles/black-stainless-steel-up-bottle" }],
      },
      {
        label: "Stainless Steel Mugs",
        href: "/products/drinkware/stainless-steel-mug",
        priority: 0.7,
        children: [{ label: "Stainless Steel Mug", href: "/products/drinkware/stainless-steel-mug/stainless-steel-mug" }],
      },
      {
        label: "Stainless Steel Tumblers",
        href: "/products/drinkware/stainless-steel-tumbler",
        priority: 0.7,
        children: [{ label: "Stainless Steel Water Tumbler", href: "/products/drinkware/stainless-steel-tumbler/stainless-steel-water-tumbler" }],
      },
      {
        label: "Temperature Water Bottles",
        href: "/products/drinkware/temperature-water-bottle",
        priority: 0.7,
        children: [{ label: "Temperature Water Bottle", href: "/products/drinkware/temperature-water-bottle/temperature-water-bottle" }],
      },
      {
        label: "Water Bottles",
        href: "/products/drinkware/water-bottle",
        priority: 0.7,
        children: [{ label: "Water Bottle", href: "/products/drinkware/water-bottle/water-bottle" }],
      },
    ],
  },
  {
    title: "Caps",
    groups: [
      {
        label: "Caps Collection",
        href: "/products/caps-collection",
        priority: 0.7,
        children: [
          { label: "Premium Custom Logo Trucker Cap", href: "/products/caps-collection/premium-custom-logo-trucker-cap" },
          { label: "Casual Premium and Basic Cap", href: "/products/caps-collection/casual-premium-and-basic-cap" },
          { label: "Customized Caps", href: "/products/caps-collection/customized-caps" },
          { label: "Basic Cotton Blend Caps", href: "/products/caps-collection/basic-cotton-blend-caps" },
          { label: "Basic Polyester Cotton Caps", href: "/products/caps-collection/basic-polyester-cotton-caps" },
          { label: "Urban Classic 6-Panel Cap", href: "/products/caps-collection/urban-classic-6-panel-cap" },
        ],
      },
    ],
  },
  {
    title: "Umbrellas",
    groups: [
      { label: "Bottle Umbrella", href: "/products/umbrella-collection/bottle-umbrella", priority: 0.7, children: [{ label: "Red & White Promotional Umbrella", href: "/products/umbrella-collection/bottle-umbrella/red-and-white-promotional-cap" }] },
      { label: "C-Shape Umbrella", href: "/products/umbrella-collection/c-shape-umbrella", priority: 0.7, children: [{ label: "Red & White Promotional Umbrella", href: "/products/umbrella-collection/c-shape-umbrella/red-and-white-promotional-cap" }] },
      { label: "Mini Capsule Umbrella", href: "/products/umbrella-collection/mini-capsule-umbrella", priority: 0.7, children: [{ label: "Red & White Promotional Umbrella", href: "/products/umbrella-collection/mini-capsule-umbrella/red-and-white-promotional-cap" }] },
      { label: "Mini Travel Umbrella", href: "/products/umbrella-collection/mini-travel-umbrella", priority: 0.7, children: [{ label: "Red & White Promotional Umbrella", href: "/products/umbrella-collection/mini-travel-umbrella/red-and-white-promotional-cap" }] },
      { label: "UV Umbrella", href: "/products/umbrella-collection/uv-umbrella", priority: 0.7, children: [{ label: "Red & White Promotional Umbrella", href: "/products/umbrella-collection/uv-umbrella/red-and-white-promotional-cap" }] },
    ],
  },
  {
    title: "Badges",
    groups: [
      {
        label: "Badge Collection",
        href: "/products/badge-collection",
        priority: 0.7,
        children: [
          { label: "Customized Badges", href: "/products/badge-collection/customized-badges" },
          { label: "Round Pin Badge", href: "/products/badge-collection/round-pin-badge" },
          { label: "Round Magnet Badge", href: "/products/badge-collection/round-magnet-badge" },
          { label: "Square Pin Badge", href: "/products/badge-collection/square-pin-badge" },
          { label: "Square Magnet Badge", href: "/products/badge-collection/square-magnet-badge" },
          { label: "Rectangle Pin Badge", href: "/products/badge-collection/rectangle-pin-badge" },
          { label: "Rectangle Magnet Badge", href: "/products/badge-collection/rectangle-magnet-badge" },
        ],
      },
    ],
  },
  {
    title: "Visiting Cards",
    groups: [
      {
        label: "Visiting Cards",
        href: "/products/visiting-cards",
        priority: 0.7,
        children: [
          { label: "Customized Caps", href: "/products/visiting-cards/customized-caps" },
          { label: "Golden Frames", href: "/products/visiting-cards/golden-frames" },
          { label: "Pull-Over Hoodies", href: "/products/visiting-cards/pull-over-hoodies" },
          { label: "Home Decor", href: "/products/visiting-cards/home-decor" },
          { label: "Memory Frames", href: "/products/visiting-cards/memory-frames" },
        ],
      },
    ],
  },
  {
    title: "Trophies",
    groups: [
      { label: "Crystal & Glass Trophies", href: "/products/trophies-collection/crystal-glass-trophies", priority: 0.7, children: [{ label: "Water Bottle", href: "/products/trophies-collection/crystal-glass-trophies/water-bottle" }] },
      { label: "Metal & Brass Trophies", href: "/products/trophies-collection/metal-brass-trophies", priority: 0.7, children: [{ label: "Water Bottle", href: "/products/trophies-collection/metal-brass-trophies/water-bottle" }] },
      { label: "Acrylic Trophies", href: "/products/trophies-collection/acrylic-trophies", priority: 0.7, children: [{ label: "Water Bottle", href: "/products/trophies-collection/acrylic-trophies/water-bottle" }] },
      { label: "Sports Award Trophies", href: "/products/trophies-collection/sports-award-trophies", priority: 0.7, children: [{ label: "Water Bottle", href: "/products/trophies-collection/sports-award-trophies/water-bottle" }] },
    ],
  },
  {
    title: "Identity Cards",
    groups: [
      {
        label: "Identity Cards",
        href: "/products/identity-cards",
        priority: 0.8,
        children: [
          { label: "Employee ID Card", href: "/products/identity-cards/employee-id-card" },
          { label: "Corporate Category", href: "/products/identity-cards/category/corporate" },
          { label: "School Category", href: "/products/identity-cards/category/school" },
          { label: "Event Category", href: "/products/identity-cards/category/event" },
        ],
      },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Services", href: "/services", priority: 0.6 },
      { label: "Screen Printing", href: "/services/screen-printing", priority: 0.6 },
      { label: "Screen Printing — Polo", href: "/services/screen-printing/polo", priority: 0.5 },
      { label: "Screen Printing — Corporate Printing", href: "/services/screen-printing/corporate-printing", priority: 0.5 },
      { label: "Screen Printing — T-Shirts", href: "/services/screen-printing/t-shirts", priority: 0.5 },
      { label: "Screen Printing — Jersey", href: "/services/screen-printing/jersey", priority: 0.5 },
      { label: "Screen Printing — Hoodies & Sweatshirts", href: "/services/screen-printing/hoodies-and-sweatshirt", priority: 0.5 },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Become a Club Member", href: "/community/become-a-club-member", priority: 0.4 },
      { label: "Become a Sponsor", href: "/community/become-a-sponsor", priority: 0.4 },
      { label: "Events", href: "/community/events", priority: 0.4 },
    ],
  },
  {
    title: "Company & Support",
    links: [
      { label: "About Us", href: "/about-us", priority: 0.4, changeFrequency: "monthly" },
      { label: "Contact Us", href: "/contact-us", priority: 0.4, changeFrequency: "monthly" },
      { label: "Shipping Info", href: "/shipping-info", priority: 0.4, changeFrequency: "monthly" },
      { label: "Track Your Order", href: "/track-order", priority: 0.3, changeFrequency: "monthly" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
      { label: "Terms & Conditions", href: "/terms-and-condition", priority: 0.2, changeFrequency: "yearly" },
      { label: "Refund Policy", href: "/refund-policy", priority: 0.2, changeFrequency: "yearly" },
    ],
  },
];

/**
 * Screen-printing product slugs — the same 8 placeholder products currently
 * repeated under t-shirts / jersey / hoodies-and-sweatshirt. Kept separate
 * because they multiply out (3 sections × 8 slugs = 24 URLs) rather than
 * fitting the one-link-per-line shape above.
 */
export const SCREEN_PRINTING_SECTIONS = ["t-shirts", "jersey", "hoodies-and-sweatshirt"] as const;
export const SCREEN_PRINTING_SLUGS = [
  "basic-t-shirt-print",
  "premium-cotton-print",
  "bulk-printing-pack",
  "hoodie-print",
  "eco-hoodie-bundle",
  "corporate-bulk-kit",
  "kids-custom-tee",
  "premium-oversized-hoodie",
] as const;

/** Flattens every link in SITEMAP_SECTIONS (plus the screen-printing products) into one list, for sitemap.ts. */
export function getAllSitemapUrls(): { href: string; priority: number; changeFrequency: SitemapLink["changeFrequency"] }[] {
  const out: { href: string; priority: number; changeFrequency: SitemapLink["changeFrequency"] }[] = [];

  for (const section of SITEMAP_SECTIONS) {
    for (const link of section.links ?? []) {
      out.push({ href: link.href, priority: link.priority ?? 0.5, changeFrequency: link.changeFrequency ?? "weekly" });
    }
    for (const group of section.groups ?? []) {
      out.push({ href: group.href, priority: group.priority ?? 0.7, changeFrequency: group.changeFrequency ?? "weekly" });
      for (const child of group.children ?? []) {
        out.push({ href: child.href, priority: child.priority ?? 0.6, changeFrequency: child.changeFrequency ?? "monthly" });
      }
    }
  }

  for (const section of SCREEN_PRINTING_SECTIONS) {
    for (const slug of SCREEN_PRINTING_SLUGS) {
      out.push({ href: `/services/screen-printing/${section}/${slug}`, priority: 0.4, changeFrequency: "monthly" });
    }
  }

  return out;
}