// app/dashboard/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './dashboard.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const type = localStorage.getItem('userType');
    
    if (!token) {
      router.push('/account');
    }
    
    if (userData) {
      setUser(JSON.parse(userData));
      setUserType(type || 'user');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    router.push('/account');
  };

  const menuItems = {
    user: [
      { icon: '🏠', label: 'Dashboard', href: '/dashboard/user' },
      { icon: '🛍️', label: 'My Orders', href: '/dashboard/user/orders' },
      { icon: '❤️', label: 'Wishlist', href: '/dashboard/user/wishlist' },
      { icon: '📍', label: 'Track Order', href: '/dashboard/user/track-order' },
      { icon: '⭐', label: 'Reviews', href: '/dashboard/user/reviews' },
      { icon: '👤', label: 'Profile', href: '/dashboard/user/profile' },
      { icon: '🔒', label: 'Change Password', href: '/dashboard/user/change-password' },
    ],
    reseller: [
      { icon: '🏠', label: 'Dashboard', href: '/dashboard/reseller' },
      { icon: '📦', label: 'Bulk Orders', href: '/dashboard/reseller/bulk-orders' },
      { icon: '📊', label: 'Inventory', href: '/dashboard/reseller/inventory' },
      { icon: '💰', label: 'Commissions', href: '/dashboard/reseller/commissions' },
      { icon: '📈', label: 'Sales Report', href: '/dashboard/reseller/sales' },
      { icon: '👥', label: 'Customers', href: '/dashboard/reseller/customers' },
      { icon: '👤', label: 'Profile', href: '/dashboard/reseller/profile' },
    ],
    club: [
      { icon: '🏠', label: 'Dashboard', href: '/dashboard/club' },
      { icon: '👥', label: 'Members', href: '/dashboard/club/members' },
      { icon: '🛒', label: 'Group Orders', href: '/dashboard/club/group-orders' },
      { icon: '🎉', label: 'Events', href: '/dashboard/club/events' },
      { icon: '💰', label: 'Club Funds', href: '/dashboard/club/funds' },
      { icon: '📊', label: 'Reports', href: '/dashboard/club/reports' },
      { icon: '👤', label: 'Profile', href: '/dashboard/club/profile' },
    ],
    sponsor: [
      { icon: '🏠', label: 'Dashboard', href: '/dashboard/sponsor' },
      { icon: '📢', label: 'Campaigns', href: '/dashboard/sponsor/campaigns' },
      { icon: '📊', label: 'Analytics', href: '/dashboard/sponsor/analytics' },
      { icon: '💰', label: 'Payments', href: '/dashboard/sponsor/payments' },
      { icon: '🎯', label: 'Promotions', href: '/dashboard/sponsor/promotions' },
      { icon: '👥', label: 'Influencers', href: '/dashboard/sponsor/influencers' },
      { icon: '👤', label: 'Profile', href: '/dashboard/sponsor/profile' },
    ],
  };

  return (
    <div className={styles.dashboard}>
      <button 
        className={styles.sidebarToggle}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>
      
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.logo}>
          <h2>CluesStyle</h2>
          <p>{userType.toUpperCase()}</p>
        </div>
        
        <nav className={styles.nav}>
          {menuItems[userType as keyof typeof menuItems]?.map((item, index) => (
            <Link key={index} href={item.href} className={styles.navItem}>
              <span className={styles.navIcon}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        
        <div className={styles.userInfo}>
          {sidebarOpen && (
            <>
              <div className={styles.avatar}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className={styles.userDetails}>
                <p className={styles.userName}>{user?.name}</p>
                <p className={styles.userEmail}>{user?.email}</p>
              </div>
            </>
          )}
          <button onClick={handleLogout} className={styles.logoutBtn}>
            {sidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </aside>
      
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}