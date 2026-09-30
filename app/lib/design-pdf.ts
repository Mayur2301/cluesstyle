// PATH: app/lib/design-pdf.ts
import { PDFDocument, PDFImage, degrees, rgb } from "pdf-lib";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export type Side = "front" | "back" | "left" | "right";

export interface LogoLayer {
  x: number; // percentage (0-100) of the container width — matches the live preview exactly
  y: number; // percentage (0-100) of the container height
  scale: number;
  rotation: number; // degrees, CSS-style (clockwise positive) — matches the live preview
}

export interface LogoDesignSide {
  url: string; // e.g. "/uploads/logos/xxxx.png"
  layers: LogoLayer[];
}

export type LogoDesign = Partial<Record<Side, LogoDesignSide>>;

const SIDE_ORDER: Side[] = ["front", "back", "right", "left"];

// Must match the live preview canvas exactly (LivePreviewCanvas's
// containerRef has `style={{ aspectRatio: "4 / 5" }}`) and DraggableLogo's
// base box size (`width: "22%"` of the container, before `scale` is applied).
const CONTAINER_ASPECT = 4 / 5;
const LOGO_BASE_FRACTION = 0.22;

function resolveLocalPath(publicPath: string): string {
  if (!publicPath.startsWith("/")) {
    throw new Error(`Expected a local /public path, got: ${publicPath}`);
  }
  return path.join(process.cwd(), "public", publicPath);
}

// The app's own base URL, used as a fallback when reading straight off
// disk fails (see readPublicFileBytes below). Same env var
// create-razorpay-order already relies on for building absolute URLs.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

/**
 * Reads a /public-relative file's bytes for embedding into the PDF.
 *
 * Tries a direct filesystem read first (fast, no network hop) — this is
 * what the original implementation always did. But `fs.readFile` resolves
 * relative to `process.cwd()`, and in some deployment setups (e.g. Next.js
 * "standalone" output, PM2/systemd configs with a different working
 * directory, some Docker layouts) `process.cwd()` at runtime does NOT
 * point at the project root that actually contains `public/` — even
 * though the exact same file is served correctly over HTTP by Next.js
 * itself (which is why an admin's "View uploaded logo" browser link can
 * work fine while this direct disk read silently fails).
 *
 * If the local read fails for any reason, this falls back to fetching the
 * file over HTTP from the app's own public URL — the exact same mechanism
 * that makes "View uploaded logo" work — so PDF generation keeps working
 * regardless of what `process.cwd()` happens to resolve to at runtime.
 */
