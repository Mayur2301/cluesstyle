// PATH: app/sitemap/SitemapPage.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SITEMAP_SECTIONS, SCREEN_PRINTING_SECTIONS, SCREEN_PRINTING_SLUGS, type SitemapSection } from "@/app/lib/sitemap-data";

const SCREEN_PRINTING_LABELS: Record<string, string> = {
  "t-shirts": "T-Shirts",
  jersey: "Jersey",
  "hoodies-and-sweatshirt": "Hoodies & Sweatshirts",
};

const SLUG_LABELS: Record<string, string> = {
  "basic-t-shirt-print": "Basic T-Shirt Print",
  "premium-cotton-print": "Premium Cotton Print",
  "bulk-printing-pack": "Bulk Printing Pack",
  "hoodie-print": "Hoodie Print",
  "eco-hoodie-bundle": "Eco Hoodie Bundle",
  "corporate-bulk-kit": "Corporate Bulk Kit",
  "kids-custom-tee": "Kids Custom Tee",
  "premium-oversized-hoodie": "Premium Oversized Hoodie",
};

export default function SitemapPage() {
  const [query, setQuery] = useState("");

  // Screen-printing's product slugs repeat across 3 sections, so build
  // that one section's groups here instead of hand-listing 24 links in
  // the shared data file.
  const screenPrintingSection: SitemapSection = useMemo(
    () => ({
      title: "Screen Printing Products",
      groups: SCREEN_PRINTING_SECTIONS.map((section) => ({
        label: SCREEN_PRINTING_LABELS[section],
        href: `/services/screen-printing/${section}`,
        children: SCREEN_PRINTING_SLUGS.map((slug) => ({
          label: SLUG_LABELS[slug] ?? slug,
          href: `/services/screen-printing/${section}/${slug}`,
        })),
      })),
    }),
    [],
  );

  const allSections = useMemo(() => [...SITEMAP_SECTIONS, screenPrintingSection], [screenPrintingSection]);

  const q = query.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    if (!q) return allSections;
    return allSections
      .map((section) => ({
        ...section,
        links: section.links?.filter((l) => l.label.toLowerCase().includes(q)),
        groups: section.groups
          ?.map((g) => ({
            ...g,
            // Keep the whole group if the group itself matches; otherwise
            // narrow down to just the matching children.
            children: g.label.toLowerCase().includes(q) ? g.children : g.children?.filter((c) => c.label.toLowerCase().includes(q)),
          }))
          .filter((g) => g.label.toLowerCase().includes(q) || (g.children && g.children.length > 0)),
      }))
      .filter((section) => (section.links && section.links.length > 0) || (section.groups && section.groups.length > 0));
  }, [allSections, q]);

  const totalLinks = useMemo(
    () =>
      allSections.reduce((sum, section) => {
        const linkCount = section.links?.length ?? 0;
        const groupCount = section.groups?.reduce((s, g) => s + 1 + (g.children?.length ?? 0), 0) ?? 0;
        return sum + linkCount + groupCount;
      }, 0),
    [allSections],
  );

  return (
    <main className="max-w-[1100px] mx-auto px-5 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sitemap</h1>
        <p className="text-gray-500">
          Every page on CluesStyle, organized by category — {totalLinks}+ links.
        </p>
      </div>

      <div className="mb-10">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages…"
          className="w-full max-w-sm px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>

      {filteredSections.length === 0 ? (
        <p className="text-gray-500">No pages match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {filteredSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
                {section.title}
              </h2>

              {section.links && section.links.length > 0 && (
                <ul className="space-y-2 mb-4">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-[15px] text-gray-700 hover:text-black hover:underline">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {section.groups && section.groups.length > 0 && (
                <div className="space-y-4">
                  {section.groups.map((group) => (
                    <div key={group.href}>
                      <Link href={group.href} className="text-[15px] font-medium text-gray-900 hover:underline">
                        {group.label}
                      </Link>
                      {group.children && group.children.length > 0 && (
                        <ul className="mt-1.5 ml-3 space-y-1.5 border-l border-gray-200 pl-3">
                          {group.children.map((child) => (
                            <li key={child.href}>
                              <Link href={child.href} className="text-sm text-gray-500 hover:text-black hover:underline">
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}