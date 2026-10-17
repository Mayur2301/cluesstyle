'use client';

import { useState, useRef, useEffect, useCallback, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  FaHeart, FaShoppingCart, FaUser,
  FaSearch, FaBars, FaTimes,
  FaChevronDown, FaChevronRight, FaArrowRight,
  FaPhoneAlt
} from 'react-icons/fa';
import styles from './Header.module.css';
import BulkOrderModal from "../components/Bulkordermodal";
import { getCartCount } from "@/app/lib/cart";
// ─── Types ────────────────────────────────────────────────────────────────────

// `comingSoon` marks a category/sub-item that isn't live for online
// ordering yet (Stage 1 launch — see /coming-soon). When set, the mega
// menu (and the mobile drawer, for top-level categories) greys the item
// out, shows a small "Listing Soon" badge, and sends clicks to
// /coming-soon instead of the real product page — everything else about
// the item (label, icon, real href kept for later) stays as-is, so
// flipping a product live later is just deleting this one flag.
interface SubItem  { label: string; href: string; comingSoon?: boolean }
interface Category { label: string; href: string; icon?: string; children?: SubItem[]; comingSoon?: boolean }
interface FeatCard { title: string; description: string; tag: string; href: string; image?: string; emoji: string }
interface MenuData {
  categories: Category[];
  featured: FeatCard[];
  cta: { browse: string; browseLabel: string; design: string; designLabel: string; designComingSoon?: boolean };
}

// Where a `comingSoon` category/sub-item's click actually goes — the real
// href is passed along as `back` so /coming-soon can link back to that
// category page once someone taps "Back", and `product` seeds the page's
// heading/enquiry text with the item's own label.
function comingSoonHref(label: string, back: string): string {
  return `/coming-soon?product=${encodeURIComponent(label)}&back=${encodeURIComponent(back)}`;
}

// ─── Nav + Mega Menu Data ─────────────────────────────────────────────────────

const navLinks = [
  { label: 'All Products',      href: '/products' },
  //{ label: 'Same Day Delivery', href: '/same-day-delivery' },
 // { label: 'Corporate Gifts',   href: '/corporate-gifting' },
  //{ label: 'Personalised Gifts',   href: '/personalized-gifts' },
  //{ label: 'Customize',         href: '/customized-your-t-shirt' },
  { label: 'Same Day Delivery',         href: '/same-day-delivery' },
];

