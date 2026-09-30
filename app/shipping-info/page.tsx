// PATH: app/shipping/page.tsx
// app/shipping/page.tsx
import { Metadata } from 'next';
import ShippingInfo from './shipping';

export const metadata: Metadata = {
  title: 'Shipping Information | CluesStyle - Screen Printing & Custom Apparel',
  description: 'Learn about CluesStyle shipping — delivery timelines across India, pincode coverage, courier partners, tracking and our end-to-end shipping process.',
  keywords: 'shipping information, delivery timeline, pan india delivery, order tracking, courier partners, custom apparel shipping',
  alternates: {
    canonical: 'https://cluesstyle.com/shipping',
  },
  openGraph: {
    title: 'Shipping Information | CluesStyle',
    description: 'Fast, reliable and trackable shipping across India — see delivery timelines, pincode coverage and how our shipping process works.',
    url: 'https://cluesstyle.com/shipping',
    siteName: 'CluesStyle',
    images: [
      {
        url: '/shipping-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CluesStyle Shipping Information',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shipping Information | CluesStyle',
    description: 'Fast, reliable and trackable shipping across India.',
    images: ['/shipping-twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function Page() {
  return <ShippingInfo />;
}