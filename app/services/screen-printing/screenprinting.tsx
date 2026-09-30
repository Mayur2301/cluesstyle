// app/screenprinting/screenprinting.tsx
'use client';

import { useState } from 'react';
import { 
  Shirt, 
  Award, 
  Truck, 
  Clock, 
  CheckCircle, 
  Star, 
  Phone, 
  Mail, 
  MapPin,
  ChevronRight,
  Sparkles,
  Users,
  MessageCircle,
  Facebook,
  Instagram,
  Twitter,
  ArrowRight,
  Shield,
  Printer,
  Palette,
  Layers,
  Heart
} from 'lucide-react';

// Collection Types
const collections = [
  { 
    id: 't-shirt', 
    name: 'T-Shirts', 
    icon: '👕',
    description: 'Classic fit, premium quality cotton t-shirts perfect for everyday wear and events.',
    features: ['100% combed ring-spun cotton', 'Pre-shrunk fabric', 'Tear-away label', 'Available in 20+ colors'],
    price: 'From $12.99',
    image: '/images/tshirt-collection.jpg'
  },
  { 
    id: 'hoodies-and-sweatshirt', 
    name: 'Hoodies & Sweatshirts', 
    icon: '👔',
    description: 'Comfortable fleece hoodies and sweatshirts perfect for all seasons and casual wear.',
    features: ['50/50 cotton-polyester blend', 'Air-jet spun yarn', 'Double-lined hood', 'Pouch pocket'],
    price: 'From $29.99',
    image: '/images/hoodie-collection.jpg'
  },
  { 
    id: 'jerseys', 
    name: 'Jersey\'s', 
    icon: '⚽',
    description: 'Performance fabric jerseys ideal for sports teams, clubs, and active wear.',
    features: ['Moisture-wicking fabric', 'Breathable mesh panels', 'Reinforced stitching', 'Customizable fit'],
    price: 'From $24.99',
    image: '/images/jersey-collection.jpg'
  },
  { 
    id: 'polos', 
    name: 'Polo\'s', 
    icon: '👕',
    description: 'Professional-looking polo shirts perfect for corporate events, golf, and casual office wear.',
    features: ['Pique knit fabric', 'Flat knit collar', '3-button placket', 'Side vents'],
    price: 'From $19.99',
    image: '/images/polo-collection.jpg'
  },
];

// Products under each collection
const collectionProducts = {
  't-shirt': [
    { name: 'Classic Crew Neck', colors: 12, price: '$14.99', sizes: 'XS-4XL' },
    { name: 'V-Neck Tee', colors: 8, price: '$15.99', sizes: 'XS-2XL' },
    { name: 'Premium Soft Tee', colors: 10, price: '$18.99', sizes: 'S-3XL' },
    { name: 'Performance Tee', colors: 6, price: '$16.99', sizes: 'XS-4XL' },
  ],
  'hoodies-and-sweatshirt': [
    { name: 'Classic Pullover Hoodie', colors: 8, price: '$34.99', sizes: 'XS-3XL' },
    { name: 'Full Zip Hoodie', colors: 6, price: '$39.99', sizes: 'XS-2XL' },
    { name: 'Crewneck Sweatshirt', colors: 10, price: '$29.99', sizes: 'XS-3XL' },
    { name: 'Heavy Blend Hoodie', colors: 8, price: '$44.99', sizes: 'S-4XL' },
  ],
  'jerseys': [
    { name: 'Soccer Jersey', colors: 4, price: '$29.99', sizes: 'S-2XL' },
    { name: 'Basketball Jersey', colors: 6, price: '$32.99', sizes: 'S-3XL' },
    { name: 'Football Jersey', colors: 5, price: '$34.99', sizes: 'M-2XL' },
    { name: 'Baseball Jersey', colors: 8, price: '$31.99', sizes: 'S-2XL' },
  ],
  'polos': [
    { name: 'Classic Pique Polo', colors: 12, price: '$24.99', sizes: 'XS-4XL' },
    { name: 'Performance Polo', colors: 8, price: '$27.99', sizes: 'S-3XL' },
    { name: 'Slim Fit Polo', colors: 6, price: '$26.99', sizes: 'XS-2XL' },
    { name: 'Long Sleeve Polo', colors: 5, price: '$29.99', sizes: 'S-3XL' },
  ],
};