const megaMenus: Record<string, MenuData> = {
  'All Products': {
    categories: [
      {
        label: 'Apparel',
        href: '/products/apparels',
        icon: '/new-icons/apparel-icon.webp',
        children: [
          { label: 'Polo T-shirt',          href: '/products/apparels/polo-t-shirt' },
          
          { label: 'Hoodies',                href: '/products/apparels/hoodies' },
          { label: 'Full Sleeve Shirt',      href: '/products/apparels/full-sleeves-shirt' },
           { label: 'Round Neck T-Shirt',      href: '/products/apparels/round-neck-t-shirt' },
            { label: 'Oversized T-Shirt',      href: '/products/apparels/oversized-t-shirt' },
            { label: 'Sports Jersey',            href: '/sports-wear', comingSoon: true },
          { label: 'Apparel Collection',     href: '/products/apparels' },
          
          
        ],
      },
      {
        label: 'Bag Collections',
        href: '/products/bags',
        icon: '/new-icons/bag-collection.webp',
        comingSoon: false,
        children: [
          { label: 'Office Bag',       href: '/products/bags/office-bag' },
          { label: 'Tote Bag',         href: '/products/bags/tote-bag' },
          { label: 'Sports Bag',       href: '/products/bags/sports-bag',comingSoon: true },
          { label: 'Visit Bag Collection',   href: '/products/bags' },
        ],
      },
      

      // {
      //   label: 'Trophy Collection',
      //   href: '/products/trophies-collection',
      //   icon: '/new-icons/trophy-collection-icon.webp',
      //   children: [
      //     { label: 'Crystal Glass Trophies', href: '/products/trophies-collection/crystal-glass-trophies' },
      //     { label: 'Metal Brass Trophies',    href: '/products/trophies-collection/metal-brass-trophies' },
      //     { label: 'Acrylic Trophies',      href: '/products/trophies-collection/acrylic-trophies' },
      //     { label: 'Sports Award Trophies',    href: '/products/trophies-collection/sports-award-trophies' },
         
      //     { label: 'Visit Trophies Collection',    href: '/products/trophies-collection' },
      //   ],
      // },

      // {
      //   label: 'Visiting Cards',
      //   href: '/products/visiting-cards',
      //   icon: '/new-icons/idcard-collection-icon.webp',
      //   children: [
      //     { label: 'Standard Visiting Card', href: '/products/visiting-cards/standard-visiting-cards' },
      //     { label: 'PVC Plastic Card',    href: '/products/visiting-cards/pvc-plastic-card' }, 
      //     { label: 'Textured Card',          href: '/products/visiting-cards/textured-paper' },
      //     { label: 'Non-Tearable Visiting Card',         href: '/products/visiting-cards/non-tearable-visiting-cards' },
      //     { label: 'UV Glossy Cards',      href: '/products/visiting-cards/uv-glossy-visiting-cards' },
      //     { label: 'Visit Cards Collection',    href: '/products/visiting-cards' },
      //   ],
      // },

      {
        label: 'Pin Batches',
        href: '/products/badge-collection',
        icon: '/new-icons/pin-badges-collection-icon.webp',
        children: [
          { label: 'Round Pin Badges',     href: '/products/badge-collection/round-pin-badge' },
          { label: 'Round Magnet Badges',     href: '/products/badge-collection/round-magnet-badge' },
          { label: 'Square Pin Badges',    href: '/products/badge-collection/square-pin-badge' },
          { label: 'Square Magnet Badge',   href: '/products/badge-collection/square-magnet-badge' },
          { label: 'Rectangle Pin Badge',        href: '/products/badge-collection/rectangle-pin-badge' },
          { label: 'Rectangle Magnet Badge',        href: '/products/badge-collection/rectangle-magnet-badge' },
          
           { label: 'Visit Batches Collection',      href: '/products/badge-collection' }
        ],
      },
{
        label: 'Umbrella',
        href: '/products/umbrella',
        icon: '/new-icons/umbrella-collection-icon.webp',
        comingSoon: true,
        children: [
          { label: 'Mini Capsule Umbrella',                    href: '/products/umbrella-collection/mini-capsule-umbrella' },
          { label: 'Mini Travel Umbrella',        href: '/products/umbrella-collection/mini-travel-umbrella' },
          { label: 'C Shape Umbrella',                 href: '/products/umbrella-collection/c-shape-umbrella' },
          { label: 'UV Umbrella',             href: '/products/umbrella-collection/uv-umbrella' },
          { label: 'Bottle Umbrella',             href: '/products/umbrella-collection/bottle-umbrella' },
          { label: 'Visit Umbrella Collection',                    href: '/products/umbrella' },
        ],
      },
      {
        label: 'Cap Collection',
        href: '/products/caps-collection',
        icon: '/new-icons/cap-collection-icon.png',
        comingSoon: true,
        children: [
          { label: 'Promotional Cap',  href: '/products/caps-collection/promotional-cap' },
          { label: 'Embriodery Cap', href: '/products/caps-collection/embroidery-cap' },
          { label: 'Cotton Cap',     href: '/products/caps-collection/cotton-cap' },
          { label: 'Polymix Cap',       href: '/products/caps-collection/polymix-cap' },
           { label: 'Printed Cap',       href: '/products/caps-collection/printed-cap' },
            { label: 'Gulf Cap',       href: '/products/caps-collection/gulf-cap' },
             { label: 'Jeans Cap',       href: '/products/caps-collection/jeans-cap' },
              { label: 'Child Cap',       href: '/products/caps-collection/child-cap' },
               { label: 'Sports Cap',       href: '/products/caps-collection/sports-cap' },
          { label: 'Visit Cap Collection',       href: '/products/caps-collection' },
        ],
      },
      {
        label: 'Certificate Frames',
        href: '/products/frames',
        icon: '/new-icons/frems-collection-icon.webp',
        comingSoon: true,
        children: [
          { label: 'Canvas Frames', href: '/products/certificate-frames/canvas-frames' },
          { label: 'Backlit led Frames',    href: '/products/certificate-frames/blacklit-led-frames' },
          { label: 'Award and Certificate',      href: '/products/certificate-frames/award-and-certificate-frame' },
          { label: 'Sandwich Frames',    href: '/products/certificate-frames/sandwich-frames' },
          
          { label: 'Visit Certificate Frames',    href: '/products/certificate-frames' },
        ],
      },
      // {
      //   label: 'Drinkwares',
      //   href: '/products/drinkware',
      //   icon: '/new-icons/drinkwear-collection-icon.webp',
      //   children: [
      //     { label: 'Stainless Steel Bottles',       href: '/products/drinkware/stainless-steel-bottles' },
      //     { label: 'Stainless Steel Mug',  href: '/products/drinkware/stainless-steel-mug' },
      //     { label: 'Temperature Water Bottle',      href: '/products/drinkware/temperature-water-bottle' },
      //     { label: 'Water Bottle',         href: '/products/drinkware/water-bottle' },
      //     { label: 'Stainless Steel Tumbler', href: '/products/drinkware/stainless-steel-tumbler' },
          
      //     { label: 'Visit Drinkware Collection',   href: '/products/drinkware' },
      //   ],
      // },

    ],
    featured: [
      {
        title: 'Basic T-Shirts',
        description: 'Affordable t-shirts perfect for any occasion.',
        tag: 'Best Sellers',
        href: '/shop/basic',
        image: '/basic-tshirt.png',
        emoji: '',
      },
      {
        title: 'GRAPHICS T-SHIRTS',
        description: 'Modern cut tees with super-soft fabrics.',
        tag: 'Best Sellers',
        href: '/shop/premium',
        image: '/premium-graphics.png',
        emoji: '',
      },
      {
        title: 'Corporate Bulk Orders',
        description: 'Need just one custom tee? Start here.',
        tag: 'Our Picks',
        href: '/corporate-order',
        image: '/corporate-order.png',
        emoji: '🎯',
      },
    ],
    cta: { browse: '/products', browseLabel: 'Browse All Products', design: '/customized-your-t-shirt', designLabel: 'Design Your Own', designComingSoon: true },
  },

  // 'Same Day Delivery': {
  //   categories: [
  //     { label: 'Same Day Orders',  href: '/same-day-delivery',          icon: '/shop.png' },
  //     { label: 'Express Printing', href: '/same-day-delivery#express',  icon: '/shop.png' },
  //     { label: 'Rush Orders',      href: '/same-day-delivery#rush',     icon: '/shop.png' },
  //     { label: 'Order Tracking',   href: '/same-day-delivery#tracking', icon: '/shop.png' },
  //   ],
  //   featured: [
  //     {
  //       title: 'Same Day Delivery',
  //       description: 'Delivered in just 60 mins',
  //       tag: 'Most Viewed',
  //       href: '/same-day-delivery',
  //       image: '/same-day-delivery.webp',
  //       emoji: '',
  //     },
  //     {
  //       title: 'Exclusive Merch',
  //       description: 'Delivered in just 60 mins',
  //       tag: 'Most Viewed',
  //       href: '/exclusive-merch',
  //       image: '/exclusive-merch.webp',
  //       emoji: '',
  //     },
  //   ],
  //   cta: { browse: '/same-day-delivery', browseLabel: 'View All Options', design: '/customized-your-t-shirt', designLabel: 'Start Designing' },
  // },

  'Corporate Gifts': {
    categories: [
      { label: 'Branded Collection', href: '/shop/branded',            icon: '/shop.png' },
      { label: 'Bulk Order',         href: '/bulk-order',              icon: '/shop.png' },
      { label: 'Custom Packaging',   href: '/shop/branded#packaging',  icon: '/shop.png' },
      { label: 'Gift Cards',         href: '/shop/gift-cards',         icon: '/shop.png' },
      { label: 'Event Merch',        href: '/shop/branded#events',     icon: '/shop.png' },
    ],
    featured: [
      {
        title: 'Exclusive Merch',
        description: 'Delivered in just 60 mins',
        tag: 'Most Viewed',
        href: '/exclusive-merch',
        image: '/exclusive-merch.webp',
        emoji: '',
      },
      { title: 'BULK ORDERS', description: 'Discounts start at 12 pieces.', tag: 'Save More', href: '/shop/branded#bulk', emoji: '📦' },
    ],
    cta: { browse: '/shop/branded', browseLabel: 'Browse Corporate', design: '/customized-your-t-shirt', designLabel: 'Get a Quote' },
  },


  'Personalised Gifts': {
    categories: [
      { label: 'Birthday Collection', href: '/shop/branded',            icon: '/shop.png' },
      { label: 'Aniversary Collection',         href: '/bulk-order',              icon: '/shop.png' },
      { label: 'Kids Collection',   href: '/shop/branded#packaging',  icon: '/shop.png' },
      { label: 'Valentine Day Collection',         href: '/shop/gift-cards',         icon: '/shop.png' },
      { label: 'Friendship Collection',        href: '/shop/branded#events',     icon: '/shop.png' },
      { label: 'Couple Collection',        href: '/shop/branded#events',     icon: '/shop.png' },
      { label: 'Family Collection',        href: '/shop/branded#events',     icon: '/shop.png' },
    ],
    featured: [
      {
        title: 'Exclusive Merch',
        description: 'Delivered in just 60 mins',
        tag: 'Most Viewed',
        href: '/exclusive-merch',
        image: '/exclusive-merch.webp',
        emoji: '',
      },
      { title: 'BULK ORDERS', description: 'Discounts start at 12 pieces.', tag: 'Save More', href: '/shop/branded#bulk', emoji: '📦' },
    ],
    cta: { browse: '#', browseLabel: 'Browse Gifts', design: '/customized-your-t-shirt', designLabel: 'Get a Quote' },
  },

  Apparel: {
    categories: [
      { label: 'New Arrivals',    href: '/shop/collections#new',      icon: '/icons/cat-new.png' },
      { label: 'Limited Edition', href: '/shop/limited',              icon: '/icons/cat-limited.png' },
      { label: 'Seasonal Drops',  href: '/shop/collections#seasonal', icon: '/icons/cat-seasonal.png' },
      { label: 'Sale Items',      href: '/shop/collections#sale',     icon: '/icons/cat-sale.png' },
      { label: 'All Collections', href: '/shop/collections',          icon: '/icons/cat-collections.png' },
    ],
    featured: [
      { title: 'LIMITED EDITION', description: 'Rare and limited stock items.', tag: 'Exclusive', href: '/shop/limited', emoji: '🌟' },
      { title: 'NEW ARRIVALS', description: 'Fresh styles added every week.', tag: 'New', href: '/shop/collections#new', emoji: '🆕' },
    ],
    cta: { browse: '/shop/collections', browseLabel: 'All Apparel', design: '/customized-your-t-shirt', designLabel: 'Design Your Own', designComingSoon: true },
  },

  'Events & Sponsors': {
    categories: [
      { label: 'Become a Sponsor', href: '/community/become-a-sponsor',    icon: '/icons/cat-sponsor.png' },
      { label: 'Join a Club',      href: '/community/become-a-club-member', icon: '/icons/cat-club.png' },
      { label: 'Upcoming Events',  href: '/community/events',              icon: '/icons/cat-events.png' },
      { label: 'Community Forum',  href: '/community/forum',               icon: '/icons/cat-forum.png' },
    ],
    featured: [
      { title: 'SPONSOR US', description: 'Become a valued sponsor and partner.', tag: 'Partner', href: '/community/become-a-sponsor', emoji: '🤝' },
      { title: 'UPCOMING EVENTS', description: 'Workshops, meetups and more.', tag: 'Join Us', href: '/community/events', emoji: '🎉' },
    ],
    cta: { browse: '/community', browseLabel: 'View Community', design: '/community/events', designLabel: 'See Events' },
  },

  Customize: {
    categories: [
      { label: 'Apparels',  href: '/customized-your-t-shirt',   icon: '/new-icons/apparel-icon.webp' ,
        children: [
          { label: 'Polo T-shirt', href: '/polo#' },
          { label: 'Round Neck T-Shirt',    href: '/products/certificate-frames/blacklit-led-frames' },
          { label: 'Hoodies',      href: '/products/certificate-frames/award-and-certificate-frame' },
          { label: 'Full Sleeves Shirt',    href: '/products/certificate-frames/sandwich-frames' },
          { label: 'Sports Jersey',    href: '/products/certificate-frames/sandwich-frames' },
          { label: 'Oversized T-shirt',    href: '/products/certificate-frames/sandwich-frames' },
          { label: 'Visit Apparel Tool',    href: '/products/certificate-frames' },
        ],},
      { label: 'caps',  href: '/services/screen-printing',  icon: '/new-icons/cap-collection-icon.png', 
         children: [
          { label: 'Promotional Caps', href: '/polo#' },
          { label: 'Embriodery Caps',    href: '/products/certificate-frames/blacklit-led-frames' },
          { label: 'Cotton Caps',      href: '/products/certificate-frames/award-and-certificate-frame' },
          { label: 'Polymix Caps',    href: '/products/certificate-frames/sandwich-frames' },
          { label: 'Printed Caps',    href: '/products/certificate-frames/sandwich-frames' },
          { label: 'Gulf Caps',    href: '/products/certificate-frames/sandwich-frames' },
          { label: 'Jeans Caps',    href: '/products/certificate-frames' },
           { label: 'Child Caps',    href: '/products/certificate-frames' },
            { label: 'Sports Caps',    href: '/products/certificate-frames' },
            { label: 'Visit Cap Tool',    href: '/products/certificate-frames' },
        ]},

      { label: 'Visiting Cards',       href: '/services/embroidery',       icon: '/new-icons/idcard-collection-icon.webp',
         children: [
          { label: 'PVC Plastic Cards', href: '/polo#' },
          { label: 'Textured Paper Cards',    href: '/products/certificate-frames/blacklit-led-frames' },
          { label: 'Non Tearable Cards',      href: '/products/certificate-frames/award-and-certificate-frame' },
          { label: 'Square Shape Cards',    href: '/products/certificate-frames/sandwich-frames' },
          { label: 'Standard  Cards',    href: '/products/certificate-frames/sandwich-frames' },
          { label: 'UV Glossy Cards',    href: '/products/certificate-frames/sandwich-frames' },
          { label: 'Visit Visiting Card Tool',    href: '/products/certificate-frames' },
        ]
       },
      { label: 'Pin Batches',     href: '/services/dtf',              icon: '/new-icons/pin-badges-collection-icon.webp' ,
         children: [
          { label: 'Pin Back Badge', href: '/polo#' },
          { label: 'Fridge Magnet Badge',    href: '/products/certificate-frames/blacklit-led-frames' },
          { label: 'Rectangle Badge',      href: '/products/certificate-frames/award-and-certificate-frame' },
          { label: 'Shirt Magnet Badge',    href: '/products/certificate-frames/sandwich-frames' },
          { label: 'Keychains',    href: '/products/certificate-frames/sandwich-frames' },
         
          { label: 'Visit Badges  Tool',    href: '/products/certificate-frames' },
        ]
      },
      { label: 'Drinkwares',   href: '/services/vinyl',            icon: '/new-icons/drinkwear-collection-icon.webp',
         children: [
          { label: 'Coffee Mugs', href: '/polo#' },
          { label: 'Visit Drinkware Tool',    href: '/products/certificate-frames' },
        ]

       },
     
    ],
    featured: [
      {
        title: 'Customized Now',
        description: 'Customized your t-shirt in just few clicks',
        tag: 'Most Visited',
        href: '/customized-your-t-shirt',
        image: '/customize-tool-main-image-1.png',
        emoji: '',
      },
      { title: 'ALL SERVICES', description: 'Screen printing, embroidery, DTF & more.', tag: 'Expert', href: '/services', image: '/all-services-scrren-printing-embroidery-dtf-1.png', emoji: '' },
    ],
    cta: { browse: '/services', browseLabel: 'All Services', design: '/customized-your-t-shirt', designLabel: 'Start Designing' },
  },
};

