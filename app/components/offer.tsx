'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    image: 'https://cdn.cluesstyle.com/public/fifa.webp',
    badge: 'FIFA World Cup Collection',
    title: 'Custom FIFA World Cup',
    highlight: 'T-Shirts & Fan Merchandise',
    description:
      'Support your favorite football team with premium custom FIFA World Cup t-shirts. Perfect for fan clubs, sports events, corporate campaigns, football screenings, and promotional merchandise.',
    primaryCta: 'Design Your T-Shirt',
    primaryHref: '/customized-your-t-shirt',
    secondaryCta: 'Get Bulk Quote',
    secondaryHref: '/contact-us',
  },
  {
    image: 'https://cdn.cluesstyle.com/public/man-showing-jersey.webp',
    badge: 'Custom Football Jerseys',
    title: 'Personalized Team',
    highlight: 'Football Jerseys',
    description:
      'Create custom football jerseys with player names, team logos, sponsor branding, and unique designs. Perfect for football clubs, schools, colleges, tournaments, and corporate leagues.',
    primaryCta: 'Create Jersey',
    primaryHref: '/customized-your-t-shirt',
    secondaryCta: 'Learn More',
    secondaryHref: '/sportswear',
  },
  {
    image: 'https://cdn.cluesstyle.com/public/man-wearing-cluesstyle-jersey.webp',
    badge: 'Corporate Sportswear',
    title: 'Premium Sports',
    highlight: 'Apparel Solutions',
    description:
      'From employee sports days to large-scale brand activations, CluesStyle provides premium performance apparel with professional customization and attractive bulk pricing.',
    primaryCta: 'Explore Apparel',
    primaryHref: '/sportswear',
    secondaryCta: 'Request Quote',
    secondaryHref: '/contact-us',
  },
  {
    image: 'https://cdn.cluesstyle.com/public/people-bowing-to-jersey.webp',
    badge: 'Bulk Event Orders',
    title: 'Custom Merchandise',
    highlight: 'For Every Event',
    description:
      'Order custom t-shirts, jerseys, hoodies, and promotional merchandise for football screenings, tournaments, fan gatherings, and marketing campaigns across India.',
    primaryCta: 'Start Designing',
    primaryHref: '/customized-your-t-shirt',
    secondaryCta: 'Contact Sales',
    secondaryHref: '/contact-us',
  },
];

export default function FifaWorldCupCard() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const activeSlide = slides[current];

  return (
    <section className="w-full py-16">
      <div className="mx-auto max-w-[1655px] px-4 lg:px-8">

        {/* Heading */}
        <div className="mb-10 flex items-center gap-4">
          <img
            src="https://cdn.cluesstyle.com/public/gold-arrow.png"
            alt="Arrow"
            className="h-8 w-8 md:h-10 md:w-10 object-contain"
          />

          <h2 className="text-3xl md:text-5xl font-black text-black leading-none">
            FIFA OFFER
          </h2>
        </div>

        {/* Main Card */}
        <div className="relative overflow-hidden rounded-3xl border border-black/20 shadow-[8px_8px_0px_#000]">

          {/* Images */}
          <div className="relative h-[450px] sm:h-[550px] lg:h-[700px]">
            {slides.map((slide, index) => (
              <Image
                key={slide.image}
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className={`object-cover transition-opacity duration-700 ${
                  current === index ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="max-w-3xl p-6 sm:p-10 lg:p-16">

              <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                {activeSlide.badge}
              </span>

              <h2 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-7xl">
                {activeSlide.title}

                <span className="block text-yellow-400">
                  {activeSlide.highlight}
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-200 sm:text-lg lg:text-xl">
                {activeSlide.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={activeSlide.primaryHref}
                  className="rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:scale-105"
                >
                  {activeSlide.primaryCta}
                </Link>

                <Link
                  href={activeSlide.secondaryHref}
                  className="rounded-full border border-white px-8 py-4 font-semibold text-white transition hover:bg-white hover:text-black"
                >
                  {activeSlide.secondaryCta}
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Left Indicators */}
          <div className="absolute bottom-8 left-8 z-30 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setCurrent(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  current === index
                    ? 'w-10 bg-white'
                    : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Bottom Right Navigation */}
          <div className="absolute bottom-6 right-6 z-30 flex gap-3">

            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
            >
              <ChevronRight size={24} />
            </button>

          </div>
        </div>
      </div>
    </section>
  );
}