async function readPublicFileBytes(publicPath: string): Promise<Buffer> {
  // Already a fully-qualified URL (e.g. an external CDN/storage host) —
  // just fetch it directly, no local disk involved at all.
  if (/^https?:\/\//i.test(publicPath)) {
    const res = await fetch(publicPath);
    if (!res.ok) {
      throw new Error(`Could not fetch "${publicPath}": HTTP ${res.status} ${res.statusText}`);
    }
    return Buffer.from(await res.arrayBuffer());
  }

  const absPath = resolveLocalPath(publicPath);
  try {
    return await fs.readFile(absPath);
  } catch (localErr) {
    if (!APP_URL) {
      throw new Error(
        `Could not read "${publicPath}" from disk (resolved to "${absPath}", cwd="${process.cwd()}") ` +
          `and NEXT_PUBLIC_APP_URL isn't set, so there's no HTTP fallback available. Original error: ${
            localErr instanceof Error ? localErr.message : String(localErr)
          }`
      );
    }
    const fetchUrl = new URL(publicPath, APP_URL).toString();
    try {
      const res = await fetch(fetchUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      return Buffer.from(await res.arrayBuffer());
    } catch (fetchErr) {
      throw new Error(
        `Could not read "${publicPath}" — local disk read failed (path "${absPath}", cwd="${process.cwd()}": ` +
          `${localErr instanceof Error ? localErr.message : String(localErr)}), and the HTTP fallback to ` +
          `"${fetchUrl}" also failed: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`
      );
    }
  }
}

/**
 * Embeds an image into the PDF. Tries PNG/JPEG directly (pdf-lib's native
 * formats). Anything else (WebP, etc.) is converted to PNG via `sharp`
 * first — sharp is a common transitive dependency of `next/image` in many
 * Next.js setups, but if it isn't installed, this throws a clear error
 * telling you to `npm install sharp` rather than failing silently.
 */
async function embedImage(pdfDoc: PDFDocument, publicPath: string): Promise<PDFImage> {
  const bytes = await readPublicFileBytes(publicPath);
  // Strip any query string/hash before reading the extension, in case
  // publicPath is ever a fully-qualified URL with one (e.g. a signed CDN link).
  const cleanPath = publicPath.split(/[?#]/)[0];
  const ext = path.extname(cleanPath).toLowerCase();

  if (ext === ".png") return pdfDoc.embedPng(bytes);
  if (ext === ".jpg" || ext === ".jpeg") return pdfDoc.embedJpg(bytes);

  // Fallback: convert anything else (webp, etc.) to PNG via sharp.
  try {
    const sharp = (await import("sharp")).default;
    const pngBytes = await sharp(bytes).png().toBuffer();
    return pdfDoc.embedPng(pngBytes);
  } catch (err) {
    throw new Error(
      `Could not embed image "${publicPath}" (format "${ext}" isn't PNG/JPEG, and converting it via ` +
        `sharp failed — run \`npm install sharp\` if it's not installed). Original error: ${
          err instanceof Error ? err.message : String(err)
        }`
    );
  }
}

export async function generateDesignPdf({
  orderRef,
  blankMediaBySide,
  logoDesign,
}: {
  orderRef: string;
  /** Server-resolved base garment image per side, e.g. { front: "/products/.../front.png" } */
  blankMediaBySide: Partial<Record<Side, string>>;
  logoDesign: LogoDesign;
}): Promise<{ pdfUrl: string; sidesRendered: Side[] }> {
  const pdfDoc = await PDFDocument.create();
  const sidesRendered: Side[] = [];

  for (const side of SIDE_ORDER) {
    const garmentSrc = blankMediaBySide[side];
    if (!garmentSrc) {
      console.warn(`[design-pdf] No blank garment image for side "${side}" — skipping this page entirely.`);
      continue;
    }

    const design = logoDesign[side]; // may be undefined — that's fine, we still render the plain view

    let garmentImg: PDFImage;
    try {
      garmentImg = await embedImage(pdfDoc, garmentSrc);
    } catch (err) {
      console.error(`[design-pdf] Skipping side "${side}" (garment image failed to embed):`, err);
      continue;
    }

    let logoImg: PDFImage | null = null;
    if (design?.layers?.length) {
      try {
        logoImg = await embedImage(pdfDoc, design.url);
      } catch (err) {
        // Still render the plain garment page even if the logo fails.
        console.error(`[design-pdf] Logo failed to embed for side "${side}" — rendering garment only:`, err);
      }
    }

    const pageWidth = 800;
    const pageHeight = pageWidth / CONTAINER_ASPECT;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Garment image: letterboxed to match the live preview's `object-contain`.
    const gScale = Math.min(pageWidth / garmentImg.width, pageHeight / garmentImg.height);
    const gW = garmentImg.width * gScale;
    const gH = garmentImg.height * gScale;
    page.drawImage(garmentImg, {
      x: (pageWidth - gW) / 2,
      y: (pageHeight - gH) / 2,
      width: gW,
      height: gH,
    });

    page.drawText(`${orderRef} — ${side.toUpperCase()}`, {
      x: 16,
      y: pageHeight - 24,
      size: 12,
      color: rgb(0.35, 0.35, 0.35),
    });

    if (logoImg && design?.layers?.length) {
      const logoAspect = logoImg.width / logoImg.height;

      for (const layer of design.layers) {
        const boxW = pageWidth * LOGO_BASE_FRACTION * layer.scale;
        const boxH = boxW / logoAspect;

        // pos.x/pos.y are % of the container (page), matching the live
        // preview's coordinate space exactly. The UI's y-axis runs top-down;
        // PDF's runs bottom-up, so y is flipped.
        const centerX = (layer.x / 100) * pageWidth;
        const centerY = pageHeight - (layer.y / 100) * pageHeight;

        // pdf-lib's drawImage rotates around the (x, y) point you pass in —
        // which is the image's BOTTOM-LEFT corner, not its center. CSS
        // rotates around the element's center. To reproduce the live
        // preview exactly, compute the bottom-left corner position that
        // makes the rotation pivot land on the box's actual center.
        //
        // Also: CSS `rotate(Ndeg)` is clockwise-positive (screen y-axis
        // points down); PDF space is standard math (y-axis points up), so
        // pdf-lib's `degrees()` is counter-clockwise-positive. Negating the
        // angle converts CSS-clockwise to PDF-counter-clockwise so the
        // visual direction matches what the customer saw.
        const angleDeg = -layer.rotation;
        const angleRad = (angleDeg * Math.PI) / 180;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        const halfW = boxW / 2;
        const halfH = boxH / 2;
        const pivotX = centerX - (halfW * cos - halfH * sin);
        const pivotY = centerY - (halfW * sin + halfH * cos);

        page.drawImage(logoImg, {
          x: pivotX,
          y: pivotY,
          width: boxW,
          height: boxH,
          rotate: degrees(angleDeg),
        });
      }
    }

    sidesRendered.push(side);
  }

  if (sidesRendered.length === 0) {
    const attempted = SIDE_ORDER
      .filter((s) => blankMediaBySide[s])
      .map((s) => `${s}: ${blankMediaBySide[s]}`);
    throw new Error(
      `generateDesignPdf produced zero pages for order "${orderRef}" — every side's garment image ` +
        `failed to embed (see the "[design-pdf] Skipping side" errors above for exactly why each one ` +
        `failed). Garment paths attempted: ${attempted.length > 0 ? attempted.join(", ") : "(none — blankMediaBySide was empty)"}`
    );
  }

  const pdfBytes = await pdfDoc.save();

  const fileName = `${orderRef}-${crypto.randomBytes(4).toString("hex")}.pdf`;
  const dir = path.join(process.cwd(), "public", "uploads", "designs");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, fileName), pdfBytes);

  return { pdfUrl: `/uploads/designs/${fileName}`, sidesRendered };
}