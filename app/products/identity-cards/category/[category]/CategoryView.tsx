"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { FaBoxes, FaStar, FaTruck } from "react-icons/fa";
import type { Product } from "@/app/lib/id-cards";
import type { IdCategory } from "../../categories";

// ================== PRODUCT CARD ==================

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function ProductCard({ product }: { product: Product }) {
  const slug = product.slug.replace(/^\//, "");
  const firstImage = product.images?.[0];
  const secondImage = product.media?.find((m) => m.type === "image")?.src ?? product.images?.[1] ?? firstImage;

  return (
    <Link href={`/products/identity-cards/${slug}`} className="group block h-full">
      <div className="relative h-64 sm:h-95 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1">
        {product.badge && (
          <span className="absolute top-3 left-3 z-10 bg-[#00a63e] text-white text-[10px] font-bold px-2 py-1 rounded">
            {product.badge}
          </span>
        )}

        {/* Image slider */}
        <div className="relative h-full w-full overflow-hidden">
          <div className="flex h-full w-[200%] transition-transform duration-700 ease-in-out group-hover:-translate-x-1/2">
            <div className="relative h-full w-full">
              {firstImage && <Image src={firstImage} alt={product.name} fill className="object-contain p-4 sm:p-6" />}
            </div>
            <div className="relative h-full w-full">
              {secondImage && <Image src={secondImage} alt={product.name} fill className="object-contain p-4 sm:p-6" />}
            </div>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
          <div className="bg-white/20 backdrop-blur-md border-t border-white/30 px-3 py-3">
            <h3 className="text-xs sm:text-sm font-bold text-black leading-snug line-clamp-1 drop-shadow">
              {product.name}
            </h3>
            <div className="mt-0.5 text-xs text-black/80 drop-shadow">
              Min qty: {product.quantityReq}+ · {formatPrice(product.displayPrice)}
            </div>
            <button className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-full bg-white py-1.5 text-xs font-bold text-gray-900 shadow-md transition hover:bg-black hover:text-white">
              <i className="fas fa-shopping-bag text-xs"></i>
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* Title row */}
      <div className="mt-2.5 px-1 flex items-center justify-between">
        <p className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 flex-1 mr-2">{product.name}</p>
        <span className="text-xs sm:text-sm font-black text-gray-700 flex-shrink-0">
          {formatPrice(product.displayPrice)}
        </span>
      </div>
      <p className="px-1 mt-0.5 text-xs text-gray-400">Min qty: {product.quantityReq}+</p>
    </Link>
  );
}

// ================== SIDEBAR CONTENT ==================

