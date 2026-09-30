"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────────────────

interface ReviewMedia {
  type: "image" | "video";
  url: string;
}

interface Review {
  id: string;
  userName: string;
  rating: number; // 1-5
  text: string;
  media: ReviewMedia[];
  createdAt: string; // ISO date
  verified?: boolean;
}

interface ReviewSummary {
  average: number;
  total: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>; // count per star
}

// ── Star Display ───────────────────────────────────────────────────────────

function StarRow({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`${size} ${n <= Math.round(rating) ? "fill-yellow-400" : "fill-gray-200"}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ── Interactive Star Picker (for the write-review form) ─────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5"
        >
          <svg
            className={`w-8 h-8 transition-colors ${
              n <= (hover || value) ? "fill-yellow-400" : "fill-gray-200"
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// ── Rating Summary (average + bar breakdown) ────────────────────────────────

function RatingSummary({ summary }: { summary: ReviewSummary }) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start sm:items-center border border-gray-200 rounded-2xl p-5">
      <div className="flex flex-col items-center flex-shrink-0">
        <span className="text-4xl font-black text-gray-900">{summary.average.toFixed(1)}</span>
        <StarRow rating={summary.average} size="w-5 h-5" />
        <span className="text-xs text-gray-500 mt-1">{summary.total.toLocaleString()} reviews</span>
      </div>
      <div className="flex-1 w-full flex flex-col gap-1.5">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = summary.breakdown[star] ?? 0;
          const pct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-8 flex-shrink-0 font-semibold">{star} ★</span>
              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-8 flex-shrink-0 text-right text-gray-400">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Media Lightbox ────────────────────────────────────────────────────────

function MediaLightbox({ media, index, onClose, onNav }: {
  media: ReviewMedia[]; index: number; onClose: () => void; onNav: (i: number) => void;
}) {
  const current = media[index];
  return (
    <div className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg">✕</button>

      {media.length > 1 && index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNav(index - 1); }}
          className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
        >‹</button>
      )}

      <div className="max-w-3xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
        {current.type === "video" ? (
          <video src={current.url} controls autoPlay className="w-full max-h-[85vh] rounded-xl" />
        ) : (
          <div className="relative w-full h-[85vh]">
            <Image src={current.url} alt="Review media" fill className="object-contain" />
          </div>
        )}
      </div>

      {media.length > 1 && index < media.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNav(index + 1); }}
          className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
        >›</button>
      )}
    </div>
  );
}

// ── Single Review Card ───────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const initials = review.userName.trim().slice(0, 1).toUpperCase() || "U";
  const date = new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="border-b border-gray-100 py-5 last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{review.userName}</span>
            {review.verified && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Verified Purchase
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRow rating={review.rating} />
            <span className="text-xs text-gray-400">{date}</span>
          </div>
          {review.text && (
            <p className="text-sm text-gray-700 mt-2 leading-relaxed">{review.text}</p>
          )}
          {review.media.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {review.media.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(i)}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                >
                  {m.type === "video" ? (
                    <>
                      <video src={m.url} className="w-full h-full object-cover" muted />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </>
                  ) : (
                    <Image src={m.url} alt="Review" fill className="object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {lightbox !== null && (
        <MediaLightbox media={review.media} index={lightbox} onClose={() => setLightbox(null)} onNav={setLightbox} />
      )}
    </div>
  );
}

// ── Write Review Modal ───────────────────────────────────────────────────────

