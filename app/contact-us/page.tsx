// app/contact/page.tsx
import { Metadata } from 'next';
import Contact from './contact';

export const metadata: Metadata = {
  title: 'Contact Us | CluesStyle - Screen Printing & Custom Apparel',
  description: 'Get in touch with CluesStyle for all your custom printing needs. Request a quote, ask questions, or schedule a consultation. Our team is ready to help you bring your ideas to life.',
  keywords: 'contact us, screen printing quote, custom apparel inquiry, printing services, customer support, get a quote',
  alternates: {
    canonical: 'https://cluesstyle.com/contact',
  },
  openGraph: {
    title: 'Contact CluesStyle | Get a Quote for Custom Printing',
    description: 'Reach out to us for inquiries, quotes, or support. We respond within 24 hours.',
    url: 'https://cluesstyle.com/contact',
    siteName: 'CluesStyle',
    images: [
      {
        url: '/contact-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact CluesStyle',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact CluesStyle | Get a Quote for Custom Printing',
    description: 'Reach out to us for inquiries, quotes, or support. We respond within 24 hours.',
    images: ['/contact-twitter-image.jpg'],
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
  return <Contact />;
}