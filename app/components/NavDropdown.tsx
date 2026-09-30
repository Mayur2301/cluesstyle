// app/components/NavDropdown.tsx
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

interface NavDropdownProps {
  menu: {
    id: string;
    label: string;
    items: Array<{
      title: string;
      description: string;
      image: string;
      link: string;
    }>;
  };
}

export default function NavDropdown({ menu }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button className={`px-4 py-2 text-sm font-semibold transition-colors rounded-lg cursor-pointer whitespace-nowrap ${isOpen ? 'text-black bg-gray-100' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}>
        {menu.label}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white shadow-2xl rounded-2xl overflow-hidden z-[200] min-w-[320px]">
          <div className="p-4">
            <div className="space-y-2">
              {menu.items.map((item, idx) => (
                <Link key={idx} href={item.link} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group" onClick={() => setIsOpen(false)}>
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {item.image}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-black group-hover:text-orange-600 transition-colors text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-2 border-t">
            <Link href={`/${menu.id}`} className="text-xs text-orange-600 font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all" onClick={() => setIsOpen(false)}>
              View All {menu.label} <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}