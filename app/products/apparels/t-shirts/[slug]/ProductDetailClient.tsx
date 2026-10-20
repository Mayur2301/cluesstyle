"use client";

import { useState, useRef, useEffect, useCallback, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CareInstructions from "@/app/components/warrenty";

import RecentlyViewed from "@/app/components/RecentlyViewed";
import ProductReviews from "@/app/components/ProductReviews";
import { productsData, DEFAULT_OFFER, TSHIRT_QTY_TIERS, type Product, type MediaItem, type Offer } from "@/app/lib/t-shirts";
import {
  COST_PER_UNIT,
  computeEmbroideryCharge,
  getEmbroideryAutoNote,
  EMBROIDERY_DESIGN_CHARGE_FREE_MIN_QTY,
  computeDtfCharge,
  getDtfAutoNote,
  type QtyTier,
  getDiscountForQty,
  getPricePerUnit,
  computeOrderTotal,
  type DeliveryType,
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

// Store address shown when a shopper picks Self Pick Up as their delivery
// option — shared by the DeliverySelector card, the checkout summary, and
// the success screen so it only needs updating in one place.
const PICKUP_ADDRESS =
  "Shop No 15, Samta Society, Hiranandani Link Rd, near Bar Bank, near Kailash Vaibhav B Wing, HMPL Surya Nagar, Vikhroli West, Mumbai, Maharashtra 400079";

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
              className={`relative w-[100px] h-[120px] rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${isActive ? "border-gray-900 shadow-md" : "border-gray-200 hover:border-gray-400"}`}>
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

function MainViewer({ media, activeImg, setActiveImg, badge, wishlist, setWishlist, rating, reviewCount, sameDayAvailable, onRatingClick }: {
  media: MediaItem[]; activeImg: number; setActiveImg: (i: number) => void;
  badge?: string; wishlist: boolean; setWishlist: (v: boolean) => void;
  rating?: number; reviewCount?: number; sameDayAvailable?: boolean; onRatingClick?: () => void;
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
           {current?.type === "video" ? (
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
              className={`relative flex-shrink-0 w-[60px] h-[70px] rounded-xl border-2 overflow-hidden transition-all ${isActive ? "border-gray-900 shadow-sm" : "border-gray-200"}`}>
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

// Small reusable icon-only wrapper used for the little meta-info row inside
// each delivery card (calendar / clock / pin), kept separate from the big
// circular icon above it so both can be swapped independently per option.
function DeliveryMetaIcon({ path }: { path: string }) {
  return (
    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const DELIVERY_ACCENTS = {
  blue:   { border: "border-blue-500",   bg: "bg-blue-50/40",   iconBg: "bg-blue-100",   iconColor: "text-blue-600",   radio: "border-blue-600",   dot: "bg-blue-600",   badgeBg: "bg-green-100", badgeText: "text-green-700" },
  green:  { border: "border-green-500",  bg: "bg-green-50/40",  iconBg: "bg-green-100",  iconColor: "text-green-600",  radio: "border-green-600",  dot: "bg-green-600",  badgeBg: "bg-blue-100",  badgeText: "text-blue-700" },
  purple: { border: "border-purple-500", bg: "bg-purple-50/40", iconBg: "bg-purple-100", iconColor: "text-purple-600", radio: "border-purple-600", dot: "bg-purple-600", badgeBg: "bg-purple-100", badgeText: "text-purple-700" },
};

function DeliveryOptionCard({
  selected, onClick, accent, icon, title, metaIconPath, metaText, badge,
}: {
  selected: boolean;
  onClick: () => void;
  accent: keyof typeof DELIVERY_ACCENTS;
  icon: React.ReactNode;
  title: string;
  metaIconPath: string;
  metaText: string;
  badge?: string;
}) {
  const a = DELIVERY_ACCENTS[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 min-w-[150px] text-left rounded-2xl border-2 p-3 sm:p-3.5 transition-all ${
        selected ? `${a.border} ${a.bg}` : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <span className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
        selected ? a.radio : "border-gray-300"
      }`}>
        {selected && <span className={`w-2.5 h-2.5 rounded-full ${a.dot}`} />}
      </span>

      <div className="flex items-center gap-2.5 pr-7">
        <span className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${a.iconBg} flex items-center justify-center flex-shrink-0`}>
          <span className={a.iconColor}>{icon}</span>
        </span>
        <span className="font-extrabold text-[14px] text-gray-900 leading-tight">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-1.5 mt-2">
        <DeliveryMetaIcon path={metaIconPath} />
        <span className="text-gray-500 text-[14px]">{metaText}</span>
      </div>

      {badge && (
        <span className={`inline-block mt-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${a.badgeBg} ${a.badgeText}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function DeliverySelector({ selected, onSelect, sameDayTurnaround, sameDayAvailable = true, pickupAddress }: {
  selected: DeliveryType;
  onSelect: (v: DeliveryType) => void;
  sameDayTurnaround?: string;
  sameDayAvailable?: boolean;
  pickupAddress: string;
})  {
  const sameDayBanner = (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-start gap-2.5">
      <svg className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
      <p className="text-xs text-orange-800 leading-relaxed">
        Same-day delivery is available only within Mumbai. Nothing is charged for delivery right now —
        our team will call you shortly after you place the order to confirm the delivery charge and time slot.
      </p>
    </div>
  );

  const pickupBanner = (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5">
      <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
      <div>
        <p className="text-xs font-bold text-blue-900">Pickup location</p>
        <p className="text-xs text-blue-700 leading-relaxed mt-0.5">{pickupAddress}</p>
        <p className="text-[11px] text-blue-600 mt-1.5">We'll message you once your order is ready for pickup.</p>
      </div>
    </div>
  );

  return (
    <div>
      <span className="text-[20px] font-extrabold text-gray-900 block mb-2">Delivery Speed</span>
      {sameDayAvailable && (
        <span className="flex items-center gap-2 text-[14px] font-semibold text-green-600 mb-3">
          
        </span>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <DeliveryOptionCard
          selected={selected === "standard"}
          onClick={() => onSelect("standard")}
          accent="blue"
          title="Standard Delivery"
          metaIconPath="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          metaText="5 - 7 business days"
          badge="Free Shipping"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          }
        />

        {/* On mobile the cards stack vertically, so each card's own info
            banner needs to sit directly under it (in this same flex-col
            flow) rather than after the whole group — otherwise a banner
            for the middle card would visually land below the last card.
            sm:contents makes this wrapper disappear on desktop so the card
            itself becomes a direct flex-row item again, with the banner
            (sm:hidden) rendering nowhere there — the single shared banner
            below the row (further down, hidden on mobile) covers desktop. */}
        {sameDayAvailable && (
          <div className="flex flex-col sm:contents">
            <DeliveryOptionCard
              selected={selected === "sameday"}
              onClick={() => onSelect("sameday")}
              accent="green"
              title="Same Day Delivery"
              metaIconPath="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              metaText={sameDayTurnaround ?? "By 8 PM today"}
              badge="Mumbai only"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              }
            />
            {selected === "sameday" && <div className="sm:hidden mt-3">{sameDayBanner}</div>}
          </div>
        )}

        <div className="flex flex-col sm:contents">
          <DeliveryOptionCard
            selected={selected === "pickup"}
            onClick={() => onSelect("pickup")}
            accent="purple"
            title="Self Pick Up"
            metaIconPath="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            metaText="Free · Collect from our store"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
              </svg>
            }
          />
          {selected === "pickup" && <div className="sm:hidden mt-3">{pickupBanner}</div>}
        </div>
      </div>

      {/* Desktop only — mobile shows the banner right under its own card above */}
      <div className="hidden sm:block">
        {selected === "sameday" && <div className="mt-2">{sameDayBanner}</div>}
        {selected === "pickup" && <div className="mt-2">{pickupBanner}</div>}
      </div>
    </div>
  );
}

// ── Quantity Tier Selector ─────────────────────────────────────────────────────

const VISIBLE_TIER_COUNT = 4;

function QuantityTierSelector({ displayPrice, quantity, setQuantity, onOpenSizes, orderType, tiers }: {
  displayPrice: number; quantity: number; setQuantity: (q: number) => void; onOpenSizes?: () => void; orderType: "single" | "bulk"; tiers: QtyTier[];
}) {
  const [inputVal, setInputVal] = useState(String(quantity));
  const [showAllTiers, setShowAllTiers] = useState(false);

  useEffect(() => {
    setInputVal(String(quantity));
  }, [quantity]);

  const activeTier = tiers.reduce((acc, t) => (quantity >= t.minQty ? t : acc), tiers[0]);
  const activeTierIndex = tiers.findIndex((t) => t.minQty === activeTier.minQty);

  // If a manually typed quantity lands on a tier that's currently hidden
  // (beyond the visible mobile count), auto-expand so it's shown & highlighted.
  useEffect(() => {
    if (activeTierIndex >= VISIBLE_TIER_COUNT) setShowAllTiers(true);
  }, [activeTierIndex]);

  const visibleTiers = showAllTiers ? tiers : tiers.slice(0, VISIBLE_TIER_COUNT);
  const hiddenTiers = tiers.slice(VISIBLE_TIER_COUNT);
  // Reads the bulk threshold from the actual tiers passed in, instead of a
  // hardcoded "2", so this hint stays accurate if the first tier's minQty
  // is ever changed (e.g. to 4) — see bulkThreshold in the main component.
  const bulkStartsAt = tiers[0]?.minQty ?? 2;
  const isLowQty = quantity < bulkStartsAt;

  const renderTierCard = (tier: QtyTier) => {
    const isCurrent = activeTier.minQty === tier.minQty;
    const price = getPricePerUnit(displayPrice, tier.minQty, tiers);
    return (
      <button
        key={tier.minQty}
        onClick={() => {
          setQuantity(tier.minQty);
          setInputVal(String(tier.minQty));
        }}
        className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 transition-all ${
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
      {orderType === "bulk" && (
        <>
          {/* Mobile: collapsible tiers, 5 per row (4 tiers + "More Qty"), single row */}
          <div className="grid grid-cols-5 sm:hidden gap-2">
            {visibleTiers.map(renderTierCard)}

            {hiddenTiers.length > 0 && !showAllTiers && (
              <button
                onClick={() => setShowAllTiers(true)}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 px-2 py-3 hover:border-gray-400 hover:bg-gray-50 transition-all"
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
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 px-2 py-3 text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <span className="text-[11px] font-semibold">sizes</span>
              </button>
            )}
          </div>

          {/* Desktop: all tiers shown in one row */}
          <div
            className="hidden sm:grid gap-2 sm:gap-3"
            style={{ gridTemplateColumns: `repeat(${tiers.length}, minmax(0, 1fr))` }}
          >
            {tiers.map(renderTierCard)}
          </div>
        </>
      )}

      <div className="flex flex-row items-center gap-2 mt-3 sm:gap-3 w-full">
        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden w-fit flex-shrink-0">
          <button
            disabled={quantity <= 1}
            onClick={() => {
              const next = Math.max(1, quantity - 1);
              setQuantity(next);
              setInputVal(String(next));
            }}
            className="w-11 h-11 flex items-center justify-center text-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={() => {
              const parsed = parseInt(inputVal, 10);
              const valid = isNaN(parsed) || parsed < 1 ? 1 : parsed;
              setQuantity(valid);
              setInputVal(String(valid));
            }}
            className="w-16 text-center font-bold text-lg border-none outline-none"
          />
          <button
            onClick={() => {
              const next = quantity + 1;
              setQuantity(next);
              setInputVal(String(next));
            }}
            className="w-11 h-11 flex items-center justify-center text-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
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
            {isLowQty ? <>Order 1–{bulkStartsAt - 1} pieces<br /> switch to Bulk for lower pricing</> : <>Get lower price<br /> on higher quantity</>}
          </span>
        </div>
      </div>

      {onOpenSizes && (
        <button
          onClick={onOpenSizes}
          className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
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
    <div className="mt-0">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <span className="text-[16px] font-bold text-gray-900">
          Select sizes for your {totalQty} pcs
        </span>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSizeGuide(true)}
            className="flex items-center gap-1.5 text-gray-700 text-sm font-semibold hover:text-gray-900 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5v-7.5a1.5 1.5 0 011.5-1.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 6.75v3M11 6.75v1.5M14.5 6.75v3M18 6.75v1.5" />
            </svg>
            Size Guide
          </button>

          {remaining > 0 ? (
            <span className="text-orange-600 text-sm font-bold whitespace-nowrap">
              {remaining} remaining
            </span>
          ) : (
            <span className="text-green-600 text-sm font-bold whitespace-nowrap">
              All allocated ✓
            </span>
          )}
        </div>
      </div>

      {/* Mobile: 3-column grid, 5 sizes + More card */}
      <div className="grid grid-cols-3 sm:hidden gap-2">
        {sizes.slice(0, 5).map((size) => {
          const qty = sizeQuantities[size] || 0;
          const colorClass = SIZE_COLOR_MAP[size] ?? "text-gray-700";
          return (
            <div
              key={size}
              className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-gray-100 bg-white px-2 py-2"
            >
              <span className={`text-lg font-extrabold ${colorClass}`}>{size}</span>
              <span className="text-[11px] text-gray-500">
                Chest {SIZE_CHEST_MAP[size] ?? "—"}
              </span>
              <div className="flex items-center mt-1 bg-white border border-gray-200 rounded-full px-2 py-1">
                <button
                  onClick={() => decrement(size)}
                  disabled={qty === 0}
                  className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
                >
                  −
                </button>
                <span className="w-5 text-center font-bold text-sm">{qty}</span>
                <button
                  onClick={() => increment(size)}
                  disabled={remaining <= 0}
                  className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}

        {sizes.length > 5 && !showAllSizes && (
          <button
            onClick={() => setShowAllSizes(true)}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 px-2 py-3 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            <span className="flex items-center gap-1 text-sm font-bold text-gray-900">
              More sizes
              <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </span>
            <span className="text-[11px] text-gray-400">
              {sizes.slice(5)[0]} – {sizes[sizes.length - 1]}
            </span>
          </button>
        )}

        {showAllSizes && sizes.slice(5).map((size) => {
          const qty = sizeQuantities[size] || 0;
          const colorClass = SIZE_COLOR_MAP[size] ?? "text-gray-700";
          return (
            <div
              key={size}
              className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-gray-100 bg-white px-2 py-2"
            >
              <span className={`text-lg font-extrabold ${colorClass}`}>{size}</span>
              <span className="text-[11px] text-gray-500">
                Chest {SIZE_CHEST_MAP[size] ?? "—"}
              </span>
              <div className="flex items-center mt-1 bg-white border border-gray-200 rounded-full px-2 py-1">
                <button
                  onClick={() => decrement(size)}
                  disabled={qty === 0}
                  className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
                >
                  −
                </button>
                <span className="w-5 text-center font-bold text-sm">{qty}</span>
                <button
                  onClick={() => increment(size)}
                  disabled={remaining <= 0}
                  className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: original 3/7-column layout */}
      <div className="hidden sm:grid sm:grid-cols-7 gap-2">
        {visibleSizes.map((size) => {
          const qty = sizeQuantities[size] || 0;
          const colorClass = SIZE_COLOR_MAP[size] ?? "text-gray-700";
          return (
            <div
              key={size}
              className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-gray-100 bg-white px-2 py-1"
            >
              <span className={`text-lg font-extrabold ${colorClass}`}>{size}</span>
              <span className="text-[11px] text-gray-500">
                Chest {SIZE_CHEST_MAP[size] ?? "—"}
              </span>
              <div className="flex items-center  mt-1 bg-white border border-gray-200 rounded-full px-2 py-1">
                <button
                  onClick={() => decrement(size)}
                  disabled={qty === 0}
                  className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
                >
                  −
                </button>
                <span className="w-5 text-center font-bold text-sm">{qty}</span>
                <button
                  onClick={() => increment(size)}
                  disabled={remaining <= 0}
                  className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}

        {hasMoreSizes && !showAllSizes && (
          <button
            onClick={() => setShowAllSizes(true)}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 px-2 py-3 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            <span className="flex items-center gap-1 text-sm font-bold text-gray-900">
              More sizes
              <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </span>
            <span className="text-[11px] text-gray-400">
              {hiddenSizes[0]} – {hiddenSizes[hiddenSizes.length - 1]}
            </span>
          </button>
        )}
      </div>

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
        <div className="flex items-center justify-between gap-2 mt-3">
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
// ── Bulk Colour + Size Table ─────────────────────────────────────────────────────

type BulkRow = {
  id: string;
  colorLabel: string;
  sizeQty: Record<string, number>;
};

function BulkSizeStepper({
  qty, onChange, canIncrement = true,
}: {
  qty: number;
  onChange: (next: number) => void;
  canIncrement?: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-1 border border-gray-200 rounded-lg px-1 py-1 bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, qty - 1))}
        disabled={qty === 0}
        className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-sm leading-none"
      >
        −
      </button>
      <span className="w-5 text-center font-bold text-[13px]">{qty}</span>
      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        disabled={!canIncrement}
        title={!canIncrement ? "You've reached your selected quantity" : undefined}
        className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-sm leading-none"
      >
        +
      </button>
    </div>
  );
}

// Small circular progress ring used in the "Selection Progress" footer.
function ProgressRing({ pct }: { pct: number }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct / 100);
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" className="flex-shrink-0">
      <circle cx="30" cy="30" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
      <circle
        cx="30" cy="30" r={r} fill="none" stroke="#16a34a" strokeWidth="6"
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
        transform="rotate(-90 30 30)" style={{ transition: "stroke-dashoffset 0.3s" }}
      />
      <text x="30" y="34" textAnchor="middle" fontSize="13" fontWeight="700" fill="#111827">
        {pct}%
      </text>
    </svg>
  );
}

// The "Size & Quantity" picker + "Selected" status for one row. Rendered as a
// fragment so it can drop straight in as two <td> siblings in the row.
function SizeQtyCell({
  sizes, sizeQty, onChangeSize, remaining,
}: {
  sizes: string[];
  sizeQty: Record<string, number>;
  onChangeSize: (size: string, next: number) => void;
  remaining: number;
}) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const reposition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setStyle({
      position: "absolute",
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 300),
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, reposition]);

  const selectedSizes = sizes.filter((s) => (sizeQty[s] || 0) > 0);
  const selectedCount = selectedSizes.length;
  const totalPcs = sizes.reduce((sum, s) => sum + (sizeQty[s] || 0), 0);

  const toggleSize = (size: string) => {
    const current = sizeQty[size] || 0;
    if (current > 0) {
      onChangeSize(size, 0);
    } else if (remaining > 0) {
      onChangeSize(size, 1);
    }
  };

  return (
    <>
      <td className="px-2 py-2.5">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center justify-between gap-1.5 w-full px-2.5 py-2 rounded-xl border border-gray-200 bg-white text-[12px] text-gray-700 hover:border-gray-300 transition-colors"
        >
          <span className="truncate">
            {selectedCount > 0
              ? `${selectedCount} size${selectedCount > 1 ? "s" : ""} · ${totalPcs} pcs`
              : "Select size and quantity"}
          </span>
          <svg className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </td>

      <td className="px-2 py-2.5 text-left">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 group">
          <span
            className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
              selectedCount > 0 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            {selectedCount > 0 ? `${selectedCount} size${selectedCount > 1 ? "s" : ""}` : "0 selected"}
          </span>
          <svg className="w-3 h-3 text-gray-400 group-hover:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        <span className="block text-[11px] text-gray-400 mt-0.5">{totalPcs} pcs</span>
      </td>

      {open && isMounted && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div style={style} className="rounded-xl border border-gray-200 bg-white shadow-xl p-2.5">
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
              {sizes.map((size) => {
                const qty = sizeQty[size] || 0;
                return (
                  <div key={size} className="flex items-center justify-between gap-2 py-2 px-1">
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={qty > 0}
                        onChange={() => toggleSize(size)}
                        className="w-4 h-4 rounded border-gray-300 accent-blue-600 flex-shrink-0"
                      />
                      <span className="text-[13px] font-semibold text-gray-800 truncate">
                        {size}{" "}
                        <span className="text-gray-400 font-normal">({SIZE_CHEST_MAP[size] ?? "—"})</span>
                      </span>
                    </label>
                    <BulkSizeStepper qty={qty} onChange={(next) => onChangeSize(size, next)} canIncrement={remaining > 0} />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-2 pt-2.5 mt-1 border-t border-gray-100">
              <span className="text-[12px] text-gray-500 whitespace-nowrap">
                {selectedCount} size{selectedCount !== 1 ? "s" : ""} selected ({totalPcs} pcs)
                {remaining <= 0 && <span className="block text-[11px] text-amber-600 font-semibold mt-0.5">Quantity limit reached</span>}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 transition-colors flex-shrink-0"
              >
                Done
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

function BulkColourSizeTable({
  colors,
  sizes,
  displayPrice,
  rows,
  setRows,
  onAddToCart,
  maxQty,
  tiers,
  onOpenSizeGuide,
}: {
  colors: NonNullable<Product["colors"]>;
  sizes: string[];
  displayPrice: number;
  rows: BulkRow[];
  setRows: (rows: BulkRow[]) => void;
  onAddToCart?: () => void;
  maxQty: number;
  tiers: QtyTier[];
  onOpenSizeGuide?: () => void;
}) {
  const [changeColourRowId, setChangeColourRowId] = useState<string | null>(null);
  const [addingColour, setAddingColour] = useState(false);

  const rowTotal = (row: BulkRow) => Object.values(row.sizeQty).reduce((a, b) => a + b, 0);
  const rawTotalQty = rows.reduce((sum, row) => sum + rowTotal(row), 0);
  const hasAnyQty = rawTotalQty > 0;
  const totalQty = rawTotalQty || 1;
  const unitPrice = hasAnyQty ? getPricePerUnit(displayPrice, totalQty, tiers) : null;
  const remaining = maxQty - rawTotalQty;
  const isOverAllocated = rawTotalQty > maxQty;

  const usedColors = new Set(rows.map((r) => r.colorLabel));
  const availableColors = colors.filter((c) => !usedColors.has(c.label));

  const completedCount = rows.filter((r) => rowTotal(r) > 0).length;
  const totalColours = rows.length;
  const pendingCount = totalColours - completedCount;
  const progressPct = totalColours > 0 ? Math.round((completedCount / totalColours) * 100) : 0;
  const canAddToCart = totalColours > 0 && pendingCount === 0 && !isOverAllocated && rawTotalQty === maxQty;

  const updateRow = (id: string, next: Partial<BulkRow>) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...next } : r)));
  };

  const updateRowSize = (id: string, size: string, qty: number) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const current = row.sizeQty[size] || 0;
    // Never let a single edit push the running total past the selected quantity.
    const bounded = qty > current ? Math.min(qty, current + Math.max(0, remaining)) : qty;
    updateRow(id, { sizeQty: { ...row.sizeQty, [size]: bounded } });
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((r) => r.id !== id));
  };

  const addColour = (label: string) => {
    setRows([...rows, { id: `${label}-${Date.now()}`, colorLabel: label, sizeQty: {} }]);
    setAddingColour(false);
  };

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-3.5 sm:p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <span className="text-[16px] sm:text-[17px] font-bold text-gray-900 block">
            Add Colours &amp; Sizes for Bulk Order
          </span>
          <span className="text-[12px] sm:text-[13px] text-gray-500 block mt-0.5">
            You can add multiple colours with different sizes in a single order
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenSizeGuide && (
            <button
              type="button"
              onClick={onOpenSizeGuide}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-gray-200 text-gray-700 text-[13px] font-bold hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5v-7.5a1.5 1.5 0 011.5-1.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 6.75v3M11 6.75v1.5M14.5 6.75v3M18 6.75v1.5" />
              </svg>
              Size Chart
            </button>
          )}
          <button
            type="button"
            onClick={() => setAddingColour(true)}
            disabled={availableColors.length === 0 || remaining <= 0}
            title={remaining <= 0 ? `All ${maxQty} pcs are already allocated — remove or reduce a size to add another colour` : undefined}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-gray-900 text-gray-900 text-[13px] font-bold hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-900"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Colour
          </button>
        </div>
      </div>

      <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-[12px] font-semibold ${
        isOverAllocated ? "bg-red-50 text-red-700" : remaining === 0 ? "bg-green-50 text-green-700" : "bg-white text-gray-600 border border-gray-200"
      }`}>
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        {isOverAllocated
          ? `You've allocated ${rawTotalQty} pcs, which is ${rawTotalQty - maxQty} more than your selected quantity of ${maxQty}. Please reduce a colour's sizes.`
          : `${rawTotalQty} of ${maxQty} pcs allocated${remaining > 0 ? ` · ${remaining} pcs remaining` : " · all pieces allocated"}`}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[24%]" />
            <col className="w-[15%]" />
            <col className="w-[12%]" />
            <col className="w-[13%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-[11px] font-bold text-gray-700 px-2 py-2.5">Colour</th>
              <th className="text-left text-[11px] font-bold text-gray-700 px-2 py-2.5">Size &amp; Quantity</th>
              <th className="text-left text-[11px] font-bold text-gray-700 px-2 py-2.5">Selected</th>
              <th className="text-center text-[11px] font-bold text-gray-700 px-2 py-2.5 whitespace-nowrap">Unit Price</th>
              <th className="text-center text-[11px] font-bold text-gray-700 px-2 py-2.5 whitespace-nowrap">Subtotal</th>
              <th className="text-center text-[11px] font-bold text-gray-700 px-2 py-2.5 whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const colorObj = colors.find((c) => c.label === row.colorLabel);
              const previewImage = colorObj?.media?.find((m) => m.type === "image")?.src;
              const qty = rowTotal(row);
              return (
                <tr key={row.id} className="border-b border-gray-100 last:border-b-0 align-middle">
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-2">
                      {previewImage && (
                        <span className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-white">
                          <Image src={previewImage} alt={row.colorLabel} fill className="object-contain" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <span className="block text-[12px] font-bold text-gray-900 truncate">{row.colorLabel}</span>
                        <button
                          type="button"
                          onClick={() => setChangeColourRowId(row.id)}
                          className="text-[10.5px] font-semibold text-blue-600 hover:text-blue-800 underline"
                        >
                          Change colour
                        </button>
                      </div>
                    </div>
                  </td>

                  <SizeQtyCell
                    sizes={sizes}
                    sizeQty={row.sizeQty}
                    onChangeSize={(size, next) => updateRowSize(row.id, size, next)}
                    remaining={remaining}
                  />

                  <td className="px-2 py-2.5 text-center text-[12px] font-bold text-gray-900 whitespace-nowrap">
                    {unitPrice !== null ? formatPrice(unitPrice) : "—"}
                  </td>
                  <td className="px-2 py-2.5 text-center text-[12px] font-bold text-gray-900 whitespace-nowrap">
                    {unitPrice !== null ? formatPrice(unitPrice * qty) : "—"}
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length <= 1}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors mx-auto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="md:hidden space-y-3">
        {rows.map((row) => {
          const colorObj = colors.find((c) => c.label === row.colorLabel);
          const previewImage = colorObj?.media?.find((m) => m.type === "image")?.src;
          const qty = rowTotal(row);
          const selectedCount = sizes.filter((s) => (row.sizeQty[s] || 0) > 0).length;
          return (
            <div key={row.id} className="rounded-xl border border-gray-200 bg-white p-3">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {previewImage && (
                    <span className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-white">
                      <Image src={previewImage} alt={row.colorLabel} fill className="object-contain" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <span className="block text-[13px] font-bold text-gray-900 truncate">{row.colorLabel}</span>
                    <button
                      type="button"
                      onClick={() => setChangeColourRowId(row.id)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline"
                    >
                      Change colour
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <SizeQtyMobilePicker
                    sizes={sizes}
                    sizeQty={row.sizeQty}
                    onChangeSize={(size, next) => updateRowSize(row.id, size, next)}
                    remaining={remaining}
                  />
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                    selectedCount > 0 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {selectedCount > 0 ? `${selectedCount} sizes` : "0 selected"}
                </span>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-dashed border-gray-200">
                <span className="text-[11px] text-gray-500">{unitPrice !== null ? `${formatPrice(unitPrice)} / unit` : "— / unit"}</span>
                <span className="text-[13px] font-bold text-gray-900">Subtotal: {unitPrice !== null ? formatPrice(unitPrice * qty) : "—"}</span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setAddingColour(true)}
        disabled={availableColors.length === 0 || remaining <= 0}
        title={remaining <= 0 ? `All ${maxQty} pcs are already allocated — remove or reduce a size to add another colour` : undefined}
        className="w-full mt-3 py-3 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 text-[13px] font-bold hover:border-blue-400 hover:bg-blue-50/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
      >
        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[13px] leading-none">+</span>
        {remaining <= 0 ? "All pieces allocated" : "Add Another Colour"}
      </button>

      {/* Selection progress + Add to Cart footer */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 mt-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <ProgressRing pct={progressPct} />
          <div>
            <span className="block text-[14px] font-bold text-gray-900">Selection Progress</span>
            <span className="block text-[12px] text-gray-500">{completedCount} of {totalColours} colours completed</span>
          </div>
        </div>

        <div className="flex items-center gap-5 sm:gap-8">
          <div className="text-center">
            <span className="block text-[11px] text-gray-500">Total Colours</span>
            <span className="block text-[16px] font-bold text-gray-900">{totalColours}</span>
          </div>
          <div className="text-center">
            <span className="block text-[11px] text-gray-500">Colours Completed</span>
            <span className="block text-[16px] font-bold text-gray-900">{completedCount}</span>
          </div>
          <div className="text-center">
            <span className="block text-[11px] text-gray-500">Colours Pending</span>
            <span className="block text-[16px] font-bold text-orange-500">{pendingCount}</span>
          </div>
        </div>

        {/* <button
          type="button"
          disabled={!canAddToCart}
          onClick={onAddToCart}
          className={`px-6 py-3 rounded-xl font-bold text-[14px] transition-colors whitespace-nowrap ${
            canAddToCart ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Add to Cart
        </button> */}
      </div>

      <div className="flex items-center justify-end gap-2 mt-3 text-[13px]">
        <span className="text-gray-500">Total: {rawTotalQty} / {maxQty} pcs</span>
        <span className="text-gray-300">|</span>
        <span className="font-bold text-gray-900">{unitPrice !== null ? formatPrice(unitPrice * totalQty) : "—"}</span>
      </div>

      {changeColourRowId && (() => {
        const currentRow = rows.find((r) => r.id === changeColourRowId);
        const selectableColors = colors.filter(
          (c) => c.label === currentRow?.colorLabel || !usedColors.has(c.label)
        );
        return (
          <ColorVariantModal
            colors={selectableColors}
            selectedColor={currentRow?.colorLabel ?? null}
            onSelect={(label) => {
              updateRow(changeColourRowId, { colorLabel: label });
              setChangeColourRowId(null);
            }}
            onClose={() => setChangeColourRowId(null)}
          />
        );
      })()}

      {addingColour && (
        <ColorVariantModal
          colors={availableColors}
          selectedColor={null}
          onSelect={addColour}
          onClose={() => setAddingColour(false)}
        />
      )}
    </div>
  );
}

// Mobile equivalent of SizeQtyCell: same dropdown/portal pattern, just laid
// out for the stacked-card mobile view instead of a table row.
function SizeQtyMobilePicker({
  sizes, sizeQty, onChangeSize, remaining,
}: {
  sizes: string[];
  sizeQty: Record<string, number>;
  onChangeSize: (size: string, next: number) => void;
  remaining: number;
}) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const reposition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setStyle({
      position: "absolute",
      top: rect.bottom + window.scrollY + 6,
      left: Math.max(8, Math.min(rect.left + window.scrollX, window.innerWidth - 300 - 8)),
      width: 300,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, reposition]);

  const selectedCount = sizes.filter((s) => (sizeQty[s] || 0) > 0).length;
  const totalPcs = sizes.reduce((sum, s) => sum + (sizeQty[s] || 0), 0);

  const toggleSize = (size: string) => {
    const current = sizeQty[size] || 0;
    if (current > 0) {
      onChangeSize(size, 0);
    } else if (remaining > 0) {
      onChangeSize(size, 1);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-2 w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-[12px] text-gray-700"
      >
        <span className="truncate">
          {selectedCount > 0 ? `${selectedCount} size${selectedCount > 1 ? "s" : ""} · ${totalPcs} pcs` : "Select size and quantity"}
        </span>
        <svg className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && isMounted && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div style={style} className="rounded-xl border border-gray-200 bg-white shadow-xl p-2.5">
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
              {sizes.map((size) => {
                const qty = sizeQty[size] || 0;
                return (
                  <div key={size} className="flex items-center justify-between gap-2 py-2 px-1">
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={qty > 0}
                        onChange={() => toggleSize(size)}
                        className="w-4 h-4 rounded border-gray-300 accent-blue-600 flex-shrink-0"
                      />
                      <span className="text-[13px] font-semibold text-gray-800 truncate">
                        {size}{" "}
                        <span className="text-gray-400 font-normal">({SIZE_CHEST_MAP[size] ?? "—"})</span>
                      </span>
                    </label>
                    <BulkSizeStepper qty={qty} onChange={(next) => onChangeSize(size, next)} canIncrement={remaining > 0} />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-2 pt-2.5 mt-1 border-t border-gray-100">
              <span className="text-[12px] text-gray-500 whitespace-nowrap">
                {selectedCount} size{selectedCount !== 1 ? "s" : ""} selected ({totalPcs} pcs)
                {remaining <= 0 && <span className="block text-[11px] text-amber-600 font-semibold mt-0.5">Quantity limit reached</span>}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 transition-colors flex-shrink-0"
              >
                Done
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
// ── Order Modal ────────────────────────────────────────────────────────────────

function OrderModal({
  product, productImage, quantity, pricePerUnit, sameDayCharge, deliveryType, selectedSize, selectedColor,
  loggedInUser, onClose,
  // Optional — only present for products that actually use them (size
  // breakdown, logo customization, etc). Omitted entirely for plain
  // size/color products, which keeps this fully backward compatible.
  sizeBreakdown, colorBreakdown, customizationNote, printType, fabricType, logoUrls,
  logoLayers, logoUploadedUrls,
}: {
  product: Product; productImage: string; quantity: number; pricePerUnit: number; sameDayCharge: number;
  deliveryType: DeliveryType; selectedSize: string | null;
  selectedColor: string | null; loggedInUser: { name: string; email?: string; phone?: string } | null;
  onClose: () => void;
  sizeBreakdown?: Record<string, number>;
  // One or more colours in a SINGLE order/payment, each with its own size
  // split — e.g. Red {S:10, M:5} + Blue {M:8, L:7}. When present (length
  // >= 1), this is what actually gets sent to the server as
  // customization.colorBreakdown, taking priority over the plain
  // `selectedColor` + `sizeBreakdown` above (which are still used for the
  // order summary line when this isn't present).
  colorBreakdown?: { color: string; sizeQty: Record<string, number> }[];
  customizationNote?: string;
  printType?: "dtf" | "embroidery";
  fabricType?: string;
  // Must be permanent hosted URLs (https://...), never blob:/data: URLs —
  // those only exist in this browser tab and are meaningless to the server.
  logoUrls?: Partial<Record<"front" | "back" | "left" | "right", string>>;
  // Position/scale/rotation data from the live preview canvas, paired with
  // the REAL uploaded URLs (not logoUrls' simple side->url form) — together
  // these build customization.logoDesign below, which is what actually
  // triggers design-PDF generation server-side after payment.
  logoLayers?: Record<Side, PreviewLayer[]>;
  logoUploadedUrls?: Record<Side, string | null>;
}) {
  const [step, setStep] = useState<"address" | "payment" | "processing" | "success">("address");
  const [confirmedOrderRef, setConfirmedOrderRef] = useState("");
  // "prepaid" charges the full amount now via Razorpay (existing flow).
  // "cod" charges only a 5% confirmation amount via Razorpay now; the rest
  // is collected in cash on delivery. The exact split is always
  // authoritatively recomputed server-side — these are for display only.
  const [paymentMode, setPaymentMode] = useState<"prepaid" | "cod">("prepaid");
  const [confirmedPaymentMode, setConfirmedPaymentMode] = useState<"prepaid" | "cod">("prepaid");
  const [confirmedCodDueAmount, setConfirmedCodDueAmount] = useState(0);
  const [address, setAddress] = useState({
    name: loggedInUser?.name ?? "", phone: loggedInUser?.phone ?? "", altPhone: "", gstNumber: "",
    email: loggedInUser?.email ?? "", pincode: "", city: "", state: "", line1: "", line2: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentError, setPaymentError] = useState("");
  const [showBreakdownItems, setShowBreakdownItems] = useState(true);
  // Mobile-only price breakdown card (desktop always shows this in the
  // sidebar) — defaults open so it's immediately visible, matching what
  // the sidebar already does.
  const [showMobilePriceBreakdown, setShowMobilePriceBreakdown] = useState(true);

  // Which logo positions are actually uploaded (front/back/left/right) —
  // drives the per-SIDE charge (each side has its own price) for whichever
  // print type is active, and whether embroidery's design charge applies.
  // Uses the real uploaded URLs, not just which slots have a File selected,
  // so the price shown here always matches what the server can validate.
  const activeLogoSides: Side[] = logoUploadedUrls
    ? (Object.keys(logoUploadedUrls) as Side[]).filter((side) => logoUploadedUrls[side])
    : [];
  // One or more colours, each with its own size split — drives the order
  // breakdown card shown below and what gets sent to the server.
  const hasColorBreakdown = !!colorBreakdown && colorBreakdown.length > 0;

  // Shared rows for the colour+size breakdown — used in the desktop summary
  // panel, the always-visible breakdown card (mobile + desktop), and the
  // success screen, so all three stay in sync automatically.
  const colorBreakdownRows = hasColorBreakdown
    ? colorBreakdown!.map((cb) => {
        const cbQty = Object.values(cb.sizeQty).reduce((a, b) => a + b, 0);
        const sizesLabel = Object.entries(cb.sizeQty)
          .filter(([, n]) => n > 0)
          .map(([size, n]) => `${size}×${n}`)
          .join(", ");
        return { color: cb.color, sizesLabel, qty: cbQty };
      })
    : [];
  const numEmbroideryPositions = activeLogoSides.length;
  const embroideryCharge = printType === "embroidery" ? computeEmbroideryCharge(quantity, activeLogoSides) : 0;
  const dtfCharge = printType === "dtf" ? computeDtfCharge(quantity, activeLogoSides) : 0;
  const printCharge = embroideryCharge + dtfCharge; // only one is ever non-zero, based on printType
  const totalBeforeSurcharge = pricePerUnit * quantity + printCharge;
  const gstAmount = Math.round((totalBeforeSurcharge + sameDayCharge) * 0.05);
  const grandTotal = totalBeforeSurcharge + sameDayCharge + gstAmount;
  const saved = (product.originalPrice - pricePerUnit) * quantity;

  // Client-side estimate only, for display before the order is created —
  // the server always recomputes and enforces both of these authoritatively
  // (see create-razorpay-order's PREPAID_DISCOUNT_PCT / COD_ADVANCE_PCT).
  //
  // "Pay Now" (prepaid) gets an instant 5% discount on the WHOLE order
  // (including GST) as an incentive for paying online in full. COD does
  // NOT get this discount — only a 5% confirmation charge is collected
  // now, calculated on the full undiscounted grandTotal.
  const payNowTotal = Math.round(grandTotal * 0.95);
  const prepaidDiscountAmount = grandTotal - payNowTotal;
  const codAdvanceAmount = Math.round(grandTotal * 0.05);
  const codDueAmount = grandTotal - codAdvanceAmount;
  const amountDueNow = paymentMode === "cod" ? codAdvanceAmount : payNowTotal;

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
    // Optional — only validated if the shopper actually typed something in.
    if (address.altPhone && !address.altPhone.match(/^[6-9]\d{9}$/)) e.altPhone = "Enter valid 10-digit number";
    if (!address.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) e.email = "Enter a valid email";
    // GST number is optional — only validated if the shopper actually typed
    // something in. Standard 15-character GSTIN format.
    if (address.gstNumber && !/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z][A-Z\d]$/.test(address.gstNumber.trim().toUpperCase())) {
      e.gstNumber = "Enter a valid 15-character GSTIN";
    }
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
      // Assemble customization.logoDesign in the exact shape the server
      // validates (create-razorpay-order's route.ts): only sides with
      // BOTH a real uploaded URL (not a blob: preview) AND at least one
      // placed layer get included. This is what actually triggers
      // design-PDF generation in verify-razorpay-payment — logoUrls alone
      // (no position data) does not.
      const SIDES: Side[] = ["front", "back", "right", "left"];
      const logoDesign: Record<string, { url: string; layers: { x: number; y: number; scale: number; rotation: number }[] }> = {};
      if (logoLayers && logoUploadedUrls) {
        for (const side of SIDES) {
          const url = logoUploadedUrls[side];
          const layers = logoLayers[side];
          if (!url || !layers || layers.length === 0) continue;
          logoDesign[side] = {
            url,
            layers: layers.map((l) => ({ x: l.pos.x, y: l.pos.y, scale: l.scale, rotation: l.rotation })),
          };
        }
      }
      const hasLogoDesign = Object.keys(logoDesign).length > 0;

      // BUGFIX: the `logoUrls` prop was never actually passed into
      // <OrderModal> at its call site — only `logoUploadedUrls` was — so this
      // was always undefined and the server never received any logo
      // positions, silently zeroing out the embroidery charge on the actual
      // Razorpay amount. Derive it directly from `logoUploadedUrls` instead,
      // which IS correctly populated.
      const resolvedLogoUrls: Partial<Record<"front" | "back" | "left" | "right", string>> = {};
      if (logoUploadedUrls) {
        for (const side of SIDES) {
          const url = logoUploadedUrls[side];
          if (url) resolvedLogoUrls[side] = url;
        }
      }

      // Combine the locked, auto-generated embroidery/DTF note (never
      // editable by the shopper) with whatever they actually typed, so the
      // admin still sees both — same as before, just no longer stored
      // inside the editable textarea's own state.
      const embroideryAutoNote = printType === "embroidery" ? getEmbroideryAutoNote(quantity, activeLogoSides) : null;
      const dtfAutoNote = printType === "dtf" ? getDtfAutoNote(quantity, activeLogoSides) : null;
      const combinedNote = [embroideryAutoNote ?? dtfAutoNote, customizationNote?.trim() || null].filter(Boolean).join("\n");

      // Build the optional customization object. Any key left undefined is
      // dropped by JSON.stringify, so plain size/color products end up
      // sending no `customization` field at all — identical to before.
      // `colorBreakdown` (one or more colours, each with its own size
      // split — see `hasColorBreakdown` above) takes priority server-side
      // over the plain `sizeBreakdown` when both would otherwise be present.
      const customization =
        hasColorBreakdown || sizeBreakdown || combinedNote || printType || fabricType || Object.keys(resolvedLogoUrls).length || hasLogoDesign
          ? {
              colorBreakdown: hasColorBreakdown
                ? colorBreakdown!.map((cb) => ({ color: cb.color, sizeBreakdown: cb.sizeQty }))
                : undefined,
              sizeBreakdown: !hasColorBreakdown && sizeBreakdown && Object.keys(sizeBreakdown).length ? sizeBreakdown : undefined,
              note: combinedNote || undefined,
              printType,
              numEmbroideryPositions: printType === "embroidery" ? numEmbroideryPositions : undefined,
              numDtfPositions: printType === "dtf" ? numEmbroideryPositions : undefined,
              fabricType,
              logoUrls: Object.keys(resolvedLogoUrls).length ? resolvedLogoUrls : undefined,
              logoDesign: hasLogoDesign ? logoDesign : undefined,
            }
          : undefined;

      const createRes = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // When colorBreakdown is present, the server ignores selectedColor
          // entirely — it's still sent as a readable fallback/for logging.
          productSlug: product.slug, quantity, selectedSize, selectedColor, deliveryType, paymentMode,
          customer: { name: address.name, phone: address.phone, altPhone: address.altPhone || undefined, gstNumber: address.gstNumber || undefined, email: address.email },
          address: { line1: address.line1, line2: address.line2, city: address.city, state: address.state, pincode: address.pincode },
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
          customization,
        }),
      });
      const order = await createRes.json();
      if (!createRes.ok || !order?.id) throw new Error(order?.error ?? "Could not create order. Please try again.");

      const options = {
        key: order.keyId, amount: order.amount, currency: order.currency,
        name: "CluesStyle",
        description:
          order.paymentMode === "cod"
            ? `${product.name} × ${quantity} — COD confirmation charge`
            : `${product.name} × ${quantity}`,
        order_id: order.id,
        prefill: { name: address.name, contact: address.phone, email: address.email },
        notes: { address: `${address.line1}, ${address.city}, ${address.state} - ${address.pincode}` },
        theme: { color: "#111827" },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/verify-razorpay-payment", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature }),
            });
            const verifyData = await verifyRes.json().catch(() => ({} as any));

            // Only show "success" once the server has actually verified the
            // Razorpay signature and marked the order paid. A failed/blocked
            // fetch (network drop, verify-payment throwing, bad signature,
            // etc.) must NOT be treated as a successful order.
            if (!verifyRes.ok || !verifyData?.success) {
              setPaymentError(
                verifyData?.error ??
                  `We couldn't confirm your payment. If money was deducted, it will be refunded within 5–7 business days. Reference payment ID: ${response.razorpay_payment_id}`
              );
              setStep("payment");
              return;
            }

            setConfirmedOrderRef(verifyData.order?.orderRef ?? order.orderRef);
            setConfirmedPaymentMode(order.paymentMode === "cod" ? "cod" : "prepaid");
            setConfirmedCodDueAmount(order.codDueAmount ?? 0);
            setStep("success");
          } catch {
            setPaymentError(
              `We couldn't confirm your payment due to a network error. If money was deducted, it will be refunded within 5–7 business days. Reference payment ID: ${response.razorpay_payment_id}`
            );
            setStep("payment");
          }
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

  const STATES = ["Maharashtra","Delhi","Karnataka","Tamil Nadu","Gujarat","Rajasthan","Uttar Pradesh","West Bengal","Telangana","Kerala","Madhya Pradesh","Punjab","Haryana","Bihar","Andhra Pradesh","Odisha","Jharkhand","Assam","Chhattisgarh","Uttarakhand","Himachal Pradesh","Goa","Tripura","Meghalaya","Manipur","Nagaland","Arunachal Pradesh","Mizoram","Sikkim","J&K","Ladakh"];

  // Small leading icon rendered inside a relatively-positioned input wrapper.
  const FieldIcon = ({ path }: { path: string }) => (
    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );

  // Right-hand trust/illustration rail shown alongside the address step on
  // wide screens — mirrors the summary sidebar's dark theme with a lighter,
  // reassuring counterpart full of delivery trust signals.
  const DeliveryInfoPanel = () => (
    <div className="hidden xl:flex flex-col w-[0px] flex-shrink-0 bg-gradient-to-b from-blue-50 via-indigo-50 to-white border-l border-blue-100 p-6 gap-5 overflow-y-auto">
      {/* <div className="rounded-2xl bg-white border border-blue-100 p-5 flex flex-col items-center text-center gap-2 shadow-sm">
        <span className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
        </span>
        <p className="text-[12px] font-extrabold text-gray-900">Cluesstyle</p>
      </div> */}

      {/* <div>
        <p className="text-[13.5px] font-bold text-gray-900 leading-snug">We deliver across India</p>
        <p className="text-[11.5px] text-gray-500 mt-1 leading-relaxed">
          Safe, reliable and on-time delivery for your favourite custom apparel.
        </p>
      </div> */}

      {/* <div className="flex flex-col gap-3.5">
        {[
          { title: "Secure Delivery", sub: "Your order is in safe hands", path: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" },
          { title: "Real-time Updates", sub: "Get notified at every step", path: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" },
          { title: "Easy Returns", sub: "Hassle-free support", path: "M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.path} />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-[11.5px] font-bold text-gray-800 leading-tight">{item.title}</p>
              <p className="text-[10px] text-gray-500 leading-tight">{item.sub}</p>
            </div>
          </div>
        ))}
      </div> */}

      {/* <p className="mt-auto italic text-[13px] text-gray-400 text-right" style={{ fontFamily: "cursive" }}>
        Wear Your Ideas
      </p> */}
    </div>
  );

  const STEP_DEFS = [
    { key: "address", num: 1, title: "Address", sub: "Add delivery details" },
    { key: "payment", num: 2, title: "Payment", sub: "Choose payment method" },
    { key: "success", num: 3, title: "Confirm", sub: "Review & place order" },
  ] as const;

  const StepTabs = () => {
    const stepOrder = { address: 0, payment: 1, processing: 1, success: 2 };
    const currentOrder = stepOrder[step];
    return (
      <div className="flex items-start mb-1">
        {STEP_DEFS.map((s, i) => {
          const thisOrder = stepOrder[s.key as keyof typeof stepOrder] ?? s.num - 1;
          const isActive = step === s.key || (s.key === "payment" && step === "processing");
          const isDone = currentOrder > thisOrder;
          const isFilled = isActive || isDone;
          return (
            <div key={s.key} className={`flex items-start ${i < STEP_DEFS.length - 1 ? "flex-1" : ""}`}>
              <div
                className={`flex items-start gap-2.5 ${isDone ? "cursor-pointer" : ""}`}
                onClick={() => { if (isDone) setStep(s.key as any); }}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 transition-colors ${
                  isFilled ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : s.num}
                </span>
                <div className="hidden xs:block sm:block">
                  <span className={`block text-[12.5px] font-bold leading-tight whitespace-nowrap ${isFilled ? "text-gray-900" : "text-gray-400"}`}>{s.title}</span>
                  <span className="block text-[10.5px] text-gray-400 leading-tight whitespace-nowrap hidden sm:block">{s.sub}</span>
                </div>
              </div>
              {i < STEP_DEFS.length - 1 && (
                <div className={`flex-1 h-[2px] mt-4 mx-2 sm:mx-3 rounded-full transition-colors ${currentOrder > i ? "bg-emerald-400" : "bg-gray-100"}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // One row per line item shown in the sidebar's itemised list — either the
  // multi-colour breakdown (one row per colour, using that colour's own
  // product photo when available) or a single row for a plain size/color pick.
  const orderLineItems = hasColorBreakdown
    ? colorBreakdownRows.map((row) => {
        const colorObj = product.colors?.find((c) => c.label === row.color);
        const img = colorObj?.media?.find((m) => m.type === "image")?.src ?? productImage;
        return { key: row.color, img, title: product.name, meta: row.color, sizeLabel: row.sizesLabel, qty: row.qty, price: pricePerUnit * row.qty };
      })
    : [{
        key: "single", img: productImage, title: product.name,
        meta: selectedColor ?? "", sizeLabel: selectedSize ?? "", qty: quantity, price: pricePerUnit * quantity,
      }];

  const SummaryPanel = () => (
    <div className="hidden sm:flex flex-col bg-slate-900 text-white w-[330px] lg:w-[370px] flex-shrink-0 overflow-y-auto">
      {/* Brand header */}
      <div className="px-6 pt-6 pb-5 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="bg-transparent rounded-lg p-1.5 flex-shrink-0 flex items-center justify-center">
            <img src="/cluesstyle-white-logo.png" alt="Cluesstyle" className="h-15 w-auto" />
          </span>
          {/* <div className="min-w-0">
            <p className="text-[8.5px] text-gray-500 tracking-widest uppercase leading-tight">Custom Apparel &amp; Merch</p>
          </div> */}
        </div>
        <button onClick={onClose} className="mt-4 flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-white transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to cart
        </button>
      </div>

      <div className="px-6 py-5 flex flex-col gap-5">
        {/* Itemised order */}
        <div>
          <p className="text-[14px] font-bold text-white mb-3">
            Your Order <span className="text-gray-500 font-medium">({orderLineItems.length} item{orderLineItems.length !== 1 ? "s" : ""})</span>
          </p>
          <div className="flex flex-col gap-5">
            {orderLineItems.map((item) => (
              <div key={item.key} className="flex gap-4">
               
                <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden flex-shrink-0">
                  <img src={item.img} alt={item.title} className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-gray-100 leading-snug truncate">
                    {item.meta ? `${item.meta} ${item.title}` : item.title}
                  </p>
                  <p className="text-[10.5px] text-gray-500 leading-snug truncate">
                    {item.sizeLabel}{item.sizeLabel ? " · " : ""}{item.qty} pc{item.qty !== 1 ? "s" : ""}
                  </p>
                </div>
                <p className="text-[12px] font-bold text-gray-200 whitespace-nowrap flex-shrink-0">{formatPrice(item.price)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-800" />

        {/* Price breakdown */}
        <div className="flex flex-col gap-2.5">
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
          {(deliveryType === "standard" || deliveryType === "pickup") && (
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
      </div>

      <div className="mt-auto flex-shrink-0">
        {/* Total — highlighted band */}
        <div className="mx-6 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3.5 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-white/90">{(step === "payment" || step === "processing") ? "Total Payable" : "Total"}</span>
          <span className="flex items-baseline gap-1.5">
            {(step === "payment" || step === "processing") && paymentMode === "prepaid" && (
              <span className="text-xs text-white/50 line-through">{formatPrice(grandTotal)}</span>
            )}
            <span className="text-lg font-extrabold text-white">
              {formatPrice((step === "payment" || step === "processing") && paymentMode === "prepaid" ? payNowTotal : grandTotal)}
            </span>
          </span>
        </div>

        {(step === "payment" || step === "processing") && (
          paymentMode === "cod" ? (
            <div className="mx-6 mt-3 bg-green-950/40 border border-green-800/60 rounded-xl px-3 py-2.5 flex flex-col gap-1 text-xs">
              <div className="flex justify-between text-green-300"><span>Pay now (confirmation)</span><span className="font-bold">{formatPrice(codAdvanceAmount)}</span></div>
              <div className="flex justify-between text-gray-400"><span>Due on delivery (cash)</span><span className="font-semibold">{formatPrice(codDueAmount)}</span></div>
            </div>
          ) : (
            <div className="mx-6 mt-3 flex justify-between text-xs">
              <span className="text-emerald-300 font-semibold">Instant discount (5%)</span>
              <span className="text-emerald-300 font-bold">−{formatPrice(prepaidDiscountAmount)}</span>
            </div>
          )
        )}

        {/* Delivery + trust footer */}
        <div className="px-6 pt-5 pb-6 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </span>
            <div className="min-w-0">
              <span className="text-white font-semibold text-[12px] leading-tight truncate">
                {deliveryType === "sameday" ? "Same-day delivery" : deliveryType === "pickup" ? "Self Pick Up" : "Standard delivery"}
              </span><br/>
              <span className="text-[10.5px] text-gray-500 leading-tight truncate">
                {deliveryType === "sameday"
                  ? "Charges confirmed on call"
                  : deliveryType === "pickup"
                    ? "Collect from our store"
                    : "5–7 business days"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 pt-3 border-t border-gray-800">
            <span className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </span>
            <div className="min-w-0">
              <span className="text-white font-semibold text-[12px] leading-tight">100% Secure Checkout</span><br/>
              <span className="text-[10.5px] text-gray-500 leading-tight">Your information is safe with us.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="fixed  inset-0 bg-black/70 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full sm:max-w-[820px] lg:max-w-[900px] xl:max-w-[1400px] rounded-t-2xl sm:rounded-2xl flex flex-col sm:flex-row overflow-hidden max-h-[96vh] sm:max-h-[88vh]"
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
                <p className="text-xs text-gray-500">
                  Qty: {quantity} · {formatPrice((step === "payment" || step === "processing") && paymentMode === "prepaid" ? payNowTotal : grandTotal)}
                  {(step === "payment" || step === "processing") && paymentMode === "cod" && (
                    <span className="text-green-600 font-semibold"> · Pay {formatPrice(codAdvanceAmount)} now</span>
                  )}
                  {(step === "payment" || step === "processing") && paymentMode === "prepaid" && (
                    <span className="text-emerald-600 font-semibold"> · 5% off</span>
                  )}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold flex-shrink-0">✕</button>
          </div>

          {/* Mobile price breakdown — the desktop sidebar always shows this
              (Price per unit / Subtotal / Bulk discount / Shipping / GST /
              Total); on mobile it was previously only visible as a single
              "Qty: X · ₹Total" line in the strip above, which doesn't say
              enough once multiple colours/sizes are involved. */}
          {step !== "success" && (
            <div className="sm:hidden border-b border-gray-100">
              <button
                type="button"
                onClick={() => setShowMobilePriceBreakdown((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-600"
              >
                <span>Price details</span>
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showMobilePriceBreakdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {showMobilePriceBreakdown && (
                <div className="px-4 pb-3.5 flex flex-col gap-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Price per unit</span>
                    <span className="text-gray-700">{formatPrice(pricePerUnit)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal ({quantity} pcs)</span>
                    <span className="text-gray-700">{formatPrice(totalBeforeSurcharge)}</span>
                  </div>
                  {saved > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Bulk discount</span>
                      <span className="text-green-600 font-medium">−{formatPrice(saved)}</span>
                    </div>
                  )}
                  {sameDayCharge > 0 && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Same-day delivery</span>
                      <span className="text-gray-700">{formatPrice(sameDayCharge)}</span>
                    </div>
                  )}
                  {(deliveryType === "standard" || deliveryType === "pickup") && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>GST (5%)</span>
                    <span className="text-gray-700">{formatPrice(gstAmount)}</span>
                  </div>

                  {(step === "payment" || step === "processing") && paymentMode === "prepaid" ? (
                    <div className="flex justify-between text-xs">
                      <span className="text-emerald-700 font-semibold">Instant discount (5%)</span>
                      <span className="text-emerald-700 font-bold">−{formatPrice(prepaidDiscountAmount)}</span>
                    </div>
                  ) : (step === "payment" || step === "processing") && paymentMode === "cod" ? (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-green-700 font-semibold">Pay now (confirmation)</span>
                        <span className="text-green-700 font-bold">{formatPrice(codAdvanceAmount)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Due on delivery (cash)</span>
                        <span className="text-gray-700 font-semibold">{formatPrice(codDueAmount)}</span>
                      </div>
                    </>
                  ) : null}

                  <div className="flex justify-between items-center pt-2 mt-1 border-t border-dashed border-gray-200">
                    <span className="text-[13px] font-bold text-gray-900">
                      {(step === "payment" || step === "processing") ? "Total Payable" : "Total"}
                    </span>
                    <span className="flex items-baseline gap-1.5">
                      {(step === "payment" || step === "processing") && paymentMode === "prepaid" && (
                        <span className="text-[11px] text-gray-400 line-through">{formatPrice(grandTotal)}</span>
                      )}
                      <span className="text-[15px] font-extrabold text-gray-900">
                        {formatPrice((step === "payment" || step === "processing") && paymentMode === "prepaid" ? payNowTotal : grandTotal)}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Desktop header */}
          <div className="hidden sm:flex items-start justify-between px-7 pt-6 pb-0 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                (step === "payment" || step === "processing") ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-600"
              }`}>
                {step === "address" && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                )}
                {(step === "payment" || step === "processing") && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                )}
                {step === "success" && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </span>
              <div>
                <h2 className="text-[15px] font-bold text-gray-900 leading-tight">
                  {step === "address" && "Delivery details"}
                  {(step === "payment" || step === "processing") && "Payment"}
                  {step === "success" && "Order confirmed"}
                </h2>
                <p className="text-[11.5px] text-gray-400 leading-tight">
                  {step === "address" && "Tell us where to deliver your order"}
                  {(step === "payment" || step === "processing") && "Almost there! Complete your payment to confirm your order."}
                  {step === "success" && "Thanks for shopping with us"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold transition-colors flex-shrink-0">✕</button>
          </div>

          <div className="px-4 sm:px-7 pt-4 sm:pt-5 pb-6 flex flex-col gap-5 flex-1">

            {step !== "success" && <StepTabs />}

            {/* Order breakdown — visible on mobile too (SummaryPanel above is desktop-only) */}
            {hasColorBreakdown && step !== "success" && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      {step === "address" ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25-3h.008v.008h-.008V4.5zM12 15h.008v.008H12V15zm3-8.25V6a3 3 0 00-6 0v.75m-3.75 0h13.5" />
                        </svg>
                      )}
                    </span>
                    <p className="text-[12.5px] font-bold text-gray-900 truncate">
                      Order Breakdown <span className="font-medium text-gray-500">({quantity} pcs total)</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBreakdownItems((v) => !v)}
                    className="flex items-center gap-1 text-[11.5px] font-semibold text-emerald-700 hover:text-emerald-800 flex-shrink-0"
                  >
                    View items
                    <svg className={`w-3.5 h-3.5 transition-transform ${showBreakdownItems ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>
                {showBreakdownItems && (
                  <div className="mt-3 pt-3 border-t border-emerald-100/80 space-y-1.5">
                    {colorBreakdownRows.map((row) => (
                      <div key={row.color} className="flex items-start justify-between gap-3 text-xs">
                        <span className="font-semibold text-gray-800 whitespace-nowrap">{row.color}</span>
                        <span className="text-gray-500 text-right">
                          {row.sizesLabel} <span className="text-gray-400">({row.qty} pcs)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 1: Address ── */}
            {step === "address" && (
              <div className="flex flex-col gap-5">
                {/* Section header */}
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[13.5px] font-bold text-gray-900 leading-tight">Shipping Information</p>
                    <p className="text-[11px] text-gray-400 leading-tight">Please enter your delivery address</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Full name *</label>
                    <div className="relative">
                      <FieldIcon path="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      <input value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })}
                        placeholder="Full name"
                        className={`w-full h-10 border rounded-xl pl-9 pr-3 text-sm outline-none focus:border-gray-700 transition-colors ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                    </div>
                    {errors.name && <p className="text-red-500 text-[11px]">{errors.name}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Whatsapp number *</label>
                    <div className="relative">
                      <FieldIcon path="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 002.25-2.25v-1.372a1.125 1.125 0 00-.852-1.09l-4.423-1.106a1.125 1.125 0 00-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97a1.125 1.125 0 00.417-1.173L6.963 3.102a1.125 1.125 0 00-1.09-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      <input value={address.phone} inputMode="numeric"
                        onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                        placeholder="10-digit number"
                        className={`w-full h-10 border rounded-xl pl-9 pr-3 text-sm outline-none focus:border-gray-700 transition-colors ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                    </div>
                    {errors.phone && <p className="text-red-500 text-[11px]">{errors.phone}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      Alternative number <span className="normal-case font-normal text-gray-400">(optional)</span>
                    </label>
                    <div className="relative">
                      <FieldIcon path="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 002.25-2.25v-1.372a1.125 1.125 0 00-.852-1.09l-4.423-1.106a1.125 1.125 0 00-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97a1.125 1.125 0 00.417-1.173L6.963 3.102a1.125 1.125 0 00-1.09-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      <input value={address.altPhone} inputMode="numeric"
                        onChange={(e) => setAddress({ ...address, altPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                        placeholder="10-digit number"
                        className={`w-full h-10 border rounded-xl pl-9 pr-3 text-sm outline-none focus:border-gray-700 transition-colors ${errors.altPhone ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                    </div>
                    {errors.altPhone && <p className="text-red-500 text-[11px]">{errors.altPhone}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      GST number <span className="normal-case font-normal text-gray-400">(optional)</span>
                    </label>
                    <div className="relative">
                      <FieldIcon path="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                      <input value={address.gstNumber}
                        onChange={(e) => setAddress({ ...address, gstNumber: e.target.value.toUpperCase().slice(0, 15) })}
                        placeholder="15-character GSTIN"
                        className={`w-full h-10 border rounded-xl pl-9 pr-3 text-sm outline-none focus:border-gray-700 transition-colors ${errors.gstNumber ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                    </div>
                    {errors.gstNumber && <p className="text-red-500 text-[11px]">{errors.gstNumber}</p>}
                  </div>
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Email <span className="normal-case font-normal text-gray-400">(invoice)</span> *</label>
                    <div className="relative">
                      <FieldIcon path="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.007 1.872l-7.5 5.006a2.25 2.25 0 01-2.486 0L3.257 8.865A2.25 2.25 0 012.25 6.993V6.75" />
                      <input type="email" value={address.email} onChange={(e) => setAddress({ ...address, email: e.target.value })}
                        placeholder="you@email.com"
                        className={`w-full h-10 border rounded-xl pl-9 pr-3 text-sm outline-none focus:border-gray-700 transition-colors ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                    </div>
                    {errors.email && <p className="text-red-500 text-[11px]">{errors.email}</p>}
                  </div>
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Address line 1 *</label>
                    <div className="relative">
                      <FieldIcon path="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      <input value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                        placeholder="House / Flat No, Building, Street"
                        className={`w-full h-10 border rounded-xl pl-9 pr-3 text-sm outline-none focus:border-gray-700 transition-colors ${errors.line1 ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                    </div>
                    {errors.line1 && <p className="text-red-500 text-[11px]">{errors.line1}</p>}
                  </div>
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Address line 2 <span className="font-normal text-gray-400">(optional)</span></label>
                    <div className="relative">
                      <FieldIcon path="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                      <input value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                        placeholder="Landmark, Area"
                        className="w-full h-10 border border-gray-200 rounded-xl pl-9 pr-3 text-sm outline-none focus:border-gray-700 transition-colors" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Pincode *</label>
                    <div className="relative">
                      <FieldIcon path="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      <input value={address.pincode} inputMode="numeric"
                        onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                        placeholder="6 digits"
                        className={`w-full h-10 border rounded-xl pl-9 pr-3 text-sm outline-none focus:border-gray-700 transition-colors ${errors.pincode ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                    </div>
                    {errors.pincode && <p className="text-red-500 text-[11px]">{errors.pincode}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">City *</label>
                    <div className="relative">
                      <FieldIcon path="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                      <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="City name"
                        className={`w-full h-10 border rounded-xl pl-9 pr-3 text-sm outline-none focus:border-gray-700 transition-colors ${errors.city ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
                    </div>
                    {errors.city && <p className="text-red-500 text-[11px]">{errors.city}</p>}
                  </div>
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">State *</label>
                    <div className="relative">
                      <FieldIcon path="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                      <select value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        className={`w-full h-10 border rounded-xl pl-9 pr-3 text-sm outline-none focus:border-gray-700 bg-white transition-colors appearance-none ${errors.state ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
                        <option value="">Select state</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <svg className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
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
                  <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-blue-700">{address.name} · {address.phone}</p>
                    <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                      {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} — {address.pincode}
                    </p>
                    {address.email && <p className="text-[11px] text-blue-500 mt-0.5">Invoice to: {address.email}</p>}
                  </div>
                  <button onClick={() => setStep("address")} className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold flex-shrink-0 hover:text-blue-800">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                    </svg>
                    Edit
                  </button>
                </div>

                {/* Payment mode: pay in full now, or Cash on Delivery */}
                <div>
                  <p className="text-[14px] font-bold text-gray-900 mb-2.5">How would you like to pay?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMode("prepaid")}
                      className={`flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${
                        paymentMode === "prepaid" ? "border-emerald-500 bg-emerald-50/60" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                        </svg>
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-gray-900">Pay Now</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">5% OFF</span>
                        </span>
                        <span className="block text-xs text-gray-500 mt-0.5">
                          Pay the full amount now — <span className="line-through text-gray-400">{formatPrice(grandTotal)}</span>{" "}
                          <span className="font-bold text-emerald-700">{formatPrice(payNowTotal)}</span>
                        </span>
                      </div>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${paymentMode === "prepaid" ? "bg-emerald-500" : "border-2 border-gray-300"}`}>
                        {paymentMode === "prepaid" && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMode("cod")}
                      className={`flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${
                        paymentMode === "cod" ? "border-emerald-500 bg-emerald-50/60" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5A.75.75 0 0122.5 9v9.75a1.5 1.5 0 01-1.5 1.5H3a1.5 1.5 0 01-1.5-1.5V9a.75.75 0 01.75-.75zm0 0V6a1.5 1.5 0 011.5-1.5h13.5A1.5 1.5 0 0118.75 6v2.25M12 13.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                        </svg>
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-gray-900">Cash on Delivery</span>
                        <span className="block text-xs text-gray-500 mt-0.5">
                          Pay {formatPrice(codAdvanceAmount)} now, {formatPrice(codDueAmount)} on delivery
                        </span>
                      </div>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${paymentMode === "cod" ? "bg-emerald-500" : "border-2 border-gray-300"}`}>
                        {paymentMode === "cod" && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </div>

                  {paymentMode === "cod" && (
                    <div className="mt-2.5 flex items-start gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2.5">
                      <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      </svg>
                      <span className="text-xs text-green-800 leading-relaxed">
                        <strong>{formatPrice(codAdvanceAmount)}</strong> is charged now as an order confirmation
                        charge (5% of your order). The remaining <strong>{formatPrice(codDueAmount)}</strong> is
                        collected in cash when your order is delivered.
                      </span>
                    </div>
                  )}
                </div>

                {paymentError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">{paymentError}</div>
                )}

                <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
                  <button onClick={() => setStep("address")}
                    className="h-12 px-5 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold text-sm rounded-2xl transition-colors flex items-center gap-1.5 whitespace-nowrap">
                    ← Back to delivery
                  </button>
                  <button onClick={handleRazorpay} disabled={step === "processing"}
                    className="flex-1 h-12 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-gray-900 font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2">
                    {step === "processing"
                      ? <><span className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />Opening Razorpay…</>
                      : paymentMode === "cod"
                        ? <>🔒 Pay {formatPrice(amountDueNow)} to Confirm Order →</>
                        : <>🔒 Pay {formatPrice(amountDueNow)} via Razorpay →</>
                    }
                  </button>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { title: "Secured by Razorpay", sub: "PCI DSS compliant", path: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" },
                    { title: "100% Secure Payments", sub: "Your data is protected", path: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" },
                    { title: "Fast & Reliable", sub: "Trusted by 1M+ customers", path: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" },
                  ].map((b) => (
                    <div key={b.title} className="flex flex-col items-center text-center gap-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={b.path} />
                      </svg>
                      <span className="text-[10.5px] font-semibold text-gray-600 leading-tight">{b.title}</span>
                      <span className="text-[10px] text-gray-400 leading-tight">{b.sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 3: Success ── */}
            {step === "success" && (
              <div className="flex flex-col items-center text-center gap-5 py-4">
                {deliveryType === "sameday" && (
                  <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-xl p-3.5 flex items-start gap-2.5 text-left">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-blue-900">Our team will call you shortly</p>
                      <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                        Same-day delivery charges and the pickup time slot will be confirmed on a call from our executive.
                      </p>
                    </div>
                  </div>
                )}
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {confirmedPaymentMode === "cod" ? "Order confirmed!" : "Payment successful!"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed max-w-xs">
                    {confirmedPaymentMode === "cod" ? (
                      <>Your order for <strong>{quantity} × {product.name}</strong> is confirmed. Pay {formatPrice(confirmedCodDueAmount)} in cash when it's delivered.</>
                    ) : deliveryType === "pickup" ? (
                      <>Your order for <strong>{quantity} × {product.name}</strong> is confirmed. We'll message you once it's ready for pickup.</>
                    ) : (
                      <>Your order for <strong>{quantity} × {product.name}</strong> is confirmed and will be dispatched shortly.</>
                    )}
                  </p>
                </div>
                {confirmedOrderRef && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                    <p className="text-[11px] text-gray-400 mb-0.5">Order reference</p>
                    <p className="font-mono font-semibold text-sm text-gray-800">{confirmedOrderRef}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-4 w-full text-left space-y-2.5 text-sm">
                  {hasColorBreakdown && (
                    <div className="pb-2.5 border-b border-dashed border-gray-200 space-y-1">
                      {colorBreakdownRows.map((row) => (
                        <div key={row.color} className="flex items-start justify-between gap-3 text-xs">
                          <span className="font-semibold text-gray-700 whitespace-nowrap">{row.color}</span>
                          <span className="text-gray-500 text-right">
                            {row.sizesLabel} <span className="text-gray-400">({row.qty} pcs)</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {confirmedPaymentMode === "cod" ? (
                    <>
                      <div className="flex justify-between text-gray-600"><span>Order total</span><span className="font-bold text-gray-900">{formatPrice(grandTotal)}</span></div>
                      <div className="flex justify-between text-green-700"><span>Paid now (confirmation)</span><span className="font-bold">{formatPrice(grandTotal - confirmedCodDueAmount)}</span></div>
                      <div className="flex justify-between text-orange-600"><span>Due on delivery (cash)</span><span className="font-bold">{formatPrice(confirmedCodDueAmount)}</span></div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-gray-600"><span>Amount paid</span><span className="font-bold text-gray-900">{formatPrice(payNowTotal)}</span></div>
                      <div className="flex justify-between text-emerald-700"><span>Instant discount (5%)</span><span className="font-bold">−{formatPrice(prepaidDiscountAmount)}</span></div>
                    </>
                  )}
                  {printType === "embroidery" && embroideryCharge > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>
                        Embroidery ({numEmbroideryPositions} position{numEmbroideryPositions !== 1 ? "s" : ""}
                        {quantity < EMBROIDERY_DESIGN_CHARGE_FREE_MIN_QTY ? " + design charge" : ""})
                      </span>
                      <span className="font-medium">+{formatPrice(embroideryCharge)}</span>
                    </div>
                  )}
                  {printType === "dtf" && dtfCharge > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>
                        DTF ({numEmbroideryPositions} position{numEmbroideryPositions !== 1 ? "s" : ""})
                      </span>
                      <span className="font-medium">+{formatPrice(dtfCharge)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="font-medium">
                      {deliveryType === "sameday" ? "Same-day (confirmed on call)" : deliveryType === "pickup" ? "Self Pick Up" : "Standard (5–7 days)"}
                    </span>
                  </div>
                  {deliveryType === "pickup" ? (
                    <div className="flex justify-between gap-4 text-gray-600">
                      <span className="flex-shrink-0">Pickup from</span>
                      <span className="font-medium text-right">{PICKUP_ADDRESS}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-gray-600"><span>Shipping to</span><span className="font-medium">{address.city}, {address.state}</span></div>
                  )}
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
    description: "Directly stitched embroidery. Follow our tips for best results. or ",
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
      { label: "Team Octopus", beforeSrc: "/dtf-printing/octopus-before.webp", afterSrc: "/dtf-printing/octopus-after.webp" },
      { label: "Lion", beforeSrc: "/dtf-printing/dog-before.webp", afterSrc: "/dtf-printing/dog-after.webp" },
      { label: "Eagle", beforeSrc: "/dtf-printing/gradient-before.webp", afterSrc: "/dtf-printing/gradient-after.webp" },
      { label: "Colorado", beforeSrc: "/dtf-printing/tiger-before.webp", afterSrc: "/dtf-printing/tiger-after.webp" },
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

        <div className="flex items-start gap-3 pr-10">
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </span>
          <div>
            <h5 className="text-xl font-bold text-gray-900">
              {printType === "dtf" ? "Design Tips for Image Enhancement" : info.title}
            </h5>
            <span className="block text-[14px] text-gray-500 mt-1 max-w-lg leading-relaxed">
              {printType === "dtf" ? (
                ""
              ) : (
                <>
                  {info.description}
                  <span className="text-blue-600 text-[14px] font-medium cursor-pointer hover:underline">{info.linkText}</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-6 mt-6">
          {/* Tips list */}
          <div className="flex flex-col gap-4">
            {printType === "dtf" && (
              <>
                {/* Card 1 — Enhanced Image */}
                <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                      <span className="text-[14px] font-bold text-gray-900">Enhanced Image</span>
                    </div>
                    <span className="flex-shrink-0 text-[11px] font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full whitespace-nowrap">Better Print Quality</span>
                  </div>
                  
                  <ul className="space-y-2">
                    {[
                      { title: "Sharper details", desc: "Facial features and fur texture are clearer." },
                      { title: "Natural & vibrant colors", desc: "Colors look brighter and more realistic." },
                      { title: "Background removed/cleaned", desc: "Unwanted background is removed for clean printing." },
                     
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </span>
                        <div className="min-w-0">
                          <span className="block text-[13px] font-bold text-gray-900 leading-snug">{item.title}</span>
                          <span className="block text-[12px] text-gray-500 leading-snug">{item.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card 2 — Original Image */}
                <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      <span className="text-[14px] font-bold text-gray-900">Original Image</span>
                    </div>
                    <span className="flex-shrink-0 text-[11px] font-semibold text-red-600 bg-red-100 px-2.5 py-1 rounded-full whitespace-nowrap">Needs Enhancement</span>
                  </div>
                  
                  <ul className="space-y-2">
                    {[
                      { title: "Low resolution", desc: "Image may look blurry or soft." },
                      { title: "Dull colors", desc: "Colors may appear faded or washed out." },
                    
                      { title: "Background included", desc: "Unwanted background can affect the final print." },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                        <div className="min-w-0">
                          <span className="block text-[13px] font-bold text-gray-900 leading-snug">{item.title}</span>
                          <span className="block text-[12px] text-gray-500 leading-snug">{item.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Embroidery pricing cards */}
            {printType === "embroidery" && (
              <>
                {/* Card 1 — Bulk order, no design charges */}
                <div className="rounded-xl bg-green-50 border border-green-100 p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                      <span className="text-[13px] font-bold text-gray-900">10 or More T-Shirts (Bulk Order)</span>
                    </div>
                    <span className="flex-shrink-0 text-[11px] font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full whitespace-nowrap">No Design Charges</span>
                  </div>
                  <ul className="space-y-1">
                    {[
                      <>Embroidery cost: <strong>₹55</strong> per position</>,
                      <>No separate design charges</>,
                      <>Same price for all positions (Front, Back, Left Sleeve, Right Sleeve)</>,
                      <>Example: 2 positions = <strong>₹110</strong> per T-shirt</>,
                    ].map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600 leading-snug">
                        <span className="w-3.5 h-3.5 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-2 h-2" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card 2 — Small order, design charges apply */}
                <div className="rounded-xl bg-red-50 border border-red-100 p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      <span className="text-[13px] font-bold text-gray-900">Less Than 10 T-Shirts</span>
                    </div>
                    <span className="flex-shrink-0 text-[11px] font-semibold text-red-600 bg-red-100 px-2.5 py-1 rounded-full whitespace-nowrap">Design Charges Apply</span>
                  </div>
                  <ul className="space-y-1">
                    {[
                      <>Embroidery cost: <strong>₹55</strong> per position</>,
                      <>One-time design charges: <strong className="text-red-600">₹700</strong> per design</>,
                      <>Design charges apply even if multiple positions</>,
                      <>Example: 1 position (5 pcs) = (₹55 × 5) + ₹700 design = <strong>₹975</strong></>,
                    ].map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600 leading-snug">
                        <span className="w-3.5 h-3.5 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-2 h-2" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
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
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
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
}) {
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
        className="relative w-full flex-1 min-h-[300px] rounded-xl border-2 border-dashed border-gray-300 bg-white overflow-hidden touch-pan-y mx-auto"
        style={{ aspectRatio: "4 / 5" }}
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
          {(["front", "back", "right", "left"] as Side[]).map((s) => (
            <button key={s} type="button" onClick={() => onSideChange(s)}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold capitalize transition-colors ${side === s ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"}`}>
              {s}
            </button>
          ))}
        </div>

        <div
          className="absolute top-[65%] right-2.5 z-20 bg-white text-[#a3a8bc] text-[9px] sm:text-[12px] tracking-[0.15em] px-2.5 py-1 rounded-full whitespace-nowrap pointer-events-none text-left"
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
            <div className="flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-gray-200 rounded-xl">
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
     className={`relative flex-1 rounded-2xl border-2 px-3 py-3 sm:px-4 sm:py-2.5 text-center sm:text-left transition-all bg-white cursor-pointer ${
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
        src="/polo-icons/polo-neck-icon-1.webp"
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
        src="/polo-icons/polo-neck-icon-2.webp"
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
        src="/polo-icons/polo-neck-icon-3.webp"
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
        src="/polo-icons/polo-neck-icon-4.webp"
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
}) {
  const handleCardClick = () => {
    if (preview) return; // when a preview exists, clicking the image itself handles side-switch (below)
    if (side) onActiveSideChange(side);
    inputRef.current?.click();
  };

  return (
  <div
    className="border-1 w-full border-gray-100 rounded-xl overflow-hidden bg-white flex flex-col h-[210px] cursor-pointer"
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
        <span className="text-[7px] sm:text-[8px] text-gray-500 block mt-1">PNG, JPG up to 5MB</span>
      </div>

      {/* Upload Section */}
      {/* Upload Section */}
      <div className="w-full p-3 mt-1 flex-1 flex flex-col items-center justify-start">
        {!preview ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (side) onActiveSideChange(side);
              inputRef.current?.click();
            }}
            disabled={uploading}
            className="w-full h-16 border-1 lg:-mt-[5px] border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center gap-1 text-blue-500 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-60 disabled:cursor-wait"
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
          <div className="relative w-full h-16 rounded-lg overflow-hidden border-2 border-gray-300 bg-white cursor-pointer hover:border-gray-400 transition-colors"
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
  quantity,
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
  quantity: number;
}) {
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
          className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 sm:gap-1.5 text-gray-500 hover:border-blue-500 hover:bg-gray-50 transition-colors px-1 disabled:opacity-60 disabled:cursor-wait"
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
          className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 bg-white cursor-pointer ${side && activeSide === side ? "border-blue-500" : "border-gray-800"}`}
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
    <div className="border-2 border-gray-200 rounded-xl p-4">
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
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 bg-white transition-all ${
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
            <span className="text-[12px] font-semibold text-gray-700 mb-4 block pb-0">Add your logo and customize your product</span>
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
          />
        </div>

        {/*
          On mobile the note box just needs a comfortable fixed height (set via
          textCardHeight). On lg+ it grows with lg:flex-1 so its bottom edge lines
          up with the bottom of the live-preview canvas next to it.
        */}
        <div
          style={{ gridArea: "textarea", minHeight: textCardHeight }}
          className="w-full flex flex-col border-2  border-dashed border-gray-300 rounded-xl p-2.5 min-w-0"
        >
            <label className="text-[10px] font-semibold text-gray-600 mb-1.5 leading-tight">
              Any Text or Customization <span className="font-normal text-gray-400">(Optional)</span>
            </label>

            {(() => {
              const activeSides = (Object.keys(logoFiles) as Side[]).filter((side) => logoFiles[side]);
              const autoNote =
                printType === "embroidery"
                  ? getEmbroideryAutoNote(quantity, activeSides)
                  : printType === "dtf"
                    ? getDtfAutoNote(quantity, activeSides)
                    : null;
              if (!autoNote) return null;
              return (
                <div className="flex items-start gap-1.5 mb-1.5 px-2 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                  <svg className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <span className="text-[11px] font-medium text-blue-700 leading-snug">{autoNote}</span>
                </div>
              );
            })()}

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


// ── Order Type + Colour Section ─────────────────────────────────────────────────

const COLOUR_PREVIEW_COUNT = 5;

function OrderTypeColourSection({
  colors,
  orderType,
  onSelectOrderType,
  selectedColor,
  onSelectColor,
  onShowMoreColors,
}: {
  colors: NonNullable<Product["colors"]>;
  orderType: "single" | "bulk";
  onSelectOrderType: (type: "single" | "bulk") => void;
  selectedColor: string | null;
  onSelectColor: (label: string) => void;
  onShowMoreColors: () => void;
}) {
  const visibleColors = colors.slice(0, COLOUR_PREVIEW_COUNT);
  const remaining = colors.length - COLOUR_PREVIEW_COUNT;

  return (
    <div className="space-y-5">
      {/* Choose Order Type */}
      <div>
        <span className="text-[16px] font-bold text-gray-900 mb-2.5 block">Choose Order Type</span>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => onSelectOrderType("single")}
            className={`relative flex flex-col items-center text-center rounded-xl border p-3 transition-all ${
              orderType === "single" ? "border-blue-400 bg-blue-50/40 ring-1 ring-blue-400" : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <span
              className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                orderType === "single" ? "border-blue-600" : "border-gray-300"
              }`}
            >
              {orderType === "single" && <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
            </span>
            <span className="relative flex-shrink-0 w-14 h-14 mb-2">
              <Image src="/polo-icons/polo-neck-single-icon.webp" alt="Single Piece" fill className="object-contain" />
            </span>
            <span className="block text-[14px] font-bold text-gray-900 leading-tight">Single Piece</span>
            <span className="block text-[11.5px] text-gray-500 leading-snug mt-1">Order a single T-Shirt</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectOrderType("bulk")}
            className={`relative flex flex-col items-center text-center rounded-xl border p-3 transition-all ${
              orderType === "bulk" ? "border-blue-400 bg-blue-50/40 ring-1 ring-blue-400" : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <span
              className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                orderType === "bulk" ? "border-blue-600" : "border-gray-300"
              }`}
            >
              {orderType === "bulk" && <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
            </span>
            <span className="relative flex-shrink-0 w-14 h-14 mb-2">
              <Image src="/polo-icons/polo-neck-bulk-icon.webp" alt="Bulk / Multiple Colours" fill className="object-contain" />
            </span>
            <span className="block text-[14px] font-bold text-gray-900 leading-tight">Bulk / Multiple Colours</span>
            <span className="block text-[11.5px] text-gray-500 leading-snug mt-1">Order in different colours &amp; sizes</span>
          </button>
        </div>
      </div>

      {/* Select Colour */}
      {colors.length > 0 && (() => {
        const renderColorCard = (c: NonNullable<Product["colors"]>[number]) => {
          const previewImage = c.media?.find((m) => m.type === "image")?.src;
          const isSelected = selectedColor === c.label;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => onSelectColor(c.label)}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={`relative overflow-hidden w-full aspect-[3/4] rounded-xl border bg-white transition-all duration-200 ${
                  isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {previewImage && (
                  <Image src={previewImage} alt={c.label} fill className="object-contain" />
                )}
                {isSelected && (
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <span className={`text-[11px] font-medium text-center leading-tight truncate w-full ${isSelected ? "text-gray-900" : "text-gray-500"}`}>
                {c.label}
              </span>
            </button>
          );
        };

        const renderMoreColorsCard = (count: number) => (
          <button
            key="more"
            type="button"
            onClick={onShowMoreColors}
            className="flex flex-col items-center justify-center gap-1 w-full aspect-[3/4] rounded-xl border border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            <span className="text-base font-bold text-gray-900">+{count}</span>
            <span className="text-[10px] font-medium text-center leading-tight">
              More<br />Colours
            </span>
          </button>
        );

        // Mobile: exactly 4 colours + the "More Colours" card, all in one
        // row (5 columns). Desktop keeps its own count/columns below,
        // since it has room to show more per row.
        const MOBILE_COLOUR_PREVIEW_COUNT = 4;
        const mobileVisibleColors = colors.slice(0, MOBILE_COLOUR_PREVIEW_COUNT);
        const mobileRemaining = colors.length - MOBILE_COLOUR_PREVIEW_COUNT;

        return (
          <div>
            <span className="text-[16px] font-bold text-gray-900 mb-2.5 block">Select Colour</span>

            {/* Mobile: 4 colours + more card, single row */}
            <div className="grid grid-cols-5 sm:hidden gap-1.5">
              {mobileVisibleColors.map(renderColorCard)}
              {mobileRemaining > 0 && renderMoreColorsCard(mobileRemaining)}
            </div>

            {/* Desktop / tablet: unchanged */}
            <div className="hidden sm:grid sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
              {visibleColors.map(renderColorCard)}
              {remaining > 0 && renderMoreColorsCard(remaining)}
            </div>
          </div>
        );
      })()}
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
  const [orderType,      setOrderType]      = useState<"single" | "bulk">("single");
  const [bulkRows,       setBulkRows]       = useState<BulkRow[]>(() =>
    product.colors?.[0]
      ? [{ id: `${product.colors[0].label}-init`, colorLabel: product.colors[0].label, sizeQty: {} }]
      : []
  );
  const [selectedColor,  setSelectedColor]  = useState<string | null>(product.colors?.[0]?.label ?? null);
  const selectedColorObj = product.colors?.find((c) => c.label === selectedColor) ?? null;
  const colorSameDayAvailable = selectedColorObj?.sameDayAvailable ?? product.sameDayAvailable ?? false;

  // Keep the bulk colour+size table's first row following whichever colour
  // is currently active on the page (the big image/thumbnail selection),
  // instead of always starting from product.colors[0] regardless of what
  // the shopper actually has selected. Only auto-follows while that row
  // still matches the PREVIOUS page colour and hasn't been re-added or
  // deliberately changed via "Change colour" inside the table — so it
  // never overwrites work the shopper has already started.
  const prevSelectedColorRef = useRef(selectedColor);
  useEffect(() => {
    const prev = prevSelectedColorRef.current;
    prevSelectedColorRef.current = selectedColor;
    if (!selectedColor || selectedColor === prev) return;
    setBulkRows((rows) => {
      if (rows.length === 1 && rows[0].colorLabel === prev) {
        return [{ ...rows[0], colorLabel: selectedColor }];
      }
      return rows;
    });
  }, [selectedColor]);
  const [selectedSize,   setSelectedSize]   = useState<string | null>(null);
  const [quantity,       setQuantity]       = useState<number | "">(product.quantityReq || 1);
  const [quantityInput,  setQuantityInput]  = useState(String(product.quantityReq || 1));
  const [wishlist,       setWishlist]       = useState(false);
  const [sizeError,      setSizeError]      = useState(false);
  const [activeTab,      setActiveTab]      = useState<"details" | "shipping" | "returns" | "none">("none");
  const [showSizeGuide,  setShowSizeGuide]  = useState(false);
  const [deliveryType,   setDeliveryType]   = useState<DeliveryType>("standard");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showAuthModal,  setShowAuthModal]  = useState(false);
  const [isLoggedIn,     setIsLoggedIn]     = useState(false);
  const [loggedInUser,   setLoggedInUser]   = useState<{ name: string; email?: string; phone?: string } | null>(null);
  const [toast,          setToast]          = useState<string | null>(null);
const [reviewSummary, setReviewSummary] = useState<{ average: number; total: number }>({ average: 0, total: 0 });
const [showColorModal, setShowColorModal] = useState(false);
const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});

// const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});
const [printType, setPrintType] = useState<"dtf" | "embroidery">("dtf");
const [pendingPrintType, setPendingPrintType] = useState<"dtf" | "embroidery" | null>(null);
const [previousPrintType, setPreviousPrintType] = useState<"dtf" | "embroidery">("dtf");
const [fabricType, setFabricType] = useState<FabricType>("premium-pique");
const [logoFiles, setLogoFiles] = useState<Record<Side, File | null>>({ front: null, back: null, right: null, left: null });
const [logoPreviews, setLogoPreviews] = useState<Record<Side, string | null>>({ front: null, back: null, right: null, left: null });
const [logoUploading, setLogoUploading] = useState<Record<Side, boolean>>({ front: false, back: false, right: false, left: false });
const [activeSide, setActiveSide] = useState<Side>("front");
const [logoLayers, setLogoLayers] = useState<Record<Side, PreviewLayer[]>>({ front: [], back: [], right: [], left: [] });
// Real, server-hosted URLs for each side's logo — distinct from
// `logoPreviews`, which only ever holds local blob: URLs for instant
// display. The order-creation API rejects blob: URLs outright (they're
// meaningless outside this browser tab), so THIS is what actually gets
// sent when the design PDF needs to be generated after payment.
const [logoUploadedUrls, setLogoUploadedUrls] = useState<Record<Side, string | null>>({ front: null, back: null, right: null, left: null });
const [referenceImage, setReferenceImage] = useState<File | null>(null);
const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
const [customizationNote, setCustomizationNote] = useState("");
// Holds the file waiting on a yes/no answer to "remove the background?"
// before it gets processed or just kept as-is.
const [pendingBgConfirm, setPendingBgConfirm] = useState<{ file: File; side: Side } | null>(null);

  const media = resolveMedia(product, selectedColor);
  const blankMedia = resolveBlankMedia(product, selectedColor);

  useEffect(() => { setActiveImg(0); }, [selectedColor]);

  // Keep the browser tab title in sync with the selected colour's own
  // title (e.g. "Green Solid Polo T-Shirt"), falling back to the generic
  // product name when no colour-specific label is available.
  useEffect(() => {
    const title = selectedColorObj?.title ?? product.name;
    document.title = `${title} | CluesStyle`;
  }, [selectedColorObj, product.name]);

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
      setLogoUploadedUrls((prev) => ({ ...prev, [side]: null }));
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
    // The previous real upload (if any) no longer matches what's on screen —
    // clear it until the new file finishes uploading below.
    setLogoUploadedUrls((prev) => ({ ...prev, [side]: null }));
    setPendingBgConfirm({ file, side });
  };

  // Uploads the FINAL logo file (after the background-removal choice is
  // resolved, either way) to /api/upload-logo and stores the real,
  // server-hosted URL this returns. This is what actually gets sent when
  // placing an order — logoPreviews' blob: URLs never leave the browser.
  const uploadLogoToServer = async (file: File, side: Side) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("side", side);
      const res = await fetch("/api/upload-logo", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Logo upload failed");
      const { url } = (await res.json()) as { url: string };
      setLogoUploadedUrls((prev) => ({ ...prev, [side]: url }));
    } catch {
      setLogoUploadedUrls((prev) => ({ ...prev, [side]: null }));
      setToast("Couldn't save your logo — please re-upload it before placing your order.");
    }
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
      await uploadLogoToServer(cleanedFile, side);
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
      setLogoUploadedUrls({ front: null, back: null, right: null, left: null });
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

// Quantities at or above the first bulk tier's minimum imply a bulk order —
// flip the order type toggle automatically so it stays in sync with the
// chosen quantity. This reads the threshold from the product's own
// TSHIRT_QTY_TIERS (product.qtyTiers) instead of a hardcoded number, so
// changing where bulk pricing starts in t-shirts.ts doesn't need a matching
// change here too — e.g. if the first tier is edited to start at 4 instead
// of 2, single-piece mode correctly covers quantities 1-3.
const bulkThreshold = (product.qtyTiers ?? TSHIRT_QTY_TIERS)[0]?.minQty ?? 2;

useEffect(() => {
  if (numQty >= bulkThreshold && orderType === "single") {
    setOrderType("bulk");
  }
}, [numQty, orderType, bulkThreshold]);

// When a product has BOTH colors and sizes, quantity is filled in through
// `bulkRows` (BulkColourSizeTable) instead of the single-color
// `sizeQuantities` state used by SizeQuantityBreakdown. Checking only
// `sizeQuantities` here left it permanently empty for that flow, so
// checkout/add-to-cart stayed blocked even once the bulk table was fully
// filled in — this checks whichever state is actually driving the UI.
const isBulkColourSizeFlow = !!(product.colors && product.sizes);

const bulkRowsTotalQty = bulkRows.reduce(
  (sum, row) => sum + Object.values(row.sizeQty).reduce((a, b) => a + b, 0),
  0
);
const bulkRowsAllComplete =
  bulkRows.length > 0 &&
  bulkRows.every((row) => Object.values(row.sizeQty).reduce((a, b) => a + b, 0) > 0);

const totalAllocated = Object.values(sizeQuantities).reduce((a, b) => a + b, 0);

const sizeAllocationComplete = !product.sizes
  ? true
  : isBulkColourSizeFlow
    ? bulkRowsTotalQty === numQty && bulkRowsAllComplete
    : totalAllocated === numQty;

// How many of the bulk colour rows actually have any pieces allocated —
// used to build the multi-colour checkout payload below. Every filled row
// is sent through; the server now supports one or several colours in a
// single order/payment (see /api/create-razorpay-order's colorBreakdown).
const filledBulkRows = bulkRows.filter(
  (row) => Object.values(row.sizeQty).reduce((a, b) => a + b, 0) > 0
);

// What actually gets sent to Razorpay for colour + size, in the "bulk
// colour + size" flow:
//   - `checkoutColorBreakdown` carries EVERY filled-in colour with its own
//     size split, and is what the OrderModal sends as
//     customization.colorBreakdown (supports 1 or many colours).
//   - `effectiveSelectedColor` / `effectiveSizeBreakdown` stay as a
//     single-colour fallback for display purposes (e.g. the "Add to Cart"
//     flow below, which only carries one colour+size per cart line today)
//     and default to the first filled colour.
const checkoutColorBreakdown = isBulkColourSizeFlow
  ? filledBulkRows.map((row) => ({ color: row.colorLabel, sizeQty: row.sizeQty }))
  : undefined;
const effectiveSelectedColor = isBulkColourSizeFlow
  ? filledBulkRows[0]?.colorLabel ?? selectedColor
  : selectedColor;
const effectiveSizeBreakdown = isBulkColourSizeFlow
  ? filledBulkRows[0]?.sizeQty ?? {}
  : sizeQuantities;
// Add to Cart still only supports one colour+size per cart line — this
// flags a genuinely multi-colour selection so handleAddToCart can point
// the shopper at "Checkout Now" instead, which does support it.
const isMultiColourBulkOrder = isBulkColourSizeFlow && filledBulkRows.length > 1;

  const activeQtyTiers = product.qtyTiers ?? TSHIRT_QTY_TIERS;

  const { pricePerUnit, sameDayCharge: staticSameDayCharge } = computeOrderTotal({
    displayPrice: product.displayPrice,
    quantity: numQty,
    deliveryType,
    tiers: activeQtyTiers,
  });

  // Same-day delivery no longer charges anything at checkout — the charge
  // is negotiated separately by phone (an executive calls after payment),
  // so this is forced to 0 regardless of what computeOrderTotal's generic
  // same-day surcharge formula would otherwise compute. Standard and
  // self-pickup are unaffected — computeOrderTotal already gives 0 for both.
  const effectiveSameDayCharge = deliveryType === "sameday" ? 0 : staticSameDayCharge;

  const activeLogoSides: Side[] = (Object.keys(logoFiles) as Side[]).filter((side) => logoFiles[side]);
  const numEmbroideryPositions = activeLogoSides.length;
  const embroideryCharge = printType === "embroidery" ? computeEmbroideryCharge(numQty, activeLogoSides) : 0;
  const dtfCharge = printType === "dtf" ? computeDtfCharge(numQty, activeLogoSides) : 0;
  const totalPrice = pricePerUnit * numQty + effectiveSameDayCharge + embroideryCharge + dtfCharge;
  const discountPct = getDiscountForQty(numQty, activeQtyTiers);
  const activeOffer = product.offer ?? DEFAULT_OFFER;

const handleAddToCart = () => {
    if (product.sizes && !sizeAllocationComplete) { setSizeError(true); return; }
    if (isMultiColourBulkOrder) {
      setToast("Adding multiple colours to the cart isn't supported yet — use \"Checkout Now\" to pay for all colours in one go.");
      return;
    }
    setSizeError(false);
    const printAutoNote =
      printType === "embroidery"
        ? getEmbroideryAutoNote(numQty, activeLogoSides)
        : printType === "dtf"
          ? getDtfAutoNote(numQty, activeLogoSides)
          : null;
    const combinedNote = [printAutoNote, customizationNote?.trim() || null].filter(Boolean).join("\n");
    addToCart({
      productId: product.id, productSlug: product.slug, productName: product.name,
      productImage: media[activeImg]?.src || media[0]?.src || product.images[0],
      quantity: numQty, size: selectedSize, sizeBreakdown: product.sizes ? effectiveSizeBreakdown : undefined,
      color: effectiveSelectedColor, deliveryType,
      pricePerUnit, sameDayCharge: effectiveSameDayCharge, lineTotal: totalPrice, addedAt: Date.now(),
      customizationNote: combinedNote || undefined,
    });
    setToast("Added to cart!");
  };

 const handleCheckoutNow = () => {
  if (product.sizes && !sizeAllocationComplete) { setSizeError(true); return; }
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
              <ThumbnailStrip media={media} activeImg={activeImg} setActiveImg={setActiveImg} />
              <MainViewer
                media={media} activeImg={activeImg} setActiveImg={setActiveImg}
                badge={product.badge} wishlist={wishlist} setWishlist={setWishlist}
                rating={reviewSummary.total > 0 ? Number(reviewSummary.average.toFixed(1)) : undefined}
                reviewCount={reviewSummary.total > 0 ? reviewSummary.total : undefined}
                onRatingClick={scrollToReviews}
                sameDayAvailable={colorSameDayAvailable}
              />
            </div>
            {/* Mobile: just the viewer (thumbnails are inside it) */}
            <div className="md:hidden">
              <MainViewer
                media={media} activeImg={activeImg} setActiveImg={setActiveImg}
                badge={product.badge} wishlist={wishlist} setWishlist={setWishlist}
                rating={reviewSummary.total > 0 ? Number(reviewSummary.average.toFixed(1)) : undefined}
                reviewCount={reviewSummary.total > 0 ? reviewSummary.total : undefined}
                onRatingClick={scrollToReviews}
                sameDayAvailable={colorSameDayAvailable}
              />
            </div>
          </div>

          {/* ── Details panel ── */}
          <div className="flex flex-col gap-5 min-w-0">
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
                {selectedColorObj?.title ?? product.name}
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

              <div className="flex flex-wrap gap-1.5">
                {product.material?.split(",").map((item, index) => (
                  <span key={index} className="px-2 py-0.5 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded">
                    {item.trim()}
                  </span>
                ))}
              </div>
            </div>

            {product.colors && (
              <OrderTypeColourSection
                colors={product.colors}
                orderType={orderType}
                onSelectOrderType={setOrderType}
                selectedColor={selectedColor}
                onSelectColor={setSelectedColor}
                onShowMoreColors={() => setShowColorModal(true)}
              />
            )}

            {numQty >= 25 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800 flex items-start gap-2">
                <svg className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Bulk deal active! <strong>{discountPct}% off</strong> at {numQty} pcs → {formatPrice(pricePerUnit)}/pc</span>
              </div>
            )}

            {product.logoUploadEnabled && (
              <LogoUploadSection
                printType={printType}
                onPrintTypeChange={(v) => {
                  setPreviousPrintType(printType);
                  setPrintType(v);        // optimistic: highlight switches immediately
                  setPendingPrintType(v); // open the tips modal for that type
                }}
                fabricType={fabricType}
                onFabricTypeChange={setFabricType}
                activeSide={activeSide}
                onActiveSideChange={setActiveSide}
                logoFiles={logoFiles}
                logoPreviews={logoPreviews}
                logoUploading={logoUploading}
                onLogoChange={handleLogoChange}
                referenceImage={referenceImage}
                referenceImagePreview={referenceImagePreview}
                onReferenceChange={(f) => handleLogoChange(f, "reference")}
                customizationNote={customizationNote}
                onNoteChange={setCustomizationNote}
                previewImageFront={blankMedia[0]?.src || media[activeImg]?.src || media[0]?.src || product.images[0]}
                previewImageBack={blankMedia[1]?.src || media[1]?.src || media[0]?.src || product.images[0]}
                previewImageRight={blankMedia[2]?.src || media[2]?.src || media[0]?.src || product.images[0]}
                previewImageLeft={blankMedia[3]?.src || blankMedia[2]?.src || media[2]?.src || media[0]?.src || product.images[0]}
                logoLayers={logoLayers}
                setLogoLayers={setLogoLayers}
                textCardHeight={130}
                quantity={numQty}
              />
            )}

            {pendingBgConfirm && (
              <RemoveBgConfirmModal
                onKeepOriginal={() => {
                  const { file, side } = pendingBgConfirm;
                  setPendingBgConfirm(null);
                  setLogoUploading((prev) => ({ ...prev, [side]: true }));
                  uploadLogoToServer(file, side).finally(() =>
                    setLogoUploading((prev) => ({ ...prev, [side]: false }))
                  );
                }}
                onRemoveBg={() => {
                  const { file, side } = pendingBgConfirm;
                  setPendingBgConfirm(null);
                  runBackgroundRemoval(file, side);
                }}
              />
            )}

            <QuantityTierSelector displayPrice={product.displayPrice} quantity={numQty} setQuantity={setQuantity} orderType={orderType} tiers={product.qtyTiers ?? TSHIRT_QTY_TIERS} />
            {product.colors && product.sizes ? (
              <BulkColourSizeTable
                colors={product.colors}
                sizes={product.sizes}
                displayPrice={product.displayPrice}
                rows={bulkRows}
                setRows={setBulkRows}
                maxQty={numQty}
                tiers={activeQtyTiers}
                onOpenSizeGuide={() => setShowSizeGuide(true)}
              />
            ) : (
              product.sizes && (
                <SizeQuantityBreakdown
                  sizes={product.sizes}
                  totalQty={numQty}
                  sizeQuantities={sizeQuantities}
                  setSizeQuantities={setSizeQuantities}
                  setShowSizeGuide={setShowSizeGuide}
                />
              )
            )}

            <DeliverySelector
              selected={deliveryType}
              onSelect={setDeliveryType}
              sameDayTurnaround={product.sameDayTurnaround}
              sameDayAvailable={colorSameDayAvailable}
              pickupAddress={PICKUP_ADDRESS}
            />
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
                      <ul className="space-y-1">
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
                      <span className="text-[14px] sm:text-[13px] font-bold text-gray-900 leading-tight block">{title}</span>
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
      <section className="py-2 sm:py-3 bg-white">
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
                    <span className="text-[14px] text-gray-600 leading-relaxed">{faq.a}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* <RecentlyViewed /> */}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowSizeGuide(false)}>
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowSizeGuide(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-gray-100 shadow flex items-center justify-center">✕</button>
            <img
              src="/size-charts/cluesstyle-polo-neck-tshirt-size-chart.webp"
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
      {showColorModal && product.colors && (
        <ColorVariantModal
          colors={product.colors}
          selectedColor={selectedColor}
          onSelect={setSelectedColor}
          onClose={() => setShowColorModal(false)}
        />
      )}

      {showOrderModal && (
  <OrderModal
    product={product}
    productImage={media[activeImg]?.src || media[0]?.src || product.images[0]}
    quantity={numQty}
    pricePerUnit={pricePerUnit}
    sameDayCharge={effectiveSameDayCharge}
    deliveryType={deliveryType}
    selectedSize={selectedSize}
    selectedColor={effectiveSelectedColor}
    loggedInUser={loggedInUser}
    sizeBreakdown={product.sizes ? effectiveSizeBreakdown : undefined}
    colorBreakdown={checkoutColorBreakdown}
    customizationNote={product.logoUploadEnabled ? customizationNote : undefined}
    printType={product.logoUploadEnabled ? printType : undefined}
    fabricType={product.logoUploadEnabled ? fabricType : undefined}
    logoLayers={product.logoUploadEnabled ? logoLayers : undefined}
    logoUploadedUrls={product.logoUploadEnabled ? logoUploadedUrls : undefined}
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