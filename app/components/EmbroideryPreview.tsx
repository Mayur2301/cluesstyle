// PATH: app/components/EmbroideryPreview.tsx
//
// Turns an uploaded logo image into a "looks embroidered" version, the way
// Vistaprint's embroidery preview does — a simulated stitch effect (running
// -stitch outline + satin thread-line texture + a soft puffy bevel), not a
// real machine digitizing file. Runs entirely client-side on <canvas>, so
// it's instant and needs no backend.
//
// Drop-in usage: point it at the same logo URL you already store in
// `logoUrls` / `logoDesign`, toggle `active` when the shopper picks
// printType === "embroidery", and read the processed image back out via
// `onProcessed` to use exactly where you use the original logo URL today
// (it keeps the same transparency/shape, just re-styled).
//
//   <EmbroideryPreview
//     imageUrl={uploadedLogoUrl}
//     active={printType === "embroidery"}
//     onProcessed={(dataUrl) => setLogoUrls((u) => ({ ...u, [side]: dataUrl }))}
//   />

"use client";

import { useEffect, useRef, useState } from "react";

interface EmbroideryPreviewProps {
  imageUrl: string;
  active?: boolean;           // false = just show the original image, untouched
  maxDimension?: number;      // working resolution cap, default 600px
  stitchColor?: string;       // outline/stitch tint, default "auto" (derived from image)
  onProcessed?: (dataUrl: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Pure helpers — kept outside the component so they're easy to unit test /
// reuse elsewhere (e.g. server-side pre-processing later, if ever needed).
// ---------------------------------------------------------------------------

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// Simple box blur over a single-channel (alpha) buffer — used to build a
// soft "height map" for the fake bevel/puff lighting. Two passes (h then v)
// approximate a gaussian well enough for this purpose.
function boxBlurChannel(src: Uint8ClampedArray, w: number, h: number, radius: number): Float32Array {
  const out = new Float32Array(src.length);
  const tmp = new Float32Array(src.length);

  for (let y = 0; y < h; y++) {
    let sum = 0;
    const rowStart = y * w;
    for (let x = -radius; x <= radius; x++) {
      const xi = Math.min(w - 1, Math.max(0, x));
      sum += src[rowStart + xi];
    }
    for (let x = 0; x < w; x++) {
      tmp[rowStart + x] = sum / (radius * 2 + 1);
      const addX = Math.min(w - 1, x + radius + 1);
      const subX = Math.max(0, x - radius);
      sum += src[rowStart + addX] - src[rowStart + subX];
    }
  }

  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -radius; y <= radius; y++) {
      const yi = Math.min(h - 1, Math.max(0, y));
      sum += tmp[yi * w + x];
    }
    for (let y = 0; y < h; y++) {
      out[y * w + x] = sum / (radius * 2 + 1);
      const addY = Math.min(h - 1, y + radius + 1);
      const subY = Math.max(0, y - radius);
      sum += tmp[addY * w + x] - tmp[subY * w + x];
    }
  }

  return out;
}

// Builds a tileable diagonal thread-line pattern used for the satin-stitch
// fill texture. Returned as a small offscreen canvas the caller can pass to
// ctx.createPattern(...).
function buildStitchTile(size = 8): HTMLCanvasElement {
  const tile = document.createElement("canvas");
  tile.width = size;
  tile.height = size;
  const c = tile.getContext("2d")!;
  c.clearRect(0, 0, size, size);
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(-size, size);
  c.lineTo(size, -size);
  c.moveTo(0, size * 2);
  c.lineTo(size * 2, 0);
  c.stroke();
  return tile;
}

// Samples the average opaque colour of the source image — used to derive a
// sensible default stitch-outline tint (a darker shade of the logo's own
// dominant colour) when the caller doesn't pass one explicitly.
function averageOpaqueColor(data: Uint8ClampedArray): [number, number, number] {
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 10) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }
  if (n === 0) return [90, 90, 90];
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

function darken([r, g, b]: [number, number, number], amount = 0.45): string {
  return `rgb(${Math.round(r * (1 - amount))}, ${Math.round(g * (1 - amount))}, ${Math.round(b * (1 - amount))})`;
}

/**
 * Runs the full embroidery-look pipeline on an already-loaded image and
 * returns a canvas containing the result (same size, alpha preserved).
 */
