// PATH: app/components/PopularSearches.tsx
//
// Reusable "Popular Searches" block — same look on every product detail
// page (gold-arrow heading + rows of "|"-separated links), but each page
// now supplies its own real links instead of the old hardcoded, repeated
// t-shirt list. Drop this in wherever the old inline <section> was:
//
//   <PopularSearches
//     items={[
//       { label: "Cotton T-Shirts", href: "/products/apparels/round-neck-t-shirt" },
//       { label: "Polyester T-Shirts", href: "/products/apparels/round-neck-t-shirt" },
//       { label: "Half Sleeve T-Shirts", href: "/products/apparels/round-neck-t-shirt" },
//       { label: "Full Sleeve T-Shirts For Men", href: "/products/apparels/full-sleeves-shirt" },
//       { label: "Round Neck T-Shirt For Men", href: "/products/apparels/round-neck-t-shirt" },
//       // ...as many as you want — they're auto-wrapped into rows of 5
//     ]}
//   />
//
// `title` and `itemsPerRow` are optional — defaults match the original
// design (heading "Popular Searches", 5 links per row).

import Link from "next/link";

export type PopularSearchItem = { label: string; href: string };

interface PopularSearchesProps {
  items: PopularSearchItem[];
  title?: string;
  itemsPerRow?: number;
}

export default function PopularSearches({
  items,
  title = "Popular Searches",
  itemsPerRow = 5,
}: PopularSearchesProps) {
  if (!items || items.length === 0) return null;

  const rows: PopularSearchItem[][] = [];
  for (let i = 0; i < items.length; i += itemsPerRow) {
    rows.push(items.slice(i, i + itemsPerRow));
  }

  return (
    <section className="bg-white py-10 px-6 sm:px-6 md:px-15">
      <div className="max-w-[1500px] mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <img
            src="https://cdn.cluesstyle.com/public/gold-arrow.png"
            alt="arrow"
            className="w-7 h-7 sm:w-8 sm:h-8"
          />
          <h2 className="text-2xl font-semibold sm:text-3xl md:text-4xl">{title}</h2>
        </div>
        <div className="space-y-4 md:px-15 text-[14px] sm:text-[16px] text-[#000]">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="leading-loose flex flex-wrap gap-x-0 gap-y-1">
              {row.map((item, i) => (
                <span key={i} className="inline-flex items-center">
                  <Link href={item.href} className="hover:underline">
                    {item.label}
                  </Link>
                  {i < row.length - 1 && <span className="mx-2 text-gray-300">|</span>}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}