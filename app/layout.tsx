// PATH: app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import localFont from 'next/font/local';
//import CookieConsent from "@/app/components/Cookieconsent";

import './globals.css';

import SiteChrome from '@/app/components/SiteChrome';
import CrispChat from '@/app/components/CrispChat';
import FeedbackBot from './components/Feedbackbot';

// Fonts (optimized)
const gilroy = localFont({
  src: [
    {
      path: '../public/fonts/Gilroy-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-gilroy',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

// ✅ SEO Metadata (clean + structured)
export const metadata: Metadata = {
  metadataBase: new URL('https://cluesstyle.com'),

  title: {
    default: 'CluesStyle - Custom Printing & Branding Solutions',
    template: '%s | CluesStyle',
  },

  description:
    'Professional screen printing, embroidery, DTF, vinyl and sublimation services for apparel brands and businesses.',

  keywords: [
    'custom t-shirt printing',
    'screen printing',
    'DTF printing',
    'embroidery services',
    'branding solutions',
    'custom apparel India',
  ],

  authors: [{ name: 'CluesStyle' }],
  creator: 'CluesStyle',

  alternates: {
    canonical: 'https://cluesstyle.com',
  },

  icons: {
    icon: '/clusstyle-emblem.ico',
  },

  openGraph: {
    type: 'website',
    url: 'https://cluesstyle.com',
    siteName: 'CluesStyle',
    title: 'CluesStyle - Custom Printing & Branding Solutions',
    description:
      'High-quality apparel printing and branding services for businesses and creators.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CluesStyle',
      },
    ],
    locale: 'en_IN',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'CluesStyle',
    description: 'Custom printing & branding solutions for businesses.',
    images: ['/twitter-image.jpg'],
    creator: '@cluesstyle',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// ✅ Performance + mobile optimization
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

// ✅ Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.className} ${gilroy.variable} antialiased`}
      >
        <SiteChrome>{children}</SiteChrome>
        {/* <CookieConsent /> */}
        {/* <CrispChat /> */}
        <FeedbackBot />
      </body>
    </html>
  );
}