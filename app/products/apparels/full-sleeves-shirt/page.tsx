import { Metadata } from "next";
import FullSleeves from "./full-sleeve-shirt";

export const metadata: Metadata = {
  metadataBase: new URL("https://cluesstyle.com"),

  title: "Custom Full Sleeve Shirts Online India | Formal Shirts | CluesStyle",
  description:
    "Shop and personalise your own full sleeve formal shirts online in India. Plain, dot-textured, and fully customizable shirts — premium cotton, comfortable fit, and custom branding for office wear and corporate uniforms.",

  keywords: [
    "full sleeve shirts",
    "custom full sleeve shirts",
    "formal shirts online india",
    "personalised formal shirts",
    "plain full sleeve shirt",
    "dot textured shirt",
    "corporate uniform shirts",
    "office formal shirts",
    "custom printed shirts",
    "branded shirts for teams",
    "premium cotton shirts",
    "formal shirts for men",
    "custom shirt printing",
    "bulk formal shirts corporate",
  ],

  authors: [{ name: "CluesStyle" }],

  alternates: {
    canonical: "https://cluesstyle.com/products/apparels/full-sleeves-shirt",
  },

  icons: {
    icon: "/clusstyle-emblem.ico",
    shortcut: "/clusstyle-emblem.ico",
    apple: "/clusstyle-emblem.ico",
  },

  openGraph: {
    title: "Custom Full Sleeve Shirts Online India | CluesStyle",
    description:
      "Shop and personalise your own full sleeve formal shirts — plain, dot-textured, and fully custom styles in premium cotton. Perfect for office wear and corporate uniforms.",
    url: "https://cluesstyle.com/products/apparels/full-sleeves-shirt",
    siteName: "CluesStyle",
    images: [
      {
        url: "/plain-full-sleeves/grey/grey-formal-solid-shirt-front.webp",
        width: 1200,
        height: 630,
        alt: "Custom Full Sleeve Shirts by CluesStyle",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Custom Full Sleeve Shirts Online India | CluesStyle",
    description:
      "Premium full sleeve formal shirts — plain, dot-textured, and fully customizable. Shop and personalise your own online.",
    images: ["/plain-full-sleeves/grey/grey-formal-solid-shirt-front.webp"],
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

// Product + ItemList schema for the three live full-sleeve-shirt styles —
// kept in sync with full-sleeve-shirt.tsx's own productsData (id/name/
// slug/price/priceLabel/images/rating/reviewCount). If a product there is
// added, removed, or re-priced, mirror the same change here.
const shirtProducts = [
 
  {
    id: "2",
    name: "Plain Full Sleeve",
    slug: "plain-full-sleeve-shirt",
    price: 599,
    mrp: 999,
    image: "https://cluesstyle.com/plain-full-sleeves/grey/grey-formal-solid-shirt-front.webp",
    rating: 4.6,
    reviewCount: 1700,
  },
  {
    id: "3",
    name: "Dot Textured Shirts",
    slug: "dot-textured-shirts",
    price: 599,
    mrp: 999,
    image: "https://cluesstyle.com/dot-textured-full-sleeve/black/black-formal-dot-texture-shirt-front.webp",
    rating: 4.6,
    reviewCount: 1700,
  },
];

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: shirtProducts.map((p, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    item: {
      "@type": "Product",
      "@id": `https://cluesstyle.com/products/apparels/full-sleeves-shirt/${p.slug}`,
      name: p.name,
      image: p.image,
      url: `https://cluesstyle.com/products/apparels/full-sleeves-shirt/${p.slug}`,
      brand: {
        "@type": "Brand",
        name: "CluesStyle",
      },
      offers: {
        "@type": "Offer",
        url: `https://cluesstyle.com/products/apparels/full-sleeves-shirt/${p.slug}`,
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

export default function FullSleeveShirtPage() {
  return (
    <>
      <FullSleeves />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
    </>
  );
}