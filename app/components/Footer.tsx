'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaTruck,
  FaShieldAlt,
  FaHeadset,
  FaBoxOpen,
  FaTimesCircle,
  FaQuestionCircle,
  FaShippingFast,
  FaBuilding,
  FaBriefcase,
  FaBlog,
  FaBullhorn,
  FaFileContract,
  FaUndo,
  FaTshirt,
  FaCube,
  FaPenNib,
  FaUsers,
  FaCertificate,
  FaShoppingBag ,
  FaEnvelope,
  FaLock,
  FaChevronUp,
  FaSyncAlt,
  FaMoneyBillWave,
  FaCheckCircle,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';

/* ── Pages where footer is hidden ── */
const HIDDEN_PATHS = ['/services/screen-printing/t-shirts',
  '/products/bags/tote-bag',
  '/products',
  '/products/executive-kit',
  '/products/bottle',
  '/products/certificate-frame',
  '/products/bags/office-bag',
  '/products/bags/sports-bag',
  '/products/drinkware',
  '/products/drinkware/water-bottle',
  '/products/drinkware/temperature-water-bottle',
  '/products/drinkware/stainless-steel-bottles',
  '/products/drinkware/stainless-steel-mug',
  '/products/apparels',
  '/products/apparels/polo-t-shirt',
  '/products/apparels/hoodies',
  '/products/apparels/round-neck-t-shirt',
  '/products/apparels/oversized-t-shirt',
  '/products/apparels/sports-jersey',
  '/products/apparels/full-sleeves-shirt',
  '/products/caps-collection',
  '/products/caps-collection/promotional-cap',
  '/products/caps-collection/cotton-cap',
  '/products/certificate-frames',
  '/products/umbrella-collection',
  '/products/umbrella-collection/c-shape-umbrella',
  '/products/umbrella-collection/uv-umbrella',
  '/products/visiting-cards',
  '/products/visiting-cards/pvc-plastic-card',
  '/products/visiting-cards/textured-paper',
  '/products/visiting-cards/non-tearable-visiting-cards',
  '/products/visiting-cards/square-shaped-visiting-cards',
  '/products/visiting-cards/standard-visiting-cards',
  '/products/visiting-cards/uv-glossy-visiting-cards',
  '/products/batch-collection',
  '/products/batch-collection/pin-back-badges',
  '/products/batch-collection/fridge-magnet-badge',
  '/products/batch-collection/rectangle-badge',
  '/products/batch-collection/shirt-magnet-badge',
  '/products/batch-collection/keychains',
  '/products/trophies-collection',
  '/products/trophies-collection/crystal-glass-trophies',
  '/products/trophies-collection/metal-brass-trophies',
  '/products/trophies-collection/acrylic-trophies',
  '/products/trophies-collection/sports-award-trophies',
  '/products/umbrella-collection/mini-capsule-umbrella',
  '/products/umbrella-collection/mini-travel-umbrella',
  '/products/umbrella-collection/bottle-umbrella',
  '/products/certificate-frames/canvas-frames',
  '/products/certificate-frames/blacklit-led-frames',
  '/products/certificate-frames/award-and-certificate-frame',
  '/products/certificate-frames/sandwich-frames',
  '/products/caps-collection/embroidery-cap',
  '/products/caps-collection/polymix-cap',
  '/products/caps-collection/printed-cap',
  '/products/caps-collection/gulf-cap',
  '/products/caps-collection/jeans-cap',
  '/products/caps-collection/child-cap',
  '/products/caps-collection/sports-cap',
  '/products/drinkware/stainless-steel-tumbler',
  '/products/bags',
  '/dashboard/user',
  'dashboard/user/order',
  '/products/sports/football',
  '/products/sports/football/dot-textured-shirts',
  '/products/sports/football/round-neck-full-sub-football-jersey',
  '/products/sports/football/collar-t-shirt-full-sublimation',
  '/products/sports/football/football-apparel-kit',
  '/products/sports/football/full-sleeve-football-jersey',
  '/products/sports/football/sleeveless-sports-jersey',
  '/products/sports/cricket',
  '/products/sports/basketball/football-apparel-kit',
  '/products/sports/basketball',
  '/products/identity-cards/category/corporate',
  '/products/identity-cards',
  '/products/identity-cards/category/event',
  '/products/identity-cards/category/school',
  '/products/badge-collection',
  '/products/bags/tote-bag/natural-canvas-tote-bag/sizes',
  '/products/bags/tote-bag/black-canvas-tote-bag/sizes',
  '/products/frames',
  '/products/umbrella',
  '/products/sports/cricket/collar-t-shirt-full-sublimation',



];

/* ── Pages where footer links are disabled ── */
const DISABLED_LINK_PATHS = [
  '/services/screen-printing',
  '/services/mockups',
   '/products/bottle',

  ];

