"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import VisitingCardInquiryModal from "../components/VisitingCardInquiryModal";
import IdentityCardInquiryModal from "../components/Identitycardinquirymodal";
import TrophyInquiryModal from "../components/Trophyinquirymodal";
import ExecutiveKitInquiryModal from "../components/Executivekitinquirymodal";
import DrinkwareInquiryModal from "../components/Drinkwareinquirymodal";

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
  size: string;
  description?: string;
  features?: string[];
  material?: string;
  turnaround?: string;
  occation:string;
}

interface Category {
  label: string;
  bg: string;
  image: string;
  
}

interface FilterDropdownProps {
  icon: string;
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

interface DropdownFilters {
  occasion: string;
  giftType: string;
  price: string;
  sortBy: string;
}

// ================== MOCK DATA ==================
const productsData: Product[] = [
  {
    id: "1",
    name: "Bags Collection",
    slug: "bags",
    price: 499,
    priceLabel: "₹499",
    img: "/blue-bag-after.webp",
    quantityReq: 10,
    priceRange: "budget",
    category: "tshirt",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    occation:'All Occasions',
  },
  {
    id: "2",
    name: "Premium Drinkwares",
    slug: "drinkware/",
    price: 899,
    priceLabel: "₹899",
    img: "/drinkwares.webp",
    quantityReq: 10,
    priceRange: "budget",
    category: "tshirt",
    description: "Superior quality printing on premium cotton fabric.",
    features: ["Premium Cotton", "Eco-friendly inks", "Soft touch finish", "Color fastness guaranteed"],
    material: "Premium Combed Cotton, 200 GSM",
    turnaround: "7-10 business days",
    size: '12" x 12"',
     occation:'All Occasions',
  },
 {
    id: "3",
    name: "Apparels",
    slug: "apparels",
    price: 1299,
    priceLabel: "₹1299",
    img: "/green-polo-after.webp",
    quantityReq: 10,
    priceRange: "mid",
    category: "hoodie",
    description: "Cozy hoodies with vibrant screen prints.",
    features: ["80% Cotton, 20% Polyester", "Kangaroo pocket", "Drawstring hood", "Available in 5+ colors"],
    material: "Cotton-polyester blend, 280 GSM",
    turnaround: "7-10 business days",
    size: '12" x 12"',
     occation:'Corporate Events',
  },

  // {
  //   id: "4",
  //   name: "Caps Collection",
  //   slug: "caps-collection",
  //   price: 1299,
  //   priceLabel: "₹1299",
  //   img: "/new-cap-after.webp",
  //   quantityReq: 10,
  //   priceRange: "mid",
  //   category: "hoodie",
  //   description: "Cozy hoodies with vibrant screen prints.",
  //   features: ["80% Cotton, 20% Polyester", "Kangaroo pocket", "Drawstring hood", "Available in 5+ colors"],
  //   material: "Cotton-polyester blend, 280 GSM",
  //   turnaround: "7-10 business days",
  //   size: '12" x 12"',
  //    occation:'Corporate Events',
  // },
  // {
  //   id: "5",
  //   name: "Certificate Frames",
  //   slug: "certificate-frames",
  //   price: 1299,
  //   priceLabel: "₹1299",
  //   img: "/frame-after.webp",
  //   quantityReq: 10,
  //   priceRange: "mid",
  //   category: "hoodie",
  //   description: "Cozy hoodies with vibrant screen prints.",
  //   features: ["80% Cotton, 20% Polyester", "Kangaroo pocket", "Drawstring hood", "Available in 5+ colors"],
  //   material: "Cotton-polyester blend, 280 GSM",
  //   turnaround: "7-10 business days",
  //   size: '12" x 12"',
  //    occation:'Corporate Events',
  // },
  // {
  //   id: "6",
  //   name: "Umbrella Collection",
  //   slug: "umbrella-collection",
  //   price: 1299,
  //   priceLabel: "₹1299",
  //   img: "/umbrella-after.webp",
  //   quantityReq: 10,
  //   priceRange: "mid",
  //   category: "hoodie",
  //   description: "Cozy hoodies with vibrant screen prints.",
  //   features: ["80% Cotton, 20% Polyester", "Kangaroo pocket", "Drawstring hood", "Available in 5+ colors"],
  //   material: "Cotton-polyester blend, 280 GSM",
  //   turnaround: "7-10 business days",
  //   size: '12" x 12"',
  //    occation:'Corporate Events',
  // },

  {
    id: "7",
    name: "Trophies Collection",
    slug: "trophies-collection",
    price: 1299,
    priceLabel: "₹1299",
    img: "/trophy-after.webp",
    quantityReq: 10,
    priceRange: "mid",
    category: "hoodie",
    description: "Cozy hoodies with vibrant screen prints.",
    features: ["80% Cotton, 20% Polyester", "Kangaroo pocket", "Drawstring hood", "Available in 5+ colors"],
    material: "Cotton-polyester blend, 280 GSM",
    turnaround: "7-10 business days",
    size: '12" x 12"',
     occation:'Corporate Events',
  },


  {
    id: "8",
    name: "Badge Collection",
    slug: "badge-collection",
    price: 1299,
    priceLabel: "₹1299",
    img: "/pin-badges.webp",
    quantityReq: 10,
    priceRange: "mid",
    category: "hoodie",
    description: "Cozy hoodies with vibrant screen prints.",
    features: ["80% Cotton, 20% Polyester", "Kangaroo pocket", "Drawstring hood", "Available in 5+ colors"],
    material: "Cotton-polyester blend, 280 GSM",
    turnaround: "7-10 business days",
    size: '12" x 12"',
     occation:'Corporate Events',
  },


   {
    id: "9",
    name: "Visiting Cards",
    slug: "visiting-cards",
    price: 1299,
    priceLabel: "₹1299",
    img: "/visiting-card.webp",
    quantityReq: 10,
    priceRange: "mid",
    category: "hoodie",
    description: "Cozy hoodies with vibrant screen prints.",
    features: ["80% Cotton, 20% Polyester", "Kangaroo pocket", "Drawstring hood", "Available in 5+ colors"],
    material: "Cotton-polyester blend, 280 GSM",
    turnaround: "7-10 business days",
    size: '12" x 12"',
     occation:'Corporate Events',
  },


  {
    id: "10",
    name: "Executive Kit",
    slug: "#",
    price: 1299,
    priceLabel: "₹1299",
    img: "/bottle-box-after.webp",
    quantityReq: 10,
    priceRange: "mid",
    category: "hoodie",
    description: "Cozy hoodies with vibrant screen prints.",
    features: ["80% Cotton, 20% Polyester", "Kangaroo pocket", "Drawstring hood", "Available in 5+ colors"],
    material: "Cotton-polyester blend, 280 GSM",
    turnaround: "7-10 business days",
    size: '12" x 12"',
     occation:'Corporate Events',
  },



   {
    id: "11",
    name: "Identity Cards",
    slug: "identity-cards",
    price: 1299,
    priceLabel: "₹1299",
    img: "/identy-card-before.webp",
    quantityReq: 10,
    priceRange: "mid",
    category: "hoodie",
    description: "Cozy hoodies with vibrant screen prints.",
    features: ["80% Cotton, 20% Polyester", "Kangaroo pocket", "Drawstring hood", "Available in 5+ colors"],
    material: "Cotton-polyester blend, 280 GSM",
    turnaround: "7-10 business days",
    size: '12" x 12"',
     occation:'Corporate Events',
  },



  


  
];

const sizes: string[] = []; // kept for type compat, no longer used in sidebar

// ================== CATEGORY TILES ==================
const categories: Category[] = [
  { label: "Under ₹499",   bg: "bg-transparent", image: "/under-rs-499.webp" },
  { label: "₹500 - 999",  bg: "bg-transparent", image: "/under-rs-499.webp" },
  { label: "Above ₹1000", bg: "bg-transparent", image: "/under-rs-499.webp" },
  { label: "Canvas Bags",  bg: "bg-yellow-50",   image: "/crsytal-trophy.webp" },
  { label: "Jute Bags",    bg: "bg-yellow-50",   image: "/metal-trophy.webp" },
  { label: "Cotton Bags",  bg: "bg-blue-50",     image: "/wooden-trophy.webp" },
];

// ================== FILTER OPTIONS ==================
const filterOptions: Record<string, string[]> = {
  occasion: ["All Occasions", "Corporate Events", "Sports", "Academic", "Personal"],
  giftType: ["All Types", "Canvas Bags", "Jute Bags", "Cotton Bags", "Printed Bags", "Custom Bags"],
  price: ["All Prices", "Under ₹499", "₹500 - 999", "Above ₹1000"],
  sortBy: ["Random", "Price: Low to High", "Price: High to Low", "Newest First", "Most Popular"],
};

// ================== FILTER DROPDOWN ==================
function FilterDropdown({ icon, label, value, options, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = !value.startsWith("All") && value !== "Random";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors whitespace-nowrap
          ${isActive
            ? "border-black text-black bg-black/5"
            : "border-gray-300 text-gray-600 bg-white hover:border-gray-400"
          }`}
      >
        <span className="text-base">{icon}</span>
        <span>{label}: {value}</span>
        <svg
          className={`w-3.5 h-3.5 ml-0.5 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5 min-w-[200px]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors
                ${value === opt ? "text-black font-medium bg-gray-100" : "text-gray-700"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ================== SIDEBAR SECTION ==================
function SidebarSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors"
      >
        {title}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

// ================== SIDEBAR CONTENT ==================
function SidebarContent({
  dropdownFilters,
  setDropdown,
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
  clearAllFilters,
  searchQuery,
  setSearchQuery,
  desktopDefaultOpen = false,
}: {
  dropdownFilters: DropdownFilters;
  setDropdown: (key: keyof DropdownFilters) => (val: string) => void;
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
  clearAllFilters: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  desktopDefaultOpen?: boolean;
}) {
  const [showAllProducts, setShowAllProducts] = useState(false);
  const PRODUCTS_PREVIEW_COUNT = 6;
  const visibleProducts = showAllProducts
    ? productsData
    : productsData.slice(0, PRODUCTS_PREVIEW_COUNT);

  return (
    <div className="py-2">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <h2 className="text-base font-black tracking-tight">Filters</h2>
        <button onClick={clearAllFilters} className="text-xs text-gray-400 underline hover:text-black">
          Reset all
        </button>
      </div>

      {/* Our Products */}
      <SidebarSection title="Our Products" defaultOpen={desktopDefaultOpen}>
        <div className="flex flex-col">
          <button
            onClick={() => setSearchQuery("")}
            className={`text-left py-2 text-sm transition-colors border-l-2 pl-3 -ml-px
              ${searchQuery === ""
                ? "border-black text-black font-bold"
                : "border-transparent text-gray-600 hover:text-black hover:border-gray-300"
              }`}
          >
            All Products
          </button>
          {visibleProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => setSearchQuery(p.name)}
              className={`text-left py-2 text-sm transition-colors border-l-2 pl-3 -ml-px
                ${searchQuery === p.name
                  ? "border-black text-black font-bold"
                  : "border-transparent text-gray-600 hover:text-black hover:border-gray-300"
                }`}
            >
              {p.name}
            </button>
          ))}
          {productsData.length > PRODUCTS_PREVIEW_COUNT && (
            <button
              onClick={() => setShowAllProducts((s) => !s)}
              className="text-left py-2 pl-3 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              {showAllProducts ? "See less" : "See more"}
            </button>
          )}
        </div>
      </SidebarSection>

      {/* Bag Type */}
      {/* <SidebarSection title="Bag Type">
        <div className="flex flex-col gap-1.5">
          {filterOptions.giftType.map((opt) => (
            <button
              key={opt}
              onClick={() => setDropdown("giftType")(opt)}
              className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all
                ${dropdownFilters.giftType === opt
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white hover:border-gray-400 text-gray-700"
                }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </SidebarSection> */}

      {/* Price Bucket */}
      <SidebarSection title="Price Range" defaultOpen={desktopDefaultOpen}>
        {/* <div className="flex flex-col gap-1.5 mb-4">
          {filterOptions.price.map((opt) => (
            <button
              key={opt}
              onClick={() => setDropdown("price")(opt)}
              className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all
                ${dropdownFilters.price === opt
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white hover:border-gray-400 text-gray-700"
                }`}
            >
              {opt}
            </button>
          ))}
        </div> */}

        {/* Slider */}
        <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
          <span>{formatPrice(minPrice)}</span>
          <span>—</span>
          <span>{formatPrice(maxPrice)}</span>
        </div>
        <div className="relative mb-5 h-1 rounded-full bg-gray-200">
          <div
            className="absolute h-1 rounded-full bg-black"
            style={{
              left: `${((tempMinPrice - globalMinPrice) / (globalMaxPrice - globalMinPrice)) * 100}%`,
              right: `${100 - ((tempMaxPrice - globalMinPrice) / (globalMaxPrice - globalMinPrice)) * 100}%`,
            }}
          />
          <input type="range" min={globalMinPrice} max={globalMaxPrice} value={tempMinPrice}
            onChange={handleMinPriceChange} onMouseUp={applyPriceRange} onTouchEnd={applyPriceRange}
            className="absolute -top-2 w-full appearance-none bg-transparent pointer-events-none
              [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
              [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
            style={{ zIndex: tempMinPrice > globalMinPrice ? 2 : 1 }}
          />
          <input type="range" min={globalMinPrice} max={globalMaxPrice} value={tempMaxPrice}
            onChange={handleMaxPriceChange} onMouseUp={applyPriceRange} onTouchEnd={applyPriceRange}
            className="absolute -top-2 w-full appearance-none bg-transparent pointer-events-none
              [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
              [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
            style={{ zIndex: tempMaxPrice < globalMaxPrice ? 2 : 1 }}
          />
        </div>
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Min</label>
            <input type="number" value={tempMinPrice}
              onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v) && v <= tempMaxPrice) setTempMinPrice(v); }}
              onBlur={applyPriceRange}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Max</label>
            <input type="number" value={tempMaxPrice}
              onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= tempMinPrice) setTempMaxPrice(v); }}
              onBlur={applyPriceRange}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
            />
          </div>
        </div>
        <button onClick={resetPriceRange} className="text-xs text-gray-400 underline hover:text-black">
          Reset price
        </button>
      </SidebarSection>

      {/* Sort By */}
      <SidebarSection title="Sort By">
        <div className="flex flex-col gap-1.5">
          {filterOptions.sortBy.map((opt) => (
            <button
              key={opt}
              onClick={() => setDropdown("sortBy")(opt)}
              className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all
                ${dropdownFilters.sortBy === opt
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white hover:border-gray-400 text-gray-700"
                }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </SidebarSection>
    </div>
  );
}

// ================== PRODUCT CARD ==================
function ProductCard({ product, onOpenVisitingCardInquiry, onOpenIdentityCardInquiry, onOpenTrophyInquiry, onOpenExecutiveKitInquiry, onOpenDrinkwareInquiry }: { product: Product; onOpenVisitingCardInquiry: () => void; onOpenIdentityCardInquiry: () => void; onOpenTrophyInquiry: () => void; onOpenExecutiveKitInquiry: () => void; onOpenDrinkwareInquiry: () => void }) {
  const isVisitingCards = product.slug === "visiting-cards";
  const isIdentityCards = product.slug === "identity-cards";
  const isTrophies = product.slug === "trophies-collection";
  const isExecutiveKit = product.name === "Executive Kit";
  const isDrinkware = product.slug === "drinkware/";

  const handleClick = (e: React.MouseEvent) => {
    if (isVisitingCards) {
      e.preventDefault();
      onOpenVisitingCardInquiry();
    } else if (isIdentityCards) {
      e.preventDefault();
      onOpenIdentityCardInquiry();
    } else if (isTrophies) {
      e.preventDefault();
      onOpenTrophyInquiry();
    } else if (isExecutiveKit) {
      e.preventDefault();
      onOpenExecutiveKitInquiry();
    } else if (isDrinkware) {
      e.preventDefault();
      onOpenDrinkwareInquiry();
    }
  };

  return (
    <Link href={`/products/${product.slug}`} onClick={handleClick} className="group block h-full">
      <div className="relative h-64 sm:h-95 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1">
        <Image
          src={product.img}
          alt={product.name}
          fill
          className="object-contain p-4 sm:p-6 transition-transform duration-500 group-hover:scale-105"
        />
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
      <div className="mt-2.5 px-1 flex items-center justify-between">
        <p className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 flex-1 mr-2">{product.name}</p>
        <span className="text-xs sm:text-sm font-black text-gray-700 flex-shrink-0">{product.priceLabel}</span>
      </div>
      <p className="px-1 mt-0.5 text-xs text-gray-400">Min qty: {product.quantityReq}+</p>
    </Link>
  );
}

// ================== MAIN COMPONENT ==================
export default function ToteBag() {
  const [showVisitingCardInquiry, setShowVisitingCardInquiry] = useState(false);
  const [showIdentityCardInquiry, setShowIdentityCardInquiry] = useState(false);
  const [showTrophyInquiry, setShowTrophyInquiry] = useState(false);
  const [showExecutiveKitInquiry, setShowExecutiveKitInquiry] = useState(false);
  const [showDrinkwareInquiry, setShowDrinkwareInquiry] = useState(false);
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

  // Dropdown filters (from code 2)
  const [dropdownFilters, setDropdownFilters] = useState<DropdownFilters>({
    occasion: "All Occasions",
    giftType: "All Types",
    price: "All Prices",
    sortBy: "Random",
  });

  const setDropdown = (key: keyof DropdownFilters) => (val: string) =>
    setDropdownFilters((f) => ({ ...f, [key]: val }));

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

  // Dropdown price filter
  const matchesDropdownPrice = useCallback(
    (p: Product) => {
      if (dropdownFilters.price === "Under ₹499") return p.price < 499;
      if (dropdownFilters.price === "₹500 - 999") return p.price >= 500 && p.price <= 999;
      if (dropdownFilters.price === "Above ₹1000") return p.price > 1000;
      return true;
    },
    [dropdownFilters.price]
  );

  const matchesOccasionFilter = useCallback(
  (p: Product) => {
    if (dropdownFilters.occasion === "All Occasions") return true;

    return p.occation === dropdownFilters.occasion;
  },
  [dropdownFilters.occasion]
);
  const applyFilters = useCallback(() => {
  let result = productsData.filter(
    (p) =>
      matchesPriceFilter(p) &&
      matchesSearch(p) &&
      matchesDropdownPrice(p) &&
      matchesOccasionFilter(p)
  );

  if (dropdownFilters.sortBy === "Price: Low to High")
    result = [...result].sort((a, b) => a.price - b.price);
  else if (dropdownFilters.sortBy === "Price: High to Low")
    result = [...result].sort((a, b) => b.price - a.price);
  else if (dropdownFilters.sortBy === "Newest First")
    result = [...result].sort((a, b) => parseInt(b.id) - parseInt(a.id));

  setFilteredProducts(result);
}, [
  matchesPriceFilter,
  matchesSearch,
  matchesDropdownPrice,
  matchesOccasionFilter,
  dropdownFilters.sortBy,
]);

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
    resetPriceRange();
    setDropdownFilters({ occasion: "All Occasions", giftType: "All Types", price: "All Prices", sortBy: "Random" });
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
    minPrice !== globalMinPrice || maxPrice !== globalMaxPrice,
    dropdownFilters.occasion !== "All Occasions",
    dropdownFilters.giftType !== "All Types",
    dropdownFilters.price !== "All Prices",
  ].filter(Boolean).length;

  const sidebarContentProps = {
    dropdownFilters, setDropdown,
    tempMinPrice, tempMaxPrice, minPrice, maxPrice,
    globalMinPrice, globalMaxPrice, formatPrice,
    handleMinPriceChange, handleMaxPriceChange,
    applyPriceRange, resetPriceRange,
    setTempMinPrice, setTempMaxPrice,
    clearAllFilters,
    searchQuery, setSearchQuery,
  };

  // Category tile click handler
  const handleCategoryClick = (label: string) => {
    const priceMap: Record<string, string> = {
      "Under ₹499":  "Under ₹499",
      "₹500 - 999":  "₹500 - 999",
      "Above ₹1000": "Above ₹1000",
    };
    const typeMap: Record<string, string> = {
      "Canvas Bags": "Canvas Bags",
      "Jute Bags":   "Jute Bags",
      "Cotton Bags": "Cotton Bags",
    };
    if (priceMap[label]) {
      setDropdownFilters((f) => ({ ...f, price: priceMap[label] }));
    } else if (typeMap[label]) {
      setDropdownFilters((f) => ({ ...f, giftType: typeMap[label] }));
    }
  };

  return (
    <>
      {/* ══════════════════════════════════════════════
          MOBILE SIDEBAR OVERLAY
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
        <SidebarContent {...sidebarContentProps} />
      </aside>

      {/* ══════════════════════════════════════════════
          MOBILE FILTER MODAL (bottom sheet)
      ══════════════════════════════════════════════ */}
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
        <SidebarContent {...sidebarContentProps} />
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
          <SidebarContent {...sidebarContentProps} desktopDefaultOpen={true} />
        </aside>

        {/* RIGHT CONTENT */}
        <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar">
          <div className="p-6 lg:p-8">

            {/* ── TOP BANNER ── */}
            <div className="mb-8 overflow-hidden rounded-3xl border-2 border-black bg-white shadow-[6px_6px_0px_#000] transition-all hover:shadow-[8px_8px_0px_#000]">
              <div className="grid min-h-[420px] grid-cols-1 lg:grid-cols-2">
                <div className="flex flex-col justify-center p-6 md:p-10">
                  <div className="mb-3 inline-flex w-fit items-center rounded-full border border-black bg-black px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Premium Tote Bag Printing
                  </div>
                  <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">
                    Top Product Categories<br />
                    <span className="text-gray-500"></span>
                  </h1>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600">
                    High-quality screen printing for brands, events, and businesses. Premium fabrics, vibrant prints, and fast turnaround.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {["Premium Quality", "Bulk Orders", "Fast Delivery"].map((f) => (
                      <div key={f} className="rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium">{f}</div>
                    ))}
                  </div>
                  <div className="mt-8">
                    <div className="relative">
                      <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tote bags..."
                        className="h-14 w-full rounded-2xl border-2 border-gray-300 bg-white pl-12 pr-4 text-sm outline-none transition-all focus:border-black focus:ring-2 focus:ring-black/10"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-400">Try: "Premium", "Prime", "Canvas"</p>
                  </div>
                </div>
                <div className="relative min-h-[320px] overflow-hidden bg-black">
                  <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
                    <source src="/merchandise-products.webm" type="video/mp4" />
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

            {/* ── CATEGORY TILES ── */}
            {/* <div className="mb-6">
              <div className="grid grid-cols-6 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => handleCategoryClick(cat.label)}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className={`relative w-25 h-25 rounded-xl ${cat.bg} overflow-hidden border border-gray-100 mx-auto`}>
                      <Image
                        src={cat.image}
                        alt={cat.label}
                        fill
                        sizes="56px"
                        className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <span className="mt-1 text-[10px] text-gray-600 text-center leading-tight font-medium group-hover:text-black transition-colors">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div> */}

            {/* ── FILTER COUNT BAR ── */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm font-medium">
                  {filteredProducts.length} products
                </span>
                <button onClick={clearAllFilters} className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm font-medium hover:text-black">
                  Clear all filters
                </button>
              </div>
              <div className="text-xs text-gray-500">
                <i className="fas fa-check-circle text-green-600"></i> authentic prints · eco-friendly
              </div>
            </div>

            {/* ── PRODUCT GRID ── */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <i className="fas fa-box-open text-5xl text-gray-300"></i>
                <p className="mt-3 font-medium text-gray-500">No products match the selected filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onOpenVisitingCardInquiry={() => setShowVisitingCardInquiry(true)} onOpenIdentityCardInquiry={() => setShowIdentityCardInquiry(true)} onOpenTrophyInquiry={() => setShowTrophyInquiry(true)} onOpenExecutiveKitInquiry={() => setShowExecutiveKitInquiry(true)} onOpenDrinkwareInquiry={() => setShowDrinkwareInquiry(true)} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ══════════════════════════════════════════════
          MOBILE LAYOUT
      ══════════════════════════════════════════════ */}
      <div className="lg:hidden min-h-screen bg-gray-50">

        {/* Mobile Hero Banner */}
        <div className="relative overflow-hidden bg-black" style={{ minHeight: 220 }}>
          <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-60">
            <source src="/merchandise-products.webm" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
          <div className="relative z-10 flex flex-col justify-end h-full px-5 py-6" style={{ minHeight: 220 }}>
            <div className="mb-2 inline-flex w-fit items-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Premium Tote Bag Printing
            </div>
            <h1 className="text-2xl font-black leading-tight text-white">
              Customize & Order<br />
              <span className="text-white/70">Tote Bags</span>
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
              {(minPrice !== globalMinPrice || maxPrice !== globalMaxPrice) && (
                <span className="flex items-center gap-1 rounded-full bg-black text-white text-xs font-medium px-2.5 py-1">
                  {formatPrice(minPrice)} – {formatPrice(maxPrice)}
                  <button onClick={resetPriceRange} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
                </span>
              )}
              {dropdownFilters.price !== "All Prices" && (
                <span className="flex items-center gap-1 rounded-full bg-black text-white text-xs font-medium px-2.5 py-1">
                  {dropdownFilters.price}
                  <button onClick={() => setDropdown("price")("All Prices")} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
                </span>
              )}
              {dropdownFilters.occasion !== "All Occasions" && (
                <span className="flex items-center gap-1 rounded-full bg-black text-white text-xs font-medium px-2.5 py-1">
                  {dropdownFilters.occasion}
                  <button onClick={() => setDropdown("occasion")("All Occasions")} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
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
              <ProductCard key={product.id} product={product} onOpenVisitingCardInquiry={() => setShowVisitingCardInquiry(true)} onOpenIdentityCardInquiry={() => setShowIdentityCardInquiry(true)} onOpenTrophyInquiry={() => setShowTrophyInquiry(true)} onOpenExecutiveKitInquiry={() => setShowExecutiveKitInquiry(true)} onOpenDrinkwareInquiry={() => setShowDrinkwareInquiry(true)} />              ))}
            </div>
          )}
        </div>
      </div>

      {showVisitingCardInquiry && (
        <VisitingCardInquiryModal onClose={() => setShowVisitingCardInquiry(false)} />
      )}
      {showIdentityCardInquiry && (
        <IdentityCardInquiryModal onClose={() => setShowIdentityCardInquiry(false)} />
      )}
      {showTrophyInquiry && (
        <TrophyInquiryModal onClose={() => setShowTrophyInquiry(false)} />
      )}
      {showExecutiveKitInquiry && (
        <ExecutiveKitInquiryModal onClose={() => setShowExecutiveKitInquiry(false)} />
      )}
      {showDrinkwareInquiry && (
        <DrinkwareInquiryModal onClose={() => setShowDrinkwareInquiry(false)} />
      )}
    </>
  );
}