// Custom Card Component with right and bottom border on hover
const CollectionCard = ({ collection, isSelected, onClick }: { collection: any, isSelected: boolean, onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full text-left transition-all duration-300 bg-white border border-gray-200 rounded-xl overflow-hidden
        ${isSelected ? 'shadow-lg' : 'hover:shadow-[4px_4px_0px_0px_black] hover:border-r-black hover:border-b-black'}`}
    >
      <div className="p-8">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-full bg-[#155d8c]/10 flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-[#155d8c]' : 'group-hover:bg-[#155d8c]'}`}>
            <span className={`text-3xl ${isSelected ? 'text-white' : 'text-[#155d8c] group-hover:text-white'}`}>
              {collection.icon}
            </span>
          </div>
          <div className="flex-1">
            <h3 className={`text-2xl font-bold transition-colors duration-300 ${isSelected ? 'text-[#155d8c]' : 'text-gray-900 group-hover:text-[#155d8c]'}`}>
              {collection.name}
            </h3>
            <p className="text-gray-600 mt-2 leading-relaxed">{collection.description}</p>
            <div className="flex flex-wrap gap-4 mt-4">
              <span className="text-sm text-gray-500">{collection.price}</span>
              <span className="text-sm text-[#155d8c] font-medium">{collection.features.length}+ features</span>
            </div>
          </div>
          <ChevronRight className={`w-6 h-6 transition-all duration-300 ${isSelected ? 'text-[#155d8c] translate-x-1' : 'text-gray-400 group-hover:text-[#155d8c] group-hover:translate-x-1'}`} />
        </div>
      </div>
    </button>
  );
};

