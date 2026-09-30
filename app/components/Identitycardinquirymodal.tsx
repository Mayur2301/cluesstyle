// PATH: app/components/IdentityCardInquiryModal.tsx
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
  Users: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  Rupee: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h10M7 8h10M7 4c3 0 5 1.5 5 4s-2 4-5 4m0 0h10m-10 0l7 8" />
    </svg>
  ),
  Calendar: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  Info: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
  Clipboard: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m-7 4h8a2 2 0 002-2V8.5a2 2 0 00-.586-1.414l-3.5-3.5A2 2 0 0012.5 3H8a2 2 0 00-2 2v13a2 2 0 002 2z" />
    </svg>
  ),
  Check: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  Save: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  ),
  Send: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  ),
  Lock: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  Home: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  Clock: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Tag: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.83.699 2.528 0l4.319-4.319a1.79 1.79 0 000-2.528L10.507 4.66A2.25 2.25 0 008.916 4H6.75z" />
      <circle cx="6.75" cy="6.75" r="0.75" fill="currentColor" />
    </svg>
  ),
  Smile: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zM15.375 9.75c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15a4 4 0 007.5 0" />
    </svg>
  ),
  Sliders: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h6m0 0a2 2 0 104 0m-4 0a2 2 0 114 0m4 0h4M3 12h10m0 0a2 2 0 104 0m-4 0a2 2 0 114 0m4 0h1M3 18h4m0 0a2 2 0 104 0m-4 0a2 2 0 114 0m4 0h9" />
    </svg>
  ),
  HardHat: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 15a8 8 0 0116 0v1H4v-1zM12 5v4M2.5 16h19" />
    </svg>
  ),
  Printer: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0M6.72 13.829a48.822 48.822 0 00-1.474.126m14.028 0a48.822 48.822 0 011.474.126m-16.976 0v-2.474a2.25 2.25 0 012.25-2.25h11.001a2.25 2.25 0 012.25 2.25v2.474m-15.501 0h15.501m-14.001-7.5h12.5v-2.5a2.25 2.25 0 00-2.25-2.25H8.472a2.25 2.25 0 00-2.25 2.25v2.5z" />
    </svg>
  ),
  Boxes: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="3" y="10" width="6" height="6" rx="0.5" /><rect x="10" y="10" width="6" height="6" rx="0.5" /><rect x="17" y="10" width="4" height="6" rx="0.5" />
    </svg>
  ),
  Folder: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  ),
  MagicWand: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  ),
  Template: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" /><path strokeLinecap="round" d="M4 9h16M9 9v11" />
    </svg>
  ),
  Palette: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <circle cx="8" cy="10" r="1.2" fill="currentColor" /><circle cx="12" cy="8" r="1.2" fill="currentColor" />
      <circle cx="16" cy="10" r="1.2" fill="currentColor" /><circle cx="14" cy="15" r="1.2" fill="currentColor" />
    </svg>
  ),
  Dropper: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 3l5 5-9.5 9.5-5.5 1 1-5.5L16 3z" />
    </svg>
  ),
  Square: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  ),
  XMark: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M9 9l6 6M15 9l-6 6" />
    </svg>
  ),
  Barcode: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M4 5v14M7 5v14M9.5 5v14M13 5v14M15.5 5v14M18 5v14M20 5v14" />
    </svg>
  ),
  QRCode: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <rect x="3" y="3" width="6" height="6" rx="0.5" /><rect x="15" y="3" width="6" height="6" rx="0.5" /><rect x="3" y="15" width="6" height="6" rx="0.5" />
      <rect x="15" y="15" width="2.2" height="2.2" fill="currentColor" /><rect x="18.8" y="18.8" width="2.2" height="2.2" fill="currentColor" /><rect x="15" y="18.8" width="2.2" height="2.2" fill="currentColor" />
    </svg>
  ),
  Grid: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" />
    </svg>
  ),
  Slash: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M6 6l12 12" />
    </svg>
  ),
  MagStripe: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <rect x="3" y="6" width="18" height="12" rx="2" /><path strokeLinecap="round" d="M3 10h18" strokeWidth={3} />
    </svg>
  ),
  Chip: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path strokeLinecap="round" d="M9 3v4M12 3v4M15 3v4M9 17v4M12 17v4M15 17v4M3 9h4M3 12h4M3 15h4M17 9h4M17 12h4M17 15h4" />
    </svg>
  ),
  Download: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3" />
    </svg>
  ),
  IdBadge: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="6" y="3" width="12" height="18" rx="2" /><circle cx="12" cy="10" r="2.5" /><path strokeLinecap="round" d="M8.5 16h7M9 3V2M15 3V2" />
    </svg>
  ),
  Portrait: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="6" y="3" width="12" height="18" rx="2" /><circle cx="12" cy="10" r="2.5" /><path strokeLinecap="round" d="M8.5 16h7" />
    </svg>
  ),
  Landscape: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="9" cy="12" r="2.2" /><path strokeLinecap="round" d="M13.5 12h5" />
    </svg>
  ),
};