// ─── Mega Menu Panel (3-column) ───────────────────────────────────────────────

function MegaMenuPanel({ menuKey, onMouseEnter, onMouseLeave }: {
  menuKey: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const data = megaMenus[menuKey];
  const pathname = usePathname();

  if (!data) return null;

  const defaultActive = data.categories.findIndex((c) => c.children && c.children.length > 0);
  const [activeCat, setActiveCat] = useState<number>(defaultActive >= 0 ? defaultActive : 0);

  const currentSubs = data.categories[activeCat]?.children ?? [];
  // A whole category being comingSoon (e.g. Bag Collections) means none of
  // its sub-items are live either, even if a sub-item itself doesn't carry
  // its own `comingSoon: true` — so it's inherited here rather than having
  // to repeat the flag on every child.
  const activeCatComingSoon = data.categories[activeCat]?.comingSoon ?? false;

  return (
    <div className={styles.megaWrapper} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className={styles.megaInner}>

        {/* ── Col 1: Top-level categories ── */}
        <div className={styles.megaCol1}>
          {data.categories.map((cat, idx) => {
            const isPathActive = pathname === cat.href || pathname.startsWith(cat.href + '/');
            return (
              <button
                key={cat.label}
                className={`${styles.megaCol1Item} ${activeCat === idx ? styles.megaCol1ItemActive : ''} ${isPathActive ? styles.megaCol1ItemPathActive : ''} ${cat.comingSoon ? styles.megaItemSoon : ''}`}
                onMouseEnter={() => setActiveCat(idx)}
                onClick={() => {
                  window.location.href = cat.comingSoon ? comingSoonHref(cat.label, cat.href) : cat.href;
                }}
              >
                {/* Image icon before label */}
                {cat.icon && (
                  <span className={styles.megaCol1IconWrap}>
                    <Image
                      src={cat.icon}
                      alt=""
                      width={25}
                      height={25}
                      className={styles.megaCol1Icon}
                    />
                  </span>
                )}
                {cat.label}
                {cat.comingSoon && <span className={styles.soonBadge}>Listing Soon</span>}
                {cat.children && cat.children.length > 0 && (
                  <FaChevronRight className={styles.megaCol1Arrow} />
                )}
              </button>
            );
          })}

          {/* CTA buttons at bottom */}
          <div className={styles.megaCtaGroup}>
            <Link href={data.cta.browse} className={`${styles.megaBtn} ${styles.megaBtnOutline}`}>
              {data.cta.browseLabel} <FaArrowRight />
            </Link>
            <Link
              href={data.cta.designComingSoon ? comingSoonHref(data.cta.designLabel, data.cta.design) : data.cta.design}
              className={`${styles.megaBtn} ${styles.megaBtnSolid} ${data.cta.designComingSoon ? styles.megaBtnSoon : ''}`}
            >
              {data.cta.designLabel}
              {data.cta.designComingSoon ? <span className={styles.soonBadge}>Listing Soon</span> : <FaArrowRight />}
            </Link>
          </div>
        </div>

        {/* ── Col 2: Sub-items for active category ── */}
        <div className={styles.megaCol2}>
          {currentSubs.length === 0 ? (
            <div className={styles.megaCol2Empty}>No sub-categories</div>
          ) : (
            currentSubs.map((sub, idx) => {
              const isLast = idx === currentSubs.length - 1;
              const isSubActive = pathname === sub.href;
              const subComingSoon = activeCatComingSoon || !!sub.comingSoon;
              const subHref = subComingSoon ? comingSoonHref(sub.label, sub.href) : sub.href;

              if (isLast && currentSubs.length > 1) {
                return (
                  <Fragment key={sub.label}>
                    <div className={styles.megaCol2Divider} />
                    <Link
                      href={subHref}
                      className={`${styles.megaCol2BrowseAll} ${isSubActive ? styles.megaCol2BrowseAllActive : ''} ${subComingSoon ? styles.megaItemSoon : ''}`}
                    >
                      {sub.label} <FaArrowRight />
                      {subComingSoon && <span className={styles.soonBadge}>Soon</span>}
                    </Link>
                  </Fragment>
                );
              }
              return (
                <Link
                  key={sub.label}
                  href={subHref}
                  className={`${styles.megaCol2Item} ${isSubActive ? styles.megaCol2ItemActive : ''} ${subComingSoon ? styles.megaItemSoon : ''}`}
                >
                  {sub.label}
                  {subComingSoon && <span className={styles.soonBadge}>Soon</span>}
                </Link>
              );
            })
          )}
        </div>

        {/* ── Col 3: Featured image cards ── */}
        <div className={styles.megaCol3}>
          {data.featured.map((item) => (
            <Link key={item.title} href={item.href} className={styles.megaFeatCard}>
              <div className={styles.megaFeatImgWrap}>
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="480px"
                    className={styles.megaFeatImg}
                  />
                ) : (
                  <div className={styles.megaFeatImgPlaceholder}>
                    {item.emoji}
                  </div>
                )}
                <span className={styles.megaFeatTag}>{item.tag}</span>
              </div>
              <div className={styles.megaFeatBody}>
                <p className={styles.megaFeatTitle}>{item.title}</p>
                <p className={styles.megaFeatDesc}>
                  <span style={{ fontSize: "15px" }}>
                    {item.description}
                  </span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

function MobileMenu({ open, onClose, cartCount, wishlistCount, onBulkOrder }: {
  open: boolean;
  onClose: () => void;
  cartCount: number;
  wishlistCount: number;
  onBulkOrder: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const w = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow     = 'hidden';
    document.body.style.paddingRight = `${w}px`;
    return () => {
      document.body.style.overflow     = '';
      document.body.style.paddingRight = '';
    };
  }, [open]);

  return (
    <>
      <div
        className={`${styles.mobileBackdrop} ${open ? styles.mobileBackdropOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`${styles.mobileDrawer} ${open ? styles.mobileDrawerOpen : ''}`}
        role="dialog" aria-modal="true" aria-label="Navigation"
      >
        <div className={styles.mobileDrawerHeader}>
          <Link href="/" onClick={onClose}>
            <Image src="/cluesstyle-logo.webp" alt="CluesStyle" width={110} height={34} className={styles.mobileLogo} />
          </Link>
          <button className={styles.mobileCloseBtn} onClick={onClose} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>

        <div className={styles.mobileDrawerBody}>
          <div className={styles.mobileUserRow}>
            <Link href="/account" className={styles.mobileUserLink} onClick={onClose}><FaUser /> My Account</Link>
            <Link href="/wishlist" className={styles.mobileUserLink} onClick={onClose}>
              <FaHeart /> Wishlist {wishlistCount > 0 && <span className={styles.mobileBadge}>{wishlistCount}</span>}
            </Link>
            <Link href="/cart" className={styles.mobileUserLink} onClick={onClose}>
              <FaShoppingCart /> Cart {cartCount > 0 && <span className={styles.mobileBadge}>{cartCount}</span>}
            </Link>
          </div>

          <nav className={styles.mobileNav}>
            {navLinks.map((link) => {
              const menu   = megaMenus[link.label];
              const isOpen = expanded === link.label;
              const isNavActive = pathname === link.href || pathname.startsWith(link.href + '/');

              if (!menu) {
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`${styles.mobileNavItem} ${isNavActive ? styles.mobileNavItemActive : ''}`}
                    onClick={onClose}
                  >
                    {link.label}
                  </Link>
                );
              }

              return (
                <div key={link.label}>
                  <button
                    className={`${styles.mobileNavItem} ${isNavActive ? styles.mobileNavItemActive : ''}`}
                    onClick={() => setExpanded(isOpen ? null : link.label)}
                  >
                    {link.label}
                    <FaChevronDown className={`${styles.mobileChevron} ${isOpen ? styles.mobileChevronRotated : ''}`} />
                  </button>
                  {isOpen && (
                    <div className={styles.mobileSubmenu}>
                      {menu.categories.map((cat) => {
                        const isCatActive = pathname === cat.href || pathname.startsWith(cat.href + '/');
                        return (
                          <Link
                            key={cat.label}
                            href={cat.comingSoon ? comingSoonHref(cat.label, cat.href) : cat.href}
                            className={`${styles.mobileSubmenuItem} ${isCatActive ? styles.mobileSubmenuItemActive : ''} ${cat.comingSoon ? styles.megaItemSoon : ''}`}
                            onClick={onClose}
                          >
                            {/* Image icon in mobile submenu too */}
                            {cat.icon && (
                              <img
                                src={cat.icon}
                                alt=""
                                style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0, marginRight: 8, opacity: cat.comingSoon ? 0.45 : 1 }}
                              />
                            )}
                            {cat.label}
                            {cat.comingSoon && <span className={styles.soonBadge}>Soon</span>}
                          </Link>
                        );
                      })}
                      <Link href={menu.cta.browse} className={styles.mobileSubmenuAll} onClick={onClose}>
                        {menu.cta.browseLabel} <FaArrowRight />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className={styles.mobileDrawerFooter}>
          <Link
            href={comingSoonHref('Design Your Own', '/customized-your-t-shirt')}
            className={`${styles.mobileDesignBtn} ${styles.mobileDesignBtnSoon}`}
            onClick={onClose}
          >
            Design Your Own <span className={styles.soonBadge}>Soon</span>
          </Link>
        </div>
      </div>
    </>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────

// ─── Search ───────────────────────────────────────────────────────────────────
// Suggestions are built from the "All Products" mega menu above, so search
// and navigation can never disagree: anything flagged `comingSoon` (itself,
// or via its whole category) is left out, and going live later only means
// removing that flag. Extra words per category let "t-shirt", "tshirt" or
// "tee" surface every apparel item, not just ones with that word in the name.
const SEARCH_KEYWORDS: Record<string, string> = {
  'Apparel':         't-shirt tshirt tee shirt clothing wear apparel',
  'Bag Collections': 'bag bags backpack laptop carry',
  'Pin Batches':     'badge badges batch pin magnet button',
};

interface SearchEntry { label: string; href: string; group: string; hay: string; kw: string }

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const searchIndex: SearchEntry[] = (() => {
  const out: SearchEntry[] = [];
  for (const cat of megaMenus['All Products'].categories) {
    if (cat.comingSoon) continue;
    const kw = norm(`${cat.label} ${SEARCH_KEYWORDS[cat.label] ?? ''}`);
    out.push({ label: cat.label, href: cat.href, group: 'Category', hay: norm(cat.label), kw });
    for (const sub of cat.children ?? []) {
      if (sub.comingSoon || sub.href === cat.href || sub.label.startsWith('Visit ')) continue;
      out.push({ label: sub.label, href: sub.href, group: cat.label, hay: norm(sub.label), kw });
    }
  }
  return out;
})();

function searchProducts(query: string, limit = 8): SearchEntry[] {
  const q = norm(query);
  if (q.length < 2) return [];
  // "tshirts" should still find "tshirt".
  const forms = q.length > 3 && q.endsWith('s') ? [q, q.slice(0, -1)] : [q];
  const scored: { e: SearchEntry; s: number }[] = [];
  for (const e of searchIndex) {
    let s = -1;
    if (forms.some((f) => e.hay.startsWith(f))) s = 0;
    else if (forms.some((f) => e.hay.includes(f))) s = 1;
    else if (forms.some((f) => e.kw.includes(f))) s = 2;
    if (s >= 0) scored.push({ e, s });
  }
  // Stable sort keeps menu order within the same relevance.
  return scored.sort((a, b) => a.s - b.s).slice(0, limit).map((x) => x.e);
}

export default function Header() {
  const [activeMenu,  setActiveMenu]  = useState<string | null>(null);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(-1);
  const router = useRouter();
  const suggestions = searchProducts(searchQuery);

  const goToSuggestion = (href: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchActive(-1);
    router.push(href);
  };

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [bulkModalOpen,    setBulkModalOpen]    = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const pathname = usePathname();

const [cartCount, setCartCount] = useState(0);
const wishlistCount = 0;


useEffect(() => {
  const updateCartCount = () => {
    setCartCount(getCartCount());
  };

  // Initial load
  updateCartCount();

  // Listen for cart updates
  window.addEventListener("cart-updated", updateCartCount);

  return () => {
    window.removeEventListener("cart-updated", updateCartCount);
  };
}, []);

  // ── Close mega menu on route change ──
  useEffect(() => {
    setActiveMenu(null);
    setSearchOpen(false);
  }, [pathname]);

  const openMenu = useCallback((label: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (megaMenus[label]) setActiveMenu(label);
  }, []);

  const scheduleClose = useCallback(() => {
    timerRef.current = setTimeout(() => setActiveMenu(null), 120);
  }, []);

  const cancelClose = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setActiveMenu(null); setSearchOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const [authUser, setAuthUser] = useState<{ name: string; userType: string } | null>(null);

  useEffect(() => {
    try {
      const token    = localStorage.getItem('token');
      const userRaw  = localStorage.getItem('user');
      const userType = localStorage.getItem('userType');

      if (token && userRaw && userType) {
        const user = JSON.parse(userRaw);
        setAuthUser({ name: user.name || 'Account', userType });
      }
    } catch {
      // localStorage unavailable (SSR) or corrupt data — stay logged out
    }
  }, []);

  return (
    <>
      <header className={styles.csHeader}>

        {/* Top bar */}
        <div className={styles.csTopbar}>

          {/* Hamburger */}
          <button className={styles.csHamburger} aria-label="Open menu" onClick={() => setMobileOpen(true)}>
            <FaBars />
          </button>

          {/* Logo */}
          <a href="/" className={styles.csLogoLink}>
          <Image
            src="/cluesstyle-logo.webp"
            alt="CluesStyle"
            width={140}
            height={42}
            className={styles.csLogo}
            priority
          />
        </a>

          {/* Desktop nav */}
          <nav className={styles.csDesktopNav} aria-label="Main navigation">
            {navLinks.map((link) => {
              const isNavActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <div
                  key={link.label}
                  className={`${styles.csNavItem} ${activeMenu === link.label ? styles.csNavItemActive : ''}`}
                  onMouseEnter={() => openMenu(link.label)}
                  onMouseLeave={scheduleClose}
                >
                  <Link
                    href={link.href}
                    className={`${styles.csNavLink} ${isNavActive ? styles.csNavLinkActive : ''}`}
                  >
                    {link.label}
                    {megaMenus[link.label] && (
                      <FaChevronDown
                        className={`${styles.csNavChevron} ${activeMenu === link.label ? styles.csNavChevronRotated : ''}`}
                      />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Icons */}
          <div className={styles.csIcons}>
            <button
            className={styles.callIconBtn}
              onClick={() => setContactModalOpen(true)}
              aria-label="Contact Us"
            >
              <FaPhoneAlt />
            </button>

            <button className={`${styles.csIconBtn} ${styles.hideOnMobile}`} aria-label="Search" onClick={() => setSearchOpen((v) => !v)}>
              <FaSearch />
            </button>

            <Link href="/cart" className={styles.csIconBtn} aria-label="Cart">
              <FaShoppingCart />
              {cartCount > 0 && <span className={styles.csBadge}>{cartCount}</span>}
            </Link>

            {authUser ? (
              <Link
                href={`/dashboard/${authUser.userType}`}
                className={`${styles.csLoginBtn} ${styles.loggedIn}`}
                title={`Go to dashboard (${authUser.userType})`}
              >
                <FaUser />
                <span>{authUser.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link href="/account"  className={`${styles.csLoginBtn}`}>
                <FaUser />
                <span>LOGIN</span>
              </Link>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className={`${styles.csSearchBar} ${searchOpen ? styles.csSearchBarOpen : ''}`}>
          <div className={styles.csSearchInner}>
            <FaSearch className={styles.csSearchIcon} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search products, services, collections…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchActive(-1); }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setSearchActive((i) => (suggestions.length ? (i + 1) % suggestions.length : -1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSearchActive((i) => (suggestions.length ? (i <= 0 ? suggestions.length - 1 : i - 1) : -1));
                } else if (e.key === 'Enter' && suggestions.length) {
                  e.preventDefault();
                  goToSuggestion(suggestions[searchActive >= 0 ? searchActive : 0].href);
                }
              }}
              className={styles.csSearchInput}
              aria-label="Search"
              autoComplete="off"
            />
            <button
              className={styles.csSearchClose}
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
              aria-label="Close search"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Search suggestions — outside .csSearchBar, which clips overflow */}
        {searchOpen && norm(searchQuery).length >= 2 && (
          <div className={styles.csSuggest} role="listbox">
            {suggestions.length > 0 ? (
              suggestions.map((s, i) => (
                <button
                  key={s.href + s.label}
                  type="button"
                  role="option"
                  aria-selected={i === searchActive}
                  className={`${styles.csSuggestItem} ${i === searchActive ? styles.csSuggestItemActive : ''}`}
                  onMouseEnter={() => setSearchActive(i)}
                  onClick={() => goToSuggestion(s.href)}
                >
                  <FaSearch className={styles.csSuggestIcon} />
                  <span className={styles.csSuggestLabel}>{s.label}</span>
                  <span className={styles.csSuggestGroup}>{s.group}</span>
                </button>
              ))
            ) : (
              <div className={styles.csSuggestEmpty}>No products found for &ldquo;{searchQuery}&rdquo;</div>
            )}
          </div>
        )}

        {/* Mega menu */}
        {activeMenu && (
          <MegaMenuPanel
            menuKey={activeMenu}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          />
        )}
      </header>

      {/* Spacer */}
      <div className={styles.csHeaderSpacer} aria-hidden="true" />

      {/* Mobile drawer */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onBulkOrder={() => setBulkModalOpen(true)}
      />

      <BulkOrderModal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} />

      {contactModalOpen && (
        <>
          <div
            className={styles.modalOverlay}
            onClick={() => setContactModalOpen(false)}
          />
          <div className={styles.contactModal}>
            <h3>How would you like to connect?</h3>
            <a href="tel:+919876543210" className={styles.contactAction}>
              📞 Call Now
            </a>
            <a
              href="https://wa.me/919876543210?text=Hello%20CluesStyle"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactActionWhatsapp}
            >
              💬 WhatsApp Chat
            </a>
            <button
              onClick={() => setContactModalOpen(false)}
              className={styles.closeModalBtn}
            >
              Close
            </button>
          </div>
        </>
      )}
    </>
  );
}