// app/services/screen-printing/t-shirt/screen-printing.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

// ================== TYPES ==================
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  priceLabel: string;
  img: string;
  quantityReq: number;
  priceRange: "budget" | "mid" | "premium";
  category: string;
  description?: string;
  features?: string[];
  material?: string;
  turnaround?: string;
}

// ================== MOCK DATA ==================
const productsData: Product[] = [
  {
    id: "1",
    name: "Basic T-shirt Print",
    slug: "basic-t-shirt-print",
    price: 499,
    priceLabel: "₹499",
    img: "/t-shirt-1.jpg",
    quantityReq: 10,
    priceRange: "budget",
    category: "tshirt",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
  },
  {
    id: "2",
    name: "Premium Cotton Print",
    slug: "premium-cotton-print",
    price: 899,
    priceLabel: "₹899",
    img: "/t-shirt-2.jpg",
    quantityReq: 10,
    priceRange: "budget",
    category: "tshirt",
    description: "Superior quality printing on premium cotton fabric.",
    features: ["Premium Cotton", "Eco-friendly inks", "Soft touch finish", "Color fastness guaranteed"],
    material: "Premium Combed Cotton, 200 GSM",
    turnaround: "7-10 business days",
  },
  {
    id: "3",
    name: "Bulk Printing Pack",
    slug: "bulk-printing-pack",
    price: 4999,
    priceLabel: "₹4999",
    img: "/t-shirt-3.jpg",
    quantityReq: 50,
    priceRange: "mid",
    category: "bulk",
    description: "Special bulk pricing for large orders.",
    features: ["Bulk discount pricing", "Custom packaging", "Free design support", "Express shipping available"],
    material: "Choice of fabric",
    turnaround: "10-14 business days",
  },
  {
    id: "4",
    name: "Hoodie Print",
    slug: "hoodie-print",
    price: 1299,
    priceLabel: "₹1299",
    img: "/products/hoodie.jpg",
    quantityReq: 10,
    priceRange: "mid",
    category: "hoodie",
    description: "Cozy hoodies with vibrant screen prints.",
    features: ["80% Cotton, 20% Polyester", "Kangaroo pocket", "Drawstring hood", "Available in 5+ colors"],
    material: "Cotton-polyester blend, 280 GSM",
    turnaround: "7-10 business days",
  },
  {
    id: "5",
    name: "Eco Hoodie Bundle",
    slug: "eco-hoodie-bundle",
    price: 2899,
    priceLabel: "₹2899",
    img: "/products/hoodie2.jpg",
    quantityReq: 50,
    priceRange: "mid",
    category: "hoodie",
    description: "Eco-friendly hoodies made from recycled materials.",
    features: ["Recycled materials", "Water-based inks", "Carbon-neutral shipping", "Eco-certified"],
    material: "Recycled Polyester Blend, 300 GSM",
    turnaround: "10-14 business days",
  },
  {
    id: "6",
    name: "Corporate Bulk Kit",
    slug: "corporate-bulk-kit",
    price: 8999,
    priceLabel: "₹8999",
    img: "/products/corporate.jpg",
    quantityReq: 100,
    priceRange: "premium",
    category: "corporate",
    description: "Complete corporate merchandise solution.",
    features: ["End-to-end solution", "Premium packaging", "Brand consultation", "Pan India delivery"],
    material: "Premium selection",
    turnaround: "14-21 business days",
  },
  {
    id: "7",
    name: "Kids Custom Tee",
    slug: "kids-custom-tee",
    price: 399,
    priceLabel: "₹399",
    img: "/products/kids.jpg",
    quantityReq: 10,
    priceRange: "budget",
    category: "tshirt",
    description: "Fun and colorful prints for kids.",
    features: ["Soft cotton", "Child-safe inks", "Vibrant colors", "Easy care"],
    material: "Soft Cotton, 160 GSM",
    turnaround: "5-7 business days",
  },
  {
    id: "8",
    name: "Premium Oversized Hoodie",
    slug: "premium-oversized-hoodie",
    price: 1999,
    priceLabel: "₹1999",
    img: "/products/premiumhoodie.jpg",
    quantityReq: 10,
    priceRange: "mid",
    category: "hoodie",
    description: "Trendy oversized hoodie with premium quality print.",
    features: ["Oversized fit", "Heavyweight fabric", "Embroidery option", "Multiple colors"],
    material: "Heavy Cotton, 350 GSM",
    turnaround: "7-10 business days",
  },
];

