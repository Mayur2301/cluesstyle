'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from "react";
import {
  FaTshirt,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaStar,
  FaFilter,
  FaSearch,
  FaShoppingBag,
  FaBolt,
} from 'react-icons/fa';
import SameDayDeliveryFAQ from '../components/same-day-delivery-faq';
import SameDayDeliveryCities from '../components/same-day-delivery-cities';
import SplitTestimonials from '../components/home-reviews';

interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  minOrder: number;
  deliveryTime: string;
  image: string;
  description: string;
  features: string[];
  colors: string[];
  sizes: string[];
  deliveryType: 'same-day' | '60-min';
}

const allProducts: Product[] = [
  // ── Same Day Products ──
  {
    id: '1',
    slug: 'premium-cotton-t-shirts',
    name: 'Premium Cotton T-Shirts',
    category: 'T-Shirts',
    price: 299,
    minOrder: 12,
    deliveryTime: '4-6 hours',
    image: '/products/tshirt.jpg',
    description: 'High-quality 100% combed cotton t-shirts with premium screen printing.',
    features: ['100% Combed Cotton', 'Pre-shrunk fabric', 'Double-stitched hem', 'Reactive dyeing'],
    colors: ['Black', 'White', 'Navy', 'Red', 'Royal Blue', 'Charcoal'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    deliveryType: 'same-day',
  },
  {
    id: '2',
    slug: 'polo-t-shirts',
    name: 'Polo T-Shirts',
    category: 'Polos',
    price: 499,
    minOrder: 12,
    deliveryTime: '6-8 hours',
    image: '/products/polo.jpg',
    description: 'Classic polo t-shirts with embroidered logos. Premium pique fabric.',
    features: ['Pique fabric', 'Button-down collar', 'Moisture-wicking', 'Reinforced stitching'],
    colors: ['Black', 'White', 'Navy', 'Maroon', 'Teal', 'Grey'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    deliveryType: 'same-day',
  },
  {
    id: '3',
    slug: 'custom-jerseys',
    name: 'Custom Jerseys',
    category: 'Jerseys',
    price: 799,
    minOrder: 20,
    deliveryTime: '8-10 hours',
    image: '/products/jersey.jpg',
    description: 'Professional sports jerseys with full customization for teams and events.',
    features: ['Dri-Fit fabric', 'Sublimation printing', 'Custom name/number', 'Breathable mesh'],
    colors: ['Red/White', 'Blue/White', 'Green/White', 'Black/Gold', 'Custom'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    deliveryType: 'same-day',
  },
  {
    id: '4',
    slug: 'embroidery-services',
    name: 'Embroidery Services',
    category: 'Embroidery',
    price: 199,
    minOrder: 10,
    deliveryTime: '4-6 hours',
    image: '/products/embroidery.jpg',
    description: 'Professional embroidery on caps, polos, jackets, and bags.',
    features: ['Premium threads', '3D puff option', 'Multiple colors', 'Digitizing included'],
    colors: ['Any color thread available'],
    sizes: ['One size fits all placement'],
    deliveryType: 'same-day',
  },
  {
    id: '5',
    slug: 'hoodies-sweatshirts',
    name: 'Hoodies & Sweatshirts',
    category: 'Hoodies',
    price: 899,
    minOrder: 10,
    deliveryTime: '8-10 hours',
    image: '/products/hoodie.jpg',
    description: 'Comfortable hoodies with custom screen printing or embroidery.',
    features: ['80% Cotton, 20% Polyester', 'Kangaroo pocket', 'Drawstring hood', 'Ribbed cuffs'],
    colors: ['Black', 'Navy', 'Grey', 'Maroon', 'Forest Green'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    deliveryType: 'same-day',
  },
  {
    id: '6',
    slug: 'sublimation-printing',
    name: 'Sublimation Printing',
    category: 'Sublimation',
    price: 399,
    minOrder: 1,
    deliveryTime: '5-6 hours',
    image: '/products/sublimation.jpg',
    description: 'Full-color sublimation on polyester fabrics. All-over print capability.',
    features: ['Full color', 'All-over print', 'No minimum quantity', 'Photo-quality'],
    colors: ['Full color printing on white polyester'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    deliveryType: 'same-day',
  },
  {
    id: '7',
    slug: 'corporate-gifts',
    name: 'Corporate Gifts',
    category: 'Corporate',
    price: 199,
    minOrder: 25,
    deliveryTime: '8-10 hours',
    image: '/products/corporate.jpg',
    description: 'Custom branded corporate gifts including pens, mugs, bags, and more.',
    features: ['Bulk pricing', 'Logo placement', 'Gift wrapping', 'Fast delivery'],
    colors: ['Customizable'],
    sizes: ['Standard sizes available'],
    deliveryType: 'same-day',
  },
  // ── 60 Min Products ──
  {
    id: '8',
    slug: 'dtf-printing-express',
    name: 'DTF Printing Express',
    category: 'DTF',
    price: 149,
    minOrder: 1,
    deliveryTime: '45-60 min',
    image: '/products/dtf.jpg',
    description: 'Direct-to-film transfers for any fabric type. Ready in under 60 minutes.',
    features: ['Any fabric type', 'Vibrant colors', 'White ink included', 'Wash-resistant'],
    colors: ['Full color printing'],
    sizes: ['Any size up to A3'],
    deliveryType: '60-min',
  },
  {
    id: '9',
    slug: 'vinyl-printing-express',
    name: 'Vinyl Printing Express',
    category: 'Vinyl',
    price: 99,
    minOrder: 5,
    deliveryTime: '30-60 min',
    image: '/products/vinyl.jpg',
    description: 'Heat transfer vinyl for jerseys and bags. Walk in, walk out in an hour.',
    features: ['Gloss/Metallic finish', 'Easy application', 'Long-lasting', 'Multiple colors'],
    colors: ['Gold', 'Silver', 'White', 'Black', 'Red', 'Blue'],
    sizes: ['Custom sizes available'],
    deliveryType: '60-min',
  },
  {
    id: '10',
    slug: 'express-t-shirts',
    name: 'Express T-Shirts',
    category: 'T-Shirts',
    price: 349,
    minOrder: 5,
    deliveryTime: '45-60 min',
    image: '/products/tshirt-express.jpg',
    description: 'Walk in with your design, walk out with printed tees in under an hour.',
    features: ['100% Cotton', 'Screen printing', 'Upto 5 colours', 'Same visit pickup'],
    colors: ['Black', 'White', 'Navy', 'Red'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    deliveryType: '60-min',
  },
  {
    id: '11',
    slug: 'express-caps',
    name: 'Embroidered Caps Express',
    category: 'Caps',
    price: 249,
    minOrder: 6,
    deliveryTime: '45-60 min',
    image: '/products/cap.jpg',
    description: 'Custom embroidered caps ready in 60 minutes. Perfect for events and gifting.',
    features: ['Structured cap', 'Up to 5 colours', 'Any logo', 'Adjustable strap'],
    colors: ['Black', 'Navy', 'White', 'Red', 'Grey'],
    sizes: ['One size (adjustable)'],
    deliveryType: '60-min',
  },
  {
    id: '12',
    slug: 'express-mugs',
    name: 'Printed Mugs Express',
    category: 'Corporate',
    price: 179,
    minOrder: 1,
    deliveryTime: '30-45 min',
    image: '/products/mug.jpg',
    description: 'Sublimation printed mugs ready in 30 minutes. Great for gifts.',
    features: ['Full wrap print', 'Dishwasher safe', 'Any image/logo', 'No minimum'],
    colors: ['White mug, full color print'],
    sizes: ['330ml standard'],
    deliveryType: '60-min',
  },
];

const testimonials = [
  {
    id: 1,
    name: "Priti Mehra",
    role: "Founder, Urban Threads",
    video: "/priti-unboxing.mp4",
  },
  {
    id: 2,
    name: "Priya Mehta",
    role: "CEO, StyleHub",
    video: "/unboxing.mp4",
  },
  {
    id: 3,
    name: "Rahul Verma",
    role: "Director, PrintLab",
    video: "/rahul-unboxing.mp4",
  },
   {
    id: 4,
    name: "Babita Iyer",
    role: "Role, Iyer ki Biwi",
    video: "/babita-unboxing.mp4",
  },
  {
    id: 5,
    name: "Daya Gada",
    role: "Role, Jethalal ki Biwi",
    video: "/daya-unboxing.mp4",
  },
];

const sameDayCategories = ['All', 'T-Shirts', 'Polos', 'Jerseys', 'Embroidery', 'Hoodies', 'Sublimation', 'Corporate'];
const sixtyMinCategories = ['All', 'DTF', 'Vinyl', 'T-Shirts', 'Caps', 'Corporate'];

type DeliveryTab = 'same-day' | '60-min';

export default function CorporateGift() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<DeliveryTab>('same-day');

  const handleTabChange = (tab: DeliveryTab) => {
    setActiveTab(tab);
    setSelectedCategory('All');
    setSearchTerm('');
  };
const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  const handlePlay = (id: number) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scroll = (direction: "left" | "right") => {
  if (!scrollRef.current) return;

  const scrollAmount = 420; // match card width + gap

  scrollRef.current.scrollBy({
    left: direction === "left" ? -scrollAmount : scrollAmount,
    behavior: "smooth",
  });
};
  const categories = activeTab === 'same-day' ? sameDayCategories : sixtyMinCategories;

  const filteredProducts = allProducts.filter((product) => {
    const matchesTab = product.deliveryType === activeTab;
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesCategory && matchesSearch;
  });


   
  return (
    <div className="min-h-screen bg-white text-black">

      {/* ── HERO ── */}
      <div className="relative min-h-[600px] overflow-hidden">
  {/* Background Image */}
  <Image
    src="/corporate-gift.webp"
    alt="Corporate gifting image by cluesstyle"
    fill
    priority
    className="object-cover"
  />

  {/* Overlay */}
  <div className="absolute inset-0 bg-black/65" />

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
           Corporate Gifting
          </li>
        </ol>
      </nav>

      {/* Eyebrow */}
      <span className="mb-4 inline-flex rounded-full border border-white/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
        Corporate Gifting
      </span>

      {/* Heading */}
      <h1 className="mb-6 text-5xl font-black leading-tight text-white md:text-6xl lg:text-7xl">
       Professional Gift
        <span className="block text-white/80">
         Hampers
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

      {/* ── FEATURES BAR ── */}
      
      <div className=" py-4 bg-white">
        <div className="mx-auto max-w-[1600px] px-4 py-4">
          <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-gray-600">
            <div className="flex items-center gap-1.5">
              <FaClock className="w-3.5 h-3.5 text-black" />
              <span>4–10 Hour Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaCheckCircle className="w-3.5 h-3.5 text-black" />
              <span>Premium Quality</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaStar className="w-3.5 h-3.5 text-black" />
              <span>10,000+ Happy Customers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaTruck className="w-3.5 h-3.5 text-black" />
              <span>Free Delivery in Mumbai</span>
            </div>
          </div>

          {/* ── Delivery Tab Buttons ── */}
          {/* <div className="flex justify-center py-15">
            <div className="inline-flex items-center border border-black rounded-xl overflow-hidden">
              <button
                onClick={() => handleTabChange('same-day')}
                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold transition-all duration-200 ${
                  activeTab === 'same-day'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                <FaTruck className="w-3.5 h-3.5" />
                Same Day Delivery
              </button>
              <button
                onClick={() => handleTabChange('60-min')}
                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold transition-all duration-200 ${
                  activeTab === '60-min'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                <FaBolt className="w-3.5 h-3.5" />
                60 Min Delivery
              </button>
            </div>
          </div> */}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="mx-auto max-w-[1600px] px-4 py-1">

        {/* Active tab label */}
        <div className="mb-6">
          {activeTab === 'same-day' ? (
            <div className="mb-10 flex items-center gap-4">
              <img
                src="/gold-arrow.png"
                alt="Arrow"
                className="h-8 w-8 md:h-10 md:w-10 object-contain"
              />

              <h2 className="text-3xl md:text-5xl font-black text-black leading-none">
                Explore Coporate Gifts
              </h2>
            </div>
          ) : (
            <div className="mb-10 flex items-center gap-4">
              <img
                src="/gold-arrow.png"
                alt="Arrow"
                className="h-8 w-8 md:h-10 md:w-10 object-contain"
              />

              <h2 className="text-3xl md:text-5xl font-black text-black leading-none">
                Our Top Selling Products
              </h2>
            </div>
          )}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-black rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-2 border border-black rounded-lg text-sm font-medium"
          >
            <FaFilter className="w-3 h-3" />
            Filters
          </button>

          <div className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-wrap gap-2`}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedCategory === category
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black hover:bg-black hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-6">
          Showing <span className="font-semibold text-black">{filteredProducts.length}</span> products
        </p>

        {/* ── PRODUCTS GRID ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/same-day-delivery/${product.slug}`}
              className="group block h-full"
            >
              {/* Card image area — white bg, glossy glass overlay on hover */}
              <div className="relative h-64 sm:h-95 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1">
                {/* Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide ${
                      product.deliveryType === '60-min'
                        ? 'bg-black text-white'
                        : 'bg-black text-white'
                    }`}
                  >
                    {product.deliveryType === '60-min' ? '⚡ 60 Min' : '🚚 Same Day'}
                  </span>
                </div>

                {/* Product image placeholder */}
                {/* <div className="w-full h-full flex items-center justify-center">
                  <FaTshirt className="w-16 h-16 text-gray-150" style={{ color: '#e5e7eb' }} />
                </div> */}
                
                  {/* Uncomment when real images are ready: */}
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-4 sm:p-6 transition-transform duration-500 group-hover:scale-105"
                  />
               

                {/* Glossy glass hover overlay */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                  <div
                    className="px-3 py-3 border-t border-white/40"
                    style={{
                      background: 'rgba(255,255,255,0.55)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                    }}
                  >
                    <h3 className="text-xs sm:text-sm font-bold text-black leading-snug line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="mt-0.5 text-xs text-black/70">
                      Min qty: {product.minOrder}+ · ₹{product.price}/pc
                    </div>
                    <button className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-full bg-black py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-gray-800">
                      <FaShoppingBag className="text-xs" />
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Below-card info */}
              <div className="mt-2.5 px-1 flex items-center justify-between">
                <p className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 flex-1 mr-2">
                  {product.name}
                </p>
                <span className="text-xs sm:text-sm font-black text-gray-700 flex-shrink-0">
                  ₹{product.price}/pc
                </span>
              </div>
              <div className="px-1 mt-0.5 flex items-center justify-between">
                <p className="text-xs text-gray-400">Min qty: {product.minOrder}+</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <FaClock className="w-2.5 h-2.5" />
                  {product.deliveryTime}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <FaTshirt className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">No products found</h3>
            <p className="text-sm text-gray-400">Try adjusting your search or filter</p>
          </div>
        )}
        <br></br>
      </div>



{/* video testimonials */}
 <section className="bg-white py-20">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8">

        {/* Heading */}
        <div className="mb-10 flex items-center gap-4">
          <img
            src="/gold-arrow.png"
            alt="Arrow"
            className="h-8 w-8 md:h-10 md:w-10 object-contain"
          />

          <h2 className="text-3xl md:text-5xl font-black text-black">
            Our Happy Clients
          </h2>
        </div>


        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
        >

          {testimonials.map((item) => (
            <div
              key={item.id}
              className="min-w-[300px] md:min-w-[350px] flex-shrink-0"
            >
              {/* Fixed Card */}
              <div className="relative w-[320px] h-[520px] overflow-hidden rounded-3xl border border-gray-200 bg-black shadow-[6px_6px_0px_#000]">

                <video
                 ref={(el) => {
                  videoRefs.current[item.id] = el;
                }}
                  src={item.video}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />

                {/* Play Button */}
                <button
                  onClick={() => handlePlay(item.id)}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg hover:scale-110 transition">
                    ▶
                  </div>
                </button>
              </div>

              {/* Info */}
              <div className="mt-4">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.role}</p>
              </div>
            </div>
          ))}

          
        </div>
        


        {/* carousal btns */}

        <div className="mb-6 flex justify-end gap-3">
  <button
    onClick={() => scroll("left")}
    className="h-10 w-10 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition"
  >
    ←
  </button>

  <button
    onClick={() => scroll("right")}
    className="h-10 w-10 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition"
  >
    →
  </button>
</div>


      </div>
      
    </section>

{/* win chance  */}
<section className="py-5">
  
  <div className="mx-auto max-w-[1600px] px-4  md:px-8">
            <div className="mb-10 flex items-center gap-3">
              <img
                src="/gold-arrow.png" // your arrow image
                alt="arrow"
                className="w-8 h-8"
              />
              <h2 className="text-3xl font-semibold md:text-4xl">
                Our Efforts Your Comfort
              </h2>
          </div>
    <div
      className="
        grid
        gap-8
        lg:grid-cols-2
        overflow-hidden
        rounded-3xl
        border border-black
        bg-white
        shadow-[8px_8px_0px_#000]
      "
    >
      {/* Left Image */}
      <div className="relative min-h-[320px] lg:min-h-[550px] bg-[#f5f5f5]">
        <Image
          src="/testimonial-cta.jpg"
          alt="Customer Testimonial"
          fill
          className="object-cover"
        />
      </div>

      {/* Right Content */}
      <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
        <span
          className="
            mb-4
            inline-flex
            w-fit
            rounded-full
            border
            border-black
            px-4
            py-1.5
            text-xs
            font-bold
            uppercase
            tracking-[0.2em]
          "
        >
          Community Spotlight
        </span>

        <h2 className="text-3xl font-black leading-tight md:text-5xl">
          Win a Chance to Have Your Testimonial Featured
        </h2>

        <p className="mt-5 max-w-xl text-gray-600 text-lg">
          Share your experience with CluesStyle and get featured on our
          website, social media channels, and marketing campaigns.
          Selected customers may also receive exclusive rewards and
          special offers.
        </p>

        <div className="mt-8">
          <a
            href="mailto:hello@cluesstyle.com?subject=Testimonial Submission"
            className="
              inline-flex
              items-center
              rounded-xl
              bg-black
              px-8
              py-4
              font-bold
              text-white
              transition
              hover:-translate-y-1
            "
          >
            Submit Your Testimonial
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

{/* win chance */}
      {/* ── WHY CHOOSE US ── */}
      


<div className="relative mx-auto max-w-[1600px] px-4 py-10">

  
  <div className="absolute inset-0 -z-10 opacity-30">
    <div className="h-full w-full bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(to_right,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px]" />
  </div>
<div className="mb-10 flex items-center gap-3">
              <img
                src="/gold-arrow.png" // your arrow image
                alt="arrow"
                className="w-8 h-8"
              />
              <h2 className="text-3xl font-semibold md:text-4xl">
                Our Efforts Your Comfort
              </h2>
          </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">



  {/* LEFT CONTENT */}
  <div
    className="
      flex flex-col justify-center

      rounded-b-2xl lg:rounded-2xl
      border border-t-0 lg:border
      border-black/20

      bg-white
      p-5 sm:p-6 lg:p-10

      shadow-[6px_6px_0px_#000]
      order-2 lg:order-1
    "
  >
    <h3 className="text-[28px] md:text-[38px] font-black leading-tight">
     Order Effortlessly and Recieve Parcel your Door Step
    </h3>

    <p className="mt-4 text-[16px] leading-7 text-gray-600">
      Whether you're ordering for your company, event, college,
      sports team, or marketing campaign, CluesStyle provides
      premium quality custom apparel and merchandise at scale.
    </p>

    <p className="mt-4 text-[16px] leading-7 text-gray-600">
      Get dedicated support, fast production timelines,
      multiple branding options and nationwide delivery.
    </p>
     <p className="mt-4 text-[16px] leading-7 text-gray-600">
      Get dedicated support, fast production timelines,
      multiple branding options and nationwide delivery.
    </p>

    <p className="mt-4 text-[16px] leading-7 text-gray-600">
      Get dedicated support, fast production timelines,
      multiple branding options and nationwide delivery.
    </p>


    <div className="mt-6 flex flex-wrap gap-3">
     
    
      <Link href="/bulk-order">
        <button
          className="
            rounded-[25px]
            border border-black
            px-6 py-3
            font-semibold
            transition
            hover:bg-black
            hover:text-white
          "
        >
          Learn More
        </button>
      </Link>
    </div>
  </div>

  {/* RIGHT VIDEO */}
<div
  className="
    overflow-hidden
    rounded-t-2xl lg:rounded-2xl
    border border-black/20
    bg-[#ffff]
    p-3 lg:p-0
    shadow-[6px_6px_0px_#000]
    order-1 lg:order-2
  "
>
  <div
    className="
      relative w-full overflow-hidden rounded-xl
      aspect-[4/5]
      sm:aspect-[16/10]
      lg:h-full
      min-h-[320px]
      lg:min-h-[100%]
    "
  >
    <Image
      src="/bulk-order-hp.jpg"
      alt="Bulk Order Hero"
      fill
      priority
      className="object-cover"
    />
  </div>
</div>

</div>
</div>

      {/* ── CTA ── */}
      <SameDayDeliveryFAQ/>

<SameDayDeliveryCities
  heading="Same Day Delivery Cities"
  items={[
    {
      title: "Same Day Delivery in Vikroli",
      desc: "Fast delivery service in Mumbai within 24 hours.",
      href: "#",
    },
    {
      title: "Same Day Delivery in Dadar",
      desc: "Quick delivery services across Delhi NCR.",
      href: "#",
    },
    {
      title: "Same Day Delivery in Mira Bhayander",
      desc: "Quick delivery services across Delhi NCR.",
      href: "#",
    },
    {
      title: "Same Day Delivery in Dahisar",
      desc: "Quick delivery services across Delhi NCR.",
      href: "#",
    },
    {
      title: "Same Day Delivery in Ghatkopar",
      desc: "Quick delivery services across Delhi NCR.",
      href: "#",
    },
     {
      title: "Same Day Delivery in Mulund",
      desc: "Quick delivery services across Delhi NCR.",
      href: "#",
    },
     {
      title: "Same Day Delivery in Wadala",
      desc: "Quick delivery services across Delhi NCR.",
      href: "#",
    },

     {
      title: "Same Day Delivery in Cotton Green",
      desc: "Quick delivery services across Delhi NCR.",
      href: "#",
    },
    {
      title: "Same Day Delivery in Mumbai Central",
      desc: "Quick delivery services across Delhi NCR.",
      href: "#",
    },
    {
      title: "Same Day Delivery in Mumbai",
      desc: "Quick delivery services across Delhi NCR.",
      href: "#",
    },
  ]}
/>
      


{/* <SplitTestimonials/> */}

      {/* code of body ends here */}
    </div>
    
  );
}