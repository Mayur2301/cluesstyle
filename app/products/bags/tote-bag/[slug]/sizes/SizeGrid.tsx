"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { productsData, type Product } from "@/app/lib/tote-bag-collection";
import { resolveToteVariantPrice } from "@/app/lib/tote-bag-pricing";

// Pulls a representative image for a given color (or the product default) —
// same fallback chain used on the main listing grid, since `images[]` is
// unused in the real data.
function getProductImage(product: Product, colorLabel: string | null): string {
  const colorObj = product.colors?.find((c) => c.label === colorLabel);
  return (
    colorObj?.media?.[0]?.src ??
    product.media?.[0]?.src ??
    product.colors?.[0]?.media?.[0]?.src ??
    product.colors?.[0]?.blankMedia?.[0]?.src ??
    "/placeholder-product.png"
  );
}

// ================== SIDEBAR CONTENT (shared, desktop + mobile) ==================
function SidebarContent({
  product,
  selectedColor,
  setSelectedColor,
  onLinkClick,
}: {
  product: Product;
  selectedColor: string | null;
  setSelectedColor: (label: string) => void;
  onLinkClick?: () => void;
}) {
  const colors = product.colors ?? [];

  return (
    <div className="px-5 py-6">
      {/* Color picker — the meaningful "filter" on this page, since size is
          the grid itself. Choosing a color here updates the preview image
          and carries through to the size links below. */}
      {colors.length > 1 && (
        <div className="mb-7">
          <h2 className="inline-block border-b-2 border-black pb-1 text-base font-black tracking-tight mb-4">
            Choose Color
          </h2>
          <div className="flex flex-col gap-2">
            {colors.map((color) => (
              <button
                key={color.label}
                onClick={() => { setSelectedColor(color.label); onLinkClick?.(); }}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all
                  ${selectedColor === color.label
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white hover:border-black"
                  }`}
              >
                <span
                  className="h-5 w-5 flex-shrink-0 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.hex }}
                />
                {color.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product info — static, mirrors the sidebar's "filters" real estate
          on the main listing page with details relevant to a single product. */}
      {product.features && product.features.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold">
            <i className="fas fa-check-circle text-sm"></i> Features
          </h3>
          <div className="flex flex-col gap-2">
            {product.features.map((feature) => (
              <div
                key={feature}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      )}

      {product.material && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
          <span className="font-semibold text-gray-800">Material: </span>
          <span className="text-gray-600">{product.material}</span>
        </div>
      )}

      {product.turnaround && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
          <span className="font-semibold text-gray-800">Turnaround: </span>
          <span className="text-gray-600">{product.turnaround}</span>
        </div>
      )}
    </div>
  );
}

export default function SizeGrid({ slug }: { slug: string }) {
  const product = productsData.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const sizes = product.sizes ?? [];

  // One card per size+GSM combo that actually exists — a size with both 150
  // and 330 GSM gets two cards; a size with only one (or no gsmVariants at
  // all) just gets one.
  type SizeGsmEntry = { size: string; gsm: number | null };
  const sizeGsmEntries: SizeGsmEntry[] = sizes.flatMap((size): SizeGsmEntry[] => {
    const variants = product.sizeDetails?.[size]?.gsmVariants;
    const gsmKeys = variants ? Object.keys(variants).map(Number).sort((a, b) => a - b) : [];
    if (gsmKeys.length === 0) return [{ size, gsm: null }];
    return gsmKeys.map((gsm) => ({ size, gsm }));
  });

  // Cross-sell cards — shown alongside the size options so a shopper who
  // landed here (e.g. via "Natural Tote Bag") can also jump straight to the
  // Sample Kit or Customized Tote Bag WITHOUT losing the color they were
  // already looking at. Since Natural/Black Canvas Tote Bag are each a
  // single-color product, that color is just this product's own
  // `colors[0].label`. Hardcoded to these two known slugs — update here if
  // more cross-sell products are ever added.
  const currentColorLabel = product.colors?.[0]?.label ?? null;
  const crossSellSlugs = ["tote-bag-sample-kit", "customized-tote-bag"];
  const crossSellProducts = crossSellSlugs
    .map((s) => productsData.find((p) => p.slug === s))
    .filter((p): p is Product => Boolean(p));
  const crossSellHref = (crossSellSlug: string) => {
    const qs = new URLSearchParams();
    if (currentColorLabel) qs.set("color", currentColorLabel);
    const query = qs.toString();
    return `/products/bags/tote-bag/${crossSellSlug}${query ? `?${query}` : ""}`;
  };

  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors?.[0]?.label ?? null
  );

  // Fetched ONCE here (not per-card) since every SizeCard on this page is
  // the same product (just a different size/GSM) — no point re-fetching
  // identical data for every card. Matches the same API/shape used on the
  // product detail page.
  const [reviewSummary, setReviewSummary] = useState<{ average: number; total: number }>({ average: 0, total: 0 });
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

  // Desktop sidebar drawer (mobile only, mirrors tote-bag.tsx)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Mobile filter modal (bottom sheet)
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
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (isSidebarOpen || isFilterModalOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isSidebarOpen, isFilterModalOpen]);

  const image = getProductImage(product, selectedColor);
  const hasColorFilter = (product.colors?.length ?? 0) > 1;

  const sidebarProps = { product, selectedColor, setSelectedColor: (l: string) => setSelectedColor(l) };

  const sizeHref = (size: string, gsm: number | null) => {
    const qs = new URLSearchParams({ size });
    if (gsm != null) qs.set("gsm", String(gsm));
    if (selectedColor) qs.set("color", selectedColor);
    return `/products/bags/tote-bag/${slug}?${qs.toString()}`;
  };

  return (
    <>
      {/* ══════════════════════════════════════════════
          MOBILE: overlay + drawer (matches tote-bag.tsx)
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
          <h2 className="text-base font-black tracking-tight">Options</h2>
          <button
            onClick={() => setIsFilterModalOpen(false)}
            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 text-sm font-bold"
            aria-label="Close options"
          >✕</button>
        </div>
        <SidebarContent {...sidebarProps} onLinkClick={() => setIsFilterModalOpen(false)} />
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4">
          <button
            onClick={() => setIsFilterModalOpen(false)}
            className="w-full rounded-2xl bg-black py-3.5 text-sm font-bold text-white transition hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          DESKTOP LAYOUT — left sidebar (pinned, doesn't scroll) + right content
      ══════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex bg-gray-50"
        style={{ minHeight: `calc(100vh - ${headerHeight}px)` }}
      >
        {/* `self-start` stops the flex row from stretching this to match the
            main column's height, and `sticky` + `top` pins it under the
            header as the page scrolls. `overflow-y-auto` + `maxHeight` are
            just a safety net if the sidebar's own content is ever taller
            than the viewport. */}
        <aside
          className="w-[280px] flex-shrink-0 self-start sticky border-r border-gray-200 bg-white overflow-y-auto no-scrollbar"
          style={{ top: headerHeight, maxHeight: `calc(100vh - ${headerHeight}px)` }}
        >
          <SidebarContent {...sidebarProps} />
        </aside>

        <main className="flex-1 min-w-0">
          <div className="p-6 lg:p-8">
            {/* Hero */}
            <div className="mb-8 overflow-hidden rounded-3xl border-2 border-black bg-white shadow-[6px_6px_0px_#000]">
              <div className="grid min-h-[320px] grid-cols-1 lg:grid-cols-2">
                <div className="flex flex-col justify-center p-6 md:p-10">
                  <div className="mb-3 inline-flex w-fit items-center rounded-full border border-black bg-black px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    {product.category || "Tote Bag"}
                  </div>
                  <h1 className="text-3xl font-black leading-tight tracking-tight md:text-4xl">
                    Choose a Size <br />
                    <span className="text-gray-500">{product.name}</span>
                  </h1>
                  {product.description && (
                    <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="transition-colors hover:text-black">Home</Link>
                    <span>/</span>
                    <Link href="/products/bags/tote-bag" className="transition-colors hover:text-black">
                      Tote Bags
                    </Link>
                    <span>/</span>
                    <span className="font-semibold text-black">{product.name}</span>
                  </div>
                </div>
                <div className="relative min-h-[450px] overflow-hidden bg-gray-100">
                  <Image src="/tote-bag-collection/customize2-Photoroom.png" alt={product.name} fill className="object-contain p-2" />
                </div>
              </div>
            </div>

            {/* Count row */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm font-medium">
                {sizeGsmEntries.length} option{sizeGsmEntries.length !== 1 ? "s" : ""} available
              </span>
              <div className="text-xs text-gray-500">
                <i className="fas fa-check-circle text-green-600"></i> authentic prints · eco-friendly
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {crossSellProducts.map((csProduct) => (
                <CrossSellCard key={csProduct.slug} product={csProduct} href={crossSellHref(csProduct.slug)} />
              ))}
              {sizeGsmEntries.map(({ size, gsm }) => (
                <SizeCard key={`${size}-${gsm}`} size={size} gsm={gsm} product={product} image={image} href={sizeHref(size, gsm)} reviewSummary={reviewSummary} />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* ══════════════════════════════════════════════
          MOBILE LAYOUT
      ══════════════════════════════════════════════ */}
      <div className="lg:hidden min-h-screen bg-gray-50">
        <div className="px-5 py-6 border-b border-gray-200 bg-white">
          <div className="mb-2 inline-flex w-fit items-center rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {product.category || "Tote Bag"}
          </div>
          <h1 className="text-2xl font-black leading-tight">
            Choose a Size <br />
            <span className="text-gray-500">{product.name}</span>
          </h1>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/products/bags/tote-bag">Tote Bags</Link>
            <span>/</span>
            <span className="font-semibold text-black">{product.name}</span>
          </div>
        </div>

        {/* Sticky options bar */}
        {hasColorFilter && (
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              Color: {selectedColor}
            </span>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl border-2 border-black bg-black text-white text-xs font-bold transition active:scale-95"
            >
              Change Color
            </button>
          </div>
        )}

        <div className="px-3 py-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">
            {sizeGsmEntries.length} option{sizeGsmEntries.length !== 1 ? "s" : ""} available
          </span>
        </div>

        <div className="px-3 pb-8 grid grid-cols-2 gap-3">
          {crossSellProducts.map((csProduct) => (
            <CrossSellCard key={csProduct.slug} product={csProduct} href={crossSellHref(csProduct.slug)} compact />
          ))}
          {sizeGsmEntries.map(({ size, gsm }) => (
            <SizeCard key={`${size}-${gsm}`} size={size} gsm={gsm} product={product} image={image} href={sizeHref(size, gsm)} reviewSummary={reviewSummary} compact />
          ))}
        </div>
      </div>
    </>
  );
}

// ================== SIZE CARD ==================
function SizeCard({
  size,
  gsm,
  product,
  image,
  href,
  compact,
  reviewSummary,
}: {
  size: string;
  gsm: number | null;
  product: Product;
  image: string;
  href: string;
  compact?: boolean;
  reviewSummary?: { average: number; total: number };
}) {
  // A size can override the product's photo/price/dimension via
  // `sizeDetails` in the .ts data. `gsm` here is the SPECIFIC GSM this card
  // represents (passed in from the grid above, since a size can have more
  // than one) — falls back to the color-selected product image/displayPrice
  // if that exact GSM has no variant entry.
  const detail = product.sizeDetails?.[size];
  const variant = gsm != null ? detail?.gsmVariants?.[gsm] : undefined;
  const cardImage = variant?.image ?? image;
  // Same price table the product page and order APIs use (size + GSM), so the
  // card price always matches what the shopper sees after clicking. This is
  // the starting (Plain) price; Custom Print is chosen on the product page.
  const cardPrice =
    resolveToteVariantPrice(product.slug, { sizeKey: size, gsm, designMode: "plan" })?.sale ??
    variant?.price ??
    product.displayPrice;
  const cardLabel = detail?.dimension ?? size;
  const cardGsm = gsm ?? product.gsm;

  return (
    <Link href={href} className="group block h-full">
      <div className={`relative ${compact ? "h-68" : "h-[472px]"} w-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1`}>
        {product.badge && gsm === 330 && (
          <div className="absolute top-2 left-2 z-10 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold shadow-md">
            {product.badge}
          </div>
        )}
        {/* {cardGsm && (
          <div className="absolute top-2 right-2 z-10 rounded-full bg-gray-900/80 px-2 py-0.5 text-[10px] font-bold text-white">
            {cardGsm} GSM
          </div>
        )} */}
        <div className="relative h-full w-full">
          <Image src={cardImage} alt={`${product.name} — ${cardLabel}`} fill className="object-contain p-4" />
        </div>

        {/* Hover-reveal overlay — matches CrossSellCard/ProductCard's exactly */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
          <div className="bg-white/20 backdrop-blur-md border-t border-white/30 px-3 py-3">
            <h3 className="text-xs sm:text-sm font-bold text-black leading-snug line-clamp-1 drop-shadow">
              {cardLabel}
            </h3>
            <div className="mt-0.5 text-xs text-black/80 drop-shadow">
              ₹{cardPrice}{cardGsm ? ` · ${cardGsm} GSM` : ""}
            </div>
            <button className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-full bg-white py-1.5 text-xs font-bold text-gray-900 shadow-md transition hover:bg-black hover:text-white">
              <i className="fas fa-shopping-bag text-xs"></i>
              Select {cardLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Always-visible label/price section BELOW the card — matches
          CrossSellCard/ProductCard, so every card in this grid is the same
          total height regardless of type. */}
      <div className="mt-2 px-2">
        <span className="mt-0.5 block text-[13px] font-bold sm:text-[16px] text-[#000] line-clamp-2 min-h-[18px] sm:min-h-[20px] leading-tight">
          {cardLabel}
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-base sm:text-xl font-bold text-black">
            ₹{cardPrice}
          </span>
          {cardGsm && (
            <span className="text-xs sm:text-sm font-medium text-gray-500">
              {cardGsm} GSM
            </span>
          )}
        </div>
        {reviewSummary && reviewSummary.total > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 12 12" fill="none">
              <path fill="#FFD232" d="M5.58 1.15a.5.5 0 0 1 .84 0l1.528 2.363a.5.5 0 0 0 .291.212l2.72.722a.5.5 0 0 1 .26.799L9.442 7.429a.5.5 0 0 0-.111.343l.153 2.81a.5.5 0 0 1-.68.493L6.18 10.063a.5.5 0 0 0-.36 0l-2.625 1.014a.5.5 0 0 1-.68-.494l.153-2.81a.5.5 0 0 0-.11-.343L.781 5.246a.5.5 0 0 1 .26-.799l2.719-.722a.5.5 0 0 0 .291-.212L5.58 1.149Z" />
            </svg>
            <span className="font-semibold">{reviewSummary.average.toFixed(1)}</span>
            <span className="text-gray-300">|</span>
            <span>{reviewSummary.total} reviews</span>
          </div>
        )}
      </div>
    </Link>
  );
}

// ================== CROSS-SELL CARD ==================
// A card for a DIFFERENT product entirely (Sample Kit / Customized Tote
// Bag), shown alongside this product's own size options so a shopper can
// switch to one of those without losing the color they already had in
// mind. Visually matches SizeCard, with a small purple badge so it reads
// as "a different kind of option" rather than another size.
function CrossSellCard({
  product,
  href,
  compact,
}: {
  product: Product;
  href: string;
  compact?: boolean;
}) {
  const cardImage = product.media?.[0]?.src ?? product.colors?.[0]?.media?.[0]?.src ?? product.images[0];

  // Own fetch (not shared with SizeCard's) since each cross-sell card is a
  // genuinely different product — same API/shape as the product detail page.
  const [reviewSummary, setReviewSummary] = useState<{ average: number; total: number }>({ average: 0, total: 0 });
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

  return (
    <Link href={href} className="group block h-full">
      <div className={`relative ${compact ? "h-68" : "h-[472px]"} w-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1`}>
        {/* Small badge marking this as a different product, not a size — the
            main listing's ProductCard doesn't need this since every card
            there already IS a distinct product. */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20">
          <div className="rounded-full bg-purple-600 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-md">
            {product.slug === "tote-bag-sample-kit" ? "Sample Kit" : "Customized"}
          </div>
        </div>

        <div className="relative h-full w-full">
          <Image src={cardImage} alt={product.name} fill className="object-contain p-4" />
        </div>

        {/* Hover-reveal overlay — matches ProductCard's exactly */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
          <div className="bg-white/20 backdrop-blur-md border-t border-white/30 px-3 py-3">
            <h3 className="text-xs sm:text-sm font-bold text-black leading-snug line-clamp-1 drop-shadow">
              {product.name}
            </h3>
            <div className="mt-0.5 text-xs text-black/80 drop-shadow">
              Min qty: {product.quantityReq}+ · ₹{product.displayPrice}
            </div>
            <button className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-full bg-white py-1.5 text-xs font-bold text-gray-900 shadow-md transition hover:bg-black hover:text-white">
              <i className="fas fa-shopping-bag text-xs"></i>
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* Always-visible title/price section BELOW the card — matches
          ProductCard's own title section exactly, so both listing pages
          read as the same design language. */}
      <div className="mt-2 px-2">
        <span className="mt-0.5 block text-[13px] font-bold sm:text-[16px] text-[#000] line-clamp-2 min-h-[18px] sm:min-h-[20px] leading-tight">
          {product.name}
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-base sm:text-xl font-bold text-black">
            ₹{product.displayPrice}
          </span>
          {product.originalPrice > product.displayPrice && (
            <span className="text-xs sm:text-sm text-gray-400 line-through">
              ₹{product.originalPrice}
            </span>
          )}
          {product.discount && (
            <span className="text-xs sm:text-sm font-medium text-green-600">
              {Math.round(product.discount)}% OFF
            </span>
          )}
        </div>
        {reviewSummary.total > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 12 12" fill="none">
              <path fill="#FFD232" d="M5.58 1.15a.5.5 0 0 1 .84 0l1.528 2.363a.5.5 0 0 0 .291.212l2.72.722a.5.5 0 0 1 .26.799L9.442 7.429a.5.5 0 0 0-.111.343l.153 2.81a.5.5 0 0 1-.68.493L6.18 10.063a.5.5 0 0 0-.36 0l-2.625 1.014a.5.5 0 0 1-.68-.494l.153-2.81a.5.5 0 0 0-.11-.343L.781 5.246a.5.5 0 0 1 .26-.799l2.719-.722a.5.5 0 0 0 .291-.212L5.58 1.149Z" />
            </svg>
            <span className="font-semibold">{reviewSummary.average.toFixed(1)}</span>
            <span className="text-gray-300">|</span>
            <span>{reviewSummary.total} reviews</span>
          </div>
        )}
      </div>
    </Link>
  );
} 