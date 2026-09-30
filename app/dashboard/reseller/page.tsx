'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ResellerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token) {
        router.push('/account');
        return;
      }
      
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (err) {
      console.error('Error:', err);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    router.push('/account');
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Reseller Dashboard</h1>
      <p>Welcome, {user?.name || 'Reseller'}!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}