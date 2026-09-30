import { MetadataRoute } from "next";
import { getAllSitemapUrls } from "@/app/lib/sitemap-data";

// ─────────────────────────────────────────────────────────────────────────
// Machine-readable sitemap.xml. All the actual URLs live in one place —
// app/lib/sitemap-data.ts — shared with the human-readable /sitemap page
// (app/sitemap/SitemapPage.tsx) that the footer already links to, so the
// two can never drift apart.
//
// The production domain is https://cluesstyle.com (see app/layout.tsx's
// metadataBase and app/robots.ts) — the previous version of this file
// pointed at https://preview.cluesstyle.com, the staging domain, so none
// of its URLs matched what's actually live. Fixed here.
//
// Left OUT of app/lib/sitemap-data.ts on purpose, because nothing on the
// live site actually links to them (verified against every category
// page's own href/link values, not guessed):
//   - /products/bottle, /products/cap, /products/polo-tshirt,
//     /products/hoodies, /products/full-sleeves-shirt, /products/umbrella,
//     /products/executive-kit, /products/custom-trophies,
//     /products/sports-jersey, /products/frames, /products/apparels/t-shirts
//     — older duplicate routes superseded by the current
//     /products/apparels/*, /products/bags/*, /products/caps-collection,
//     /products/umbrella-collection structure.
//   - /products/bags/sports-bag — its card is commented out in
//     app/products/bags/bags.tsx.
//   - /products/apparels/sports-jersey and all four /products/sports/...
//     jersey routes — every card for these on /sports-wear has
//     `comingSoon: true`, so real visitors are bounced to /coming-soon.
//   - /same-day-delivery/[slug] and /corporate-gifting/[slug] — orphaned;
//     the pages meant to link into them don't actually point there.
//   - /services/embroidery, /services/dtf-printing — linked from the
//     services page but the folders don't exist (404 today).
export default function sitemap(): MetadataRoute.Sitemap {
  const BASE_URL = "https://cluesstyle.com";

  return getAllSitemapUrls().map(({ href, priority, changeFrequency }) => ({
    url: `${BASE_URL}${href}`,
    priority,
    changeFrequency,
  }));
}