const customerServiceLinks: { label: string; href: string; Icon: IconType }[] = [
  { label: 'Contact Us', href: '/contact-us', Icon: FaHeadset },
  { label: 'Track Order', href: '/track-order', Icon: FaTruck },
  { label: 'Return Order', href: '/return-order', Icon: FaBoxOpen },
 
  
  { label: 'Shipping Info', href: '/shipping-info', Icon: FaShippingFast },
];

const companyLinks: { label: string; href: string; Icon: IconType }[] = [
  { label: 'About Us', href: '/about', Icon: FaBuilding },
  
  { label: 'Blog', href: '/blogs', Icon: FaBlog },
 
  { label: 'Privacy Policy', href: '/privacy-policy', Icon: FaShieldAlt },
  { label: 'Terms of Service', href: '/terms-and-condition', Icon: FaFileContract },
  { label: 'Refund Policy', href: '/refund-policy', Icon: FaUndo },
];

const servicesLinks: { label: string; href: string; Icon: IconType }[] = [
  { label: 'Polo Tshirts', href: '/products/apparels/polo-t-shirt', Icon: FaTshirt },
  { label: 'Hoodies', href: '/products/apparels/hoodies', Icon: FaTshirt  },
  { label: 'Tote Bags', href: '/products/bags/tote-bag', Icon: FaShoppingBag  },
  { label: 'Badges', href: '/products/badge-collection', Icon: FaCertificate },
];

// Each social icon carries its own real brand color, swapped in on hover.
const socialIcons: { Icon: IconType; href: string; label: string; brandColor: string }[] = [
  { Icon: FaFacebookF,  href: '#', label: 'Facebook',  brandColor: '#1877F2' },
  { Icon: FaInstagram,  href: '#', label: 'Instagram', brandColor: '#E1306C' },
  { Icon: FaTwitter,    href: '#', label: 'Twitter',   brandColor: '#1DA1F2' },
  { Icon: FaLinkedinIn, href: '#', label: 'LinkedIn',  brandColor: '#0A66C2' },
  { Icon: FaYoutube,    href: '#', label: 'YouTube',   brandColor: '#FF0000' },
];

const trustBadges: { Icon: IconType; title: string; subtitle: string; bg: string; color: string }[] = [
  { Icon: FaTruck,       title: 'Fast Shipping',     subtitle: 'Pan India Delivery', bg: '#dbeafe', color: '#2563eb' },
  { Icon: FaCheckCircle, title: 'Secure Payments',   subtitle: '100% Safe & Secure', bg: '#d1fae5', color: '#059669' },
  { Icon: FaBoxOpen,     title: 'Easy Returns',      subtitle: '15 Days Policy*',    bg: '#fef3c7', color: '#d97706' },
  { Icon: FaHeadset,     title: 'Dedicated Support', subtitle: 'Here to Help',       bg: '#fce7f3', color: '#db2777' },
];

const sitemapLinks: { label: string; href: string }[] = [
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'Cookies', href: '/cookies' },
  // { label: 'Terms', href: '/terms-and-condition' },
  // { label: 'Privacy', href: '/privacy-policy' },
];

const BG      = '#0c0f16';
const ACCENT  = '#ffffff';
const MUTED   = '#9aa1ad';
const ICON_BG = '#1c1f28';

type LinkItemProps = {
  label: string;
  href: string;
  Icon: IconType;
  disabled?: boolean;
};

function LinkItem({ label, href, Icon, disabled }: LinkItemProps) {
  if (disabled) {
    return (
      <li className="flex items-center gap-2.5">
        <Icon className="text-[13px] flex-shrink-0" style={{ color: MUTED }} />
        <span
          className="text-[13px] line-through select-none cursor-not-allowed"
          style={{ color: '#5a5f6b' }}
          title="Not available on this page"
        >
          {label}
        </span>
      </li>
    );
  }
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-2.5 text-[13px] no-underline transition-colors hover:!text-white"
        style={{ color: MUTED }}
      >
        <Icon className="text-[13px] flex-shrink-0" style={{ color: MUTED }} />
        {label}
      </Link>
    </li>
  );
}

