// app/products/drinkware/stainless-steel-flask/[slug]/page.tsx
import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

const BASE_URL = "https://www.cluesstyle.com";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  console.log("Slug:", slug);

  return {
    alternates: {
      canonical: `${BASE_URL}/products/drinkware/stainless-steel-flask/${slug}`,
    },
  };
}

export default function Page() {
  return <ProductDetailClient />;
}