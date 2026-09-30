import { Metadata } from "next";
import ScreenPrintingPage from "./ScreenPrinting";



export const metadata: Metadata = {
  metadataBase: new URL("https://cluesstyle.com"),

  title: "CluesStyle - Screen Printing & Custom Tools",
  description:
    "Professional-grade screen printing, embroidery, DTF, vinyl and sublimation services for creators and businesses worldwide.",

  keywords: [
    "screen printing",
    "custom t-shirt printing",
    "DTF printing",
    "embroidery",
    "vinyl printing",
    "sublimation",
  ],

  authors: [{ name: "CluesStyle" }],

  alternates: {
    canonical: "https://cluesstyle.com",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    title: "CluesStyle - Screen Printing & Custom Tools",
    description:
      "High-quality custom printing services for apparel and branding. Fast, reliable, and scalable.",
    url: "https://cluesstyle.com",
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
    title: "CluesStyle - Screen Printing & Custom Tools",
    description:
      "Professional custom printing services including screen printing, embroidery, and more.",
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

export default function ScreenPrinting(){
return (
    <>
    <ScreenPrintingPage/>
    </>
);
}