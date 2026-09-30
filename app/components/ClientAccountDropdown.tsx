// app/components/ClientAccountDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  name: string;
  email: string;
  userType?: string;
  account_type?: string;
}

export default function ClientAccountDropdown({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDashboardLink = () => {
    const userType = user?.userType || user?.account_type;
    switch(userType) {
      case 'reseller': return '/dashboard/reseller';
      case 'club': return '/dashboard/club';
      case 'sponsor': return '/dashboard/sponsor';
      default: return '/dashboard/user';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    setIsOpen(false);
    window.location.href = '/account';
  };

  const displayName = user?.name?.split(' ')[0] || 'User';
  const initials = getInitials(user?.name || 'User');
  const userType = user?.userType || user?.account_type;

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-full">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm">{initials}</div>
        <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">{displayName}</span>
        {/* <svg className={`w-3 h-3 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg> */}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">{initials}</div>
              <div>
                <p className="font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <p className="text-xs text-purple-600 mt-0.5">
                  {userType === 'user' && '👤 Regular User'}
                  {userType === 'reseller' && '💼 Reseller'}
                  {userType === 'club' && '🏪 Club'}
                  {userType === 'sponsor' && '⭐ Sponsor'}
                </p>
              </div>
            </div>
          </div>
          <div className="py-2">
            <Link href={getDashboardLink()} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
              <span className="text-lg">📊</span> Dashboard
            </Link>
          </div>
          <div className="border-t">
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left">
              <span className="text-lg">🚪</span> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}