import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { productsData as oversizedProducts } from "@/app/lib/oversized-products";
// import { productsData as bagProducts } from "@/app/lib/bag-products";
// import other product files as you add them...

const allProducts = [
  ...oversizedProducts,
  // ...bagProducts,
];

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "logs", "clicks.log");
    const fileContent = await fs.readFile(filePath, "utf8");

    const logs = fileContent
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try { return JSON.parse(line); }
        catch { return null; }
      })
      .filter(Boolean);

    const productLogs = logs.filter((log: any) => {
      if (!log.href || log.href.includes("(no href)")) return false;

      // Only keep URLs with exactly 4 path segments after domain:
      // /products/category/subcategory/product-slug
      const segments = log.href.split("/").filter(Boolean);
      return segments.length === 4 && segments[0] === "products";
    });

    const uniqueProducts = [];
    const seen = new Set();

    for (const item of productLogs.reverse()) {
      if (!seen.has(item.href)) {
        seen.add(item.href);

        // Last segment is always the product slug
        const segments = item.href.split("/").filter(Boolean);
        const slug = segments[3]; // products / category / subcategory / slug

        // Look up product image
        const product = allProducts.find((p) => p.slug === slug);

        const image =
          product?.colors?.[0]?.media?.find((m) => m.type === "image")?.src ??
          product?.media?.find((m) => m.type === "image")?.src ??
          product?.images?.[0] ??
          null;

        uniqueProducts.push({
  href: item.href,
  text: product?.name ?? item.text,
  timestamp: item.timestamp,
  image,
  slug,
});
      }
    }

    return NextResponse.json(uniqueProducts.slice(0, 4));
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}