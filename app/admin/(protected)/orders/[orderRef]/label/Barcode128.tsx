// PATH: app/admin/(protected)/orders/[orderRef]/label/Barcode128.tsx
"use client";

import { useEffect, useRef } from "react";

// Renders a real, scannable CODE128 barcode (the same symbology couriers'
// own AWB stickers use) straight to an inline <svg> — no server round-trip,
// no external image API. Requires the "jsbarcode" package:
//   npm install jsbarcode
// Loaded dynamically (not a static top-level import) because it touches
// the DOM directly and has no meaningful server-side render.
export default function Barcode128({
  value,
  height = 40,
  barWidth = 1.4,
  displayValue = false,
  className,
}: {
  value: string;
  height?: number;
  barWidth?: number;
  displayValue?: boolean;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!value || !svgRef.current) return;
    let cancelled = false;

    import("jsbarcode")
      .then((mod) => {
        if (cancelled || !svgRef.current) return;
        const JsBarcode = ((mod as any).default ?? mod) as (
          el: SVGSVGElement,
          text: string,
          opts: Record<string, unknown>
        ) => void;
        try {
          JsBarcode(svgRef.current, value, {
            format: "CODE128",
            displayValue,
            height,
            width: barWidth,
            margin: 0,
          });
        } catch {
          // CODE128 can't encode every possible character (rare for an AWB
          // number / order ref, which are always plain alphanumerics) —
          // fail quietly rather than crashing the whole label.
        }
      })
      .catch(() => {
        // "jsbarcode" isn't installed yet — leave the SVG empty instead of
        // throwing, so the rest of the label still renders and prints.
      });

    return () => {
      cancelled = true;
    };
  }, [value, height, barWidth, displayValue]);

  if (!value) return null;
  return <svg ref={svgRef} className={className} />;
}