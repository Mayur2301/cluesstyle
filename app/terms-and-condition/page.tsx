// app/terms-and-condition/page.tsx
import { Metadata } from 'next';
import TermsAndCondition from './terms-and-condition';

export const metadata: Metadata = {
  title: 'Terms and Conditions | CluesStyle - Screen Printing & Custom Apparel',
  description: 'Read our terms and conditions for using CluesStyle services. Learn about order policies, intellectual property, liability, and user agreements for custom printing services.',
  keywords: 'terms and conditions, terms of service, user agreement, printing terms, custom apparel terms, legal policies',
  alternates: {
    canonical: 'https://cluesstyle.com/terms-and-condition',
  },
  openGraph: {
    title: 'Terms and Conditions | CluesStyle',
    description: 'Understand the terms governing your use of CluesStyle services. Clear, fair, and transparent policies.',
    url: 'https://cluesstyle.com/terms-and-condition',
    siteName: 'CluesStyle',
    images: [
      {
        url: '/terms-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CluesStyle Terms and Conditions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms and Conditions | CluesStyle',
    description: 'Understand the terms governing your use of CluesStyle services.',
    images: ['/terms-twitter-image.jpg'],
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
  return <TermsAndCondition />;
}