export interface RecentlyViewedProduct {
  slug: string;
  name: string;
  image: string;
  price: number;
  url: string;
}

const STORAGE_KEY = "recentlyViewed";

export const saveRecentlyViewed = (
  product: RecentlyViewedProduct
) => {
  if (typeof window === "undefined") return;

  try {
    const existing = localStorage.getItem(STORAGE_KEY);

    let products: RecentlyViewedProduct[] = existing
      ? JSON.parse(existing)
      : [];

    products = products.filter(
      (item) => item.slug !== product.slug
    );

    products.unshift(product);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(products.slice(0, 12))
    );
  } catch (error) {
    console.error("Failed to save recently viewed:", error);
  }
};

export const getRecentlyViewed = (): RecentlyViewedProduct[] => {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);

    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};