function SidebarContent({
  printMethods,
  selectedPrintMethod,
  setSelectedPrintMethod,
  tempMinPrice,
  tempMaxPrice,
  minPrice,
  maxPrice,
  globalMinPrice,
  globalMaxPrice,
  handleMinPriceChange,
  handleMaxPriceChange,
  applyPriceRange,
  resetPriceRange,
  setTempMinPrice,
  setTempMaxPrice,
  onLinkClick,
}: {
  printMethods: string[];
  selectedPrintMethod: string;
  setSelectedPrintMethod: (v: string) => void;
  tempMinPrice: number;
  tempMaxPrice: number;
  minPrice: number;
  maxPrice: number;
  globalMinPrice: number;
  globalMaxPrice: number;
  handleMinPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMaxPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  applyPriceRange: () => void;
  resetPriceRange: () => void;
  setTempMinPrice: (n: number) => void;
  setTempMaxPrice: (n: number) => void;
  onLinkClick?: () => void;
}) {
  const priceSpan = Math.max(1, globalMaxPrice - globalMinPrice);

  return (
    <div className="px-5 py-6">
      {/* Print method filter */}
      {printMethods.length > 1 && (
        <div className="mb-7">
          <h2 className="inline-block border-b-2 border-black pb-1 text-base font-black tracking-tight mb-4">
            Print Method
          </h2>
          <div className="flex flex-col gap-2">
            {printMethods.map((method) => (
              <button
                key={method}
                onClick={() => {
                  setSelectedPrintMethod(method);
                  onLinkClick?.();
                }}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                  selectedPrintMethod === method
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white hover:border-black"
                }`}
              >
                {method === "all" ? "All Types" : method}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price range filter */}
      <div className="mb-6">
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold">
          <i className="fas fa-filter text-sm"></i> Price Range
        </h3>

        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">{formatPrice(minPrice)}</span>
          <span className="text-gray-400">—</span>
          <span className="font-medium text-gray-700">{formatPrice(maxPrice)}</span>
        </div>

        <div className="relative mb-6 h-1 rounded-full bg-gray-200">
          <div
            className="absolute h-1 rounded-full bg-black"
            style={{
              left: `${((tempMinPrice - globalMinPrice) / priceSpan) * 100}%`,
              right: `${100 - ((tempMaxPrice - globalMinPrice) / priceSpan) * 100}%`,
            }}
          />
          <input
            type="range"
            min={globalMinPrice}
            max={globalMaxPrice}
            value={tempMinPrice}
            onChange={handleMinPriceChange}
            onMouseUp={applyPriceRange}
            onTouchEnd={applyPriceRange}
            className="absolute -top-2 w-full appearance-none bg-transparent pointer-events-none
              [&::-webkit-slider-thumb]:pointer-events-auto
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-black
              [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
              [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
            style={{ zIndex: tempMinPrice > globalMinPrice ? 2 : 1 }}
          />
          <input
            type="range"
            min={globalMinPrice}
            max={globalMaxPrice}
            value={tempMaxPrice}
            onChange={handleMaxPriceChange}
            onMouseUp={applyPriceRange}
            onTouchEnd={applyPriceRange}
            className="absolute -top-2 w-full appearance-none bg-transparent pointer-events-none
              [&::-webkit-slider-thumb]:pointer-events-auto
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-black
              [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
              [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
            style={{ zIndex: tempMaxPrice < globalMaxPrice ? 2 : 1 }}
          />
        </div>

        <div className="mb-3 flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Min</label>
            <input
              type="number"
              value={tempMinPrice}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val <= tempMaxPrice) setTempMinPrice(val);
              }}
              onBlur={applyPriceRange}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Max</label>
            <input
              type="number"
              value={tempMaxPrice}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= tempMinPrice) setTempMaxPrice(val);
              }}
              onBlur={applyPriceRange}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
            />
          </div>
        </div>

        <button onClick={resetPriceRange} className="text-xs text-gray-500 underline hover:text-black">
          Reset price range
        </button>
      </div>
    </div>
  );
}

// ================== MAIN VIEW ==================

export default function CategoryView({
  category,
  allCategories,
  products,
}: {
  category: IdCategory;
  allCategories: IdCategory[];
  products: Product[];
}) {
  const prices = products.map((p) => p.displayPrice);
  const globalMinPrice = prices.length ? Math.min(...prices) : 0;
  const globalMaxPrice = prices.length ? Math.max(...prices) : 1000;

  const printMethods = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.printMethod) set.add(p.printMethod);
    });
    return set.size > 0 ? ["all", ...Array.from(set)] : ["all"];
  }, [products]);

  const [minPrice, setMinPrice] = useState(globalMinPrice);
  const [maxPrice, setMaxPrice] = useState(globalMaxPrice);
  const [tempMinPrice, setTempMinPrice] = useState(globalMinPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState(globalMaxPrice);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrintMethod, setSelectedPrintMethod] = useState("all");

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

  useEffect(() => {
    setMinPrice(globalMinPrice);
    setMaxPrice(globalMaxPrice);
    setTempMinPrice(globalMinPrice);
    setTempMaxPrice(globalMaxPrice);
  }, [globalMinPrice, globalMaxPrice]);

  const matchesPriceFilter = useCallback(
    (p: Product) => p.displayPrice >= minPrice && p.displayPrice <= maxPrice,
    [minPrice, maxPrice]
  );
  const matchesSearch = useCallback(
    (p: Product) => searchQuery.trim() === "" || p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    [searchQuery]
  );
  const matchesPrintMethod = useCallback(
    (p: Product) => selectedPrintMethod === "all" || p.printMethod === selectedPrintMethod,
    [selectedPrintMethod]
  );

  const filteredProducts = products.filter(
    (p) => matchesPriceFilter(p) && matchesSearch(p) && matchesPrintMethod(p)
  );

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => setTempMinPrice(parseInt(e.target.value, 10));
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => setTempMaxPrice(parseInt(e.target.value, 10));
  const applyPriceRange = () => {
    if (tempMinPrice <= tempMaxPrice) {
      setMinPrice(tempMinPrice);
      setMaxPrice(tempMaxPrice);
    }
  };
  const resetPriceRange = () => {
    setMinPrice(globalMinPrice);
    setMaxPrice(globalMaxPrice);
    setTempMinPrice(globalMinPrice);
    setTempMaxPrice(globalMaxPrice);
  };
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedPrintMethod("all");
    resetPriceRange();
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen || isFilterModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen, isFilterModalOpen]);

  const activeFilterCount = [
    selectedPrintMethod !== "all",
    minPrice !== globalMinPrice || maxPrice !== globalMaxPrice,
  ].filter(Boolean).length;

  const sidebarProps = {
    printMethods,
    selectedPrintMethod,
    setSelectedPrintMethod,
    tempMinPrice,
    tempMaxPrice,
    minPrice,
    maxPrice,
    globalMinPrice,
    globalMaxPrice,
    handleMinPriceChange,
    handleMaxPriceChange,
    applyPriceRange,
    resetPriceRange,
    setTempMinPrice,
    setTempMaxPrice,
  };

  const otherCategories = allCategories.filter((c) => c.slug !== category.slug);

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
        <SidebarContent {...sidebarProps} onLinkClick={() => setIsSidebarOpen(false)} />
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
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black tracking-tight">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="text-xs text-gray-500 underline hover:text-black">
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 text-sm font-bold"
              aria-label="Close filters"
            >
              ✕
            </button>
          </div>
        </div>
        <SidebarContent {...sidebarProps} onLinkClick={() => setIsFilterModalOpen(false)} />
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4">
          <button
            onClick={() => setIsFilterModalOpen(false)}
            className="w-full rounded-2xl bg-black py-3.5 text-sm font-bold text-white transition hover:bg-gray-800"
          >
            Show {filteredProducts.length} Products
          </button>
        </div>
      </div>

      {/* ══════════════ DESKTOP LAYOUT ══════════════ */}
      <div className="hidden lg:flex bg-gray-50" style={{ height: `calc(100vh - ${headerHeight}px)` }}>
        <aside className="w-[280px] flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          <SidebarContent {...sidebarProps} />
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
                    {category.name}
                  </h1>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600">{category.description}</p>
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
                        placeholder={`Search ${category.name.toLowerCase()}...`}
                        className="h-14 w-full rounded-2xl border-2 border-gray-300 bg-white pl-12 pr-4 text-sm outline-none transition-all focus:border-black focus:ring-2 focus:ring-black/10"
                      />
                    </div>
                    <div className="mb-2 mt-6 flex items-center gap-2 text-sm text-gray-500">
                      <Link href="/" className="transition-colors hover:text-black">Home</Link>
                      <span>/</span>
                      <Link href="/products/identity-cards" className="transition-colors hover:text-black">Identity Cards</Link>
                      <span>/</span>
                      <span className="font-semibold text-black">{category.name}</span>
                    </div>
                  </div>
                </div>
                <div className="relative min-h-[320px] overflow-hidden bg-black">
                  <Image src={category.image} alt={category.name} fill className="object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                </div>
              </div>
            </div>

            {/* Filter bar */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm font-medium">
                  {filteredProducts.length} products
                </span>
                {otherCategories.map((c) => (
                  <Link key={c.slug} href={`/products/identity-cards/category/${c.slug}`}>
                    <span className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm font-medium hover:border-black">
                      {c.name}
                    </span>
                  </Link>
                ))}
                <button onClick={clearAllFilters} className="text-xs text-gray-500 underline hover:text-black">
                  Clear all filters
                </button>
              </div>
              <div className="text-xs text-gray-500">
                <i className="fas fa-check-circle text-green-600"></i> authentic prints · fast turnaround
              </div>
            </div>

            {/* Product grid */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <i className="fas fa-box-open text-5xl text-gray-300"></i>
                <p className="mt-3 font-medium text-gray-500">No products match the selected filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ══════════════ MOBILE LAYOUT ══════════════ */}
      <div className="lg:hidden min-h-screen bg-gray-50">
        <div className="relative overflow-hidden bg-black" style={{ minHeight: 220 }}>
          <Image src={category.image} alt={category.name} fill className="object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
          <div className="relative z-10 flex flex-col justify-end h-full px-5 py-6" style={{ minHeight: 220 }}>
            <div className="mb-2 inline-flex w-fit items-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Identity Cards
            </div>
            <h1 className="text-2xl font-black leading-tight text-white">{category.name}</h1>
            <p className="mt-1.5 text-xs text-white/80 max-w-xs">{category.description}</p>
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
                placeholder="Search..."
                className="w-full h-10 rounded-xl border-2 border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-black focus:bg-white"
              />
            </div>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="relative flex-shrink-0 flex items-center gap-1.5 h-10 px-4 rounded-xl border-2 border-black bg-black text-white text-sm font-bold transition active:scale-95"
              aria-label="Open filters"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2M9 16h6" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {activeFilterCount > 0 && (
            <div className="px-4 pb-2.5 flex flex-wrap gap-1.5">
              {selectedPrintMethod !== "all" && (
                <span className="flex items-center gap-1 rounded-full bg-black text-white text-xs font-medium px-2.5 py-1">
                  {selectedPrintMethod}
                  <button onClick={() => setSelectedPrintMethod("all")} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
                </span>
              )}
              {(minPrice !== globalMinPrice || maxPrice !== globalMaxPrice) && (
                <span className="flex items-center gap-1 rounded-full bg-black text-white text-xs font-medium px-2.5 py-1">
                  {formatPrice(minPrice)} – {formatPrice(maxPrice)}
                  <button onClick={resetPriceRange} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
          </span>
          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className="text-xs text-gray-400 underline hover:text-black">
              Clear all
            </button>
          )}
        </div>

        <div className="px-3 pb-8">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <i className="fas fa-box-open text-4xl text-gray-200"></i>
              <p className="mt-3 text-sm font-medium text-gray-400">No products match your filters.</p>
              <button
                onClick={clearAllFilters}
                className="mt-3 rounded-xl border-2 border-black px-4 py-2 text-xs font-bold transition hover:bg-black hover:text-white"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
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
              {
                "@type": "ListItem",
                position: 3,
                name: category.name,
                item: `https://cluesstyle.com/products/identity-cards/category/${category.slug}`,
              },
            ],
          }),
        }}
      />
    </>
  );
}
