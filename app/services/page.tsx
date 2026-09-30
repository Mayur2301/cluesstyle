// app/services/page.tsx
import { Metadata } from 'next';
import Services from './service';

export const metadata: Metadata = {
  title: 'Services | CluesStyle - Professional Screen Printing & Custom Apparel',
  description: 'Explore our comprehensive printing services including screen printing, embroidery, DTF transfers, vinyl printing, sublimation, and custom apparel solutions for businesses and events.',
  keywords: 'screen printing, embroidery services, DTF printing, vinyl printing, sublimation printing, custom t-shirts, bulk printing, corporate merchandise',
  alternates: {
    canonical: 'https://cluesstyle.com/services',
  },
  openGraph: {
    title: 'Our Services | Professional Printing Solutions',
    description: 'From screen printing to embroidery, we offer complete custom printing solutions for your brand.',
    url: 'https://cluesstyle.com/services',
    siteName: 'CluesStyle',
    images: [
      {
        url: '/services-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CluesStyle Printing Services',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Services | Professional Printing Solutions',
    description: 'From screen printing to embroidery, we offer complete custom printing solutions.',
    images: ['/services-twitter-image.jpg'],
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
  return <Services />;
}