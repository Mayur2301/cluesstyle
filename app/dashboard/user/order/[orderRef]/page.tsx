'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './orderdetail.module.css';

type PaymentStatus = 'paid' | 'pending' | 'failed';
type OrderStatus   = 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderDetail {
  id: number;
  order_ref: string;
  product_name: string;
  product_slug: string;
  product_url: string;
  selected_size: string | null;
  selected_color: string | null;
  quantity: number;
  delivery_type: string;
  price_per_unit: number;
  same_day_charge: number;
  grand_total: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  address_line1: string;
  address_line2: string | null;
  address_city: string;
  address_state: string;
  address_pincode: string;
  created_at: string;
  updated_at: string;
}

const STEPS = ['Ordered', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
const STEP_ICONS = ['ti-shopping-cart', 'ti-check', 'ti-shirt', 'ti-truck', 'ti-home'];

const ORDER_STEP: Record<string, number> = {
  processing: 2,
  shipped:    3,
  delivered:  4,
  cancelled:  0,
};

const cap = (s: string | null | undefined) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';

export default function OrderDetailPage() {
  const router   = useRouter();
  const params = useParams();

const rawOrderRef = params?.orderRef;

const orderRef = Array.isArray(rawOrderRef)
  ? rawOrderRef[0]
  : rawOrderRef;

console.log('PARAMS:', params);
console.log('ORDER REF:', orderRef);

  const [order,   setOrder]   = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/account'); return; }
    if (!orderRef) { setError('Invalid order reference.'); setLoading(false); return; }
    fetchOrder(token);
  }, [orderRef]);

  const fetchOrder = async (token: string) => {
    try {
      const res = await fetch(
  `/api/user/orders/${encodeURIComponent(orderRef || '')}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
      if (res.status === 404) { setError('Order not found.'); return; }
      if (!res.ok)            { setError('Failed to load order.'); return; }
      const data = await res.json();
      setOrder(data.order);
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.center}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.center}>
        <div className={styles.errorBox}>
          <i className="ti ti-alert-circle" style={{ fontSize: 32, color: '#A32D2D' }} aria-hidden="true" />
          <p>{error || 'Order not found.'}</p>
          <button className={styles.backBtn} onClick={() => router.push('/dashboard/user')}>
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const step = ORDER_STEP[order.order_status ?? 'processing'] ?? 0;
  const pct  = step === 0 ? 0 : Math.round((step / (STEPS.length - 1)) * 100);
  const isCancelled = (order.order_status ?? '') === 'cancelled';

  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const time = new Date(order.created_at).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });

  const subtotal  = Number(order.price_per_unit) * Number(order.quantity);
  const sameDay   = Number(order.same_day_charge);
  const total     = Number(order.grand_total);

  return (
    <div className={styles.page}>
<br/>
      {/* ── Back + header ── */}
      <div className={styles.topbar}>
        
        <div className={styles.orderRefRow}>
          <span className={styles.orderRefLabel}>Order</span>
          <span className={styles.orderRef}>{order.order_ref}</span>
          <span className={`${styles.badge} ${styles[`status_${order.order_status ?? 'processing'}`]}`}>
            {cap(order.order_status)}
          </span>
          <span className={`${styles.badge} ${styles[`pay_${order.payment_status ?? 'pending'}`]}`}>
            {cap(order.payment_status)}
          </span>
        </div>
        <p className={styles.dateLine}>
          <i className="ti ti-calendar" style={{ fontSize: 13, verticalAlign: -1, marginRight: 4 }} aria-hidden="true" />
          {date} at {time}
        </p>
      </div>

      <div className={styles.grid}>

        {/* ── LEFT column ── */}
        <div className={styles.left}>

          {/* Order tracker */}
          {!isCancelled && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <i className="ti ti-map-pin" aria-hidden="true" /> Order tracking
              </h3>
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
                        <i className={`ti ${done ? 'ti-check' : STEP_ICONS[i]}`} style={{ fontSize: 12 }} aria-hidden="true" />
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

          {/* Product details */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <i className="ti ti-shirt" aria-hidden="true" /> Product
            </h3>
            <div className={styles.productRow}>
              <div className={styles.productThumb}>
                <i className="ti ti-shirt" style={{ fontSize: 28, color: '#7F77DD' }} aria-hidden="true" />
              </div>
              <div className={styles.productInfo}>
                <p className={styles.productName}>{order.product_name}</p>
                <div className={styles.productMeta}>
                  {order.selected_size  && <span>Size: <strong>{order.selected_size}</strong></span>}
                  {order.selected_color && <span>Color: <strong>{order.selected_color}</strong></span>}
                  <span>Qty: <strong>{order.quantity}</strong></span>
                  {order.delivery_type === 'same-day' && (
                    <span className={styles.sameDayTag}>Same-day delivery</span>
                  )}
                </div>
                {order.product_slug && (
                  <a
                    href={`/products/${order.product_slug}`}
                    className={styles.productLink}
                    target="_blank" rel="noreferrer"
                  >
                    View product <i className="ti ti-external-link" style={{ fontSize: 12 }} aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Price breakdown */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <i className="ti ti-receipt" aria-hidden="true" /> Price breakdown
            </h3>
            <table className={styles.priceTable}>
              <tbody>
                <tr>
                  <td>Price per unit</td>
                  <td>₹{Number(order.price_per_unit).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>Quantity</td>
                  <td>× {order.quantity}</td>
                </tr>
                <tr>
                  <td>Subtotal</td>
                  <td>₹{subtotal.toLocaleString('en-IN')}</td>
                </tr>
                {sameDay > 0 && (
                  <tr>
                    <td>Same-day charge</td>
                    <td>₹{sameDay.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr className={styles.totalRow}>
                  <td>Total</td>
                  <td>₹{total.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        {/* ── RIGHT column ── */}
        <div className={styles.right}>

          {/* Delivery address */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <i className="ti ti-map-pin" aria-hidden="true" /> Delivery address
            </h3>
            <p className={styles.addrName}>{order.customer_name}</p>
            <p className={styles.addrLine}>{order.address_line1}</p>
            {order.address_line2 && <p className={styles.addrLine}>{order.address_line2}</p>}
            <p className={styles.addrLine}>
              {order.address_city}, {order.address_state} — {order.address_pincode}
            </p>
            <div className={styles.addrContact}>
              <i className="ti ti-phone" style={{ fontSize: 13 }} aria-hidden="true" />
              {order.customer_phone}
            </div>
            <div className={styles.addrContact}>
              <i className="ti ti-mail" style={{ fontSize: 13 }} aria-hidden="true" />
              {order.customer_email}
            </div>
          </div>

          {/* Payment info */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <i className="ti ti-credit-card" aria-hidden="true" /> Payment info
            </h3>
            <div className={styles.payRow}>
              <span>Status</span>
              <span className={`${styles.badge} ${styles[`pay_${order.payment_status ?? 'pending'}`]}`}>
                {cap(order.payment_status)}
              </span>
            </div>
            {order.razorpay_payment_id && (
              <div className={styles.payRow}>
                <span>Payment ID</span>
                <span className={styles.mono}>{order.razorpay_payment_id}</span>
              </div>
            )}
            {order.razorpay_order_id && (
              <div className={styles.payRow}>
                <span>Razorpay order</span>
                <span className={styles.mono}>{order.razorpay_order_id}</span>
              </div>
            )}
          </div>

          {/* Need help */}
          <div className={styles.helpCard}>
            <i className="ti ti-headset" style={{ fontSize: 22, color: '#7F77DD' }} aria-hidden="true" />
            <div>
              <p className={styles.helpTitle}>Need help with this order?</p>
              <p className={styles.helpSub}>Contact our support team and quote your order ID.</p>
            </div>
            <a href={`/contact?order=${order.order_ref}`} className={styles.helpBtn}>
              Contact support
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}