// ── Field data ────────────────────────────────────────────────────────────
const CARD_CATEGORY_OPTIONS = [
  { id: "employee", label: "Employee\nID Card", icon: Icon.Person },
  { id: "visitor", label: "Visitor\nID Card", icon: Icon.Person },
  { id: "contractor", label: "Contractor\nID Card", icon: Icon.HardHat },
] as const;

const ORG_TYPE_OPTIONS = ["Corporate", "Educational Institute", "Government", "Healthcare", "Manufacturing", "Other"];
const PURPOSE_OPTIONS = ["Employee Identification", "Visitor Management", "Access Control", "Event / Conference"];
const QUANTITY_OPTIONS = ["100", "250", "500", "1000", "2500", "5000+"];
const DELIVERY_TIMELINE_OPTIONS = ["2 - 3 Days (Express)", "4 - 6 Days", "7 - 10 Days", "Flexible"];
const BUDGET_RANGE_OPTIONS = ["Under ₹5,000", "₹5,000 - ₹10,000", "₹10,000 - ₹25,000", "₹25,000+"];

const CARD_SIZE_OPTIONS = [
  { id: "cr80", label: "CR80", subtitle: "(86 x 54 mm)" },
  { id: "cr100", label: "CR100", subtitle: "(98 x 67 mm)" },
  { id: "custom", label: "Custom", subtitle: "(Enter Size)" },
] as const;

const ORIENTATION_OPTIONS = [
  { id: "portrait", label: "Portrait", icon: Icon.Portrait },
  { id: "landscape", label: "Landscape", icon: Icon.Landscape },
] as const;

const PRINTING_TYPE_OPTIONS = [
  { id: "single", label: "Single Side" },
  { id: "double", label: "Double Side" },
] as const;

const MATERIAL_TYPE_OPTIONS = [
  { id: "pvc", label: "PVC (Plastic)" },
  { id: "abs", label: "ABS" },
  { id: "polycarbonate", label: "Polycarbonate" },
] as const;

const DESIGN_STATUS_OPTIONS = [
  { id: "have-design", label: "Yes, I have\na design", icon: Icon.Folder, color: "text-gray-500" },
  { id: "need-help", label: "Need help\nwith design", icon: Icon.MagicWand, color: "text-purple-600" },
  { id: "no-design", label: "No design\nyet", icon: null, color: "text-gray-400" },
] as const;

const CARD_DESIGN_OPTIONS = [
  { id: "standard", label: "Standard\nTemplate", icon: Icon.Template },
  { id: "custom", label: "Custom Design", icon: Icon.Pencil },
  { id: "scratch", label: "Design from\nScratch", icon: Icon.Pencil },
] as const;

const COLOR_SCHEME_OPTIONS = [
  { id: "full-color", label: "Full Color", icon: Icon.Palette },
  { id: "single-color", label: "Single Color", icon: Icon.Dropper },
] as const;

const CARD_BACKGROUND_OPTIONS = [
  { id: "white", label: "White", icon: Icon.Square },
  { id: "custom", label: "Custom", icon: Icon.Pencil },
] as const;

const PHOTO_REQUIREMENT_OPTIONS = [
  { id: "with-photo", label: "With Photo", icon: Icon.Person },
  { id: "without-photo", label: "Without Photo", icon: Icon.Person },
] as const;

const DATA_PERSONALIZATION_OPTIONS = [
  { id: "yes", label: "Yes", icon: Icon.Person },
  { id: "no", label: "No", icon: Icon.XMark },
] as const;

const SECURITY_FEATURE_OPTIONS = [
  { id: "barcode", label: "Barcode", icon: Icon.Barcode },
  { id: "qr-code", label: "QR Code", icon: Icon.QRCode },
  { id: "both", label: "Both", icon: Icon.Grid },
  { id: "none", label: "None", icon: Icon.Slash },
] as const;

const ADDON_OPTIONS = [
  { id: "lanyard", label: "Lanyard Slot", icon: Icon.IdBadge },
  { id: "punch-hole", label: "Punch Hole", icon: Icon.Slash },
  { id: "magnetic-strip", label: "Magnetic Strip", icon: Icon.MagStripe },
  { id: "smart-chip", label: "Smart Chip", icon: Icon.Chip },
  { id: "hologram", label: "Hologram", icon: Icon.Shield },
] as const;

