// app/components/ClientMobileMenu.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaTimes, FaBars, FaSearch } from 'react-icons/fa';

interface MenuItem {
  title: string;
  description: string;
  image: string;
  href: string;  // Changed from 'link' to 'href'
}

interface Menu {
  id: string;
  label: string;
  href: string;
  items: MenuItem[];
}

export default function ClientMobileMenu({ menus }: { menus: Menu[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (menuId: string) => {
    setOpenSubmenu(openSubmenu === menuId ? null : menuId);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg ml-1">
        <FaBars className="w-10 h-8 text-gray-600" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed inset-0 bg-white z-[200] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              {/* Search Bar */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-black"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Navigation Links */}
              {menus.map((menu) => (
                <div key={menu.id} className="mb-4 border-b border-gray-100">
                  <button
                    onClick={() => toggleSubmenu(menu.id)}
                    className="w-full text-left py-4 font-semibold flex justify-between items-center"
                  >
                    <span>{menu.label}</span>
                    <svg className={`w-5 h-5 transition-transform ${openSubmenu === menu.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openSubmenu === menu.id && (
                    <div className="pb-4 space-y-2">
                      {menu.items.map((item, idx) => (
                        <Link
                          key={idx}
                          href={item.href}  // Changed from item.link to item.href
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                            {item.image}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{item.title}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </Link>
                      ))}
                      <Link
                        href={menu.href}
                        className="block text-sm text-orange-600 font-semibold mt-2 pl-3"
                        onClick={() => setIsOpen(false)}
                      >
                        View All {menu.label} →
                      </Link>
                    </div>
                  )}
                </div>
              ))}

              {/* Additional Links */}
              <div className="mt-6 pt-4 border-t">
                <Link href="/account" className="block py-3 text-gray-700" onClick={() => setIsOpen(false)}>
                  My Account
                </Link>
                <Link href="/wishlist" className="block py-3 text-gray-700" onClick={() => setIsOpen(false)}>
                  My Wishlist
                </Link>
                <Link href="/cart" className="block py-3 text-gray-700" onClick={() => setIsOpen(false)}>
                  Shopping Cart
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}