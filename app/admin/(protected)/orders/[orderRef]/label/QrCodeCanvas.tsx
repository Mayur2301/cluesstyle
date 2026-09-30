// PATH: app/admin/(protected)/orders/[orderRef]/label/QrCodeCanvas.tsx
"use client";

import { useEffect, useRef } from "react";

// Renders a real, scannable QR code (the small square 2D code in the
// top-right of most courier labels) to a <canvas> — encodes the tracking
// link when there is one, so a warehouse/delivery staffer can scan straight
// to it, falling back to the order reference otherwise. Requires the
// "qrcode" package:
//   npm install qrcode
// Loaded dynamically for the same reason as Barcode128 — DOM-only, no
// server-side render.
export default function QrCodeCanvas({
  value,
  size = 92,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!value || !canvasRef.current) return;
    let cancelled = false;

    import("qrcode")
      .then((mod) => {
        if (cancelled || !canvasRef.current) return;
        const QRCode = ((mod as any).default ?? mod) as {
          toCanvas: (
            el: HTMLCanvasElement,
            text: string,
            opts: Record<string, unknown>
          ) => Promise<void>;
        };
        QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 0,
          errorCorrectionLevel: "M",
        }).catch(() => {
          // Encoding failure (shouldn't happen for a URL/order-ref string)
          // — leave the canvas blank rather than crashing the label.
        });
      })
      .catch(() => {
        // "qrcode" isn't installed yet — leave the canvas empty.
      });

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!value) return null;
  return <canvas ref={canvasRef} width={size} height={size} className={className} />;
}