const STEPS = [
  { id: 1, label: "Requirements" },
  { id: 2, label: "Contact Details" },
  { id: 3, label: "Additional Info" },
  { id: 4, label: "Review & Submit" },
  { id: 5, label: "Inquiry Submitted" },
];

interface FormState {
  // Step 1 — Requirements
  cardCategory: string; orgType: string; purpose: string; quantity: string;
  cardSize: string; orientation: string; printingType: string; materialType: string;
  deliveryTimeline: string; budgetRange: string; designStatus: string;
  // Step 2 — Contact Details
  fullName: string; phone: string; email: string; companyName: string;
  designation: string; department: string; businessAddress: string;
  // Step 3 — Additional Info
  cardDesign: string; colorScheme: string; cardBackground: string;
  photoRequirement: string; dataPersonalization: string;
  securityFeatures: string[]; addOns: string[]; additionalRequirements: string;
}

const INITIAL_FORM: FormState = {
  cardCategory: "employee", orgType: "Corporate", purpose: "Employee Identification", quantity: "500",
  cardSize: "cr80", orientation: "portrait", printingType: "single", materialType: "pvc",
  deliveryTimeline: "7 - 10 Days", budgetRange: "₹5,000 - ₹10,000", designStatus: "need-help",
  fullName: "", phone: "", email: "", companyName: "", designation: "", department: "", businessAddress: "",
  cardDesign: "custom", colorScheme: "full-color", cardBackground: "white",
  photoRequirement: "with-photo", dataPersonalization: "yes",
  securityFeatures: ["barcode", "qr-code"], addOns: ["lanyard"], additionalRequirements: "",
};

function labelFor<T extends { id: string; label: string }>(options: readonly T[], id: string): string {
  return options.find((o) => o.id === id)?.label.replace("\n", " ") ?? id;
}
function labelsFor<T extends { id: string; label: string }>(options: readonly T[], ids: string[]): string {
  if (ids.length === 0) return "—";
  return ids.map((id) => options.find((o) => o.id === id)?.label ?? id).join(", ");
}

// ── Validation ────────────────────────────────────────────────────────────
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
        {icon && <span className="w-9 h-9 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0">{icon}</span>}
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
        <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0">{icon}</span>
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

