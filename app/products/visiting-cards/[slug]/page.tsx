// app/products/drinkware/stainless-steel-flask/[slug]/page.tsx
import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailsClient";

const BASE_URL = "https://www.cluesstyle.com";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  console.log("Slug:", slug);

  return {
    alternates: {
      canonical: `${BASE_URL}/products/frames/${slug}`,
    },
  };
}

export default function Page() {
  return <ProductDetailClient />;
}