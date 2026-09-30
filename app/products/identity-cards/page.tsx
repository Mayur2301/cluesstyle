import { Metadata } from "next";
import { idCardCategories } from "./categories";
import IdentityCardsView from "./IdentityCardsView";

export const metadata: Metadata = {
  metadataBase: new URL("https://cluesstyle.com"),
  title: "Identity Cards - Cluesstyle",
  description:
    "Choose from corporate, school, event and other identity card categories. Durable PVC ID cards with fast turnaround and bulk pricing.",
  alternates: {
    canonical: "https://cluesstyle.com/products/identity-cards",
  },
  openGraph: {
    title: "Identity Cards - CluesStyle",
    description:
      "Choose from corporate, school, event and other identity card categories.",
    url: "https://cluesstyle.com/products/identity-cards",
    siteName: "CluesStyle",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CluesStyle Identity Cards",
      },
    ],
    locale: "en_US",
    type: "website",
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

export default function IdentityCardCategoriesPage() {
  return <IdentityCardsView categories={idCardCategories} />;
}
