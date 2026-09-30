// app/products/bags/tote-bag/[slug]/sizes/page.tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { productsData } from "@/app/lib/tote-bag-collection";
import SizeGrid from "./SizeGrid";

const BASE_URL = "https://www.cluesstyle.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productsData.find((p) => p.slug === slug);

  return {
    title: product ? `Choose a Size — ${product.name}` : "Choose a Size",
    alternates: {
      canonical: `${BASE_URL}/products/bags/tote-bag/${slug}/sizes`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productsData.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // Products with only one size (or none defined) don't need a picker step —
  // send the shopper straight to the product page instead of an empty/1-card grid.
  if (!product.sizes || product.sizes.length <= 1) {
    redirect(`/products/bags/tote-bag/${slug}`);
  }

  return <SizeGrid slug={slug} />;
}