function WriteReviewModal({ productType, productSlug, onClose, onSubmitted }: {
  productType: string; productSlug: string; onClose: () => void; onSubmitted: (r: Review) => void;
}) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; type: "image" | "video" }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList).slice(0, 6 - files.length);
    setFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [
      ...prev,
      ...newFiles.map((f) => ({
        url: URL.createObjectURL(f),
        type: f.type.startsWith("video/") ? ("video" as const) : ("image" as const),
      })),
    ]);
  };

  const removeFile = (idx: number) => {
    URL.revokeObjectURL(previews[idx].url);
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (!text.trim() && files.length === 0) { setError("Please add a written review or at least one photo/video."); return; }
    setError("");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("productType", productType);
      formData.append("productSlug", productSlug);
      formData.append("rating", String(rating));
      formData.append("text", text.trim());
      files.forEach((f) => formData.append("media", f));

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Could not submit your review. Please try again.");
      }

      const created: Review = await res.json();
      onSubmitted(created);
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-gray-100 z-10">
          <h3 className="text-base font-bold text-gray-900">Write a Review</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Your rating *</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Your review</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your experience with this product — fit, quality, print, delivery, etc."
              maxLength={1000}
              rows={4}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-700 resize-none"
            />
            <div className="text-right text-[11px] text-gray-400 mt-0.5">{text.length}/1000</div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Add photos or videos <span className="font-normal text-gray-400">(up to 6, optional)</span>
            </label>

            <div className="flex flex-wrap gap-2">
              {previews.map((p, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  {p.type === "video" ? (
                    <video src={p.url} className="w-full h-full object-cover" muted />
                  ) : (
                    <Image src={p.url} alt="Preview" fill className="object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {files.length < 6 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-[9px] font-semibold">Add</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => { handleFilesSelected(e.target.files); e.target.value = ""; }}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">{error}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-11 bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white font-bold text-sm rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting…</>
            ) : (
              "Submit Review"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Auth Gate (reuses your existing login-required pattern) ─────────────────

function ReviewAuthGate({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Login Required</h3>
        <p className="text-sm text-gray-500 mb-5">Please login to write a review for this product.</p>
        <div className="flex gap-3">
          <a href="/account" className="flex-1 py-3 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-700 transition-colors text-center">Login</a>
          <a href="/account" className="flex-1 py-3 border-2 border-gray-900 text-gray-900 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors text-center">Sign Up</a>
        </div>
        <button onClick={onClose} className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline">Cancel</button>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────

export default function ProductReviews({ productType, productSlug }: { productType: string; productSlug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({ average: 0, total: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [loading, setLoading] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reviews?productType=${encodeURIComponent(productType)}&productSlug=${encodeURIComponent(productSlug)}`
      );
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews ?? []);
        setSummary(data.summary ?? { average: 0, total: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
      }
    } catch {
      // fail silently — reviews are non-critical to page function
    } finally {
      setLoading(false);
    }
  }, [productType, productSlug]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleWriteReviewClick = () => {
    const token = localStorage.getItem("token");
    if (!token) { setShowAuthGate(true); return; }
    setShowWriteModal(true);
  };

  const handleSubmitted = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
    setSummary((prev) => {
      const newTotal = prev.total + 1;
      const newBreakdown = { ...prev.breakdown, [newReview.rating]: (prev.breakdown[newReview.rating as 1|2|3|4|5] ?? 0) + 1 };
      const newAverage = ((prev.average * prev.total) + newReview.rating) / newTotal;
      return { average: newAverage, total: newTotal, breakdown: newBreakdown };
    });
  };

  return (
    <section className="max-w-[1500px] mx-auto px-4 py-2 sm:py-10">
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Ratings & Reviews</h2>
        <button
          onClick={handleWriteReviewClick}
          className="px-4 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
          Write a Review
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading reviews…</div>
      ) : summary.total === 0 ? (
        <div className="border border-gray-200 rounded-2xl p-10 text-center">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <p className="text-sm font-semibold text-gray-600">No reviews yet</p>
          <p className="text-xs text-gray-400 mt-1">Be the first to share your experience with this product.</p>
        </div>
      ) : (
        <>
          <RatingSummary summary={summary} />

          <div className="mt-6 border border-gray-200 rounded-2xl px-5">
            {reviews.slice(0, visibleCount).map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>

          {visibleCount < reviews.length && (
            <button
              onClick={() => setVisibleCount((c) => c + 5)}
              className="mt-4 mx-auto block px-5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors"
            >
              Show more reviews
            </button>
          )}
        </>
      )}

      {showWriteModal && (
        <WriteReviewModal
          productType={productType}
          productSlug={productSlug}
          onClose={() => setShowWriteModal(false)}
          onSubmitted={handleSubmitted}
        />
      )}

      {showAuthGate && <ReviewAuthGate onClose={() => setShowAuthGate(false)} />}
    </section>
  );
}