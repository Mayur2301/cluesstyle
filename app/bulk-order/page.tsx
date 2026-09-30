// app/privacy-policy/page.tsx
import { Metadata } from 'next';
import BulkOrderPage from './bulk-order';

export const metadata: Metadata = {
  title: 'Bulk Orders | CluesStyle - Screen Printing & Custom Apparel',
  description: 'Read our privacy policy to understand how CluesStyle collects, uses, and protects your personal information. We are committed to safeguarding your privacy and data security.',
  keywords: 'privacy policy, data protection, personal information, cookie policy, GDPR compliance, data security',
  alternates: {
    canonical: 'https://cluesstyle.com/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy | CluesStyle',
    description: 'Learn how CluesStyle protects your personal information and respects your privacy.',
    url: 'https://cluesstyle.com/privacy-policy',
    siteName: 'CluesStyle',
    images: [
      {
        url: '/privacy-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CluesStyle Privacy Policy',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | CluesStyle',
    description: 'Learn how CluesStyle protects your personal information and respects your privacy.',
    images: ['/privacy-twitter-image.jpg'],
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
  return <BulkOrderPage />;
}