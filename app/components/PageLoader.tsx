"use client";

import { useEffect, useState } from "react";

// Rotates through a few on-brand phrases so a slow connection doesn't feel
// stuck on one word — each one ties back to what this store actually does
// (print/stitch/cut), not a generic "Loading...".
const MESSAGES = [
  "Threading your order",
  "Printing your page",
  "Cutting to size",
  "Ironing out the details",
];

export default function PageLoader() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      {/* A spinning ring frames the t-shirt like a badge, while the t-shirt
          itself still "fills in" as a scan line sweeps up it — a direct nod
          to DTF/print production, not a generic bare spinner. Pure CSS/SVG,
          no external assets. */}
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <clipPath id="tshirt-fill-clip">
              <path d="M35 8 L20 20 L8 35 L18 48 L28 42 L28 90 L72 90 L72 42 L82 48 L92 35 L80 20 L65 8 C65 8 60 16 50 16 C40 16 35 8 35 8 Z" />
            </clipPath>
          </defs>

          {/* Outer track — the full, faint circle */}
          <circle cx="50" cy="50" r="46" fill="none" stroke="#e5e7eb" strokeWidth="4" />

          {/* Outer spinning arc — the classic circular-loader indicator */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#2563eb"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="70 219"
            className="tst-ring-spin"
          />

          {/* T-shirt outline, fill, and scan-line — all scaled down and
              centered inside the ring */}
          <g transform="translate(50,50) scale(0.42) translate(-50,-50)">
            <path
              d="M35 8 L20 20 L8 35 L18 48 L28 42 L28 90 L72 90 L72 42 L82 48 L92 35 L80 20 L65 8 C65 8 60 16 50 16 C40 16 35 8 35 8 Z"
              fill="none"
              stroke="#111827"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <g clipPath="url(#tshirt-fill-clip)">
              <rect x="0" y="100" width="100" height="100" fill="#2563eb" className="tst-fill-rise" />
            </g>
            <g clipPath="url(#tshirt-fill-clip)">
              <rect x="0" y="0" width="100" height="3" fill="#93c5fd" className="tst-scan-line" />
            </g>
          </g>
        </svg>
      </div>

      <p className="mt-5 flex items-center gap-1 text-[13px] font-semibold text-gray-500" aria-live="polite">
        {MESSAGES[messageIndex]}
        <span className="flex gap-0.5 ml-0.5">
          <span className="tst-dot" style={{ animationDelay: "0ms" }}>.</span>
          <span className="tst-dot" style={{ animationDelay: "200ms" }}>.</span>
          <span className="tst-dot" style={{ animationDelay: "400ms" }}>.</span>
        </span>
      </p>

      <style>{`
        @keyframes tst-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .tst-ring-spin {
          transform-origin: 50px 50px;
          animation: tst-spin 1.4s linear infinite;
        }
        @keyframes tst-rise {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-100px); }
        }
        .tst-fill-rise {
          animation: tst-rise 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
        @keyframes tst-scan {
          0%   { transform: translateY(0); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateY(-97px); opacity: 0; }
        }
        .tst-scan-line {
          transform: translateY(0);
          animation: tst-scan 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
        @keyframes tst-dot-pulse {
          0%, 100% { opacity: 0.2; }
          50%      { opacity: 1; }
        }
        .tst-dot {
          animation: tst-dot-pulse 1.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .tst-ring-spin, .tst-fill-rise, .tst-scan-line, .tst-dot {
            animation: none;
          }
          .tst-fill-rise { transform: translateY(-60px); }
          .tst-dot { opacity: 1; }
        }
      `}</style>
    </div>
  );
}