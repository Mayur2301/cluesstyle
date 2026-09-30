// app/become-a-sponsor/page.tsx
import { Metadata } from 'next';
import BecomeASponsor from './become-a-sponsor';

export const metadata: Metadata = {
  title: 'Become a Sponsor | CluesStyle - Partner with Us for Events & T-Shirt Sponsorship',
  description: 'Join CluesStyle as a sponsor! Get your logo featured on event t-shirts, reach thousands of attendees, and gain valuable brand exposure. Flexible sponsorship packages starting at ₹1200.',
  keywords: 'sponsor, brand partnership, event sponsorship, t-shirt sponsorship, logo placement, brand exposure, sponsor registration',
  alternates: {
    canonical: 'https://cluesstyle.com/become-a-sponsor',
  },
  openGraph: {
    title: 'Become a Sponsor | Partner with CluesStyle',
    description: 'Get your brand noticed! Sponsor events and have your logo printed on premium t-shirts. Flexible packages and maximum visibility.',
    url: 'https://cluesstyle.com/become-a-sponsor',
    siteName: 'CluesStyle',
    images: [
      {
        url: '/sponsor-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Become a CluesStyle Sponsor',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Become a Sponsor | Partner with CluesStyle',
    description: 'Get your brand noticed! Sponsor events and have your logo printed on premium t-shirts.',
    images: ['/sponsor-twitter-image.jpg'],
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
  return <BecomeASponsor />;
}