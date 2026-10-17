// app/cookies/page.tsx
import { Metadata } from 'next';
import CookiePolicy from './cookies';

export const metadata: Metadata = {
  title: 'Cookie Policy | CluesStyle',
  description:
    'Learn how CluesStyle uses cookies and similar technologies to keep you signed in, remember your cart and improve our website.',
  alternates: {
    canonical: 'https://cluesstyle.com/cookies',
  },
  openGraph: {
    title: 'Cookie Policy | CluesStyle',
    description: 'How CluesStyle uses cookies and similar technologies, and how you can control them.',
    url: 'https://cluesstyle.com/cookies',
    siteName: 'CluesStyle',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <CookiePolicy />;
}
