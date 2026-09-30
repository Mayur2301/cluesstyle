// app/become-a-club/page.tsx
import { Metadata } from 'next';
import BecomeAClub from './become-a-club';

export const metadata: Metadata = {
  title: 'Become a Club | CluesStyle - Host Events & Sell Custom Merchandise',
  description: 'Join CluesStyle as a club partner! Host events, sell custom merchandise, earn from t-shirt sales, and build your community. Start your club journey today.',
  keywords: 'club partnership, host events, custom merchandise, club merchandise, event hosting, club registration, sell t-shirts',
  alternates: {
    canonical: 'https://cluesstyle.com/become-a-club',
  },
  openGraph: {
    title: 'Become a Club | Partner with CluesStyle',
    description: 'Host events, sell custom merchandise, and grow your community with CluesStyle.',
    url: 'https://cluesstyle.com/become-a-club',
    siteName: 'CluesStyle',
    images: [
      {
        url: '/club-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Become a CluesStyle Club Partner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Become a Club | Partner with CluesStyle',
    description: 'Host events, sell custom merchandise, and grow your community with CluesStyle.',
    images: ['/club-twitter-image.jpg'],
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
  return <BecomeAClub />;
}