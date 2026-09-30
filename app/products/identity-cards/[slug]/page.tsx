import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailPage from "../identity";
import { productsData } from "@/app/lib/id-cards";

interface Props {
  params: Promise<{ slug: string }>;
}

// Pre-render every real product slug at build time
export function generateStaticParams() {
  return productsData.map((p) => ({ slug: p.slug.replace(/^\//, "") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = productsData.find((p) => p.slug.replace(/^\//, "") === slug);

  if (!product) {
    return { title: "Identity Card - Cluesstyle" };
  }

  return {
    metadataBase: new URL("https://cluesstyle.com"),
    title: `${product.name} - Cluesstyle`,
    description:
      product.description ??
      "Professional-grade custom identity cards for corporates, schools and events.",
    keywords: [
      "identity card printing",
      "id card design",
      "corporate id cards",
      "school id cards",
      "event badges",
    ],
    authors: [{ name: "CluesStyle" }],
    alternates: {
      canonical: `https://cluesstyle.com/products/identity-cards/${slug}`,
    },
    icons: {
      icon: "/public/clusstyle-emblem.ico",
      shortcut: "/clusstyle-emblem.ico",
      apple: "/clusstyle-emblem.ico",
    },
    openGraph: {
      title: `${product.name} - CluesStyle`,
      description: product.description ?? "",
      url: `https://cluesstyle.com/products/identity-cards/${slug}`,
      siteName: "CluesStyle",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "CluesStyle Printing Services",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description ?? "",
      images: ["/twitter-image.jpg"],
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

export default async function IdentityCardProductPage({ params }: Props) {
  const { slug } = await params;
  const exists = productsData.some((p) => p.slug.replace(/^\//, "") === slug);
  if (!exists) notFound();

  return <ProductDetailPage />;
}
