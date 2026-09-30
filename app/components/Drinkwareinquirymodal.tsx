// PATH: app/components/DrinkwareInquiryModal.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

// ── Small inline icon set (heroicons-outline style, kept local to this file) ─
const Icon = {
  Chat: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  ),
  Cup: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 8.25h12v8.25a3 3 0 01-3 3h-6a3 3 0 01-3-3V8.25zM16.5 9.75h1.5a2.25 2.25 0 010 4.5h-1.5M8.25 3.75c-.5.75-.5 1.5 0 2.25M12 3.75c-.5.75-.5 1.5 0 2.25" />
    </svg>
  ),
  Shield: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  Pencil: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
    </svg>
  ),
  Boxes: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="3" y="10" width="6" height="6" rx="0.5" /><rect x="10" y="10" width="6" height="6" rx="0.5" /><rect x="17" y="10" width="4" height="6" rx="0.5" />
    </svg>
  ),
  Truck: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.001M14.25 7.573L15.75 7.5m-1.5.073v11.177m0-11.177H8.905c-1.026 0-1.973.542-2.494 1.427L3.5 14.25M14.25 18.75H8.25m0 0a1.5 1.5 0 01-3 0m0 0a1.5 1.5 0 00-3 0m0 0H2.25" />
    </svg>
  ),
  Headset: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12a8.25 8.25 0 0116.5 0v4.5a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25v-1.5a2.25 2.25 0 012.25-2.25h3.75M3.75 12v4.5a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25v-1.5a2.25 2.25 0 00-2.25-2.25H3.75z" />
    </svg>
  ),
  Person: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.964 0a9 9 0 10-11.964 0m11.964 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Phone: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  Envelope: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  Pin: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  Building: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
  Briefcase: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.653v-2.494a1.5 1.5 0 00-.966-1.4l-1.5-.6M20.25 14.15L18.75 9.6M3.75 14.15a2.18 2.18 0 01-.75-1.653v-2.494a1.5 1.5 0 01.966-1.4l1.5-.6M3.75 14.15L5.25 9.6M18.75 9.6L15 8.4M18.75 9.6L15 10.8M5.25 9.6L9 8.4M5.25 9.6L9 10.8m6-2.4v-.75a2.25 2.25 0 00-2.25-2.25h-1.5A2.25 2.25 0 009 6.75v.75" />
    </svg>
  ),
  Clipboard: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m-7 4h8a2 2 0 002-2V8.5a2 2 0 00-.586-1.414l-3.5-3.5A2 2 0 0012.5 3H8a2 2 0 00-2 2v13a2 2 0 002 2z" />
    </svg>
  ),
  ClipboardCheck: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l1.5 1.5 3-3.75M6.75 3.75h10.5a2.25 2.25 0 012.25 2.25v12a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25V6a2.25 2.25 0 012.25-2.25zM9 6.75h6" />
    </svg>
  ),
  Check: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  Send: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  ),
  Clock: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Copy: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25" />
    </svg>
  ),
  Upload: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 8.25L12 3.75m0 0L7.5 8.25M12 3.75v12" />
    </svg>
  ),
  Search: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  List: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
};

// ── Field data ────────────────────────────────────────────────────────────
const DRINKWARE_TYPE_OPTIONS = [
  { id: "mugs", label: "Mugs", image: "/drinkware/mugs.webp" },
  { id: "water-bottles", label: "Water Bottles", image: "/drinkware/water-bottles.webp" },
  { id: "tumblers", label: "Tumblers", image: "/drinkware/tumblers.webp" },
  { id: "sippers", label: "Sippers", image: "/drinkware/sippers.webp" },
  { id: "flasks", label: "Flasks", image: "/drinkware/flask.webp" },
  { id: "travel-mugs", label: "Travel Mugs", image: "/drinkware/travel-mug.webp" },
  { id: "thermos", label: "Thermos", image: "/drinkware/thermos.webp" },
  { id: "beer-mugs", label: "Beer Mugs", image: "/drinkware/beer-mugs.webp" },
  { id: "custom-combination", label: "Custom\nCombination", image: "/drinkware/custom-combination.webp" },
] as const;

