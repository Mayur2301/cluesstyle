// app/same-day-delivery/[slug]/product-details.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaArrowLeft, 
  FaTshirt, 
  FaCheckCircle, 
  FaClock, 
  FaTruck,
  FaStar,
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaMinus,
  FaPlus,
  FaRupeeSign,
  FaShare
} from 'react-icons/fa';

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
}

const productsData: Record<string, Product> = {
  'premium-cotton-t-shirts': {
    id: '1',
    slug: 'premium-cotton-t-shirts',
    name: 'Premium Cotton T-Shirts',
    category: 'T-Shirts',
    price: 299,
    minOrder: 12,
    deliveryTime: '4-6 hours',
    image: '/products/tshirt.jpg',
    description: 'High-quality 100% combed cotton t-shirts with premium screen printing. Perfect for events, corporate gifts, and bulk orders. Our t-shirts are pre-shrunk and feature double-stitched hems for durability.',
    features: ['100% Combed Cotton', 'Pre-shrunk fabric', 'Double-stitched hem', 'Reactive dyeing', 'Neck ribbing', 'Tear-away label'],
    colors: ['Black', 'White', 'Navy', 'Red', 'Royal Blue', 'Charcoal', 'Maroon', 'Forest Green'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  },
  'polo-t-shirts': {
    id: '2',
    slug: 'polo-t-shirts',
    name: 'Polo T-Shirts',
    category: 'Polos',
    price: 499,
    minOrder: 12,
    deliveryTime: '6-8 hours',
    image: '/products/polo.jpg',
    description: 'Classic polo t-shirts with embroidered logos. Premium pique fabric for a sophisticated look. Perfect for corporate events and team uniforms.',
    features: ['Pique fabric', 'Button-down collar', 'Moisture-wicking', 'Reinforced stitching', 'Durable buttons', 'Wrinkle-resistant'],
    colors: ['Black', 'White', 'Navy', 'Maroon', 'Teal', 'Grey', 'Red'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  'custom-jerseys': {
    id: '3',
    slug: 'custom-jerseys',
    name: 'Custom Jerseys',
    category: 'Jerseys',
    price: 799,
    minOrder: 20,
    deliveryTime: '8-10 hours',
    image: '/products/jersey.jpg',
    description: 'Professional sports jerseys with full customization. Perfect for cricket, football, basketball teams, and sports events.',
    features: ['Dri-Fit fabric', 'Sublimation printing', 'Custom name/number', 'Breathable mesh', 'Reinforced stitching', 'Lightweight'],
    colors: ['Red/White', 'Blue/White', 'Green/White', 'Black/Gold', 'Custom'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  },
  'embroidery-services': {
    id: '4',
    slug: 'embroidery-services',
    name: 'Embroidery Services',
    category: 'Embroidery',
    price: 199,
    minOrder: 10,
    deliveryTime: '4-6 hours',
    image: '/products/embroidery.jpg',
    description: 'Professional embroidery on caps, polos, jackets, and bags. Premium thread quality with excellent detail and durability.',
    features: ['Premium threads', '3D puff option', 'Multiple colors', 'Digitizing included', 'Vector file support', 'Quality guarantee'],
    colors: ['Any color thread available'],
    sizes: ['One size fits all placement'],
  },
  'hoodies-sweatshirts': {
    id: '5',
    slug: 'hoodies-sweatshirts',
    name: 'Hoodies & Sweatshirts',
    category: 'Hoodies',
    price: 899,
    minOrder: 10,
    deliveryTime: '8-10 hours',
    image: '/products/hoodie.jpg',
    description: 'Comfortable hoodies with custom screen printing or embroidery. Perfect for events, branding, and winter collections.',
    features: ['80% Cotton, 20% Polyester', 'Kangaroo pocket', 'Drawstring hood', 'Ribbed cuffs', 'Heavyweight fabric', 'Warm and cozy'],
    colors: ['Black', 'Navy', 'Grey', 'Maroon', 'Forest Green'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  'dtf-printing': {
    id: '6',
    slug: 'dtf-printing',
    name: 'DTF Printing',
    category: 'DTF',
    price: 149,
    minOrder: 1,
    deliveryTime: '3-4 hours',
    image: '/products/dtf.jpg',
    description: 'Direct-to-film transfers for any fabric type. Vibrant colors and excellent durability. Perfect for complex designs.',
    features: ['Any fabric type', 'Vibrant colors', 'White ink included', 'Wash-resistant', 'Stretchy', 'Fine details'],
    colors: ['Full color printing'],
    sizes: ['Any size up to A3'],
  },
  'vinyl-printing': {
    id: '7',
    slug: 'vinyl-printing',
    name: 'Vinyl Printing',
    category: 'Vinyl',
    price: 99,
    minOrder: 5,
    deliveryTime: '3-4 hours',
    image: '/products/vinyl.jpg',
    description: 'Heat transfer vinyl for jerseys, bags, and accessories. Perfect for names, numbers, and single-color designs.',
    features: ['Gloss/Metallic finish', 'Easy application', 'Long-lasting', 'Multiple colors', 'Precision cut', 'Heat press applied'],
    colors: ['Gold', 'Silver', 'White', 'Black', 'Red', 'Blue', 'Yellow', 'Green'],
    sizes: ['Custom sizes available'],
  },
  'sublimation-printing': {
    id: '8',
    slug: 'sublimation-printing',
    name: 'Sublimation Printing',
    category: 'Sublimation',
    price: 399,
    minOrder: 1,
    deliveryTime: '5-6 hours',
    image: '/products/sublimation.jpg',
    description: 'Full-color sublimation on polyester fabrics. All-over print capability with photo-quality results.',
    features: ['Full color', 'All-over print', 'No minimum quantity', 'Photo-quality', 'Vibrant colors', 'No fading'],
    colors: ['Full color printing on white polyester'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  'corporate-gifts': {
    id: '9',
    slug: 'corporate-gifts',
    name: 'Corporate Gifts',
    category: 'Corporate',
    price: 199,
    minOrder: 25,
    deliveryTime: '8-10 hours',
    image: '/products/corporate.jpg',
    description: 'Custom branded corporate gifts including pens, mugs, bags, and more. Perfect for events and client gifting.',
    features: ['Bulk pricing', 'Logo placement', 'Gift wrapping', 'Fast delivery', 'Custom packaging', 'Quality materials'],
    colors: ['Customizable'],
    sizes: ['Standard sizes available'],
  },
};

export default function ProductDetails({ slug }: { slug: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(12);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    if (productsData[slug]) {
      setProduct(productsData[slug]);
      if (productsData[slug].colors.length > 0) {
        setSelectedColor(productsData[slug].colors[0]);
      }
      if (productsData[slug].sizes.length > 0) {
        setSelectedSize(productsData[slug].sizes[0]);
      }
    }
  }, [slug]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FaTshirt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">The product you're looking for doesn't exist.</p>
          <Link
            href="/same-day-delivery"
            className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#155d8c' }}
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = product.price * quantity;

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else {
      setQuantity(prev => Math.max(product.minOrder, prev - 1));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/same-day-delivery"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#155d8c] transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            <div
              className="relative bg-gray-100 rounded-2xl overflow-hidden"
              style={{
                boxShadow: '8px 8px 0px 0px #000',
                border: '1px solid #000',
              }}
            >
              <div className="aspect-square flex items-center justify-center">
                <FaTshirt className="w-48 h-48 text-gray-300" />
              </div>
              <div className="absolute top-4 left-4">
                <span
                  className="text-xs font-semibold px-2 py-1 rounded"
                  style={{ backgroundColor: '#155d8c', color: 'white' }}
                >
                  Same Day Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-2">
              <span className="text-sm text-gray-500">{product.category}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="w-4 h-4 fill-current" style={{ color: '#155d8c' }} />
                ))}
              </div>
              <span className="text-sm text-gray-500">(1,234 reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold" style={{ color: '#155d8c' }}>
                ₹{product.price}
              </span>
              <span className="text-gray-500 text-sm"> / piece</span>
            </div>

            {/* Delivery Info */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FaClock className="w-5 h-5" style={{ color: '#155d8c' }} />
                <div>
                  <p className="text-xs text-gray-500">Delivery Time</p>
                  <p className="font-semibold text-gray-800">{product.deliveryTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaTruck className="w-5 h-5" style={{ color: '#155d8c' }} />
                <div>
                  <p className="text-xs text-gray-500">Free Delivery in Mumbai</p>
                  <p className="font-semibold text-gray-800">Above ₹5000</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="w-5 h-5" style={{ color: '#155d8c' }} />
                <div>
                  <p className="text-xs text-gray-500">Min Order Quantity</p>
                  <p className="font-semibold text-gray-800">{product.minOrder} pieces</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Key Features</h3>
              <ul className="grid grid-cols-2 gap-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCheckCircle className="w-4 h-4" style={{ color: '#155d8c' }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Colors */}
            {product.colors.length > 0 && product.colors[0] !== 'Full color printing' && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Available Colors</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        selectedColor === color
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={selectedColor === color ? { backgroundColor: '#155d8c' } : {}}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Available Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-lg font-medium transition-all ${
                        selectedSize === size
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={selectedSize === size ? { backgroundColor: '#155d8c' } : {}}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange('decrease')}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <FaMinus className="w-3 h-3" />
                  </button>
                  <span className="px-6 py-2 border-x border-gray-300 min-w-[80px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange('increase')}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <FaPlus className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Min order: {product.minOrder} pieces
                </p>
              </div>
            </div>

            {/* Total Price */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-2xl font-bold" style={{ color: '#155d8c' }}>
                  ₹{totalPrice.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                *Excluding GST and delivery charges
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/918005551234"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: '#25D366', color: 'white' }}
              >
                <FaWhatsapp className="w-5 h-5" />
                Order on WhatsApp
              </a>
              <a
                href="tel:+918005551234"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: '#155d8c', color: 'white' }}
              >
                <FaPhone className="w-5 h-5" />
                Call for Urgent Order
              </a>
            </div>

            {/* Share */}
            {/* <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="flex items-center gap-2 text-gray-500 hover:text-[#155d8c] transition-colors"
              >
                <FaShare className="w-4 h-4" />
                Share this product
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}