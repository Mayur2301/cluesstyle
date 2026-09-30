// app/same-day-delivery/page.tsx
import { Metadata } from 'next';
import SameDayDelivery from './same-day-delivery';

export const metadata: Metadata = {
  title: 'Same Day Delivery | CluesStyle - Express Printing Services',
  description: 'Get your custom t-shirts, polos, jerseys, and embroidery delivered on the same day. Express printing services for urgent requirements in Mumbai.',
  keywords: 'same day delivery, express printing, custom t-shirts same day, urgent printing, quick delivery, t-shirt printing same day',
  alternates: {
    canonical: 'https://cluesstyle.com/same-day-delivery',
  },
  openGraph: {
    title: 'Same Day Delivery | Express Printing Services',
    description: 'Need urgent custom printing? Get same day delivery on t-shirts, polos, jerseys, and embroidery.',
    url: 'https://cluesstyle.com/same-day-delivery',
    siteName: 'CluesStyle',
    images: [
      {
        url: '/same-day-delivery-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Same Day Delivery - Express Printing',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Same Day Delivery | Express Printing Services',
    description: 'Get your custom prints delivered on the same day. Urgent orders accepted.',
    images: ['/same-day-delivery-twitter.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <SameDayDelivery />;
}