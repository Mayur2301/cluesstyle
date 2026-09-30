'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import styles from './Dashboard.module.css';
import { JSX } from 'react/jsx-dev-runtime';

type PaymentStatus = 'paid' | 'pending' | 'failed';
type OrderStatus   = 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: number;
  order_ref: string;
  product_name: string;
  product_slug: string;
  selected_size: string | null;
  selected_color: string | null;
  quantity: number;
  delivery_type: string;
  price_per_unit: number;
  same_day_charge: number;
  grand_total: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  razorpay_payment_id: string;
  created_at: string;
}

const STEPS = ['Ordered', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

const cap = (s: string | null | undefined) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';

const ORDER_STEP: Record<OrderStatus, number> = {
  processing: 2,
  shipped:    3,
  delivered:  4,
  cancelled:  0,
};

const STATUS_FILTER = ['all', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
type Filter = typeof STATUS_FILTER[number];

const PAGE_SIZE = 10;

type Tab = 'dashboard' | 'orders' | 'history' | 'track';

/* ───────────────────────── Icons ───────────────────────── */

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function IconBox() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
      <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M3 7.5 12 12l9-4.5M12 12v9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m21 21-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
      <path d="M15 17v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 12h12m0 0-3.5-3.5M21 12l-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_ITEMS: { key: Tab; label: string; icon: () => JSX.Element }[] = [
  { key: 'dashboard', label: 'Dashboard',          icon: IconGrid },
  { key: 'orders',    label: 'Orders',              icon: IconBox },
  { key: 'history',   label: 'History',              icon: IconClock },
  { key: 'track',     label: 'Check Order Status',   icon: IconSearch },
];

/* ─────────────────────── Pagination ─────────────────────── */

function Pagination({
  page, totalPages, onChange,
}: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages = useMemo(() => {
    const out: (number | 'dots')[] = [];
    const add = (n: number) => out.push(n);
    add(1);
    if (page > 3) out.push('dots');
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) add(p);
    if (page < totalPages - 2) out.push('dots');
    if (totalPages > 1) add(totalPages);
    return out;
  }, [page, totalPages]);

  return (
    <div className={styles.pagination}>
      <button
        className={styles.pageBtn}
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === 'dots' ? (
          <span key={`d${i}`} className={styles.pageDots}>···</span>
        ) : (
          <button
            key={p}
            className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button
        className={styles.pageBtn}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
}

/* ──────────────────────── Order card ─────────────────────── */

function OrderCard({
  order, isTrackerOpen, onToggleTracker, onViewDetails, forceTrackerOpen,
}: {
  order: Order;
  isTrackerOpen: boolean;
  onToggleTracker: (ref: string) => void;
  onViewDetails: (ref: string) => void;
  forceTrackerOpen?: boolean;
}) {
  const step = ORDER_STEP[order.order_status ?? 'processing'] ?? 0;
  const pct  = step === 0 ? 0 : Math.round((step / (STEPS.length - 1)) * 100);
  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const open = forceTrackerOpen || isTrackerOpen;

  return (
    <div className={styles.orderCard}>
      <div className={styles.orderTop}>
        <div className={styles.orderInfo}>
          <div className={styles.orderId}>{order.order_ref}</div>
          <div className={styles.orderDate}>{date}</div>
          <div className={styles.productName}>{order.product_name}</div>
          <div className={styles.orderMeta}>
            {order.selected_size  && <span>Size: {order.selected_size}</span>}
            {order.selected_color && <><span className={styles.dot}>·</span><span>Color: {order.selected_color}</span></>}
            <span className={styles.dot}>·</span>
            <span>Qty: {order.quantity}</span>
            {order.delivery_type === 'same-day' && (
              <><span className={styles.dot}>·</span><span className={styles.sameDay}>Same-day</span></>
            )}
          </div>
        </div>
        <div className={styles.badges}>
          <span className={`${styles.badge} ${order.payment_status ? styles[`pay_${order.payment_status}`] : ''}`}>
            {cap(order.payment_status)}
          </span>
          <span className={`${styles.badge} ${order.order_status ? styles[`status_${order.order_status}`] : ''}`}>
            {cap(order.order_status)}
          </span>
        </div>
      </div>

      <div className={styles.orderFooter}>
        <span className={styles.orderTotal}>
          ₹{Number(order.grand_total).toLocaleString('en-IN')}
        </span>
        <div className={styles.footerActions}>
          {(order.order_status ?? 'processing') !== 'cancelled' && !forceTrackerOpen && (
            <button className={styles.actionBtn} onClick={() => onToggleTracker(order.order_ref)}>
              {open ? 'Hide tracker' : 'Track order'}
            </button>
          )}
          <button className={styles.actionBtn} onClick={() => onViewDetails(order.order_ref)}>
            View details
          </button>
        </div>
      </div>

      {open && (order.order_status ?? 'processing') !== 'cancelled' && (
        <div className={styles.tracker}>
          <div className={styles.trackerTrack}>
            <div className={styles.trackerFill} style={{ width: `${pct}%` }} />
          </div>
          <div className={styles.trackerSteps}>
            {STEPS.map((label, i) => {
              const done   = i < step;
              const active = i === step;
              return (
                <div key={label} className={styles.tStep}>
                  <div className={`${styles.tDot} ${done ? styles.tDone : ''} ${active ? styles.tActive : ''}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <div className={`${styles.tLabel} ${(done || active) ? styles.tLabelActive : ''}`}>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Main ────────────────────────── */

export default function UserDashboard() {
  const router = useRouter();

  const [user,          setUser]          = useState<any>(null);
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [filter,    setFilter]    = useState<Filter>('all');
  const [openTracker, setOpenTracker] = useState<string | null>(null);

  const [ordersPage,  setOrdersPage]  = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const [trackQuery,  setTrackQuery]  = useState('');
  const [trackResult, setTrackResult] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    try {
      const token    = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (!token) { router.push('/account'); return; }
      if (userData) {
        try { setUser(JSON.parse(userData)); }
        catch { setUser({ name: 'User', email: '' }); }
      }
    } catch { setUser({ name: 'User', email: '' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user]);

  useEffect(() => { setOrdersPage(1); }, [filter]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch('/api/user/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('user');
    } catch {}
    router.push('/account');
  };

  const toggleTracker = (ref: string) => {
    setOpenTracker(prev => (prev === ref ? null : ref));
  };

  const goToDetails = (ref: string) => router.push(`/dashboard/user/order/${ref}`);

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = trackQuery.trim().toLowerCase();
    if (!q) { setTrackResult(undefined); return; }
    const found = orders.find(o => o.order_ref.toLowerCase() === q)
      ?? orders.find(o => o.order_ref.toLowerCase().includes(q));
    setTrackResult(found ?? null);
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  const totalSpent     = orders.filter(o => o.payment_status === 'paid')
                                .reduce((s, o) => s + Number(o.grand_total), 0);
  const countDelivered = orders.filter(o => o.order_status === 'delivered').length;
  const countTransit   = orders.filter(o => o.order_status === 'shipped').length;

  const initials = user?.name
    ? user.name.trim().split(' ').slice(0, 2).map((w: string) => w[0].toUpperCase()).join('')
    : 'U';

  // Orders tab data
  const filteredOrders = filter === 'all' ? orders : orders.filter(o => (o.order_status ?? 'processing') === filter);
  const ordersTotalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const ordersPageItems = filteredOrders.slice((ordersPage - 1) * PAGE_SIZE, ordersPage * PAGE_SIZE);

  // History tab data
  const historyOrders = orders
    .filter(o => o.order_status === 'delivered' || o.order_status === 'cancelled')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const historyTotalPages = Math.max(1, Math.ceil(historyOrders.length / PAGE_SIZE));
  const historyPageItems = historyOrders.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE);

  // Dashboard tab data
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const tabTitle: Record<Tab, string> = {
    dashboard: 'Overview',
    orders: 'Your orders',
    history: 'Order history',
    track: 'Check order status',
  };

  return (
    <div className={styles.dash}>

      {/* ── Sidebar (desktop) ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <p className={styles.welcomeLabel}>Welcome back</p>
            <h2 className={styles.userName}>{user?.name || 'User'}</h2>
          </div>
        </div>

        <nav className={styles.sideNav}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`${styles.navItem} ${activeTab === item.key ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab(item.key)}
              >
                <span className={styles.navIcon}><Icon /></span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button className={`${styles.navItem} ${styles.navLogout}`} onClick={handleLogout}>
          <span className={styles.navIcon}><IconLogout /></span>
          <span>Logout</span>
        </button>
      </aside>

      {/* ── Main column ── */}
      <div className={styles.main}>

        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <div className={styles.avatar}>{initials}</div>
            <div>
              <p className={styles.welcomeLabel}>Welcome back</p>
              <h2 className={styles.userName}>{user?.name || 'User'}</h2>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Total orders</div>
            <div className={styles.statVal}>{orders.length}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Delivered</div>
            <div className={styles.statVal}>{countDelivered}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>In transit</div>
            <div className={styles.statVal}>{countTransit}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Total spent</div>
            <div className={styles.statVal}>₹{totalSpent.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className={styles.sectionHead}>
          <h3 className={styles.sectionTitle}>{tabTitle[activeTab]}</h3>
          {activeTab === 'orders' && (
            <div className={styles.filters}>
              {STATUS_FILTER.map(f => (
                <button
                  key={f}
                  className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Dashboard tab ── */}
        {activeTab === 'dashboard' && (
          ordersLoading ? (
            <div className={styles.ordersLoading}>Loading orders…</div>
          ) : recentOrders.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📦</span>
              <p>No orders found</p>
            </div>
          ) : (
            <>
              <div className={styles.orders}>
                {recentOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isTrackerOpen={openTracker === order.order_ref}
                    onToggleTracker={toggleTracker}
                    onViewDetails={goToDetails}
                  />
                ))}
              </div>
              {orders.length > 5 && (
                <button className={styles.viewAllBtn} onClick={() => setActiveTab('orders')}>
                  View all orders
                </button>
              )}
            </>
          )
        )}

        {/* ── Orders tab ── */}
        {activeTab === 'orders' && (
          ordersLoading ? (
            <div className={styles.ordersLoading}>Loading orders…</div>
          ) : ordersPageItems.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📦</span>
              <p>No orders found</p>
            </div>
          ) : (
            <>
              <div className={styles.orders}>
                {ordersPageItems.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isTrackerOpen={openTracker === order.order_ref}
                    onToggleTracker={toggleTracker}
                    onViewDetails={goToDetails}
                  />
                ))}
              </div>
              <Pagination page={ordersPage} totalPages={ordersTotalPages} onChange={setOrdersPage} />
            </>
          )
        )}

        {/* ── History tab ── */}
        {activeTab === 'history' && (
          ordersLoading ? (
            <div className={styles.ordersLoading}>Loading orders…</div>
          ) : historyPageItems.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🕓</span>
              <p>No past orders yet</p>
            </div>
          ) : (
            <>
              <div className={styles.orders}>
                {historyPageItems.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isTrackerOpen={openTracker === order.order_ref}
                    onToggleTracker={toggleTracker}
                    onViewDetails={goToDetails}
                  />
                ))}
              </div>
              <Pagination page={historyPage} totalPages={historyTotalPages} onChange={setHistoryPage} />
            </>
          )
        )}

        {/* ── Track tab ── */}
        {activeTab === 'track' && (
          <div className={styles.trackWrap}>
            <form className={styles.trackForm} onSubmit={handleTrackSearch}>
              <input
                className={styles.trackInput}
                placeholder="Enter your order ID, e.g. ORD10234"
                value={trackQuery}
                onChange={e => setTrackQuery(e.target.value)}
              />
              <button type="submit" className={styles.trackBtn}>Check status</button>
            </form>

            {trackResult === null && (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>🔍</span>
                <p>No order found matching that ID</p>
              </div>
            )}

            {trackResult && (
              <div className={styles.orders}>
                <OrderCard
                  order={trackResult}
                  isTrackerOpen
                  forceTrackerOpen
                  onToggleTracker={() => {}}
                  onViewDetails={goToDetails}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom nav (mobile) ── */}
      <nav className={styles.bottomNav}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className={`${styles.bottomNavItem} ${activeTab === item.key ? styles.bottomNavItemActive : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              <span className={styles.navIcon}><Icon /></span>
              <span className={styles.bottomNavLabel}>{item.label === 'Check Order Status' ? 'Track' : item.label}</span>
            </button>
          );
        })}
        <button className={styles.bottomNavItem} onClick={handleLogout}>
          <span className={styles.navIcon}><IconLogout /></span>
          <span className={styles.bottomNavLabel}>Logout</span>
        </button>
      </nav>
    </div>
  );
}