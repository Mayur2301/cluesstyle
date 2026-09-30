// PATH: app/checkout/page.tsx
import { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | CluesStyle",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CheckoutClient />;
}