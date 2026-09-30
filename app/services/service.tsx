// app/services/services.tsx
'use client';

import { JSX, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaTshirt, 
  FaCheckCircle, 
  FaArrowRight, 
  FaStar,
  FaClock,
  FaTruck,
  FaTags,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaPrint,
  FaPaintBrush,
  FaCrop,
  FaMagic,
  FaPalette,
  FaIndustry,
  FaLayerGroup,
  FaVectorSquare,
  FaRulerCombined,
  FaChartLine,
  FaTrophy,
  FaComments
} from 'react-icons/fa';

interface Service {
  id: string;
  name: string;
  icon: JSX.Element;
  description: string;
  features: string[];
  price: string;
  minOrder: string;
  turnaround: string;
  bestFor: string[];
  image: string;
}

const services: Service[] = [
  {
    id: 'screen-printing',
    name: 'Screen Printing',
    icon: <FaPrint className="w-8 h-8" />,
    description: 'Professional screen printing for bulk orders. Perfect for events, clubs, and corporate merchandise with vibrant, long-lasting prints.',
    features: [
      'Vibrant, long-lasting prints',
      'Best for bulk orders (50+ pieces)',
      'Multiple color options available',
      'Eco-friendly water-based inks',
      'High-quality mesh screens',
      'Plastisol and water-based inks'
    ],
    price: 'Starting ₹49/piece',
    minOrder: '50 pieces',
    turnaround: '7-10 business days',
    bestFor: ['Events', 'Clubs', 'Corporate Merchandise', 'Bulk Orders'],
    image: '/services/screen-printing.jpg',
  },
  {
    id: 'embroidery',
    name: 'Embroidery',
    icon: <FaMagic className="w-8 h-8" />,
    description: 'Premium embroidery services for a sophisticated, professional look on caps, polos, jackets, and bags.',
    features: [
      'Premium thread quality',
      '3D puff embroidery option',
      'Digitizing services included',
      'Multiple color threads',
      'Perfect for logos',
      'Durable and wash-resistant'
    ],
    price: 'Starting ₹199/logo',
    minOrder: '10 pieces',
    turnaround: '5-7 business days',
    bestFor: ['Corporate Logos', 'Caps', 'Polos', 'Jackets', 'Bags'],
    image: '/services/embroidery.jpg',
  },
  {
    id: 'dtf-printing',
    name: 'DTF Printing',
    icon: <FaLayerGroup className="w-8 h-8" />,
    description: 'Direct-to-Film transfers for any fabric type. Vibrant colors, excellent detail, and no minimum quantity requirements.',
    features: [
      'Works on any fabric type',
      'No minimum quantity',
      'Vibrant colors with white ink',
      'Stretchy and flexible',
      'Wash-resistant prints',
      'Fine detail reproduction'
    ],
    price: 'Starting ₹149/transfer',
    minOrder: '1 piece',
    turnaround: '2-3 business days',
    bestFor: ['Small Batches', 'Complex Designs', 'Dark Fabrics', 'Samples'],
    image: '/services/dtf.jpg',
  },
  {
    id: 'vinyl-printing',
    name: 'Vinyl Printing',
    icon: <FaVectorSquare className="w-8 h-8" />,
    description: 'Heat transfer vinyl for jerseys, bags, and accessories. Perfect for names, numbers, and single-color designs.',
    features: [
      'Gloss, matte, and metallic finishes',
      'Easy application process',
      'Long-lasting durability',
      'Perfect for names/numbers',
      'Multiple color options',
      'Precision cut technology'
    ],
    price: 'Starting ₹99/piece',
    minOrder: '5 pieces',
    turnaround: '2-3 business days',
    bestFor: ['Sports Jerseys', 'Names & Numbers', 'Bags', 'Small Logos'],
    image: '/services/vinyl.jpg',
  },
  {
    id: 'sublimation',
    name: 'Sublimation Printing',
    icon: <FaPalette className="w-8 h-8" />,
    description: 'Full-color sublimation on polyester fabrics. All-over print capability with photo-quality results.',
    features: [
      'Full-color photo-quality prints',
      'All-over print capability',
      'No minimum quantity',
      'Vibrant, permanent colors',
      'No fading or cracking',
      'Soft to touch finish'
    ],
    price: 'Starting ₹399/piece',
    minOrder: '1 piece',
    turnaround: '5-7 business days',
    bestFor: ['Jerseys', 'Activewear', 'All-over Prints', 'Photo Prints'],
    image: '/services/sublimation.jpg',
  },
  {
    id: 'custom-design',
    name: 'Custom Design',
    icon: <FaPaintBrush className="w-8 h-8" />,
    description: 'Professional design services to bring your ideas to life. From concept to final artwork, we help create stunning designs.',
    features: [
      'Professional designers',
      'Vector artwork creation',
      'Logo design services',
      'Unlimited revisions',
      'Multiple formats delivered',
      'Print-ready files'
    ],
    price: 'Starting ₹999/design',
    minOrder: '1 design',
    turnaround: '2-3 business days',
    bestFor: ['New Brands', 'Logo Design', 'Artwork Creation', 'Vectorization'],
    image: '/services/design.jpg',
  },
];

