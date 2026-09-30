// PATH: app/checkout/CheckoutClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Caveat } from "next/font/google";
import {
  FaUser,
  FaMapMarkerAlt,
  FaWallet,
  FaLock,
  FaTruck,
  FaChevronRight,
  FaShieldAlt,
  FaBoxOpen,
  FaHeadset,
  FaCheck,
  FaRegHeart,
  FaRegEnvelope,
  FaWhatsapp,
  FaShoppingCart,
} from "react-icons/fa";
import { getCart, clearCart, type CartItem } from "@/app/lib/cart";

// Hand-lettered accent font for "Thank you ♥" / "Good Things Ahead!" — scoped
// to this file only (doesn't touch the site-wide Poppins/Gilroy setup in
// app/layout.tsx).
const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"] });

type Step = "form" | "success";

const STATES = [
  "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Rajasthan", "Uttar Pradesh",
  "West Bengal", "Telangana", "Kerala", "Madhya Pradesh", "Punjab", "Haryana", "Bihar",
  "Andhra Pradesh", "Odisha", "Jharkhand", "Assam", "Chhattisgarh", "Uttarakhand",
  "Himachal Pradesh", "Goa", "Tripura", "Meghalaya", "Manipur", "Nagaland",
  "Arunachal Pradesh", "Mizoram", "Sikkim", "J&K", "Ladakh",
];

interface OrderResult {
  orderRef: string;
  productName: string;
  productSku?: string;
  productImage?: string;
  selectedSize?: string | null;
  selectedColor?: string | null;
  quantity: number;
  pricePerUnit?: number;
  grandTotal: number;
}

const CONFETTI_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6"];

interface ConfettiPiece {
  id: number;
  left: number;
  dx: number;
  duration: number;
  delay: number;
  color: string;
}

interface BurstPiece {
  id: number;
  bx: number;
  by: number;
  color: string;
}

