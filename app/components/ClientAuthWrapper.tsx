// app/components/ClientAuthWrapper.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaUser } from 'react-icons/fa';
import ClientAccountDropdown from './ClientAccountDropdown';

export default function ClientAuthWrapper() {
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser({
        ...parsedUser,
        userType: userType || parsedUser.account_type || parsedUser.userType
      });
    }
    setIsLoading(false);
  }, []);

  // Show static user icon during SSR and initial load
  if (!isClient || isLoading) {
    return (
      <Link href="/account" className="p-2 hover:bg-gray-100 rounded-full relative block">
        <FaUser className="w-5 h-5 text-gray-600" />
      </Link>
    );
  }

  // Show dropdown if logged in
  if (user) {
    return <ClientAccountDropdown user={user} />;
  }

  // Show login link if not logged in
  return (
    <Link href="/account" className="p-2 hover:bg-gray-100 rounded-full relative block">
      <FaUser className="w-5 h-5 text-gray-600" />
    </Link>
  );
}