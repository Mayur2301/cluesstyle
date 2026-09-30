"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CareInstructions from "@/app/components/warrenty";

import RecentlyViewed from "@/app/components/RecentlyViewed";
import ProductReviews from "@/app/components/ProductReviews";
import { productsData, DEFAULT_OFFER, type Product, type MediaItem, type Offer, type FabricSubCategoryMap, type GsmOption } from "@/app/lib/badge-collection";
import {
  COST_PER_UNIT,
  SAME_DAY_SURCHARGE,
  QTY_TIERS,
  getDiscountForQty,
  getPricePerUnit,
  computeOrderTotal,
  // Only referenced by OrderModal's printType/fabricType branches, which
  // badges never actually trigger (no printType is ever passed in from
  // this page) — imported anyway so OrderModal can stay byte-identical to
  // polo/round-neck/hoodies/oversized/full-sleeves's shared shape.
  computeEmbroideryCharge,
  computeDtfCharge,
  getEmbroideryAutoNote,
  getDtfAutoNote,
  type DeliveryType,
} from "@/app/lib/pricing";
import { addToCart } from "@/app/lib/cart";
import PopularSearches from "@/app/components/PopularSearches";

// ── Helpers ────────────────────────────────────────────────────────────────────

function resolveMedia(
  product: Product,
  selectedColorLabel: string | null,
  selectedSizeLabel?: string | null,
  selectedGsmValue?: number | null,
  selectedSizeOptionId?: string | null
): MediaItem[] {
  const colorObj = selectedColorLabel ? product.colors?.find((c) => c.label === selectedColorLabel) : undefined;

  const base: MediaItem[] = (() => {
    // A color+GSM combo can have its own photo (e.g. Natural at 150 GSM
    // looks different from Natural at 330 GSM) — this wins over the color's
    // plain `media` whenever both a color and a GSM tier are selected and
    // that specific combo has a photo defined.
    if (colorObj && selectedGsmValue != null) {
      const combo = colorObj.gsmMedia?.[selectedGsmValue];
      if (combo && combo.length > 0) return combo;
    }
    if (colorObj?.media && colorObj.media.length > 0) return colorObj.media;
    if (product.media && product.media.length > 0) return product.media;
    return product.images.map((src) => ({ type: "image" as const, src }));
  })();

  // Highest priority for the FIRST/hero photo: the exact size+color+GSM
  // combo photo from `sizeOptions[].variantImages` (cardVariantPicker
  // products, e.g. Customized Tote Bag). These are the same photos already
  // shown on the "Choose Size" cards. It goes first in the thumbnail strip,
  // but the color's other angle shots (from `base` above) still follow it —
  // previously this replaced the whole gallery with just one photo, which is
  // why only a single thumbnail was ever showing.
  if (selectedSizeOptionId && selectedColorLabel && selectedGsmValue != null && product.sizeOptions) {
    const sizeOpt = product.sizeOptions.find((s) => s.id === selectedSizeOptionId);
    const variantSrc = sizeOpt?.variantImages?.[`${selectedColorLabel}:${selectedGsmValue}`];
    if (variantSrc) {
      const rest = base.filter((m) => m.src !== variantSrc);
      return [{ type: "image" as const, src: variantSrc }, ...rest];
    }
  }

  // A size+GSM combo can carry its own photo via `sizeDetails[size].gsmVariants`
  // in the .ts data — when it does, show it first (so the main viewer/live
  // preview reflects the exact size+GSM picked) while keeping the color's
  // other angle shots after it.
  const sizeGsmImageSrc = selectedSizeLabel && selectedGsmValue != null
    ? product.sizeDetails?.[selectedSizeLabel]?.gsmVariants?.[selectedGsmValue]?.image
    : undefined;
  if (sizeGsmImageSrc) {
    const rest = base.filter((m) => m.src !== sizeGsmImageSrc);
    return [{ type: "image" as const, src: sizeGsmImageSrc }, ...rest];
  }
  return base;
}

