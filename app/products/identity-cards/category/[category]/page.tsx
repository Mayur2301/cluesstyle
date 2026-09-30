import { Metadata } from "next";
import { notFound } from "next/navigation";
import { productsData } from "@/app/lib/id-cards";
import { getCategoryBySlug, idCardCategories } from "../../categories";
import CategoryView from "./CategoryView";

interface Props {
  params: Promise<{ category: string }>;
}

function productsForCategory(categorySlug: string) {
  return productsData.filter((p) => p.categorySlug === categorySlug);
}

export function generateStaticParams() {
  return idCardCategories.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryBySlug(category);

  if (!cat) {
    return { title: "Identity Cards - Cluesstyle" };
  }

  return {
    metadataBase: new URL("https://cluesstyle.com"),
    title: `${cat.name} - Cluesstyle`,
    description: cat.description,
    alternates: {
      canonical: `https://cluesstyle.com/products/identity-cards/category/${cat.slug}`,
    },
    openGraph: {
      title: `${cat.name} - CluesStyle`,
      description: cat.description,
      url: `https://cluesstyle.com/products/identity-cards/category/${cat.slug}`,
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

export default async function CategoryProductsPage({ params }: Props) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) notFound();

  const products = productsForCategory(cat.slug);

  return <CategoryView category={cat} allCategories={idCardCategories} products={products} />;
}