const processSteps = [
  {
    step: '01',
    title: 'Consultation',
    description: 'Discuss your requirements, design ideas, and budget',
    icon: <FaStar className="w-6 h-6" />,
  },
  {
    step: '02',
    title: 'Artwork & Proof',
    description: 'Our designers create digital proofs for your approval',
    icon: <FaPaintBrush className="w-6 h-6" />,
  },
  {
    step: '03',
    title: 'Production',
    description: 'Quality printing with premium materials',
    icon: <FaPrint className="w-6 h-6" />,
  },
  {
    step: '04',
    title: 'Quality Check',
    description: 'Thorough inspection before shipping',
    icon: <FaCheckCircle className="w-6 h-6" />,
  },
  {
    step: '05',
    title: 'Delivery',
    description: 'Fast and secure delivery to your doorstep',
    icon: <FaTruck className="w-6 h-6" />,
  },
];

const stats = [
  { value: '10,000+', label: 'Projects Completed', icon: <FaChartLine className="w-5 h-5" /> },
  { value: '2,500+', label: 'Happy Clients', icon: <FaStar className="w-5 h-5" /> },
  { value: '1M+', label: 'Products Printed', icon: <FaTshirt className="w-5 h-5" /> },
  { value: '98%', label: 'Client Satisfaction', icon: <FaCheckCircle className="w-5 h-5" /> },
];