// Blank (unprinted) tote bag photos for the logo live-preview canvas —
// front, back, left, right. A size+GSM combo's own
// `sizeDetails[size].gsmVariants[gsm].blankMedia` wins first (since a 12x14
// and an 18x20 bag genuinely look different, and 150 vs 330 GSM can too),
// then the selected color's `blankMedia`, then nothing if neither is set.
function resolveBlankMedia(
  product: Product,
  selectedColorLabel: string | null,
  selectedSizeLabel?: string | null,
  selectedGsmValue?: number | null
): MediaItem[] {
  const sizeGsmBlank = selectedSizeLabel && selectedGsmValue != null
    ? product.sizeDetails?.[selectedSizeLabel]?.gsmVariants?.[selectedGsmValue]?.blankMedia
    : undefined;
  if (sizeGsmBlank && sizeGsmBlank.length > 0) return sizeGsmBlank;

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
  // Tracks whether `src` failed to load, so a missing/broken photo (e.g. a
  // color+GSM combo that hasn't gotten its real photo yet) shows a clean
  // placeholder instead of a blank box or the browser's broken-image icon.
  const [imgError, setImgError]     = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  // Give every new `src` a fresh chance to load (a previous src might have
  // been broken, but the next one the shopper picks could be fine).
  useEffect(() => { setImgError(false); }, [src]);

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

  const zoomPanel = showLens && isMounted && !imgError
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
        {!src || imgError ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-50 text-gray-300">
            <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="text-xs font-medium text-gray-400">Image coming soon</span>
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain pt-4 px-4 sm:pt-6 sm:px-6"
            draggable={false}
            priority
            onError={() => setImgError(true)}
          />
        )}
        {showLens && !imgError && (
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

// A single thumbnail's image, with its own broken-image detection — a
// missing/broken photo (e.g. a size+color+GSM combo that hasn't gotten its
// real photo yet) shows a small placeholder icon instead of the browser's
// raw alt-text fallback (which is what was showing as literal "view 2" text
// in the thumbnail strip).
function ThumbnailImage({ src, alt }: { src: string; alt: string }) {
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [src]);

  return (
    <div className="relative w-full h-full bg-white flex items-center justify-center">
      {imgError ? (
        <svg className="h-6 w-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      ) : (
        <Image src={src} alt={alt} fill className="object-contain" onError={() => setImgError(true)} />
      )}
    </div>
  );
}

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
                <ThumbnailImage src={item.src} alt={`view ${realIndex + 1}`} />
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
// Matches polo's Delivery Speed step exactly: Standard / Same Day / Self Pick Up
// option cards, no live courier (Borzo) quote, no pincode check, no delivery-slot
// picker — same-day just shows a banner saying the team will call to confirm.
// (Badges previously had their own Borzo/pincode/slot integration here; polo
// never had that, so it's removed to match, same as round-neck/hoodies/oversized/
// full-sleeves earlier.) Keeps this page's own numbered-step heading style
// ("N. Delivery") instead of polo's plain "Delivery Speed" heading, to stay
// consistent with the other numbered steps on this page.

// Store address shown when a shopper picks Self Pick Up as their delivery
// option — shared by the DeliverySelector card, the checkout summary, and
// the success screen so it only needs updating in one place.
const PICKUP_ADDRESS =
  "Shop No 15, Samta Society, Hiranandani Link Rd, near Bar Bank, near Kailash Vaibhav B Wing, HMPL Surya Nagar, Vikhroli West, Mumbai, Maharashtra 400079";

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

function DeliverySelector({ selected, onSelect, sameDayTurnaround, sameDayAvailable = true, pickupAddress, stepNumber = 4 }: {
  selected: DeliveryType;
  onSelect: (v: DeliveryType) => void;
  sameDayTurnaround?: string;
  sameDayAvailable?: boolean;
  pickupAddress: string;
  stepNumber?: number;
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
      <span className="text-sm font-bold text-[#000] uppercase tracking-wide mb-3 block">{stepNumber}. Delivery</span>
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


// ── Quantity Selector (individual — no single/bulk tier toggle) ────────────────
// Badges are ordered as a plain individual quantity (unlike the tote-bag/
// apparel "Single Piece vs Bulk Order" tier picker this page used to reuse).
// The underlying bulk-discount PRICING is untouched — computeOrderTotal/
// getDiscountForQty/getPricePerUnit (app/lib/pricing.ts) still apply the
// same QTY_TIERS discount as quantity goes up; only the input widget is
// simplified to a plain stepper, and this still feeds the same `quantity`
// state that flows into pricePerUnit/totalPrice, handleAddToCart and the
// Razorpay order payload — nothing downstream changes.
function QuantitySelector({ displayPrice, quantity, setQuantity, stepNumber = 3 }: {
  displayPrice: number; quantity: number; setQuantity: (q: number) => void; stepNumber?: number;
}) {
  const [inputVal, setInputVal] = useState(String(quantity));

  useEffect(() => {
    setInputVal(String(quantity));
  }, [quantity]);

  const commit = (next: number) => {
    const valid = Math.max(1, Math.floor(next) || 1);
    setQuantity(valid);
    setInputVal(String(valid));
  };

  const discountPct = getDiscountForQty(quantity);
  const pricePerUnit = getPricePerUnit(displayPrice, quantity);

  return (
    <div>
      <span className="text-sm font-bold text-[#000] uppercase tracking-wide mb-3 block">{stepNumber}. Quantity</span>

      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden w-fit flex-shrink-0">
          <button
            type="button"
            disabled={quantity <= 1}
            onClick={() => commit(quantity - 1)}
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
              commit(isNaN(parsed) ? 1 : parsed);
            }}
            className="w-16 text-center font-bold text-lg border-none outline-none"
          />
          <button
            type="button"
            onClick={() => commit(quantity + 1)}
            className="w-11 h-11 flex items-center justify-center text-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 flex-1 sm:flex-none min-w-0">
          <span className="text-[12px] sm:text-[13px] font-semibold text-blue-900 leading-snug whitespace-nowrap">
            {formatPrice(pricePerUnit)} / piece
          </span>
          {discountPct > 0 && (
            <span className="text-[10px] sm:text-[11px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              {discountPct}% OFF
            </span>
          )}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-2">
        Order any quantity you need — the price per piece automatically improves at higher quantities.
      </p>
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
// Matches polo's checkout modal exactly: 3-step Address/Payment/Confirm flow,
// Prepaid vs COD toggle, GST number + alternate phone fields, order summary
// sidebar with price breakdown, and the success screen. sizeBreakdown/
// colorBreakdown/printType/fabricType/logoUrls are all optional props this
// component supports (same as polo) — badges just never pass them (single
// selectedSize/selectedColor, no embroidery/DTF print type), so those code
// paths simply never fire; nothing here is badge-specific dead code, it's the
// same shared shape polo/round-neck/hoodies/oversized/full-sleeves all use.

function OrderModal({
  product, productImage, quantity, pricePerUnit, sameDayCharge, deliveryType, selectedSize, selectedColor,
  loggedInUser, onClose,
  // Optional — only present for products that actually use them (size
  // breakdown, logo customization, etc). Omitted entirely for plain
  // size/color products, which keeps this fully backward compatible.
  sizeBreakdown, colorBreakdown, customizationNote, printType, fabricType, logoUrls,
  logoLayers, logoUploadedUrls, badgeStyleSlug,
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
  // Only set on badge style-picker pages ("Customized Badges") — the
  // concrete badge shape (e.g. "square-pin-badge") the shopper actually
  // picked. `product`/`productSlug` above stay the generic umbrella
  // product on purpose (pricing is keyed to it); this rides along in
  // `customization` purely so the server can find the right colour's
  // blankMedia photos for the post-payment design PDF.
  badgeStyleSlug?: string;
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
        hasColorBreakdown || sizeBreakdown || combinedNote || printType || fabricType || Object.keys(resolvedLogoUrls).length || hasLogoDesign || badgeStyleSlug
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
              badgeStyleSlug: badgeStyleSlug || undefined,
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
            <img src="/cluesstyle-white-logo.png" alt="Cluesstyle" className="h-20 w-auto" />
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
                  <div className="mt-3 pt-3 border-t border-emerald-100/80 space-y-2">
                    {colorBreakdownRows.map((row) => {
                      const rowColorObj = product.colors?.find((c) => c.label === row.color);
                      const rowImg = rowColorObj?.media?.find((m) => m.type === "image")?.src ?? productImage;
                      return (
                        <div key={row.color} className="flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-md bg-white border border-emerald-100 overflow-hidden flex-shrink-0">
                              <img src={rowImg} alt={row.color} className="w-full h-full object-contain" />
                            </div>
                            <span className="font-semibold text-gray-800 whitespace-nowrap truncate">{row.color}</span>
                          </div>
                          <span className="text-gray-500 text-right flex-shrink-0">
                            {row.sizesLabel} <span className="text-gray-400">({row.qty} pcs)</span>
                          </span>
                        </div>
                      );
                    })}
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
                        placeholder="Mayur Santosh Gaikwad"
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
                    <div className="pb-2.5 border-b border-dashed border-gray-200 space-y-2">
                      {colorBreakdownRows.map((row) => {
                        const rowColorObj = product.colors?.find((c) => c.label === row.color);
                        const rowImg = rowColorObj?.media?.find((m) => m.type === "image")?.src ?? productImage;
                        return (
                          <div key={row.color} className="flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-md bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                                <img src={rowImg} alt={row.color} className="w-full h-full object-contain" />
                              </div>
                              <span className="font-semibold text-gray-700 whitespace-nowrap truncate">{row.color}</span>
                            </div>
                            <span className="text-gray-500 text-right flex-shrink-0">
                              {row.sizesLabel} <span className="text-gray-400">({row.qty} pcs)</span>
                            </span>
                          </div>
                        );
                      })}
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
                      {/* <span>
                        Embroidery ({numEmbroideryPositions} position{numEmbroideryPositions !== 1 ? "s" : ""}
                        {quantity < EMBROIDERY_DESIGN_CHARGE_FREE_MIN_QTY ? " + design charge" : ""})
                      </span> */}
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

// ── Color Card Picker (big square cards: image + label, green check when selected) ──
// Used on style-picker pages to redesign "Choose Color" as large product-shot cards
// instead of the small rectangular swatches SwatchPickerRow renders elsewhere.
function ColorCardPickerRow({
  title, items, selectedId, onSelect,
}: {
  title: React.ReactNode;
  items: SwatchItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      {title}
      <div className="grid grid-cols-2 gap-3 mt-2">
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`relative flex flex-col items-center rounded-xl border-2 bg-white overflow-hidden transition-all p-3 ${
                isSelected ? "border-green-500" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
              )}
              <div className="relative w-full h-[350px]"> 
                {item.image ? (
                  <Image src={item.image} alt={item.label} fill className="object-contain" />
                ) : item.hex ? (
                  <span className="absolute inset-4 rounded-lg" style={{ backgroundColor: item.hex }} />
                ) : null}
              </div>
              <span className="text-sm font-bold text-gray-900 mt-2">{item.label}</span>
            </button>
          );
        })}
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

// Type reference for the "1. Choose Size" section (replaces "Choose Style" on
// products that define sizeOptions in their product data, e.g. tote bags).
// NOTE: `sizeOptions` itself must also be added to the `Product` interface in
// tote-bag-collection.ts for this to type-check and actually populate.
interface SizeOption {
  id: string;         // "small" | "medium" | "large" | "xl" — must be unique per product
  label: string;       // "Small"
  dimension: string;   // "12 x 14 inch" — shown under the label
  price: number;       // 199 — rendered as "₹199"
  image: string;       // product photo for this size
  popular?: boolean;   // shows the blue "Popular" badge, top-right of the card
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

// ── GSM Fabric Thickness cards (tote bag style-picker pages) — 2 fixed options ──
interface GsmFabricCard {
  id: "basic" | "premium"; // reuses fabricCategory state, same as FABRIC_PLAN_CARDS
  gsm: string;
  badge: string;
  image: string; // fabric texture swatch photo
  features: { text: string }[];
}

const GSM_FABRIC_CARDS: GsmFabricCard[] = [
  {
    id: "basic",
    gsm: "150 GSM",
    badge: "Lightweight",
    image: "/fabric-textures/150-gsm-natural.webp",
    features: [
      { text: "Light & Easy to Carry" },
      { text: "Economical Choice" },
      { text: "Promotions Use" },
    ],
  },
  {
    id: "premium",
    gsm: "330 GSM",
    badge: "Heavy & Premium",
    image: "/fabric-textures/330-gsm-natural.webp",
    features: [
      { text: "Thicker & Extra Strong" },
      { text: "More Durable & Reusable" },
      { text: "Branding Use" },
    ],
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
  // Tracks whether `bgSrc` failed to load — resets on every side/src change
  // so a previously-broken photo doesn't stay "broken" forever if the next
  // one picked is fine.
  const [bgError, setBgError] = useState(false);
  useEffect(() => { setBgError(false); }, [bgSrc]);

  return (
    <div className="flex-1 min-w-[190px] flex flex-col h-full">
      <div
        ref={containerRef}
        onClick={() => setActiveId(null)}
        className="relative w-full flex-1 min-h-[260px] sm:min-h-[328px] h-full rounded-xl border-2 border-dashed border-gray-300 bg-white overflow-hidden touch-pan-y mx-auto"
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
          {(["front", "back", "right", "left"] as Side[]).filter((s) => isSideEnabled(s)).map((s) => {
            return (
              <button
                key={s}
                type="button"
                onClick={() => onSideChange(s)}
                className={`px-2 py-1 rounded-md text-[10px] font-semibold capitalize transition-colors ${
                  side === s ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"
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

        {bgError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50 text-gray-300 pointer-events-none">
            <svg className="h-14 w-14" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="text-xs font-medium text-gray-400">Image coming soon</span>
          </div>
        ) : (
          <Image key={bgSrc} src={bgSrc} alt={`Preview ${side}`} fill
            className="object-contain pointer-events-none select-none" draggable={false}
            onError={() => setBgError(true)} />
        )}

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
              {(() => {
                const enabledSides = (["front", "back", "right", "left"] as Side[]).filter((s) => isSideEnabled(s));
                // Each side is its own grid cell — with grid-cols-2 that puts
                // Front and Back directly side by side (not stacked), and a
                // third/fourth side (Right/Left) wraps to the next row.
                return enabledSides.map((side) => {
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
                });
              })()}
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
        src="/tote-bag-collection/bag-view.webp"
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
        src="/tote-bag-collection/bag-view.webp"
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
    className={`w-full flex items-center gap-3 ${disabled ? "opacity-40 grayscale cursor-not-allowed" : "cursor-pointer"}`}
    onClick={handleCardClick}
  >
      {/* Left: icon + label, stacked, fixed width */}
      <div className="flex flex-col items-center justify-center w-16 sm:w-20 flex-shrink-0 text-center">
        <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-gray-400">
          <IconComponent />
        </div>
        <span className="text-[9px] sm:text-[11px] font-semibold text-gray-500 whitespace-nowrap block mt-1">{label}</span>
        <span className="text-[7px] sm:text-[8px] text-gray-400 block mt-0.5 leading-tight">{disabled ? "Not available" : "PNG, JPG up to 5MB"}</span>
      </div>

      {/* Right: upload dropzone or preview, fills remaining width */}
      <div className="flex-1 min-w-0">
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
            className="w-full h-[76px] sm:h-20 border border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center gap-1 text-blue-500 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:border-blue-300 disabled:hover:bg-transparent"
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
                <span className="text-[10px] sm:text-xs font-semibold text-blue-600 text-center leading-tight px-1">Click to upload<br />or drag and drop</span>
              </>
            )}
          </button>
        ) : (
          <div className="relative w-full h-[76px] sm:h-20 rounded-xl overflow-hidden border-2 border-gray-300 bg-white cursor-pointer hover:border-gray-400 transition-colors"
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
        <div className="logo-upload-left flex flex-col gap-4 min-w-0">
        <div className="w-full min-w-0">
            <span className="text-[12px] font-semibold text-gray-700 mb-4 block pb-0">Add your logo and customize your product</span>
            {(() => {
              const allCards: { label: string; side: Side; icon: React.ComponentType<any> }[] = [
                { label: "Front Logo", side: "front", icon: FrontShirtIcon },
                { label: "Back Logo",  side: "back",  icon: BackShirtIcon },
                { label: "Left Logo",  side: "left",  icon: LeftSleeveIcon },
                { label: "Right Logo", side: "right", icon: RightSleeveIcon },
              ];
              // Only sides in `enabledLogoSides` actually render a card — the
              // rest are left out entirely (not just dimmed), so a product
              // limited to Front+Back shows exactly two clean boxes instead
              // of two active ones plus two greyed-out leftovers.
              const cards = allCards.filter((c) => isSideEnabled(c.side));
              const gridColsClass =
                cards.length <= 2 ? "grid-cols-2" : cards.length === 3 ? "grid-cols-3" : "grid-cols-4";
              return (
                <div className={`grid ${gridColsClass} gap-2`}>
                  {cards.map((c) => (
                    <LogoUploadCard
                      key={c.side}
                      label={c.label}
                      side={c.side}
                      file={logoFiles[c.side]}
                      preview={logoPreviews[c.side]}
                      uploading={logoUploading[c.side]}
                      inputRef={
                        c.side === "front" ? frontInputRef
                        : c.side === "back" ? backInputRef
                        : c.side === "left" ? leftInputRef
                        : rightInputRef
                      }
                      onChange={(f) => onLogoChange(f, c.side)}
                      icon={c.icon}
                      onActiveSideChange={onActiveSideChange}
                    />
                  ))}
                </div>
              );
            })()}
        </div>

        {/*
          On mobile the note box just needs a comfortable fixed height (set via
          textCardHeight). On lg+ it grows with lg:flex-1 so the left column's
          total height (cards + gap + textarea) is what the live preview on the
          right stretches to match — no more fixed/minimum-height guessing.
        */}
        <div
          style={{ minHeight: textCardHeight }}
          className="w-full flex flex-col border-2 lg:flex-1 border-dashed border-gray-300 rounded-xl p-2.5 min-w-0"
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

        <div className="logo-upload-preview flex flex-col min-w-0">
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
      </div>

      <style jsx>{`
        .logo-upload-grid {
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 1024px) {
          .logo-upload-grid {
            flex-direction: row;
            align-items: stretch;
          }
          .logo-upload-left {
            flex: 1 1 0%;
          }
          .logo-upload-preview {
            flex: 0 0 35%;
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


// One tile in the "Fabric/GSM" picker on simpleVariantPicker product pages
// (e.g. Sample Kit). Tracks its own image-load failure so a missing swatch
// photo swaps to a plain placeholder square instead of the browser's
// broken-image icon + alt text — that fallback rendering ignores the
// parent's `overflow-hidden` in some browsers and was pushing the two cards
// to different heights.
function GsmOptionCard({
  gsm,
  isSelected,
  onSelect,
}: {
  gsm: GsmOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  // 150 GSM (the lighter/basic tier) uses the same blue theme as the "Plan"
  // card; any heavier/premium tier (330 GSM etc.) uses the same purple theme
  // as the "Customized" card, so the whole page reads as one consistent
  // blue-vs-purple "basic vs premium" language.
  const isPurple = gsm.value !== 150;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex h-full flex-col overflow-hidden text-left rounded-xl border p-3 transition-all ${        isSelected
          ? isPurple
            ? "border-purple-400 bg-gradient-to-br from-purple-50 to-white shadow-[0_8px_24px_rgba(147,51,234,0.15)]"
            : "border-blue-300 bg-blue-50/40"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      {isPurple && (
        <span className="absolute top-0 right-0 flex items-center gap-0.5 bg-purple-600 text-white text-[8px]  px-1.5 py-0.5 rounded-bl-lg">
          <svg className="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Recommended
        </span>
      )}
      <div className="flex items-center gap-1.5 mb-1.5 mt-3">
        <span
          className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
            isSelected
              ? isPurple
                ? "border-purple-500 bg-purple-500"
                : "border-blue-500 bg-blue-500"
              : "border-gray-300 bg-white"
          }`}
        >
          {isSelected && (
            <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={4} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <span className="text-base font-extrabold text-gray-900 whitespace-nowrap">{gsm.value} GSM</span>
      </div>
      <span
        className={`mb-3 inline-block w-fit rounded-full px-2 py-0.5 text-[8px] font-bold ${
          isPurple ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
        }`}
      >
        {gsm.label}
      </span>
      <ul className="flex flex-col gap-1">
        {gsm.features.map((f) => (
          <li key={f} className="flex items-start gap-1">
            <svg
              className={`mt-0.5 h-2.5 w-2.5 flex-shrink-0 ${isPurple ? "text-purple-600" : "text-blue-600"}`}
              fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[10px] leading-tight  text-gray-600">{f}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

// ── Badge "Choose Badge Type" style-picker card ───────────────────────────────
// One thumbnail per badge shape/format (round pin, rectangle, fridge magnet,
// etc.) — clicking swaps `selectedStyleSlug` so the rest of the page (photos,
// live logo preview) reflects that shape, all without leaving this product's
// page. Reuses the existing (previously unwired) isStylePicker/handleSelectStyle
// state machinery already defined further down in this file.
function BadgeTypePinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.5-4.2-7-7.6-7-11a7 7 0 1114 0c0 3.4-2.5 6.8-7 11z" />
      <circle cx="12" cy="10" r="2.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
function BadgeTypeRectangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="4" y="6" width="16" height="12" rx="2.5" />
    </svg>
  );
}
function BadgeTypeMagnetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}
function BadgeTypeShirtIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4L4 7l2 3 2-1.2V20h8V8.8L18 10l2-3-4-3-2 1.5h-4L8 4z" />
    </svg>
  );
}
function BadgeTypeGenericIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5-4 4-3-3-6 6" />
    </svg>
  );
}
function badgeTypeVisual(name: string): { Icon: (props: { className?: string }) => React.ReactElement; bg: string } {
  const n = name.toLowerCase();
  if (n.includes("rectangle")) return { Icon: BadgeTypeRectangleIcon, bg: "bg-pink-500" };
  if (n.includes("fridge"))    return { Icon: BadgeTypeMagnetIcon,    bg: "bg-green-500" };
  if (n.includes("shirt"))     return { Icon: BadgeTypeShirtIcon,     bg: "bg-orange-500" };
  if (n.includes("round") || n.includes("pin")) return { Icon: BadgeTypePinIcon, bg: "bg-purple-600" };
  return { Icon: BadgeTypeGenericIcon, bg: "bg-gray-500" };
}

function BadgeTypeModal({
  options,
  selectedSlug,
  onSelect,
  onClose,
}: {
  options: Product[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
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
            Choose Badge Type <span className="font-normal text-gray-400 text-sm">({options.length} options)</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {options.map((p) => {
            const thumb = p.media?.[0]?.src || p.images?.[0] || "/placeholder-product.png";
            const isSelected = selectedSlug === p.slug;
            return (
              <button
                key={p.slug}
                onClick={() => { onSelect(p.slug); onClose(); }}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className={`relative overflow-hidden w-full aspect-square rounded-xl border bg-white transition-all duration-200 ${
                    isSelected ? "border-purple-400 ring-2 ring-purple-200" : "border-gray-200 group-hover:border-gray-400"
                  }`}
                >
                  <Image src={thumb} alt={p.name} fill className="object-cover" />
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5">
                      <div className="w-6 h-6 rounded-full bg-purple-600 shadow-md flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <span
                  className={`text-xs font-medium text-center leading-tight line-clamp-2 ${
                    isSelected ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BadgeStylePickerCard({ product, isSelected, onSelect }: { product: Product; isSelected: boolean; onSelect: () => void }) {
  const thumb = product.media?.[0]?.src || product.images?.[0] || "/placeholder-product.png";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col items-center rounded-2xl border p-3 text-center transition-all ${
        isSelected
          ? "border-purple-400 shadow-[0_8px_24px_rgba(147,51,234,0.15)]"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50">
        <Image src={thumb} alt={product.name} fill className="object-cover" />
        {isSelected && (
          <span className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 shadow">
            <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={4} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </div>
      <div className="mt-3">
        <span className="text-[12px] font-bold text-gray-900 leading-tight">{product.name}</span>
      </div>
    </button>
  );
}

// ── Generic "Your Logo" icon used by the badge upload card ───────────────────
// (Badges have no front/back/sleeve concept, so this stands in for
// FrontShirtIcon/BackShirtIcon/etc. used by the apparel LogoUploadCard grid.)
function BadgeUploadIcon({ src }: { src?: string }) {
  if (src) {
    return (
      <div className="relative h-full w-full">
        <Image src={src} alt="" fill className="object-contain" />
      </div>
    );
  }
  return <BadgeLogoIcon />;
}
function BadgeLogoIcon() {
  return (
    <svg className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.3} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 8.688a2.25 2.25 0 011.183-1.981l7.5-4.03a2.25 2.25 0 012.134 0l7.5 4.03A2.25 2.25 0 0122.5 8.69v8.123a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 16.81V8.688z" />
    </svg>
  );
}

// ── Badge size → inch label ──────────────────────────────────────────────────
// Button/lapel badges are conventionally sold under round inch sizes even
// though the underlying spec is metric (e.g. the industry-standard "1.25 inch"
// badge measures 32mm). This table covers the common sizes; anything else
// falls back to a plain mm→inch conversion so a new size never renders blank.
function badgeSizeInches(size: string): number | null {
  const match = size.match(/(\d+(\.\d+)?)\s*mm/i);
  if (!match) return null;
  return Math.round((parseFloat(match[1]) / 25.4) * 100) / 100;
}

function BadgeSizeOptionCard({ size, index, isSelected, onSelect, shape }: {
  size: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  // From the product's `sizeCardShape` in the data file — falls back to a
  // 112x112 circle when the product doesn't set one.
  shape?: { shape: "circle" | "square" | "rectangle"; width: number; height: number };
}) {
  const inches = badgeSizeInches(size);
  const tag = index === 0
    ? { label: "Most Popular", filled: true }
    : index === 1
      ? { label: "Bigger Impact", filled: false }
      : null;
  const { shape: kind, width: sw, height: sh } = shape ?? { shape: "circle" as const, width: 112, height: 112 };
  const strokeColor = isSelected ? "#d8b4fe" : "#d1d5db";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex h-full flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-all ${
        isSelected
          ? "border-purple-400 bg-purple-50/40 shadow-[0_8px_24px_rgba(147,51,234,0.12)]"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      {isSelected && (
        <span className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600">
          <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={4} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      <div className="relative flex flex-1 items-center justify-center" style={{ width: sw, height: sh }}>
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${sw} ${sh}`}>
          {kind === "circle" ? (
            <circle cx={sw / 2} cy={sh / 2} r={Math.min(sw, sh) / 2 - 2} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
          ) : (
            <rect x={2} y={2} width={sw - 4} height={sh - 4} rx={kind === "square" ? 16 : 20} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
          )}
        </svg>
        <span className={`absolute -top-3 flex h-8 w-8 items-center justify-center rounded-full ${isSelected ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-400"}`}>
          <svg className="h-6 w-6 -rotate-45" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V7.5a1 1 0 011-1h16a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1zM7 6.5v3M11 6.5v5M15 6.5v3M19 6.5v5" />
          </svg>
        </span>
        <div className="flex flex-col items-center">
          <span className="text-lg font-extrabold text-gray-900">{size}</span>
          {inches != null && <span className="text-[11px] text-gray-500">({inches}&quot; inches)</span>}
        </div>
      </div>
      {tag && (
        <div className="w-full border-t border-dashed border-gray-200 pt-2">
        <span className={`flex items-center justify-center gap-1 text-[10px] font-bold ${tag.filled ? "text-purple-600" : "text-gray-400"}`}>
          <svg className="h-3 w-3" fill={tag.filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          {tag.label}
        </span>
      </div>
      )}
    </button>
  );
}
// ── Badge "Customized" promo card ─────────────────────────────────────────────
// Third card alongside the size options — not a selectable size, just a
// visual nudge (purple, matching GsmOptionCard's "premium" theme) pointing
// down at the logo-upload step that's already on the page.
function BadgeCustomizedPromoCard({ categoryLabel, onClick, previewImage }: { categoryLabel: string; onClick: () => void; previewImage?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-full items-center gap-4 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-white p-5 text-left transition-all hover:border-purple-400 hover:shadow-[0_8px_24px_rgba(147,51,234,0.15)]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wide text-purple-600">Customized</span>
          <span className="rounded-full border border-purple-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-purple-600">Add Your Design</span>
        </div>
        <span className="mt-1.5 text-[16px] font-extrabold text-gray-900">Customize your {categoryLabel}</span>
        <ul className="mt-3 flex flex-col gap-1">
          <li className="flex items-center gap-2">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-purple-100 text-purple-600">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="8.5" cy="9.5" r="1.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5-4 4-3-3-6 6" />
              </svg>
            </span>
            <span className="text-[13px] text-gray-600">Add your logo or artwork</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-purple-100 text-purple-600">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18c3.5 0 4.5 2 4.5 3.5 0 1-.5 1.5-1.5 1.5h-1a2 2 0 00-2 2c0 1 1 1.5 1 2.5S12 14 12 15c0 2 2 2 2 4a2 2 0 01-2 2z" />
                <circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
                <circle cx="9" cy="7" r="1" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <span className="text-[13px] text-gray-600">Print or Add Text</span>
          </li>
        </ul>
      </div>
      <div className="relative h-32 w-32 flex-shrink-0">
        <Image src={previewImage || "/badge-collection/customized-your-logo.webp"} alt="Your design preview" fill className="object-contain" />
      </div>
    </button>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params  = useParams();
  const slug    = params.slug as string;
  const product = productsData.find((p) => p.slug === slug) ?? productsData[0];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // The size-grid page (/[slug]/sizes) links here with ?size=<label> and,
  // if the shopper picked one in its sidebar, ?color=<label> too — so both
  // choices carry through instead of being asked for twice. It also links
  // with ?gsm=<value> when a size has multiple GSM weights, so the exact
  // card the shopper clicked (e.g. "150 GSM") carries through too.
  const searchParams = useSearchParams();
  const sizeFromUrl = searchParams.get("size");
  const colorFromUrl = searchParams.get("color");
  const gsmFromUrl = searchParams.get("gsm");
  const resolveInitialSize = () =>
    product.sizes?.find(
      (s) => s.toLowerCase() === sizeFromUrl?.toLowerCase()
    ) ?? product.sizes?.find((s) => s.toLowerCase() === "32mm") ?? product.sizes?.[0] ?? null;
  const resolveInitialColor = () =>
    product.colors?.find(
      (c) => c.label.toLowerCase() === colorFromUrl?.toLowerCase()
    )?.label ?? product.colors?.[0]?.label ?? null;

  const [activeImg,      setActiveImg]      = useState(0);
  const [selectedColor,  setSelectedColor]  = useState<string | null>(resolveInitialColor);
  const selectedColorObj = product.colors?.find((c) => c.label === selectedColor) ?? null;
  const colorSameDayAvailable = selectedColorObj?.sameDayAvailable ?? product.sameDayAvailable ?? false;
  const [selectedSize,   setSelectedSize]   = useState<string | null>(resolveInitialSize);
  // For classic isDefaultCategory products (e.g. Natural/Black Canvas Tote
  // Bag) whose sizes come in multiple GSM weights — tracks which GSM is
  // selected for the CURRENT size, via `sizeDetails[size].gsmVariants`.
  // Distinct from `selectedGsm` below, which is for the separate
  // `gsmOptions`-driven flow (Sample Kit / Customized Tote Bag).
  const resolveVariantGsm = (sizeLabel: string | null) => {
    const variants = sizeLabel ? product.sizeDetails?.[sizeLabel]?.gsmVariants : undefined;
    if (!variants) return null;
    const keys = Object.keys(variants).map(Number);
    if (keys.length === 0) return null;
    // If the URL explicitly named a GSM (e.g. from clicking a "150 GSM"
    // card on the size-grid page) and this size actually has it, honor
    // that over the default — otherwise fall back to 330-preferred.
    const gsmFromUrlNum = gsmFromUrl != null ? Number(gsmFromUrl) : null;
    if (gsmFromUrlNum != null && keys.includes(gsmFromUrlNum)) return gsmFromUrlNum;
    return keys.includes(330) ? 330 : keys[0];
  };
  const [selectedVariantGsm, setSelectedVariantGsm] = useState<number | null>(
    () => resolveVariantGsm(resolveInitialSize())
  );
  // Only relevant for `simpleVariantPicker` products (e.g. Sample Kit) — the
  // fabric-thickness tier picked in the "Choose Fabric GSM" section further
  // down, which replaces the Plan/Customized cards for these products.
  const [selectedGsm,    setSelectedGsm]    = useState<GsmOption | null>(
    product.gsmOptions?.find((g) => g.value === 330) ?? product.gsmOptions?.[0] ?? null
  );

  // Whenever the selected SIZE (or the URL's gsm param) changes, re-resolve
  // which GSM variants are available and pick one — honoring an explicit
  // ?gsm= from the URL first, then defaulting to 330 preferred.
  useEffect(() => {
    setSelectedVariantGsm(resolveVariantGsm(selectedSize));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSize, gsmFromUrl]);

  // Re-sync if the URL's size/color params change via client-side navigation
  // (e.g. shopper goes back to the size grid and picks something different)
  // without a full remount of this component.
  useEffect(() => {
    const resolved = product.sizes?.find(
      (s) => s.toLowerCase() === sizeFromUrl?.toLowerCase()
    ) ?? null;
    if (resolved) setSelectedSize(resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeFromUrl]);
  useEffect(() => {
    const resolved = product.colors?.find(
      (c) => c.label.toLowerCase() === colorFromUrl?.toLowerCase()
    )?.label;
    if (resolved) setSelectedColor(resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorFromUrl]);
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
  productsData.find((p) => p.category === product.category && p.slug !== product.slug && p.colors && p.colors.length > 0)?.slug ?? product.slug
);
const selectedStyleProduct = productsData.find((p) => p.slug === selectedStyleSlug) ?? product;
const [selectedStyleColor, setSelectedStyleColor] = useState<string | null>(
  selectedStyleProduct.colors?.[0]?.label ?? null
);

// "Choose Size" — replaces "Choose Style" on style-picker products that define
// `sizeOptions` in their product data (e.g. tote bags). Products without
// `sizeOptions` keep showing the original "Choose Style" thumbnail row.
const [selectedSizeOption, setSelectedSizeOption] = useState<string | null>(
  product.sizeOptions?.[0]?.id ?? null
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
  // Each badge type can have its own size list — jumping to the new
  // product's first size (rather than keeping whatever was selected on the
  // previous type) avoids carrying over a size that may not even exist here.
  setSelectedSize(styleProduct?.sizes?.[0] ?? null);
};

const handleSelectStyleColor = (colorLabel: string) => {
  setOverrideImage(null);
  setSelectedStyleColor(colorLabel);
};
const [designMode, setDesignMode] = useState<"plan" | "custom">("plan");
const [logoFiles, setLogoFiles] = useState<Record<Side, File | null>>({ front: null, back: null, right: null, left: null });
  // ── Badge-specific logo upload state (simpler, single-side only) ─────
  // Kept separate from logoFiles/logoPreviews above (which stay declared,
  // just unused for badges) rather than reshaping those into badges' single
  // side — avoids touching LogoUploadSection/other apparel-specific code
  // that still expects the Record<Side, ...> shape.
  const [badgeLogoFile, setBadgeLogoFile] = useState<File | null>(null);
  const [badgeLogoPreview, setBadgeLogoPreview] = useState<string | null>(null);
  const [badgeLogoUploadedUrl, setBadgeLogoUploadedUrl] = useState<string | null>(null);
  const [badgeLogoUploading, setBadgeLogoUploading] = useState(false);
  const [badgePendingBgConfirm, setBadgePendingBgConfirm] = useState<File | null>(null);
  const [badgeLogoLayer, setBadgeLogoLayer] = useState<PreviewLayer | null>(null);
  const badgeLogoInputRef = useRef<HTMLInputElement>(null);
  // Scroll target for the "Customized" promo card next to the size options —
  // clicking it jumps straight down to the logo-upload step below.
  const badgeLogoSectionRef = useRef<HTMLDivElement>(null);

  // "Choose Badge Type" — only shown on the generic "Customized Badges"
  // product (data-flagged via `isStylePicker`), so a shopper who lands there
  // can pick a physical shape (round pin / rectangle / fridge magnet / shirt
  // magnet) before customizing, without leaving this page. Reuses the
  // isStylePicker/selectedStyleSlug machinery above — picking a card just
  // swaps which product's photos/live-preview are shown.
  const [showBadgeTypeModal, setShowBadgeTypeModal] = useState(false);
  const showBadgeStylePicker = product.category === "Badge" && !!product.isStylePicker;
  const badgeStyleOptions = showBadgeStylePicker
    ? productsData.filter((p) => p.category === "Badge" && p.slug !== product.slug)
    : [];
  // Everything below "Choose Badge Type" shifts down a step when it's shown.
  const badgeStepOffset = showBadgeStylePicker ? 1 : 0;

  // Adapts the single `badgeLogoLayer` object to the Record<Side, PreviewLayer[]>
  // shape LivePreviewCanvas/DraggableLogo expect (they're built for the
  // multi-side apparel flow) so badges can reuse that exact same live-preview
  // widget — drag, resize, rotate and remove handles included — instead of a
  // second, simpler canvas implementation.
  const badgeLogoLayersRecord: Record<Side, PreviewLayer[]> = {
    front: badgeLogoLayer ? [badgeLogoLayer] : [],
    back: [], right: [], left: [],
  };
  const setBadgeLogoLayersRecord: React.Dispatch<React.SetStateAction<Record<Side, PreviewLayer[]>>> = (updater) => {
    const next = typeof updater === "function"
      ? (updater as (p: Record<Side, PreviewLayer[]>) => Record<Side, PreviewLayer[]>)(badgeLogoLayersRecord)
      : updater;
    const frontLayer = next.front[0] ?? null;
    if (!frontLayer) {
      handleBadgeLogoChange(null);
    } else {
      setBadgeLogoLayer(frontLayer);
    }
  };

  const handleBadgeLogoChange = (file: File | null) => {
    if (!file) {
      setBadgeLogoFile(null);
      setBadgeLogoPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
      setBadgeLogoUploadedUrl(null);
      setBadgeLogoLayer(null);
      return;
    }
    setBadgeLogoFile(file);
    setBadgeLogoPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file); });
    setBadgeLogoUploadedUrl(null);
    setBadgeLogoLayer({ id: "badge-front-logo", pos: { x: 50, y: 50 }, scale: 1, rotation: 0 });
    setBadgePendingBgConfirm(file);
  };

  // Uploads the FINAL logo file to /api/upload-logo, storing the real,
  // server-hosted URL — badgeLogoPreview's blob: URL never leaves the
  // browser, so THIS is what actually gets sent when placing the order.
  const uploadBadgeLogoToServer = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("side", "front");
      const res = await fetch("/api/upload-logo", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Logo upload failed");
      const { url } = (await res.json()) as { url: string };
      setBadgeLogoUploadedUrl(url);
    } catch {
      setBadgeLogoUploadedUrl(null);
    }
  };

  const runBadgeBackgroundRemoval = async (file: File) => {
    setBadgeLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/remove-bg", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Background removal failed");
      const blob = await res.blob();
      const cleanedFile = new File([blob], file.name.replace(/\.[^.]+$/, "") + "-nobg.png", { type: "image/png" });
      const cleanedUrl = URL.createObjectURL(blob);
      setBadgeLogoFile(cleanedFile);
      setBadgeLogoPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return cleanedUrl; });
      await uploadBadgeLogoToServer(cleanedFile);
    } catch {
      await uploadBadgeLogoToServer(file);
    } finally {
      setBadgeLogoUploading(false);
    }
  };

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

  // On style-picker pages, images/thumbnails/live-preview should reflect
  // whichever STYLE + COLOR the user picked, not the originally-loaded product.
  const effectiveMediaProduct = product.isStylePicker ? selectedStyleProduct : product;
  const effectiveMediaColor = product.isStylePicker ? selectedStyleColor : selectedColor;

  const media = overrideMedia
    ?? (overrideImage ? [{ type: "image" as const, src: overrideImage }] : resolveMedia(effectiveMediaProduct, effectiveMediaColor, selectedSize, selectedGsm?.value ?? selectedVariantGsm ?? null, selectedSizeOption));
  const blankMedia = resolveBlankMedia(effectiveMediaProduct, effectiveMediaColor, selectedSize, selectedGsm?.value ?? selectedVariantGsm ?? null);

  useEffect(() => { setActiveImg(0); }, [selectedColor, selectedSize, selectedGsm, selectedVariantGsm, selectedSizeOption, selectedStyleSlug, selectedStyleColor, overrideMedia]);

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

const totalAllocated = Object.values(sizeQuantities).reduce((a, b) => a + b, 0);
const sizeAllocationComplete = !product.sizes || totalAllocated === numQty;

  // A size can carry its own price via `sizeDetails` in the .ts data (e.g.
  // an 18x20 bag costing more than a 12x14); a `simpleVariantPicker`
  // product's selected GSM tier can too (via `gsmOptions[].price`); and a
  // `cardVariantPicker` product's selected `sizeOptions` entry AND its GSM
  // tier can both carry prices — the GSM tier wins when it sets one (e.g.
  // "upgrade to premium fabric"), otherwise the chosen size's own price
  // applies. Falls back to the product's flat displayPrice when nothing
  // else applies.
  const selectedSizeOptionObj = product.sizeOptions?.find((s) => s.id === selectedSizeOption) ?? null;
  // True for products that already had their size (and only color) locked in
  // via the /sizes page — same condition used to hide "2. Choose Color"
  // above. Quantity/Delivery step numbers shift down by one for these,
  // since there's no "2." step in between anymore.
  const colorStepHidden = Boolean(
    product.isDefaultCategory && !product.isBasicPremiumCategory &&
    !product.simpleVariantPicker && !product.cardVariantPicker && product.sizes
  );
  // The "2. Fabric/GSM" section is intentionally disabled (kept as `false`
  // rather than deleted, so it's easy to re-enable later) — the size-grid
  // page now shows a separate card per size+GSM combo, so the GSM choice is
  // already locked in by the time the shopper lands here. Showing a GSM
  // picker again would just be asking the same question twice.
  const showSizeGsmSection = false;
  // True when Customized Tote Bag (cardVariantPicker) arrived here already
  // knowing its color — e.g. clicked through from Natural/Black Canvas Tote
  // Bag's /sizes page cross-sell card, which passes ?color= along. When
  // true, "2. Choose Color" is skipped entirely (not just filtered to one
  // card) and every step after it renumbers down by one.
  const lockedCardColor = product.cardVariantPicker && colorFromUrl
    ? product.colors?.find((c) => c.label.toLowerCase() === colorFromUrl.toLowerCase())
    : undefined;
  const cardColorLocked = Boolean(lockedCardColor);
  const effectiveBasePrice = product.cardVariantPicker
    ? selectedGsm?.price ?? selectedSizeOptionObj?.price ?? product.displayPrice
    : product.simpleVariantPicker
    ? selectedGsm?.price ?? product.displayPrice
    : selectedSize && selectedVariantGsm != null
    ? product.sizeDetails?.[selectedSize]?.gsmVariants?.[selectedVariantGsm]?.price ?? product.displayPrice
    : product.displayPrice;

  const { pricePerUnit, sameDayCharge: staticSameDayCharge } = computeOrderTotal({
    displayPrice: effectiveBasePrice,
    quantity: numQty,
    deliveryType,
  });

  // Same-day delivery is never charged up front — it's negotiated by phone
  // after the order is placed (the DeliverySelector banner right below
  // literally tells the customer "Nothing is charged for delivery right
  // now — our team will call you..."). This comment used to say "Matches
  // polo" but didn't actually match: it left `effectiveSameDayCharge` equal
  // to computeOrderTotal's raw SAME_DAY_SURCHARGE-per-unit figure, so
  // choosing Same Day silently added ₹{SAME_DAY_SURCHARGE}/unit to both the
  // price shown on this page AND to Add to Cart/Buy Now — directly
  // contradicting the banner's own promise, and inconsistent with polo,
  // tote-bag and every other product page, which all force this to 0.
  // Standard and Self Pickup are unaffected — computeOrderTotal already
  // returns 0 for both.
  const effectiveSameDayCharge = deliveryType === "sameday" ? 0 : staticSameDayCharge;

  // Badges only ever have ONE logo slot ("front") — badgeLogoUploadedUrl is
  // the real, server-hosted URL the customer's upload actually lands in
  // (see handleBadgeLogoChange/uploadBadgeLogoToServer above; OrderModal's
  // own Buy Now flow already reads from this same state further down).
  // `logoUploadedUrls`/`logoLayers` referenced below are a leftover
  // multi-side (front/back/left/right) state copied from the apparel
  // template — handleLogoChange only ever populates it for the "reference"
  // attachment slot, never for an actual side, so it stays empty forever.
  // That was silently zeroing out both the embroidery/DTF charge computed
  // here AND whatever "Add to Cart" sent to the database. Using the real
  // badge state for both fixes them together.
  const cartLogoUploadedUrls: Record<Side, string | null> = {
    front: badgeLogoUploadedUrl, back: null, right: null, left: null,
  };
  const activeLogoSides: Side[] = badgeLogoUploadedUrl ? ["front"] : [];
  const embroideryCharge = printType === "embroidery" ? computeEmbroideryCharge(numQty, activeLogoSides) : 0;
  const dtfCharge = printType === "dtf" ? computeDtfCharge(numQty, activeLogoSides) : 0;
  const printCharge = embroideryCharge + dtfCharge;
  const totalPrice = pricePerUnit * numQty + effectiveSameDayCharge + printCharge;
  const discountPct = getDiscountForQty(numQty);
  const activeOffer = product.offer ?? DEFAULT_OFFER;

const handleAddToCart = () => {
    const embroideryAutoNote = printType === "embroidery" ? getEmbroideryAutoNote(numQty, activeLogoSides) : null;
    const dtfAutoNote = printType === "dtf" ? getDtfAutoNote(numQty, activeLogoSides) : null;
    const combinedNote = [embroideryAutoNote ?? dtfAutoNote, customizationNote?.trim() || null].filter(Boolean).join("\n");

    // Assemble the same logoDesign/logoUrls shape the Buy Now flow sends to
    // create-razorpay-order (see OrderModal's handleRazorpay above), so a
    // logo designed here survives all the way to the database when the
    // shopper chooses "Add to Cart" instead of paying immediately.
    //
    // Reads from badgeLogoLayersRecord/cartLogoUploadedUrls (the real
    // single-slot badge upload state) — NOT logoLayers/logoUploadedUrls,
    // which nothing on this page ever actually writes a side into (see the
    // comment above activeLogoSides).
    const cartSides: Side[] = ["front", "back", "right", "left"];
    const cartLogoDesign: Record<string, { url: string; layers: { x: number; y: number; scale: number; rotation: number }[] }> = {};
    for (const side of cartSides) {
      const url = cartLogoUploadedUrls[side];
      const layers = badgeLogoLayersRecord[side];
      if (!url || !layers || layers.length === 0) continue;
      cartLogoDesign[side] = {
        url,
        layers: layers.map((l) => ({ x: l.pos.x, y: l.pos.y, scale: l.scale, rotation: l.rotation })),
      };
    }
    const cartHasLogoDesign = Object.keys(cartLogoDesign).length > 0;
    const cartResolvedLogoUrls: Partial<Record<Side, string>> = {};
    for (const side of cartSides) {
      const url = cartLogoUploadedUrls[side];
      if (url) cartResolvedLogoUrls[side] = url;
    }
    const badgeStyleSlug = product.isStylePicker ? selectedStyleSlug : undefined;
    const cartCustomization =
      cartHasLogoDesign || Object.keys(cartResolvedLogoUrls).length || printType || fabricType || combinedNote || badgeStyleSlug
        ? {
            note: combinedNote || undefined,
            printType: printType || undefined,
            fabricType: fabricType || undefined,
            logoUrls: Object.keys(cartResolvedLogoUrls).length ? cartResolvedLogoUrls : undefined,
            logoDesign: cartHasLogoDesign ? cartLogoDesign : undefined,
            badgeStyleSlug: badgeStyleSlug || undefined,
          }
        : undefined;

    addToCart({
      productId: product.id, productSlug: product.slug, productName: product.name,
      productImage: media[activeImg]?.src || media[0]?.src || product.images[0],
      quantity: numQty,
      size: product.cardVariantPicker
        ? [selectedSizeOptionObj?.label, selectedGsm ? `${selectedGsm.value} GSM` : null].filter(Boolean).join(" — ") || null
        : product.simpleVariantPicker
        ? (selectedGsm ? `${selectedGsm.value} GSM` : null)
        : selectedSize
        ? [selectedSize, selectedVariantGsm ? `${selectedVariantGsm} GSM` : null].filter(Boolean).join(" — ")
        : null,
      sizeBreakdown: undefined,
      color: selectedColor, deliveryType,
      pricePerUnit, sameDayCharge: effectiveSameDayCharge,
      embroideryCharge: embroideryCharge || undefined,
      dtfCharge: dtfCharge || undefined,
      lineTotal: totalPrice, addedAt: Date.now(),
      customizationNote: combinedNote || undefined,
      customization: cartCustomization,
    });
    setToast("Added to cart!");
  };

 const handleCheckoutNow = () => {
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

            {/* {selectedSize && (
              <div
                className="relative inline-flex items-center gap-1.5 px-3.5 py-2 text-sm text-purple-700 bg-gradient-to-r from-purple-100 via-purple-50 to-white"
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
                <span className="font-semibold">
                  Size: {product.sizeDetails?.[selectedSize]?.dimension ?? selectedSize}
                </span>
                {(selectedVariantGsm ?? product.gsm) && (
                  <span className="text-purple-500">
                    · {selectedVariantGsm ?? product.gsm} GSM
                  </span>
                )}
                <Link
                  href={`/products/badge-collection`}
                  className="font-bold underline hover:text-purple-900 ml-0.5"
                >
                  Change
                </Link>
              </div>
            )} */}

              {/* "Get it for as low as" — hidden for products reached via
                  the /sizes page (Natural/Black Canvas Tote Bag): the
                  size+GSM combo is already locked in by that point, so this
                  banner (meant to entice exploring cheaper tiers) doesn't
                  apply the same way it does for products still choosing. */}
              {!colorStepHidden && (
                <PriceOfferModal pricePerUnit={pricePerUnit} originalPrice={product.originalPrice} offer={activeOffer} />
              )}
            </div>

            {numQty >= 25 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800 flex items-start gap-2">
                <svg className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Bulk deal active! <strong>{discountPct}% off</strong> at {numQty} pcs → {formatPrice(pricePerUnit)}/pc</span>
              </div>
            )}

            {/* ══════════ BADGE-SPECIFIC RIGHT COLUMN ══════════
                Replaces tote-bag's Choose Color / Fabric-GSM / Customized
                cards / Choose Size cards with a simple, fixed sequence:
                Size -> Upload Your Logo -> Quantity -> Delivery. All four
                steps now reuse the SAME building blocks already used
                elsewhere on this page — GsmOptionCard-style selection cards,
                LogoUploadCard, the note textarea, LivePreviewCanvas, and
                QuantitySelector/DeliverySelector — just wired up for a
                single-side, no-printType-choice product instead of a full
                fabricType/printType (DTF vs embroidery) apparel flow. */}

            {/* 0. Choose Badge Type — only on the generic "Customized Badges"
                product (isStylePicker: true in the data). Picking a card just
                swaps selectedStyleSlug, which the image gallery and the logo
                live-preview below both already read via `isStylePicker ?
                selectedStyleProduct : product` — no navigation needed. */}
            {showBadgeStylePicker && badgeStyleOptions.length > 0 && (
              <div>
                <span className="text-sm font-bold text-[#000] uppercase tracking-wide mb-3 block">1. Choose Badge Type</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {badgeStyleOptions.slice(0, 3).map((styleProduct) => (
                    <BadgeStylePickerCard
                      key={styleProduct.slug}
                      product={styleProduct}
                      isSelected={selectedStyleSlug === styleProduct.slug}
                      onSelect={() => handleSelectStyle(styleProduct.slug)}
                    />
                  ))}
                  {badgeStyleOptions.length > 3 && (
                    <button
                      onClick={() => setShowBadgeTypeModal(true)}
                      className="rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600 transition-all"
                    >
                      <span className="text-2xl font-bold">+{badgeStyleOptions.length - 3}</span>
                      <span className="text-sm font-medium">More</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {showBadgeTypeModal && (
              <BadgeTypeModal
                options={badgeStyleOptions}
                selectedSlug={selectedStyleSlug}
                onSelect={handleSelectStyle}
                onClose={() => setShowBadgeTypeModal(false)}
              />
            )}

            {/* 1. Select Size — on a style-picker product (e.g. "Customized
                Badges"), sizes come from whichever badge type is currently
                selected above, not from this page's own product. */}
            {(() => {
              const sizeSourceProduct = product.isStylePicker ? selectedStyleProduct : product;
              const activeSizes = sizeSourceProduct.sizes ?? [];
              if (activeSizes.length === 0) return null;
              return (
                <div>
                  <span className="text-sm font-bold text-[#000] uppercase tracking-wide block">{1 + badgeStepOffset}. Select Size</span>
                  {/* <span className="text-[12px] text-gray-500 block mb-3">Choose the ideal size for your badge</span> */}
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-4">
                        <div className={`grid gap-3 ${activeSizes.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                      {activeSizes.map((size, idx) => (
                        <BadgeSizeOptionCard
                          key={size}
                          size={size}
                          index={idx}
                          isSelected={selectedSize === size}
                          onSelect={() => setSelectedSize(size)}
                          shape={sizeSourceProduct.sizeCardShape}
                        />
                      ))}
                    </div>
                    {product.logoUploadEnabled && (
                      <BadgeCustomizedPromoCard
                        categoryLabel={(product.category || "product").toLowerCase()}
                        onClick={() => badgeLogoSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                        previewImage={sizeSourceProduct.customizedPreviewImage}
                      />
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 2. Upload Your Logo — reuses the same LogoUploadCard (upload
                dropzone) and note-textarea markup as the apparel
                LogoUploadSection above, plus the exact same LivePreviewCanvas
                (Live badge, side label, drag/resize/rotate/remove handles)
                instead of the old single-purpose BadgePreviewCanvas, so the
                badge flow looks and behaves like the rest of the site. */}
            {product.logoUploadEnabled && (
              <div ref={badgeLogoSectionRef}>
                <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-3 flex-nowrap">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-green-600"></span>
                    </span>
                    <span className="text-sm font-bold text-[#000] uppercase tracking-wide whitespace-nowrap">{2 + badgeStepOffset}. Upload Your Logo</span>
                    <span className="bg-green-100 text-green-600 text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap flex-shrink-0">
                      Customized
                    </span>
                  </div>
                </div>

                <div className="badge-logo-grid gap-4">
                  <div className="badge-logo-left flex flex-col gap-4 min-w-0">
                    <span className="text-[12px] font-semibold text-gray-700 block">
                      Add your logo and customize your {(product.category || "product").toLowerCase()}
                    </span>

                    <LogoUploadCard
                      label="Front Logo"
                      file={badgeLogoFile}
                      preview={badgeLogoPreview}
                      uploading={badgeLogoUploading}
                      inputRef={badgeLogoInputRef}
                      onChange={handleBadgeLogoChange}
                      icon={() => <BadgeUploadIcon src={(product.isStylePicker ? selectedStyleProduct : product).uploadIcon} />}
                      onActiveSideChange={() => {}}
                    />

                    <div className="w-full flex flex-col border-2 lg:flex-1 border-dashed border-gray-300 rounded-xl p-2.5 min-w-0" style={{ minHeight: 100 }}>
                      <label className="text-[10px] font-semibold text-gray-600 mb-1.5 leading-tight">
                        Any Text or Customization <span className="font-normal text-gray-400">(Optional)</span>
                      </label>
                      <textarea
                        value={customizationNote}
                        onChange={(e) => setCustomizationNote(e.target.value)}
                        placeholder={`E.g. Add "Team Alpha" text, gold thread embroidery, etc.`}
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
                              <button type="button" onClick={() => handleLogoChange(null, "reference")} className="text-gray-400 hover:text-red-600 flex-shrink-0" title="Remove attachment">✕</button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-0 flex-shrink-0">
                          <span className="text-[12px] text-gray-400">{customizationNote.length}/500</span>
                          <input
                            type="file" accept="image/*,application/pdf" className="hidden" id="badge-reference-doc"
                            onChange={(e) => { handleLogoChange(e.target.files?.[0] ?? null, "reference"); e.target.value = ""; }}
                          />
                          <input
                            type="file" accept="image/*,video/*" capture="environment" className="hidden" id="badge-reference-cam"
                            onChange={(e) => { handleLogoChange(e.target.files?.[0] ?? null, "reference"); e.target.value = ""; }}
                          />
                          <button type="button" onClick={() => document.getElementById("badge-reference-doc")?.click()} title="Attach a reference document or image" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 relative overflow-hidden">
                            <Image src="/doc.webp" alt="Attach document" fill className="object-contain" />
                          </button>
                          <button type="button" onClick={() => document.getElementById("badge-reference-cam")?.click()} title="Attach a reference photo or video" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 relative overflow-hidden">
                            <Image src="/cam.webp" alt="Attach photo" fill className="object-contain" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="badge-logo-preview flex flex-col min-w-0">
                    <LivePreviewCanvas
                      side="front"
                      onSideChange={() => {}}
                      imageSrcFront={blankMedia[0]?.src || media[0]?.src || product.images[0]}
                      logoSrcs={{ front: badgeLogoPreview }}
                      logoLayers={badgeLogoLayersRecord}
                      setLogoLayers={setBadgeLogoLayersRecord}
                      onLogoRemove={() => handleBadgeLogoChange(null)}
                      enabledLogoSides={["front"]}
                    />
                  </div>
                </div>

                <style jsx>{`
                  .badge-logo-grid { display: flex; flex-direction: column; }
                  @media (min-width: 1024px) {
                    .badge-logo-grid { flex-direction: row; align-items: stretch; }
                    .badge-logo-left { flex: 1 1 0%; }
                    .badge-logo-preview { flex: 0 0 45%; }
                  }
                `}</style>
              </div>
            )}

            {/* 3. Quantity */}
            <QuantitySelector
              displayPrice={product.displayPrice}
              quantity={numQty}
              setQuantity={setQuantity}
              stepNumber={3 + badgeStepOffset}
            />

            {/* 4. Delivery Speed */}
            {colorSameDayAvailable ? (
              <DeliverySelector
                selected={deliveryType}
                onSelect={setDeliveryType}
                sameDayTurnaround={product.sameDayTurnaround}
                sameDayAvailable={colorSameDayAvailable}
                pickupAddress={PICKUP_ADDRESS}
                stepNumber={4 + badgeStepOffset}
              />
            ) : (
              <div>
                <span className="text-sm font-bold text-[#000] uppercase tracking-wide mb-3 block">{4 + badgeStepOffset}. Delivery</span>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="font-semibold">Standard Delivery</div>
                  <div className="text-xs text-gray-500 mt-0.5">{product.turnaround ?? "5-7 business days"} · Free Shipping</div>
                </div>
              </div>
            )}

            {badgePendingBgConfirm && (
              <RemoveBgConfirmModal
                onKeepOriginal={() => {
                  const file = badgePendingBgConfirm;
                  setBadgePendingBgConfirm(null);
                  setBadgeLogoUploading(true);
                  uploadBadgeLogoToServer(file).finally(() => setBadgeLogoUploading(false));
                }}
                onRemoveBg={() => {
                  const file = badgePendingBgConfirm;
                  setBadgePendingBgConfirm(null);
                  runBadgeBackgroundRemoval(file);
                }}
              />
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
      <PopularSearches
  items={[
    { label: "Pin Back Badges", href: "/products/badge-collection/" },
    { label: "Fridge Magnet Badges", href: "/products/badge-collection/" },
    { label: "Rectangle Badges", href: "/products/badge-collection/" },
    { label: "Shirt Magnet Badges", href: "/products/badge-collection/" },
  
    // as many as you want, product-specific
  ]}
/>

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
    selectedSize={
      product.cardVariantPicker
        ? [selectedSizeOptionObj?.label, selectedGsm ? `${selectedGsm.value} GSM` : null].filter(Boolean).join(" — ") || null
        : product.simpleVariantPicker
        ? (selectedGsm ? `${selectedGsm.value} GSM` : null)
        : selectedSize
        ? [selectedSize, selectedVariantGsm ? `${selectedVariantGsm} GSM` : null].filter(Boolean).join(" — ")
        : null
    }
    selectedColor={product.isStylePicker ? selectedStyleColor : selectedColor}
    loggedInUser={loggedInUser}
    logoLayers={{ front: badgeLogoLayer ? [badgeLogoLayer] : [], back: [], right: [], left: [] }}
    logoUploadedUrls={{ front: badgeLogoUploadedUrl, back: null, right: null, left: null }}
    customizationNote={customizationNote}
    badgeStyleSlug={product.isStylePicker ? selectedStyleSlug : undefined}
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