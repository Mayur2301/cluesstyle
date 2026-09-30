// PATH: app/track-order/page.tsx
import { Metadata } from "next";
import TrackOrderClient from "./TrackOrderClient";

export const metadata: Metadata = {
  title: "Track Your Order | CluesStyle",
  description:
    "Track your CluesStyle order — see live shipment status and get a direct tracking link for Shiprocket, Delhivery, DTDC or Tirupati Courier.",
  alternates: {
    canonical: "https://cluesstyle.com/track-order",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <TrackOrderClient />;
}