// A card option — icon + label, checkmark badge when selected. Used for
// single-select groups (Card Category, Card Size, Orientation, etc.).
function OptionCard({ active, onClick, icon, label, subtitle }: {
  active: boolean; onClick: () => void; icon?: React.ComponentType<{ className?: string }> | null; label: string; subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left transition-all ${
        active ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      {icon ? (
        (() => { const IconComp = icon; return <IconComp className={`w-5 h-5 flex-shrink-0 ${active ? "text-purple-600" : "text-gray-500"}`} />; })()
      ) : (
        <span className="block w-5 h-5 flex-shrink-0 rounded border border-dashed border-gray-300" />
      )}
      <span className={`text-[12px] font-bold leading-snug whitespace-pre-line ${active ? "text-blue-700" : "text-gray-900"}`}>{label}</span>
      {subtitle && <span className="text-[10px] text-gray-400 ml-auto">{subtitle}</span>}
      {active && (
        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#0000FF] flex items-center justify-center">
          <Icon.Check className="w-2.5 h-2.5 text-white" />
        </span>
      )}
    </button>
  );
}

// Multi-select toggle version of OptionCard, used for Security Features and
// Add-ons — several of these can be active at once.
function ToggleCard({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon?: React.ComponentType<{ className?: string }>; label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center text-center gap-1.5 rounded-xl border px-3 py-3 transition-all ${
        active ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      {icon && (() => { const IconComp = icon; return <IconComp className={`w-5 h-5 ${active ? "text-purple-600" : "text-gray-500"}`} />; })()}
      <span className={`text-[11px] font-bold leading-tight ${active ? "text-blue-700" : "text-gray-900"}`}>{label}</span>
      {active && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#0000FF] flex items-center justify-center">
          <Icon.Check className="w-2.5 h-2.5 text-white" />
        </span>
      )}
    </button>
  );
}

export default function IdentityCardInquiryModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [inquiryId, setInquiryId] = useState("");
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleMulti = (key: "securityFeatures" | "addOns", id: string) => {
    setForm((prev) => {
      const list = prev[key];
      return { ...prev, [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] };
    });
  };

  // "Both" / "None" on Security Features are convenience shortcuts, not
  // regular multi-select members themselves.
  const toggleSecurity = (id: string) => {
    if (id === "both") { set("securityFeatures", ["barcode", "qr-code"]); return; }
    if (id === "none") { set("securityFeatures", []); return; }
    toggleMulti("securityFeatures", id);
  };

  const canGoNext = () =>
    step === 2
      ? !!(form.fullName.trim() && form.phone.trim() && form.email.trim() && form.companyName.trim() && form.businessAddress.trim() && !phoneError(form.phone) && !emailError(form.email))
      : true;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/web-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: "identity-card",
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          companyName: form.companyName,
          businessAddress: form.businessAddress,
          details: {
            cardCategory: form.cardCategory, orgType: form.orgType, purpose: form.purpose, quantity: form.quantity,
            cardSize: form.cardSize, orientation: form.orientation, printingType: form.printingType, materialType: form.materialType,
            deliveryTimeline: form.deliveryTimeline, budgetRange: form.budgetRange, designStatus: form.designStatus,
            designation: form.designation, department: form.department,
            cardDesign: form.cardDesign, colorScheme: form.colorScheme, cardBackground: form.cardBackground,
            photoRequirement: form.photoRequirement, dataPersonalization: form.dataPersonalization,
            securityFeatures: form.securityFeatures, addOns: form.addOns,
            additionalRequirements: form.additionalRequirements,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data?.error || "Could not submit your inquiry. Please try again.");
        return;
      }
      const id = data?.enquiry?.id;
      setInquiryId(id ? `IDQ-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${String(id).padStart(4, "0")}` : `IDQ-${Date.now()}`);
      setSubmittedAt(new Date());
      setSubmitted(true);
      setStep(5);
    } catch {
      setSubmitError("Network error — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepHeader: Record<number, { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }> = {
    1: { title: "Let's understand your requirements", subtitle: "Tell us what you need so we can serve you better.", icon: Icon.Clipboard },
    2: { title: "Your contact details", subtitle: "Please provide your contact details so we can reach you.", icon: Icon.IdBadge },
    3: { title: "Additional information", subtitle: "Tell us your preferences and requirements.", icon: Icon.Sliders },
    4: { title: "Review your details", subtitle: "Please review all the information below before submitting your inquiry.", icon: Icon.Clipboard },
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
        <div className="hidden sm:flex sm:w-[280px] flex-shrink-0 flex-col bg-[#f7f7f8] p-6 border-r border-gray-200 overflow-y-auto">
          <span className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mb-4">
            <Icon.Chat className="w-5 h-5" />
          </span>
          <span className="text-lg font-bold text-gray-900 leading-tight">
            Inquiry for<br /><span className="text-black">ID Card</span>
          </span>
          <p className="text-[12px] text-gray-500 mt-2 leading-relaxed">
            {submitted
              ? "Thank you! We've received your inquiry and our team will get back to you with the best solution."
              : "Share your requirements and we'll provide the best solution."}
          </p>

          <div className="relative w-full aspect-[4/3] mt-5 rounded-xl overflow-hidden bg-white border border-gray-200">
            <Image src="/identy-card-before.webp" alt="ID card sample" fill className="object-contain" />
          </div>

          <div className="mt-6 space-y-4">
            {[
              { title: "Premium Quality Printing", desc: "Best materials & vibrant colors", icon: Icon.Shield },
              { title: "Custom Design Support", desc: "Professional design assistance", icon: Icon.Pencil },
              { title: "On-time Delivery", desc: "Timely delivery assured", icon: Icon.Truck },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
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
                <span className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
                  <Icon.Headset className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[12px] font-bold text-gray-900 block">Need Help?</span>
                  <span className="text-[11px] text-gray-500 block leading-snug">Our experts are here to help you choose the perfect solution.</span>
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
          {/* Stepper — 5 steps, "Inquiry Submitted" only becomes reachable once submitted */}
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
              <div className="py-2">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                    <span className="absolute inset-0 rounded-full bg-green-50" />
                    <span className="absolute -top-1 left-3 w-1.5 h-1.5 rounded-full bg-purple-300" />
                    <span className="absolute top-2 right-1 w-1 h-1 rounded-full bg-amber-300" />
                    <span className="absolute bottom-0 left-0 w-1.5 h-1.5 rounded-full bg-blue-300" />
                    <span className="absolute -bottom-1 right-3 w-1 h-1 rounded-full bg-green-300" />
                    <span className="relative w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <Icon.Check className="w-7 h-7" />
                    </span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Inquiry Submitted Successfully!</span>
                  <p className="text-sm text-gray-500 mt-2 max-w-md">
                    Thank you for reaching out to us. Our team has received your inquiry and will get back to you within 24 hours.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 w-full max-w-lg">
                    <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 px-3.5 py-3">
                      <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <Icon.IdBadge className="w-4 h-4" />
                      </span>
                      <div className="text-left">
                        <span className="text-[10px] text-gray-400 block">Inquiry ID</span>
                        <span className="text-[13px] font-bold text-gray-900 block">{inquiryId}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 px-3.5 py-3">
                      <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <Icon.Calendar className="w-4 h-4" />
                      </span>
                      <div className="text-left">
                        <span className="text-[10px] text-gray-400 block">Submitted On</span>
                        <span className="text-[13px] font-bold text-gray-900 block">
                          {submittedAt?.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} | {submittedAt?.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inquiry Summary */}
                <div className="rounded-xl border border-gray-200 p-4 mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-bold text-gray-900">Inquiry Summary</span>
                    <button type="button" className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:underline">
                      <Icon.Download className="w-3.5 h-3.5" />
                      Download Summary
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-4">
                    <div className="space-y-2.5 text-[12px]">
                      {[["ID Card Type", labelFor(CARD_CATEGORY_OPTIONS, form.cardCategory)], ["Quantity", form.quantity], ["Card Size", labelFor(CARD_SIZE_OPTIONS, form.cardSize)]].map(([l, v]) => (
                        <div key={l}><span className="text-gray-500 block">{l}</span><span className="font-semibold text-gray-900">{v}</span></div>
                      ))}
                    </div>
                    <div className="space-y-2.5 text-[12px]">
                      {[["Printing Type", labelFor(PRINTING_TYPE_OPTIONS, form.printingType)], ["Material", labelFor(MATERIAL_TYPE_OPTIONS, form.materialType)], ["Delivery Timeline", form.deliveryTimeline]].map(([l, v]) => (
                        <div key={l}><span className="text-gray-500 block">{l}</span><span className="font-semibold text-gray-900">{v}</span></div>
                      ))}
                    </div>
                    <div className="space-y-2.5 text-[12px]">
                      {[["Design", labelFor(DESIGN_STATUS_OPTIONS, form.designStatus)], ["Security Features", labelsFor(SECURITY_FEATURE_OPTIONS, form.securityFeatures)], ["Add-ons", labelsFor(ADDON_OPTIONS, form.addOns)]].map(([l, v]) => (
                        <div key={l}><span className="text-gray-500 block">{l}</span><span className="font-semibold text-gray-900">{v}</span></div>
                      ))}
                    </div>
                    <div className="relative w-full sm:w-32 aspect-[3/4] rounded-lg overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0">
                      <Image src="/identy-card-before.webp" alt="ID card preview" fill className="object-contain p-1.5" />
                    </div>
                  </div>
                </div>

                {/* What happens next — 4 items on the success screen */}
                <span className="text-[13px] font-bold text-gray-900 block mb-3">What happens next?</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { title: "We'll review your inquiry", desc: "Our team will check your requirements.", icon: Icon.Headset },
                    { title: "Get a custom quote", desc: "You'll receive the best quote within 24 hours.", icon: Icon.Clipboard },
                    { title: "We'll connect with you", desc: "Our experts will reach out to discuss further.", icon: Icon.Chat },
                    { title: "Your order, our priority", desc: "Once confirmed, we ensure quality & on-time delivery.", icon: Icon.Check, done: true },
                  ].map((item) => (
                    <div key={item.title} className="text-center">
                      <span className={`w-11 h-11 rounded-full mx-auto flex items-center justify-center mb-2 ${item.done ? "bg-green-100 text-green-600" : "bg-purple-50 text-purple-600"}`}>
                        <item.icon className="w-5 h-5" />
                      </span>
                      <span className="text-[11px] font-bold text-gray-900 block leading-tight">{item.title}</span>
                      <span className="text-[10px] text-gray-500 block mt-0.5 leading-snug">{item.desc}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <button type="button" onClick={onClose} className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100">
                    ← Back to Home
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-sm font-bold"
                  >
                    Done
                    <Icon.Check className="w-4 h-4" />
                  </button>
                </div>
                {form.email && (
                  <p className="flex items-center gap-1.5 justify-center text-[11px] text-gray-400 mt-4">
                    <Icon.Envelope className="w-3.5 h-3.5" />
                    A confirmation email has been sent to <span className="font-semibold underline">{form.email}</span> with all the details.
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 mb-5">
                  <span className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <header.icon className="w-4.5 h-4.5" />
                  </span>
                  <div>
                    <span className="text-base font-bold text-gray-900 block">{header.title}</span>
                    <span className="text-[12px] text-gray-500 block mt-0.5">{header.subtitle}</span>
                  </div>
                </div>

                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <span className="text-[13px] font-semibold text-gray-800 mb-3 block">ID Card Category / Type <span className="text-red-500">*</span></span>
                      <div className="grid grid-cols-3 gap-3">
                        {CARD_CATEGORY_OPTIONS.map((c) => (
                          <OptionCard key={c.id} active={form.cardCategory === c.id} onClick={() => set("cardCategory", c.id)} icon={c.icon} label={c.label} />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field label="Organization Type / Sector" required icon={<Icon.Building className="w-4 h-4" />}>
                        <SelectField value={form.orgType} onChange={(v) => set("orgType", v)} options={ORG_TYPE_OPTIONS} />
                      </Field>
                      <Field label="Purpose of ID Card" required icon={<Icon.Person className="w-4 h-4" />}>
                        <SelectField value={form.purpose} onChange={(v) => set("purpose", v)} options={PURPOSE_OPTIONS} />
                      </Field>
                      <Field label="Card Quantity" required icon={<Icon.Boxes className="w-4 h-4" />}>
                        <SelectField value={form.quantity} onChange={(v) => set("quantity", v)} options={QUANTITY_OPTIONS} />
                      </Field>
                    </div>

                    <div>
                      <span className="text-[13px] font-semibold text-gray-800 mb-3 block">Card Size <span className="text-red-500">*</span></span>
                      <div className="grid grid-cols-3 gap-3">
                        {CARD_SIZE_OPTIONS.map((s) => (
                          <OptionCard key={s.id} active={form.cardSize === s.id} onClick={() => set("cardSize", s.id)} label={s.label} subtitle={s.subtitle} />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[13px] font-semibold text-gray-800 mb-3 block">Card Orientation <span className="text-red-500">*</span></span>
                        <div className="grid grid-cols-2 gap-3">
                          {ORIENTATION_OPTIONS.map((o) => (
                            <OptionCard key={o.id} active={form.orientation === o.id} onClick={() => set("orientation", o.id)} icon={o.icon} label={o.label} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[13px] font-semibold text-gray-800 mb-3 block">Printing Type <span className="text-red-500">*</span></span>
                        <div className="grid grid-cols-2 gap-3">
                          {PRINTING_TYPE_OPTIONS.map((p) => (
                            <OptionCard key={p.id} active={form.printingType === p.id} onClick={() => set("printingType", p.id)} icon={Icon.Printer} label={p.label} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[13px] font-semibold text-gray-800 mb-3 block">Material Type <span className="text-red-500">*</span></span>
                      <div className="grid grid-cols-3 gap-3">
                        {MATERIAL_TYPE_OPTIONS.map((m) => (
                          <OptionCard key={m.id} active={form.materialType === m.id} onClick={() => set("materialType", m.id)} label={m.label} />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Delivery Timeline" required icon={<Icon.Truck className="w-4 h-4" />}>
                        <SelectField value={form.deliveryTimeline} onChange={(v) => set("deliveryTimeline", v)} options={DELIVERY_TIMELINE_OPTIONS} />
                      </Field>
                      <Field label="Budget Range (Optional)" icon={<Icon.Rupee className="w-4 h-4" />}>
                        <SelectField value={form.budgetRange} onChange={(v) => set("budgetRange", v)} options={BUDGET_RANGE_OPTIONS} />
                      </Field>
                    </div>

                    <div>
                      <span className="text-[13px] font-semibold text-gray-800 mb-3 block">Do you have a Design?</span>
                      <div className="grid grid-cols-3 gap-3">
                        {DESIGN_STATUS_OPTIONS.map((d) => (
                          <OptionCard key={d.id} active={form.designStatus === d.id} onClick={() => set("designStatus", d.id)} icon={d.icon} label={d.label} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Full Name" required icon={null}>
                        <TextField icon={<Icon.Person className="w-4 h-4" />} value={form.fullName} onChange={(v) => set("fullName", v)} placeholder="Enter your full name" />
                      </Field>
                      <Field label="Phone Number" required icon={null}>
                        <TextField icon={<Icon.Phone className="w-4 h-4" />} type="tel" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+91 98765 43210" error={phoneError(form.phone)} />
                      </Field>
                      <Field label="Email Address" required icon={null}>
                        <TextField icon={<Icon.Envelope className="w-4 h-4" />} type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="youremail@email.com" error={emailError(form.email)} />
                      </Field>
                      <Field label="Company / Organization Name" required icon={null}>
                        <TextField icon={<Icon.Building className="w-4 h-4" />} value={form.companyName} onChange={(v) => set("companyName", v)} placeholder="Enter company name" />
                      </Field>
                      <Field label="Designation" icon={null}>
                        <TextField icon={<Icon.Briefcase className="w-4 h-4" />} value={form.designation} onChange={(v) => set("designation", v)} placeholder="e.g. HR Manager" />
                      </Field>
                      <Field label="Department" icon={null}>
                        <TextField icon={<Icon.Users className="w-4 h-4" />} value={form.department} onChange={(v) => set("department", v)} placeholder="e.g. Human Resources" />
                      </Field>
                    </div>
                    <Field label="Business / Office Address" required icon={null}>
                      <div className="flex items-start gap-2.5">
                        <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon.Pin className="w-4 h-4" />
                        </span>
                        <textarea
                          value={form.businessAddress}
                          onChange={(e) => set("businessAddress", e.target.value)}
                          rows={2}
                          placeholder="Enter your complete address"
                          className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black resize-none placeholder:text-gray-400"
                        />
                      </div>
                    </Field>

                    <div className="flex items-center gap-3 rounded-xl bg-purple-50/40 border border-gray-200 p-4">
                      <span className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <Icon.Phone className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="text-[12px] font-bold text-gray-900 block">We&apos;ll use these details to</span>
                        <span className="text-[11px] text-gray-500 block">understand your needs better and get back to you with the best solution.</span>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <span className="text-[13px] font-semibold text-gray-800 mb-3 block">Card Design</span>
                        <div className="grid grid-cols-3 gap-2.5">
                          {CARD_DESIGN_OPTIONS.map((c) => (
                            <ToggleCard key={c.id} active={form.cardDesign === c.id} onClick={() => set("cardDesign", c.id)} icon={c.icon} label={c.label} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[13px] font-semibold text-gray-800 mb-3 block">Color Scheme</span>
                        <div className="grid grid-cols-2 gap-2.5">
                          {COLOR_SCHEME_OPTIONS.map((c) => (
                            <ToggleCard key={c.id} active={form.colorScheme === c.id} onClick={() => set("colorScheme", c.id)} icon={c.icon} label={c.label} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <span className="text-[13px] font-semibold text-gray-800 mb-3 block">Card Background</span>
                        <div className="grid grid-cols-2 gap-2.5">
                          {CARD_BACKGROUND_OPTIONS.map((c) => (
                            <ToggleCard key={c.id} active={form.cardBackground === c.id} onClick={() => set("cardBackground", c.id)} icon={c.icon} label={c.label} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[13px] font-semibold text-gray-800 mb-3 block">Photo Requirement</span>
                        <div className="grid grid-cols-2 gap-2.5">
                          {PHOTO_REQUIREMENT_OPTIONS.map((c) => (
                            <ToggleCard key={c.id} active={form.photoRequirement === c.id} onClick={() => set("photoRequirement", c.id)} icon={c.icon} label={c.label} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <span className="text-[13px] font-semibold text-gray-800 mb-3 block">Data Personalization</span>
                        <div className="grid grid-cols-2 gap-2.5">
                          {DATA_PERSONALIZATION_OPTIONS.map((c) => (
                            <ToggleCard key={c.id} active={form.dataPersonalization === c.id} onClick={() => set("dataPersonalization", c.id)} icon={c.icon} label={c.label} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-800 mb-3">
                          Security Features
                          <Icon.Info className="w-3.5 h-3.5 text-gray-400" />
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          {SECURITY_FEATURE_OPTIONS.map((s) => {
                            const active = s.id === "both"
                              ? form.securityFeatures.includes("barcode") && form.securityFeatures.includes("qr-code")
                              : s.id === "none"
                              ? form.securityFeatures.length === 0
                              : form.securityFeatures.includes(s.id);
                            return <ToggleCard key={s.id} active={active} onClick={() => toggleSecurity(s.id)} icon={s.icon} label={s.label} />;
                          })}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[13px] font-semibold text-gray-800 mb-3 block">Add-ons (Optional)</span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {ADDON_OPTIONS.map((a) => (
                          <ToggleCard key={a.id} active={form.addOns.includes(a.id)} onClick={() => toggleMulti("addOns", a.id)} icon={a.icon} label={a.label} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[13px] font-semibold text-gray-800 mb-1.5 block">Additional Requirements (Optional)</label>
                      <textarea
                        value={form.additionalRequirements}
                        onChange={(e) => set("additionalRequirements", e.target.value)}
                        maxLength={500}
                        rows={3}
                        placeholder="Write any specific requirements like logo placement, font, barcode data, numbering, special instructions, etc."
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black resize-none placeholder:text-gray-400"
                      />
                      <span className="text-[11px] text-gray-400 block text-right mt-1">{form.additionalRequirements.length} / 500</span>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-purple-50/40 border border-gray-200 px-3.5 py-2.5">
                      <Icon.Info className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span className="text-[11px] text-gray-500">Don&apos;t worry, you can review and confirm all details in the next step.</span>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        {
                          key: "req", title: "1. Requirements", onEdit: () => setStep(1),
                          rows: [
                            ["ID Card Category / Type", labelFor(CARD_CATEGORY_OPTIONS, form.cardCategory)], ["Organization Type / Sector", form.orgType],
                            ["Purpose of ID Card", form.purpose], ["Card Quantity", form.quantity], ["Card Size", labelFor(CARD_SIZE_OPTIONS, form.cardSize)],
                            ["Card Orientation", labelFor(ORIENTATION_OPTIONS, form.orientation)], ["Printing Type", labelFor(PRINTING_TYPE_OPTIONS, form.printingType)],
                            ["Material Type", labelFor(MATERIAL_TYPE_OPTIONS, form.materialType)], ["Delivery Timeline", form.deliveryTimeline],
                            ["Budget Range", form.budgetRange], ["Design", labelFor(DESIGN_STATUS_OPTIONS, form.designStatus)],
                          ],
                        },
                        {
                          key: "contact", title: "2. Contact Details", onEdit: () => setStep(2),
                          rows: [
                            ["Full Name", form.fullName || "—"], ["Phone Number", form.phone || "—"], ["Email Address", form.email || "—"],
                            ["Company / Organization", form.companyName || "—"], ["Designation", form.designation || "—"],
                            ["Department", form.department || "—"], ["Business Address", form.businessAddress || "—"],
                          ],
                        },
                        {
                          key: "info", title: "3. Additional Information", onEdit: () => setStep(3),
                          rows: [
                            ["Card Design", labelFor(CARD_DESIGN_OPTIONS, form.cardDesign)], ["Color Scheme", labelFor(COLOR_SCHEME_OPTIONS, form.colorScheme)],
                            ["Card Background", labelFor(CARD_BACKGROUND_OPTIONS, form.cardBackground)], ["Photo Requirement", labelFor(PHOTO_REQUIREMENT_OPTIONS, form.photoRequirement)],
                            ["Data Personalization", labelFor(DATA_PERSONALIZATION_OPTIONS, form.dataPersonalization)],
                            ["Security Features", labelsFor(SECURITY_FEATURE_OPTIONS.filter((s) => s.id !== "both" && s.id !== "none"), form.securityFeatures)],
                            ["Add-ons", labelsFor(ADDON_OPTIONS, form.addOns)], ["Additional Requirements", form.additionalRequirements || "—"],
                          ],
                        },
                      ].map((card) => (
                        <div key={card.key} className="rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100">
                            <span className="text-[12px] font-bold text-gray-900">{card.title}</span>
                            <button type="button" onClick={card.onEdit} className="text-[11px] font-semibold text-purple-600 hover:underline">Edit</button>
                          </div>
                          <div className="px-3.5 py-3 space-y-1.5 text-[12px] flex-1">
                            {card.rows.map(([label, value]) => (
                              <div key={label} className="flex items-start justify-between gap-2">
                                <span className="text-gray-500 flex-shrink-0">{label}</span>
                                <span className="font-semibold text-gray-900 text-right">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-gray-200 p-4">
                        <span className="text-[13px] font-bold text-gray-900 block mb-3">ID Card Preview (Sample)</span>
                        <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
                          <Image src="/identy-card-before.webp" alt="ID card preview" fill className="object-contain p-3" />
                        </div>
                        <p className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-2">
                          <Icon.Info className="w-3 h-3 flex-shrink-0" />
                          This is just a preview. Final design may vary based on your requirements.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-xl bg-purple-50/40 border border-gray-200 p-4">
                          <span className="text-[13px] font-bold text-gray-900 block mb-1.5">What happens next?</span>
                          <p className="text-[11px] text-gray-500 mb-3">Our team will review your inquiry and get back to you with the best options and a competitive quote within 24 hours.</p>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { title: "Quick Response", desc: "Within 24 Hours", icon: Icon.Clock },
                              { title: "Best Price", desc: "Guaranteed", icon: Icon.Tag },
                              { title: "100% Satisfaction", desc: "Assured", icon: Icon.Smile },
                            ].map((item) => (
                              <div key={item.title} className="text-center bg-white rounded-lg px-2 py-2.5 border border-gray-100">
                                <item.icon className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                                <span className="text-[10px] font-bold text-gray-900 block leading-tight">{item.title}</span>
                                <span className="text-[9px] text-gray-500 block">{item.desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-xl bg-purple-50/40 border border-gray-200 p-3.5">
                          <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                            <Icon.Shield className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="text-[12px] font-bold text-gray-900 block">Your information is secure</span>
                            <span className="text-[10px] text-gray-500 block">We value your privacy. Your information will only be used for this inquiry.</span>
                          </div>
                        </div>
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
                  <button type="button" onClick={onClose} className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100">
                    <Icon.Save className="w-4 h-4" />
                    Save &amp; Exit
                  </button>
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
                    Save &amp; Continue
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
              {step === 4 && (
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Icon.Lock className="w-3 h-3" />
                  By submitting, you agree to our <span className="underline">Terms &amp; Privacy Policy</span>.
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}