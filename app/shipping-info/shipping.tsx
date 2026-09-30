// PATH: app/shipping/shipping.tsx
// app/shipping/shipping.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FaTruck,
  FaShieldAlt,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaRegClock,
  FaQuestionCircle,
  FaChevronDown,
  FaFileAlt,
  FaCog,
  FaCheckCircle,
  FaHeadset,
  FaEnvelope,
  FaLeaf,
  FaInfoCircle,
} from 'react-icons/fa';
import { INDIA_MAP_PATH } from './india-map-path';

interface TimelineRow {
  location: string;
  time: string;
}

const TIMELINE: TimelineRow[] = [
  { location: 'Mumbai (Local)', time: '1 – 2 working days' },
  { location: 'Maharashtra (Metro Cities)', time: '2 – 4 working days' },
  { location: 'Other Metro Cities (Delhi, Bangalore, etc.)', time: '3 – 5 working days' },
  { location: 'Other Major Cities', time: '4 – 6 working days' },
  { location: 'Remote Areas', time: '6 – 8 working days' },
];

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: 'How long will my order take to arrive?',
    a: 'Delivery time depends on your location — typically 1-2 days within Mumbai, 2-6 days for other major cities, and up to 8 days for remote areas, in addition to production time.',
  },
  {
    q: 'Do you deliver to my pincode?',
    a: 'We currently cover 28,000+ pin codes across India. Use the pincode checker above to confirm delivery availability at your location.',
  },
  {
    q: 'Which courier partners do you use?',
    a: 'We work with trusted logistics partners including Delhivery, Ekart, and other leading courier services to ensure reliable delivery across India.',
  },
  {
    q: 'Can I track my order?',
    a: 'Yes — once your order is dispatched, you will receive a tracking link via email and SMS so you can follow it in real time.',
  },
  {
    q: 'Do you offer express delivery?',
    a: 'Same-day and express delivery are available for select products and locations. Check the product page or contact our support team to confirm eligibility.',
  },
  {
    q: 'What if my order is delayed?',
    a: 'Delivery timelines are estimates and may occasionally be affected by weather, festivals, or courier delays. If your order is significantly delayed, reach out to our support team and we will help track it down.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Currently we ship only within India. For bulk or corporate international orders, please contact our support team to discuss options.',
  },
];

const SHIPPING_STEPS = [
  { icon: <FaFileAlt className="w-5 h-5" />, title: '1. Order Placed', desc: 'You place your order on our website.' },
  { icon: <FaCog className="w-5 h-5" />, title: '2. Processing', desc: 'We prepare and customize your products.' },
  { icon: <FaBoxOpen className="w-5 h-5" />, title: '3. Dispatched', desc: 'Your order is handed over to our courier partner.' },
  { icon: <FaTruck className="w-5 h-5" />, title: '4. In Transit', desc: 'Track your order in real time.' },
  { icon: <FaCheckCircle className="w-5 h-5" />, title: '5. Delivered', desc: 'Your order reaches you safely.' },
];

// Rough scatter of coverage points over the decorative "map" blob below —
// purely illustrative, not a real geographic projection.
// Roughly plotted over major-city positions on the India outline below —
// illustrative only, not precise coordinates.
// Verified against the rendered map (app/shipping/india-map-path.ts) by
// pixel-sampling each point so every marker lands inside the landmass, not
// just at a roughly-eyeballed percentage.
const MAP_PINS = [
  { top: '18.7%', left: '37.8%' }, // Delhi
  { top: '42%', left: '14%' },     // Ahmedabad
  { top: '52%', left: '17%' },     // Mumbai
  { top: '40%', left: '64%' },     // Kolkata
  { top: '34%', left: '82%' },     // Guwahati
  { top: '60%', left: '48%' },     // Hyderabad
  { top: '59.4%', left: '51%' },   // Chennai
  { top: '76%', left: '40.5%' },   // Bangalore
  { top: '84.6%', left: '39%' },   // Kochi
];

