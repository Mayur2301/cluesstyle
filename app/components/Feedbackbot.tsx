"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

// ── Route detection ──────────────────────────────────────────────────────────
// This site's URL pattern (see office-bag-collection.ts, solid-polo-neck.ts,
// etc.) is:
//   /products/<category>/<subcategory>            → category listing page
//   /products/<category>/<subcategory>/<slug>      → a specific product page
// A product page always has 4+ path segments starting with "products"; a
// listing page has exactly 3. Adjust this if your routing ever changes shape.
function isProductDetailPage(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length >= 4 && segments[0] === "products";
}

function getProductSlug(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  return isProductDetailPage(pathname) ? segments[segments.length - 1] : null;
}

type View = "home" | "form" | "success";
type FeedbackType = "page" | "product";

function BotAvatar({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Image src="/bot.webp" alt="CluesStyle bot" fill className="object-contain" />
    </div>
  );
}

export default function FeedbackBot() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("home");
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("page");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onProductPage = isProductDetailPage(pathname);
  const productSlug = getProductSlug(pathname);

  const resetAndClose = () => {
    setOpen(false);
    setTimeout(() => {
      setView("home");
      setRating(0);
      setMessage("");
    }, 200);
  };

  const startFeedback = (type: FeedbackType) => {
    setFeedbackType(type);
    setView("form");
  };

  const handleSubmit = async () => {
    if (!message.trim() && rating === 0) return;
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: feedbackType,
          page: pathname,
          productSlug: feedbackType === "product" ? productSlug : undefined,
          rating: rating || undefined,
          message: message.trim() || undefined,
        }),
      });
    } catch {
      // Non-critical — don't block the thank-you screen on a network hiccup.
    } finally {
      setSubmitting(false);
      setView("success");
    }
  };

  return (
    <>
      {/* Floating trigger */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Give feedback"
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-gray-900 shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center p-2"
        >
          <BotAvatar className="w-10 h-10" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[320px] sm:w-[340px] rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white flex flex-col max-h-[560px]">
          {/* Header */}
          <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <span className="font-bold text-sm tracking-tight">CluesStyle</span>
            <div className="flex items-center gap-3">
              <button onClick={resetAndClose} aria-label="Minimize" className="text-white/70 hover:text-white text-lg leading-none">
                &#8211;
              </button>
              <button onClick={resetAndClose} aria-label="Close" className="text-white/70 hover:text-white text-lg leading-none">
                &times;
              </button>
            </div>
          </div>

          <div className="p-5 overflow-y-auto">
            {view === "home" && (
              <>
                <div className="flex justify-center mb-3">
                  <div className="relative w-16 h-16">
                    <BotAvatar className="w-full h-full" />
                    <span className="absolute -top-1 -right-3 bg-gray-100 border border-gray-200 rounded-full px-2 py-1 flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                    </span>
                  </div>
                </div>
                <h3 className="text-center text-lg font-bold text-gray-900 mb-1">Hi there!</h3>
                <span className="block text-center text-[13px] text-gray-500 mb-5 px-2">
                  How can we make your experience better today?
                </span>

                <div className="flex flex-col gap-3">
                  {/* Always available */}
                  <button
                    onClick={() => startFeedback("page")}
                    className="flex items-start gap-3 rounded-xl border border-gray-200 p-3.5 text-left hover:border-gray-400 transition-colors group"
                  >
                    <svg className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l3-3m0 0l-3-3m3 3h-9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h7.5a2.25 2.25 0 002.25-2.25V6.108c0-.502-.2-.982-.555-1.337l-3.85-3.85a1.875 1.875 0 00-1.325-.55H6a2.25 2.25 0 00-2.25 2.25v15.375c0 1.243 1.007 2.25 2.25 2.25z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">Feedback for Current Page</span>
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                      <span className="block text-[12px] text-gray-500 mt-0.5">
                        Tell us what you think about this page — your feedback helps us improve!
                      </span>
                    </div>
                  </button>

                  {/* Product-only */}
                  {onProductPage && (
                    <button
                      onClick={() => startFeedback("product")}
                      className="flex items-start gap-3 rounded-xl border border-gray-200 p-3.5 text-left hover:border-gray-400 transition-colors group"
                    >
                      <svg className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-8.25 4.5-8.25-4.5M20.25 7.5l-8.25-4.5-8.25 4.5M20.25 7.5v9l-8.25 4.5m0-9L3.75 7.5m8.25 4.5v9M3.75 7.5v9l8.25 4.5" />
                      </svg>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">Feedback for Product</span>
                          <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </div>
                        <span className="block text-[12px] text-gray-500 mt-0.5">
                          Share your thoughts about this specific product.
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              </>
            )}

            {view === "form" && (
              <>
                <button
                  onClick={() => setView("home")}
                  className="flex items-center gap-1 text-[12px] font-semibold text-gray-500 hover:text-gray-800 mb-3"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Back
                </button>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {feedbackType === "product" ? "Feedback for this product" : "Feedback for this page"}
                </h3>
                <span className="block text-[12px] text-gray-500 mb-4">
                  {feedbackType === "product"
                    ? "Let us know what you think about this product."
                    : "Let us know what you think about this page."}
                </span>

                <div className="flex items-center justify-center gap-1.5 mb-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}>
                      <svg
                        className={`w-7 h-7 transition-colors ${n <= rating ? "text-yellow-400" : "text-gray-200"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.538 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.783.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.385c-.784-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.285-3.958z" />
                      </svg>
                    </button>
                  ))}
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder={
                    feedbackType === "product"
                      ? "What did you like or dislike about this product?"
                      : "What would you like us to improve on this page?"
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] outline-none focus:border-gray-500 resize-none placeholder:text-gray-400"
                />

                <button
                  onClick={handleSubmit}
                  disabled={submitting || (!message.trim() && rating === 0)}
                  className="w-full mt-3 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending..." : "Send Feedback"}
                </button>
              </>
            )}

            {view === "success" && (
              <div className="flex flex-col items-center text-center py-6">
                <span className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Thank you!</h3>
                <span className="block text-[12px] text-gray-500 mb-4">Your feedback helps us build a better experience.</span>
                <button
                  onClick={resetAndClose}
                  className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          <div className="px-5 py-2.5 border-t border-gray-100 flex-shrink-0">
            <span className="block text-[10px] text-gray-400 text-center">
              <span className="font-semibold text-gray-500">CluesStyle</span> · Better Feedback. Better Experience.
            </span>
          </div>
        </div>
      )}
    </>
  );
}