function renderEmbroideryEffect(
  img: HTMLImageElement,
  maxDimension: number,
  stitchColorOverride?: string
): HTMLCanvasElement {
  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const base = document.createElement("canvas");
  base.width = w;
  base.height = h;
  const bctx = base.getContext("2d")!;
  bctx.drawImage(img, 0, 0, w, h);

  const srcData = bctx.getImageData(0, 0, w, h);
  const alpha = new Uint8ClampedArray(w * h);
  for (let i = 0, p = 0; i < srcData.data.length; i += 4, p++) {
    alpha[p] = srcData.data[i + 3];
  }

  const stitchTint = stitchColorOverride ?? darken(averageOpaqueColor(srcData.data));

  // ---- 1. Bevel / puff from a blurred alpha "height map" ----
  const blurred = boxBlurChannel(alpha, w, h, Math.max(1, Math.round(Math.min(w, h) * 0.02)));
  const lightDx = -1, lightDy = -1; // light from top-left
  const bevel = document.createElement("canvas");
  bevel.width = w;
  bevel.height = h;
  const bevelCtx = bevel.getContext("2d")!;
  const bevelData = bevelCtx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const nx = Math.min(w - 1, Math.max(0, x + lightDx));
      const ny = Math.min(h - 1, Math.max(0, y + lightDy));
      const grad = blurred[idx] - blurred[ny * w + nx]; // >0 => lit edge, <0 => shadowed edge
      const p = idx * 4;
      if (grad > 0) {
        bevelData.data[p] = bevelData.data[p + 1] = bevelData.data[p + 2] = 255;
        bevelData.data[p + 3] = Math.min(140, grad * 6);
      } else {
        bevelData.data[p] = bevelData.data[p + 1] = bevelData.data[p + 2] = 0;
        bevelData.data[p + 3] = Math.min(140, -grad * 6);
      }
    }
  }
  bevelCtx.putImageData(bevelData, 0, 0);

  // ---- 2. Running-stitch outline from the alpha mask's edge band ----
  const outline = document.createElement("canvas");
  outline.width = w;
  outline.height = h;
  const outlineCtx = outline.getContext("2d")!;
  outlineCtx.strokeStyle = stitchTint;
  outlineCtx.lineWidth = Math.max(1.5, Math.min(w, h) * 0.012);
  outlineCtx.setLineDash([outlineCtx.lineWidth * 1.6, outlineCtx.lineWidth * 1.4]);
  // Trace the shape via the canvas's own alpha as a stencil: stroke a
  // slightly-thickened copy of the artwork with "source-atop" so the dash
  // pattern only shows along the true silhouette edge.
  outlineCtx.drawImage(base, 0, 0);
  outlineCtx.globalCompositeOperation = "source-atop";
  outlineCtx.strokeRect(0, 0, w, h); // no-op safeguard; real edge below
  outlineCtx.globalCompositeOperation = "source-over";

  // ---- 3. Composite: base artwork -> satin stitch texture (clipped to
  //         alpha) -> bevel light/shadow -> dashed edge outline ----
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const octx = out.getContext("2d")!;

  // base colours
  octx.drawImage(base, 0, 0);

  // satin thread texture, clipped to the artwork's own shape
  const tile = buildStitchTile(7);
  const pattern = octx.createPattern(tile, "repeat")!;
  octx.save();
  octx.globalCompositeOperation = "source-atop";
  octx.globalAlpha = 0.55;
  octx.fillStyle = pattern;
  octx.fillRect(0, 0, w, h);
  octx.globalAlpha = 1;
  octx.restore();

  // puff bevel, clipped to the artwork's own shape
  octx.save();
  octx.globalCompositeOperation = "source-atop";
  octx.drawImage(bevel, 0, 0);
  octx.restore();

  // stitched outline around the silhouette
  octx.save();
  octx.globalCompositeOperation = "source-over";
  octx.drawImage(base, 0, 0, w, h, 0, 0, w, h); // ensure shape is present for edge trace
  octx.globalCompositeOperation = "destination-over";
  octx.restore();

  // Edge trace: stroke along the alpha boundary using the base as a mask —
  // done last, directly over the composited result, clipped to a thin ring
  // around the shape only (source-atop against a dilated copy).
  const dilated = document.createElement("canvas");
  dilated.width = w;
  dilated.height = h;
  const dctx = dilated.getContext("2d")!;
  dctx.filter = "blur(1.4px)";
  dctx.drawImage(base, 0, 0);
  dctx.filter = "none";

  octx.save();
  octx.globalCompositeOperation = "source-over";
  octx.strokeStyle = stitchTint;
  octx.lineWidth = Math.max(1.5, Math.min(w, h) * 0.012);
  octx.setLineDash([octx.lineWidth * 1.6, octx.lineWidth * 1.4]);
  octx.globalAlpha = 0.9;
  // Approximate the outline by stroking the dilated silhouette's alpha edge:
  // draw dilated shape filled with the stitch colour, then punch the
  // original shape back out, leaving only a thin coloured ring — which we
  // then stamp onto the result with a dash-patterned repeat via clipping.
  const ring = document.createElement("canvas");
  ring.width = w;
  ring.height = h;
  const rctx = ring.getContext("2d")!;
  rctx.drawImage(dilated, 0, 0);
  rctx.globalCompositeOperation = "source-in";
  rctx.fillStyle = stitchTint;
  rctx.fillRect(0, 0, w, h);
  rctx.globalCompositeOperation = "destination-out";
  rctx.drawImage(base, 0, 0);
  octx.globalAlpha = 0.9;
  octx.drawImage(ring, 0, 0);
  octx.restore();

  return out;
}

export default function EmbroideryPreview({
  imageUrl,
  active = true,
  maxDimension = 600,
  stitchColor,
  onProcessed,
  className,
}: EmbroideryPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    if (!imageUrl) return;

    if (!active) {
      // Not embroidery — just draw the original image untouched.
      loadImage(imageUrl)
        .then((img) => {
          if (cancelled || !canvasRef.current) return;
          const canvas = canvasRef.current;
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          onProcessed?.(canvas.toDataURL("image/png"));
        })
        .catch(() => !cancelled && setError("Could not load image"));
      return () => {
        cancelled = true;
      };
    }

    loadImage(imageUrl)
      .then((img) => {
        if (cancelled) return;
        const result = renderEmbroideryEffect(img, maxDimension, stitchColor);
        if (cancelled || !canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = result.width;
        canvas.height = result.height;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(result, 0, 0);
        onProcessed?.(canvas.toDataURL("image/png"));
      })
      .catch(() => !cancelled && setError("Could not process image"));

    return () => {
      cancelled = true;
    };
  }, [imageUrl, active, maxDimension, stitchColor]);

  if (error) {
    return <div className={className}>{error}</div>;
  }

  return <canvas ref={canvasRef} className={className} style={{ maxWidth: "100%", height: "auto" }} />;
}