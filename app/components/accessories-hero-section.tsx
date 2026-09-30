'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    title: 'Custom Sports Jerseys',
    description:
      'Design premium-quality jerseys for teams, tournaments, schools, and sports clubs with complete customization.',
    image: '/man-showing-jersey.webp',
    button: 'Shop Jerseys',
  },
  {
    title: 'Corporate Gifting Solutions',
    description:
      'Create memorable branded gifts for employees, clients, and events with professional customization.',
    image: '/corporate-gifting.webp',
    button: 'Explore Gifts',
  },
  {
    title: 'Custom Apparel Printing',
    description:
      'From T-shirts to hoodies, bring your ideas to life with high-quality DTF, screen, and embroidery printing.',
    image: '/custom-apparel.webp',
    button: 'Start Designing',
  },
];

export default function AccessoriesHero() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (

   <div className="relative min-h-[600px] overflow-hidden">
    {/* Background Image */}
    <Image
      src="/accessories-banner.png"
      alt="Same Day Delivery Printing"
      fill
      priority
      className="object-cover"
    />
  
    {/* Overlay */}
    {/* <div className="absolute inset-0 bg-black/35" /> */}
  
    {/* Content */}
    <div className="relative z-10 mx-auto flex min-h-[800px] max-w-[1600px] items-center px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl">
        
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 text-sm font-medium text-white/70"
        >
          <ol className="flex items-center gap-2">
            <li>
              <a
                href="/"
                className="transition hover:text-white"
              >
                Home
              </a>
            </li>
            <li>/</li>
            <li className="text-white">
              Accessories
            </li>
          </ol>
        </nav>
  
        {/* Eyebrow */}
        <span className="mb-4 inline-flex rounded-full border border-white/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
          Mumbai's Fastest Printer
        </span>
  
        {/* Heading */}
        <h1 className="mb-6 text-5xl font-black leading-tight text-white md:text-6xl lg:text-6xl">
         Top Accessories 
          <span className="block text-white/80">
           and Custom Printing
          </span>
        </h1>
  
        {/* Description */}
        <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
          Need custom t-shirts, jerseys, hoodies, uniforms or
          corporate merchandise urgently? We print, pack and
          deliver across Mumbai on the very same day.
        </p>
  
        {/* CTA */}
        <div className="flex flex-wrap gap-4">
          <a
            href="#quote"
            className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:scale-105"
          >
            Get Instant Quote
          </a>
  
          <a
            href="tel:+919999999999"
            className="rounded-xl border border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-black"
          >
            Call Now
          </a>
        </div>
      </div>
    </div>
  </div>
  
  );
}