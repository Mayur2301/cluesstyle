// app/cookies/cookies.tsx
import Link from 'next/link';

const LAST_UPDATED = 'October 2026';

const cookieTable = [
  {
    name: 'token',
    purpose: 'Keeps you signed in to your CluesStyle account after you log in or register.',
    type: 'Strictly necessary',
    duration: '7 days',
  },
  {
    name: 'userType',
    purpose: 'Remembers your account type so we can send you to the right dashboard.',
    type: 'Strictly necessary',
    duration: 'Session / until you log out',
  },
  {
    name: 'admin_session',
    purpose: 'Used only by CluesStyle staff to access the admin dashboard. Never set for customers.',
    type: 'Strictly necessary',
    duration: 'Limited-time session',
  },
];

const storageTable = [
  {
    name: 'Shopping cart',
    purpose: 'Remembers the items in your cart on this device between visits.',
  },
  {
    name: 'Design drafts',
    purpose: 'Saves your in-progress custom designs so you do not lose them if you leave the page.',
  },
  {
    name: 'Recently viewed products',
    purpose: 'Shows you the products you looked at recently.',
  },
  {
    name: 'Display preferences',
    purpose: 'Remembers small interface choices, such as the position of the feedback button.',
  },
];

const sections = [
  {
    title: 'What are cookies?',
    body: [
      'Cookies are small text files that a website stores on your browser or device. They help the site recognise you, remember your choices and work properly. Similar technologies, such as your browser’s local storage, do a comparable job and are covered by this policy too.',
    ],
  },
  {
    title: 'How we use them',
    body: [
      'We keep our use of cookies to what is needed to run the store. We use them to keep you signed in, to carry your cart and custom designs from page to page, and to understand which parts of our website are used so we can improve them.',
      'We do not use cookies to sell your personal information, and we do not run third-party advertising cookies on our site.',
    ],
  },
  {
    title: 'Understanding how the site is used',
    body: [
      'To improve our pages, we record basic interaction data such as which link or area of a page was clicked, the page it was on, your screen size and browser type. This is used in aggregate, in an internal heat-map for our team, to see which parts of the site are useful and which are confusing. It is not used to identify you personally or to show you ads.',
    ],
  },
  {
    title: 'Third-party services',
    body: [
      'Some features load services from other companies, and those companies may set their own cookies under their own policies:',
      '• Razorpay: when you pay online, the secure Razorpay checkout loads on our payment page and may set cookies for fraud prevention and to complete your payment.',
      '• Chat and feedback tools: if you use a chat or feedback widget on our site, the provider may store cookies to keep your conversation going.',
      '• Embedded content: videos or maps placed on a page may set cookies from the provider that hosts them.',
      'We do not control these third-party cookies. Please see the privacy policy of each provider for details.',
    ],
  },
  {
    title: 'Managing and deleting cookies',
    body: [
      'You can control cookies through your browser settings: you can block them, delete existing ones or be asked before one is stored. Each browser does this slightly differently, so check your browser’s help section.',
      'Please note that if you block the strictly necessary cookies above, you will not be able to sign in, and parts of checkout and your account may not work. Your cart and design drafts are stored in your browser, so clearing site data will remove them.',
    ],
  },
  {
    title: 'Changes to this policy',
    body: [
      'We may update this Cookie Policy when we change how the site works or when the law requires it. The date at the top of this page shows when it was last updated.',
    ],
  },
];

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-b from-violet-50 via-violet-50/60 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-10">
          <nav className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
            <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
            <span>/</span>
            <span className="font-semibold text-gray-800">Cookie Policy</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">Cookie Policy</h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-gray-600 leading-relaxed">
            This page explains what cookies are, which ones CluesStyle uses, and how you can control them.
          </p>
          <p className="mt-2 text-xs text-gray-500">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 space-y-10">
        {sections.slice(0, 3).map((s) => (
          <Section key={s.title} title={s.title} body={s.body} />
        ))}

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Cookies we set</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Cookie</th>
                  <th className="px-4 py-3 font-semibold">Purpose</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cookieTable.map((c) => (
                  <tr key={c.name}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600 min-w-[220px]">{c.purpose}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.type}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Stored in your browser</h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3">
            Besides cookies, we use your browser’s local storage. This data stays on your device and is not sent to us until you place an order.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {storageTable.map((c) => (
                  <tr key={c.name}>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {sections.slice(3).map((s) => (
          <Section key={s.title} title={s.title} body={s.body} />
        ))}

        <section className="rounded-2xl border border-violet-100 bg-violet-50/60 p-6">
          <h2 className="text-lg font-bold text-gray-900">Questions?</h2>
          <p className="mt-1 text-sm text-gray-600">
            If you have any questions about how we use cookies, get in touch. You can also read our{' '}
            <Link href="/privacy-policy" className="font-semibold text-violet-700 hover:underline">Privacy Policy</Link>.
          </p>
          <Link
            href="/contact-us"
            className="mt-4 inline-flex rounded-full bg-black px-5 py-2 text-sm font-bold text-white transition hover:bg-gray-800"
          >
            Contact us
          </Link>
        </section>
      </div>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string[] }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
      <div className="space-y-2 text-sm sm:text-base text-gray-600 leading-relaxed">
        {body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}
