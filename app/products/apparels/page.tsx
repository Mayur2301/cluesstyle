import { Metadata } from "next";
import Apparels from "./apparels";


export const metadata: Metadata = {
  metadataBase: new URL("https://cluesstyle.com/products/apparels"),

  title: "Drinkwares | Professional Drinkware",
  description:
    "Shop premium corporate office bags online in India. Discover stylish laptop, executive, and professional work bags designed for office, meetings, commuting, and business travel.",

  keywords: [
    "corporate office bags",
    "office bags",
    "professional office bags",
    "business bags",
    "work bags",
    "laptop office bags",
    "executive office bags",
    "corporate laptop bags",
    "office bags for men",
    "office bags for women",
    "premium office bags",
    "formal office bags",
    "business travel bags",
    "professional work bags",
    "office messenger bags",
  ],

  authors: [{ name: "CluesStyle" }],

  alternates: {
    canonical: "https://cluesstyle.com/products/bags/office-bag",
  },

  icons: {
    icon: "/clusstyle-emblem.ico",
    shortcut: "/clusstyle-emblem.ico",
    apple: "/clusstyle-emblem.ico",
  },

  openGraph: {
    title: "Corporate Office Bags Online India | CluesStyle",
    description:
      "Explore premium corporate office bags crafted for professionals. Stylish, durable, and functional bags for work, meetings, and business travel.",
    url: "https://cluesstyle.com/products/bags/office-bag",
    siteName: "CluesStyle",
    images: [
      {
        url: "/images/office-bag-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Corporate Office Bags by CluesStyle",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Corporate Office Bags Online India",
    description:
      "Premium office bags for modern professionals. Shop executive, laptop, and business bags online.",
    images: ["/images/office-bag-banner.jpg"],
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

export default function ScreenPrinting(){
return (
    <>
    <Apparels/>
    </>
);
}