export default function Footer() {
  const pathname = usePathname();
  if (HIDDEN_PATHS.includes(pathname)) return null;
  const linksDisabled = DISABLED_LINK_PATHS.includes(pathname);

  return (
    <footer style={{ background: BG, color: MUTED, fontFamily: 'inherit' }}>
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 pt-10 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Col 1 — Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <img src="/cluesstyle-white-logo.png" alt="CluesStyle" className="h-20 w-auto" />
            </div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: MUTED }}>
              Customize&nbsp;|&nbsp;Print&nbsp;|&nbsp;Brand&nbsp;|&nbsp;Gift
            </p>
            <span className="text-[13px] leading-relaxed mb-5" style={{ color: MUTED }}>
              Your one-stop destination for custom apparel, corporate gifts, print solutions and more.
            </span>
            <div className="flex items-center gap-2.5 mb-4">
              {socialIcons.map(({ Icon, href, label, brandColor }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                  style={{ background: ICON_BG, color: ACCENT }}
                  onMouseOver={(e) => { e.currentTarget.style.background = brandColor; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = ICON_BG; }}
                >
                  <Icon className="text-[14px]" />
                </a>
              ))}
            </div>
            <p className="text-[12px]" style={{ color: MUTED }}>4.7M+ People like this</p>
          </div>

          {/* Col 2 — Customer Service */}
          <div>
            <p className="text-[13px] font-bold uppercase tracking-wide mb-4" style={{ color: ACCENT }}>
              Customer Service
            </p>
            <ul className="list-none m-0 p-0 flex flex-col gap-3">
              {customerServiceLinks.map((l) => (
                <LinkItem key={l.label} {...l} disabled={linksDisabled} />
              ))}
            </ul>

            <div
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 border"
              style={{ borderColor: '#232733' }}
            >
              <FaSyncAlt className="text-[13px] flex-shrink-0" style={{ color: '#60a5fa' }} />
              <span className="text-[12px] font-semibold" style={{ color: ACCENT }}>15 Days Return Policy*</span>
            </div>
          </div>

          {/* Col 3 — Company */}
          <div>
            <p className="text-[13px] font-bold uppercase tracking-wide mb-4" style={{ color: ACCENT }}>
              Company
            </p>
            <ul className="list-none m-0 p-0 flex flex-col gap-3">
              {companyLinks.map((l) => (
                <LinkItem key={l.label} {...l} disabled={linksDisabled} />
              ))}
            </ul>
          </div>

          {/* Col 4 — Services */}
          <div>
            <p className="text-[13px] font-bold uppercase tracking-wide mb-4" style={{ color: ACCENT }}>
              Products
            </p>
            <ul className="list-none m-0 p-0 flex flex-col gap-3">
              {servicesLinks.map((l) => (
                <LinkItem key={l.label} {...l} disabled={linksDisabled} />
              ))}
            </ul>

            <div
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 border"
              style={{ borderColor: '#232733' }}
            >
              <FaMoneyBillWave className="text-[13px] flex-shrink-0" style={{ color: '#34d399' }} />
              <span className="text-[12px] font-semibold" style={{ color: ACCENT }}>Cash On Delivery*</span>
            </div>
          </div>

          {/* Col 5 — Keep Up To Date */}
          <div>
            <p className="text-[13px] font-bold uppercase tracking-wide mb-4" style={{ color: ACCENT }}>
              Keep Up To Date
            </p>
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: MUTED }}>
              Get the latest updates, new arrivals, exclusive offers and more.
            </p>
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: '#232733' }}>
              <div className="flex items-center pl-3" style={{ background: '#151822' }}>
                <FaEnvelope className="text-[13px]" style={{ color: MUTED }} />
              </div>
              <input
                type="email"
                placeholder="Enter Email Id"
                className="flex-1 min-w-0 text-[13px] px-3 py-3 outline-none"
                style={{ background: '#151822', color: ACCENT, border: 'none' }}
              />
              <button
                className="px-4 text-[12px] font-bold uppercase tracking-wide whitespace-nowrap"
                style={{ background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                Subscribe
              </button>
            </div>
            <div className="flex items-start gap-2 mt-4">
              <FaLock className="text-[12px] mt-0.5 flex-shrink-0" style={{ color: MUTED }} />
              <span className="text-[12px] leading-relaxed" style={{ color: MUTED }}>
                Your data is safe with us. We never share your information with third parties. Unsubscribe anytime.
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Trust badges row ── */}
      <div className="border-t" style={{ borderColor: '#1c1f28' }}>
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {trustBadges.map(({ Icon, title, subtitle, bg, color }) => (
              <div key={title} className="flex items-center gap-3">
                <span
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: bg, color }}
                >
                  <Icon className="text-[16px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold m-0" style={{ color: ACCENT }}>{title}</p>
                  <span className="text-[15px] m-0" style={{ color: MUTED }}>{subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom copyright bar ── */}
      <div className="border-t" style={{ borderColor: '#1c1f28' }}>
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[12px] m-0" style={{ color: MUTED }}>
            © {new Date().getFullYear()} Cluesstyle.com. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            {sitemapLinks.map((l, i) => (
              <span key={l.label} className="flex items-center gap-5">
                <Link href={l.href} className="text-[12px] no-underline hover:!text-white transition-colors" style={{ color: MUTED }}>
                  {l.label}
                </Link>
                {i < sitemapLinks.length - 1 && <span style={{ color: '#2a2e3a' }}>|</span>}
              </span>
            ))}

            
          </div>
        </div>
      </div>
    </footer>
  );
}