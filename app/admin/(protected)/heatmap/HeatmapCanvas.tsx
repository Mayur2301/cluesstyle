// PATH: app/admin/(protected)/heatmap/HeatmapCanvas.tsx
"use client";

import { useEffect, useRef } from "react";

export interface HeatPoint {
  // 0–1, position within the visitor's own viewport at click time.
  xPct: number;
  yPct: number;
}

// Blue (cold/rare) -> green -> yellow -> red (hot/frequent). Built once into
// a 256-entry lookup table from a 1px gradient, then applied per-pixel —
// this is a small hand-rolled stand-in for a heatmap.js-style renderer, no
// extra dependency needed.
const GRADIENT_STOPS: [number, string][] = [
  [0.0, "rgba(59,130,246,0)"],
  [0.2, "rgba(59,130,246,0.75)"],
  [0.45, "rgba(34,197,94,0.85)"],
  [0.7, "rgba(250,204,21,0.9)"],
  [1.0, "rgba(239,68,68,0.95)"],
];

function buildColorLUT(): Uint8ClampedArray {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 1;
  const ctx = c.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  for (const [stop, color] of GRADIENT_STOPS) grad.addColorStop(stop, color);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 1);
  return ctx.getImageData(0, 0, 256, 1).data;
}

export default function HeatmapCanvas({ points, height = 460 }: { points: HeatPoint[]; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 800;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (points.length === 0) return;

    // Pass 1: accumulate soft alpha-only blobs on an offscreen canvas.
    // Overlapping clicks stack their alpha, which is what makes dense spots
    // read as "hotter" once colorized below.
    const off = document.createElement("canvas");
    off.width = width;
    off.height = height;
    const offCtx = off.getContext("2d")!;

    const radius = Math.max(16, Math.min(width, height) * 0.04);

    for (const p of points) {
      const x = Math.min(width, Math.max(0, p.xPct * width));
      const y = Math.min(height, Math.max(0, p.yPct * height));
      const grad = offCtx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, "rgba(0,0,0,0.25)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      offCtx.fillStyle = grad;
      offCtx.beginPath();
      offCtx.arc(x, y, radius, 0, Math.PI * 2);
      offCtx.fill();
    }

    // Pass 2: colorize by accumulated alpha via the LUT, then draw.
    const imgData = offCtx.getImageData(0, 0, width, height);
    const lut = buildColorLUT();
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha === 0) continue;
      const lutIndex = Math.min(255, alpha) * 4;
      data[i] = lut[lutIndex];
      data[i + 1] = lut[lutIndex + 1];
      data[i + 2] = lut[lutIndex + 2];
      data[i + 3] = Math.min(255, alpha + 50);
    }

    offCtx.putImageData(imgData, 0, 0);
    ctx.drawImage(off, 0, 0, width, height, 0, 0, width, height);
  }, [points, height]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} className="rounded-xl bg-gray-50 border border-gray-100 block w-full" />
    </div>
  );
}