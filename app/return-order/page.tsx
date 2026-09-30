// PATH: app/return-order/page.tsx
import { Metadata } from "next";
import ReturnOrderClient from "./ReturnOrderClient";

export const metadata: Metadata = {
  title: "Request a Return | CluesStyle",
  description:
    "Request a return or refund for your CluesStyle order — select your order, choose the items, tell us why, and we'll arrange pickup and refund.",
  alternates: {
    canonical: "https://cluesstyle.com/return-order",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <ReturnOrderClient />;
}
