import { Metadata } from "next";

import Hoodies from "./hoodies";

export const metadata: Metadata = {
  metadataBase: new URL("https://cluesstyle.com"),

  title: "Custom Hoodies Online India | Zipper, Pullover & Sleeveless Hoodies",
  description:
    "Shop and personalise your own premium hoodies online in India. Zipper, pullover, and sleeveless hoodies in premium fleece — soft, warm, durable, and custom-branded for individuals, teams, and corporate wear.",

  keywords: [
    "custom hoodies",
    "personalised hoodies",
    "hoodies online india",
    "zipper hoodies",
    "pullover hoodies",
    "sleeveless hoodies",
    "custom printed hoodies",
    "corporate hoodies",
    "branded hoodies for teams",
    "premium fleece hoodies",
    "hoodies for men",
    "hoodies for women",
    "winter hoodies india",
    "custom hoodie printing",
    "bulk hoodies for corporate",
  ],

  authors: [{ name: "CluesStyle" }],

  alternates: {
    canonical: "https://cluesstyle.com/products/apparels/hoodies",
  },

  icons: {
    icon: "/clusstyle-emblem.ico",
    shortcut: "/clusstyle-emblem.ico",
    apple: "/clusstyle-emblem.ico",
  },

  openGraph: {
    title: "Custom Hoodies Online India | CluesStyle",
    description:
      "Shop and personalise your own premium hoodies — zipper, pullover, and sleeveless styles in soft, durable fleece. Perfect for everyday wear, teams, and corporate branding.",
    url: "https://cluesstyle.com/products/apparels/hoodies",
    siteName: "CluesStyle",
    images: [
      {
        url: "/zipper-solid-hoodie/black/zipper-black-solid-hoodie-front.webp",
        width: 1200,
        height: 630,
        alt: "Custom Hoodies by CluesStyle",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Custom Hoodies Online India | CluesStyle",
    description:
      "Premium zipper, pullover, and sleeveless hoodies — shop and personalise your own online.",
    images: ["/zipper-solid-hoodie/black/zipper-black-solid-hoodie-front.webp"],
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

// Product + ItemList schema for the three live hoodie styles — keeps the
// structured data in sync with hoodies.tsx's own productsData (id/name/
// slug/price/priceLabel/images/rating/reviewCount). If a product there is
// added, removed, or re-priced, mirror the same change here.
const hoodieProducts = [
  {
    id: "2",
    name: "Zipper Hoodies",
    slug: "zipper-hoodies",
    price: 599,
    mrp: 999,
    image: "https://cluesstyle.com/zipper-solid-hoodie/black/zipper-black-solid-hoodie-front.webp",
    rating: 4.6,
    reviewCount: 1700,
  },
  {
    id: "3",
    name: "Pull Over Hoodies",
    slug: "pull-over-hoodies",
    price: 599,
    mrp: 999,
    image: "https://cluesstyle.com/solid-pull-over-hoodie/ice-blue/pullover-ice-blue-solid-hoodie-front.webp",
    rating: 4.6,
    reviewCount: 1700,
  },
  {
    id: "4",
    name: "Sleeveless Hoodies",
    slug: "sleeveless-hoodies",
    price: 599,
    mrp: 999,
    image: "https://cluesstyle.com/sleeveless-hoodie/customize/white-customize/customize-white-sleevesless-hoodie-1.webp",
    rating: 4.6,
    reviewCount: 1700,
  },
];

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: hoodieProducts.map((p, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    item: {
      "@type": "Product",
      "@id": `https://cluesstyle.com/products/apparels/hoodies/${p.slug}`,
      name: p.name,
      image: p.image,
      url: `https://cluesstyle.com/products/apparels/hoodies/${p.slug}`,
      brand: {
        "@type": "Brand",
        name: "CluesStyle",
      },
      offers: {
        "@type": "Offer",
        url: `https://cluesstyle.com/products/apparels/hoodies/${p.slug}`,
        priceCurrency: "INR",
        price: p.price,
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: p.rating,
        reviewCount: p.reviewCount,
      },
    },
  })),
};

export default function HoodiesPage() {
  return (
    <>
      <Hoodies />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
    </>
  );
}