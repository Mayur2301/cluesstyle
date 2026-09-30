// app/not-found.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaHome, 
  FaSearch, 
  FaArrowLeft, 
  FaShoppingCart,
  FaHeart,
  FaStore,
  FaQuestionCircle,
  FaEnvelope
} from 'react-icons/fa';

export default function NotFound() {
  const suggestions = [
    { name: 'Shop T-Shirts', link: '/shop/t-shirts', icon: FaShoppingCart },
    { name: 'Screen Printing Services', link: '/services/screen-printing', icon: FaStore },
    { name: 'View Wishlist', link: '/wishlist', icon: FaHeart },
    { name: 'Help Center', link: '/help', icon: FaQuestionCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-20">
      <div className="max-w-4xl w-full">
        {/* Animated 404 Number */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
            404
          </h1>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track!
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-12"
        >
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for products, services, or help..."
              className="w-full px-6 py-4 pl-14 pr-24 border border-gray-300 rounded-full text-gray-900 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all shadow-sm"
            />
            <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
              Search
            </button>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors group"
          >
            <FaHome className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors group"
          >
            <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors group"
          >
            <FaEnvelope className="w-4 h-4" />
            Contact Support
          </Link>
        </motion.div>

        {/* Suggestions Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">
            You might be looking for:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
              >
                <Link
                  href={suggestion.link}
                  className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all group"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <suggestion.icon className="w-5 h-5" />
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-black">
                    {suggestion.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need immediate assistance?
            </h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to help you 24/7
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-orange-600 font-medium hover:text-orange-700 transition-colors"
            >
              Contact Customer Support
              <FaArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-20 -z-10"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 -z-10"></div>
        </div>
      </div>
    </div>
  );
}