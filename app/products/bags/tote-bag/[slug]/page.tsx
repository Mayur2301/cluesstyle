// app/products/drinkware/stainless-steel-flask/[slug]/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import ProductDetailClient from "./ProductDetailClient";

const BASE_URL = "https://www.cluesstyle.com";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return {
    alternates: {
      canonical: `${BASE_URL}/products/bags/tote-bag/${slug}`,
    },
  };
}

// ProductDetailClient handles ALL tote bag products, including the minimal
// Color + Fabric GSM + Quantity flow for `simpleVariantPicker` products (e.g.
// the Sample Kit) — that's an internal early-return inside the component,
// not a separate page/component, so this file doesn't need to branch.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProductDetailClient />
    </Suspense>
  );
}