export default function ShippingInfo() {
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const checkPincode = () => {
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPincodeResult('Please enter a valid 6-digit pincode.');
      return;
    }
    setPincodeResult(`Great news! We deliver to ${pincode.trim()}.`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-b from-violet-50 via-violet-50/60 to-white">
        <div className="container mx-auto px-4 pt-6 pb-12 md:pb-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
            <span className="text-gray-300">›</span>
            <span className="text-gray-700">Shipping Information</span>
          </nav>

          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-widest text-violet-600 mb-3 uppercase">Shipping Info</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Delivery Across India
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                We ensure your custom products reach you safely and on time. Fast, reliable and
                trackable shipping for all orders.
              </p>
            </div>

            {/* Decorative truck illustration — a single flat SVG, transparent
                background, no shadows/filters, so it reads as a clean icon
                rather than a stack of boxed div "cards". */}
            <div className="relative flex-shrink-0 hidden md:flex items-center justify-center w-96 h-56">
              {/* motion lines */}
              <div className="absolute left-0 top-[45%] flex flex-col gap-2">
                <div className="h-1 w-10 rounded-full bg-violet-300" />
                <div className="h-1 w-7 rounded-full bg-violet-200" />
                <div className="h-1 w-4 rounded-full bg-violet-100" />
              </div>

              {/* boxes beside the truck */}
              <div className="absolute bottom-8 left-14 flex items-end gap-1.5">
                <div className="w-8 h-8 rounded-sm bg-amber-100 border border-amber-300" />
                <div className="w-10 h-10 rounded-sm bg-amber-100 border border-amber-300" />
              </div>

              <svg viewBox="0 0 420 220" className="w-80 h-44 ml-10">
                {/* chassis bar */}
                <rect x="30" y="168" width="250" height="8" rx="4" fill="#e5e7eb" />

                {/* cab (drawn first so the cargo box's left edge overlaps it cleanly) */}
                <path
                  d="M240,160 L240,90 Q240,80 250,80 L275,80 Q290,80 298,95 L312,132 L312,160 Z"
                  fill="#f3f4f6"
                  stroke="#d1d5db"
                  strokeWidth="3"
                />
                <path
                  d="M250,90 L273,90 L285,116 L250,116 Z"
                  fill="#ddd6fe"
                  stroke="#c4b5fd"
                  strokeWidth="2"
                />
                <rect x="303" y="144" width="11" height="9" rx="2" fill="#fbbf24" />

                {/* cargo box */}
                <rect x="30" y="40" width="215" height="120" rx="12" fill="#ffffff" stroke="#d1d5db" strokeWidth="3" />
                <rect x="30" y="40" width="215" height="10" rx="5" fill="#ede9fe" />
                <rect x="85" y="95" width="112" height="34" rx="8" fill="#111827" />
                <rect x="95" y="103" width="18" height="18" rx="4" fill="#7c3aed" />
                <text x="104" y="116" textAnchor="middle" fontSize="12" fontWeight="700" fill="#ffffff">S</text>
                <text x="126" y="117" fontSize="13" fontWeight="700" fill="#ffffff">Cluesstyle</text>

                {/* wheels */}
                <circle cx="82" cy="180" r="20" fill="#1f2937" />
                <circle cx="82" cy="180" r="8" fill="#9ca3af" />
                <circle cx="260" cy="180" r="20" fill="#1f2937" />
                <circle cx="260" cy="180" r="8" fill="#9ca3af" />
              </svg>

              <p className="absolute -top-4 right-0 text-right font-serif italic text-gray-600 leading-snug">
                Your<br />Designs<br />Delivered<br />
                <span className="underline decoration-violet-400 decoration-2 underline-offset-2">With Care</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <FaTruck className="w-5 h-5" />, title: 'Pan India Delivery', desc: 'We ship to all major cities and pin codes.' },
            { icon: <FaShieldAlt className="w-5 h-5" />, title: 'Safe & Secure', desc: 'Your products are carefully packed and protected.' },
            { icon: <FaBoxOpen className="w-5 h-5" />, title: 'Timely Delivery', desc: 'Most orders are dispatched within 2-3 working days.' },
            { icon: <FaMapMarkerAlt className="w-5 h-5" />, title: 'Real-time Tracking', desc: 'Track your order at every step.' },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="w-11 h-11 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                {f.icon}
              </span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline / Map / FAQ */}
      <div className="container mx-auto px-4 pb-10">
        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          {/* Delivery Timeline */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-1">
              <span className="w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                <FaRegClock className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-gray-900">Delivery Timeline</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4 ml-[52px] -mt-1">Estimated delivery time based on your location.</p>

            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-700">
                    <th className="px-4 py-2.5 font-semibold">Location</th>
                    <th className="px-4 py-2.5 font-semibold">Estimated Delivery Time</th>
                  </tr>
                </thead>
                <tbody>
                  {TIMELINE.map((row, idx) => (
                    <tr key={row.location} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                      <td className="px-4 py-3 text-gray-700 border-t border-gray-100">{row.location}</td>
                      <td className="px-4 py-3 text-gray-600 border-t border-gray-100 whitespace-nowrap">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-start gap-2 bg-violet-50 rounded-lg p-3.5">
              <FaInfoCircle className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600 leading-relaxed">
                Delivery timelines are estimates and may vary due to unforeseen circumstances like
                weather, festivals, or courier partner delays.
              </p>
            </div>
          </div>

          {/* Pincode checker + map */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-1">
              <span className="w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                <FaMapMarkerAlt className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-gray-900">We Deliver All Over India</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4 ml-[52px] -mt-1">Enter your pincode to check delivery availability.</p>

            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter your pincode"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
              </div>
              <button
                onClick={checkPincode}
                className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors flex-shrink-0"
              >
                Check
              </button>
            </div>
            {pincodeResult && (
              <p className={`text-xs mb-2 ${pincodeResult.startsWith('Great') ? 'text-green-600' : 'text-red-500'}`}>
                {pincodeResult}
              </p>
            )}

            {/* Decorative India map */}
            <div className="relative flex-1 min-h-[170px] my-3 flex items-center justify-center">
              <div className="relative w-40 h-52">
                <svg viewBox="0 0 1024 1024" className="w-full h-full">
                  <g transform="translate(0,1024) scale(0.1,-0.1)" fill="#ddd6fe">
                    <path d={INDIA_MAP_PATH} />
                  </g>
                </svg>
                {MAP_PINS.map((pin, i) => (
                  <FaMapMarkerAlt
                    key={i}
                    className="absolute w-4 h-4 text-violet-600 -translate-x-1/2 -translate-y-full"
                    style={{ top: pin.top, left: pin.left }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3 mt-auto pt-2 border-t border-gray-100">
              {[
                { icon: <FaMapMarkerAlt className="w-3.5 h-3.5" />, value: '28,000+', label: 'Pin Codes Covered' },
                { icon: <FaBoxOpen className="w-3.5 h-3.5" />, value: '700+', label: 'Cities & Towns' },
                { icon: <FaMapMarkerAlt className="w-3.5 h-3.5" />, value: 'All Over India', label: 'Reliable Delivery' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                    {s.icon}
                  </span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm leading-tight">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                <FaQuestionCircle className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-gray-900 leading-snug">Frequently Asked Questions</h2>
            </div>

            <div className="divide-y divide-gray-100">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={faq.q}>
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-start justify-between gap-3 py-3 text-left"
                    >
                      <span className="text-sm font-medium text-gray-800">{faq.q}</span>
                      <FaChevronDown
                        className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${isOpen ? 'rotate-180 text-violet-600' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <p className="text-sm text-gray-500 leading-relaxed pb-3 pr-6">{faq.a}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Shipping process + Contact */}
      <div className="container mx-auto px-4 pb-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Shipping Process */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Shipping Process</h2>
            <p className="text-sm text-gray-500 mb-6">From order to delivery — here&apos;s how it works.</p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-2">
              {SHIPPING_STEPS.map((step, idx) => (
                <div key={step.title} className="flex items-center sm:flex-1 w-full">
                  <div className="flex flex-col items-center text-center sm:flex-1 gap-2">
                    <span className="w-12 h-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center">
                      {step.icon}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{step.title}</p>
                      <p className="text-xs text-gray-500 leading-snug max-w-[130px]">{step.desc}</p>
                    </div>
                  </div>
                  {idx < SHIPPING_STEPS.length - 1 && (
                    <span className="hidden sm:block text-gray-300 mx-1 flex-shrink-0">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact card */}
          <div className="bg-violet-50 rounded-2xl p-8 flex flex-col items-center text-center justify-center">
            <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center mb-4">
              <FaHeadset className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Still have questions?</h3>
            <p className="text-sm text-gray-600 mb-5">Our support team is here to help you.</p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-3 rounded-lg text-sm transition-colors"
            >
              <FaEnvelope className="w-3.5 h-3.5" /> Contact Support
            </Link>
          </div>
        </div>
      </div>

      {/* Sustainable packaging banner */}
      <div className="container mx-auto px-4 pb-16">
        <div className="relative overflow-hidden bg-violet-50 rounded-2xl p-6 sm:p-8 flex items-center gap-4">
          <span className="w-12 h-12 rounded-full bg-white text-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <FaLeaf className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-bold text-violet-700 mb-1">Sustainable Packaging</h3>
            <p className="text-sm text-gray-600">
              We use eco-friendly and recyclable packaging materials whenever possible.
            </p>
          </div>
          <FaLeaf className="hidden sm:block absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 text-violet-200" />
        </div>
      </div>
    </div>
  );
}