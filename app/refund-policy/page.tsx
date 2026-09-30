// app/refund-policy/page.tsx
import { Metadata } from 'next';
import RefundPolicy from './refund-policy';

export const metadata: Metadata = {
  title: 'Refund Policy | CluesStyle - Screen Printing & Custom Apparel',
  description: 'Read our comprehensive refund and cancellation policy for custom printing services. Learn about refund eligibility, return process, and terms for screen printing, DTF, and custom apparel orders.',
  keywords: 'refund policy, cancellation policy, return policy, screen printing refund, custom apparel refund, money back guarantee',
  alternates: {
    canonical: 'https://cluesstyle.com/refund-policy',
  },
  openGraph: {
    title: 'Refund Policy | CluesStyle',
    description: 'Clear and transparent refund policy for all our printing services. Customer satisfaction is our priority.',
    url: 'https://cluesstyle.com/refund-policy',
    siteName: 'CluesStyle',
    images: [
      {
        url: '/refund-policy-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CluesStyle Refund Policy',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Refund Policy | CluesStyle',
    description: 'Clear and transparent refund policy for all our printing services.',
    images: ['/refund-policy-twitter-image.jpg'],
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
  return <RefundPolicy />;
}