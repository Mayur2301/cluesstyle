"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────

interface MediaItem {
  type: "image" | "video";
  src: string;
  poster?: string;
}

interface ProductColor {
  label: string;
  hex: string;
  media?: MediaItem[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  displayPrice: number;
  originalPrice: number;
  images: string[];
  media?: MediaItem[];
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
  sameDayAvailable?: boolean;
}

// ── Pricing tiers ─────────────────────────────────────────────────────────────

const COST_PER_UNIT = 240;

const QTY_TIERS = [
  { minQty: 1,   discount: 0,  label: "1 pc"   },
  { minQty: 10,  discount: 5,  label: "10 pcs"  },
  { minQty: 30,  discount: 10, label: "30 pcs"  },
  { minQty: 50,  discount: 15, label: "50 pcs"  },
  { minQty: 60,  discount: 18, label: "60 pcs"  },
  { minQty: 80,  discount: 22, label: "80 pcs"  },
  { minQty: 100, discount: 27, label: "100 pcs" },
];

const SAME_DAY_SURCHARGE = 80;

const MUMBAI_PINCODES = new Set([
  "400001","400002","400003","400004","400005","400006","400007","400008","400009","400010",
  "400011","400012","400013","400014","400015","400016","400017","400018","400019","400020",
  "400021","400022","400023","400024","400025","400026","400027","400028","400029","400030",
  "400031","400032","400033","400034","400035","400036","400037","400038","400039","400040",
  "400041","400042","400043","400044","400045","400046","400047","400048","400049","400050",
  "400051","400052","400053","400054","400055","400056","400057","400058","400059","400060",
  "400061","400062","400063","400064","400065","400066","400067","400068","400069","400070",
  "400071","400072","400073","400074","400075","400076","400077","400078","400079","400080",
  "400081","400082","400083","400084","400085","400086","400087","400088","400089","400090",
  "400091","400092","400093","400094","400095","400096","400097","400098","400099","400100",
  "400101","400102","400103","400104","400105","400706","401107","401209","401303",
]);

// ── Products Data ──────────────────────────────────────────────────────────────

const productsData: Product[] = [
  {
    id: "1",
    name: "Red and White Promotional Cap",
    slug: "red-and-white-promotional-cap",
    basePrice: 240,
    displayPrice: 499,
    originalPrice: 699,
    discount: 29,
    images: [
      "/office-bag/blue-office-bag/blue-office-bag-front.png",
    ],
    media: [
      { type: "image", src: "/green-polo-after.png" },
      { type: "image", src: "/green-polo-after.png" },
      { type: "image", src: "/green-polo-after.png" },
      { type: "image", src: "/green-polo-after.png" },
    ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Promotional Cap",
    description: "High-quality screen printing on sturdy canvas tote bags.",
    features: ["100% Canvas", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton Canvas, 180 GSM",
    turnaround: "5-7 business days",
    sameDayTurnaround: "By 8 PM today",
    rating: 4.3,
    reviewCount: 128,
    badge: "Best Seller",
    colors: [
      {
        label: "Red",
        hex: "#f60909",
        media: [
          { type: "image", src: "/promotional-trucker-cap/promotional_trucker_cap_allkview.png" },
          { type: "image", src: "/promotional-trucker-cap/promotional_trucker_cap_backview.png" },
         
         
        ],
      },
      // Uncomment and add paths when you have other color images:
      // {
      //   label: "Silver",
      //   hex: "#C0C0C0",
      //   media: [
      //     { type: "image", src: "/black-stainless-steel-up-bottle/silver/front.png" },
      //     { type: "image", src: "/black-stainless-steel-up-bottle/silver/top.png" },
      //   ],
      // },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    weight: 300,
    customizable: true,
    sameDayAvailable: true,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function resolveMedia(product: Product, selectedColorLabel: string | null): MediaItem[] {
  if (selectedColorLabel && product.colors) {
    const colorObj = product.colors.find((c) => c.label === selectedColorLabel);
    if (colorObj?.media && colorObj.media.length > 0) return colorObj.media;
  }
  if (product.media && product.media.length > 0) return product.media;
  return product.images.map((src) => ({ type: "image" as const, src }));
}

function getDiscountForQty(qty: number): number {
  let discount = 0;
  for (const tier of QTY_TIERS) {
    if (qty >= tier.minQty) discount = tier.discount;
  }
  return discount;
}

function getPricePerUnit(displayPrice: number, qty: number): number {
  const discountPct = getDiscountForQty(qty);
  const discounted = displayPrice * (1 - discountPct / 100);
  return Math.max(discounted, COST_PER_UNIT + 20);
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);
}

function PlayIcon() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-7 h-7 bg-black/60 rounded-full flex items-center justify-center">
        <svg className="w-3.5 h-3.5 text-white fill-white ml-0.5" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  );
}

// ── Image Magnifier ────────────────────────────────────────────────────────────

const ZOOM = 2.5;
const LENS_SIZE = 250;
const ZOOM_PANEL_SIZE = 450;

function ImageMagnifier({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lensPos, setLensPos]       = useState({ x: 0, y: 0 });
  const [showLens, setShowLens]     = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const [isMounted, setIsMounted]   = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clampedX = Math.max(LENS_SIZE / 2, Math.min(x, rect.width  - LENS_SIZE / 2));
    const clampedY = Math.max(LENS_SIZE / 2, Math.min(y, rect.height - LENS_SIZE / 2));
    setLensPos({ x: clampedX, y: clampedY });
    const panelLeft = rect.right + 12;
    let   panelTop  = e.clientY + window.scrollY - ZOOM_PANEL_SIZE / 2;
    const maxTop = window.scrollY + window.innerHeight - ZOOM_PANEL_SIZE - 8;
    const minTop = window.scrollY + 8;
    panelTop = Math.max(minTop, Math.min(panelTop, maxTop));
    const effectiveLeft = panelLeft + ZOOM_PANEL_SIZE > window.innerWidth
      ? rect.left - ZOOM_PANEL_SIZE - 12
      : panelLeft;
    setPanelStyle({ position: "absolute", top: panelTop, left: effectiveLeft, width: ZOOM_PANEL_SIZE, height: ZOOM_PANEL_SIZE });
  }, []);

  const bgX = -(lensPos.x * ZOOM - ZOOM_PANEL_SIZE / 2);
  const bgY = -(lensPos.y * ZOOM - ZOOM_PANEL_SIZE / 2);

  const zoomPanel = showLens && isMounted
    ? createPortal(
        <div className="rounded-xl border border-gray-200 shadow-2xl overflow-hidden bg-white"
          style={{ ...panelStyle, zIndex: 99999, backgroundImage: `url(${src})`, backgroundRepeat: "no-repeat",
            backgroundSize: `${480 * ZOOM}px ${480 * ZOOM}px`, backgroundPosition: `${bgX}px ${bgY}px`, pointerEvents: "none" }} />,
        document.body
      )
    : null;

  return (
    <div className="relative w-full h-full group/magnifier">
      <div ref={containerRef} className="relative w-full h-full cursor-crosshair select-none"
        onMouseMove={handleMouseMove} onMouseEnter={() => setShowLens(true)} onMouseLeave={() => setShowLens(false)}>
        <Image src={src} alt={alt} fill className="object-contain p-6" draggable={false} priority />
        {showLens && (
          <div className="absolute border-2 border-gray-400/60 bg-blue-100/20 pointer-events-none rounded-sm"
            style={{ zIndex: 10, width: LENS_SIZE, height: LENS_SIZE, left: lensPos.x - LENS_SIZE / 2, top: lensPos.y - LENS_SIZE / 2 }} />
        )}
      </div>
      {zoomPanel}
    </div>
  );
}

// ── Thumbnail Strip ────────────────────────────────────────────────────────────

const VISIBLE = 3;

function ThumbnailStrip({ media, activeImg, setActiveImg }: {
  media: MediaItem[]; activeImg: number; setActiveImg: (i: number) => void;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  // Reset scroll when media changes (color switch)
  useEffect(() => { setScrollTop(0); }, [media]);

  const canScrollUp   = scrollTop > 0;
  const canScrollDown = scrollTop + VISIBLE < media.length;
  const showArrows    = media.length > VISIBLE;
  const visibleMedia  = media.slice(scrollTop, scrollTop + VISIBLE);

  return (
    <div className="hidden md:flex flex-col items-center gap-1.5 sticky top-24 self-start">
      {showArrows && (
        <button onClick={() => setScrollTop((s) => Math.max(0, s - 1))} disabled={!canScrollUp}
          className={`w-8 h-7 flex items-center justify-center rounded-lg border transition-all ${canScrollUp ? "border-gray-300 text-gray-600 hover:border-gray-500 hover:bg-gray-50" : "border-gray-100 text-gray-300 cursor-not-allowed"}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
      )}
      <div className="flex flex-col gap-3">
        {visibleMedia.map((item, i) => {
          const realIndex = scrollTop + i;
          const isActive  = activeImg === realIndex;
          return (
            <button key={realIndex} onClick={() => setActiveImg(realIndex)}
              className={`relative w-[120px] h-[140px] rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${isActive ? "border-gray-900 shadow-md" : "border-gray-200 hover:border-gray-400"}`}>
              {item.type === "video" ? (
                item.poster
                  ? <div className="relative w-full h-full bg-gray-100"><Image src={item.poster} alt={`video ${realIndex + 1}`} fill className="object-contain" /><PlayIcon /></div>
                  : <div className="relative w-full h-full bg-gray-900 flex items-center justify-center"><video src={item.src} className="w-full h-full object-cover" muted preload="metadata" /><PlayIcon /></div>
              ) : (
                <div className="relative w-full h-full bg-white">
                  <Image src={item.src} alt={`view ${realIndex + 1}`} fill className="object-contain" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {showArrows && (
        <button onClick={() => setScrollTop((s) => Math.min(media.length - VISIBLE, s + 1))} disabled={!canScrollDown}
          className={`w-8 h-7 flex items-center justify-center rounded-lg border transition-all ${canScrollDown ? "border-gray-300 text-gray-600 hover:border-gray-500 hover:bg-gray-50" : "border-gray-100 text-gray-300 cursor-not-allowed"}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      )}
      {showArrows && (
        <div className="flex flex-col gap-1 mt-1">
          {media.map((_, i) => (
            <button key={i} onClick={() => {
              setActiveImg(i);
              if (i < scrollTop) setScrollTop(i);
              else if (i >= scrollTop + VISIBLE) setScrollTop(i - VISIBLE + 1);
            }} className={`w-1 rounded-full transition-all ${activeImg === i ? "h-3 bg-gray-900" : "h-1 bg-gray-300"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Viewer ────────────────────────────────────────────────────────────────

function MainViewer({ media, activeImg, setActiveImg, badge, wishlist, setWishlist }: {
  media: MediaItem[]; activeImg: number; setActiveImg: (i: number) => void;
  badge?: string; wishlist: boolean; setWishlist: (v: boolean) => void;
}) {
  const current  = media[activeImg];
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);
  const touchDeltaY = useRef(0);
  const isDragging  = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
    touchDeltaY.current = 0;
    isDragging.current  = false;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    touchDeltaY.current = e.touches[0].clientY - touchStartY.current;
    if (!isDragging.current && Math.abs(touchDeltaX.current) > Math.abs(touchDeltaY.current) + 5)
      isDragging.current = true;
  };
  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    if (touchDeltaX.current < -50 && activeImg < media.length - 1) setActiveImg(activeImg + 1);
    else if (touchDeltaX.current > 50 && activeImg > 0) setActiveImg(activeImg - 1);
    touchDeltaX.current = 0;
    isDragging.current  = false;
  };

  return (
    <div className="flex flex-col md:sticky md:top-24 md:self-start">
      <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200 select-none"
        style={{ touchAction: "pan-y" }}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        {badge && (
          <span className="absolute top-3 left-3 z-10 bg-[#00a63e] text-white text-xs font-bold px-2 py-1 rounded">{badge}</span>
        )}
        <button onClick={() => setWishlist(!wishlist)}
          className="absolute top-3 right-3 z-10 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform">
          <svg className={`w-5 h-5 transition-colors ${wishlist ? "fill-red-500 text-red-500" : "fill-none text-gray-400"}`}
            stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
        <div className="relative w-full" style={{ paddingBottom: "100%" }}>
          <div className="absolute inset-0">
            {current?.type === "video" ? (
              <video ref={videoRef} key={current.src} src={current.src} poster={current.poster} controls
                className="w-full h-full object-contain p-4 rounded-2xl" />
            ) : (
              <ImageMagnifier src={current?.src ?? ""} alt="Product" />
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden flex justify-center items-center gap-2 pt-3 pb-1">
        {media.map((_, i) => (
          <button key={i} onClick={() => setActiveImg(i)} aria-label={`View image ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-200 ${activeImg === i ? "bg-gray-900 w-5" : "bg-gray-300 w-2"}`} />
        ))}
      </div>

      <div className="md:hidden flex gap-2.5 overflow-x-auto px-0.5 pb-2 pt-1 scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" }}>
        {media.map((item, i) => {
          const isActive = activeImg === i;
          return (
            <button key={i} onClick={() => setActiveImg(i)} aria-label={`Thumbnail ${i + 1}`}
              className={`relative flex-shrink-0 w-[62px] h-[72px] rounded-xl border-2 overflow-hidden transition-all ${isActive ? "border-gray-900 shadow-sm" : "border-gray-200"}`}>
              {item.type === "video" ? (
                <div className="relative w-full h-full bg-gray-900">
                  {item.poster && <Image src={item.poster} alt="video thumb" fill className="object-contain opacity-80" />}
                  <PlayIcon />
                </div>
              ) : (
                <div className="relative w-full h-full bg-white">
                  <Image src={item.src} alt={`thumb ${i + 1}`} fill className="object-contain p-1" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Star Rating ────────────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded gap-1">
        <span>{rating}</span>
        <svg className="w-3 h-3 fill-white" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>
      <span className="text-sm text-gray-500">{count.toLocaleString()} Ratings</span>
    </div>
  );
}

// ── Delivery Speed Selector ────────────────────────────────────────────────────

function DeliverySelector({ selected, onSelect, sameDayTurnaround, quantity, pricePerUnit }: {
  selected: "standard" | "sameday";
  onSelect: (v: "standard" | "sameday") => void;
  sameDayTurnaround?: string;
  quantity: number;
  pricePerUnit: number;
}) {
  const [pincode, setPincode]             = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");

  const checkPincode = () => {
    if (pincode.length !== 6) return;
    setPincodeStatus("checking");
    setTimeout(() => {
      setPincodeStatus(MUMBAI_PINCODES.has(pincode) ? "available" : "unavailable");
    }, 600);
  };

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2.5">Delivery Speed</p>
      <div className="flex gap-3 mb-3">
        <button onClick={() => onSelect("standard")}
          className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all text-left ${selected === "standard" ? "border-blue-500 bg-blue-50 text-blue-800" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}>
          <div className="font-semibold">Standard</div>
          <div className="text-xs text-gray-500 mt-0.5">5-7 business days · Free</div>
        </button>
        <button onClick={() => onSelect("sameday")}
          className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all text-left ${selected === "sameday" ? "border-blue-500 bg-blue-50 text-blue-800" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}>
          <div className="font-semibold flex items-center gap-1.5">
            Same Day
            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded">Mumbai only</span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {sameDayTurnaround ?? "By 8 PM today"} · +₹{SAME_DAY_SURCHARGE}/pc
          </div>
          {selected === "sameday" && (
            <div className="text-xs font-bold text-blue-700 mt-1">Extra: {formatPrice(SAME_DAY_SURCHARGE * quantity)} total</div>
          )}
        </button>
      </div>
      {selected === "sameday" && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-orange-800 mb-2">Check same-day availability in your area</p>
          <div className="flex gap-2">
            <input type="text" placeholder="Enter pincode" maxLength={6} value={pincode}
              onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "")); setPincodeStatus("idle"); }}
              className="flex-1 border border-orange-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 bg-white" />
            <button onClick={checkPincode} disabled={pincode.length !== 6}
              className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
              Check
            </button>
          </div>
          {pincodeStatus === "checking" && (
            <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
              <span className="inline-block w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
              Checking availability…
            </p>
          )}
          {pincodeStatus === "available"   && <p className="text-xs text-green-700 font-semibold mt-2">✓ Same-day delivery available for {pincode}!</p>}
          {pincodeStatus === "unavailable" && <p className="text-xs text-red-600 font-semibold mt-2">✗ Not available for {pincode}. Only Mumbai pincodes are eligible.</p>}
        </div>
      )}
    </div>
  );
}

// ── Quantity Tier Selector ─────────────────────────────────────────────────────

function QuantityTierSelector({ displayPrice, quantity, setQuantity }: {
  displayPrice: number; quantity: number; setQuantity: (q: number) => void;
}) {
  const activeTier = QTY_TIERS.reduce((acc, t) => (quantity >= t.minQty ? t : acc), QTY_TIERS[0]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-sm font-semibold text-gray-700">Quantity</p>
        {activeTier.discount > 0 && (
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{activeTier.discount}% OFF applied</span>
        )}
      </div>
      <div className="relative mb-3">
        <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full appearance-none border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-gray-800 bg-white outline-none focus:border-gray-700 cursor-pointer">
          {QTY_TIERS.map((tier) => {
            const price = getPricePerUnit(displayPrice, tier.minQty);
            return (
              <option key={tier.minQty} value={tier.minQty}>
                {tier.minQty} {tier.minQty === 1 ? "pc" : "pcs"} — {formatPrice(price)}/unit
                {tier.discount > 0 ? ` (${tier.discount}% off)` : ""}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-11 h-11 flex items-center justify-center text-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">−</button>
          <input type="number" min={1} value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 text-center font-bold text-lg border-none outline-none" />
          <button onClick={() => setQuantity(quantity + 1)}
            className="w-11 h-11 flex items-center justify-center text-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">+</button>
        </div>
        <p className="text-xs text-gray-400">Adjust exact quantity</p>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {QTY_TIERS.map((tier) => {
          const isActive  = quantity >= tier.minQty;
          const isCurrent = activeTier.minQty === tier.minQty;
          return (
            <button key={tier.minQty} onClick={() => setQuantity(tier.minQty)}
              className={`py-1 rounded text-[10px] font-semibold transition-all ${isCurrent ? "bg-gray-900 text-white" : isActive ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
              title={tier.discount > 0 ? `${tier.discount}% discount` : "No discount"}>
              {tier.minQty}
              {tier.discount > 0 && <span className="block text-[8px] leading-none mt-0.5 opacity-80">-{tier.discount}%</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Order Modal ────────────────────────────────────────────────────────────────

function OrderModal({ product, quantity, pricePerUnit, deliveryType, selectedSize, selectedColor, loggedInUser, onClose }: {
  product: Product; quantity: number; pricePerUnit: number;
  deliveryType: "standard" | "sameday"; selectedSize: string | null;
  selectedColor: string | null; loggedInUser: { name: string; email?: string; phone?: string } | null;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"address" | "payment" | "processing" | "success">("address");
  const [confirmedOrderRef, setConfirmedOrderRef] = useState("");
  const [address, setAddress] = useState({
    name: loggedInUser?.name ?? "", phone: loggedInUser?.phone ?? "",
    email: loggedInUser?.email ?? "", pincode: "", city: "", state: "", line1: "", line2: "",
  });
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [paymentError, setPaymentError] = useState("");

  const totalBeforeSurcharge = pricePerUnit * quantity;
  const sameDayCharge        = deliveryType === "sameday" ? SAME_DAY_SURCHARGE * quantity : 0;
  const grandTotal           = totalBeforeSurcharge + sameDayCharge;
  const grandTotalPaise      = grandTotal * 100;

  useEffect(() => {
    const script = document.createElement("script");
    script.src   = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const validateAddress = () => {
    const e: Record<string, string> = {};
    if (!address.name.trim())                  e.name    = "Name is required";
    if (!address.phone.match(/^[6-9]\d{9}$/)) e.phone   = "Enter valid 10-digit mobile number";
    if (!address.pincode.match(/^\d{6}$/))     e.pincode = "Enter valid 6-digit pincode";
    if (!address.city.trim())                  e.city    = "City is required";
    if (!address.state.trim())                 e.state   = "State is required";
    if (!address.line1.trim())                 e.line1   = "Address line 1 is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRazorpay = async () => {
    setStep("processing");
    setPaymentError("");
    const orderRef   = `CLU-${Date.now()}`;
    const productUrl = `${window.location.origin}/products/${product.slug}`;
    const orderPayload = {
      orderRef,
      product: { id: product.id, name: product.name, slug: product.slug, url: productUrl },
      quantity, selectedSize, selectedColor, deliveryType, pricePerUnit, sameDayCharge, grandTotal,
      address: { line1: address.line1, line2: address.line2, city: address.city, state: address.state, pincode: address.pincode },
      customer: { name: address.name, phone: address.phone, email: address.email },
    };
    try {
      const orderRes = await fetch("/api/create-razorpay-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: grandTotalPaise, currency: "INR", receipt: orderRef, ...orderPayload,
          notes: { product: product.name, productSlug: product.slug, productUrl, quantity,
            size: selectedSize ?? "", color: selectedColor ?? "", deliveryType,
            customerName: address.name, phone: address.phone, email: address.email },
        }),
      });
      const order = await orderRes.json();
      if (!order.id) throw new Error("Failed to create Razorpay order");
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: grandTotalPaise, currency: "INR", name: "CluesStyle",
        description: `${product.name} × ${quantity}`, order_id: order.id,
        prefill: { name: address.name, contact: address.phone, email: address.email },
        notes: { address: `${address.line1}, ${address.city}, ${address.state} - ${address.pincode}` },
        theme: { color: "#111827" },
        handler: (response: any) => {
          fetch("/api/verify-razorpay-payment", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature, ...orderPayload }),
          })
            .then(() => { setConfirmedOrderRef(orderRef); setStep("success"); })
            .catch(() => { setConfirmedOrderRef(orderRef); setStep("success"); });
        },
        modal: { ondismiss: () => setStep("payment") },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setPaymentError(err.message ?? "Payment failed. Please try again.");
      setStep("payment");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-bold text-gray-900">
            {step === "address" && "Delivery Details"}
            {step === "payment" && "Order Summary"}
            {step === "processing" && "Processing…"}
            {step === "success" && "Order Confirmed 🎉"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">✕</button>
        </div>
        <div className="px-5 py-5 space-y-4">
          {step === "address" && (
            <>
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white border flex-shrink-0">
                  <Image src={product.images[0]} alt={product.name} fill className="object-contain p-1" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-500">{quantity} pcs · {selectedSize ?? "No size"} · {selectedColor ?? "Default"}</p>
                  <p className="text-sm font-bold text-gray-900">{formatPrice(grandTotal)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Full Name *</label>
                  <input value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    placeholder="As per ID"
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-700 ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Mobile Number *</label>
                  <input value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    placeholder="10-digit mobile"
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-700 ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Email <span className="text-gray-400 font-normal">(invoice will be sent here)</span>
                  </label>
                  <input type="email" value={address.email} onChange={(e) => setAddress({ ...address, email: e.target.value })}
                    placeholder="you@email.com"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-700" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Address Line 1 *</label>
                  <input value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    placeholder="House/Flat No, Building, Street"
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-700 ${errors.line1 ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                  {errors.line1 && <p className="text-red-500 text-xs mt-1">{errors.line1}</p>}
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Address Line 2</label>
                  <input value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                    placeholder="Landmark, Area (optional)"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-700" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Pincode *</label>
                  <input value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    placeholder="6-digit pincode"
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-700 ${errors.pincode ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">City *</label>
                  <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="City"
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-700 ${errors.city ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">State *</label>
                  <select value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-700 bg-white ${errors.state ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
                    <option value="">Select state</option>
                    {["Maharashtra","Delhi","Karnataka","Tamil Nadu","Gujarat","Rajasthan","Uttar Pradesh","West Bengal","Telangana","Kerala","Madhya Pradesh","Punjab","Haryana","Bihar","Andhra Pradesh","Odisha","Jharkhand","Assam","Chhattisgarh","Uttarakhand","Himachal Pradesh","Goa","Tripura","Meghalaya","Manipur","Nagaland","Arunachal Pradesh","Mizoram","Sikkim","J&K","Ladakh"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
              </div>
              <button onClick={() => { if (validateAddress()) setStep("payment"); }}
                className="w-full py-3.5 bg-gray-900 text-white font-bold text-sm rounded-2xl hover:bg-gray-700 transition-colors mt-2">
                Continue to Payment →
              </button>
            </>
          )}
          {step === "payment" && (
            <>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                <h3 className="text-sm font-bold text-gray-800 mb-1">Order Summary</h3>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{product.name} × {quantity}</span>
                  <span className="font-medium">{formatPrice(totalBeforeSurcharge)}</span>
                </div>
                {sameDayCharge > 0 && (
                  <div className="flex justify-between text-sm text-orange-700">
                    <span>Same-day delivery charge</span>
                    <span className="font-medium">{formatPrice(sameDayCharge)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span><span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>GST (18%)</span><span className="font-medium text-gray-500">Included</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span><span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-sm">
                <p className="font-semibold text-blue-800 mb-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  Delivering to {address.name}
                </p>
                <p className="text-blue-700 text-xs">
                  {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} — {address.pincode}
                </p>
                {address.email && <p className="text-blue-600 text-xs mt-0.5">📧 Invoice to: {address.email}</p>}
                <button onClick={() => setStep("address")} className="text-blue-600 text-xs font-semibold mt-1 underline">Change details</button>
              </div>
              {paymentError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{paymentError}</div>
              )}
              <button onClick={handleRazorpay}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
                Pay {formatPrice(grandTotal)} via Razorpay
              </button>
              <p className="text-center text-xs text-gray-400">🔒 100% secure · UPI, Cards, NetBanking, Wallets accepted</p>
            </>
          )}
          {step === "processing" && (
            <div className="py-10 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
              <p className="text-sm font-semibold text-gray-700">Opening Razorpay…</p>
              <p className="text-xs text-gray-400 text-center">Please complete payment in the Razorpay window. Do not close this page.</p>
            </div>
          )}
          {step === "success" && (
            <div className="py-8 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Payment Successful!</h3>
                <p className="text-sm text-gray-500 mt-1">Your order for <strong>{quantity} × {product.name}</strong> has been placed.</p>
                {confirmedOrderRef && <p className="text-xs text-gray-400 mt-1">Order ID: <span className="font-mono font-semibold">{confirmedOrderRef}</span></p>}
                {address.email && <p className="text-xs text-gray-400 mt-1">Invoice sent to <strong>{address.email}</strong></p>}
              </div>
              <div className="bg-gray-50 rounded-xl p-3 w-full text-left text-sm space-y-1">
                <div className="flex justify-between text-gray-600"><span>Amount Paid</span><span className="font-bold text-gray-900">{formatPrice(grandTotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Delivery</span><span className="font-medium">{deliveryType === "sameday" ? "Same Day (by 8 PM)" : "Standard (5-7 days)"}</span></div>
                <div className="flex justify-between text-gray-600"><span>Ship to</span><span className="font-medium text-right max-w-[60%]">{address.city}, {address.state}</span></div>
              </div>
              <button onClick={onClose} className="w-full py-3 bg-gray-900 text-white font-bold text-sm rounded-2xl hover:bg-gray-700 transition-colors">
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Auth Gate Modal ────────────────────────────────────────────────────────────

function AuthGateModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Login Required</h3>
        <p className="text-sm text-gray-500 mb-5">Please login or create an account to place your order.</p>
        <div className="flex gap-3">
          <Link href="/account" className="flex-1 py-3 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-700 transition-colors text-center">Login</Link>
          <Link href="/account" className="flex-1 py-3 border-2 border-gray-900 text-gray-900 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors text-center">Sign Up</Link>
        </div>
        <button onClick={onClose} className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline">Continue browsing</button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params  = useParams();
  const slug    = params.slug as string;
  const product = productsData.find((p) => p.slug === slug) ?? productsData[0];

  const [activeImg,      setActiveImg]      = useState(0);
  const [selectedColor,  setSelectedColor]  = useState<string | null>(product.colors?.[0]?.label ?? null);
  const [selectedSize,   setSelectedSize]   = useState<string | null>(null);
  const [quantity,       setQuantity]       = useState(product.quantityReq || 1);
  const [wishlist,       setWishlist]       = useState(false);
  const [sizeError,      setSizeError]      = useState(false);
  const [activeTab,      setActiveTab]      = useState<"details" | "shipping" | "returns">("details");
  const [showSizeGuide,  setShowSizeGuide]  = useState(false);
  const [deliveryType,   setDeliveryType]   = useState<"standard" | "sameday">("standard");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showAuthModal,  setShowAuthModal]  = useState(false);
  const [isLoggedIn,     setIsLoggedIn]     = useState(false);
  const [loggedInUser,   setLoggedInUser]   = useState<{ name: string; email?: string; phone?: string } | null>(null);

  const media = resolveMedia(product, selectedColor);

  useEffect(() => { setActiveImg(0); }, [selectedColor]);

  useEffect(() => {
    (async () => {
      try {
        const token   = localStorage.getItem("token");
        const userRaw = localStorage.getItem("user");
        if (!token || !userRaw) return;
        const stored = JSON.parse(userRaw);
        setIsLoggedIn(true);
        const res = await fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const fresh = await res.json();
          setLoggedInUser({ name: fresh.name ?? stored.name ?? "", email: fresh.email ?? stored.email ?? "", phone: fresh.phone ?? stored.phone ?? "" });
        } else {
          setLoggedInUser({ name: stored.name ?? "", email: stored.email ?? "", phone: stored.phone ?? "" });
        }
      } catch { setIsLoggedIn(false); }
    })();
  }, []);

  useEffect(() => {
    if (!product.sameDayAvailable && deliveryType === "sameday") setDeliveryType("standard");
  }, [product.sameDayAvailable, deliveryType]);

  const pricePerUnit  = getPricePerUnit(product.displayPrice, quantity);
  const sameDayCharge = deliveryType === "sameday" ? SAME_DAY_SURCHARGE * quantity : 0;
  const totalPrice    = pricePerUnit * quantity + sameDayCharge;
  const discountPct   = getDiscountForQty(quantity);

  const handleOrderNow = () => {
    if (product.sizes && !selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    if (!isLoggedIn) { setShowAuthModal(true); return; }
    setShowOrderModal(true);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10 text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>›</span>
        <Link href="/products/umbrella-collection" className="hover:text-gray-700">Caps Collection</Link>
        <span>›</span>
        <Link href="/products/umbrella-collection/mini-travel-umbrella" className="hover:text-gray-700">{product.category}</Link>
        <span>›</span>
        <span className="text-gray-600 truncate max-w-xs">{product.name}</span>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-[100px_1fr] lg:grid-cols-[130px_540px_1fr] gap-6 md:items-start">
        <ThumbnailStrip media={media} activeImg={activeImg} setActiveImg={setActiveImg} />
        <div>
          <MainViewer media={media} activeImg={activeImg} setActiveImg={setActiveImg}
            badge={product.badge} wishlist={wishlist} setWishlist={setWishlist} />
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-gray-900 mb-3">{product.name}</h1>
            {product.rating && <StarRating rating={product.rating} count={product.reviewCount!} />}
          </div>

          <div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(pricePerUnit)}</span>
              <span className="text-base text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
              {discountPct > 0 && <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">{discountPct}% OFF</span>}
            </div>
            <span className="text-[13px] text-gray-400 mt-0.5 block">per piece · excl. GST</span>
            {discountPct > 0 && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                You save {formatPrice((product.displayPrice - pricePerUnit) * quantity)} on this order!
              </p>
            )}
          </div>

          {quantity >= 25 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Bulk deal active! <strong>{discountPct}% off</strong> at {quantity} pcs → {formatPrice(pricePerUnit)}/pc</span>
            </div>
          )}

          {product.colors && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2.5">
                Color: <span className="font-normal text-gray-500">{selectedColor ?? "Select"}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((c) => (
                  <button key={c.label} onClick={() => setSelectedColor(c.label)} title={c.label}
                    className={`relative w-7 h-7 rounded-md border-2 transition-all ${selectedColor === c.label ? "border-gray-900 ring-2 ring-offset-1 ring-gray-400 scale-110" : "border-gray-200 hover:border-gray-400 hover:scale-105"}`}
                    style={{ backgroundColor: c.hex }} aria-label={c.label}>
                    {selectedColor === c.label && (
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg className="w-3.5 h-3.5 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {product.colors.find((c) => c.label === selectedColor)?.media && (
                <p className="text-[11px] text-blue-600 mt-1.5 font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                  </svg>
                  Showing photos for {selectedColor}
                </p>
              )}
            </div>
          )}

          {product.sizes && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-sm font-semibold text-gray-700">Size: <span className="font-normal text-gray-500">{selectedSize ?? "Select"}</span></p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => { setSelectedSize(s); setSizeError(false); }}
                    className={`min-w-[48px] h-11 px-3 rounded-xl border-2 text-sm font-medium transition-all ${selectedSize === s ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-700 hover:border-gray-400"}`}>
                    {s}
                  </button>
                ))}
                <button onClick={() => setShowSizeGuide(true)}
                  className="flex items-center h-[44px] gap-1.5 bg-gray-800 text-white px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-black transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6.75h18M3 12h18M3 17.25h18" />
                  </svg>
                  Size Guide
                </button>
              </div>
              {sizeError && <p className="text-red-500 text-xs mt-1.5">Please select a size to continue.</p>}
            </div>
          )}

          {product.sameDayAvailable ? (
            <DeliverySelector selected={deliveryType} onSelect={setDeliveryType}
              sameDayTurnaround={product.sameDayTurnaround} quantity={quantity} pricePerUnit={pricePerUnit} />
          ) : (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2.5">Delivery</p>
              <div className="py-3 px-4 rounded-xl border-2 border-blue-500 bg-blue-50 text-sm text-blue-800">
                <div className="font-semibold">Standard Delivery</div>
                <div className="text-xs text-gray-500 mt-0.5">{product.turnaround ?? "5-7 business days"} · Free</div>
              </div>
            </div>
          )}

          <QuantityTierSelector displayPrice={product.displayPrice} quantity={quantity} setQuantity={setQuantity} />

          <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Order Total</p>
              <p className="text-xl font-bold text-gray-900">{formatPrice(totalPrice)}</p>
              {deliveryType === "sameday" && <p className="text-xs text-orange-600">incl. same-day delivery charge</p>}
            </div>
            {discountPct > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-400">You save</p>
                <p className="text-sm font-bold text-green-600">{formatPrice((product.displayPrice - pricePerUnit) * quantity)}</p>
              </div>
            )}
          </div>

          <div className={`flex gap-3 py-4 border-y border-gray-100 ${product.customizable ? "" : "justify-end"}`}>
            {product.customizable && (
              <Link href="/customized-your-t-shirt"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-sm transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
                Customize Now
              </Link>
            )}
            <button onClick={handleOrderNow}
              className={`${product.customizable ? "flex-1" : "w-full"} flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gray-900 hover:bg-gray-700 text-white font-bold text-sm transition-all`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
              Order Now
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1 py-1">
            {[
              { path: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", label: "100% Secure" },
              { path: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12", label: "Free Shipping*" },
              { path: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z", label: "Fast Delivery*" },
              { path: "M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3", label: "Easy Returns" },
            ].map((t) => (
              <div key={t.label} className="flex flex-col items-center gap-1 text-center">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={t.path} />
                </svg>
                <span className="text-[11px] text-gray-500">{t.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {[
              {
                key: "details", icon: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12",
                title: "Product Description", sub: "(Manufacture, Care and Fit)",
                content: (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <div><span className="text-gray-400 text-xs">Material</span><p className="font-medium text-gray-800 mt-0.5">{product.material}</p></div>
                      <div><span className="text-gray-400 text-xs">Print method</span><p className="font-medium text-gray-800 mt-0.5">Screen Printing</p></div>
                      <div><span className="text-gray-400 text-xs">Min order</span><p className="font-medium text-gray-800 mt-0.5">{product.quantityReq} piece</p></div>
                      <div><span className="text-gray-400 text-xs">Category</span><p className="font-medium text-gray-800 mt-0.5">{product.category}</p></div>
                    </div>
                    <hr className="border-gray-100" />
                    <ul className="space-y-1.5">
                      {product.features?.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              },
              {
                key: "shipping", icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12",
                title: "Shipping Info", sub: "(Delivery timelines and coverage)",
                content: (
                  <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                    <p>Free shipping on orders above ₹5,000. Standard delivery in {product.turnaround}.</p>
                    <p>Express delivery available at checkout. Pan India coverage.</p>
                    <p>Bulk orders above 100 pieces get priority dispatch.</p>
                  </div>
                ),
              },
              {
                key: "returns", icon: "M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3",
                title: "15 Day Returns", sub: "(Know about return & exchange policy)",
                content: (
                  <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                    <p>Defective or wrong products are eligible for free return within 15 days of delivery.</p>
                    <p>Custom/personalized items are non-returnable unless defective.</p>
                    <p>Contact support within 48 hours of receiving a defective product.</p>
                  </div>
                ),
              },
            ].map(({ key, icon, title, sub, content }) => (
              <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setActiveTab(activeTab === key as any ? "none" as any : key as any)}
                  className="w-full h-[50px] flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                  <div className="flex-1">
                    <span className="text-[16px] font-bold text-gray-800">{title} </span>
                    <span className="text-xs text-gray-400">{sub}</span>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${activeTab === key ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {activeTab === key && <div className="px-4 pb-4 border-t border-gray-100 pt-3">{content}</div>}
              </div>
            ))}
          </div>
        </div>
      </main>

      {showSizeGuide && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowSizeGuide(false)}>
          <div className="relative bg-white rounded-2xl p-4 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowSizeGuide(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">✕</button>
            <h3 className="text-lg font-bold mb-4">Size Guide</h3>
            <div className="relative w-full h-[500px]">
              <Image src="/tote-bag/size-chart.webp" alt="Size Guide" fill className="object-contain" />
            </div>
          </div>
        </div>
      )}

      {showAuthModal  && <AuthGateModal onClose={() => setShowAuthModal(false)} />}
      {showOrderModal && (
        <OrderModal product={product} quantity={quantity} pricePerUnit={pricePerUnit}
          deliveryType={deliveryType} selectedSize={selectedSize} selectedColor={selectedColor}
          loggedInUser={loggedInUser} onClose={() => setShowOrderModal(false)} />
      )}
    </div>
  );
}