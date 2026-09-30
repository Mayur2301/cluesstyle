"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { FaBoxes, FaStar, FaTruck } from "react-icons/fa";
import type { IdCategory } from "./categories";

// ================== SIDEBAR CONTENT ==================

function SidebarContent({
  categories,
  searchQuery,
  onLinkClick,
}: {
  categories: IdCategory[];
  searchQuery: string;
  onLinkClick?: () => void;
}) {
  return (
    <div className="px-5 py-6">
      <div className="mb-7">
        <h2 className="inline-block border-b-2 border-black pb-1 text-base font-black tracking-tight mb-4">
          Browse by Category
        </h2>
        <div className="flex flex-col gap-2">
          <Link
            href="/products/identity-cards"
            onClick={() => onLinkClick?.()}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
              !searchQuery ? "border-black bg-black text-white" : "border-gray-200 bg-white hover:border-black"
            }`}
          >
            All Categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products/identity-cards/category/${cat.slug}`}
              onClick={() => onLinkClick?.()}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium transition-all hover:border-black"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* <div className="border-t border-gray-100 pt-5">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Need help choosing?</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Corporate cards suit offices &amp; employee badges. School cards suit student/staff IDs.
          Event cards suit conferences &amp; access passes.
        </p>
      </div> */}
    </div>
  );
}

// ================== CATEGORY CARD ==================

function CategoryCard({ category }: { category: IdCategory }) {
  const firstImage = category.image;
  const secondImage = category.image2 ?? category.image;

  return (
    <Link href={`/products/identity-cards/category/${category.slug}`} className="group block h-full">
      <div className="relative h-64 sm:h-95 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1">
        {/* Image slider */}
        <div className="relative h-full w-full overflow-hidden">
          <div className="flex h-full w-[200%] transition-transform duration-700 ease-in-out group-hover:-translate-x-1/2">
            <div className="relative h-full w-full">
              <Image src={firstImage} alt={category.name} fill className="object-cover" />
            </div>
            <div className="relative h-full w-full">
              <Image src={secondImage} alt={category.name} fill className="object-cover" />
            </div>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
          <div className="bg-white/20 backdrop-blur-md border-t border-white/30 px-3 py-3">
            <h3 className="text-xs sm:text-sm font-bold text-black leading-snug line-clamp-1 drop-shadow">
              {category.name}
            </h3>
            <div className="mt-0.5 text-xs text-black/80 drop-shadow line-clamp-1">{category.description}</div>
            <button className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-full bg-white py-1.5 text-xs font-bold text-gray-900 shadow-md transition hover:bg-black hover:text-white">
              <i className="fas fa-arrow-right text-xs"></i>
              Browse Category
            </button>
          </div>
        </div>
      </div>

      {/* Title row */}
      <div className="mt-2.5 px-1">
        <p className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">{category.name}</p>
        <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{category.description}</p>
      </div>
    </Link>
  );
}

// ================== MAIN PAGE ==================

