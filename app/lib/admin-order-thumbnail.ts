// PATH: app/lib/admin-order-thumbnail.ts
import { findProductBySlug } from "@/app/lib/product-catalog";

// Resolves the small product photo shown next to an order row in the admin
// orders list — the colour the customer actually picked when available,
// falling back to the product's default photo, then null (renders a
// placeholder square client-side).
export function resolveOrderThumbnail(productSlug: string | null, selectedColor: string | null): string | null {
  if (!productSlug) return null;
  const product = findProductBySlug(productSlug) as any;
  if (!product) return null;

  if (selectedColor) {
    const colorObj = product.colors?.find(
      (c: any) => String(c.label).toLowerCase() === selectedColor.toLowerCase()
    );
    const colorImg = colorObj?.media?.find((m: any) => m.type === "image")?.src;
    if (colorImg) return colorImg;
  }

  const productImg = product.media?.find((m: any) => m.type === "image")?.src ?? product.images?.[0];
  return productImg ?? null;
}