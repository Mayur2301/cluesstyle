// PATH: app/coming-soon/page.tsx
//
// A single, reusable "not live yet — call to order" page for Stage 1
// launch. Point any product's link/button at this page instead of its real
// product page (e.g. instead of /products/hoodies-collection/zip-hoodie,
// link to /coming-soon?product=Zip%20Hoodie) and swap the link back once
// that product is ready to sell online — nothing on this page needs
// editing per-product.
//
// Query params (all optional — the page works with none of them too):
//   ?product=Custom%20Hoodies        -> worked into the intro line + the
//        WhatsApp/enquiry text; the big headline itself stays generic
//        ("Some Products Are Now Available!") since this page is meant to
//        be shared across many not-yet-live products, not just one.
//   ?image=/coming-soon/hero.webp    -> product collage photo on the right
//        of the hero. Omit it and the page falls back to DEFAULT_HERO_IMAGE
//        below — a real photo, not a drawn placeholder — so put your own
//        collage photo at that path once (public/coming-soon/
//        default-collage.webp) and every page using this component without
//        its own ?image= just works.
//   ?back=/products/hoodies-collection -> not currently rendered as a
//        visible link on this design (the mockup this matches doesn't
//        have one), kept accepted-but-unused so existing links built with
//        &back=... from the previous version of this page don't break.
//
// Header/Footer come from the root layout's <SiteChrome> automatically —
// this file is just the page content between them, same as every other
// page in the app.

import type { Metadata } from "next";
import Image from "next/image";

// Update this in one place if the number changes — every call/WhatsApp
// link on this page reads from these three constants.
const SUPPORT_PHONE_DISPLAY = "+91 90043 63902";
const SUPPORT_PHONE_TEL = "+919004363902";

// Used whenever a page doesn't pass its own ?image=... — put a real product
// collage photo at this path (public/coming-soon/default-collage.webp) so
// the hero always shows an actual photo, never a placeholder icon grid.
const DEFAULT_HERO_IMAGE = "/coming-soon-hero.webp";

export const metadata: Metadata = {
  title: "Coming Soon — Order by Phone",
  robots: { index: false, follow: true },
};

function FeatureIcon({ path }: { path: string }) {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const FEATURES = [
  {
    label: "Premium Quality",
    sub: "Top-grade materials & long-lasting prints",
    icon: "M13 2 3 14h7l-1 8 10-12h-7l1-8z",
  },
  {
    label: "Fast Delivery",
    sub: "Same day & express options",
    icon: "M3 7.5h10.5v7.5H3zM13.5 10.5H18l3 3v1.5h-7.5zM6 18.75a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM16.5 18.75a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  },
  {
    label: "Bulk Orders",
    sub: "For teams, businesses & events",
    icon: "M12 2.75 4.5 6v6c0 5 3.2 8.6 7.5 9.25C16.3 20.6 19.5 17 19.5 12V6L12 2.75zM9 12l2 2 4-4",
  },
  {
    label: "Corporate Gifts",
    sub: "Custom solutions for your brand",
    icon: "M20.25 8.25v10.5A1.5 1.5 0 0118.75 20.25H5.25A1.5 1.5 0 013.75 18.75V8.25M2.25 6.75h19.5v3H2.25zM12 6.75V20.25M12 6.75C10.5 4.5 7.5 3 6 4.5S7 8.25 12 6.75zM12 6.75c1.5-2.25 4.5-3.75 6-2.25S17 8.25 12 6.75z",
  },
  {
    label: "Worldwide Shipping",
    sub: "We deliver globally",
    icon: "M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a13.5 13.5 0 010 18M12 3a13.5 13.5 0 000 18",
  },
];

export default async function ComingSoonPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; image?: string; back?: string }>;
}) {
  const { product, image } = await searchParams;
  const productLabel = product?.trim() || null;

  return (
    <main className="bg-white">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      {/* Background spans the full viewport width; the content inside is
         constrained to the same max-w-6xl/px-4 wrapper as the feature strip
         and the dark call banner below, so all three sections line up. */}
      <section className="w-full bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <span className="inline-block rounded-full bg-black px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white">
              We Are Live
            </span>

            <h1 className="mt-5 text-[32px] font-extrabold leading-[1.12] text-gray-900 md:text-[44px]">
              Some Products
              <br />
              Are Not Available!
            </h1>

            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-gray-500 md:text-[15px]">
              {productLabel ? (
                <>
                  We&apos;re still listing <span className="font-semibold text-gray-700">{productLabel}</span> on the
                  site. If you want to order right now, you can call and place the order.
                </>
              ) : (
                <>We are soon listing this product. If you want to order right now, you can call and place the order.</>
              )}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={`tel:${SUPPORT_PHONE_TEL}`}
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-black px-6 py-4 text-[14px] font-bold text-white transition-transform active:scale-[0.98]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.36 11.36 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.49a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.25 1.02l-2.2 2.21z" />
                  </svg>
                </span>
                Call Now to Place Your Order
                <span aria-hidden>→</span>
              </a>

              <a
                href={`tel:${SUPPORT_PHONE_TEL}`}
                className="inline-flex items-center gap-2 text-[15px] font-bold text-gray-900"
              >
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                {SUPPORT_PHONE_DISPLAY}
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm md:max-w-none">
            <div className="overflow-hidden rounded-3xl bg-transparent">
              <Image
                src={image || DEFAULT_HERO_IMAGE}
                alt={productLabel ?? "Available products"}
                width={640}
                height={640}
                className="aspect-square h-full w-full object-contain"
                priority
              />
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ── Feature strip ────────────────────────────────────────────── */}
      
    </main>
  );
}