const QUANTITY_OPTIONS = [
  { id: "10-25", label: "10 - 25" },
  { id: "26-50", label: "26 - 50" },
  { id: "51-100", label: "51 - 100" },
  { id: "100+", label: "100+" },
  { id: "custom", label: "Custom" },
] as const;

const BRANDING_OPTIONS = [
  { id: "yes-with-branding", label: "Yes, add\nbranding" },
  { id: "no-branding", label: "No branding" },
  { id: "not-sure", label: "Not sure" },
] as const;

const BRANDING_POSITION_OPTIONS = ["Front", "Back", "Left", "Right", "Wrap Around"];

const DRINKWARE_COLOR_OPTIONS = [
  { id: "black", swatch: "#111827" },
  { id: "blue", swatch: "#2563eb" },
  { id: "red", swatch: "#ef4444" },
  { id: "green", swatch: "#22c55e" },
  { id: "pink", swatch: "#f9a8d4" },
  { id: "multi", swatch: "conic-gradient(from 0deg, #ef4444, #f59e0b, #22c55e, #2563eb, #a855f7, #ef4444)" },
] as const;

const PACKAGING_OPTIONS = [
  { id: "standard-packing", label: "Standard Packing\n(Bulk)", image: "/drinkware/packaging-standard.webp" },
  { id: "individual-box", label: "Individual Box", image: "/drinkware/packaging-individual-box.webp" },
  { id: "gift-box", label: "Gift Box", image: "/drinkware/packaging-gift-box.webp" },
] as const;

const STATE_OPTIONS = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Other"];

const STEPS = [
  { id: 1, label: "Requirements" },
  { id: 2, label: "Contact Details" },
  { id: 3, label: "Additional Info" },
  { id: 4, label: "Review & Submit" },
  { id: 5, label: "Submitted" },
];

interface FormState {
  // Step 1
  drinkwareType: string; quantity: string;
  // Step 2
  fullName: string; designation: string; phone: string; email: string; preferredContact: string;
  companyName: string; gstNumber: string; address: string; city: string; state: string;
  // Step 3
  brandingOption: string; brandingPositions: string[]; drinkwareColor: string; packaging: string; specificRequirement: string;
}

const INITIAL_FORM: FormState = {
  drinkwareType: "mugs", quantity: "26-50",
  fullName: "", designation: "", phone: "", email: "", preferredContact: "Call",
  companyName: "", gstNumber: "", address: "", city: "", state: "",
  brandingOption: "yes-with-branding", brandingPositions: ["Front"], drinkwareColor: "black", packaging: "standard-packing", specificRequirement: "",
};