// Product Card Component
const ProductCard = ({ product }: { product: any }) => {
  return (
    <div className="group bg-white border border-gray-200 rounded-xl p-5 transition-all duration-300 hover:shadow-[4px_4px_0px_0px_black] hover:border-r-black hover:border-b-black">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-gray-900 group-hover:text-[#155d8c] transition-colors">{product.name}</h4>
        <span className="text-lg font-bold text-[#155d8c]">{product.price}</span>
      </div>
      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#155d8c]"></span>
          {product.colors} colors
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#155d8c]"></span>
          Sizes: {product.sizes}
        </span>
      </div>
      <button className="mt-4 w-full py-2 border border-[#155d8c] text-[#155d8c] rounded-lg font-medium hover:bg-[#155d8c] hover:text-white transition-all">
        Request Quote
      </button>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => {
  return (
    <div className="group bg-white border border-gray-200 rounded-xl p-6 transition-all duration-300 hover:shadow-[4px_4px_0px_0px_black] hover:border-r-black hover:border-b-black">
      <div className="w-12 h-12 bg-[#155d8c]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#155d8c] transition-colors">
        <Icon className="w-6 h-6 text-[#155d8c] group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#155d8c] transition-colors">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

// Main Screen Printing Component
export default function ScreenPrintingPage() {
  const [selectedCollection, setSelectedCollection] = useState('t-shirt');
  const [showContactForm, setShowContactForm] = useState(false);

  const currentProducts = collectionProducts[selectedCollection as keyof typeof collectionProducts] || [];

  const features = [
    { icon: Printer, title: 'High Quality Printing', description: 'State-of-the-art equipment for vibrant, long-lasting prints' },
    { icon: Palette, title: 'Unlimited Colors', description: 'Print any color combination with precision matching' },
    { icon: Shield, title: 'Eco-Friendly Inks', description: 'Water-based, PVC-free inks safe for environment' },
    { icon: Clock, title: 'Fast Turnaround', description: '5-7 business days standard production' },
    { icon: Truck, title: 'Free Shipping', description: 'Free delivery on orders over $200' },
    { icon: Award, title: 'Quality Guarantee', description: '100% satisfaction guaranteed on all orders' },
  ];

  const process = [
    { step: '01', title: 'Upload Design', description: 'Share your artwork in any format' },
    { step: '02', title: 'Choose Products', description: 'Select from our premium collection' },
    { step: '03', title: 'Get Proof', description: 'Digital proof within 24 hours' },
    { step: '04', title: 'Production', description: 'Quality printing and inspection' },
    { step: '05', title: 'Delivery', description: 'Fast shipping to your door' },
  ];

  const testimonials = [
    { name: 'Sarah Johnson', role: 'Small Business Owner', content: 'The quality exceeded my expectations! The colors are vibrant and have held up perfectly.', rating: 5 },
    { name: 'Mike Thompson', role: 'Team Captain', content: 'Great service and communication throughout. Our team jerseys look amazing!', rating: 5 },
    { name: 'Emily Rodriguez', role: 'Event Organizer', content: 'Fast turnaround and excellent customer support. Will definitely order again.', rating: 5 },
  ];

  const faqs = [
    { q: 'What file formats do you accept?', a: 'We accept PNG, JPG, PDF, AI, EPS, and SVG files. Vector files are preferred for best results.' },
    { q: 'What is your minimum order quantity?', a: 'Our minimum order is 12 pieces per design. Contact us for smaller quantities.' },
    { q: 'How long does production take?', a: 'Standard production is 5-7 business days. Rush options available for an additional fee.' },
    { q: 'Do you provide design assistance?', a: 'Yes! Our design team can help optimize your artwork at no additional cost.' },
    { q: 'What are your shipping options?', a: 'We offer standard ground shipping (3-5 days) and expedited shipping (1-2 days).' },
  ];

  return (
    <div className="min-h-screen bg-white ">
      {/* Hero Section */}
      <br/><br/>
      <section
  className="relative text-white py-24 overflow-hidden
  bg-[url('/screen-printing-hero-banner.webp')] bg-cover bg-center
  w-[95rem] mx-auto rounded-3xl"
>
  {/* Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/80 rounded-3xl"></div>

  {/* Pattern */}
  <div className="absolute inset-0 opacity-5 rounded-3xl">
    <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle fill="white" cx="2" cy="2" r="1.5"></circle>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)"></rect>
    </svg>
  </div>

  {/* Content */}
  <div className="container mx-auto px-4 relative z-10">
    <div className="container mx-auto px-4 relative z-10">
    <div className="max-w-4xl mx-auto text-center">
      
      <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
        <Sparkles className="w-4 h-4" />
        <span className="text-sm">Professional Screen Printing Services</span>
      </div>

      <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
        Custom Screen Printing
        <span className="block text-white/90 text-3xl md:text-4xl mt-2">
          For Your Brand & Events
        </span>
      </h1>

      <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
        High-quality, durable prints on premium apparel. Perfect for teams, businesses, and special events.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <button className="px-8 py-4 bg-white text-[#155d8c] rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg text-lg">
          Get Free Quote
        </button>
        <button className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all text-lg">
          View Pricing
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>No Minimum on Select Items</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>Free Design Support</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>Fast Turnaround</span>
        </div>
      </div>

    </div>
  </div>
  </div>
</section>


 {/* Collections Section */}
      <section className="py-20 ">
  <div className="container mx-auto px-4 w-8xl">

    {/* Heading */}
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Our Products
      </h2>
      <p className="text-gray-600">
        Premium blank apparel ready for customization
      </p>
    </div>

    {/* Grid */}
    <div className="flex flex-wrap justify-center gap-6">

      {/* Card */}
      <div className="w-full sm:w-[48%] md:w-[31%] lg:flex-[1_1_260px] 
      border-2 border-black rounded-xl overflow-hidden 
      flex flex-col
      transition-all duration-150 ease-out will-change-transform 
      hover:translate-x-1 hover:translate-y-1 
      hover:shadow-[4px_4px_0px_0px_black]">

        {/* Image (edge-to-edge) */}
        <img 
          src="/t-shirt-cluesstyle.webp" 
          className="w-full h-48 object-contain bg-white"
        />

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-semibold mb-2">T-Shirts</h3>
          <p className="text-gray-600 text-sm mb-4">
            Comfortable everyday wear with premium quality fabric.
          </p>

          {/* Button pinned to bottom */}
          <div className="mt-auto">
            <a href="/services/screen-printing/t-shirts">
              <button className="w-full bg-black text-white py-2 rounded-lg">
                Shop
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="w-full sm:w-[48%] md:w-[31%] lg:flex-[1_1_260px] 
      border-2 border-black rounded-xl overflow-hidden 
      flex flex-col
      transition-all duration-150 ease-out will-change-transform 
      hover:translate-x-1 hover:translate-y-1 
      hover:shadow-[4px_4px_0px_0px_black]">

        <img src="/jersey-cluesstyle.webp" className="w-full h-48 object-contain bg-white" />

        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-semibold mb-2">Jerseys</h3>
          <p className="text-gray-600 text-sm mb-4">
            Perfect for teams and sports customization.
          </p>

          <div className="mt-auto">
            <a href="/services/screen-printing/jersey">
              <button className="w-full bg-black text-white py-2 rounded-lg">
                Shop
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="w-full sm:w-[48%] md:w-[31%] lg:flex-[1_1_260px] 
      border-2 border-black rounded-xl overflow-hidden 
      flex flex-col
      transition-all duration-150 ease-out will-change-transform 
      hover:translate-x-1 hover:translate-y-1 
      hover:shadow-[4px_4px_0px_0px_black]">

        <img src="/polos-cluesstyle.webp" className="w-full h-48 object-contain bg-white" />

        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-semibold mb-2">Polos</h3>
          <p className="text-gray-600 text-sm mb-4">
            Smart casual look for work and events.
          </p>

          <div className="mt-auto">
            <a href="/services/screen-printing/polo">
              <button className="w-full bg-black text-white py-2 rounded-lg">
                Shop
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="w-full sm:w-[48%] md:w-[31%] lg:flex-[1_1_260px] 
      border-2 border-black rounded-xl overflow-hidden 
      flex flex-col
      transition-all duration-150 ease-out will-change-transform 
      hover:translate-x-1 hover:translate-y-1 
      hover:shadow-[4px_4px_0px_0px_black]">

        <img src="/hoodies-cluesstyle.webp" className="w-full h-48 object-contain bg-white" />

        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-semibold mb-2">Hoodies & Sweatshirts</h3>
          <p className="text-gray-600 text-sm mb-4">
            Cozy, stylish and perfect for colder days.
          </p>

          <div className="mt-auto">
            <a href="/services/screen-printing/hoodies-and-sweatshirt/">
              <button className="w-full bg-black text-white py-2 rounded-lg">
                Shop
              </button>
            </a>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We combine quality craftsmanship with exceptional service</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

     

      {/* Process Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Simple, straightforward process from design to delivery</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {process.map((step, index) => (
              <div key={index} className="group relative">
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-[4px_4px_0px_0px_black] hover:border-r-black hover:border-b-black">
                  <div className="text-3xl font-bold text-[#155d8c]/20 mb-3">{step.step}</div>
                  <div className="w-12 h-12 bg-[#155d8c]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#155d8c] transition-colors">
                    <span className="text-[#155d8c] group-hover:text-white font-bold">{step.step}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#155d8c] transition-colors">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white ">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Transparent pricing with no hidden fees</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 w-8xl mx-auto">
            <div className="group bg-white border border-[#000] rounded-xl p-6 text-center transition-all duration-300 hover:shadow-[4px_4px_0px_0px_black] hover:border-r-black hover:border-b-black">
              <h3 className="text-xl font-semibold mb-2 group-hover:text-[#155d8c] transition-colors">Small Order</h3>
              <div className="text-4xl font-bold text-[#155d8c] mb-4">$299</div>
              <p className="text-gray-500 mb-6">Up to 24 pieces</p>
              <ul className="space-y-3 text-left mb-6">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> 1-2 color design</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Setup included</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Free proof</li>
              </ul>
              <button className="w-full py-2 border-2 border-[#000] text-[#ffff] rounded-lg font-semibold bg-[#000] hover:bg-[#155d8c] hover:text-white transition-colors">
                Get Quote
              </button>
            </div>
            <div className="group bg-white border-2 border-[#000] rounded-xl p-6 text-center relative transition-all duration-300 hover:shadow-[4px_4px_0px_0px_black] hover:border-r-black hover:border-b-black">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#155d8c] text-white text-xs px-3 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-[#155d8c] transition-colors">Standard Order</h3>
              <div className="text-4xl font-bold text-[#155d8c] mb-4">$599</div>
              <p className="text-gray-500 mb-6">25-100 pieces</p>
              <ul className="space-y-3 text-left mb-6">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Up to 4 colors</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Setup included</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Free design assistance</li>
              </ul>
              <button className="w-full py-2 border-2 border-[#000] text-[#ffff] rounded-lg font-semibold bg-[#000] hover:bg-[#155d8c] hover:text-white transition-colors">
                Get Quote
              </button>
            </div>
            <div className="group bg-white border border-[#000] rounded-xl p-6 text-center transition-all duration-300 hover:shadow-[4px_4px_0px_0px_black] hover:border-r-black hover:border-b-black">
              <h3 className="text-xl font-semibold mb-2 group-hover:text-[#155d8c] transition-colors">Bulk Order</h3>
              <div className="text-4xl font-bold text-[#155d8c] mb-4">$999+</div>
              <p className="text-gray-500 mb-6">100+ pieces</p>
              <ul className="space-y-3 text-left mb-6">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Unlimited colors</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Priority production</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Custom packaging</li>
              </ul>
              <button className="w-full py-2 border-2 border-[#000] text-[#ffff] rounded-lg font-semibold bg-[#000] hover:bg-[#155d8c] hover:text-white transition-colors">
                Get Quote
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Join thousands of satisfied customers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group bg-white border border-gray-200 rounded-xl p-6 transition-all duration-300 hover:shadow-[4px_4px_0px_0px_black] hover:border-r-black hover:border-b-black">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-[#155d8c] transition-colors">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Got questions? We've got answers</p>
          </div>
          <div className="w-8xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="group bg-white border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-[4px_4px_0px_0px_black] hover:border-r-black hover:border-b-black">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-6">
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#155d8c] transition-colors">{faq.q}</h3>
                    <span className="text-[#155d8c] group-open:rotate-180 transition-transform">
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-[#155d8c]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-white/90 mb-8 text-lg">
              Contact us today for a free consultation and quote. Our team is here to help bring your vision to life.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button 
                
                className="px-8 py-3 bg-white text-[#155d8c] rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Free Quote
              </button>
              <a href="../../customized-your-t-shirt">
              <button className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-colors">
                Let's Start with Design
              </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Request a Quote</h3>
              <button onClick={() => setShowContactForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155d8c]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155d8c]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155d8c]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea rows={3} className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#155d8c]"></textarea>
              </div>
              <button className="w-full py-2 bg-[#155d8c] text-white rounded-lg font-semibold hover:bg-[#0e4568] transition-colors">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}