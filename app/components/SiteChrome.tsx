// PATH: app/components/SiteChrome.tsx
"use client";

import { usePathname } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import MobileBottomNav from "@/app/components/MobileBottomNav";
import CustomCursor from "@/app/components/CustomCursor";
import ScrollToTop from "@/app/components/ScrollToTop";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    // Admin has its own layout (app/admin/(protected)/layout.tsx) with its
    // own header/nav — no storefront Header/Footer/MobileBottomNav here.
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <CustomCursor />
      <ScrollToTop />
      <Footer />
      <MobileBottomNav />
    </div>
  );
}