function labelFor<T extends { id: string; label: string }>(options: readonly T[], id: string): string {
  return options.find((o) => o.id === id)?.label.replace("\n", " ") ?? id;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function emailError(value: string): string | undefined {
  if (!value.trim()) return undefined;
  return EMAIL_REGEX.test(value.trim()) ? undefined : "Enter a valid email address";
}
function phoneError(value: string): string | undefined {
  if (!value.trim()) return undefined;
  const digitsOnly = value.replace(/\D/g, "");
  if (!/^\+?[\d\s-]+$/.test(value.trim())) return "Only digits, spaces, + and - are allowed";
  if (digitsOnly.length < 10) return "Enter a valid 10-digit phone number";
  return undefined;
}

function Field({ label, required, icon, children }: { label: string; required?: boolean; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-800 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-2.5">
        {icon && <span className="w-9 h-9 rounded-lg bg-violet-50 text-violet-500 flex items-center justify-center flex-shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-9 text-sm text-gray-800 outline-none focus:border-black appearance-none"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </div>
  );
}

function TextField({ value, onChange, placeholder, type = "text", icon, error }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; icon: React.ReactNode; error?: string }) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center flex-shrink-0">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 min-w-0 rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 ${
            error ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-black"
          }`}
        />
      </div>
      {error && <span className="block text-[11px] text-red-500 mt-1 ml-[50px]">{error}</span>}
    </div>
  );
}

// Image-based option card — Drinkware Type and Packaging, real product photos.
function ImageOptionCard({ active, onClick, image, label }: { active: boolean; onClick: () => void; image: string; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center text-center gap-2 rounded-xl border p-3 transition-all ${
        active ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-white">
        <Image src={image} alt={label} fill className="object-contain p-1.5" />
      </div>
      <span className={`text-[11px] font-bold leading-tight whitespace-pre-line ${active ? "text-black" : "text-gray-900"}`}>{label}</span>
      {active && (
        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
          <Icon.Check className="w-2.5 h-2.5 text-white" />
        </span>
      )}
    </button>
  );
}

// Plain pill toggle — Quantity, Preferred Contact Method, Branding Option.
function PillToggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl border px-3 py-2.5 text-center text-[12px] font-bold whitespace-pre-line transition-all ${
        active ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

// Colour swatch selector — Drinkware Color.
function ColorSwatch({ active, onClick, swatch }: { active: boolean; onClick: () => void; swatch: string }) {
  const isGradient = swatch.startsWith("conic-gradient");
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
        active ? "ring-2 ring-offset-2 ring-blue-600" : "ring-1 ring-offset-2 ring-gray-200"
      }`}
      style={{ background: swatch }}
    >
      {active && (
        <Icon.Check className={`w-3.5 h-3.5 ${isGradient || swatch === "#111827" || swatch === "#2563eb" || swatch === "#ef4444" ? "text-white" : "text-black"}`} />
      )}
    </button>
  );
}