export default function IdentityCardsView({ categories }: { categories: IdCategory[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(72);

  useEffect(() => {
    const measure = () => {
      const header = document.querySelector("header");
      if (header) setHeaderHeight(header.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const heroImage = categories[0]?.image;

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  return (
    <>
      {/* ══════════════ DESKTOP: overlay + drawer ══════════════ */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-[280px] overflow-y-auto border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-xl font-black tracking-tight">Cluesstyle</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        <SidebarContent categories={categories} searchQuery={searchQuery} onLinkClick={() => setIsSidebarOpen(false)} />
      </aside>

      {/* ══════════════ MOBILE FILTER MODAL ══════════════ */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isFilterModalOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsFilterModalOpen(false)}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isFilterModalOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "85vh", overflowY: "auto" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 sticky top-0 bg-white z-10">
          <h2 className="text-base font-black tracking-tight">Categories</h2>
          <button
            onClick={() => setIsFilterModalOpen(false)}
            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 text-sm font-bold"
            aria-label="Close categories"
          >
            ✕
          </button>
        </div>
        <SidebarContent categories={categories} searchQuery={searchQuery} onLinkClick={() => setIsFilterModalOpen(false)} />
      </div>

      {/* ══════════════ DESKTOP LAYOUT ══════════════ */}
      <div className="hidden lg:flex bg-gray-50" style={{ height: `calc(100vh - ${headerHeight}px)` }}>
        <aside className="w-[280px] flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          <SidebarContent categories={categories} searchQuery={searchQuery} />
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar">
          <div className="p-6 lg:p-8">
            {/* Hero banner */}
            <div className="mb-8 overflow-hidden rounded-3xl border-2 border-black bg-white shadow-[6px_6px_0px_#000] transition-all hover:shadow-[8px_8px_0px_#000]">
              <div className="grid min-h-[420px] grid-cols-1 lg:grid-cols-2">
                <div className="flex flex-col justify-center p-6 md:p-10">
                  <div className="mb-3 inline-flex w-fit items-center rounded-full border border-black bg-black px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Identity Cards
                  </div>
                  <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">
                    Identity Cards<br />
                    <span className="text-gray-500">Built for Every Occasion</span>
                  </h1>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600">
                    Durable PVC identity cards for corporates, schools and events — QR codes,
                    photo slots, and optional RFID, with fast turnaround and bulk pricing.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {[
                      { icon: <FaStar />, text: "Premium Quality" },
                      { icon: <FaBoxes />, text: "Bulk Orders" },
                      { icon: <FaTruck />, text: "Fast Delivery" },
                    ].map((item) => (
                      <div
                        key={item.text}
                        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm"
                      >
                        <span className="text-black">{item.icon}</span>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8">
                    <div className="relative">
                      <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search categories..."
                        className="h-14 w-full rounded-2xl border-2 border-gray-300 bg-white pl-12 pr-4 text-sm outline-none transition-all focus:border-black focus:ring-2 focus:ring-black/10"
                      />
                    </div>
                    <div className="mb-2 mt-6 flex items-center gap-2 text-sm text-gray-500">
                      <Link href="/" className="transition-colors hover:text-black">Home</Link>
                      <span>/</span>
                      <span className="font-semibold text-black">Identity Cards</span>
                    </div>
                  </div>
                </div>
                <div className="relative min-h-[320px] overflow-hidden bg-black">
                  {heroImage && (
                    <Image src={heroImage} alt="Identity Cards" fill className="object-cover opacity-80" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                </div>
              </div>
            </div>

            {/* Category count row */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm font-medium">
                  {filteredCategories.length} categories
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-gray-500 underline hover:text-black"
                  >
                    Clear search
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500">
                <i className="fas fa-check-circle text-green-600"></i> authentic prints · fast turnaround
              </div>
            </div>

            {/* Category grid */}
            {filteredCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <i className="fas fa-box-open text-5xl text-gray-300"></i>
                <p className="mt-3 font-medium text-gray-500">No categories match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCategories.map((category) => (
                  <CategoryCard key={category.slug} category={category} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ══════════════ MOBILE LAYOUT ══════════════ */}
      <div className="lg:hidden min-h-screen bg-gray-50">
        <div className="relative overflow-hidden bg-black" style={{ minHeight: 220 }}>
          {heroImage && <Image src={heroImage} alt="Identity Cards" fill className="object-cover opacity-60" />}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
          <div className="relative z-10 flex flex-col justify-end h-full px-5 py-6" style={{ minHeight: 220 }}>
            <div className="mb-2 inline-flex w-fit items-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Identity Cards
            </div>
            <h1 className="text-2xl font-black leading-tight text-white">
              Identity Cards <br />
              <span className="text-white/70">Built for Every Occasion</span>
            </h1>
            <p className="mt-1.5 text-xs text-white/80 max-w-xs">
              Corporate, school &amp; event ID cards — fast turnaround, bulk pricing.
            </p>
          </div>
        </div>

        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3 flex items-center gap-2">
            <div className="relative flex-1">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full h-10 rounded-xl border-2 border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-black focus:bg-white"
              />
            </div>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="relative flex-shrink-0 flex items-center gap-1.5 h-10 px-4 rounded-xl border-2 border-black bg-black text-white text-sm font-bold transition active:scale-95"
              aria-label="Open categories"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2M9 16h6" />
              </svg>
              Categories
            </button>
          </div>
        </div>

        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">
            {filteredCategories.length} categor{filteredCategories.length !== 1 ? "ies" : "y"}
          </span>
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-xs text-gray-400 underline hover:text-black">
              Clear search
            </button>
          )}
        </div>

        <div className="px-3 pb-8">
          {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <i className="fas fa-box-open text-4xl text-gray-200"></i>
              <p className="mt-3 text-sm font-medium text-gray-400">No categories match your search.</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 rounded-xl border-2 border-black px-4 py-2 text-xs font-bold transition hover:bg-black hover:text-white"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredCategories.map((category) => (
                <CategoryCard key={category.slug} category={category} />
              ))}
            </div>
          )}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://cluesstyle.com" },
              { "@type": "ListItem", position: 2, name: "Identity Cards", item: "https://cluesstyle.com/products/identity-cards" },
            ],
          }),
        }}
      />
    </>
  );
}