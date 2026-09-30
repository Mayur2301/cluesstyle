import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import { POLO_TSHIRT_SEO } from "./polo-tshirt-seo-data";

const BASE_URL = "https://www.cluesstyle.com";
const CATEGORY_PATH = "/products/apparels/polo-t-shirt";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const entry = POLO_TSHIRT_SEO[slug];
  const canonical = `${BASE_URL}${CATEGORY_PATH}/${slug}`;

  // Fallback copy for a slug that isn't in the map yet (new colour not added
  // to polo-tshirt-seo-data.ts), so the page still ships reasonable metadata
  // instead of blank/undefined tags.
  const title = entry?.seoTitle ?? "Solid Polo T-Shirt | 220 GSM Cotton Polo Shirt";
  const description =
    entry?.metaDescription ??
    "Shop solid polo t-shirts in 220 GSM cotton loop knitted fabric. Comfortable, professional and ideal for uniforms, teams, events and custom branding.";
  const imageUrl = entry
    ? `${BASE_URL}/images/polo-t-shirt/solid-polo-t-shirts/${entry.imageFilename}`
    : `${BASE_URL}/og-image.jpg`;
  const imageAlt = entry?.imageAlt ?? "Solid Polo T-Shirt";

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    keywords: [
      "solid polo t-shirt",
      "polo t-shirt",
      "220 GSM cotton polo t-shirt",
      "plain polo t-shirt",
      "custom polo t-shirt",
      ...(entry ? [`${entry.color.toLowerCase()} polo t-shirt`, `${entry.color.toLowerCase()} polo shirt`] : []),
    ],
    authors: [{ name: "CluesStyle" }],
    alternates: {
      canonical,
    },
    icons: {
      icon: "/clusstyle-emblem.ico",
      shortcut: "/clusstyle-emblem.ico",
      apple: "/clusstyle-emblem.ico",
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "CluesStyle",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: imageAlt,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@cluesstyle",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default function Page() {
  return <ProductDetailClient />;
}