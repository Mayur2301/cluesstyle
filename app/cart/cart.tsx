"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTrashAlt,
  FaShieldAlt,
  FaBoxOpen,
  FaTruck,
  FaHeadset,
  FaMinus,
  FaPlus,
  FaInfoCircle,
} from "react-icons/fa";
import {
  getCart,
  removeFromCart,
  removeManyFromCart,
  updateQuantity,
  type CartItem,
} from "@/app/lib/cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const loadCart = () => setCart(getCart());

  useEffect(() => {
    loadCart();
    const handleUpdate = () => loadCart();
    window.addEventListener("cart-updated", handleUpdate);
    return () => window.removeEventListener("cart-updated", handleUpdate);
  }, []);

  // Drop any selection for items that no longer exist (removed elsewhere).
  useEffect(() => {
    setSelected((prev) => {
      const ids = new Set(cart.map((c) => c.addedAt));
      const next = new Set([...prev].filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [cart]);

  const allSelected = cart.length > 0 && selected.size === cart.length;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(cart.map((c) => c.addedAt)));
  };

  const toggleOne = (addedAt: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(addedAt)) next.delete(addedAt);
      else next.add(addedAt);
      return next;
    });
  };

  const handleRemove = (item: CartItem) => {
    setCart(removeFromCart(item.addedAt));
  };

  // Removes the selected items, or — if nothing is checked — clears the
  // whole cart, matching the single "Remove All" button in the design.
  const handleRemoveAll = () => {
    if (selected.size > 0) {
      setCart(removeManyFromCart([...selected]));
      setSelected(new Set());
    } else {
      setCart(removeManyFromCart(cart.map((c) => c.addedAt)));
    }
  };

  const handleQtyChange = (item: CartItem, delta: number) => {
    const next = item.quantity + delta;
    if (next < 1) return;
    setCart(updateQuantity(item.addedAt, next));
  };

  const handleApplyCoupon = () => {
    if (!coupon.trim()) return;
    // No coupon system is wired up yet — say so honestly rather than
    // pretending to apply a discount that never actually gets validated
    // server-side.
    setCouponMessage("Coupon codes aren't available yet — check back soon.");
  };

  const itemCount = cart.length;
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <main className="max-w-[1500px] mx-auto px-4 sm:px-5 py-6 sm:py-10">
      {/* Breadcrumb */}
      <div className="text-xs sm:text-sm text-gray-400 flex items-center gap-2 mb-3 sm:mb-4">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Cart</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold mb-1">Shopping Cart</h1>
      <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">Review your items and proceed to checkout.</p>

      {cart.length === 0 ? (
        <div className="text-center py-14 sm:py-20 border border-gray-200 rounded-2xl shadow-sm px-4">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3">Your cart is empty</h2>
          <p className="text-sm sm:text-base text-gray-500 mb-6">Add some products to continue shopping.</p>
          <Link
            href="/products"
            className="inline-flex px-6 py-3 rounded-lg bg-black text-white text-sm sm:text-base"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
            {/* Cart items panel */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
              <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
                <label className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-black shrink-0"
                  />
                  {itemCount} {itemCount === 1 ? "Item" : "Items"}
                </label>

                <button
                  onClick={handleRemoveAll}
                  className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-red-600 font-medium hover:text-red-700"
                >
                  <FaTrashAlt className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">Remove All</span>
                  <span className="xs:hidden">Remove</span>
                </button>
              </div>

              <div className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <div key={item.addedAt} className="flex gap-3 sm:gap-4 p-4 sm:p-5">
                    <input
                      type="checkbox"
                      checked={selected.has(item.addedAt)}
                      onChange={() => toggleOne(item.addedAt)}
                      className="w-4 h-4 mt-2 shrink-0 accent-black"
                    />

                    <div className="relative w-20 h-28 sm:w-32 sm:h-44 shrink-0 overflow-hidden rounded-lg bg-white">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <h3 className="font-semibold text-sm sm:text-lg leading-snug">{item.productName}</h3>
                        <p className="font-semibold text-sm sm:text-base whitespace-nowrap">₹{item.lineTotal}</p>
                      </div>

                      <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-600 space-y-1">
                        {item.size && (
                          <p><span className="font-medium text-gray-800">Size:</span> {item.size}</p>
                        )}

                        {item.sizeBreakdown && Object.values(item.sizeBreakdown).some((q) => q > 0) && (
                          <p>
                            <span className="font-medium text-gray-800">Sizes:</span>{" "}
                            {Object.entries(item.sizeBreakdown)
                              .filter(([, qty]) => qty > 0)
                              .map(([size, qty]) => `${size} × ${qty}`)
                              .join(", ")}
                          </p>
                        )}

                        {item.color && (
                          <p><span className="font-medium text-gray-800">Color:</span> {item.color}</p>
                        )}

                        <p><span className="font-medium text-gray-800">Delivery:</span> {item.deliveryType}</p>

                        {(item.customization?.logoDesign || item.customization?.logoUrls) && (
                          <p className="text-purple-600 font-medium">Custom logo design — saved with this item</p>
                        )}

                        {!!(item.embroideryCharge || item.dtfCharge) && (
                          <p className="text-gray-400 text-[11px] sm:text-xs">
                            + ₹{item.embroideryCharge || item.dtfCharge} {item.customization?.printType === "dtf" ? "DTF" : "embroidery"} charge included above
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQtyChange(item, -1)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
                            aria-label="Decrease quantity"
                          >
                            <FaMinus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-7 sm:w-8 text-center text-xs sm:text-sm font-medium border-x border-gray-300 py-1 sm:py-1.5">{item.quantity}</span>
                          <button
                            onClick={() => handleQtyChange(item, 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                            aria-label="Increase quantity"
                          >
                            <FaPlus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item)}
                          className="flex items-center gap-1.5 text-red-600 text-xs sm:text-sm font-medium hover:text-red-700"
                        >
                          <FaTrashAlt className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-5 py-4 sm:py-5 border-t border-gray-200">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 w-full sm:w-auto"
                >
                  <FaChevronLeft className="w-3 h-3" />
                  Continue Shopping
                </Link>

                <div className="w-full sm:w-auto">
                  <p className="text-sm font-semibold mb-1.5">Have a coupon code?</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => { setCoupon(e.target.value); setCouponMessage(null); }}
                      placeholder="Enter coupon code"
                      className="flex-1 sm:w-56 px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 min-w-0"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 sm:px-5 py-2.5 rounded-lg bg-black text-white text-sm font-medium shrink-0 hover:bg-gray-900"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
              {couponMessage && (
                <p className="px-4 sm:px-5 pb-4 -mt-2 text-xs text-gray-500 text-right">{couponMessage}</p>
              )}
            </div>

            {/* Order summary */}
            <aside className="border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm bg-white lg:sticky lg:top-28">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Items</span>
                  <span className="font-medium">{itemCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Quantity</span>
                  <span className="font-medium">{totalQuantity}</span>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    Shipping
                    <FaInfoCircle className="w-3 h-3 text-gray-400 shrink-0" />
                  </span>
                  <span className="text-gray-500 text-right">Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-gray-500">–</span>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>Total</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full mt-6 py-3 sm:py-3.5 rounded-xl bg-black text-white text-sm sm:text-base font-medium flex items-center justify-center gap-2 hover:bg-gray-900 shadow-sm"
              >
                Proceed to Checkout
                <FaChevronRight className="w-3 h-3" />
              </Link>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5 sm:mt-6 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-100 flex items-center justify-center">
                    <FaShieldAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-gray-500 leading-tight">Secure<br />Payments</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-orange-100 flex items-center justify-center">
                    <FaBoxOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-gray-500 leading-tight">Easy<br />Returns</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaTruck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-gray-500 leading-tight">Fast<br />Delivery</span>
                </div>
              </div>
            </aside>
          </div>

          {/* Trust strip */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 rounded-2xl bg-gray-50 border border-gray-200 px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex items-center gap-3">
              <FaTruck className="w-5 h-5 text-gray-700 shrink-0" />
              <div>
                <p className="text-sm font-semibold leading-tight">Same Day Delivery</p>
                <p className="text-xs text-gray-500">In Mumbai (Selected Areas)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaShieldAlt className="w-5 h-5 text-gray-700 shrink-0" />
              <div>
                <p className="text-sm font-semibold leading-tight">100% Secure Payments</p>
                <p className="text-xs text-gray-500">Razorpay / UPI / Cards</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaBoxOpen className="w-5 h-5 text-gray-700 shrink-0" />
              <div>
                <p className="text-sm font-semibold leading-tight">Easy Returns</p>
                <p className="text-xs text-gray-500">Hassle Free Returns</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaHeadset className="w-5 h-5 text-gray-700 shrink-0" />
              <div>
                <p className="text-sm font-semibold leading-tight">Dedicated Support</p>
                <p className="text-xs text-gray-500">We&apos;re here to help</p>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}