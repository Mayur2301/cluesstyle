"use client";

import { useEffect, useState } from "react";

interface Review {
  reviewId: string;
  comment: string;
  starRating: string;
  createTime: string;

  reviewer: {
    displayName: string;
    profilePhotoUrl: string;
  };
}

export default function GoogleReviews() {
  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch(
          "/api/google-reviews"
        );

        const data = await res.json();

        setReviews(data.reviews || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  const renderStars = (
    rating: string
  ) => {
    const map: Record<string, number> = {
      ONE: 1,
      TWO: 2,
      THREE: 3,
      FOUR: 4,
      FIVE: 5,
    };

    return "★".repeat(
      map[rating] || 5
    );
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        Loading Reviews...
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto">
      {reviews.map((review) => (
        <div
          key={review.reviewId}
          className="min-w-[320px] border rounded-2xl p-6 shadow"
        >
          <div className="flex flex-col items-center text-center">
            <img
              src={
                review.reviewer
                  ?.profilePhotoUrl ||
                "/default-user.png"
              }
              alt={
                review.reviewer
                  ?.displayName
              }
              className="w-20 h-20 rounded-full object-cover"
            />

            <h3 className="font-bold mt-3">
              {
                review.reviewer
                  ?.displayName
              }
            </h3>

            <p className="text-xs text-gray-500">
              {new Date(
                review.createTime
              ).toLocaleDateString()}
            </p>

            <div className="text-yellow-500 mt-2">
              {renderStars(
                review.starRating
              )}
            </div>
          </div>

          <p className="mt-6 text-sm text-center">
            {review.comment}
          </p>
        </div>
      ))}
    </div>
  );
}