export default function Services() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
  className="relative min-h-[600px] lg:min-h-[700px] flex items-center"
  style={{
    backgroundImage: "url('/services-hero.webp')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/60"></div>

  {/* Content */}
  <div className="relative z-10 w-full max-w-[1800px] mx-auto px-5 lg:px-10">
    
    {/* Breadcrumb */}
    <nav className="flex items-center gap-2 text-sm text-white/80 mb-6">
      <a href="/" className="hover:text-white transition">
        Home
      </a>
      <span>/</span>
      <span className="text-white font-medium">
        Our Services
      </span>
    </nav>

    <div className="max-w-3xl">
      {/* Label */}
      <span className="inline-block px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
        Professional Printing Solutions
      </span>

      {/* Heading */}
      <h1
        className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6"
        style={{
          textShadow: '4px 4px 0 rgba(0,0,0,0.3)',
        }}
      >
        Our Services
      </h1>

      {/* Sub Heading */}
      <p className="text-xl md:text-2xl text-white/90 mb-5 font-medium">
        Premium Printing Solutions for Every Need
      </p>

      {/* Description */}
      <p className="text-lg text-white/80 leading-8 max-w-2xl mb-8">
        From screen printing and embroidery to DTF printing and corporate
        gifting, we provide high-quality customization services that help
        businesses, teams, schools, and brands stand out.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-wrap gap-4">
        <a
          href="/contact"
          className="px-8 py-4 bg-[#155d8c] hover:bg-[#10486c] text-white font-semibold rounded-lg transition-all duration-300"
        >
          Get a Quote
        </a>

        <a
          href="/bulk-order"
          className="px-8 py-4 border border-white text-white hover:bg-white hover:text-black rounded-lg transition-all duration-300"
        >
          Bulk Orders
        </a>
      </div>
    </div>

  </div>
</section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1800px] mx-auto px-5">
          <div className="mb-10 flex items-center gap-3">
              <img
                src="/gold-arrow.png" // your arrow image
                alt="arrow"
                className="w-8 h-8"
              />
              <h2 className="text-3xl font-semibold md:text-4xl">
                Shop Our Best Selling Products 
              </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-black rounded-xl p-8 h-35 text-center shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">
              <h3 className="text-5xl font-black">500+</h3>
              <p className="mt-2 text-gray-600">Projects Completed</p>
            </div>

            <div className="bg-white border border-black rounded-xl p-8 text-center shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">
              <h3 className="text-5xl font-black">100+</h3>
              <p className="mt-2 text-gray-600">Corporate Clients</p>
            </div>

            <div className="bg-white border border-black rounded-xl p-8 text-center shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">
              <h3 className="text-5xl font-black">15+</h3>
              <p className="mt-2 text-gray-600">Years Experience</p>
            </div>

            <div className="bg-white border border-black rounded-xl p-8 text-center shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">
              <h3 className="text-5xl font-black">24/7</h3>
              <p className="mt-2 text-gray-600">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-white">
  <div className="max-w-[1800px] mx-auto px-5">

    <div className="mb-10 flex items-center gap-3">
              <img
                src="/gold-arrow.png" // your arrow image
                alt="arrow"
                className="w-8 h-8"
              />
              <h2 className="text-3xl font-semibold md:text-4xl">
                Shop Our Best Selling Products 
              </h2>
          </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">

      {/* Card 1 */}
      <a
        href="/services/screen-printing"
        className="group block"
      >
        <div className="relative overflow-hidden rounded-2xl border border-black bg-white shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">

          <div className="relative h-80 bg-gray-50 flex items-center justify-center">
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                Printing
              </span>
            </div>

            <img
              src="/screen-printing.webp"
              alt="Screen Printing"
              className="h-56 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <div
                className="px-4 py-4 border-t border-white/40"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <h3 className="font-bold text-black">
                  Screen Printing
                </h3>

                <button className="mt-3 w-full rounded-full bg-black py-2 text-sm font-bold text-white">
                  View Service
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">
                Screen Printing
              </h3>
              <span className="font-black text-black">
                ₹99+
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
              Durable and vibrant prints perfect for bulk apparel orders.
            </p>

            <div className="mt-4 flex justify-between text-xs text-gray-400">
              <span>Min Qty: 25</span>
              <span>3-5 Days</span>
            </div>
          </div>

        </div>
      </a>

      {/* Card 2 */}
      <a
        href="/services/embroidery"
        className="group block"
      >
        <div className="relative overflow-hidden rounded-2xl border border-black bg-white shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">

          <div className="relative h-80 bg-gray-50 flex items-center justify-center">
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                Embroidery
              </span>
            </div>

            <img
              src="/embroidery.webp"
              alt="Embroidery"
              className="h-56 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <div
                className="px-4 py-4 border-t border-white/40"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <h3 className="font-bold text-black">
                  Embroidery
                </h3>

                <button className="mt-3 w-full rounded-full bg-black py-2 text-sm font-bold text-white">
                  View Service
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">
                Embroidery
              </h3>
              <span className="font-black text-black">
                ₹149+
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
              Premium stitched branding for uniforms, caps, and apparel.
            </p>

            <div className="mt-4 flex justify-between text-xs text-gray-400">
              <span>Min Qty: 10</span>
              <span>5-7 Days</span>
            </div>
          </div>

        </div>
      </a>

      {/* Card 3 */}
      <a
        href="/services/dtf-printing"
        className="group block"
      >
        <div className="relative overflow-hidden rounded-2xl border border-black bg-white shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">

          <div className="relative h-80 bg-gray-50 flex items-center justify-center">
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                DTF
              </span>
            </div>

            <img
              src="/dtf-printing.webp"
              alt="DTF Printing"
              className="h-56 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <div
                className="px-4 py-4 border-t border-white/40"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <h3 className="font-bold text-black">
                  DTF Printing
                </h3>

                <button className="mt-3 w-full rounded-full bg-black py-2 text-sm font-bold text-white">
                  View Service
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">
                DTF Printing
              </h3>
              <span className="font-black text-black">
                ₹89+
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
              Full-color transfers with excellent durability and detail.
            </p>

            <div className="mt-4 flex justify-between text-xs text-gray-400">
              <span>Min Qty: 5</span>
              <span>2-4 Days</span>
            </div>
          </div>

        </div>
      </a>
      {/* 4th service */}

      <a
        href="/services/dtf-printing"
        className="group block"
      >
        <div className="relative overflow-hidden rounded-2xl border border-black bg-white shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">

          <div className="relative h-80 bg-gray-50 flex items-center justify-center">
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                DTF
              </span>
            </div>

            <img
              src="/dtf-printing.webp"
              alt="DTF Printing"
              className="h-56 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <div
                className="px-4 py-4 border-t border-white/40"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <h3 className="font-bold text-black">
                  DTF Printing
                </h3>

                <button className="mt-3 w-full rounded-full bg-black py-2 text-sm font-bold text-white">
                  View Service
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">
                DTF Printing
              </h3>
              <span className="font-black text-black">
                ₹89+
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
              Full-color transfers with excellent durability and detail.
            </p>

            <div className="mt-4 flex justify-between text-xs text-gray-400">
              <span>Min Qty: 5</span>
              <span>2-4 Days</span>
            </div>
          </div>

        </div>
      </a>

      {/* 5th service */}

      <a
        href="/services/dtf-printing"
        className="group block"
      >
        <div className="relative overflow-hidden rounded-2xl border border-black bg-white shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">

          <div className="relative h-80 bg-gray-50 flex items-center justify-center">
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                DTF
              </span>
            </div>

            <img
              src="/dtf-printing.webp"
              alt="DTF Printing"
              className="h-56 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <div
                className="px-4 py-4 border-t border-white/40"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <h3 className="font-bold text-black">
                  DTF Printing
                </h3>

                <button className="mt-3 w-full rounded-full bg-black py-2 text-sm font-bold text-white">
                  View Service
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">
                DTF Printing
              </h3>
              <span className="font-black text-black">
                ₹89+
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
              Full-color transfers with excellent durability and detail.
            </p>

            <div className="mt-4 flex justify-between text-xs text-gray-400">
              <span>Min Qty: 5</span>
              <span>2-4 Days</span>
            </div>
          </div>

        </div>
      </a>

      {/* 6th Service */}
      <a
        href="/services/dtf-printing"
        className="group block"
      >
        <div className="relative overflow-hidden rounded-2xl border border-black bg-white shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">

          <div className="relative h-80 bg-gray-50 flex items-center justify-center">
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                DTF
              </span>
            </div>

            <img
              src="/dtf-printing.webp"
              alt="DTF Printing"
              className="h-56 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <div
                className="px-4 py-4 border-t border-white/40"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <h3 className="font-bold text-black">
                  DTF Printing
                </h3>

                <button className="mt-3 w-full rounded-full bg-black py-2 text-sm font-bold text-white">
                  View Service
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">
                DTF Printing
              </h3>
              <span className="font-black text-black">
                ₹89+
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
              Full-color transfers with excellent durability and detail.
            </p>

            <div className="mt-4 flex justify-between text-xs text-gray-400">
              <span>Min Qty: 5</span>
              <span>2-4 Days</span>
            </div>
          </div>

        </div>
      </a>

    </div>
  </div>
</section>

      {/* Process Section */}
      <section className="py-20 bg-white">
  <div className="max-w-[1800px] mx-auto px-5">

    <div className="mb-10 flex items-center gap-3">
              <img
                src="/gold-arrow.png" // your arrow image
                alt="arrow"
                className="w-8 h-8"
              />
              <h2 className="text-3xl font-semibold md:text-4xl">
                Shop Our Best Selling Products 
              </h2>
          </div>

    <div className="grid md:grid-cols-5 gap-6 items-stretch">

      {/* Step 1 */}
      <div className="relative h-full">
        <div className="h-full flex flex-col bg-white border border-black rounded-2xl p-6 text-center shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">

          <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center mx-auto mb-5 text-lg font-black">
            01
          </div>

          <FaComments className="text-4xl mx-auto mb-5" />

          <h3 className="font-black text-lg mb-3">
            Inquiry
          </h3>

          <p className="text-sm text-gray-600">
            Share your product requirements, artwork, quantity and deadline.
          </p>
        </div>

        <div className="hidden md:block absolute top-1/2 -right-5 text-3xl font-black">
         
        </div>
      </div>

      {/* Step 2 */}
      <div className="relative h-full">
        <div className="h-full flex flex-col bg-white border border-black rounded-2xl p-6 text-center shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">

          <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center mx-auto mb-5 text-lg font-black">
            02
          </div>

          <FaPalette className="text-4xl mx-auto mb-5" />

          <h3 className="font-black text-lg mb-3">
            Design Approval
          </h3>

          <p className="text-sm text-gray-600">
            Review mockups and approve the final design before production.
          </p>
        </div>

        <div className="hidden md:block absolute top-1/2 -right-5 text-3xl font-black">
         
        </div>
      </div>

      {/* Step 3 */}
      <div className="relative h-full">
        <div className="h-full flex flex-col bg-white border border-black rounded-2xl p-6 text-center shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">

          <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center mx-auto mb-5 text-lg font-black">
            03
          </div>

          <FaPrint className="text-4xl mx-auto mb-5" />

          <h3 className="font-black text-lg mb-3">
            Production
          </h3>

          <p className="text-sm text-gray-600">
            We begin printing, embroidery, or customization using premium methods.
          </p>
        </div>

        <div className="hidden md:block absolute top-1/2 -right-5 text-3xl font-black">
         
        </div>
      </div>

      {/* Step 4 */}
      <div className="relative h-full">
        <div className="h-full flex flex-col bg-white border border-black rounded-2xl p-6 text-center shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">

          <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center mx-auto mb-5 text-lg font-black">
            04
          </div>

          <FaCheckCircle className="text-4xl mx-auto mb-5" />

          <h3 className="font-black text-lg mb-3">
            Quality Check
          </h3>

          <p className="text-sm text-gray-600">
            Every order is inspected carefully to ensure top quality standards.
          </p>
        </div>

        <div className="hidden md:block absolute top-1/2 -right-5 text-3xl font-black">
         
        </div>
      </div>

      {/* Step 5 */}
      <div className="h-full">
        <div className="h-full flex flex-col bg-black text-white border border-black rounded-2xl p-6 text-center shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">

          <div className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center mx-auto mb-5 text-lg font-black">
            05
          </div>

          <FaTruck className="text-4xl mx-auto mb-5" />

          <h3 className="font-black text-lg mb-3">
            Delivery
          </h3>

          <p className="text-sm text-gray-300">
            Your products are securely packed and delivered on time.
          </p>
        </div>
      </div>

    </div>

  </div>
</section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
  <div className="max-w-[1800px] mx-auto px-5">
    <br/><br/>
<div className="mb-10 flex items-center gap-3">
              <img
                src="/gold-arrow.png" // your arrow image
                alt="arrow"
                className="w-8 h-8"
              />
              <h2 className="text-3xl font-semibold md:text-4xl">
                Shop Our Best Selling Products 
              </h2>
          </div>
    <div className="grid lg:grid-cols-2 gap-12 items-center">

      {/* Left Content */}
      <div>

        <span className="inline-block border border-black px-4 py-2 text-xs font-bold uppercase tracking-wider mb-4">
          Why CluesStyle
        </span>

        <h2 className="text-4xl md:text-5xl font-black text-black mb-6">
          Why Choose CluesStyle?
        </h2>

        <p className="text-gray-600 text-lg mb-8 max-w-2xl">
          We combine premium quality, fast production, and competitive pricing
          to help businesses, teams, schools, and brands create products that
          stand out.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">

          {/* Feature 1 */}
          <div className="border border-black rounded-2xl p-5 bg-white shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">
            <FaTrophy className="text-2xl mb-3" />
            <h3 className="font-black text-lg mb-2">
              Premium Quality
            </h3>
            <p className="text-sm text-gray-600">
              High-quality materials and professional printing techniques.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="border border-black rounded-2xl p-5 bg-white shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">
            <FaClock className="text-2xl mb-3" />
            <h3 className="font-black text-lg mb-2">
              Fast Turnaround
            </h3>
            <p className="text-sm text-gray-600">
              Quick production and reliable delivery schedules.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="border border-black rounded-2xl p-5 bg-white shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">
            <FaTags className="text-2xl mb-3" />
            <h3 className="font-black text-lg mb-2">
              Fair Pricing
            </h3>
            <p className="text-sm text-gray-600">
              Transparent pricing with no hidden costs.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="border border-black rounded-2xl p-5 bg-white shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">
            <FaStar className="text-2xl mb-3" />
            <h3 className="font-black text-lg mb-2">
              Expert Support
            </h3>
            <p className="text-sm text-gray-600">
              Dedicated assistance from design to delivery.
            </p>
          </div>

        </div>

      </div>

      {/* Right Image */}
      <div>
        <div className="relative overflow-hidden rounded-3xl border border-black shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">

          <img
            src="/printing-facility.webp"
            alt="CluesStyle Printing Facility"
            className="w-full h-[650px] object-cover"
          />

          {/* Optional Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Bottom Label */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white border border-black rounded-xl px-5 py-4 shadow-[1px_1px_0px_#000]">
              <h3 className="font-black text-xl mb-1">
                State-of-the-Art Production
              </h3>

              <p className="text-sm text-gray-600">
                Advanced printing, embroidery, and customization facilities
                ensuring consistent quality across every order.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>

  </div>
</section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
  <div className="max-w-[1800px] mx-auto px-5">

   <div className="mb-10 flex items-center gap-3">
              <img
                src="/gold-arrow.png" // your arrow image
                alt="arrow"
                className="w-8 h-8"
              />
              <h2 className="text-3xl font-semibold md:text-4xl">
                Shop Our Best Selling Products 
              </h2>
          </div>

    <div className="space-y-5">

      {/* FAQ 1 */}
      <details className="group border border-black rounded-2xl bg-white shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">
        <summary className="flex cursor-pointer list-none items-center justify-between p-6 font-black text-lg">
          What file formats do you accept for artwork?
          <span className="text-2xl transition-transform duration-300 group-open:rotate-45">
            +
          </span>
        </summary>

        <div className="border-t border-black px-6 py-5 text-gray-600">
          We accept AI, EPS, PDF, SVG, PNG, JPG, and PSD files. Vector formats
          are recommended for the best print quality.
        </div>
      </details>

      {/* FAQ 2 */}
      <details className="group border border-black rounded-2xl bg-white shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">
        <summary className="flex cursor-pointer list-none items-center justify-between p-6 font-black text-lg">
          Do you offer samples before bulk production?
          <span className="text-2xl transition-transform duration-300 group-open:rotate-45">
            +
          </span>
        </summary>

        <div className="border-t border-black px-6 py-5 text-gray-600">
          Yes. We can provide sample prints or embroidery samples before final
          production for approval.
        </div>
      </details>

      {/* FAQ 3 */}
      <details className="group border border-black rounded-2xl bg-white shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">
        <summary className="flex cursor-pointer list-none items-center justify-between p-6 font-black text-lg">
          What is your minimum order quantity?
          <span className="text-2xl transition-transform duration-300 group-open:rotate-45">
            +
          </span>
        </summary>

        <div className="border-t border-black px-6 py-5 text-gray-600">
          Minimum order quantities vary by service. DTF printing has low minimums,
          while screen printing is ideal for bulk orders.
        </div>
      </details>

      {/* FAQ 4 */}
      <details className="group border border-black rounded-2xl bg-white shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">
        <summary className="flex cursor-pointer list-none items-center justify-between p-6 font-black text-lg">
          How long does delivery take?
          <span className="text-2xl transition-transform duration-300 group-open:rotate-45">
            +
          </span>
        </summary>

        <div className="border-t border-black px-6 py-5 text-gray-600">
          Standard production and delivery usually takes 7–10 business days,
          depending on order quantity and customization requirements.
        </div>
      </details>

      {/* FAQ 5 */}
      <details className="group border border-black rounded-2xl bg-black text-white shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[5px_8px_0px_#000]">
        <summary className="flex cursor-pointer list-none items-center justify-between p-6 font-black text-lg">
          Do you provide design assistance?
          <span className="text-2xl transition-transform duration-300 group-open:rotate-45">
            +
          </span>
        </summary>

        <div className="border-t border-white/20 px-6 py-5 text-gray-300">
          Yes. Our design team can help refine your artwork or create custom
          designs optimized for printing and embroidery.
        </div>
      </details>

    </div>

  </div>
</section>

      {/* CTA Section */}
     <section className="py-20 bg-white">
  <div className="max-w-[1800px] mx-auto px-5">

    <div className="mb-10 flex items-center gap-3">
              <img
                src="/gold-arrow.png" // your arrow image
                alt="arrow"
                className="w-8 h-8"
              />
              <h2 className="text-3xl font-semibold md:text-4xl">
                Shop Our Best Selling Products 
              </h2>
          </div>
          
    <div className="border border-black rounded-3xl p-8 md:p-12 lg:p-16 bg-white shadow-[1px_1px_0px_#000] transition-all duration-300 ease-out hover:shadow-[5px_8px_0px_#000]">
      <div className="max-w-4xl mx-auto text-center">
        <span className="inline-block border border-black px-4 py-2 text-xs font-bold uppercase tracking-wider mb-5">
          Get Started
        </span>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black mb-5">
          Ready to Bring Your Ideas to Life?
        </h2>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Whether you need custom apparel, corporate gifting, uniforms,
          promotional merchandise, or bulk printing, our team is ready to help.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-black px-8 py-4 text-white font-bold border border-black transition-all duration-300 ease-out hover:-translate-y-1"
          >
            Get a Quote
            <FaArrowRight />
          </Link>

          <a
            href="https://wa.me/918005551234"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-black bg-white px-8 py-4 text-black font-bold transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-black hover:text-white"
          >
            <FaWhatsapp />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}