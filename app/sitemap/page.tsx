// PATH: app/sitemap/page.tsx
import { Metadata } from "next";
import SitemapPage from "./SitemapPage";

export const metadata: Metadata = {
  title: "Sitemap | CluesStyle",
  description: "Browse every page on CluesStyle — all product categories, services, and company pages in one place.",
  alternates: {
    canonical: "https://cluesstyle.com/sitemap",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <SitemapPage />;
}