export default function DrinkwareInquiryModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [inquiryId, setInquiryId] = useState("");
  const [copied, setCopied] = useState(false);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleBrandingPosition = (position: string) => {
    setForm((prev) => ({
      ...prev,
      brandingPositions: prev.brandingPositions.includes(position)
        ? prev.brandingPositions.filter((p) => p !== position)
        : [...prev.brandingPositions, position],
    }));
  };

  const canGoNext = () =>
    step === 2
      ? !!(form.fullName.trim() && form.phone.trim() && form.email.trim() && form.companyName.trim() && form.address.trim() && form.city.trim() && form.state.trim() && !phoneError(form.phone) && !emailError(form.email))
      : true;

  const filteredDrinkwareTypes = DRINKWARE_TYPE_OPTIONS.filter((k) =>
    k.label.toLowerCase().replace("\n", " ").includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/web-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: "drinkware",
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          companyName: form.companyName,
          businessAddress: form.address,
          details: {
            drinkwareType: form.drinkwareType, quantity: form.quantity,
            designation: form.designation, preferredContact: form.preferredContact,
            gstNumber: form.gstNumber, city: form.city, state: form.state,
            brandingOption: form.brandingOption, brandingPositions: form.brandingPositions,
            drinkwareColor: form.drinkwareColor, packaging: form.packaging, specificRequirement: form.specificRequirement,
            logoFileName,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data?.error || "Could not submit your inquiry. Please try again.");
        return;
      }
      const id = data?.enquiry?.id;
      setInquiryId(id ? `DRK-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${String(id).padStart(4, "0")}` : `DRK-${Date.now()}`);
      setSubmitted(true);
      setStep(5);
    } catch {
      setSubmitError("Network error — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyInquiryId = () => {
    navigator.clipboard?.writeText(inquiryId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const stepHeader: Record<number, { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }> = {
    1: { title: "Select Your Drinkware", subtitle: "Choose the type of drinkware you are interested in", icon: Icon.Cup },
    2: { title: "Contact Details", subtitle: "Please provide your contact and company details", icon: Icon.Clipboard },
    3: { title: "Customization & Additional Information", subtitle: "Help us customize your drinkware", icon: Icon.Pencil },
    4: { title: "Review Your Inquiry", subtitle: "Please review all details before submitting your inquiry", icon: Icon.ClipboardCheck },
  };
  const header = stepHeader[step];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ── Left sidebar (constant across all steps) ── */}
        <div className="hidden sm:flex sm:w-[260px] flex-shrink-0 flex-col bg-[#f7f7f8] p-6 border-r border-gray-200 overflow-y-auto">
          <span className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center mb-4">
            <Icon.Cup className="w-5 h-5" />
          </span>
          <span className="text-lg font-bold text-gray-900 leading-tight">
            Inquiry for<br /><span className="text-black">Drinkware</span>
          </span>
          <p className="text-[12px] text-gray-500 mt-2 leading-relaxed">Premium drinkware for every occasion.</p>

          <div className="relative w-full aspect-[4/3] mt-5 rounded-xl overflow-hidden bg-white border border-gray-200">
            <Image src="/black-stainless-steel-up-bottle/Stainless-steel-cup-bottle-top.png" alt="Drinkware collection" fill className="object-contain p-2" />
          </div>

          <div className="mt-6 space-y-4">
            {[
              { title: "Premium Quality", desc: "Durable & long lasting", icon: Icon.Shield },
              { title: "Custom Branding", desc: "Logo / Name / Design", icon: Icon.Pencil },
              { title: "Bulk Orders", desc: "Best pricing", icon: Icon.Boxes },
              { title: "On-time Delivery", desc: "Pan India", icon: Icon.Truck },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[12px] font-bold text-gray-900 block leading-tight">{item.title}</span>
                  <span className="text-[11px] text-gray-500 block mt-0.5 leading-snug">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6">
            <div className="rounded-xl bg-white border border-gray-200 p-3.5">
              <div className="flex items-start gap-2.5 mb-3">
                <span className="w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center flex-shrink-0">
                  <Icon.Headset className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[12px] font-bold text-gray-900 block">Need Help?</span>
                  <span className="text-[11px] text-gray-500 block leading-snug">Our experts are here to help you.</span>
                </div>
              </div>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-white border border-gray-200 py-2 text-[12px] font-bold text-black hover:bg-gray-100"
              >
                Chat with Us
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Right content ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Stepper */}
          <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        s.id < step
                          ? "bg-green-50 text-green-600 border-2 border-green-500"
                          : s.id === step
                          ? "bg-black text-white ring-4 ring-gray-200"
                          : "bg-white border-2 border-gray-200 text-gray-400"
                      }`}
                    >
                      {s.id < step ? <Icon.Check className="w-4 h-4" /> : s.id}
                    </span>
                    <span className={`text-[10px] font-semibold whitespace-nowrap ${s.id === step ? "text-black" : s.id < step ? "text-green-600" : "text-gray-400"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1.5 mb-4 ${s.id < step ? "bg-green-500" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5">
            {step === 5 && submitted ? (
              <div className="flex flex-col items-center text-center py-4">
                <span className="relative w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center mb-4">
                  <Icon.Check className="w-8 h-8" />
                </span>
                <span className="text-xl font-bold text-gray-900">Thank You!</span>
                <span className="text-[13px] font-semibold text-gray-700 mt-0.5">Your Inquiry Has Been Submitted.</span>
                <p className="text-[12px] text-gray-500 mt-2 max-w-sm">
                  We have received your inquiry and our team will review it carefully. We&apos;ll get back to you with the best possible solution.
                </p>

                <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 mt-5">
                  <span className="text-[10px] text-gray-400 block">Your Inquiry ID</span>
                  <button type="button" onClick={copyInquiryId} className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-black">{inquiryId}</span>
                    <Icon.Copy className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <span className="text-[10px] text-gray-400 block">{copied ? "Copied!" : "Save this ID for future reference"}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 w-full max-w-lg">
                  {[
                    { title: "Confirmation Email", desc: "A copy of your inquiry has been sent to your email.", icon: Icon.Envelope },
                    { title: "We'll Get Back to You", desc: "Our team will review your requirements and contact you within 24 hours.", icon: Icon.Clock },
                    { title: "Need Help?", desc: "Talk to our experts for quick assistance.", icon: Icon.Headset },
                  ].map((item) => (
                    <div key={item.title} className="text-center rounded-xl border border-gray-200 p-3.5">
                      <span className="w-9 h-9 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-2">
                        <item.icon className="w-4 h-4" />
                      </span>
                      <span className="text-[11px] font-bold text-gray-900 block leading-tight">{item.title}</span>
                      <span className="text-[10px] text-gray-500 block mt-1 leading-snug">{item.desc}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <button type="button" onClick={onClose} className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100">
                    ← Go to Home
                  </button>
                  <button type="button" onClick={onClose} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-sm font-bold">
                    View My Inquiries
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                      <header.icon className="w-4.5 h-4.5" />
                    </span>
                    <div>
                      <span className="text-base font-bold text-gray-900 block">{header.title}</span>
                      <span className="text-[12px] text-gray-500 block mt-0.5">{header.subtitle}</span>
                    </div>
                  </div>
                  {step === 1 && (
                    <div className="hidden sm:flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 flex-shrink-0">
                      <Icon.Search className="w-3.5 h-3.5 text-gray-400" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search drinkware..."
                        className="text-[12px] outline-none placeholder:text-gray-400 w-28"
                      />
                    </div>
                  )}
                </div>

                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filteredDrinkwareTypes.map((k) => (
                          <ImageOptionCard key={k.id} active={form.drinkwareType === k.id} onClick={() => set("drinkwareType", k.id)} image={k.image} label={k.label} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[13px] font-semibold text-gray-800 mb-2 block">Select Quantity</span>
                      <div className="flex gap-2.5">
                        {QUANTITY_OPTIONS.map((q) => (
                          <PillToggle key={q.id} active={form.quantity === q.id} onClick={() => set("quantity", q.id)} label={q.label} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5 max-w-3xl">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <span className="text-[13px] font-bold text-gray-900 block mb-3">Contact Person Details</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name" required icon={null}>
                          <TextField icon={<Icon.Person className="w-4 h-4" />} value={form.fullName} onChange={(v) => set("fullName", v)} placeholder="Enter full name" />
                        </Field>
                        <Field label="Designation" icon={null}>
                          <TextField icon={<Icon.Briefcase className="w-4 h-4" />} value={form.designation} onChange={(v) => set("designation", v)} placeholder="Enter designation" />
                        </Field>
                        <Field label="Phone Number" required icon={null}>
                          <TextField icon={<Icon.Phone className="w-4 h-4" />} type="tel" value={form.phone} onChange={(v) => set("phone", v)} placeholder="Enter phone number" error={phoneError(form.phone)} />
                        </Field>
                        <Field label="Email Address" required icon={null}>
                          <TextField icon={<Icon.Envelope className="w-4 h-4" />} type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="Enter email address" error={emailError(form.email)} />
                        </Field>
                      </div>
                      <div className="mt-4">
                        <span className="text-[13px] font-semibold text-gray-800 mb-1.5 block">Preferred Contact Method <span className="text-red-500">*</span></span>
                        <div className="flex gap-2.5 max-w-sm">
                          {["Call", "WhatsApp", "Email"].map((m) => (
                            <PillToggle key={m} active={form.preferredContact === m} onClick={() => set("preferredContact", m)} label={m} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <span className="text-[13px] font-bold text-gray-900 block mb-3">Company / Organization Details</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Company / Organization Name" required icon={null}>
                          <TextField icon={<Icon.Building className="w-4 h-4" />} value={form.companyName} onChange={(v) => set("companyName", v)} placeholder="Enter company name" />
                        </Field>
                        <Field label="GST Number (Optional)" icon={null}>
                          <TextField icon={<Icon.Clipboard className="w-4 h-4" />} value={form.gstNumber} onChange={(v) => set("gstNumber", v)} placeholder="Enter GST number" />
                        </Field>
                        <div className="sm:col-span-2">
                          <Field label="Complete Address" required icon={null}>
                            <div className="flex items-start gap-2.5">
                              <span className="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Icon.Pin className="w-4 h-4" />
                              </span>
                              <textarea
                                value={form.address}
                                onChange={(e) => set("address", e.target.value)}
                                rows={2}
                                placeholder="Enter complete address"
                                className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black resize-none placeholder:text-gray-400"
                              />
                            </div>
                          </Field>
                        </div>
                        <Field label="City" required icon={null}>
                          <TextField icon={<Icon.Building className="w-4 h-4" />} value={form.city} onChange={(v) => set("city", v)} placeholder="Enter city" />
                        </Field>
                        <Field label="State" required icon={<Icon.List className="w-4 h-4" />}>
                          <SelectField value={form.state || "Maharashtra"} onChange={(v) => set("state", v)} options={STATE_OPTIONS} />
                        </Field>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <span className="text-[13px] font-bold text-gray-900 block">Branding Customization</span>
                      <span className="text-[11px] text-gray-500 block mb-3">Do you want to add your logo / branding?</span>
                      <div className="flex gap-2.5 max-w-md">
                        {BRANDING_OPTIONS.map((b) => (
                          <PillToggle key={b.id} active={form.brandingOption === b.id} onClick={() => set("brandingOption", b.id)} label={b.label} />
                        ))}
                      </div>
                    </div>

                    {form.brandingOption === "yes-with-branding" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <span className="text-[13px] font-semibold text-gray-800 mb-2 block">Uploaded Logo (If Yes)</span>
                          <label className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 py-6 px-3 text-center cursor-pointer hover:border-gray-400 transition-colors">
                            <Icon.Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-[11px] font-semibold text-gray-600">
                              {logoFileName ? logoFileName : (<>Upload your logo<br />(PNG, JPG, SVG Max. 5MB)</>)}
                            </span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml"
                              className="hidden"
                              onChange={(e) => setLogoFileName(e.target.files?.[0]?.name ?? null)}
                            />
                          </label>
                        </div>
                        <div>
                          <span className="text-[13px] font-semibold text-gray-800 mb-2 block">Branding Position (If Any)</span>
                          <div className="grid grid-cols-2 gap-2">
                            {BRANDING_POSITION_OPTIONS.map((pos) => {
                              const active = form.brandingPositions.includes(pos);
                              return (
                                <button
                                  key={pos}
                                  type="button"
                                  onClick={() => toggleBrandingPosition(pos)}
                                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-semibold transition-all ${
                                    active ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                                  }`}
                                >
                                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 ${active ? "bg-blue-600" : "border border-gray-300"}`}>
                                    {active && <Icon.Check className="w-2.5 h-2.5 text-white" />}
                                  </span>
                                  {pos}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-[13px] font-semibold text-gray-800 mb-2 block">Drinkware Color</span>
                      <div className="flex gap-3">
                        {DRINKWARE_COLOR_OPTIONS.map((c) => (
                          <ColorSwatch key={c.id} active={form.drinkwareColor === c.id} onClick={() => set("drinkwareColor", c.id)} swatch={c.swatch} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[13px] font-semibold text-gray-800 mb-2 block">Packaging Type</span>
                      <div className="grid grid-cols-3 gap-3 max-w-md">
                        {PACKAGING_OPTIONS.map((p) => (
                          <ImageOptionCard key={p.id} active={form.packaging === p.id} onClick={() => set("packaging", p.id)} image={p.image} label={p.label} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[13px] font-semibold text-gray-800 mb-1.5 block">Any Specific Requirement? <span className="text-gray-400 font-normal">(Optional)</span></label>
                      <textarea
                        value={form.specificRequirement}
                        onChange={(e) => set("specificRequirement", e.target.value)}
                        maxLength={500}
                        rows={3}
                        placeholder="Write about your design, color, size, packing or any other requirement..."
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black resize-none placeholder:text-gray-400"
                      />
                      <span className="text-[10px] text-gray-400 block text-right mt-1">{form.specificRequirement.length} / 500</span>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="flex items-center gap-2 text-[13px] font-bold text-gray-900">
                          <Icon.Cup className="w-4 h-4 text-violet-600" />
                          Drinkware Summary
                        </span>
                        <button type="button" onClick={() => setStep(1)} className="text-[11px] font-semibold text-gray-700 hover:underline">Edit</button>
                      </div>
                      <div className="space-y-2 text-[12px]">
                        {[
                          ["Product Type", labelFor(DRINKWARE_TYPE_OPTIONS, form.drinkwareType)],
                          ["Quantity", labelFor(QUANTITY_OPTIONS, form.quantity)],
                          ["Branding", form.brandingOption === "yes-with-branding" ? "Yes (Logo Uploaded)" : labelFor(BRANDING_OPTIONS, form.brandingOption)],
                          ["Branding Position", form.brandingPositions.length ? form.brandingPositions.join(", ") : "—"],
                          ["Color", form.drinkwareColor.charAt(0).toUpperCase() + form.drinkwareColor.slice(1)],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between gap-2">
                            <span className="text-gray-500">{label}</span>
                            <span className="font-semibold text-gray-900 text-right">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="flex items-center gap-2 text-[13px] font-bold text-gray-900">
                          <Icon.Person className="w-4 h-4 text-violet-600" />
                          Contact Details
                        </span>
                        <button type="button" onClick={() => setStep(2)} className="text-[11px] font-semibold text-gray-700 hover:underline">Edit</button>
                      </div>
                      <div className="space-y-2 text-[12px]">
                        {[
                          ["Name", form.fullName || "—"], ["Designation", form.designation || "—"],
                          ["Phone", form.phone || "—"], ["Email", form.email || "—"],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between gap-2">
                            <span className="text-gray-500">{label}</span>
                            <span className="font-semibold text-gray-900 text-right">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="flex items-center gap-2 text-[13px] font-bold text-gray-900">
                          <Icon.Building className="w-4 h-4 text-violet-600" />
                          Company Details
                        </span>
                        <button type="button" onClick={() => setStep(2)} className="text-[11px] font-semibold text-gray-700 hover:underline">Edit</button>
                      </div>
                      <div className="space-y-2 text-[12px]">
                        {[
                          ["Company", form.companyName || "—"], ["GST Number", form.gstNumber || "—"],
                          ["Address", form.address || "—"], ["City", form.city || "—"], ["State", form.state || "—"],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-start justify-between gap-2">
                            <span className="text-gray-500 flex-shrink-0">{label}</span>
                            <span className="font-semibold text-gray-900 text-right">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="flex items-center gap-2 text-[13px] font-bold text-gray-900">
                          <Icon.Pencil className="w-4 h-4 text-violet-600" />
                          Additional Information
                        </span>
                        <button type="button" onClick={() => setStep(3)} className="text-[11px] font-semibold text-gray-700 hover:underline">Edit</button>
                      </div>
                      <div className="space-y-2 text-[12px]">
                        {[
                          ["Packaging", labelFor(PACKAGING_OPTIONS, form.packaging)],
                          ["Notes", form.specificRequirement || "—"],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-start justify-between gap-2">
                            <span className="text-gray-500 flex-shrink-0">{label}</span>
                            <span className="font-semibold text-gray-900 text-right">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {step !== 5 && (
            <div className="flex flex-col items-end gap-1.5 px-5 sm:px-7 py-4 border-t border-gray-100 flex-shrink-0">
              <div className="w-full flex items-center justify-between">
                {step === 1 ? (
                  <span />
                ) : (
                  <button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100">
                    ← Back
                  </button>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    disabled={!canGoNext()}
                    onClick={() => setStep((s) => Math.min(4, s + 1))}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold"
                  >
                    <Icon.Send className="w-4 h-4" />
                    {submitting ? "Submitting…" : "Submit Inquiry"}
                  </button>
                )}
              </div>
              {submitError && <span className="text-[11px] text-red-500 font-medium">{submitError}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}