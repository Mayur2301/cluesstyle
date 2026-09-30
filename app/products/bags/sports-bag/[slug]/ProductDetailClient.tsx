// PATH: app/products/bags/sports-bag/[slug]/ProductDetailClient.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CareInstructions from "@/app/components/warrenty";

import RecentlyViewed from "@/app/components/RecentlyViewed";
import ProductReviews from "@/app/components/ProductReviews";
import { productsData, DEFAULT_OFFER, type Product, type MediaItem, type Offer, type FabricSubCategoryMap } from "@/app/lib/sports-bag-collections";
import {
  COST_PER_UNIT,
  SAME_DAY_SURCHARGE,
  QTY_TIERS,
  MUMBAI_PINCODES,
  SAME_DAY_SLOTS,
  isSlotPast,
  getDiscountForQty,
  getPricePerUnit,
  computeOrderTotal,
} from "@/app/lib/pricing";
import { addToCart } from "@/app/lib/cart";

// ── Helpers ────────────────────────────────────────────────────────────────────

function resolveMedia(product: Product, selectedColorLabel: string | null): MediaItem[] {
  if (selectedColorLabel && product.colors) {
    const colorObj = product.colors.find((c) => c.label === selectedColorLabel);
    if (colorObj?.media && colorObj.media.length > 0) return colorObj.media;
  }
  if (product.media && product.media.length > 0) return product.media;
  return product.images.map((src) => ({ type: "image" as const, src }));
}