function formatOrderDate(d: Date): string {
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

export default function CheckoutClient() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMode, setPaymentMode] = useState<"prepaid" | "cod">("prepaid");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // No separate billing-address form exists anywhere in this checkout —
  // delivery address IS the only address collected. This checkbox is kept
  // checked and disabled rather than wired to fake "different billing
  // address" fields that don't exist yet.
  const sameAsBilling = true;

  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [orderResults, setOrderResults] = useState<OrderResult[]>([]);
  const [confirmedCodDue, setConfirmedCodDue] = useState(0);
  const [cartGroupRef, setCartGroupRef] = useState<string | null>(null);
  const [orderPlacedAt, setOrderPlacedAt] = useState<Date | null>(null);

  // Confetti-rain + a burst radiating from the checkmark, fired once when
  // the success screen appears — mirrors the reference demo's effect.
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [burstPieces, setBurstPieces] = useState<BurstPiece[]>([]);
  const [burstOrigin, setBurstOrigin] = useState<{ x: number; y: number } | null>(null);
  const checkmarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step !== "success") return;

    const fallPieces: ConfettiPiece[] = Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      dx: (Math.random() - 0.5) * 260,
      duration: 2.2 + Math.random() * 1.3,
      delay: Math.random() * 0.45,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    }));
    setConfetti(fallPieces);
    const clearFallTimer = setTimeout(() => setConfetti([]), 4200);

    const burstTimer = setTimeout(() => {
      const rect = checkmarkRef.current?.getBoundingClientRect();
      setBurstOrigin(
        rect
          ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
          : { x: window.innerWidth / 2, y: 220 }
      );
      const pieces: BurstPiece[] = Array.from({ length: 55 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 100 + Math.random() * 180;
        return {
          id: i,
          bx: Math.cos(angle) * radius,
          by: Math.sin(angle) * radius,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        };
      });
      setBurstPieces(pieces);
      setTimeout(() => setBurstPieces([]), 1000);
    }, 250);

    return () => {
      clearTimeout(clearFallTimer);
      clearTimeout(burstTimer);
    };
  }, [step]);

  // The page was scrolled deep into the form (address/payment fields) when
  // the order confirms — without this, the success screen renders off
  // screen below the current scroll position instead of from the top.
  useEffect(() => {
    if (step === "success") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [step]);

  useEffect(() => {
    setCart(getCart());
    setLoaded(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
  const estimatedGst = Math.round(subtotal * 0.05);
  const estimatedOriginalTotal = subtotal + estimatedGst;
  const estimatedDisplayTotal =
    paymentMode === "cod" ? estimatedOriginalTotal : Math.round(estimatedOriginalTotal * 0.95);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const stepIndex = step === "success" ? 2 : submitting ? 1 : 0;

  function handleApplyCoupon() {
    if (!coupon.trim()) return;
    // No coupon system is wired up yet — say so honestly rather than
    // pretending to apply a discount that never actually gets validated
    // server-side.
    setCouponMessage("Coupon codes aren't available yet — check back soon.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (cart.length === 0) return;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!agreedToTerms) {
      setError("Please agree to the Terms & Conditions and Privacy Policy to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const createRes = await fetch("/api/create-cart-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productSlug: item.productSlug,
            quantity: item.quantity,
            selectedSize: item.size,
            selectedColor: item.color,
            sizeBreakdown: item.sizeBreakdown,
            deliveryType: item.deliveryType,
            // Carries logo design / embroidery / DTF data through to the
            // server exactly as captured at "Add to Cart" time — the
            // server re-validates and re-prices all of it, never trusting
            // these values directly (see create-cart-order/route.ts).
            customization: item.customization,
          })),
          paymentMode,
          customer: { name, phone, email, gstNumber: gstNumber.trim() || undefined },
          address: { line1, line2, city, state, pincode },
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });
      const order = await createRes.json();
      if (!createRes.ok || !order?.id) {
        throw new Error(order?.error ?? "Could not create your order. Please try again.");
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "CluesStyle",
        description:
          order.paymentMode === "cod"
            ? `${cart.length} item${cart.length > 1 ? "s" : ""} — COD confirmation charge`
            : `${cart.length} item${cart.length > 1 ? "s" : ""}`,
        order_id: order.id,
        prefill: { name, contact: phone, email },
        notes: { address: `${line1}, ${city}, ${state} - ${pincode}` },
        theme: { color: "#111827" },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/verify-cart-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json().catch(() => ({} as any));

            if (!verifyRes.ok || !verifyData?.success) {
              setError(
                verifyData?.error ??
                  `We couldn't confirm your payment. If money was deducted, it will be refunded within 5–7 business days. Reference payment ID: ${response.razorpay_payment_id}`
              );
              setSubmitting(false);
              return;
            }

            clearCart();
            setOrderResults(verifyData.orders ?? order.items ?? []);
            setConfirmedCodDue(order.codDueAmount ?? 0);
            setCartGroupRef(verifyData.cartGroupRef ?? null);
            setOrderPlacedAt(new Date());
            setStep("success");
          } catch {
            setError(
              `We couldn't confirm your payment due to a network error. If money was deducted, it will be refunded within 5–7 business days. Reference payment ID: ${response.razorpay_payment_id}`
            );
            setSubmitting(false);
          }
        },
        modal: { ondismiss: () => setSubmitting(false) },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (loaded && cart.length === 0 && step === "form") {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-5 py-14 sm:py-20 text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-3">Your cart is empty</h1>
        <p className="text-sm sm:text-base text-gray-500 mb-6">Add some products before checking out.</p>
        <Link href="/products" className="inline-flex px-6 py-3 rounded-lg bg-black text-white text-sm sm:text-base">
          Continue Shopping
        </Link>
      </main>
    );
  }

  if (step === "success") {
    const orderNumberDisplay = cartGroupRef ?? orderResults[0]?.orderRef ?? "";
    const dateDisplay = formatOrderDate(orderPlacedAt ?? new Date());

    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-5 py-10 sm:py-16">
        <style>{`
          @keyframes csPop { 0% { opacity: 0; transform: scale(.3); } 70% { transform: scale(1.12); } 100% { opacity: 1; transform: scale(1); } }
          @keyframes csFall { to { transform: translate3d(var(--dx), 110vh, 0) rotate(720deg); opacity: 0; } }
          @keyframes csBurst { to { transform: translate(var(--bx), var(--by)) rotate(500deg); opacity: 0; } }
        `}</style>

        {/* ── Confetti rain — fixed to the viewport, same as the reference ── */}
        {confetti.map((c) => (
          <i
            key={c.id}
            aria-hidden
            style={{
              position: "fixed",
              top: "-20px",
              left: `${c.left}%`,
              width: 9,
              height: 15,
              background: c.color,
              zIndex: 50,
              pointerEvents: "none",
              animationName: "csFall",
              animationTimingFunction: "linear",
              animationFillMode: "forwards",
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
              ["--dx" as any]: `${c.dx}px`,
            }}
          />
        ))}

        {/* ── Burst radiating from the checkmark ── */}
        {burstOrigin &&
          burstPieces.map((b) => (
            <i
              key={b.id}
              aria-hidden
              style={{
                position: "fixed",
                top: burstOrigin.y,
                left: burstOrigin.x,
                width: 8,
                height: 8,
                borderRadius: 2,
                background: b.color,
                zIndex: 50,
                pointerEvents: "none",
                animationName: "csBurst",
                animationDuration: "900ms",
                animationTimingFunction: "ease-out",
                animationFillMode: "forwards",
                ["--bx" as any]: `${b.bx}px`,
                ["--by" as any]: `${b.by}px`,
              }}
            />
          ))}

        <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 sm:p-10 shadow-sm">
          {/* ── Decorative confetti + soft corner blobs — purely cosmetic ── */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-green-50 blur-2xl" />
            <div className="absolute -bottom-20 -right-10 w-56 h-56 rounded-full bg-gray-50 blur-2xl" />
            {[
              { top: "6%", left: "4%", color: "bg-purple-300", rotate: "rotate-12" },
              { top: "16%", left: "12%", color: "bg-blue-300", rotate: "-rotate-6" },
              { top: "4%", left: "22%", color: "bg-pink-300", rotate: "rotate-45" },
              { top: "10%", right: "6%", color: "bg-yellow-300", rotate: "rotate-12" },
              { top: "22%", right: "14%", color: "bg-blue-300", rotate: "-rotate-12" },
              { top: "3%", right: "22%", color: "bg-pink-300", rotate: "rotate-6" },
              { top: "30%", left: "2%", color: "bg-yellow-300", rotate: "rotate-3" },
              { top: "34%", right: "3%", color: "bg-purple-300", rotate: "-rotate-6" },
            ].map((c, i) => (
              <span
                key={i}
                className={`hidden sm:block absolute w-2 h-2 rounded-sm opacity-70 ${c.color} ${c.rotate}`}
                style={{ top: c.top, left: (c as any).left, right: (c as any).right }}
              />
            ))}
          </div>

          <div className="relative">
            {/* ── Top row: Thank you / success / Good Things Ahead ── */}
            <div className="grid md:grid-cols-3 items-center gap-5 md:gap-4">
              <div className="order-2 md:order-1 text-center md:text-left">
                <p className={`${caveat.className} text-3xl sm:text-4xl leading-none flex items-center justify-center md:justify-start gap-2`}>
                  Thank you <FaRegHeart className="w-4 h-4 sm:w-5 sm:h-5" />
                </p>
                <p className="mt-1 text-[10px] sm:text-[11px] font-bold tracking-widest text-gray-800">
                  FOR SHOPPING WITH US!
                </p>
              </div>

              <div className="order-1 md:order-2 text-center">
                <div
                  ref={checkmarkRef}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-3"
                  style={{ animation: "csPop .55s ease-out" }}
                >
                  <FaCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h1 className="text-lg sm:text-2xl font-bold">
                  Order placed <span className="text-green-600">successfully!</span>
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-1.5 max-w-xs mx-auto">
                  {orderResults.length > 1
                    ? `Your ${orderResults.length} orders have been confirmed. You'll receive an invoice on your email and a WhatsApp update shortly.`
                    : "Your order has been confirmed. You'll receive an invoice on your email and a WhatsApp update shortly."}
                </p>
              </div>

              <div className="order-3 text-center hidden md:block">
                <p className={`${caveat.className} text-2xl leading-tight -rotate-3`}>
                  Good Things
                  <br />
                  Ahead!
                </p>
                <div className="mt-3 w-11 h-11 mx-auto rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                  <FaBoxOpen className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-gray-500 mt-2 max-w-[9rem] mx-auto">
                  We&apos;re preparing your order with care.
                </p>
              </div>
            </div>

            {/* ── Invoice / WhatsApp pills ── */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-7">
              <span className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-100 text-green-700 text-[11px] sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2">
                <FaRegEnvelope className="w-3.5 h-3.5" />
                Invoice will be sent to your email
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-100 text-green-700 text-[11px] sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2">
                <FaWhatsapp className="w-4 h-4" />
                Order updates on WhatsApp
              </span>
            </div>

            {/* ── Order item card(s) ── */}
            <div className="mt-6 sm:mt-7 border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
              {orderResults.map((o) => (
                <div key={o.orderRef} className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden bg-white">
                    {o.productImage ? (
                      <Image src={o.productImage} alt={o.productName} fill className="object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <FaBoxOpen className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs sm:text-sm truncate">{o.productName}</p>
                    {o.productSku && (
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">SKU: {o.productSku}</p>
                    )}
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                      {[
                        o.selectedSize ? `Size: ${o.selectedSize}` : null,
                        o.selectedColor ? `Color: ${o.selectedColor}` : null,
                        `Qty: ${o.quantity}`,
                      ]
                        .filter(Boolean)
                        .join("  |  ")}
                    </p>
                  </div>
                  <p className="font-semibold text-xs sm:text-sm shrink-0">
                    ₹{Number(o.grandTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>

            {confirmedCodDue > 0 && (
              <p className="mt-4 text-xs sm:text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-center">
                ₹{confirmedCodDue} balance to be collected on delivery.
              </p>
            )}

            <p className="text-center text-[11px] sm:text-xs text-gray-500 mt-4 px-2">
              Order Number: {orderNumberDisplay} &nbsp;|&nbsp; Order Date: {dateDisplay}
            </p>

            {/* ── Actions ── */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 sm:mt-7">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-50"
              >
                Continue Shopping <FaShoppingCart className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/track-order"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-900"
              >
                Track Your Order <FaTruck className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* ── Trust badges ── */}
            <div className="mt-7 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-3">
              {[
                { icon: FaShieldAlt, title: "Secure Payments", sub: "100% safe & encrypted" },
                { icon: FaTruck, title: "Fast Delivery", sub: "Pan India shipping" },
                { icon: FaBoxOpen, title: "Easy Returns", sub: "15 days return policy" },
                { icon: FaHeadset, title: "Dedicated Support", sub: "We're here to help" },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex flex-col items-center text-center gap-1.5">
                  <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                  <p className="text-[11px] sm:text-xs font-semibold text-gray-900">{title}</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-500">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const stepLabels = ["Information", "Payment", "Order Placed"];

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-5 py-6 sm:py-10">
      {/* ── Full-screen blocking overlay while the order is being placed/
          confirmed — covers the whole "submitting" span, so it's already up
          before Razorpay's own modal opens and stays up (Razorpay's modal
          has a far higher z-index than this, so it still shows on top of
          this) through the payment-verification call afterward, until the
          order either succeeds or errors out. Blocks all clicks on the
          underlying page via `fixed inset-0`, not just the submit button. ── */}
      {submitting && (
        <div className="fixed inset-0 z-40 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin" />
          <div>
            <p className="text-base font-semibold text-gray-900">Confirming your order…</p>
            <p className="text-sm text-gray-500 mt-1">Please don&apos;t close or refresh this page.</p>
          </div>
        </div>
      )}

      {/* ── Header: title + subtitle on the left, 3-step stepper on the right ──
          Stepper is wrapped in a horizontally-scrollable strip on narrow
          screens instead of wrapping/shrinking the step labels, so nothing
          overlaps or gets clipped on very small phones. ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-5 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">Complete your details and place your order.</p>
        </div>

        <div className="w-full md:w-auto overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex items-center w-max md:w-auto">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      i <= stepIndex ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {i < stepIndex ? <FaCheck className="w-2.5 h-2.5" /> : i + 1}
                  </span>
                  <span
                    className={`text-xs sm:text-sm whitespace-nowrap ${
                      i === stepIndex ? "font-semibold text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <span className={`w-6 sm:w-12 h-px mx-2 ${i < stepIndex ? "bg-black" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* ── Contact Details ── */}
          <div className="border border-gray-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-4 sm:mb-5">
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                <FaUser className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <div>
                <h2 className="font-semibold text-sm sm:text-base">Contact Details</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  We&apos;ll use this information to keep you updated about your order.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    type="text" required placeholder="Enter your full name" value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone Number *</label>
                  <input
                    type="tel" required placeholder="Enter your phone number" value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address *</label>
                  <input
                    type="email" required placeholder="Enter your email address" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">GST Number (optional)</label>
                  <input
                    type="text" placeholder="e.g. 22AAAAA0000A1Z5" value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    maxLength={15}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Delivery Address ── */}
          <div className="border border-gray-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-4 sm:mb-5">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                  <FaMapMarkerAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
                <div>
                  <h2 className="font-semibold text-sm sm:text-base">Delivery Address</h2>
                  <p className="text-xs text-gray-500 mt-0.5">This is where we&apos;ll deliver your order.</p>
                </div>
              </div>
              <label className="hidden sm:flex items-center gap-2 text-xs text-gray-500 shrink-0 pt-1">
                <input type="checkbox" checked={sameAsBilling} disabled className="rounded accent-black" />
                Same as billing address
              </label>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Address Line 1 *</label>
                <input
                  type="text" required placeholder="House / Flat / Building / Company name" value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Address Line 2 (optional)</label>
                <input
                  type="text" placeholder="Area, Street, Landmark (optional)" value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">City *</label>
                  <input
                    type="text" required placeholder="Enter your city" value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">State *</label>
                  <select
                    required value={state} onChange={(e) => setState(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-800"
                  >
                    <option value="">Select state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Pincode *</label>
                  <input
                    type="text" required placeholder="Enter pincode" value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Payment Method ── */}
          <div className="border border-gray-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-start gap-3 mb-4 sm:mb-5">
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                <FaWallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <div>
                <h2 className="font-semibold text-sm sm:text-base">Payment Method</h2>
                <p className="text-xs text-gray-500 mt-0.5">Choose how you want to pay.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {/* Pay Now = blue "link card" style, Cash on Delivery = green,
                  matching the Same Day Delivery banner's accent-card look
                  but color-coded per payment method. Subtext shrunk to
                  text-[11px] so it reads clearly secondary to the title. */}
              <button
                type="button"
                onClick={() => setPaymentMode("prepaid")}
                className={`text-left border rounded-xl p-3.5 sm:p-4 transition-colors ${
                  paymentMode === "prepaid" ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        paymentMode === "prepaid" ? "border-blue-600" : "border-gray-300"
                      }`}
                    >
                      {paymentMode === "prepaid" && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                    </span>
                    <div>
                      <p className={`font-semibold text-sm ${paymentMode === "prepaid" ? "text-blue-900" : "text-gray-900"}`}>Pay Now</p>
                      <span className="text-[11px] text-gray-500 mt-0.5">Pay securely online</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex gap-1 shrink-0 pt-0.5">
                    {["VISA", "MC", "RuPay", "UPI"].map((b) => (
                      <span
                        key={b}
                        className={`text-[9px] font-semibold rounded px-1 py-0.5 bg-white ${
                          paymentMode === "prepaid" ? "text-blue-600 border border-blue-200" : "text-gray-500 border border-gray-200"
                        }`}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode("cod")}
                className={`text-left border rounded-xl p-3.5 sm:p-4 transition-colors ${
                  paymentMode === "cod" ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        paymentMode === "cod" ? "border-green-600" : "border-gray-300"
                      }`}
                    >
                      {paymentMode === "cod" && <span className="w-2 h-2 rounded-full bg-green-600" />}
                    </span>
                    <div>
                      <p className={`font-semibold text-sm ${paymentMode === "cod" ? "text-green-900" : "text-gray-900"}`}>Cash on Delivery</p>
                      <span className="text-[11px] text-gray-500 mt-0.5">Pay 5% now to confirm, rest on delivery.</span>
                    </div>
                  </div>
                  <span className="hidden sm:flex text-lg shrink-0">💵</span>
                </div>
              </button>
            </div>
          </div>

          <label className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-600">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 rounded accent-black shrink-0"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms-and-condition" className="underline text-gray-900 hover:text-black">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="underline text-gray-900 hover:text-black">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || cart.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-black text-white text-sm sm:text-base font-semibold disabled:opacity-50 hover:bg-gray-900 transition-colors"
          >
            <FaLock className="w-3.5 h-3.5" />
            {submitting ? "Processing…" : `Pay ₹${estimatedDisplayTotal} & Place Order`}
          </button>
        </form>

        {/* ── Sidebar ── */}
        <aside className="space-y-4 sm:space-y-5 h-fit lg:sticky lg:top-28">
          <div className="border border-gray-200 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm sm:text-base">Order Summary</h2>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 rounded-full px-2.5 py-1">
                {itemCount} Item{itemCount !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}-${item.deliveryType}`}
                  className="flex gap-3"
                >
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-lg overflow-hidden bg-white">
                    <Image src={item.productImage} alt={item.productName} fill className="object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">{item.productName}</p>
                    <span className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                      {[
                        item.size ? `Size: ${item.size}` : null,
                        item.color ? `Color: ${item.color}` : null,
                        `Qty: ${item.quantity}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium shrink-0">₹{item.lineTotal}</p>
                </div>
              ))}
            </div>

            <hr />

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>GST (5%)</span>
                <span>₹{estimatedGst}</span>
              </div>
              {paymentMode === "prepaid" && (
                <div className="flex justify-between text-green-600">
                  <span>Discount (5%)</span>
                  <span>−₹{estimatedOriginalTotal - estimatedDisplayTotal}</span>
                </div>
              )}
            </div>

            <hr />

            <div className="flex justify-between text-base sm:text-lg font-bold">
              <span>Total</span>
              <span className="text-[#008000]">₹{estimatedDisplayTotal}</span>
            </div>
            {paymentMode === "cod" && (
              <p className="text-xs text-gray-400 -mt-2">
                Pay ₹{Math.round(estimatedOriginalTotal * 0.05)} now, ₹
                {estimatedOriginalTotal - Math.round(estimatedOriginalTotal * 0.05)} due on delivery.
              </p>
            )}
          </div>

          {/* ── Coupon ── */}
          <div className="border border-gray-200 rounded-2xl p-4 sm:p-5">
            <p className="text-sm font-semibold mb-1.5">Have a coupon code?</p>
            <div className="flex items-center gap-2">
              <input
                value={coupon}
                onChange={(e) => { setCoupon(e.target.value); setCouponMessage(null); }}
                placeholder="Enter coupon code"
                className="flex-1 min-w-0 px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 sm:px-5 py-2.5 rounded-lg bg-black text-white text-sm font-medium shrink-0 hover:bg-gray-900"
              >
                Apply
              </button>
            </div>
            {couponMessage && <p className="mt-2 text-xs text-gray-500">{couponMessage}</p>}
          </div>

          {/* ── Same Day Delivery banner ── */}
          <Link
            href="/same-day-delivery"
            className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 sm:px-5 py-3.5 sm:py-4 hover:bg-blue-100/60 transition-colors"
          >
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <FaTruck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-900">Same Day Delivery</p>
              <p className="text-[11px] sm:text-xs text-gray-500">Available in selected areas (Mumbai)</p>
            </div>
            <FaChevronRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          </Link>

          {/* ── Trust badges ── */}
          <div className="border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <FaShieldAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900">Secure Payments</p>
                <p className="text-[11px] sm:text-xs text-gray-500">100% safe and encrypted</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <FaBoxOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900">Easy Returns</p>
                <p className="text-[11px] sm:text-xs text-gray-500">15 days return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <FaTruck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900">Fast Delivery</p>
                <p className="text-[11px] sm:text-xs text-gray-500">Pan India delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                <FaHeadset className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900">Dedicated Support</p>
                <p className="text-[11px] sm:text-xs text-gray-500">We&apos;re here to help</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}