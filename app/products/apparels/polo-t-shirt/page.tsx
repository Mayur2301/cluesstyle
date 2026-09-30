import { Metadata } from "next";
import PoloTShirt from "./polo-t-shirt";

const BASE_URL = "https://cluesstyle.com";
const CANONICAL_URL = `${BASE_URL}/products/apparels/polo-t-shirt`;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: "Polo T-Shirts | Solid, Tipping Collar & Custom Polo Shirts - CluesStyle",
  description:
    "Shop polo t-shirts across solid colours, tipping collar styles, and fully custom designs. Ideal for corporate uniforms, teams, events and branding — with logo printing & embroidery available.",

  keywords: [
    "polo t-shirt",
    "solid polo neck collar",
    "tipping collar polo t-shirt",
    "custom solid polo t-shirt",
    "customized tipping polo t-shirt",
    "corporate uniform polo",
    "custom logo polo shirt",
    "cotton polo shirt",
    "bulk polo t-shirt order",
  ],

  authors: [{ name: "CluesStyle" }],

  alternates: {
    canonical: CANONICAL_URL,
  },

  icons: {
    icon: "/clusstyle-emblem.ico",
    shortcut: "/clusstyle-emblem.ico",
    apple: "/clusstyle-emblem.ico",
  },

  openGraph: {
    title: "Polo T-Shirts | Solid, Tipping Collar & Custom Polo Shirts - CluesStyle",
    description:
      "Browse our full polo t-shirt range — solid colours, tipping collar styles, and fully customizable designs with your logo. Built for uniforms, teams, events and corporate branding.",
    url: CANONICAL_URL,
    siteName: "CluesStyle",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Polo T-Shirts - CluesStyle",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Polo T-Shirts | Solid, Tipping Collar & Custom Polo Shirts",
    description:
      "Solid, tipping collar and fully custom polo t-shirts for uniforms, teams, events and corporate branding.",
    images: ["/twitter-image.jpg"],
    creator: "@cluesstyle", // optional
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

export default function PoloTShirtCategoryPage() {
  return (
    <>
      <PoloTShirt />
    </>
  );
}