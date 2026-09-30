// app/about-us/page.tsx
import { Metadata } from 'next';
import AboutUs from './about-us';

export const metadata: Metadata = {
  title: 'About Us | CluesStyle - Premium Screen Printing & Custom Apparel',
  description: 'Learn about CluesStyle - your trusted partner for professional screen printing, embroidery, DTF transfers, and custom apparel solutions. Discover our story, mission, and commitment to quality.',
  keywords: 'about us, screen printing company, custom apparel, printing services, CluesStyle story, mission and vision',
  alternates: {
    canonical: 'https://cluesstyle.com/about-us',
  },
  openGraph: {
    title: 'About CluesStyle | Professional Printing Services',
    description: 'Discover the story behind CluesStyle - delivering premium quality screen printing and custom apparel solutions since 2015.',
    url: 'https://cluesstyle.com/about-us',
    siteName: 'CluesStyle',
    images: [
      {
        url: '/about-us-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CluesStyle - About Us',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About CluesStyle | Professional Printing Services',
    description: 'Discover the story behind CluesStyle - delivering premium quality screen printing and custom apparel solutions.',
    images: ['/about-us-twitter-image.jpg'],
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
  return <AboutUs />;
}