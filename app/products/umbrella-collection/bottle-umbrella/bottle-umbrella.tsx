// app/services/screen-printing/t-shirt/screen-printing.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { FaBoxes, FaStar, FaTruck } from "react-icons/fa";

// ================== TYPES ==================
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  priceLabel: string;
  // img: string;
  quantityReq: number;
  priceRange: "budget" | "mid" | "premium";
  category: string;
  size: string;
  images: string[]; // <-- replace img
  description?: string;
  features?: string[];
  material?: string;
  turnaround?: string;
}

// ================== MOCK DATA ==================
const productsData: Product[] = [
  {
    id: "1",
    name: "Red and White Promotional Cap",
    slug: "red-and-white-promotional-cap",
    price: 499,
    priceLabel: "₹499",
    images: [
    "/umbrella-after.png",
    "/umbrella-after.png",
   
  ],
    quantityReq: 10,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
  },
  
 
  


];

const sizes = ["all", '12" x 12"', '18" x 15"', '24" x 18"'];

// ================== SIDEBAR CONTENT (shared) ==================
function SidebarContent({
  tempMinPrice,
  tempMaxPrice,
  minPrice,
  maxPrice,
  globalMinPrice,
  globalMaxPrice,
  formatPrice,
  handleMinPriceChange,
  handleMaxPriceChange,
  applyPriceRange,
  resetPriceRange,
  setTempMinPrice,
  setTempMaxPrice,
  selectedSize,
  setSelectedSize,
  onLinkClick,
}: {
  tempMinPrice: number;
  tempMaxPrice: number;
  minPrice: number;
  maxPrice: number;
  globalMinPrice: number;
  globalMaxPrice: number;
  formatPrice: (n: number) => string;
  handleMinPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMaxPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  applyPriceRange: () => void;
  resetPriceRange: () => void;
  setTempMinPrice: (n: number) => void;
  setTempMaxPrice: (n: number) => void;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  onLinkClick?: () => void;
}) {
  return (
    <div className="px-5 py-6">
      {/* Size Filter */}
      <div className="mb-7">
        <h2 className="inline-block border-b-2 border-black pb-1 text-base font-black tracking-tight mb-4">
          Office Bag Size
        </h2>
        <div className="flex flex-col gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => { setSelectedSize(size); onLinkClick?.(); }}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all
                ${selectedSize === size
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white hover:border-black"
                }`}
            >
              {size === "all" ? "All Sizes" : size}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
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
              left: `${((tempMinPrice - globalMinPrice) / (globalMaxPrice - globalMinPrice)) * 100}%`,
              right: `${100 - ((tempMaxPrice - globalMinPrice) / (globalMaxPrice - globalMinPrice)) * 100}%`,
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
                const val = parseInt(e.target.value);
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
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= tempMinPrice) setTempMaxPrice(val);
              }}
              onBlur={applyPriceRange}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={resetPriceRange}
          className="text-xs text-gray-500 underline hover:text-black"
        >
          Reset price range
        </button>
      </div>
    </div>
  );
}

// ================== PRODUCT CARD ==================
function ProductCard({ product }: { product: Product }) {
  return (
    <Link
  href={`/products/umbrella-collection/bottle-umbrella/${product.slug}`}
  className="group block h-full"
>
  <div className="relative h-64 sm:h-95 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1">

    {/* Image Slider */}
    <div className="relative h-full w-full overflow-hidden">
      <div className="flex h-full w-[200%] transition-transform duration-700 ease-in-out group-hover:-translate-x-1/2">

        <div className="relative h-full w-full">
          <Image
             src={product.images[0]}
             alt={product.name}
            
            fill
            className="object-contain p-4 sm:p-6"
          />
        </div>

        <div className="relative h-full w-full">
          <Image
             src={product.images[1]}
            alt={product.name}
           
            fill
            className="object-contain p-4 sm:p-6"
          />
        </div>

      </div>
    </div>

    {/* ORIGINAL OVERLAY FROM YOUR CODE */}
    <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
      <div className="bg-white/20 backdrop-blur-md border-t border-white/30 px-3 py-3">
        <h3 className="text-xs sm:text-sm font-bold text-black leading-snug line-clamp-1 drop-shadow">
          {product.name}
        </h3>
        <div className="mt-0.5 text-xs text-black/80 drop-shadow">
          Min qty: {product.quantityReq}+ · {product.priceLabel}
        </div>
        <button className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-full bg-white py-1.5 text-xs font-bold text-gray-900 shadow-md transition hover:bg-black hover:text-white">
          <i className="fas fa-shopping-bag text-xs"></i>
          Shop Now
        </button>
      </div>
    </div>

  </div>

  {/* ORIGINAL TITLE SECTION */}
  <div className="mt-2.5 px-1 flex items-center justify-between">
    <p className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 flex-1 mr-2">
      {product.name}
    </p>
    <span className="text-xs sm:text-sm font-black text-gray-700 flex-shrink-0">
      {product.priceLabel}
    </span>
  </div>

  <p className="px-1 mt-0.5 text-xs text-gray-400">
    Min qty: {product.quantityReq}+
  </p>
</Link>
  );
}

// ================== MAIN COMPONENT ==================
export default function BottleUmbrella() {
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [tempMinPrice, setTempMinPrice] = useState<number>(0);
  const [tempMaxPrice, setTempMaxPrice] = useState<number>(10000);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(productsData);

  // Desktop sidebar drawer
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Mobile filter modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  const [headerHeight, setHeaderHeight] = useState<number>(72);
  const [selectedSize, setSelectedSize] = useState<string>("all");

  const allPrices = productsData.map((p) => p.price);
  const globalMinPrice = Math.min(...allPrices);
  const globalMaxPrice = Math.max(...allPrices);

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
    (p: Product) => p.price >= minPrice && p.price <= maxPrice,
    [minPrice, maxPrice]
  );
  const matchesSearch = useCallback(
    (p: Product) =>
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    [searchQuery]
  );
  const matchesSize = useCallback(
    (p: Product) => selectedSize === "all" || p.size === selectedSize,
    [selectedSize]
  );

  const applyFilters = useCallback(() => {
    setFilteredProducts(
      productsData.filter((p) => matchesPriceFilter(p) && matchesSearch(p) && matchesSize(p))
    );
  }, [matchesPriceFilter, matchesSearch, matchesSize]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTempMinPrice(parseInt(e.target.value));
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTempMaxPrice(parseInt(e.target.value));
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
    setSelectedSize("all");
    resetPriceRange();
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when either modal is open
  useEffect(() => {
    document.body.style.overflow = (isSidebarOpen || isFilterModalOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isSidebarOpen, isFilterModalOpen]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0,
    }).format(price);

  const activeFilterCount = [
    selectedSize !== "all",
    minPrice !== globalMinPrice || maxPrice !== globalMaxPrice,
  ].filter(Boolean).length;

  const sidebarProps = {
    tempMinPrice, tempMaxPrice, minPrice, maxPrice,
    globalMinPrice, globalMaxPrice, formatPrice,
    handleMinPriceChange, handleMaxPriceChange,
    applyPriceRange, resetPriceRange,
    setTempMinPrice, setTempMaxPrice,
    selectedSize, setSelectedSize,
  };

  return (
    <>
      {/* ══════════════════════════════════════════════
          DESKTOP: overlay + drawer (existing behaviour)
      ══════════════════════════════════════════════ */}
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
          >✕</button>
        </div>
        <SidebarContent {...sidebarProps} onLinkClick={() => setIsSidebarOpen(false)} />
      </aside>

      {/* ══════════════════════════════════════════════
          MOBILE FILTER MODAL (bottom sheet)
      ══════════════════════════════════════════════ */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isFilterModalOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsFilterModalOpen(false)}
      />
      {/* Bottom sheet panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isFilterModalOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "85vh", overflowY: "auto" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        {/* Header */}
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
              <button
                onClick={() => { clearAllFilters(); }}
                className="text-xs text-gray-500 underline hover:text-black"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 text-sm font-bold"
              aria-label="Close filters"
            >✕</button>
          </div>
        </div>
        {/* Filter content */}
        <SidebarContent {...sidebarProps} onLinkClick={() => setIsFilterModalOpen(false)} />
        {/* Apply button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4">
          <button
            onClick={() => setIsFilterModalOpen(false)}
            className="w-full rounded-2xl bg-black py-3.5 text-sm font-bold text-white transition hover:bg-gray-800"
          >
            Show {filteredProducts.length} Products
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          DESKTOP LAYOUT
      ══════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex bg-gray-50"
        style={{ height: `calc(100vh - ${headerHeight}px)` }}
      >
        {/* LEFT SIDEBAR */}
        <aside className="w-[280px] flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          <SidebarContent {...sidebarProps} />
        </aside>

        {/* RIGHT CONTENT */}
        <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar">
          <div className="p-6 lg:p-8">
            {/* Top Banner */}

            
            <div className="mb-8 overflow-hidden rounded-3xl border-2 border-black bg-white shadow-[6px_6px_0px_#000] transition-all hover:shadow-[8px_8px_0px_#000]">
              <div className="grid min-h-[420px] grid-cols-1 lg:grid-cols-2">
                <div className="flex flex-col justify-center p-6 md:p-10">
                  <div className="mb-3 inline-flex w-fit items-center rounded-full border border-black bg-black px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                     Latest Bottle Umbrella Collection
                  </div>
                  <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">
                     Get Newly Morder Style Umbrella<br />
                    <span className="text-gray-500">Easy to Carry</span>
                  </h1>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600">
                    Premium corporate office bags for modern professionals, offering style, durability, comfort, and smart organization for everyday work needs.
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
                    {/* search bar */}
                    {/* <div className="relative">
                      <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tote bags..."
                        className="h-14 w-full rounded-2xl border-2 border-gray-300 bg-white pl-12 pr-4 text-sm outline-none transition-all focus:border-black focus:ring-2 focus:ring-black/10"
                      />
                    </div> */}
                    <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                    <Link
                      href="/"
                      className="transition-colors hover:text-black"
                    >
                      Home
                    </Link>

                    <span>/</span>

                    <Link
                      href="/products"
                      className="transition-colors hover:text-black"
                    >
                      Products
                    </Link>

                            

                    <span>/</span>


                    <Link
                      href="/products/umbrella-collection"
                      className="transition-colors hover:text-black"
                    >
                      Umbrella Collection
                    </Link>

                            

                    <span>/</span>
                    <span className="font-semibold text-black">
                  Bottle Umbrella
                    </span>
                  </div>
                    {/* <p className="mt-2 text-xs text-gray-400">Try: "Premium", "Prime", "Canvas"</p> */}
                  </div>
                </div>
                <div className="relative min-h-[320px] overflow-hidden bg-black">
                  <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
                    <source src="/bottle-umbrella.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  {/* <div className="absolute bottom-6 left-6 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/70">Starting From</p>
                    <h3 className="mt-1 text-3xl font-black text-white">₹499</h3>
                    <p className="mt-1 text-sm text-white/80">Premium Screen Printed Tote Bags</p>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Filter bar */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm font-medium">
                  {filteredProducts.length} products
                </span>
                
                <button onClick={clearAllFilters} className="text-xs text-gray-500 underline hover:text-black">
                  Clear all filters
                </button>
              </div>
              <div className="text-xs text-gray-500">
                <i className="fas fa-check-circle text-green-600"></i> authentic prints · eco-friendly
              </div>
            </div>

            {/* Product Grid */}
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

      {/* ══════════════════════════════════════════════
          MOBILE LAYOUT — desktop-like structure
      ══════════════════════════════════════════════ */}
      <div className="lg:hidden min-h-screen bg-gray-50">

        {/* Mobile Hero Banner */}
        <div className="relative overflow-hidden bg-black" style={{ minHeight: 220 }}>
          <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-60">
            <source src="/3d-mockup-of-cap.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
          <div className="relative z-10 flex flex-col justify-end h-full px-5 py-6" style={{ minHeight: 220 }}>
            <div className="mb-2 inline-flex w-fit items-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
             Latest Bottle Umbrella Collection
            </div>
            <h1 className="text-2xl font-black leading-tight text-white">
             Get Newly Morder Style Umbrella <br />
              <span className="text-white/70">Easy to Carry</span>
            </h1>
            <p className="mt-1.5 text-xs text-white/80 max-w-xs">
              Screen printing for brands, events & businesses. Starting ₹499.
            </p>
          </div>
        </div>

        {/* Mobile Search + Filter bar — sticky */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3 flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tote bags..."
                className="w-full h-10 rounded-xl border-2 border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-black focus:bg-white"
              />
            </div>

            {/* Filter button */}
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

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="px-4 pb-2.5 flex flex-wrap gap-1.5">
              {selectedSize !== "all" && (
                <span className="flex items-center gap-1 rounded-full bg-black text-white text-xs font-medium px-2.5 py-1">
                  {selectedSize}
                  <button onClick={() => setSelectedSize("all")} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
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

        {/* Product count row */}
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

        {/* Product Grid — 2 columns */}
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
      {/* dcript schema */}

      <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://cluesstyle.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Products",
          item: "https://cluesstyle.com/products",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Cap",
          item: "https://cluesstyle.com/products/cap",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Tote Bags",
          item: "https://cluesstyle.com/products/bags/tote-bag",
        },
      ],
    }),
  }}
/>
    </>
    
  );
}