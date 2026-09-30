"use client";
// CarouselControls.tsx
// Thin client island — only buttons & dots.
// The actual slide content stays in the server-rendered HTML above.

import { useState, useCallback } from "react";

interface CarouselControlsProps {
  /** id of the sliding <div> rendered by the server component */
  trackId: string;
  /** total number of items */
  total: number;
  /** how many items advance per click (default 1) */
  step?: number;
  /** "review" uses white buttons; "video" uses brand-colour buttons */
  variant: "review" | "video";
}

export default function CarouselControls({
  trackId,
  total,
  step = 1,
  variant,
}: CarouselControlsProps) {
  const [index, setIndex] = useState(0);

  const moveTo = useCallback(
    (next: number) => {
      const clamped = ((next % total) + total) % total;
      setIndex(clamped);

      const track = document.getElementById(trackId);
      if (track) {
        // shift by one card-width (100 / total %) per step
        const pct = (clamped * 100) / total;
        track.style.transform = `translateX(-${pct}%)`;
      }
    },
    [trackId, total]
  );

  const prev = () => moveTo(index - step);
  const next = () => moveTo(index + step);

  const isReview = variant === "review";

  return (
    <div className={`flex items-center mt-6 ${isReview ? "justify-between" : "justify-between"}`}>

      {/* left slot */}
      {isReview ? (
        // dots centred + "See All Reviews" link
        <div className="flex flex-col gap-4 w-full">
          <div className="flex justify-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                onClick={() => moveTo(i)}
                aria-label={`Go to item ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center">
            <a
              href="#"
              className="text-white/80 underline underline-offset-4 text-sm font-semibold hover:text-white transition-colors"
            >
              See All Reviews
            </a>

            <div className="flex gap-3">
              <button
                onClick={prev}
                aria-label="Previous"
                className="h-14 w-14 rounded-full bg-white text-black text-xl font-bold hover:bg-white/90 transition-colors flex items-center justify-center"
              >
                ←
              </button>
              <button
                onClick={next}
                aria-label="Next"
                className="h-14 w-14 rounded-full bg-white text-black text-xl font-bold hover:bg-white/90 transition-colors flex items-center justify-center"
              >
                →
              </button>
            </div>
          </div>
        </div>
      ) : (
        // video: dots left, arrows right
        <>
          <div className="flex gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                onClick={() => moveTo(i)}
                aria-label={`Go to video ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-[#29278E]" : "w-2 bg-black/20"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={prev}
              aria-label="Previous video"
              className="h-14 w-14 rounded-full border-2 border-black text-black text-xl font-bold hover:bg-black hover:text-white transition-colors flex items-center justify-center"
            >
              ←
            </button>
            <button
              onClick={next}
              aria-label="Next video"
              className="h-14 w-14 rounded-full bg-[#29278E] text-white text-xl font-bold hover:bg-[#1e1c6e] transition-colors flex items-center justify-center"
            >
              →
            </button>
          </div>
        </>
      )}
    </div>
  );
}