const getProductImage = (productName: string): string => {
  const imageMap: Record<string, string> = {
    "Basic T-shirt Print": "/products/tshirt1.jpg",
    "Premium Cotton Print": "/products/tshirt2.jpg",
    "Bulk Printing Pack": "/products/tshirt3.jpg",
    "Hoodie Print": "/products/hoodie.jpg",
    "Eco Hoodie Bundle": "/products/hoodie2.jpg",
    "Corporate Bulk Kit": "/products/corporate.jpg",
    "Kids Custom Tee": "/products/kids.jpg",
    "Premium Oversized Hoodie": "/products/premiumhoodie.jpg",
  };
  return imageMap[productName] || "/products/placeholder.jpg";
};

// ================== SIDEBAR CONTENT ==================
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
  onLinkClick?: () => void;
}) {
  const services = [
    { name: "T-shirt Printing", icon: "fa-tshirt", href: "/services/screen-printing/t-shirt" },
    { name: "Hoodie Printing", icon: "fa-vest", href: "/services/screen-printing/hoodie" },
    { name: "Bulk Orders", icon: "fa-boxes", href: "/services/screen-printing/bulk" },
    { name: "Corporate Printing", icon: "fa-building", href: "/services/screen-printing/corporate" },
    { name: "Custom Design", icon: "fa-pen-fancy", href: "/services/custom-design" },
  ];

  return (
    <div className="px-5 py-8">
      {/* Section heading */}
      <div className="mb-6">
        <h2 className="inline-block border-b-2 border-black pb-1 text-xl font-black tracking-tight">
          Services
        </h2>
      </div>

      {/* Services List */}
      <ul className="mb-8 space-y-4 font-medium text-gray-800">
        {services.map((service) => (
          <li key={service.name}>
            <Link
              href={service.href}
              onClick={onLinkClick}
              className="flex items-center gap-3 transition-transform duration-150 hover:translate-x-1 hover:text-black"
            >
              <i className={`fas ${service.icon} w-5 text-base`}></i>
              {service.name}
            </Link>
          </li>
        ))}
      </ul>

      {/* Price Range Filter */}
      <div className="mb-8">
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold">
          <i className="fas fa-filter text-sm"></i> Price Range
        </h3>

        {/* Applied price display */}
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">{formatPrice(minPrice)}</span>
          <span className="text-gray-400">—</span>
          <span className="font-medium text-gray-700">{formatPrice(maxPrice)}</span>
        </div>

        {/* Dual range track */}
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

        {/* Min / Max inputs */}
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

      {/* Trust badge */}
      <div className="border-t border-gray-200 pt-4 text-xs text-gray-500">
        <p><i className="fas fa-truck-fast mr-1"></i> Free design support</p>
        <p className="mt-1"><i className="fas fa-shield-alt mr-1"></i> Bulk discounts up to 30%</p>
      </div>
    </div>
  );
}