// Blank (unprinted) shirt for the selected colour — pulled straight from
// that color's blankMedia array. Used only in the logo live-preview canvas.
function resolveBlankMedia(product: Product, selectedColorLabel: string | null): MediaItem[] {
  if (selectedColorLabel && product.colors) {
    const colorObj = product.colors.find((c) => c.label === selectedColorLabel);
    if (colorObj?.blankMedia && colorObj.blankMedia.length > 0) return colorObj.blankMedia;
  }
  return [];
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

// ── Price Offer Modal ──────────────────────────────────────────────────────────

function PriceOfferModal({
  pricePerUnit,
  originalPrice,
  offer,
}: {
  pricePerUnit: number;
  originalPrice: number;
  offer: Offer;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(offer.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
          relative inline-flex items-center gap-1
          px-3.5 py-2 text-sm cursor-pointer
          text-purple-700
          bg-gradient-to-r
          from-purple-100
          via-purple-50
          to-white
        "
        style={{ borderRadius: "4px 18px 18px 18px" }}
      >
        <div
          className="absolute -top-2 left-2.5"
          style={{
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "4px solid transparent",
            borderBottom: "10px solid #E9D5FF",
          }}
        />
        <span>Get it for as low as</span>
        <span className="font-bold">{formatPrice(pricePerUnit)}</span>
        <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full border-[1.5px] border-current text-[11px] font-semibold ml-0.5 shrink-0">
          i
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm overflow-visible relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#F0EEFF] rounded-t-2xl px-5 pt-10 pb-5 text-center relative">
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 bg-[#C89B3C] border-[3px] border-[#E8C86A] rounded-full flex items-center justify-center z-10">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
                </svg>
              </div>
              <span className="absolute top-3 left-[calc(50%-40px)] text-[#C89B3C] text-xs select-none">✦</span>
              <span className="absolute top-2 right-[calc(50%-40px)] text-[#C89B3C] text-[9px] select-none">✦</span>
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-gray-600 text-sm font-semibold transition-colors"
              >
                ✕
              </button>
              <h3 className="text-[17px] font-bold text-gray-900 mt-1">
                How to get it for {formatPrice(pricePerUnit)}{" "}
                <span className="line-through text-gray-400 font-normal text-[15px]">{formatPrice(originalPrice)}</span>?
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Use the below offer to save extra{" "}
                <span className="text-blue-600 font-semibold">{formatPrice(offer.saveAmount)}</span>
              </p>
            </div>
            <div className="p-4">
              <div className="border border-dashed border-gray-300 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
                      </svg>
                    </div>
                    <span className="font-bold text-gray-900 tracking-wide text-[15px]">{offer.code}</span>
                    <button onClick={handleCopy} className="text-gray-400 hover:text-gray-700 transition-colors" title="Copy code">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                      </svg>
                    </button>
                    {copied && <span className="text-xs text-green-600 font-semibold">Copied!</span>}
                  </div>
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                    Save {formatPrice(offer.saveAmount)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{offer.description}</p>
                <hr className="border-dashed border-gray-200 my-2.5" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">*Use coupon code in cart</span>
                  <button
                    onClick={() => setDetailsOpen(!detailsOpen)}
                    className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-800 transition-colors"
                  >
                    Details
                    <svg className={`w-3 h-3 transition-transform ${detailsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>
                {detailsOpen && (
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed border-t border-dashed border-gray-200 pt-2">
                    Valid on prepaid orders only. Cannot be clubbed with other offers. Applicable on minimum cart value of {formatPrice(offer.minOrder)}. Discount capped at {formatPrice(offer.saveAmount)}.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
        <div className="rounded-xl border border-gray-200 shadow-2xl overflow-hidden bg-white hidden lg:block"
          style={{ ...panelStyle, zIndex: 99999, backgroundImage: `url(${src})`, backgroundRepeat: "no-repeat",
            backgroundSize: `${480 * ZOOM}px ${480 * ZOOM}px`, backgroundPosition: `${bgX}px ${bgY}px`, pointerEvents: "none" }} />,
        document.body
      )
    : null;

  return (
    <div className="relative w-full h-full group/magnifier">
      <div ref={containerRef} className="relative w-full h-full lg:cursor-crosshair select-none"
        onMouseMove={handleMouseMove} onMouseEnter={() => setShowLens(true)} onMouseLeave={() => setShowLens(false)}>
        <Image src={src} alt={alt} fill className="object-contain pt-4 px-4 sm:pt-6 sm:px-6" draggable={false} priority />
        {showLens && (
          <div className="absolute border-2 border-gray-400/60 bg-blue-100/20 pointer-events-none rounded-sm hidden lg:block"
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
              className={`relative w-[100px] h-[120px] rounded-xl border overflow-hidden flex-shrink-0 transition-all ${isActive ? "border-gray-900 shadow-md" : "border-gray-200 hover:border-gray-400"}`}>
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

function MainViewer({ media, activeImg, setActiveImg, badge, wishlist, setWishlist, rating, reviewCount, sameDayAvailable, onRatingClick, overrideImage }: {
  media: MediaItem[]; activeImg: number; setActiveImg: (i: number) => void;
  badge?: string; wishlist: boolean; setWishlist: (v: boolean) => void;
  rating?: number; reviewCount?: number; sameDayAvailable?: boolean; onRatingClick?: () => void;
  overrideImage?: string | null;
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

        {/* Mobile: rating pill instead of wishlist icon */}
        {rating != null && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRatingClick?.(); }}
            className="sm:hidden absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white rounded-full shadow px-2.5 py-1"
          >
            <svg className="w-3.5 h-3.5 fill-yellow-400 flex-shrink-0" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-bold text-gray-900">{rating}</span>
            {reviewCount != null && (
              <>
                <span className="w-px h-3 bg-gray-300" />
                <span className="text-xs font-semibold text-gray-500">{reviewCount}</span>
              </>
            )}
          </button>
        )}

        {/* Desktop: same-day delivery icon (replaces wishlist) */}
        {sameDayAvailable ? (
          <div className="hidden sm:block absolute top-3 right-3 z-10 group/sameday">
            <div className="w-9 h-9 bg-green-50 border border-green-200 rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform">
              <svg className="w-4.5 h-4.5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L4.5 14h5.4l-1.4 8L19.5 10h-5.4l-1.1-8z" />
              </svg>
            </div>
            <div className="absolute top-11 right-0 z-20 bg-white rounded-lg shadow-xl border border-gray-100 px-2.5 py-1.5 whitespace-nowrap opacity-0 invisible group-hover/sameday:opacity-100 group-hover/sameday:visible transition-all">
              <span className="flex items-center gap-1.5 text-green-600">
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L4.5 14h5.4l-1.4 8L19.5 10h-5.4l-1.1-8z" />
                </svg>
                <span className="text-[11px] font-bold">Same Day Delivery Available</span>
              </span>
            </div>
          </div>
        ) : (
          <button onClick={() => setWishlist(!wishlist)}
            className="hidden sm:flex absolute top-3 right-3 z-10 w-9 h-9 bg-white rounded-full items-center justify-center shadow hover:scale-110 transition-transform">
            <svg className={`w-5 h-5 transition-colors ${wishlist ? "fill-red-500 text-red-500" : "fill-none text-gray-400"}`}
              stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        )}
        {/* Responsive image height: compact on mobile, tall on desktop */}
        <div className="relative w-full h-[380px] sm:h-[480px] md:h-[560px] lg:h-[700px] xl:h-[750px]">
          <div className="absolute inset-0">
           {overrideImage ? (
              <ImageMagnifier key={overrideImage} src={overrideImage} alt="Selected material" />
            ) : current?.type === "video" ? (
              <video ref={videoRef} key={current.src} src={current.src} poster={current.poster} controls
                className="w-full h-full object-contain pt-4 px-4 sm:pt-6 sm:px-6 rounded-2xl" />
            ) : (
              <ImageMagnifier src={current?.src ?? ""} alt="Product" />
            )}
          </div>
        </div>
      </div>

      {/* Mobile dot indicators */}
      <div className="md:hidden flex justify-center items-center gap-2 pt-3 pb-1">
        {media.map((_, i) => (
          <button key={i} onClick={() => setActiveImg(i)} aria-label={`View image ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-200 ${activeImg === i ? "bg-gray-900 w-5" : "bg-gray-300 w-2"}`} />
        ))}
      </div>

      {/* Mobile thumbnail strip */}
      <div className="md:hidden flex gap-2 overflow-x-auto px-0.5 pb-2 pt-1 scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" }}>
        {media.map((item, i) => {
          const isActive = activeImg === i;
          return (
            <button key={i} onClick={() => setActiveImg(i)} aria-label={`Thumbnail ${i + 1}`}
              className={`relative flex-shrink-0 w-[60px] h-[70px] rounded-xl border overflow-hidden transition-all ${isActive ? "border-gray-900 shadow-sm" : "border-gray-200"}`}>
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

function DeliverySelector({ selected, onSelect, sameDayTurnaround, quantity, pricePerUnit, onBorzoCharge, onSlotChange, sameDayAvailable = true, stepNumber = 4 }: {
  selected: "standard" | "sameday";
  onSelect: (v: "standard" | "sameday") => void;
  sameDayTurnaround?: string;
  quantity: number;
  pricePerUnit: number;
  onBorzoCharge: (charge: number) => void;
  onSlotChange?: (slotId: string | null) => void;
  sameDayAvailable?: boolean;
  stepNumber?: number;
})  {
  const [pincode, setPincode]             = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
const [borzoCharge, setBorzoCharge] = useState<number | null>(null);  // ← move here
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const handleSelectSlot = (slotId: string) => {
    setSelectedSlotId(slotId);
    onSlotChange?.(slotId);
  };
  const checkPincode = async () => {
    if (pincode.length !== 6) return;

    // Client-side check first — instant feedback before hitting Borzo API
   if (!MUMBAI_PINCODES.has(pincode.trim())) {
      setPincodeStatus("unavailable");
      setSelectedSlotId(null);
      onSlotChange?.(null);
      return;
    }
console.log("Checking pincode:", JSON.stringify(pincode), "Found:", MUMBAI_PINCODES.has(pincode.trim()));
    setPincodeStatus("checking");
    try {
      const res = await fetch("/api/borzo-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode, city: "Mumbai", state: "Maharashtra", quantity }),
      });

      if (res.ok) {
        const data = await res.json() as { charge: number };
        setBorzoCharge(data.charge);
        onBorzoCharge(data.charge);
        setPincodeStatus("available");
      } else {
        setPincodeStatus("unavailable");
        setSelectedSlotId(null);
        onSlotChange?.(null);
      }
    } catch {
      setPincodeStatus("unavailable");
      setSelectedSlotId(null);
      onSlotChange?.(null);
    }
  };

  const handleStandardSelect = () => {
    onSelect("standard");
    setSelectedSlotId(null);
    onSlotChange?.(null);
  };

  return (
    <div>
       <span className="text-sm font-bold text-[#000] uppercase tracking-wide mb-3 block">{stepNumber}. Delivery Speed</span>
      {sameDayAvailable && (
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-green-600 mb-2.5">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Available for same day Delivery
        </span>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
  {/* Standard Delivery */}
  <button
    onClick={handleStandardSelect}
    className={`flex-1 py-3.5 px-4 rounded-xl border-1 transition-all text-left ${
      selected === "standard"
        ? "border-orange-200 bg-orange-50"
        : "border-gray-100 bg-white hover:border-gray-100"
    }`}
  >
    <div className="flex items-center gap-3">
      <span className={`w-5 h-5 rounded-full border-1 flex items-center justify-center flex-shrink-0 ${
        selected === "standard" ? "border-orange-100" : "border-gray-300"
      }`}>
        {selected === "standard" && <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
      </span>

      <span className="w-11 h-11 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
        <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      </span>

      <div className="text-left">
        <div className="font-bold text-[15px] text-gray-900">
          Standard Delivery
        </div>
        <div className="text-[13px] text-gray-500 mt-0.5">
          5-7 business days · Free Shipping
        </div>
      </div>
    </div>
  </button>

  {/* Same Day Delivery */}
  {sameDayAvailable && (
  <button
    onClick={() => onSelect("sameday")}
    className={`flex-1 py-3.5 px-4 rounded-xl border-1 transition-all text-left ${
      selected === "sameday"
        ? "border-green-200 bg-green-50"
        : "border-gray-200 bg-white hover:border-gray-100"
    }`}
  >
    <div className="flex items-center gap-3">
      <span className={`w-5 h-5 rounded-full border-1 flex items-center justify-center flex-shrink-0 ${
        selected === "sameday" ? "border-green-100" : "border-gray-300"
      }`}>
        {selected === "sameday" && <span className="w-2.5 h-2.5 rounded-full bg-green-500" />}
      </span>

      <span className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      </span>

      <div className="text-left">
        <div className="font-bold text-[15px] text-gray-900 flex items-center gap-1.5 flex-wrap">
          Same Day Delivery
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Mumbai only
          </span>
        </div>

        <div className="text-[13px] text-gray-500 mt-0.5">
        {sameDayTurnaround ?? "By 8 PM today"} ·{" "}
        {borzoCharge !== null ? `+₹${borzoCharge} delivery` : "Mumbai only"}
      </div>

       {selected === "sameday" && borzoCharge !== null && (
          <div className="text-xs font-bold text-green-700 mt-1">
            Delivery charge: {formatPrice(borzoCharge)}
          </div>
        )}
      </div>
    </div>
  </button>
  )}
</div>
      {selected === "sameday" && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mt-2">
          <p className="text-xs font-semibold text-orange-800 mb-2">Check same-day availability in your area</p>
          <div className="flex gap-2">
            <input type="text" placeholder="Enter pincode" maxLength={6} value={pincode}
              onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "")); setPincodeStatus("idle"); setSelectedSlotId(null); onSlotChange?.(null); }}
              className="flex-1 border border-orange-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 bg-white min-w-0" />
            <button onClick={checkPincode} disabled={pincode.length !== 6}
              className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
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

          {pincodeStatus === "available" && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-orange-800 mb-2">Choose a delivery slot</p>
              <div className="grid grid-cols-2 gap-2">
                {SAME_DAY_SLOTS.map((slot) => {
                  const past = isSlotPast(slot);
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={past}
                      onClick={() => handleSelectSlot(slot.id)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold text-left transition-all ${
                        past
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                          : isSelected
                            ? "border-orange-500 bg-orange-100 text-orange-800"
                            : "border-orange-200 bg-white text-gray-700 hover:border-orange-400"
                      }`}
                    >
                      {slot.label}
                      {past && <span className="block text-[10px] font-normal text-gray-400">Slot over for today</span>}
                    </button>
                  );
                })}
              </div>
              {!selectedSlotId && (
                <p className="text-[11px] text-orange-600 mt-1.5">Please select a delivery slot to continue.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Quantity Tier Selector ─────────────────────────────────────────────────────

const VISIBLE_TIER_COUNT = 5;

const ORDER_TYPE_INFO: Record<"single" | "bulk", { title: string; subtitle: string; summary: string }> = {
  single: {
    title: "Single Piece",
    subtitle: "Order a single piece with custom print",
    summary: "Order just one cap with your own logo or design — perfect for trying out a print before committing to a bulk order.",
  },
  bulk: {
    title: "Bulk Order",
    subtitle: "Best pricing for bulk quantity",
    summary: "Order 5 or more pieces to unlock tiered pricing — the more you order, the lower the price per unit.",
  },
};

function QuantityTierSelector({ displayPrice, quantity, setQuantity, onOpenSizes, stepNumber = 3 }: {
  displayPrice: number; quantity: number; setQuantity: (q: number) => void; onOpenSizes?: () => void; stepNumber?: number;
}) {
  const bulkMinQty = 3;
  const singleMaxQty = 2;
  const [orderMode, setOrderMode] = useState<"single" | "bulk">(quantity >= bulkMinQty ? "bulk" : "single");
  const [orderInfoOpen, setOrderInfoOpen] = useState<"single" | "bulk" | null>(null);
  const [inputVal, setInputVal] = useState(String(quantity));
  const [showAllTiers, setShowAllTiers] = useState(false);

  useEffect(() => {
    setInputVal(String(quantity));
  }, [quantity]);

  const handleSelectSingle = () => {
    setOrderMode("single");
    const next = quantity >= 1 && quantity <= singleMaxQty ? quantity : 1;
    setQuantity(next);
    setInputVal(String(next));
  };

  const handleSelectBulk = () => {
    setOrderMode("bulk");
    const next = quantity >= bulkMinQty ? quantity : bulkMinQty;
    setQuantity(next);
    setInputVal(String(next));
  };

  const activeTier = QTY_TIERS.reduce((acc, t) => (quantity >= t.minQty ? t : acc), QTY_TIERS[0]);
  const activeTierIndex = QTY_TIERS.findIndex((t) => t.minQty === activeTier.minQty);

  // If a manually typed quantity lands on a tier that's currently hidden
  // (beyond the visible mobile count), auto-expand so it's shown & highlighted.
  useEffect(() => {
    if (activeTierIndex >= VISIBLE_TIER_COUNT) setShowAllTiers(true);
  }, [activeTierIndex]);

  const visibleTiers = showAllTiers ? QTY_TIERS : QTY_TIERS.slice(0, VISIBLE_TIER_COUNT);
  const hiddenTiers = QTY_TIERS.slice(VISIBLE_TIER_COUNT);

  const renderTierCard = (tier: typeof QTY_TIERS[number]) => {
    const isCurrent = activeTier.minQty === tier.minQty;
    const price = getPricePerUnit(displayPrice, tier.minQty);
    return (
      <button
        key={tier.minQty}
        onClick={() => {
          setQuantity(tier.minQty);
          setInputVal(String(tier.minQty));
        }}
        className={`relative flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition-all ${
          isCurrent ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-white hover:border-gray-200"
        }`}
      >
        {isCurrent ? (
          <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
        ) : tier.discount > 0 ? (
          <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap">
            {tier.discount}% OFF
          </span>
        ) : (
          <span className="h-[18px]" />
        )}

        <span className={`text-[15px] font-bold ${isCurrent ? "text-blue-700" : "text-gray-900"}`}>
          {tier.minQty}-{tier.maxQty === Infinity ? "+" : tier.maxQty}
        </span>

        <span className={`text-[11px] font-semibold pt-1.5 pb-1.5 border-t border-b border-dashed w-full text-center ${isCurrent ? "text-blue-600 border-blue-300" : "text-gray-500 border-gray-300"}`}>
          {formatPrice(price)} / unit
        </span>
      </button>
    );
  };

  return (
    <div>
 
       <span className="text-sm font-bold text-[#000] uppercase tracking-wide mb-3 block">{stepNumber}. Quantity</span>

      {/* Single Piece vs Bulk Discount toggle */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
        <button
          onClick={handleSelectSingle}
          className={`relative flex flex-col items-center text-center gap-1.5 sm:flex-row sm:items-center sm:text-left sm:gap-3 rounded-xl border p-2.5 sm:p-3 transition-all min-h-[130px] sm:min-h-[92px] ${
            orderMode === "single" ? "border-blue-400 bg-blue-50/40" : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          {orderInfoOpen === "single" && (
            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOrderInfoOpen(null); }} />
          )}

          <span className="relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16">
            <Image src="/bags/bg-icon-1.webp" alt="Single Piece" fill className="object-contain" />
          </span>
          <div className="min-w-0 px-1 sm:px-0 sm:pr-4">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <span className={`text-[12px] sm:text-[17px] font-bold leading-tight ${orderMode === "single" ? "text-blue-500" : "text-gray-900"}`}>Single Piece</span>
              {orderMode === "single" && (
                <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-grey-500 block leading-snug mt-0.5">Order a single piece with custom print</span>
          </div>
          <span
            role="button"
            tabIndex={0}
            title="About Single Piece"
            onClick={(e) => { e.stopPropagation(); setOrderInfoOpen(orderInfoOpen === "single" ? null : "single"); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setOrderInfoOpen(orderInfoOpen === "single" ? null : "single"); } }}
            className="absolute top-2 right-2 z-40 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm flex-shrink-0"
          >
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </span>

          {orderInfoOpen === "single" && (
            <div
              className="fixed z-50 left-4 right-4 top-1/2 -translate-y-1/2 sm:absolute sm:left-auto sm:right-0 sm:top-10 sm:translate-y-0 w-auto sm:w-60 max-w-sm mx-auto bg-white rounded-xl shadow-xl border border-gray-100 p-3.5 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="block text-[12px] font-bold text-gray-900 mb-1">
                About {ORDER_TYPE_INFO.single.title}
              </span>
              <span className="block text-[10px] text-black leading-relaxed">
                {ORDER_TYPE_INFO.single.summary}
              </span>
            </div>
          )}
        </button>

        <button
          onClick={handleSelectBulk}
          className={`relative flex flex-col items-center text-center gap-1.5 sm:flex-row sm:items-center sm:text-left sm:gap-3 rounded-xl border p-2.5 sm:p-3 transition-all min-h-[130px] sm:min-h-[92px] ${
            orderMode === "bulk" ? "border-blue-400 bg-blue-50/40" : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          {orderInfoOpen === "bulk" && (
            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOrderInfoOpen(null); }} />
          )}

          <span className="relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16">
            <Image src="/bags/bg-icon-2.webp" alt="Bulk Order" fill className="object-contain" />
          </span>
          <div className="min-w-0 px-1 sm:px-0 sm:pr-4">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <span className={`text-[12px] sm:text-[17px] font-bold leading-tight ${orderMode === "bulk" ? "text-blue-500" : "text-gray-900"}`}>Bulk Order</span>
              {orderMode === "bulk" && (
                <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-grey-500 block leading-snug mt-0.5">Best pricing for bulk quantity</span>
          </div>
          <span
            role="button"
            tabIndex={0}
            title="About Bulk Order"
            onClick={(e) => { e.stopPropagation(); setOrderInfoOpen(orderInfoOpen === "bulk" ? null : "bulk"); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setOrderInfoOpen(orderInfoOpen === "bulk" ? null : "bulk"); } }}
            className="absolute top-2 right-2 z-40 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm flex-shrink-0"
          >
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </span>

          {orderInfoOpen === "bulk" && (
            <div
              className="fixed z-50 left-4 right-4 top-1/2 -translate-y-1/2 sm:absolute sm:left-auto sm:right-0 sm:top-10 sm:translate-y-0 w-auto sm:w-60 max-w-sm mx-auto bg-white rounded-xl shadow-xl border border-gray-100 p-3.5 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="block text-[12px] font-bold text-gray-900 mb-1">
                About {ORDER_TYPE_INFO.bulk.title}
              </span>
              <span className="block text-[10px] text-black leading-relaxed">
                {ORDER_TYPE_INFO.bulk.summary}
              </span>
            </div>
          )}
        </button>
      </div>
            
      <div className="flex flex-row items-center gap-2 lg:mt-5 sm:gap-3 mb-3 w-full">
        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden w-fit flex-shrink-0">
          <button
            disabled={orderMode === "single" ? quantity <= 1 : quantity <= bulkMinQty}
            onClick={() => {
              const min = orderMode === "bulk" ? bulkMinQty : 1;
              const next = Math.max(min, quantity - 1);
              setQuantity(next);
              setInputVal(String(next));
            }}
            className="w-11 h-11 flex items-center justify-center text-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            −
          </button>
          <input
            type="number"
            min={orderMode === "bulk" ? bulkMinQty : 1}
            max={orderMode === "single" ? singleMaxQty : undefined}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={() => {
              const parsed = parseInt(inputVal, 10);
              let valid: number;
              if (orderMode === "single") {
                valid = isNaN(parsed) ? 1 : Math.min(singleMaxQty, Math.max(1, parsed));
              } else {
                valid = isNaN(parsed) || parsed < bulkMinQty ? bulkMinQty : parsed;
              }
              setQuantity(valid);
              setInputVal(String(valid));
            }}
            className="w-16 text-center font-bold text-lg border-none outline-none"
          />
          <button
            disabled={orderMode === "single" && quantity >= singleMaxQty}
            onClick={() => {
              const next = quantity + 1;
              setQuantity(next);
              setInputVal(String(next));
            }}
            className="w-11 h-11 flex items-center justify-center text-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            +
          </button>
        </div>
              
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-2 sm:px-3.5 py-2 sm:py-2.5 flex-1 sm:flex-none sm:w-auto sm:max-w-xs min-w-0">
          <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-700 scale-x-[-1]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
            
          </span>
          <span className="text-[10px] sm:text-[13px] font-semibold text-blue-900 leading-snug">
            {orderMode === "single" ? <>Order 1–2 pieces<br /> switch to Bulk for lower pricing</> : <>Get lower price<br /> on higher quantity</>}
          </span>
        </div>
      </div>
     

      {orderMode === "bulk" && (
        <>
          {/* Mobile: collapsible tiers, 3 per row, with a "More Qty" card */}
          <div className="grid grid-cols-3 sm:hidden gap-2">
            {visibleTiers.map(renderTierCard)}

            {hiddenTiers.length > 0 && !showAllTiers && (
              <button
                onClick={() => setShowAllTiers(true)}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-2 py-3 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <span className="flex items-center gap-1 text-sm font-bold text-gray-900">
                  More Qty
                  <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </span>
                <span className="text-[11px] text-gray-400">
                  {hiddenTiers[0].minQty}+
                </span>
              </button>
            )}

            {onOpenSizes && (
              <button
                onClick={onOpenSizes}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-2 py-3 text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <span className="text-[11px] font-semibold">sizes</span>
              </button>
            )}
          </div>

          {/* Desktop: all tiers shown in one row */}
          <div className="hidden sm:grid sm:grid-cols-7 gap-2">
            {QTY_TIERS.map(renderTierCard)}

            {onOpenSizes && (
              <button
                onClick={onOpenSizes}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-2 py-3 text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <span className="text-[11px] font-semibold">sizes</span>
              </button>
            )}
          </div>
        </>
      )}

      {onOpenSizes && orderMode === "single" && (
        <button
          onClick={onOpenSizes}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
        >
          Choose size
        </button>
      )}
    </div>
  );
}


const VISIBLE_SIZE_COUNT = 6;

const SIZE_CHEST_MAP: Record<string, string> = {
  XS: "36\"", S: "38\"", M: "40\"", L: "42\"", XL: "44\"", XXL: "46\"",
  "3XL": "48\"", "4XL": "50\"", "5XL": "52\"", "6XL": "54\"",
};

const SIZE_COLOR_MAP: Record<string, string> = {
  XS: "text-purple-600", S: "text-blue-600", M: "text-green-600",
  L: "text-orange-500", XL: "text-red-500", XXL: "text-pink-600",
};

function SizeQuantityBreakdown({
  sizes, totalQty, sizeQuantities, setSizeQuantities, setShowSizeGuide,
}: {
  sizes: string[];
  totalQty: number;
  sizeQuantities: Record<string, number>;
  setSizeQuantities: (v: Record<string, number>) => void;
  setShowSizeGuide: (v: boolean) => void;
}) {
  const [showAllSizes, setShowAllSizes] = useState(false);
  const allocated = Object.values(sizeQuantities).reduce((a, b) => a + b, 0);
  const remaining = totalQty - allocated;

  const hasMoreSizes = sizes.length > VISIBLE_SIZE_COUNT;
  const visibleSizes = showAllSizes ? sizes : sizes.slice(0, VISIBLE_SIZE_COUNT);
  const hiddenSizes = sizes.slice(VISIBLE_SIZE_COUNT);

  const increment = (size: string) => {
    if (remaining <= 0) return;
    setSizeQuantities({ ...sizeQuantities, [size]: (sizeQuantities[size] || 0) + 1 });
  };
  const decrement = (size: string) => {
    if ((sizeQuantities[size] || 0) <= 0) return;
    setSizeQuantities({ ...sizeQuantities, [size]: sizeQuantities[size] - 1 });
  };

  return (
    <div className="mt-3">
     

      {showAllSizes && hasMoreSizes && (
        <button
          onClick={() => setShowAllSizes(false)}
          className="w-full mt-2 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 transition-colors"
        >
          Show less
          <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      )}

      {(remaining > 0 || allocated > 0) && (
        <div className="flex items-center justify-between gap-2 lg:-mt-[35px]">
          {remaining > 0 ? (
            <span className="text-sm text-orange-600">
              Please allocate all {totalQty} pieces across sizes before proceeding.
            </span>
          ) : <span />}

          {allocated > 0 && (
            <button
              onClick={() => setSizeQuantities({})}
              className="text-xs font-semibold text-gray-500 hover:text-red-600 underline whitespace-nowrap flex-shrink-0"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
// ── Order Modal ────────────────────────────────────────────────────────────────

function OrderModal({ product, productImage, quantity, pricePerUnit, sameDayCharge, deliveryType, selectedSize, selectedColor, loggedInUser, onClose, deliverySlot }: {
  product: Product; productImage: string; quantity: number; pricePerUnit: number; sameDayCharge: number;
  deliveryType: "standard" | "sameday"; selectedSize: string | null;
  selectedColor: string | null; loggedInUser: { name: string; email?: string; phone?: string } | null;
  onClose: () => void;
  // Chosen same-day slot id (see SAME_DAY_SLOTS in pricing.ts) — undefined/null
  // for standard delivery or when the shopper hasn't picked one yet.
  deliverySlot?: string | null;
}) {
  const [step, setStep] = useState<"address" | "payment" | "processing" | "success">("address");
  const [confirmedOrderRef, setConfirmedOrderRef] = useState("");
  const [selectedPayMethod, setSelectedPayMethod] = useState<string>("cards");
  const [address, setAddress] = useState({
    name: loggedInUser?.name ?? "", phone: loggedInUser?.phone ?? "",
    email: loggedInUser?.email ?? "", pincode: "", city: "", state: "", line1: "", line2: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentError, setPaymentError] = useState("");

  const totalBeforeSurcharge = pricePerUnit * quantity;
const gstAmount = Math.round((totalBeforeSurcharge + sameDayCharge) * 0.05);  // ← include sameDayCharge
const grandTotal = totalBeforeSurcharge + sameDayCharge + gstAmount; // ← update this
  const saved = (product.originalPrice - pricePerUnit) * quantity;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const validateAddress = () => {
    const e: Record<string, string> = {};
    if (!address.name.trim()) e.name = "Required";
    if (!address.phone.match(/^[6-9]\d{9}$/)) e.phone = "Enter valid 10-digit number";
    if (!address.pincode.match(/^\d{6}$/)) e.pincode = "Enter valid 6-digit pincode";
    if (!address.city.trim()) e.city = "Required";
    if (!address.state.trim()) e.state = "Required";
    if (!address.line1.trim()) e.line1 = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRazorpay = async () => {
    setStep("processing");
    setPaymentError("");
    try {
      const createRes = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug, quantity, selectedSize, selectedColor, deliveryType,
          deliverySlot: deliveryType === "sameday" ? deliverySlot ?? undefined : undefined,
          customer: { name: address.name, phone: address.phone, email: address.email },
          address: { line1: address.line1, line2: address.line2, city: address.city, state: address.state, pincode: address.pincode },
        }),
      });
      const order = await createRes.json();
      if (!createRes.ok || !order?.id) throw new Error(order?.error ?? "Could not create order. Please try again.");

      const options = {
        key: order.keyId, amount: order.amount, currency: order.currency,
        name: "CluesStyle", description: `${product.name} × ${quantity}`, order_id: order.id,
        prefill: { name: address.name, contact: address.phone, email: address.email },
        notes: { address: `${address.line1}, ${address.city}, ${address.state} - ${address.pincode}` },
        theme: { color: "#111827" },
        handler: async (response: any) => {
          try {
            await fetch("/api/verify-razorpay-payment", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature }),
            });
          } catch { } finally { setConfirmedOrderRef(order.orderRef); setStep("success"); }
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

  const PAY_METHODS = [
    { id: "cards", icon: "💳", label: "Cards / NetBanking" },
    { id: "upi", icon: "⚡", label: "UPI / GPay / PhonePe" },
    { id: "wallets", icon: "👜", label: "Paytm / Wallets" },
    { id: "emi", icon: "📅", label: "EMI options" },
  ];

  const STATES = ["Maharashtra","Delhi","Karnataka","Tamil Nadu","Gujarat","Rajasthan","Uttar Pradesh","West Bengal","Telangana","Kerala","Madhya Pradesh","Punjab","Haryana","Bihar","Andhra Pradesh","Odisha","Jharkhand","Assam","Chhattisgarh","Uttarakhand","Himachal Pradesh","Goa","Tripura","Meghalaya","Manipur","Nagaland","Arunachal Pradesh","Mizoram","Sikkim","J&K","Ladakh"];

  const StepTabs = () => (
    <div className="flex border-b border-gray-100 mb-6">
      {[
        { key: "address", label: "Address", num: 1 },
        { key: "payment", label: "Payment", num: 2 },
        { key: "success", label: "Confirm", num: 3 },
      ].map(({ key, label, num }) => {
        const stepOrder = { address: 0, payment: 1, processing: 1, success: 2 };
        const currentOrder = stepOrder[step];
        const thisOrder = stepOrder[key as keyof typeof stepOrder] ?? num - 1;
        const isActive = step === key || (key === "payment" && step === "processing");
        const isDone = currentOrder > thisOrder;
        return (
          <div key={key} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
            isActive ? "border-gray-900 text-gray-900" :
            isDone ? "border-transparent text-blue-600 cursor-pointer" :
            "border-transparent text-gray-400"
          }`}
            onClick={() => { if (isDone) setStep(key as any); }}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
              isActive ? "bg-gray-900 text-white" :
              isDone ? "bg-blue-50 text-blue-600 border border-blue-200" :
              "bg-gray-100 text-gray-400"
            }`}>
              {isDone ? "✓" : num}
            </span>
            {label}
          </div>
        );
      })}
    </div>
  );

  const SummaryPanel = () => (
    <div className="hidden sm:flex flex-col bg-gray-950 text-white w-[260px] lg:w-[280px] flex-shrink-0 p-6 gap-5">
      {/* Product */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-3">Your order</p>
        <div className="flex gap-3 items-center">
          <div className="w-20 h-30 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-700">
            <img src={productImage} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-100 leading-snug">{product.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              {[selectedColor, selectedSize, `Qty: ${quantity}`].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800" />

      {/* Price breakdown */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Price per unit</span>
          <span className="text-gray-300">{formatPrice(pricePerUnit)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Subtotal ({quantity} pcs)</span>
          <span className="text-gray-300">{formatPrice(totalBeforeSurcharge)}</span>
        </div>
        {saved > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Bulk discount</span>
            <span className="text-green-400 font-medium">−{formatPrice(saved)}</span>
          </div>
        )}
        {sameDayCharge > 0 && (
          <div className="flex justify-between text-xs text-gray-400">
            <span>Same-day delivery</span>
            <span className="text-gray-300">{formatPrice(sameDayCharge)}</span>
          </div>
        )}
        {deliveryType === "standard" && (
          <div className="flex justify-between text-xs text-gray-400">
            <span>Shipping</span>
            <span className="text-green-400 font-medium">Free</span>
          </div>
        )}
        <div className="flex justify-between text-xs text-gray-400">
          <span>GST (5%)</span>
          <span className="text-gray-300">{formatPrice(gstAmount)}</span>
        </div>
      </div>

      <div className="border-t border-gray-800" />

      <div className="flex justify-between items-center">
        <span className="text-sm text-white font-medium">Total</span>
        <span className="text-xl font-bold text-white">{formatPrice(grandTotal)}</span>
      </div>

      {/* Delivery badge */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-gray-400 flex items-center gap-2">
        <span className="text-base"></span>
        <span>
          {deliveryType === "sameday"
            ? <><span className="text-white font-medium">Same-day delivery</span> — {deliverySlot ? SAME_DAY_SLOTS.find((s) => s.id === deliverySlot)?.label ?? "by 8 PM today" : "by 8 PM today"}</>
            : <><span className="text-white font-medium">Standard delivery</span> — 5–7 business days</>
          }
        </span>
      </div>

      {/* Trust */}
      <div className="mt-auto pt-4 border-t border-gray-800 flex items-center gap-2 text-[11px] text-gray-600">
        <span>🔒</span>
        <span>Secured by Razorpay · UPI, Cards, NetBanking</span>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full sm:max-w-[820px] lg:max-w-[900px] rounded-t-2xl sm:rounded-2xl flex flex-col sm:flex-row overflow-hidden max-h-[96vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <SummaryPanel />

        {/* Right panel */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">

          {/* Mobile summary strip */}
          <div className="sm:hidden flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-10 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                <img src={productImage} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{product.name}</p>
                <p className="text-xs text-gray-500">Qty: {quantity} · {formatPrice(grandTotal)}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold flex-shrink-0">✕</button>
          </div>

          {/* Desktop header */}
          <div className="hidden sm:flex items-center justify-between px-7 pt-6 pb-0 flex-shrink-0">
            <h2 className="text-base font-semibold text-gray-900">
              {step === "address" && "Delivery details"}
              {(step === "payment" || step === "processing") && "Payment"}
              {step === "success" && "Order confirmed "}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold transition-colors">✕</button>
          </div>

          <div className="px-4 sm:px-7 pt-4 sm:pt-5 pb-6 flex flex-col gap-5 flex-1">

            {step !== "success" && <StepTabs />}

            {/* ── Step 1: Address ── */}
            {step === "address" && (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Full name *</label>
                    <input value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      placeholder="As per ID"
                      className={`h-10 border rounded-xl px-3 text-sm outline-none focus:border-gray-700 transition-colors ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                    {errors.name && <p className="text-red-500 text-[11px]">{errors.name}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Mobile *</label>
                    <input value={address.phone} inputMode="numeric"
                      onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      placeholder="10-digit number"
                      className={`h-10 border rounded-xl px-3 text-sm outline-none focus:border-gray-700 transition-colors ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                    {errors.phone && <p className="text-red-500 text-[11px]">{errors.phone}</p>}
                  </div>
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Email <span className="normal-case font-normal text-gray-400">(invoice)</span></label>
                    <input type="email" value={address.email} onChange={(e) => setAddress({ ...address, email: e.target.value })}
                      placeholder="you@email.com"
                      className="h-10 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-gray-700 transition-colors" />
                  </div>
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Address line 1 *</label>
                    <input value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                      placeholder="House/Flat No, Building, Street"
                      className={`h-10 border rounded-xl px-3 text-sm outline-none focus:border-gray-700 transition-colors ${errors.line1 ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                    {errors.line1 && <p className="text-red-500 text-[11px]">{errors.line1}</p>}
                  </div>
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Address line 2 <span className="font-normal text-gray-400">(optional)</span></label>
                    <input value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                      placeholder="Landmark, Area"
                      className="h-10 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-gray-700 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Pincode *</label>
                    <input value={address.pincode} inputMode="numeric"
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                      placeholder="6 digits"
                      className={`h-10 border rounded-xl px-3 text-sm outline-none focus:border-gray-700 transition-colors ${errors.pincode ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                    {errors.pincode && <p className="text-red-500 text-[11px]">{errors.pincode}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">City *</label>
                    <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="City"
                      className={`h-10 border rounded-xl px-3 text-sm outline-none focus:border-gray-700 transition-colors ${errors.city ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                    {errors.city && <p className="text-red-500 text-[11px]">{errors.city}</p>}
                  </div>
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">State *</label>
                    <select value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className={`h-10 border rounded-xl px-3 text-sm outline-none focus:border-gray-700 bg-white transition-colors ${errors.state ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
                      <option value="">Select state</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p className="text-red-500 text-[11px]">{errors.state}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
                  <button onClick={() => { if (validateAddress()) setStep("payment"); }}
                    className="flex-1 h-11 bg-gray-900 hover:bg-gray-700 text-white font-semibold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2">
                    Continue to payment →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Payment ── */}
            {(step === "payment" || step === "processing") && (
              <div className="flex flex-col gap-4">
                {/* Address recap */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-800">{address.name} · {address.phone}</p>
                    <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                      {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} — {address.pincode}
                    </p>
                    {address.email && <p className="text-[11px] text-blue-500 mt-0.5">Invoice to: {address.email}</p>}
                  </div>
                  <button onClick={() => setStep("address")} className="text-[11px] text-blue-600 font-semibold underline flex-shrink-0 hover:text-blue-800">Edit</button>
                </div>

                {/* Payment method picker */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2.5">Payment method</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PAY_METHODS.map(({ id, icon, label }) => (
                      <button key={id} onClick={() => setSelectedPayMethod(id)}
                        className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border text-sm font-medium text-left transition-all ${
                          selectedPayMethod === id
                            ? "border-gray-900 bg-gray-50 text-gray-900"
                            : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                        }`}>
                        <span className="text-base">{icon}</span>
                        <span className="flex-1 text-xs leading-tight">{label}</span>
                        <span className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 transition-all ${
                          selectedPayMethod === id ? "border-gray-900 bg-gray-900 shadow-[inset_0_0_0_2px_white]" : "border-gray-300"
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                {paymentError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">{paymentError}</div>
                )}

                <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
                  <button onClick={() => setStep("address")}
                    className="h-11 px-5 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold text-sm rounded-2xl transition-colors">
                    ← Back
                  </button>
                  <button onClick={handleRazorpay} disabled={step === "processing"}
                    className="flex-1 h-11 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-gray-900 font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2">
                    {step === "processing"
                      ? <><span className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />Opening Razorpay…</>
                      : <>🔒 Pay {formatPrice(grandTotal)} via Razorpay</>
                    }
                  </button>
                </div>
                <p className="text-center text-[11px] text-gray-400">Your payment is secured by Razorpay</p>
              </div>
            )}

            {/* ── Step 3: Success ── */}
            {step === "success" && (
              <div className="flex flex-col items-center text-center gap-5 py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Payment successful!</h3>
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed max-w-xs">
                    Your order for <strong>{quantity} × {product.name}</strong> is confirmed and will be dispatched shortly.
                  </p>
                </div>
                {confirmedOrderRef && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                    <p className="text-[11px] text-gray-400 mb-0.5">Order reference</p>
                    <p className="font-mono font-semibold text-sm text-gray-800">{confirmedOrderRef}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-4 w-full text-left space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Amount paid</span><span className="font-bold text-gray-900">{formatPrice(grandTotal)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Delivery</span><span className="font-medium">{deliveryType === "sameday" ? "Same-day (by 8 PM)" : "Standard (5–7 days)"}</span></div>
                  {deliveryType === "sameday" && deliverySlot && (
                    <div className="flex justify-between text-gray-600"><span>Delivery slot</span><span className="font-medium">{SAME_DAY_SLOTS.find((s) => s.id === deliverySlot)?.label ?? deliverySlot}</span></div>
                  )}
                  <div className="flex justify-between text-gray-600"><span>Shipping to</span><span className="font-medium">{address.city}, {address.state}</span></div>
                  {address.email && <div className="flex justify-between text-gray-600"><span>Invoice</span><span className="font-medium">{address.email}</span></div>}
                </div>
                <button onClick={onClose}
                  className="w-full h-11 bg-gray-900 hover:bg-gray-700 text-white font-bold text-sm rounded-2xl transition-colors">
                  Continue shopping
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Color Variant Modal ────────────────────────────────────────────────────────

function ColorVariantModal({
  colors,
  selectedColor,
  onSelect,
  onClose,
}: {
  colors: NonNullable<Product["colors"]>;
  selectedColor: string | null;
  onSelect: (label: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/60 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-gray-100 z-10">
          <h3 className="text-base font-bold text-gray-900">
            Choose Colour <span className="font-normal text-gray-400 text-sm">({colors.length} options)</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {colors.map((c) => {
            const previewImage = c.media?.find((m) => m.type === "image")?.src;
            const isSelected = selectedColor === c.label;
            return (
              <button
                key={c.label}
                onClick={() => { onSelect(c.label); onClose(); }}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className={`relative overflow-hidden w-full aspect-[3/4] rounded-xl border bg-white transition-all duration-200 ${
                    isSelected ? "border-gray-800 ring-2 ring-gray-300" : "border-gray-200 group-hover:border-gray-400"
                  }`}
                >
                  {previewImage && (
                    <Image src={previewImage} alt={c.label} fill className="object-contain object-bottom" />
                  )}
                  {isSelected && (
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
                      <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-gray-800" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <span
                  className={`text-xs font-medium text-center leading-tight line-clamp-2 min-h-[2.2em] ${
                    isSelected ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Generic Swatch Picker (row + "+More" card + "View all" link + popup modal) ──
// Reused for every color/product picker across the site (id-1's Choose Color,
// id-3's Choose Color, id-2's fabric product swatches, etc.) so they all share
// one consistent look and behavior.

interface SwatchItem {
  id: string;
  label: string;
  image?: string;
  hex?: string;
}

function SwatchPickerModal({
  title, items, selectedId, onSelect, onClose,
}: {
  title: string;
  items: SwatchItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/60 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-gray-100 z-10">
          <h3 className="text-base font-bold text-gray-900">
            {title} <span className="font-normal text-gray-400 text-sm">({items.length} options)</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {items.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onSelect(item.id); onClose(); }}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className={`relative overflow-hidden w-full aspect-[3/4] rounded-xl border bg-white transition-all duration-200 ${
                    isSelected ? "border-gray-800 ring-2 ring-gray-300" : "border-gray-200 group-hover:border-gray-400"
                  }`}
                >
                  {item.image ? (
                    <Image src={item.image} alt={item.label} fill className="object-contain object-bottom" />
                  ) : item.hex ? (
                    <span className="absolute inset-3 rounded-lg" style={{ backgroundColor: item.hex }} />
                  ) : null}
                  {isSelected && (
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
                      <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-gray-800" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <span
                  className={`text-xs font-medium text-center leading-tight line-clamp-2 min-h-[2.2em] ${
                    isSelected ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SwatchPickerRow({
  title, modalTitle, items, selectedId, onSelect, visibleCount = 7, mobileVisibleCount = 3,
}: {
  title: React.ReactNode;
  modalTitle: string;
  items: SwatchItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  visibleCount?: number;
  mobileVisibleCount?: number;
}) {
  const [showModal, setShowModal] = useState(false);
  const visibleDesktop = items.slice(0, visibleCount);
  const remainingDesktop = items.length - visibleCount;
  const visibleMobile = items.slice(0, mobileVisibleCount);
  const remainingMobile = items.length - mobileVisibleCount;

  const renderSwatch = (item: SwatchItem) => {
    const isSelected = selectedId === item.id;
    return (
      <button
        key={item.id}
        onClick={() => onSelect(item.id)}
        className="flex flex-col items-center gap-1.5 flex-shrink-0"
      >
        <div
          className={`relative overflow-hidden w-16 h-24 sm:w-20 sm:h-28 rounded-xl border bg-white transition-all duration-200 ${
            isSelected ? "border-gray-800 ring-2 ring-gray-300" : "border-gray-200 hover:border-gray-400"
          }`}
        >
          {item.image ? (
            <Image src={item.image} alt={item.label} fill className="object-contain object-bottom" />
          ) : item.hex ? (
            <span className="absolute inset-2 rounded-lg" style={{ backgroundColor: item.hex }} />
          ) : null}
          {isSelected && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
              <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-gray-800" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </button>
    );
  };

  const renderMoreTile = (remaining: number) => (
    <button
      onClick={() => setShowModal(true)}
      className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-600 hover:border-gray-500 hover:bg-gray-50 transition-all flex-shrink-0"
    >
      <span className="text-sm font-bold">+{remaining}</span>
      <span className="text-[10px] font-medium">More</span>
    </button>
  );

  return (
    <div>
      {title}

      {/* Mobile: 3 swatches per row, then a +More tile */}
      <div className="flex gap-3 flex-wrap items-start mt-2 sm:hidden">
        {visibleMobile.map(renderSwatch)}
        {remainingMobile > 0 && renderMoreTile(remainingMobile)}
      </div>

      {/* Desktop: up to `visibleCount` swatches, then a +More tile */}
      <div className="hidden sm:flex gap-3 flex-wrap items-start mt-2">
        {visibleDesktop.map(renderSwatch)}
        {remainingDesktop > 0 && renderMoreTile(remainingDesktop)}
      </div>

      {items.length > visibleCount && (
        <button
          onClick={() => setShowModal(true)}
          className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
        >
          View all {items.length} {modalTitle.toLowerCase()}
        </button>
      )}

      {showModal && (
        <SwatchPickerModal
          title={modalTitle}
          items={items}
          selectedId={selectedId}
          onSelect={onSelect}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// ── Print Type Info Modal (Design Tips) ─────────────────────────────────────────

interface PrintTip {
  icon: "check" | "bulb";
  title: string;
  desc: string;
}

interface PrintExample {
  label: string;
  beforeSrc: string; // reference / original artwork
  afterSrc: string;  // how it looks printed/embroidered on product
}

const PRINT_TYPE_INFO: Record<"dtf" | "embroidery", {
  title: string;
  description: string;
  linkText: string;
  tips: PrintTip[];
  examples: PrintExample[];
}> = {
  embroidery: {
    title: "Design Tips for Embroidery",
    description: "Embroidery is stitched directly into the product. For the best results, follow the tips below or ",
    linkText: "contact us for help.",
    tips: [
      { icon: "check", title: "Keep your design simple", desc: "Small details aren't captured well." },
      { icon: "check", title: "Choose a bold font", desc: "Thin lines in text will be hard to read." },
      { icon: "check", title: "Use solid colors", desc: "Gradients cannot be embroidered." },
      { icon: "bulb", title: "Our artists will also adjust your image", desc: "for the best results. Please review your final picture proofs." },
    ],
    examples: [
      { label: "Team Octopus", beforeSrc: "/instructions/flower-before.webp", afterSrc: "/instructions/flower-after.webp" },
      { label: "Lion", beforeSrc: "/instructions/your-logo-before.webp", afterSrc: "/instructions/your-logo-after.webp" },
      { label: "Eagle", beforeSrc: "/instructions/lion-before.webp", afterSrc: "/instructions/lion-after.webp" },
      { label: "Colorado", beforeSrc: "/instructions/peacock-before.webp", afterSrc: "/instructions/peacock-after.webp" },
    ],
  },
  dtf: {
    title: "Design Tips for DTF Printing",
    description: "DTF is a full-color print transferred onto the fabric. For the best results, follow the tips below or ",
    linkText: "contact us for help.",
    tips: [
      { icon: "check", title: "High-resolution artwork works best", desc: "Low-res images may look blurry when printed." },
      { icon: "check", title: "Any color or gradient is fine", desc: "DTF supports full-color, photographic designs." },
      { icon: "check", title: "Transparent PNGs recommended", desc: "Avoids unwanted white boxes around your design." },
      { icon: "bulb", title: "Our artists will also adjust your image", desc: "for the best results. Please review your final picture proofs." },
    ],
    examples: [
      { label: "Team Octopus", beforeSrc: "/print-tips/dtf/octopus-before.webp", afterSrc: "/print-tips/dtf/octopus-after.webp" },
      { label: "Lion", beforeSrc: "/print-tips/dtf/lion-before.webp", afterSrc: "/print-tips/dtf/lion-after.webp" },
      { label: "Eagle", beforeSrc: "/print-tips/dtf/eagle-before.webp", afterSrc: "/print-tips/dtf/eagle-after.webp" },
      { label: "Colorado", beforeSrc: "/print-tips/dtf/colorado-before.webp", afterSrc: "/print-tips/dtf/colorado-after.webp" },
    ],
  },
};

// ── Fabric Type Options ──────────────────────────────────────────────────────────

type FabricType = "premium-pique" | "basic" | "polo-matty";

const FABRIC_OPTIONS: { id: FabricType; label: string; image: string }[] = [
  { id: "premium-pique", label: "Premium Pique Fabric", image: "/fabric/premium-pique-fabric.webp" },
  { id: "basic", label: "Basic Fabric", image: "/fabric/basic-fabric.webp" },
  { id: "polo-matty", label: "Polo Matty Fabric", image: "/fabric/polo-matty-fabric.webp" },
];

// ── Cap Fabric Category (Basic / Premium) ──────────────────────────────────
// Two top-level buttons; clicking one reveals its specific fabric cards.

type FabricCategory = "basic" | "premium";

interface MaterialOption {
  id: string;
  label: string;
  subtitle: string;
  image: string;
  theme: "blue" | "purple";
}

const MATERIAL_OPTIONS: MaterialOption[] = [
  { id: "premium-cotton", label: "Premium Cotton", subtitle: "Soft, Breathable & Comfortable", image: "/fabric-icons/premium-cotton.webp", theme: "blue" },
  { id: "premium-canvas", label: "Premium Canvas", subtitle: "Strong, Durable & Long Lasting", image: "/fabric-icons/premium-canvas.webp", theme: "purple" },
];

// ── "Default category" page feature badges (shown under Plan/Customized) ────
const DEFAULT_CATEGORY_FEATURES: { icon: React.ReactNode; label: string; sub: string }[] = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    label: "Premium Quality",
    sub: "Best in class fabric",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    label: "Durable & Long Lasting",
    sub: "Built to last long",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    label: "Comfort Fit",
    sub: "All day comfortable",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    label: "Unisex Style",
    sub: "Perfect for everyone",
  },
];

interface FabricSubOption {
  id: string;
  label: string;
  image: string; // card preview image (e.g. cap photo)
}

interface FabricPlanFeature {
  text: string;
}

interface FabricPlanCard {
  id: FabricCategory;
  badge: string;
  title: string;
  subtitle: string;
  image: string;
  features: FabricPlanFeature[];
  ctaLabel: string;
  recommended?: boolean;
}

const FABRIC_PLAN_CARDS: FabricPlanCard[] = [
  {
    id: "basic",
    badge: "BASIC",
    title: "Basic Cap",
    subtitle: "Everyday Comfort",
    image: "/cap-collections/p2.webp",
    features: [
      { text: "Durable & Lightweight" },
      
      { text: "Budget Friendly" },
      
    ],
    ctaLabel: "Select Basic",
  },
  {
    id: "premium",
    badge: "PREMIUM",
    title: "Premium Cap",
    subtitle: "Premium Quality",
    image: "/cap-collections/p1.webp",
    features: [
      { text: "Premium Cotton Canvas" },
      { text: "Better Shape Retention" },
    ],
    ctaLabel: "Select Premium",
    recommended: true,
  },
];

// ── Before/After Slider ──────────────────────────────────────────────────────────
function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  label,
}: {
  beforeSrc: string;
  afterSrc: string;
  label: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const isDragging = useRef(false);

  // ── Auto-play state ──
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoDirection = useRef<1 | -1>(1); // 1 = moving right, -1 = moving left
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosFromClientX = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(100, Math.max(0, pct)));
  };

  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const scheduleResume = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => setIsAutoPlaying(true), 2500);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
    pauseAutoPlay();
  };
  const handleMouseUp = () => {
    if (isDragging.current) scheduleResume();
    isDragging.current = false;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) updatePosFromClientX(e.clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    updatePosFromClientX(e.touches[0].clientX);
  };

  useEffect(() => {
    const stop = () => {
      if (isDragging.current) scheduleResume();
      isDragging.current = false;
    };
    window.addEventListener("mouseup", stop);
    return () => window.removeEventListener("mouseup", stop);
  }, []);

  // ── Auto-play animation loop ──
  useEffect(() => {
    if (!isAutoPlaying) return;

    let frameId: number;
    const SPEED = 0.6; // % per frame, tweak for faster/slower sweep

    const tick = () => {
      setSliderPos((prev) => {
        let next = prev + SPEED * autoDirection.current;
        if (next >= 92) {
          next = 92;
          autoDirection.current = -1;
        } else if (next <= 8) {
          next = 8;
          autoDirection.current = 1;
        }
        return next;
      });
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isAutoPlaying]);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square rounded-xl h-[250px] overflow-hidden border border-gray-200 bg-white select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* After image (base layer) */}
      <div className="absolute inset-0 h-[250px] bg-gray-50">
        <Image src={afterSrc} alt={`${label} after`} fill className="object-contain p-4 pointer-events-none" draggable={false} />
      </div>

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 h-[250px] bg-white overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <Image src={beforeSrc} alt={`${label} before`} fill className="object-contain p-4 pointer-events-none" draggable={false} />
      </div>

      {/* Labels */}
      <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-1 rounded pointer-events-none">
        Before
      </span>
      <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-1 rounded pointer-events-none">
        After
      </span>

      {/* Divider + drag handle */}
      <div
        className="absolute inset-y-0 w-0.5 h-[250px] bg-white shadow-md cursor-ew-resize"
       style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center cursor-ew-resize">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l-7.5 7.5 7.5 7.5m7.5-15l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
function PrintTypeInfoModal({
  printType,
  onClose,
  onConfirm,
}: {
  printType: "dtf" | "embroidery";
  onClose: () => void;
  onConfirm: () => void;
}) {
  const info = PRINT_TYPE_INFO[printType];
  const [activeExample, setActiveExample] = useState(0);
  const current = info.examples[activeExample];

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto relative p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 text-lg font-semibold transition-colors"
        >
          ✕
        </button>

        <h5 className="text-xl font-bold text-gray-900 pr-10">{info.title}</h5>
        <span className="text-[14px] text-gray-500 mt-2 max-w-lg leading-relaxed">
          {info.description}
          <span className="text-blue-600 text-[14px] font-medium cursor-pointer hover:underline">{info.linkText}</span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-6 mt-6">
          {/* Tips list */}
          <div className="flex flex-col gap-4">
            {info.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-green-50">
                  {tip.icon === "check" ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <span className="text-sm">💡</span>
                  )}
                </span>
                <div>
                  <span className="text-[14px] font-bold text-gray-900">{tip.title}</span><br/>
                  <span className="text-[14px] text-gray-500 mt-0.5 leading-relaxed">{tip.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Before/after carousel */}
          <div className="flex flex-col gap-3">
            <BeforeAfterSlider
              key={current.label}
              beforeSrc={current.beforeSrc}
              afterSrc={current.afterSrc}
              label={current.label}
            />

            <div className="grid grid-cols-4 gap-2">
              {info.examples.map((ex, i) => (
                <button
                  key={ex.label}
                  onClick={() => setActiveExample(i)}
                  className={`relative aspect-square rounded-lg overflow-hidden border transition-all ${
                    activeExample === i ? "border-blue-600" : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Image src={ex.afterSrc} alt={ex.label} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onConfirm}
          className="w-full h-12 mt-6 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl transition-colors"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}


type Side = "front" | "back" | "right" | "left";
type PreviewLayer = { id: string; pos: { x: number; y: number }; scale: number; rotation: number };

function newLayer(pos: { x: number; y: number }): PreviewLayer {
  return { id: Math.random().toString(36).slice(2), pos, scale: 1, rotation: 0 };
}

function DraggableLogo({
  src, pos, scale, rotation, onPosChange, onScaleChange, onRotationChange,
  onDuplicate, containerRef, onDelete, active, onActivate,
}: {
  src: string;
  pos: { x: number; y: number };
  scale: number;
  rotation: number;
  onPosChange: (p: { x: number; y: number }) => void;
  onScaleChange: (s: number) => void;
  onRotationChange: (r: number) => void;
  onDuplicate: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onDelete: () => void;
  active?: boolean;
  onActivate?: () => void;
}) {
  const dragging = useRef(false);
  const resizing = useRef(false);
  const rotating = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const startScale = useRef(1);
  const startDist = useRef(1);

  const updateFromPoint = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(4, Math.min(96, ((clientY - rect.top) / rect.height) * 100));
    onPosChange({ x, y });
  };
  const getCenter = () => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    onActivate?.();
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    e.preventDefault();
    updateFromPoint(e.clientX, e.clientY);
  };
  const handlePointerUp = () => { dragging.current = false; };

  const handleResizeDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onActivate?.();
    resizing.current = true;
    startScale.current = scale;
    const c = getCenter();
    startDist.current = Math.hypot(e.clientX - c.x, e.clientY - c.y) || 1;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handleResizeMove = (e: React.PointerEvent) => {
    if (!resizing.current) return;
    e.stopPropagation();
    const c = getCenter();
    const dist = Math.hypot(e.clientX - c.x, e.clientY - c.y) || 1;
    onScaleChange(Math.max(0.4, Math.min(3, startScale.current * (dist / startDist.current))));
  };
  const handleResizeUp = () => { resizing.current = false; };

  const handleRotateDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    rotating.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handleRotateMove = (e: React.PointerEvent) => {
    if (!rotating.current) return;
    e.stopPropagation();
    const c = getCenter();
    const angle = Math.atan2(e.clientY - c.y, e.clientX - c.x) * (180 / Math.PI);
    onRotationChange(angle + 135);
  };
  const handleRotateUp = () => { rotating.current = false; };

  return (
    <div
      ref={wrapperRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
        width: "22%",
        aspectRatio: "1 / 1",
        touchAction: active ? "none" : "pan-y",
        cursor: "grab",
      }}
      className="select-none active:cursor-grabbing group/drag"
    >
      <button type="button" onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Remove"
        style={{ transform: `scale(${1 / scale})` }}
        className="absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full bg-black/70 hover:bg-red-600 text-white text-[10px] font-bold flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover/drag:opacity-100 transition-opacity">
        ✕
      </button>
      <button type="button" onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDuplicate(); }} title="Duplicate"
        style={{ transform: `scale(${1 / scale})` }}
        className="absolute -top-2 -left-2 z-10 w-5 h-5 rounded-full bg-black/70 hover:bg-blue-600 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover/drag:opacity-100 transition-opacity">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 012-2h9a2 2 0 012 2v9a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-2M8 7h7a2 2 0 012 2v7" />
        </svg>
      </button>
      <div onPointerDown={handleResizeDown} onPointerMove={handleResizeMove}
        onPointerUp={handleResizeUp} onPointerCancel={handleResizeUp} title="Resize"
        style={{ touchAction: "none", transform: `scale(${1 / scale})` }}
        className="absolute -bottom-2 -right-2 z-10 w-5 h-5 rounded-full bg-black/70 hover:bg-green-600 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover/drag:opacity-100 transition-opacity cursor-nwse-resize">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l7-7m9-9l-7 7M14 4h6v6M4 14v6h6" />
        </svg>
      </div>
      <div onPointerDown={handleRotateDown} onPointerMove={handleRotateMove}
        onPointerUp={handleRotateUp} onPointerCancel={handleRotateUp} title="Rotate"
        style={{ touchAction: "none", transform: `scale(${1 / scale})` }}
        className="absolute -bottom-2 -left-2 z-10 w-5 h-5 rounded-full bg-black/70 hover:bg-purple-600 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover/drag:opacity-100 transition-opacity cursor-grab">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 1113.36-4.65M19.5 4v4.5H15" />
        </svg>
      </div>
      <div className="relative w-full h-full">
        <Image src={src} alt="Logo" fill className="object-contain drop-shadow-md pointer-events-none" />
      </div>
    </div>
  );
}

function LivePreviewCanvas({
  imageSrcFront, imageSrcBack, imageSrcRight, imageSrcLeft,
  side, onSideChange, logoSrcs, logoLayers, setLogoLayers, onLogoRemove,
  enabledLogoSides,
}: {
  imageSrcFront: string;
  imageSrcBack?: string;
  imageSrcRight?: string;
  imageSrcLeft?: string;
  side: Side;
  onSideChange: (s: Side) => void;
  logoSrcs: Partial<Record<Side, string | null>>;
  logoLayers: Record<Side, PreviewLayer[]>;
  setLogoLayers: React.Dispatch<React.SetStateAction<Record<Side, PreviewLayer[]>>>;
  onLogoRemove?: (side: Side) => void;
  // Which sides can be printed for this product. Omit to allow all four (default).
  enabledLogoSides?: Side[];
}) {
  const isSideEnabled = (s: Side) => !enabledLogoSides || enabledLogoSides.includes(s);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);

  useEffect(() => {
    setLogoLayers((prev) => {
      const next = { ...prev };
      (Object.keys(logoSrcs) as Side[]).forEach((s) => {
        if (logoSrcs[s] && !next[s].length) next[s] = [newLayer({ x: 50, y: 35 })];
      });
      return next;
    });
  }, [logoSrcs, setLogoLayers]);

  const updateLayer = (s: Side, id: string, patch: Partial<PreviewLayer>) =>
    setLogoLayers((prev) => ({ ...prev, [s]: prev[s].map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  const duplicateLayer = (s: Side, id: string) =>
    setLogoLayers((prev) => {
      const layer = prev[s].find((l) => l.id === id);
      if (!layer) return prev;
      const copy = newLayer({ x: Math.min(96, layer.pos.x + 4), y: Math.min(96, layer.pos.y + 4) });
      copy.scale = layer.scale;
      copy.rotation = layer.rotation;
      return { ...prev, [s]: [...prev[s], copy] };
    });
  const deleteLayer = (s: Side, id: string) => {
    setLogoLayers((prev) => {
      const remaining = prev[s].filter((l) => l.id !== id);
      // If that was the last layer for this side, also clear the uploaded
      // file/preview so the upload card resets back to "Click to upload".
      if (remaining.length === 0) {
        onLogoRemove?.(s);
      }
      return { ...prev, [s]: remaining };
    });
  };

  const bgSrc =
    side === "front" ? imageSrcFront :
    side === "back"  ? (imageSrcBack || imageSrcFront) :
    side === "right" ? (imageSrcRight || imageSrcFront) :
    (imageSrcLeft || imageSrcFront);
  const logoSrc = logoSrcs[side] ?? null;

  return (
    <div className="flex-1 min-w-[190px] flex flex-col">
      <div
        ref={containerRef}
        onClick={() => setActiveId(null)}
        className="relative w-full flex-1 min-h-[340px] sm:min-h-[420px] rounded-xl border border-dashed border-gray-300 bg-white overflow-hidden touch-pan-y mx-auto"
        style={{ aspectRatio: side === "right" || side === "left" ? "4 / 3" : "4 / 5" }}
      >
       <span className="absolute top-2 left-2 z-30 flex items-center gap-1.5 bg-white/95 border border-gray-200 rounded-full px-2.5 py-1 text-xs font-bold text-gray-800 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          Live
        </span>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowFullPreview(true); }}
          title="Preview all sides"
          className="absolute top-11 left-2 z-30 flex items-center gap-1 bg-white/95 border border-gray-200 rounded-full px-2.5 py-1 text-[10px] font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          {/* <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg> */}
          Preview
        </button>

        <div className="absolute top-2 right-2 z-30 flex flex-col gap-0.5 bg-white/95 border border-gray-300 shadow rounded-lg p-0.5">
          {(["front", "back", "right", "left"] as Side[]).map((s) => {
            const enabled = isSideEnabled(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => { if (enabled) onSideChange(s); }}
                disabled={!enabled}
                title={enabled ? undefined : "Not available for this product"}
                className={`px-2 py-1 rounded-md text-[10px] font-semibold capitalize transition-colors ${
                  !enabled
                    ? "text-gray-300 cursor-not-allowed"
                    : side === s ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        <div
          className="absolute top-[65%] right-2.5 z-20 bg-transparent text-[#a3a8bc] text-[9px] sm:text-[12px] tracking-[0.15em] px-2.5 py-1 rounded-full whitespace-nowrap pointer-events-none text-left"
          style={{ transform: "translateY(-50%) translateX(50%) rotate(-90deg)", transformOrigin: "center" }}
        >
          Drag • Resize • Rotate • Remove
        </div>

        <Image key={bgSrc} src={bgSrc} alt={`Preview ${side}`} fill
          className="object-contain pointer-events-none select-none" draggable={false} />

        {logoSrc && logoLayers[side].map((layer) => (
          <DraggableLogo
            key={layer.id}
            src={logoSrc}
            pos={layer.pos}
            scale={layer.scale}
            rotation={layer.rotation}
            onPosChange={(p) => updateLayer(side, layer.id, { pos: p })}
            onScaleChange={(sc) => updateLayer(side, layer.id, { scale: sc })}
            onRotationChange={(r) => updateLayer(side, layer.id, { rotation: r })}
            onDuplicate={() => duplicateLayer(side, layer.id)}
            containerRef={containerRef}
            onDelete={() => deleteLayer(side, layer.id)}
            active={activeId === layer.id}
            onActivate={() => setActiveId(layer.id)}
          />
        ))}
      </div>

      {showFullPreview && (
        <div
          className="fixed inset-0 bg-black/70 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowFullPreview(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-gray-100 z-10">
              <h3 className="text-base font-bold text-gray-900">Your Design Preview</h3>
              <button
                onClick={() => setShowFullPreview(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="px-5 pt-3">
              <span className="block text-[10px] text-red-500 leading-relaxed">
                Note: This is a digital preview. The original print may slightly differ from what's shown here.
              </span>

              <span className="block text-[10px] text-red-500 leading-relaxed">
                Preview includes only the CluesStyle watermark; it won’t affect the final print.
              </span>
            </div>
            <div className="p-4 sm:p-5 grid grid-cols-2 gap-3 sm:gap-4">
              {[
                ["front", "back"],
                ["right", "left"],
              ].map((column, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-1 sm:gap-1.5">
                  {column.map((s) => {
                    const side = s as Side;
                    const sideBg =
                      side === "front" ? imageSrcFront :
                      side === "back"  ? (imageSrcBack || imageSrcFront) :
                      side === "right" ? (imageSrcRight || imageSrcFront) :
                      (imageSrcLeft || imageSrcFront);
                    const sideLogo = logoSrcs[side] ?? null;
                    return (
                      <div key={side} className="flex flex-col gap-1">
                        <span className="text-[10px] sm:text-xs font-semibold text-gray-600 capitalize">{side}</span>
                        <div className="relative w-full aspect-[4/5] rounded-lg bg-white overflow-hidden">
                      <Image src={sideBg} alt={`${side} preview`} fill className="object-contain pointer-events-none select-none" style={{ zIndex: 1 }} />
                          {sideLogo && logoLayers[side].map((layer) => (
                            <div
                              key={layer.id}
                              className="absolute pointer-events-none"
                              style={{
                            left: `${layer.pos.x}%`,
                            top: `${layer.pos.y}%`,
                            transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scale(${layer.scale})`,
                            width: "22%",
                            aspectRatio: "1 / 1",
                            zIndex: 10,
                          }}
                            >
                              <div className="relative w-full h-full">
                                <Image src={sideLogo} alt="Logo" fill className="object-contain" />
                              </div>
                            </div>
                          ))}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 30 }}>
                        <span
                          className="text-gray-500 font-bold text-lg sm:text-xl select-none"
                          style={{ opacity: 0.35, transform: "rotate(-30deg)", whiteSpace: "nowrap" }}
                        >
                          Cluesstyle
                        </span>
                      </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ── Reference File Preview Modal ────────────────────────────────────────────────

function ReferencePreviewModal({ file, previewUrl, onClose }: { file: File; previewUrl: string; onClose: () => void }) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  return (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-gray-100 z-10">
          <h3 className="text-base font-bold text-gray-900 truncate pr-4">{file.name}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>
        <div className="p-5">
          {isImage ? (
            <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <Image src={previewUrl} alt={file.name} fill className="object-contain" />
            </div>
          ) : isVideo ? (
            <video src={previewUrl} controls className="w-full rounded-xl border border-gray-200 bg-black" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-10 border border-dashed border-gray-200 rounded-xl">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-sm font-medium text-gray-600">{file.name}</p>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-600 underline hover:text-blue-800"
              >
                Open in new tab
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Printing Type Card (with icon + adjustable height + info popover) ──────────

// Adjust this one number to resize the DTF / Embroidery cards.
const PRINT_TYPE_CARD_HEIGHT = 64;

const PRINT_TYPE_SUMMARY: Record<"dtf" | "embroidery", { title: string; subtitle: string; summary: string }> = {
  dtf: {
    title: "DTF Printing",
    subtitle: "Vibrant & Durable Prints",
    summary: "DTF (Direct to Film) printing offers vibrant colors, high detail and long-lasting prints on all types of fabrics.",
  },
  embroidery: {
    title: "Embroidery",
    subtitle: "Premium & Elegant Finish",
    summary: "Embroidery stitches your design directly into the fabric with thread, for a textured, premium, long-lasting finish.",
  },
};

function PrintTypeIcon({ type }: { type: "dtf" | "embroidery" }) {
  if (type === "dtf") {
    return (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <rect x="6" y="2.5" width="12" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <rect x="3" y="7.5" width="18" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="6" y="15.5" width="12" height="6" rx="1" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.25" cy="10.5" r="1" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
      <path d="M4 20c4.5-1 7-4.5 9-8.5s3-6.5 7-7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="19.4" cy="4.4" r="1.4" fill="currentColor" />
      <path d="M6.2 17.6c2-2.8 3.6-5 4.8-7.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

const PRINT_TYPE_IMAGES: Record<"dtf" | "embroidery", string> = {
  dtf: "/dtf-icon.webp",
  embroidery: "/emb-icon.webp",
};

// Adjust these two numbers to resize the icon image inside each card.
const PRINT_TYPE_IMAGE_WIDTH = 65;
const PRINT_TYPE_IMAGE_HEIGHT = 65;

function PrintTypeCard({
  type, selected, onSelect, infoOpen, onToggleInfo,
}: {
  type: "dtf" | "embroidery";
  selected: boolean;
  onSelect: () => void;
  infoOpen: boolean;
  onToggleInfo: () => void;
}) {
  const showInfo = infoOpen;
  const info = PRINT_TYPE_SUMMARY[type];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}
      style={{ minHeight: PRINT_TYPE_CARD_HEIGHT }}
     className={`relative flex-1 rounded-2xl border px-3 py-3 sm:px-4 sm:py-2.5 text-center sm:text-left transition-all bg-white cursor-pointer ${
        selected ? "border-blue-400" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {showInfo && (
        <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); onToggleInfo(); }} />
      )}

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggleInfo(); }}
        title={`About ${info.title}`}
        className="absolute top-2.5 right-2.5 z-40 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 text-[11px] font-bold shadow-sm"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      </button>

   {showInfo && (
        <div
          className="fixed z-50 left-4 right-4 top-1/2 -translate-y-1/2 sm:absolute sm:left-auto sm:right-0 sm:top-10 sm:translate-y-0 w-auto sm:w-60 max-w-sm mx-auto bg-white rounded-xl shadow-xl border border-gray-100 p-3.5 text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="block text-[12px] font-bold text-gray-900 mb-1">
            About {info.title}
          </span>
          <span className="block text-[10px] text-black leading-relaxed">
            {info.summary}
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 pt-1 sm:pt-0 pr-0 sm:pr-6 h-full text-center sm:text-left">
        <div className="flex-shrink-0 relative" style={{ width: "clamp(34px, 13vw, " + PRINT_TYPE_IMAGE_WIDTH + "px)", height: "clamp(34px, 13vw, " + PRINT_TYPE_IMAGE_HEIGHT + "px)" }}>
          <Image src={PRINT_TYPE_IMAGES[type]} alt={info.title} fill className="object-contain" />
        </div>
        <div className="min-w-0 flex flex-col items-center sm:items-start">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
            <span className={`text-[12px] sm:text-[17px] font-bold leading-tight whitespace-nowrap ${selected ? "text-blue-700" : "text-gray-800"}`}>{info.title}</span>
            {selected && (
              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
            )}
          </div>
          <span className="text-[9px] sm:text-[11px] text-gray-500 mt-0.5 leading-tight whitespace-nowrap">{info.subtitle}</span>
        </div>
    
      </div>
    </div>
  );
}
// ── T-Shirt Icons ──────────────────────────────────────────────────────────

function FrontShirtIcon() {
  return (
    <div className="w-20 h-20 relative">
      <Image
        src="/cap-collections/custom_1.webp"
        alt="Front Logo"
        fill
        className="object-contain"
      />
    </div>
  );
}

function BackShirtIcon() {
  return (
    <div className="w-20 h-20 relative">
      <Image
        src="/cap-collections/custom_2.webp"
        alt="Back Logo"
        fill
        className="object-contain"
      />
    </div>
  );
}

function LeftSleeveIcon() {
  return (
    <div className="w-20 h-20 relative">
      <Image
        src="/cap-collections/custom_4.webp"
        alt="Left Sleeve Logo"
        fill
        className="object-contain"
      />
    </div>
  );
}

function RightSleeveIcon() {
  return (
    <div className="w-20 h-20 relative">
      <Image
        src="/cap-collections/custom_3.webp"
        alt="Right Sleeve Logo"
        fill
        className="object-contain"
      />
    </div>
  );
}

function LogoUploadCard({
  label, 
  side, 
  file, 
  preview, 
  uploading, 
  inputRef, 
  onChange,
  icon: IconComponent,
  onActiveSideChange,
  disabled = false,
}: {
  label: string;
  side?: Side;
  file: File | null;
  preview: string | null;
  uploading?: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (f: File | null) => void;
  icon: React.ComponentType<any>;
  onActiveSideChange: (s: Side) => void;
  disabled?: boolean;
}) {
  const handleCardClick = () => {
    if (disabled) return;
    if (preview) return; // when a preview exists, clicking the image itself handles side-switch (below)
    if (side) onActiveSideChange(side);
    inputRef.current?.click();
  };

  return (
  <div
    className={`border-1 w-full border-gray-100 rounded-xl overflow-hidden bg-white flex flex-col h-[210px] ${disabled ? "opacity-40 grayscale cursor-not-allowed" : "cursor-pointer"}`}
    onClick={handleCardClick}
  >
      {/* Icon Section */}
      <div className="w-full flex justify-center bg-white">
        <div className="w-20 h-20 flex items-center justify-center text-gray-400">
          <IconComponent />
        </div>
      </div>

      {/* Content Section */}
      {/* Content Section */}
      <div className="w-full px-1.5 sm:px-3 text-center">
        <span className="text-[9px] sm:text-[12px] font-semibold text-gray-500 whitespace-nowrap block">{label}</span>
        <span className="text-[7px] sm:text-[8px] text-gray-500 block mt-1">{disabled ? "Not available" : "PNG, JPG up to 5MB"}</span>
      </div>

      {/* Upload Section */}
      {/* Upload Section */}
      <div className="w-full p-3 mt-1 flex-1 flex flex-col items-center justify-start">
        {!preview ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (disabled) return;
              if (side) onActiveSideChange(side);
              inputRef.current?.click();
            }}
            disabled={uploading || disabled}
            className="w-full h-16 border-1 lg:-mt-[5px] border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center gap-1 text-blue-500 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:border-blue-300 disabled:hover:bg-transparent"
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                onChange(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
            {uploading ? (
              <>
                <span className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-semibold text-center leading-tight">Removing bg…</span>
              </>
            ) : (
              <>
               <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"></path></svg>
                <span className="block text-[5px] sm:text-[8px] font-semibold text-blue-600 text-center leading-tight px-0.5">Click to upload</span>
              </>
            )}
          </button>
        ) : (
          <div className="relative w-full h-16 rounded-lg overflow-hidden border border-gray-300 bg-white cursor-pointer hover:border-gray-400 transition-colors"
            onClick={(e) => { e.stopPropagation(); if (side) onActiveSideChange(side); }}>
            <Image src={preview} alt={label} fill className="object-contain p-1" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
function LogoUploadSection({
  printType, onPrintTypeChange,
  fabricType, onFabricTypeChange,
  activeSide, onActiveSideChange,
  logoFiles, logoPreviews, logoUploading,
  onLogoChange, onReferenceChange,
  referenceImage, referenceImagePreview,
  customizationNote, onNoteChange,
  previewImageFront, previewImageBack, previewImageRight, previewImageLeft,
  logoLayers, setLogoLayers,
  textCardHeight = 130,
  enabledLogoSides,
}: {
  printType: "dtf" | "embroidery";
  onPrintTypeChange: (v: "dtf" | "embroidery") => void;
  fabricType: FabricType;
  onFabricTypeChange: (v: FabricType) => void;
  activeSide: Side;
  onActiveSideChange: (s: Side) => void;
  logoFiles: Record<Side, File | null>;
  logoPreviews: Record<Side, string | null>;
  logoUploading: Record<Side, boolean>;
  onLogoChange: (f: File | null, side: Side) => void;
  onReferenceChange: (f: File | null) => void;
  referenceImage: File | null;
  referenceImagePreview: string | null;
  customizationNote: string;
  onNoteChange: (v: string) => void;
  previewImageFront: string;
  previewImageBack?: string;
  previewImageRight?: string;
  previewImageLeft?: string;
  logoLayers: Record<Side, PreviewLayer[]>;
  setLogoLayers: React.Dispatch<React.SetStateAction<Record<Side, PreviewLayer[]>>>;
  textCardHeight?: number;
  // Which sides can be printed/uploaded for this product. Omit to allow all four (default).
  enabledLogoSides?: Side[];
}) {
  const isSideEnabled = (s: Side) => !enabledLogoSides || enabledLogoSides.includes(s);
  const [showReferencePreview, setShowReferencePreview] = useState(false);
  const [openPrintInfo, setOpenPrintInfo] = useState<"dtf" | "embroidery" | null>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);
  const leftInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const referenceMediaInputRef = useRef<HTMLInputElement>(null);

  const UploadCard = ({
    label, side, file, preview, uploading, inputRef, onChange, hint = "PNG, JPG up to 5MB",
  }: {
    label: string;
    side?: Side;
    file: File | null;
    preview: string | null;
    uploading?: boolean;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: (f: File | null) => void;
    hint?: string;
  }) => (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { onChange(e.target.files?.[0] ?? null); e.target.value = ""; }}
      />
      {!preview ? (
        <button
          type="button"
          onClick={() => { if (side) onActiveSideChange(side); inputRef.current?.click(); }}
          disabled={uploading}
          className="w-full aspect-square border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 sm:gap-1.5 text-gray-500 hover:border-blue-500 hover:bg-gray-50 transition-colors px-1 disabled:opacity-60 disabled:cursor-wait"
        >
          {uploading ? (
            <>
              <span className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[9px] sm:text-xs font-semibold text-center leading-tight">Removing background…</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              <span className="text-[9px] sm:text-xs font-semibold text-center leading-tight">{label}</span>
              <span className="hidden sm:block text-[9px] sm:text-[10px] text-gray-400 text-center leading-tight px-1">{hint}</span>
            </>
          )}
        </button>
      ) : (
        <div
          onClick={() => side && onActiveSideChange(side)}
          className={`relative w-full aspect-square rounded-xl overflow-hidden border bg-white cursor-pointer ${side && activeSide === side ? "border-blue-500" : "border-gray-800"}`}
        >
          <Image src={preview} alt={label} fill className="object-contain p-2" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); if (inputRef.current) inputRef.current.value = ""; }}
            className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs"
          >
            ✕
          </button>
          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] sm:text-[10px] text-center py-0.5 truncate px-1">
            {file?.name ?? label}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-3 flex-nowrap">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-green-600"></span>
          </span>
          <span className="text-[13px] sm:text-[16px] font-semibold text-gray-700 whitespace-nowrap">Upload Your Logo</span>
          <span className="bg-green-100 text-green-600 text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap flex-shrink-0">
            Customized
          </span>
        </div>
        <Link
          href="/customized-your-t-shirt?category=round-neck"
          className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[11px] font-medium text-slate-500 bg-slate-50 border rounded-xl hover:bg-[#000] hover:text-[#fff] border-slate-200 rounded whitespace-nowrap flex-shrink-0"
        >
          Design by yourself ? →
        </Link>
      </div>

      <div className="mb-4">
        <span className="text-[13px] font-semibold text-gray-600 mb-2 block">Printing Type</span>
        <div className="flex gap-2 sm:gap-3">
          <PrintTypeCard
            type="dtf"
            selected={printType === "dtf"}
            onSelect={() => onPrintTypeChange("dtf")}
            infoOpen={openPrintInfo === "dtf"}
            onToggleInfo={() => setOpenPrintInfo((v) => (v === "dtf" ? null : "dtf"))}
          />
          <PrintTypeCard
            type="embroidery"
            selected={printType === "embroidery"}
            onSelect={() => onPrintTypeChange("embroidery")}
            infoOpen={openPrintInfo === "embroidery"}
            onToggleInfo={() => setOpenPrintInfo((v) => (v === "embroidery" ? null : "embroidery"))}
          />
        </div>
      </div>

      {/* ── Fabric Type Selector ── commented out for now, will use in future
      <div className="mb-4">
        <span className="text-[13px] font-semibold text-gray-600 mb-2 block">Fabric Type</span>
        <div className="flex flex-wrap gap-3 sm:gap-6">
          {FABRIC_OPTIONS.map((f) => {
            const isSelected = fabricType === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onFabricTypeChange(f.id)}
                className="flex flex-col items-center gap-1.5 group flex-shrink-0"
              >
                <div
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border bg-white transition-all ${
                    isSelected ? "border-gray-900 ring-2 ring-gray-300" : "border-gray-200 group-hover:border-gray-400"
                  }`}
                >
                  <Image src={f.image} alt={f.label} fill className="object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-white shadow flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-800" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-medium text-center leading-tight max-w-[72px] ${
                    isSelected ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      */}

      <div className="logo-upload-grid gap-4">
        <div style={{ gridArea: "cards" }} className="w-full min-w-0">
            <span className="text-[10px] font-semibold text-gray-700 mb-4 block pb-0">Add your logo and customize your product</span>
            <div className="grid grid-cols-4 gap-2">
              <LogoUploadCard 
                label="Front Logo" 
                side="front" 
                file={logoFiles.front} 
                preview={logoPreviews.front} 
                uploading={logoUploading.front} 
                inputRef={frontInputRef} 
                onChange={(f) => onLogoChange(f, "front")}
                icon={FrontShirtIcon}
                onActiveSideChange={onActiveSideChange}
                disabled={!isSideEnabled("front")}
              />
              <LogoUploadCard 
                label="Back Logo" 
                side="back" 
                file={logoFiles.back} 
                preview={logoPreviews.back} 
                uploading={logoUploading.back} 
                inputRef={backInputRef} 
                onChange={(f) => onLogoChange(f, "back")}
                icon={BackShirtIcon}
                onActiveSideChange={onActiveSideChange}
                disabled={!isSideEnabled("back")}
              />
              <LogoUploadCard 
                label="Left Logo" 
                side="left" 
                file={logoFiles.left} 
                preview={logoPreviews.left} 
                uploading={logoUploading.left} 
                inputRef={leftInputRef} 
                onChange={(f) => onLogoChange(f, "left")}
                icon={LeftSleeveIcon}
                onActiveSideChange={onActiveSideChange}
                disabled={!isSideEnabled("left")}
              />
              <LogoUploadCard 
                label="Right Logo" 
                side="right" 
                file={logoFiles.right} 
                preview={logoPreviews.right} 
                uploading={logoUploading.right} 
                inputRef={rightInputRef} 
                onChange={(f) => onLogoChange(f, "right")}
                icon={RightSleeveIcon}
                onActiveSideChange={onActiveSideChange}
                disabled={!isSideEnabled("right")}
              />
            </div>
        </div>

        <div style={{ gridArea: "preview" }} className="flex flex-col min-w-0">
          <LivePreviewCanvas
            side={activeSide}
            onSideChange={onActiveSideChange}
            imageSrcFront={previewImageFront}
            imageSrcBack={previewImageBack}
            imageSrcRight={previewImageRight}
            imageSrcLeft={previewImageLeft}
            logoSrcs={logoPreviews}
            logoLayers={logoLayers}
            setLogoLayers={setLogoLayers}
            onLogoRemove={(s) => onLogoChange(null, s)}
            enabledLogoSides={enabledLogoSides}
          />
        </div>

        {/*
          On mobile the note box just needs a comfortable fixed height (set via
          textCardHeight). On lg+ it grows with lg:flex-1 so its bottom edge lines
          up with the bottom of the live-preview canvas next to it.
        */}
        <div
          style={{ gridArea: "textarea", minHeight: textCardHeight }}
          className="w-full flex flex-col border  border-dashed border-gray-300 rounded-xl p-2.5 min-w-0"
        >
            <label className="text-[10px] font-semibold text-gray-600 mb-1.5 leading-tight">
              Any Text or Customization <span className="font-normal text-gray-400">(Optional)</span>
            </label>
            <textarea
              value={customizationNote}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Describe your requirements here or upload a reference image."
              maxLength={500}
              className="flex-1 w-full border-none outline-none resize-none text-xs bg-transparent placeholder:text-gray-400"
            />
            <div className="flex items-center justify-between gap-2 mt-1.5">
              <div className="min-w-0 flex-1">
                {referenceImage && (
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 min-w-0">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                    </svg>
                    <span className="truncate">{referenceImage.name}</span>
                    <button
                      type="button"
                      onClick={() => onReferenceChange(null)}
                      className="text-gray-400 hover:text-red-600 flex-shrink-0"
                      title="Remove attachment"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-0 flex-shrink-0">
                <span className="text-[12px] text-gray-400">{customizationNote.length}/500</span>

                {/* Document attach: images or PDFs */}
                <input
                  ref={referenceInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => { onReferenceChange(e.target.files?.[0] ?? null); e.target.value = ""; }}
                />
                {/* Photo/video attach (also usable for direct camera capture on mobile) */}
                <input
                  ref={referenceMediaInputRef}
                  type="file"
                  accept="image/*,video/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => { onReferenceChange(e.target.files?.[0] ?? null); e.target.value = ""; }}
                />

                {referenceImagePreview ? (
                  <button
                    type="button"
                    onClick={() => setShowReferencePreview(true)}
                    className="px-2.5 py-1 rounded-full bg-gray-900 text-white text-[11px] font-semibold hover:bg-gray-700 transition-colors whitespace-nowrap"
                  >
                    Preview
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => referenceInputRef.current?.click()}
                      title="Attach a reference document or image"
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 relative overflow-hidden"
                    >
                      <Image src="/doc.webp" alt="Attach document" fill className="object-contain" />
                    </button>
                    <button
                      type="button"
                      onClick={() => referenceMediaInputRef.current?.click()}
                      title="Attach a reference photo or video"
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 relative overflow-hidden"
                    >
                      <Image src="/cam.webp" alt="Attach photo" fill className="object-contain" />
                    </button>
                  </>
                )}
              </div>
            </div>
        </div>
      </div>

      <style jsx>{`
        .logo-upload-grid {
          display: grid;
          grid-template-columns: 1fr;
          grid-template-areas:
            "cards"
            "preview"
            "textarea";
        }
        @media (min-width: 1024px) {
          .logo-upload-grid {
            grid-template-columns: 1fr 35%;
            grid-template-areas:
              "cards preview"
              "textarea preview";
            align-items: stretch;
          }
        }
      `}</style>

      {showReferencePreview && referenceImage && referenceImagePreview && (
        <ReferencePreviewModal
          file={referenceImage}
          previewUrl={referenceImagePreview}
          onClose={() => setShowReferencePreview(false)}
        />
      )}
    </div>
  );
}

// ── Remove Background Confirm Modal ─────────────────────────────────────────────

function RemoveBgConfirmModal({ onKeepOriginal, onRemoveBg }: { onKeepOriginal: () => void; onRemoveBg: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onKeepOriginal}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Remove background?</h3>
        <p className="text-sm text-gray-500 mb-5">
          We can automatically remove the background from your uploaded image for a cleaner embroidered/printed look.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onKeepOriginal}
            className="flex-1 py-3 border-2 border-gray-900 text-gray-900 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors"
          >
            Keep Original
          </button>
          <button
            onClick={onRemoveBg}
            className="flex-1 py-3 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-700 transition-colors"
          >
            Remove Background
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Auth Gate Modal ────────────────────────────────────────────────────────────

function AuthGateModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Login Required</h3>
        <p className="text-sm text-gray-500 mb-5">Please login or create an account to checkout.</p>
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [activeImg,      setActiveImg]      = useState(0);
  const [selectedColor,  setSelectedColor]  = useState<string | null>(product.colors?.[0]?.label ?? null);
  const selectedColorObj = product.colors?.find((c) => c.label === selectedColor) ?? null;
  const colorSameDayAvailable = selectedColorObj?.sameDayAvailable ?? product.sameDayAvailable ?? false;
  const [selectedSize,   setSelectedSize]   = useState<string | null>(null);
  const [quantity,       setQuantity]       = useState<number | "">(product.quantityReq || 1);
  const [quantityInput,  setQuantityInput]  = useState(String(product.quantityReq || 1));
  const [wishlist,       setWishlist]       = useState(false);
  const [sizeError,      setSizeError]      = useState(false);
  const [activeTab,      setActiveTab]      = useState<"details" | "shipping" | "returns" | "none">("none");
  const [showSizeGuide,  setShowSizeGuide]  = useState(false);
  const [deliveryType,   setDeliveryType]   = useState<"standard" | "sameday">("standard");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showAuthModal,  setShowAuthModal]  = useState(false);
  const [isLoggedIn,     setIsLoggedIn]     = useState(false);
  const [loggedInUser,   setLoggedInUser]   = useState<{ name: string; email?: string; phone?: string } | null>(null);
  const [toast,          setToast]          = useState<string | null>(null);
const [borzoCharge, setBorzoCharge] = useState<number | null>(null);
const [deliverySlot, setDeliverySlot] = useState<string | null>(null);
const [reviewSummary, setReviewSummary] = useState<{ average: number; total: number }>({ average: 0, total: 0 });
const [showColorModal, setShowColorModal] = useState(false);
const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});

// const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});
const [printType, setPrintType] = useState<"dtf" | "embroidery">("dtf");
const [pendingPrintType, setPendingPrintType] = useState<"dtf" | "embroidery" | null>(null);
const [previousPrintType, setPreviousPrintType] = useState<"dtf" | "embroidery">("dtf");
const [fabricType, setFabricType] = useState<FabricType>("premium-pique");
const [fabricCategory, setFabricCategory] = useState<FabricCategory>("basic");
const [selectedMaterial, setSelectedMaterial] = useState<string>("premium-cotton");
const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
const [selectedMaterialProductId, setSelectedMaterialProductId] = useState<string | null>(null);
const [overrideImage, setOverrideImage] = useState<string | null>(null);
const [overrideMedia, setOverrideMedia] = useState<MediaItem[] | null>(null);
const [selectedFabricChoiceId, setSelectedFabricChoiceId] = useState<string | null>(null);
const [selectedFabricProductId, setSelectedFabricProductId] = useState<string | null>(null);

// "Choose Style" / "Choose Color" — only used on style-picker product pages.
const [selectedStyleSlug, setSelectedStyleSlug] = useState<string>(
  productsData.find((p) => p.colors && p.colors.length > 0)?.slug ?? product.slug
);
const selectedStyleProduct = productsData.find((p) => p.slug === selectedStyleSlug) ?? product;
const [selectedStyleColor, setSelectedStyleColor] = useState<string | null>(
  selectedStyleProduct.colors?.[0]?.label ?? null
);

// Clicking a real thumbnail should always take priority over any material
// preview — clear the override whenever the user manually picks an image.
// Thumbnail/dot navigation just moves within whatever image set is
// CURRENTLY active (real product photos, or an overridden style/fabric
// set) — it should never clear the override, or clicking a thumbnail
// within an overridden set would wipe the whole set out from under it.
const handleSetActiveImg = (i: number) => {
  setActiveImg(i);
};

const handleSelectStyle = (slug: string) => {
  setOverrideImage(null);
  setSelectedStyleSlug(slug);
  const styleProduct = productsData.find((p) => p.slug === slug);
  const firstColor = styleProduct?.colors?.[0] ?? null;
  setSelectedStyleColor(firstColor?.label ?? null);
};

const handleSelectStyleColor = (colorLabel: string) => {
  setOverrideImage(null);
  setSelectedStyleColor(colorLabel);
};
const [designMode, setDesignMode] = useState<"plan" | "custom">("plan");
const [logoFiles, setLogoFiles] = useState<Record<Side, File | null>>({ front: null, back: null, right: null, left: null });
const [logoPreviews, setLogoPreviews] = useState<Record<Side, string | null>>({ front: null, back: null, right: null, left: null });
const [logoUploading, setLogoUploading] = useState<Record<Side, boolean>>({ front: false, back: false, right: false, left: false });
const [activeSide, setActiveSide] = useState<Side>("front");
const [logoLayers, setLogoLayers] = useState<Record<Side, PreviewLayer[]>>({ front: [], back: [], right: [], left: [] });
const [referenceImage, setReferenceImage] = useState<File | null>(null);
const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
const referenceInputRef = useRef<HTMLInputElement>(null);
const referenceMediaInputRef = useRef<HTMLInputElement>(null);
const [customizationNote, setCustomizationNote] = useState("");
// Holds the file waiting on a yes/no answer to "remove the background?"
// before it gets processed or just kept as-is.
const [pendingBgConfirm, setPendingBgConfirm] = useState<{ file: File; side: Side } | null>(null);

  // On style-picker pages, images/thumbnails/live-preview should reflect
  // whichever STYLE + COLOR the user picked, not the originally-loaded product.
  const effectiveMediaProduct = product.isStylePicker ? selectedStyleProduct : product;
  const effectiveMediaColor = product.isStylePicker ? selectedStyleColor : selectedColor;

  const media = overrideMedia
    ?? (overrideImage ? [{ type: "image" as const, src: overrideImage }] : resolveMedia(effectiveMediaProduct, effectiveMediaColor));
  const blankMedia = resolveBlankMedia(effectiveMediaProduct, effectiveMediaColor);

  useEffect(() => { setActiveImg(0); }, [selectedColor, selectedStyleSlug, selectedStyleColor, overrideMedia]);

  const handleLogoChange = (file: File | null, which: Side | "reference") => {
    if (which === "reference") {
      setReferenceImage(file);
      setReferenceImagePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return file ? URL.createObjectURL(file) : null;
      });
      return;
    }

    const side = which;
    setActiveSide(side);

    if (!file) {
      setLogoFiles((prev) => ({ ...prev, [side]: null }));
      setLogoPreviews((prev) => {
        if (prev[side]) URL.revokeObjectURL(prev[side]!);
        return { ...prev, [side]: null };
      });
      setLogoLayers((prev) => ({ ...prev, [side]: [] }));
      return;
    }

    // Show the raw upload immediately so the user isn't staring at a blank
    // slot, then ask whether they actually want the background removed
    // before calling the API — some logos already have a clean/transparent
    // background and don't need it touched.
    setLogoFiles((prev) => ({ ...prev, [side]: file }));
    setLogoPreviews((prev) => {
      if (prev[side]) URL.revokeObjectURL(prev[side]!);
      return { ...prev, [side]: URL.createObjectURL(file) };
    });
    setPendingBgConfirm({ file, side });
  };

  const runBackgroundRemoval = async (file: File, side: Side) => {
    setLogoUploading((prev) => ({ ...prev, [side]: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/remove-bg", { method: "POST", body: formData });

      if (!res.ok) throw new Error("Background removal failed");

      const blob = await res.blob();
      const cleanedFile = new File(
        [blob],
        file.name.replace(/\.[^.]+$/, "") + "-nobg.png",
        { type: "image/png" }
      );
      const cleanedUrl = URL.createObjectURL(blob);

      setLogoFiles((prev) => ({ ...prev, [side]: cleanedFile }));
      setLogoPreviews((prev) => {
        if (prev[side]) URL.revokeObjectURL(prev[side]!);
        return { ...prev, [side]: cleanedUrl };
      });
    } catch {
      // Background removal failed (service down, network issue, etc.) —
      // keep the original upload rather than blocking the user entirely.
      setToast("Couldn't auto-remove background, using original image.");
    } finally {
      setLogoUploading((prev) => ({ ...prev, [side]: false }));
    }
  };

  useEffect(() => {
    if (!product.logoUploadEnabled) {
      setLogoFiles({ front: null, back: null, right: null, left: null });
      setLogoPreviews({ front: null, back: null, right: null, left: null });
      setLogoLayers({ front: [], back: [], right: [], left: [] });
      setReferenceImage(null);
      setReferenceImagePreview(null);
      setCustomizationNote("");
    }
  }, [product.logoUploadEnabled]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

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
    if (deliveryType === "standard") { setBorzoCharge(null); setDeliverySlot(null); }
    if (!colorSameDayAvailable && deliveryType === "sameday") setDeliveryType("standard");
  }, [colorSameDayAvailable, deliveryType]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/reviews?productType=polo-t-shirt&productSlug=${encodeURIComponent(product.slug)}`
        );
        if (res.ok) {
          const data = await res.json();
          setReviewSummary({
            average: data.summary?.average ?? 0,
            total: data.summary?.total ?? 0,
          });
        }
      } catch {
        // silently keep default { average: 0, total: 0 } if this fails
      }
    })();
  }, [product.slug]);

  const scrollToReviews = () => {
    document.getElementById("product-reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const numQty = quantity === "" ? 1 : Number(quantity);
useEffect(() => {
  setSizeQuantities({});
}, [numQty]);

const totalAllocated = Object.values(sizeQuantities).reduce((a, b) => a + b, 0);
const sizeAllocationComplete = !product.sizes || totalAllocated === numQty;

  const { pricePerUnit, sameDayCharge: staticSameDayCharge } = computeOrderTotal({
    displayPrice: product.displayPrice,
    quantity: numQty,
    deliveryType,
  });

  const effectiveSameDayCharge =
    deliveryType === "sameday" && borzoCharge !== null ? borzoCharge : staticSameDayCharge;

  const totalPrice = pricePerUnit * numQty + effectiveSameDayCharge;
  const discountPct = getDiscountForQty(numQty);
  const activeOffer = product.offer ?? DEFAULT_OFFER;

const handleAddToCart = () => {
    if (product.sizes && !sizeAllocationComplete) { setSizeError(true); return; }
    setSizeError(false);
    addToCart({
      productId: product.id, productSlug: product.slug, productName: product.name,
      productImage: media[activeImg]?.src || media[0]?.src || product.images[0],
      quantity: numQty, size: selectedSize, sizeBreakdown: product.sizes ? sizeQuantities : undefined,
      color: selectedColor, deliveryType,
      pricePerUnit, sameDayCharge: effectiveSameDayCharge, lineTotal: totalPrice, addedAt: Date.now(),
      customizationNote: customizationNote || undefined,
    });
    setToast("Added to cart!");
  };

 const handleCheckoutNow = () => {
  if (product.sizes && !sizeAllocationComplete) { setSizeError(true); return; }
  if (deliveryType === "sameday" && !deliverySlot) {
    setToast("Please select a same-day delivery slot to continue.");
    return;
  }
  setSizeError(false);
  setShowOrderModal(true);
};
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Breadcrumb */}
      <div className="max-w-[1500px] mx-auto px-4 py-6 text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>›</span>
        <Link href="/products/apparels" className="hover:text-gray-700">Apparels</Link>
        <span>›</span>
        <Link href="/products/apparels/oversized-t-shirt" className="hover:text-gray-700">{product.category}</Link>
        <span>›</span>
        <span className="text-gray-600 truncate max-w-[160px] sm:max-w-xs">{product.name}</span>
      </div>

      {/*
        Layout:
        - Mobile:  single column (image → details)
        - md:      two columns [thumbnails | image], then details below (or stacked if viewport is tight)
        - lg:      three columns [thumbnails | image | details]
      */}
      <main className="max-w-[1500px] mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[130px_minmax(0,540px)_1fr] gap-x-6 gap-y-6 lg:items-start">

          {/* ── Image panel (thumbnails + main viewer) ── */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
            {/* Desktop: side-by-side thumbnails + viewer */}
            <div className="hidden md:grid md:grid-cols-[100px_1fr] lg:grid-cols-[130px_1fr] gap-4 lg:gap-6">
              <ThumbnailStrip media={media} activeImg={activeImg} setActiveImg={handleSetActiveImg} />
              <MainViewer
                media={media} activeImg={activeImg} setActiveImg={handleSetActiveImg}
                badge={product.badge} wishlist={wishlist} setWishlist={setWishlist}
                rating={reviewSummary.total > 0 ? Number(reviewSummary.average.toFixed(1)) : undefined}
                reviewCount={reviewSummary.total > 0 ? reviewSummary.total : undefined}
                onRatingClick={scrollToReviews}
                sameDayAvailable={colorSameDayAvailable}
                overrideImage={overrideImage}
              />
            </div>
            {/* Mobile: just the viewer (thumbnails are inside it) */}
            <div className="md:hidden">
              <MainViewer
                media={media} activeImg={activeImg} setActiveImg={handleSetActiveImg}
                badge={product.badge} wishlist={wishlist} setWishlist={setWishlist}
                rating={reviewSummary.total > 0 ? Number(reviewSummary.average.toFixed(1)) : undefined}
                reviewCount={reviewSummary.total > 0 ? reviewSummary.total : undefined}
                onRatingClick={scrollToReviews}
                sameDayAvailable={colorSameDayAvailable}
                overrideImage={overrideImage}
              />
            </div>
          </div>

          {/* ── Details panel ── */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">
                Cluesstyle
                <sup className="font-semibold inline-flex items-center justify-center w-3.5 h-3.5 ml-0.5 text-[0.75rem] border border-current rounded-full leading-none">
                  R
                </sup>
              </span>

              <span className="text-xs text-gray-500">
                Country of Origin
              </span>

              <div className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2 py-0.5">
                <Image
                  src="/india-flag.webp"
                  alt="India"
                  width={14}
                  height={14}
                  className="rounded-sm"
                />
                <span className="text-[11px] font-semibold text-gray-800">
                  India
                </span>
              </div>
            </div>

           <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight text-gray-900 mb-3 -mt-2">
              {product.isStylePicker ? selectedStyleProduct.name : product.name}
            </h1>
              {/* Price + Rating */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[26px] sm:text-[28px] font-bold text-gray-900">{formatPrice(pricePerUnit)}</span>
                    <span className="text-lg sm:text-xl text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                    {discountPct > 0 && (
                      <span className="text-[16px] sm:text-[18px] font-semibold text-green-600">{discountPct}% OFF</span>
                    )}
                    <span className="text-[11px] sm:text-[12px] text-gray-500">Exclusive of all taxes</span>
                  </div>
                </div>
                {reviewSummary.total > 0 && (
                  <button
                    type="button"
                    onClick={scrollToReviews}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#fcfcfd] rounded-full border border-[#e3e5e9] hover:border-gray-300 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 12 12" fill="none">
                      <path fill="#FFD232" d="M5.58 1.15a.5.5 0 0 1 .84 0l1.528 2.363a.5.5 0 0 0 .291.212l2.72.722a.5.5 0 0 1 .26.799L9.442 7.429a.5.5 0 0 0-.111.343l.153 2.81a.5.5 0 0 1-.68.493L6.18 10.063a.5.5 0 0 0-.36 0l-2.625 1.014a.5.5 0 0 1-.68-.494l.153-2.81a.5.5 0 0 0-.11-.343L.781 5.246a.5.5 0 0 1 .26-.799l2.719-.722a.5.5 0 0 0 .291-.212L5.58 1.149Z" />
                    </svg>
                    <span className="font-semibold">{reviewSummary.average.toFixed(1)}</span>
                    <span className="text-gray-300">|</span>
                    <span className="font-semibold">{reviewSummary.total}</span>
                  </button>
                )}
              </div>

              <PriceOfferModal pricePerUnit={pricePerUnit} originalPrice={product.originalPrice} offer={activeOffer} />
            </div>

            {numQty >= 25 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800 flex items-start gap-2">
                <svg className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Bulk deal active! <strong>{discountPct}% off</strong> at {numQty} pcs → {formatPrice(pricePerUnit)}/pc</span>
              </div>
            )}

            {/* Style-picker hub: Choose Style + Choose Color */}
            {product.isStylePicker && (
              <div className="flex flex-col gap-6">
                {/* 1. Choose Style */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-[#000] uppercase tracking-wide">1. Choose Style</span>
                    {/* <Link href="/products/cap-collection" className="text-xs font-semibold text-blue-600 hover:underline">
                      View all
                    </Link> */}
                  </div>

                  <div className="relative">
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                      {productsData.filter((p) => p.colors && p.colors.length > 0).map((p) => {
                        const isSelected = selectedStyleSlug === p.slug;
                        const thumb = p.colors?.[0]?.media?.find((m) => m.type === "image")?.src
                          ?? p.media?.[0]?.src
                          ?? p.images?.[0];
                        return (
                          <button
                            key={p.slug}
                            type="button"
                            onClick={() => handleSelectStyle(p.slug)}
                            className={`relative flex-shrink-0 w-32 rounded-xl border bg-white overflow-hidden text-center transition-all ${
                              isSelected ? "border-blue-500" : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </span>
                            )}
                            <div className="relative w-full aspect-square bg-white">
                              {thumb && <Image src={thumb} alt={p.styleLabel ?? p.name} fill className="object-contain p-1" />}
                            </div>
                            <div className="px-2 py-2 border-t border-gray-100">
                              <span className="text-xs font-bold text-gray-900 block">{p.styleLabel ?? p.name}</span>
                              {/* {p.styleSubtitle && (
                                <span className="text-[10px] text-gray-500 block">{p.styleSubtitle}</span>
                              )} */}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. Choose Color (colors of the currently selected style) */}
                {selectedStyleProduct.colors && selectedStyleProduct.colors.length > 0 && (
                  <SwatchPickerRow
                    title={<span className="text-sm font-bold text-[#000] uppercase tracking-wide block">2. Choose Color</span>}
                    modalTitle="Colours"
                    items={selectedStyleProduct.colors.map((c) => ({
                      id: c.label,
                      label: c.label,
                      image: c.media?.find((m) => m.type === "image")?.src,
                      hex: c.hex,
                    }))}
                    selectedId={selectedStyleColor}
                    onSelect={(id) => handleSelectStyleColor(id)}
                    visibleCount={7}
                  />
                )}
              </div>
            )}

            {/* Fabric Type: Basic vs Premium comparison cards — hidden on style-picker pages */}
            {/* Fabric Type: Basic vs Premium comparison cards — hidden for style-picker/default-category pages */}
            {!product.isStylePicker && !product.isDefaultCategory && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                 <span className="text-sm font-bold text-[#000] uppercase tracking-wide mb-3 block">1. Bag Type</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FABRIC_PLAN_CARDS.map((plan) => {
                  const isSelected = fabricCategory === plan.id;
                  const isPremium = plan.id === "premium";
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        setFabricCategory(plan.id);
                        setSelectedSubCategory(null);
                        setSelectedMaterialProductId(null);
                        setOverrideImage(null);
                        setOverrideMedia(null);
                        setSelectedFabricChoiceId(null);
                        setSelectedFabricProductId(null);
                      }}
                      className={`relative text-left rounded-2xl border p-4 sm:p-5 transition-all overflow-hidden flex items-start gap-3 ${
                        isSelected
                          ? isPremium
                            ? "border-purple-400 bg-gradient-to-br from-purple-50 to-white shadow-[0_8px_24px_rgba(147,51,234,0.15)]"
                            : "border-blue-300 bg-blue-50/40"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      {plan.recommended && (
                        <span className="absolute top-0 right-0 flex items-center gap-1 bg-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl">
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Recommended
                        </span>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2.5 mb-2.5 ml-1.5">
                         <span
                            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                              isPremium
                                ? isSelected ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-600"
                                : isSelected ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"
                            } ${
                              isSelected
                                ? isPremium
                                  ? "shadow-[0_0_0_2px_rgba(168,85,247,0.08),0_0_6px_1px_rgba(168,85,247,0.12)]"
                                  : "shadow-[0_0_0_2px_rgba(59,130,246,0.08),0_0_6px_1px_rgba(59,130,246,0.12)]"
                                : ""
                            }`}
                          >
                            {isPremium ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 14.5a7.5 7.5 0 1115 0" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 14.5h15" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 14.5c2.5 0 5.5.6 5.5 2.25c0 1.1-1.34 1.75-2.75 1.75H12" />
                                <circle cx="12" cy="7.2" r="0.6" fill="currentColor" />
                              </svg>
                            )}
                          </span>
                          <div className="min-w-0">
                            <span className={`text-[15px] sm:text-base font-extrabold uppercase tracking-wide block ${isPremium ? "text-purple-600" : "text-blue-600"}`}>
                              {plan.badge}
                            </span>
                            <span className="text-[11px] text-gray-400 font-semibold block mt-0.5">
                              ({plan.subtitle})
                            </span>
                          </div>
                        </div>

                        <ul className="flex flex-col gap-2 mt-3">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span
                                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  isPremium ? "bg-purple-500" : "bg-blue-500"
                                }`}
                              >
                                <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" strokeWidth={3.5} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </span>
                              <span className="text-[11px] text-gray-600">{f.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0">
                        <Image src={plan.image} alt={plan.title} fill className="object-contain" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sub-category buttons for the selected fabric category — hidden on basic-premium pages (they use "Choose Fabric" instead) */}
              {!product.isBasicPremiumCategory && (
                <>
                <div className="flex flex-wrap gap-2 mt-4">
                  {(product.fabricSubCategories?.[fabricCategory] ?? []).map((sub) => {
                    const isActive = selectedSubCategory === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubCategory(isActive ? null : sub.id);
                          setSelectedMaterialProductId(null);
                        }}
                        className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
                          isActive
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>

                {/* Specific material product cards for the selected sub-category */}
                {selectedSubCategory && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                    {(product.fabricSubCategories?.[fabricCategory] ?? [])
                      .find((s) => s.id === selectedSubCategory)
                      ?.products.map((p) => {
                        const isSelected = selectedMaterialProductId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedMaterialProductId(p.id);
                              setOverrideImage(p.image);
                            }}
                            className={`rounded-lg border bg-white overflow-hidden text-center transition-all ${
                              isSelected ? "border-black" : "border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            <div className="relative w-full aspect-square">
                              <Image src={p.image} alt={p.name} fill className="object-contain p-1.5" />
                            </div>
                            <div className={`px-1 py-1.5 border-t ${isSelected ? "border-black" : "border-gray-200"}`}>
                              <span className={`text-[10px] sm:text-[11px] leading-tight ${isSelected ? "font-extrabold text-gray-900" : "font-semibold text-gray-700"}`}>
                                {p.name}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                )}
                </>
              )}
            </div>
            )}
            {/* /Fabric Type comparison (hidden for style-picker/default-category) */}

            {/* Basic/Premium category: banner + dynamic Choose Fabric + Choose Color */}
            {product.isBasicPremiumCategory && product.fabricCategoryBanner && (() => {
              const banner = product.fabricCategoryBanner![fabricCategory];
              const isPremiumTheme = fabricCategory === "premium";
              return (
                <div
                  className={`rounded-2xl p-5 sm:p-6 flex items-center justify-between gap-4 overflow-hidden ${
                    isPremiumTheme
                      ? "bg-gradient-to-br from-purple-100 to-purple-50"
                      : "bg-gradient-to-br from-gray-50 to-blue-50"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className={`text-lg sm:text-xl font-black block ${isPremiumTheme ? "text-purple-700" : "text-blue-700"}`}>
                      {banner.title}
                    </span>
                    <span className="text-[14px] mt-1 text-gray-600 ">
                      {banner.description}
                    </span>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {banner.badges.map((b, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 bg-white text-gray-700 border border-gray-200"
                        >
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0">
                    <Image src={banner.image} alt={banner.title} fill className="object-contain" />
                  </div>
                </div>
              );
            })()}

            {product.isBasicPremiumCategory && product.fabricChoices && (
              <div>
                <span className="text-sm font-bold text-[#000] uppercase tracking-wide mb-3 block">2. Choose Fabric</span>
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${product.fabricChoices[fabricCategory].length}, minmax(0, 1fr))`,
                  }}
                >
                  {product.fabricChoices[fabricCategory].map((f) => {
                    const isSelected = selectedFabricChoiceId === f.id;
                    const isPremium = fabricCategory === "premium";
                    const rightImage = f.cardImage || f.products?.[0]?.image;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setSelectedFabricChoiceId(f.id);
                          setSelectedFabricProductId(null);
                        }}
                        className="relative rounded-2xl overflow-hidden text-left h-24 sm:h-28 min-w-0"
                      >
                        <Image src={f.image} alt={f.name} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/45" />

                        {/* Premium-only: product image layered above the background, bottom-right corner
                            (small + corner-anchored on purpose, so it never overlaps the title/subtitle
                            text or the selection tick). */}
                        {isPremium && rightImage && (
                          <div className="absolute bottom-3 sm:bottom-4 right-0 w-12 h-12 sm:w-16 sm:h-16 z-10 pointer-events-none">
                            <Image
                              src={rightImage}
                              alt={f.name}
                              fill
                              className="object-contain object-bottom drop-shadow-lg"
                            />
                          </div>
                        )}

                        <span
                          className={`absolute top-3 w-5 h-5 rounded-full border flex items-center justify-center z-20 ${
                            isPremium ? "left-3" : "right-3"
                          } ${isSelected ? "border-white bg-blue-600" : "border-white/70"}`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </span>
                        <div className={`relative z-20 h-full flex flex-col justify-center px-3 sm:px-4 min-w-0 ${isPremium && rightImage ? "pr-12 sm:pr-16" : ""}`}>
                          <span className="text-white text-base sm:text-lg font-extrabold truncate">{f.name}</span>
                          <span className="text-white/80 text-[11px] sm:text-xs font-medium truncate">{f.subtitle}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Specific products for the selected fabric */}
                {/* Specific products for the selected fabric (works identically for Basic and Premium — driven by fabricCategory) */}
                {selectedFabricChoiceId && (() => {
                  const chosenFabric = product.fabricChoices![fabricCategory].find((f) => f.id === selectedFabricChoiceId);
                  if (!chosenFabric?.products || chosenFabric.products.length === 0) return null;
                  const handleSelectFabricProduct = (id: string) => {
                    const p = chosenFabric.products!.find((prod) => prod.id === id);
                    if (!p) return;
                    setSelectedFabricProductId(p.id);
                    if (p.images && p.images.length > 0) {
                      setOverrideMedia(p.images.map((src) => ({ type: "image" as const, src })));
                      setOverrideImage(null);
                    } else {
                      setOverrideImage(p.image);
                      setOverrideMedia(null);
                    }
                  };
                  return (
                    <div className="mt-3">
                      <SwatchPickerRow
                        title={null}
                        modalTitle="Products"
                        items={chosenFabric.products.map((p) => ({ id: p.id, label: p.name, image: p.image }))}
                        selectedId={selectedFabricProductId}
                        onSelect={handleSelectFabricProduct}
                      />
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Material Selection — hidden for style-picker/default-category/basic-premium pages */}
            {!product.isStylePicker && !product.isDefaultCategory && !product.isBasicPremiumCategory && (
            <div>
              <span className="text-[16px] font-semibold text-gray-900 mb-3 block">
                Material Selection
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MATERIAL_OPTIONS.map((m) => {
                  const isSelected = selectedMaterial === m.id;
                  const isPurple = m.theme === "purple";
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMaterial(m.id)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                        isSelected
                          ? isPurple
                            ? "border-purple-400 bg-gradient-to-br from-purple-50 to-white"
                            : "border-blue-300 bg-blue-50/40"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <span className="relative w-9 h-9 flex-shrink-0">
                        <Image src={m.image} alt={m.label} fill className="object-contain" />
                      </span>
                      <span className="min-w-0">
                        <span className="text-sm font-bold text-gray-900 block">{m.label}</span>
                        <span className="text-xs text-gray-500 block">{m.subtitle}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            )}
            {/* /Material Selection (hidden for style-picker/default-category/basic-premium) */}

            <div>
              {product.isDefaultCategory ? (
                <span className="text-sm font-bold text-[#000] uppercase tracking-wide mb-3 block">1. Bag Type</span>
              ) : product.isBasicPremiumCategory ? (
                <span className="text-sm font-bold text-[#000] uppercase tracking-wide mb-3 block">3. Designing</span>
              ) : (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-[#000] uppercase tracking-wide mb-3 block">3. Designing</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: "plan" as const,
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 13a8 8 0 0116 0" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 13h11" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 13c3 .3 6.5 1 8.3 2.2c.9.6.6 1.9-.4 2.1c-2.9.6-6.4.2-7.9-.9" />
                        <circle cx="12" cy="5.4" r="0.6" fill="currentColor" />
                      </svg>
                    ),
                    title: "Plan",
                    titleAccent: "(Plain Bag)",
                    subtitle: "",
                    features: ["Plain cap without any design", "Perfect for Labels & Embroidery"],
                    image: "/bags/bg-plain-1.webp",
                    theme: "blue" as const,
                  },
                  {
                    id: "custom" as const,
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                      </svg>
                    ),
                    title: "Customized",
                    titleAccent: "(Add Your Design)",
                    subtitle: "",
                    features: ["Add your logo or artwork", "Choose printing or embroidery"],
                    image: "/bags/bg-plain-2.webp",
                    theme: "purple" as const,
                  },
                ].map((opt) => {
                  const isSelected = designMode === opt.id;
                  const isPurple = opt.theme === "purple";
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDesignMode(opt.id)}
                      className={`relative text-left rounded-2xl border p-3 sm:p-3.5 transition-all overflow-hidden flex items-center gap-3 ${
                        isSelected
                          ? isPurple
                            ? "border-purple-400 bg-gradient-to-br from-purple-50 to-white shadow-[0_8px_24px_rgba(147,51,234,0.15)]"
                            : "border-blue-300 bg-blue-50/40"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1.5">
                          <span
                            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                              isPurple
                                ? isSelected ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-600"
                                : isSelected ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"
                            } ${
                              isSelected
                                ? isPurple
                                  ? "shadow-[0_0_0_2px_rgba(168,85,247,0.08),0_0_6px_1px_rgba(168,85,247,0.12)]"
                                  : "shadow-[0_0_0_2px_rgba(59,130,246,0.08),0_0_6px_1px_rgba(59,130,246,0.12)]"
                                : ""
                            }`}
                          >
                            {opt.icon}
                          </span>
                          <div className="min-w-0 ">
                            <span className={`text-[13px] sm:text-[20px] font-extrabold uppercase tracking-wide block ${isPurple ? "text-purple-600" : "text-blue-600"}`}>
                              {opt.title}
                            </span>
                            <span className={`text-[10px] font-semibold block -mt-0.5 ${isPurple ? "text-purple-500" : "text-blue-500"}`}>
                              {opt.titleAccent}
                            </span>
                           
                          </div>
                        </div>

                        <span className="text-[12px] font-semibold text-gray-800 mb-2">{opt.subtitle}</span>

                        <ul className="flex flex-col gap-0.5">
                          {opt.features.map((f, i) => (
                            
                            <li key={i} className="flex items-center gap-1.5">
                              <span
                                className={`w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  isPurple ? "bg-purple-500" : "bg-blue-500"
                                }`}
                              >
                                <svg className="w-1.5 h-1.5 text-white" fill="none" stroke="currentColor" strokeWidth={3.5} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </span>
                              <span className="text-[10px] text-gray-600">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="relative w-20 h-20 sm:w-25 sm:h-25 flex-shrink-0">
                        <Image src={opt.image} alt={opt.title} fill className="object-contain" />
                      </div>
                   </button>
                  );
                })}
              </div>
              
            </div>

            {/* Choose Color — default-category pages only (never on basic-premium pages) */}
            {product.isDefaultCategory && !product.isBasicPremiumCategory && product.colors && product.colors.length > 0 && (
              <SwatchPickerRow
                title={<span className="text-sm font-bold text-[#000] uppercase tracking-wide block">2. Choose Color</span>}
                modalTitle="Colours"
                items={product.colors.map((c) => ({
                  id: c.label,
                  label: c.label,
                  image: c.media?.find((m) => m.type === "image")?.src,
                  hex: c.hex,
                }))}
                selectedId={selectedColor}
                onSelect={(id) => setSelectedColor(id)}
              />
            )}

            {product.logoUploadEnabled && designMode === "custom" && (
              <div className="rounded-2xl border-b border-gray-200 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                  {/* Upload logo — simple, no live preview / background removal */}
                  <div className="pr-0 sm:pr-5 pb-4 sm:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-sm font-semibold text-gray-800">Upload Your Logo</span>
                      <span className="text-[9px] font-bold uppercase tracking-wide text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Customized</span>
                    </div>
                    <span className="text-[11px] text-gray-400 mb-3">Add your logo and customize your product</span>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                        <div className="w-14 h-14 rounded-xl  flex items-center justify-center overflow-hidden bg-gray-50">
                          {logoPreviews.front ? (
                            <img src={logoPreviews.front} alt="Logo preview" className="w-full h-full object-contain" />
                          ) : (
                            <Image src="/bags/white-bg.webp" alt="Upload logo placeholder" width={60} height={60} className="w-full h-full bg-transparent object-contain" />
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-gray-700">Front Logo</span>
                        <span className="text-[9px] text-gray-400">PNG, JPG up to 5MB</span>
                      </div>
                      <label className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-blue-300 py-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 8.25L12 3.75m0 0L7.5 8.25M12 3.75v12" />
                        </svg>
                        <span className="text-[11px] font-semibold text-blue-600">Click to upload<br />or drag and drop</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setLogoFiles((prev) => ({ ...prev, front: file }));
                            setLogoPreviews((prev) => {
                              if (prev.front) URL.revokeObjectURL(prev.front);
                              return { ...prev, front: file ? URL.createObjectURL(file) : null };
                            });
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Any text / customization */}
                  <div className="pl-0 sm:pl-5 pt-4 sm:pt-0">
                    <span className="text-sm font-semibold text-gray-800 mb-1">
                      Any Text or Customization <span className="font-normal text-gray-400">(Optional)</span>
                    </span>
                    <div className="relative">
                      <textarea
                        value={customizationNote}
                        onChange={(e) => setCustomizationNote(e.target.value)}
                        rows={6}
                        placeholder={`E.g. Add "Team Alpha" text, gold thread embroidery, etc.`}
                        className="w-full rounded-xl border border-dashed border-gray-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-400 resize-none placeholder:text-gray-400"
                        />
                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                        <button
                          type="button"
                          title="Attachment"
                          onClick={() => referenceInputRef.current?.click()}
                          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-blue-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                          </svg>
                          <span className="text-[8px] font-medium">Attachment</span>
                        </button>
                        <button
                          type="button"
                          title="Photo"
                          onClick={() => referenceMediaInputRef.current?.click()}
                          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-blue-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.174C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.174 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                          </svg>
                          <span className="text-[8px] font-medium">Photo</span>
                        </button>
                        <input
                          ref={referenceInputRef}
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => { handleLogoChange(e.target.files?.[0] ?? null, "reference"); e.target.value = ""; }}
                        />
                        <input
                          ref={referenceMediaInputRef}
                          type="file"
                          accept="image/*,video/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => { handleLogoChange(e.target.files?.[0] ?? null, "reference"); e.target.value = ""; }}
                        />
                      </div>
                    </div>
                    {referenceImage && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 min-w-0 mt-1.5">
                        <span className="truncate">{referenceImage.name}</span>
                        <button
                          type="button"
                          onClick={() => handleLogoChange(null, "reference")}
                          className="text-gray-400 hover:text-red-600 flex-shrink-0"
                          title="Remove attachment"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {pendingBgConfirm && (
              <RemoveBgConfirmModal
                onKeepOriginal={() => setPendingBgConfirm(null)}
                onRemoveBg={() => {
                  const { file, side } = pendingBgConfirm;
                  setPendingBgConfirm(null);
                  runBackgroundRemoval(file, side);
                }}
              />
            )}

            <QuantityTierSelector
              displayPrice={product.displayPrice}
              quantity={numQty}
              setQuantity={setQuantity}
              stepNumber={["casual-premium-and-basic-cap", "customized-caps"].includes(product.slug) ? 4 : 3}
            />
            {product.sizes && (
              <SizeQuantityBreakdown
                sizes={product.sizes}
                totalQty={numQty}
                sizeQuantities={sizeQuantities}
                setSizeQuantities={setSizeQuantities}
                setShowSizeGuide={setShowSizeGuide}
              />
            )}

             {colorSameDayAvailable ? (
              <DeliverySelector selected={deliveryType} onSelect={setDeliveryType}
                sameDayTurnaround={product.sameDayTurnaround} quantity={numQty} pricePerUnit={pricePerUnit} 
                onBorzoCharge={(charge) => setBorzoCharge(charge)}
                onSlotChange={setDeliverySlot}
                sameDayAvailable={colorSameDayAvailable}
                stepNumber={["casual-premium-and-basic-cap", "customized-caps"].includes(product.slug) ? 5 : 4}
                />
            ) : (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2.5">Delivery</p>
                <div className="py-3 px-4 rounded-xl border border-blue-500 bg-blue-50 text-sm text-blue-800">
                  <div className="font-semibold">Standard Delivery</div>
                  <div className="text-xs text-gray-500 mt-0.5">{product.turnaround ?? "5-7 business days"} · Free Shipping</div>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3 py-4 border-dashed border-gray-500 border-y border-gray-100">
              {/* {product.customizable && (
                <Link href="/customized-your-t-shirt"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                  </svg>
                  Customize Now
                </Link>
              )} */}

              <div className="bg-gray-50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <div className="flex items-center justify-between gap-2 sm:block">
                    <span className="text-xl font-semibold text-gray-500 block">Order Total</span>
                    <span className="text-xl font-extrabold text-blue-700 bg-blue-50 inline-block px-2 py-0.5 rounded-lg mt-1">{formatPrice(totalPrice)}</span>
                  </div>
                  {discountPct > 0 && (
                    <p className="text-xs font-semibold text-green-600 mt-1 text-right sm:text-left">
                      You save {formatPrice((product.displayPrice - pricePerUnit) * numQty)}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 sm:justify-end w-full">
                  <button onClick={handleAddToCart}
                    className="w-full sm:w-auto sm:px-18 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-gray-900 bg-white text-gray-900 font-bold text-sm hover:bg-gray-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.872-4.682 2.236-7.108a1.125 1.125 0 00-1.12-1.387H5.25M7.5 14.25L5.106 5.272M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    Add to Cart
                  </button>
                  <button onClick={handleCheckoutNow}
                    className="w-full sm:w-auto sm:px-18 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gray-900 hover:bg-gray-700 text-white font-bold text-sm transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                    </svg>
                    Checkout Now
                  </button>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="border border-gray-200 rounded-2xl p-4 sm:p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-3">
               {[
                  {
                    path: "M12 3l7.5 3v6c0 4.97-3.246 9.086-7.5 10.5-4.254-1.414-7.5-5.53-7.5-10.5V6l7.5-3z",
                    checkPath: "M9 12.75l1.5 1.5L15 9.75",
                    bg: "bg-green-50", color: "text-green-600",
                    title: "100% Secure", sub: "Safe & trusted payments",
                  },
                  {
                    path: "M3 8.25h9v6.75H3V8.25zM12 10.5h3.75l2.25 2.25v2.25H12V10.5z",
                    circle1: { cx: 6.75, cy: 16.5 }, circle2: { cx: 15.75, cy: 16.5 },
                    bg: "bg-blue-50", color: "text-blue-600",
                    title: "FREE SHIPPING*", sub: "On all orders",
                  },
                  {
                    path: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
                    bg: "bg-orange-50", color: "text-orange-500",
                    title: "FAST DELIVERY*", sub: "Quick & reliable",
                  },
                  {
                    path: "M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3",
                    bg: "bg-purple-50", color: "text-purple-500",
                    title: "EASY RETURNS", sub: "Hassle-free returns",
                  },
                ].map((t, i) => (
                  <div
                    key={t.title}
                    className={`flex items-center gap-3 ${
                      i !== 0 ? "sm:border-l sm:border-gray-200 sm:pl-4" : ""
                    }`}
                  >
                    <span className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${t.bg} flex items-center justify-center flex-shrink-0`}>
                      <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${t.color}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={t.path} />
                        {t.checkPath && <path strokeLinecap="round" strokeLinejoin="round" d={t.checkPath} />}
                        {t.circle1 && <circle cx={t.circle1.cx} cy={t.circle1.cy} r="1.5" fill="currentColor" />}
                        {t.circle2 && <circle cx={t.circle2.cx} cy={t.circle2.cy} r="1.5" fill="currentColor" />}
                      </svg>
                    </span>
                    <div>
                      <span className="text-[12px] font-bold text-gray-900 leading-tight block">{t.title}</span>
                      <span className="text-[9px] text-gray-500 leading-tight mt-0.5 block">{t.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accordion tabs */}
            <div className="space-y-2">
              {[
                {
                  key: "details", icon: "M9 4L4 7.5V10L6.5 8.75L6 20H18L17.5 8.75L20 10V7.5L15 4C15 5.10457 13.6569 6 12 6C10.3431 6 9 5.10457 9 4Z",
                  title: "Product Description", sub: "(Manufacture, Care and Fit)",
                  content: (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        
                        <div><span className="text-gray-400 text-xs">Material</span><p className="font-medium text-gray-800 mt-0.5">{product.material}</p></div>
                        <div><span className="text-gray-400 text-xs">Print method</span><p className="font-medium text-gray-800 mt-0.5"> {product.printMethod}</p></div>
                        <div><span className="text-gray-400 text-xs">Available Pattern</span><p className="font-medium text-gray-800 mt-0.5">{product.availablepatterns} </p></div>
                        <div><span className="text-gray-400 text-xs">Category</span><p className="font-medium text-gray-800 mt-0.5">{product.category}</p></div>

                      </div>
                      <hr className="border-gray-100" />
                      <ul className="space-y-1.5">
                        <span className="text-gray-400 text-[15px]">Product Specifications</span>
                        <br/><br/>
                        {product.features?.map((f, i) => (
                          <li key={i} className="flex items-start font-medium gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
                  title: "Shipping Information", sub: "(Delivery timelines and coverage)",
                  content: (
                    <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                      <p className="text-[14px] text-[#4a5565]">Free shipping on orders above ₹5,000. Standard delivery in {product.turnaround}.</p>
                      <p className="text-[14px] text-[#4a5565]">Express delivery available at checkout. Pan India coverage.</p>
                      <p className="text-[14px] text-[#4a5565]">Bulk orders above 100 pieces get priority dispatch.</p>
                    </div>
                  ),
                },
                {
                  key: "returns", icon: "M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3",
                  title: "7 Day Returns", sub: "(Know about return & exchange policy)",
                  content: (
                    <div className="flex flex-col gap-2">
                      <p className="text-[14px] text-[#4a5565]">Defective or wrong products are eligible for free return within 7 days of delivery.</p>
                      <p className="text-[14px] text-[#4a5565]">Custom/personalized items are non-returnable unless defective.</p>
                      <p className="text-[14px] text-[#4a5565]">Contact support within 48 hours of receiving a defective product.</p>
                    </div>
                  ),
                },
              ].map(({ key, icon, title, sub, content }) => (
                <div key={key} className="border border-gray-200 rounded-2xl overflow-hidden">
                  <button onClick={() => setActiveTab(activeTab === key as any ? "none" as any : key as any)}
                    className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors">
                    <span className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      key === "details" ? "bg-green-50" : key === "shipping" ? "bg-blue-50" : "bg-yellow-50"
                    }`}>
                      <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        key === "details" ? "text-green-600" : key === "shipping" ? "text-blue-600" : "text-yellow-600"
                      }`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                      </svg>
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] sm:text-[15px] font-bold text-gray-900 leading-tight block">{title}</span>
                      <span className="text-[10px] sm:text-[13px] text-gray-500 leading-tight mt-0.5 block">{sub.replace(/[()]/g, "")}</span>
                    </div>
                    <span className="text-2xl text-gray-400 flex-shrink-0 font-light leading-none">
                      {activeTab === key ? "−" : "+"}
                    </span>
                  </button>
                  {activeTab === key && <div className="px-4 pb-4 border-t border-gray-100 pt-3">{content}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

     <ProductReviews productType="polo-t-shirt" productSlug={product.slug} />

      <CareInstructions />

      {/* Popular Searches */}
      <section className="bg-white py-10 px-6 sm:px-6 md:px-15">
        <div className="max-w-[1500px] mx-auto">
          <div className="mb-8 flex items-center gap-3">
            <img src="https://cdn.cluesstyle.com/public/gold-arrow.png" alt="arrow" className="w-7 h-7 sm:w-8 sm:h-8" />
            <h2 className="text-2xl font-semibold sm:text-3xl md:text-4xl">Popular Searches</h2>
          </div>
          <div className="space-y-4  md:px-15 text-[14px] sm:text-[16px] text-[#000]">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="leading-loose flex flex-wrap gap-x-0 gap-y-1">
                {["Cotton T-Shirts", "Polyester T-Shirts", "Half Sleeve T-Shirts", "Full Sleeve T-Shirts For Men", "Round Neck T-Shirt For Men"].map((label, i) => (
                  <span key={i} className="inline-flex items-center">
                    <Link href={`/t-shirts/${label.toLowerCase().replace(/ /g, "-")}`} className="hover:underline">{label}</Link>
                    {i < 4 && <span className="mx-2 text-gray-300">|</span>}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-5">
          <div className="mb-10 flex items-center gap-3">
            <img src="https://cdn.cluesstyle.com/public/gold-arrow.png" alt="arrow" className="w-7 h-7 sm:w-8 sm:h-8" />
            <h2 className="text-2xl font-semibold sm:text-3xl md:text-4xl">Frequently Asked Questions</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {[
              { q: "What is the fabric composition?", a: "Our apparel is crafted using premium-quality fabrics designed for comfort, durability, and everyday wear." },
              { q: "Do you offer custom printing?", a: "Yes, we provide custom printing and branding solutions for businesses, events, and bulk orders." },
              { q: "What sizes are available?", a: "We offer sizes ranging from XS to 5XL depending on the product category." },
              { q: "How long does shipping take?", a: "Orders are typically delivered within 3–7 business days depending on your location." },
              { q: "Can I return my order?", a: "Yes, eligible products can be returned within 15 days of delivery as per our return policy." },
              { q: "Do you provide bulk order discounts?", a: "Yes, bulk purchases automatically qualify for volume-based discounts." },
            ].map((faq, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 sm:py-5 flex items-center justify-between text-left gap-3"
                >
                  <span className="font-semibold text-[15px] sm:text-[16px]">{faq.q}</span>
                  <span className={`text-xl flex-shrink-0 transition-transform duration-300 ${openFaq === idx ? "rotate-45" : ""}`}>+</span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5">
                    <p className="text-[14px] text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <RecentlyViewed />

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowSizeGuide(false)}>
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowSizeGuide(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-gray-100 shadow flex items-center justify-center">✕</button>
            <img
              src="/cluesstyle-oversize-tshirt-size-chart.webp"
              alt="Size Guide"
              className="w-full h-auto block rounded-t-2xl sm:rounded-2xl"
            />
          </div>
        </div>
      )}
{pendingPrintType && (
        <PrintTypeInfoModal
          printType={pendingPrintType}
          onClose={() => {
            setPrintType(previousPrintType); // revert if they back out
            setPendingPrintType(null);
          }}
          onConfirm={() => {
            setPendingPrintType(null); // printType is already set optimistically
          }}
        />
      )}

      {/* Color Variant Modal */}
      {showOrderModal && (
  <OrderModal
    product={product}
    productImage={media[activeImg]?.src || media[0]?.src || product.images[0]}
    quantity={numQty}
    pricePerUnit={pricePerUnit}
    sameDayCharge={effectiveSameDayCharge}
    deliveryType={deliveryType}
    selectedSize={selectedSize}
    selectedColor={selectedColor}
    loggedInUser={loggedInUser}
    deliverySlot={deliverySlot}
    onClose={() => setShowOrderModal(false)}
  />
)}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] bg-gray-900 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 w-max max-w-[90vw]">
          <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}