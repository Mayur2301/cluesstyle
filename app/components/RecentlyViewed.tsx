"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  href: string;
  text: string;
  timestamp: string;
  image: string | null;
}

export default function RecentlyViewed() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const AUTOPLAY_INTERVAL = 3000;

  useEffect(() => {
    fetch("/api/recently-viewed")
      .then((res) => res.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  // Auto-advance the mobile carousel every few seconds.
  const startAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    if (products.length <= 1) return;
    autoplayRef.current = setInterval(() => {
      setActiveIndex((i) => (i === products.length - 1 ? 0 : i + 1));
    }, AUTOPLAY_INTERVAL);
  };

  useEffect(() => {
    startAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  if (!products.length) return null;

  // Manual navigation resets the autoplay timer so it doesn't jump right
  // after the user just interacted with it.
  const goPrev = () => {
    setActiveIndex((i) => (i === 0 ? products.length - 1 : i - 1));
    startAutoplay();
  };
  const goNext = () => {
    setActiveIndex((i) => (i === products.length - 1 ? 0 : i + 1));
    startAutoplay();
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Link href={product.href} className="group block">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

        {/* Product Image */}
        <div className="relative aspect-[4/5] bg-white overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={cleanTitle(product.text)}
              fill
              className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              No Image
            </div>
          )}

          {/* Recently Viewed Badge */}
          <div className="absolute top-3 left-3">
            <span className="rounded-md bg-black text-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide">
              Viewed
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="h-10 line-clamp-2 text-sm font-semibold text-gray-900 overflow-hidden">
            {product.text}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Recently Viewed
            </span>

            <span className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <section className="py-2">
      <div className="max-w-[1500px] mx-auto px-5">
        <div className="mb-10 flex items-center gap-3">
          <img
            src="https://cdn.cluesstyle.com/public/gold-arrow.png"
            alt="arrow"
            className="w-8 h-8"
          />
          <h2 className="text-3xl font-semibold md:text-4xl">
            Recently Viewed
          </h2>
        </div>

        {/* Mobile: single centered card with side arrows */}
        <div className="md:hidden flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous"
            className="w-9 h-9 shrink-0 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 active:scale-95 transition-transform"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <div className="w-[70%] max-w-[280px]">
            <ProductCard product={products[activeIndex]} />
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next"
            className="w-9 h-9 shrink-0 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 active:scale-95 transition-transform"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Mobile: dot indicators */}
        <div className="md:hidden flex justify-center items-center gap-1.5 mt-4">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActiveIndex(i); startAutoplay(); }}
              aria-label={`Go to item ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                activeIndex === i ? "bg-gray-900 w-5" : "bg-gray-300 w-1.5"
              }`}
            />
          ))}
        </div>

        {/* md and up: original grid */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
        </div>
      </div>
      <br /><br />
    </section>
  );
}

function cleanTitle(text: string) {
  return text
    .replace(/Min qty:.*/gi, "")
    .replace(/Shop Now/gi, "")
    .replace(/₹\d+/g, "")
    .trim();
}