// ================== PRODUCT CARD ==================
function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/services/screen-printing/t-shirts/${product.slug}`}
      className="group block h-full"
    >
      <div className="relative h-85 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1">

        {/* 3D Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-black text-gray-700 shadow-sm border border-gray-100">
          3D
        </div>

        {/* Image — always visible, fills the card */}
        <Image
          src={getProductImage(product.name)}
          alt={product.name}
          fill
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />

        {/* Content overlay — hidden by default, slides up on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
          {/* Glassmorphism content panel */}
          <div className="bg-white/20 backdrop-blur-md border-t border-white/30 px-4 py-4">
            <h3 className="text-sm font-bold text-black leading-snug line-clamp-1 drop-shadow">
              {product.name}
            </h3>
            <div className="mt-0.5 text-xs text-black/80 drop-shadow">
              Min qty: {product.quantityReq}+ · {product.priceLabel}
            </div>
            <button className="mt-3 w-full flex items-center justify-center gap-2 rounded-full bg-white py-2 text-sm font-bold text-gray-900 shadow-md transition hover:bg-black hover:text-white">
              <i className="fas fa-shopping-bag text-xs"></i>
              Shop Now
            </button>
          </div>
        </div>

      </div>

      {/* Name + price below card — always visible */}
      <div className="mt-3 px-1 flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</p>
        <span className="text-sm font-black text-gray-700">{product.priceLabel}</span>
      </div>
      <p className="px-1 mt-0.5 text-xs text-gray-400">Min qty: {product.quantityReq}+</p>
    </Link>
  );
}

// ================== MAIN COMPONENT ==================
export default function ScreenPrintingPage() {
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [tempMinPrice, setTempMinPrice] = useState<number>(0);
  const [tempMaxPrice, setTempMaxPrice] = useState<number>(10000);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(productsData);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [headerHeight, setHeaderHeight] = useState<number>(72);

  const allPrices = productsData.map((p) => p.price);
  const globalMinPrice = Math.min(...allPrices);
  const globalMaxPrice = Math.max(...allPrices);

  // Auto-detect header height
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

  const applyFilters = useCallback(() => {
    setFilteredProducts(
      productsData.filter((p) => matchesPriceFilter(p) && matchesSearch(p))
    );
  }, [matchesPriceFilter, matchesSearch]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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
    resetPriceRange();
  };

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isSidebarOpen]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const sidebarProps = {
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
  };

  return (
    <>
      {/* ── MOBILE OVERLAY ── */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={closeSidebar}
      />

      {/* ── MOBILE DRAWER ── */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-[280px] overflow-y-auto border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-xl font-black tracking-tight">Cluesstyle</h2>
          <button
            onClick={closeSidebar}
            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        <SidebarContent {...sidebarProps} onLinkClick={closeSidebar} />
      </aside>

      {/* ── DESKTOP LAYOUT ── */}
      {/* 
        The wrapper sits below the header and fills the remaining viewport.
        headerHeight is measured automatically from the real <header> element.
        Both aside and main scroll independently inside this fixed-height container.
      */}
      <div
        className="hidden lg:flex bg-gray-50"
        style={{ height: `calc(100vh - ${headerHeight}px)` }}
      >
        {/* LEFT SIDEBAR — scrolls only its own content, never moves with page */}
        <aside className="w-[280px] flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          <SidebarContent {...sidebarProps} />
        </aside>

        {/* RIGHT CONTENT — scrolls independently */}
        <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar">
          <div className="p-6 lg:p-8">

            {/* Top Banner */}
            <div className="mb-8 rounded-2xl border-2 border-black bg-white p-5 shadow-[6px_6px_0px_#000] transition-all hover:shadow-[8px_8px_0px_#000] md:p-6">
              <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                Customize & Order <br className="hidden sm:block" />
                T-shirt Printing
              </h1>
              <p className="mt-2 max-w-xl text-gray-600">
                High-quality screen printing for brands, events, or business.
                Fast turnaround & premium inks.
              </p>
              <div className="mt-5">
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Describe your requirement or product name..."
                    className="w-full rounded-lg border-2 border-gray-300 p-3 pl-10 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Try: "Hoodie", "Premium", "Bulk"
                </p>
              </div>
            </div>

            {/* Filter bar */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm font-medium">
                  {filteredProducts.length} products
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-gray-500 underline hover:text-black"
                >
                  Clear all filters
                </button>
              </div>
              <div className="text-xs text-gray-500">
                <i className="fas fa-check-circle text-green-600"></i> authentic
                prints · eco-friendly
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <i className="fas fa-box-open text-5xl text-gray-300"></i>
                <p className="mt-3 font-medium text-gray-500">
                  No products match the selected filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-3 rounded-lg border border-black px-4 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
                >
                  Reset filters
                </button>
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

      {/* ── MOBILE LAYOUT ── */}
      <div className="lg:hidden min-h-screen bg-gray-50">
        <main className="p-4">
          {/* Mobile top banner */}
          <div className="mb-6 rounded-2xl border-2 border-black bg-white p-5 shadow-[6px_6px_0px_#000]">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-black">Customize & Order T-shirt Printing</h1>
                <p className="mt-1 text-sm text-gray-600">
                  High-quality screen printing for your brand.
                </p>
              </div>
              <button
                onClick={openSidebar}
                className="ml-3 flex-shrink-0 rounded-lg border-2 border-black bg-white px-3 py-2 font-semibold shadow-[3px_3px_0px_#000]"
              >
                <i className="fas fa-sliders-h"></i> Filters
              </button>
            </div>
            <div className="relative mt-4">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border-2 border-gray-300 p-2 pl-10 outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="mb-3 flex justify-between">
            <span className="text-sm font-medium">{filteredProducts.length} products</span>
            <button onClick={clearAllFilters} className="text-xs text-gray-500 underline">
              Clear filters
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-gray-500">No products found.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/services/screen-printing/t-shirt/${product.slug}`}
                  className="group block"
                >
                  <div className="flex flex-col rounded-2xl border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000] transition-all hover:shadow-[6px_6px_0px_#000]">
                    <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={getProductImage(product.name)}
                        alt={product.name}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-3 flex items-start justify-between">
                      <h3 className="font-bold">{product.name}</h3>
                      <span className="ml-2 flex-shrink-0 rounded-md bg-gray-100 px-2 py-0.5 font-mono text-sm font-black">
                        {product.priceLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      <i className="fas fa-print mr-1"></i> Min qty: {product.quantityReq}+
                    </p>
                    <button className="mt-3 w-full rounded-lg border-2 border-black bg-black py-2 font-medium text-white transition-all hover:bg-white hover:text-black">
                      View Details
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}