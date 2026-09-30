// PATH: app/blogs/page.tsx
// app/blogs/page.tsx
import { Metadata } from 'next';

import BlogPage from './blogs';

export const metadata: Metadata = {
  title: 'Blog | CluesStyle - Screen Printing & Custom Apparel',
  description: 'Tips, guides and stories on custom t-shirt printing, DTF vs screen printing, corporate gifting, design trends and more from the CluesStyle team.',
  keywords: 'custom t-shirt blog, screen printing guides, DTF printing, corporate gifting ideas, apparel design trends, custom printing tips',
  alternates: {
    canonical: 'https://cluesstyle.com/blogs',
  },
  openGraph: {
    title: 'Blog | CluesStyle',
    description: 'Ideas, insights and inspiration to help you customize, brand and grow — guides, styling tips and case studies from CluesStyle.',
    url: 'https://cluesstyle.com/blogs',
    siteName: 'CluesStyle',
    images: [
      {
        url: '/blog-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CluesStyle Blog',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | CluesStyle',
    description: 'Ideas, insights and inspiration to help you customize, brand and grow.',
    images: ['/blog-twitter-image.jpg'],
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
export default function BlogsPage() {
  return (
    <>
      <BlogPage />
    </>
  );
}