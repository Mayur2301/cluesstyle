// PATH: app/components/TrophyInquiryModal.tsx
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
  Clock: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Bell: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  Copy: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25" />
    </svg>
  ),
  Download: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3" />
    </svg>
  ),
  WhatsApp: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l1.65-4.95A8.25 8.25 0 1112 20.25a8.29 8.29 0 01-4.95-1.65L3 21z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.5c0 3 2.5 5.5 5.5 5.5.5 0 .8-.5.6-1l-.6-1.3c-.1-.3-.5-.4-.8-.2l-.6.4c-.8-.5-1.5-1.2-2-2l.4-.6c.2-.3.1-.7-.2-.8L10 9c-.5-.2-1 .1-1 .5z" />
    </svg>
  ),
  Grid: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" />
    </svg>
  ),
  TextIcon: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16M12 5v14" />
    </svg>
  ),
  Upload: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 8.25L12 3.75m0 0L7.5 8.25M12 3.75v12" />
    </svg>
  ),
  Slash: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M6 6l12 12" />
    </svg>
  ),
  Image: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5-9 9" />
    </svg>
  ),
  Box: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-4.5-9 4.5m18 0l-9 4.5m9-4.5v9l-9 4.5M3 7.5l9 4.5M3 7.5v9l9 4.5m0-9v9" />
    </svg>
  ),
  Gift: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v13.5m0-13.5a2.625 2.625 0 10-2.625-2.625A2.625 2.625 0 0012 8.25zm0 0a2.625 2.625 0 112.625-2.625A2.625 2.625 0 0112 8.25zM4.5 10.5h15v3.75a1.5 1.5 0 01-1.5 1.5h-12a1.5 1.5 0 01-1.5-1.5V10.5zM4.5 10.5h15v-2.25a1.5 1.5 0 00-1.5-1.5h-12a1.5 1.5 0 00-1.5 1.5v2.25z" />
    </svg>
  ),
  Bulb: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.4.3.5.7.5 1.1v.5h6v-.5c0-.4.1-.8.5-1.1A6 6 0 0012 3z" />
    </svg>
  ),
  Ribbon: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 11l-2 9 5-3 5 3-2-9" />
    </svg>
  ),
  Dots: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" /><circle cx="8.5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="15.5" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  Book: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  Gear: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  Trophy: (p: { className?: string }) => (
    <svg className={p.className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8v4a4 4 0 01-8 0V4zM6 6H4a2 2 0 002 4M18 6h2a2 2 0 01-2 4M10 12v3h4v-3M8 19h8M10 15h4v4h-4v-4z" />
    </svg>
  ),
};

// ── Field data ────────────────────────────────────────────────────────────
// Trophy Type / Category and Material use real trophy photos, not icons —
// placeholder paths below, same convention used elsewhere in this project.
const TROPHY_TYPE_OPTIONS = [
  { id: "achievement", label: "Achievement\nTrophy", image: "/trophies/achievement-trophy.webp" },
  { id: "corporate", label: "Corporate\nTrophy", image: "/trophies/corporate-trophy.webp" },
  { id: "sports", label: "Sports\nTrophy", image: "/trophies/sports-trophy.webp" },
  { id: "award-memento", label: "Award / Memento\n(Desk)", image: "/trophies/award-memento-desk.webp" },
] as const;

const MATERIAL_OPTIONS = [
  { id: "metal", label: "Metal", image: "/trophies/metal.webp" },
  { id: "wood", label: "Wood", image: "/trophies/wood.webp" },
  { id: "acrylic", label: "Acrylic", image: "/trophies/acrylic.webp" },
  { id: "resin", label: "Resin", image: "/trophies/resin.webp" },
  { id: "crystal", label: "Glass / Crystal", image: "/trophies/glass-crystal.webp" },
  { id: "combination", label: "Combination", image: "/trophies/combination.webp" },
] as const;

const SIZE_OPTIONS = [
  { id: "small", label: "Small", subtitle: "(6 - 8 inch)" },
  { id: "medium", label: "Medium", subtitle: "(9 - 12 inch)" },
  { id: "large", label: "Large", subtitle: "(13 - 18 inch)" },
  { id: "extra-large", label: "Extra Large", subtitle: "(19 inch & above)" },
  { id: "custom", label: "Custom", subtitle: "(Enter Size)" },
] as const;

// Shape / Style is a set of abstract geometric shapes rather than full
// product photos, so simple icon glyphs make more sense here.
const SHAPE_OPTIONS = [
  { id: "cup", label: "Cup", icon: Icon.Trophy },
  { id: "star", label: "Star", icon: Icon.Ribbon },
  { id: "shield", label: "Shield", icon: Icon.Shield },
  { id: "column", label: "Column", icon: Icon.Box },
  { id: "flame", label: "Flame", icon: Icon.Bulb },
  { id: "custom", label: "Custom", icon: null },
] as const;

const PURPOSE_OPTIONS = ["Employee Recognition", "Sports / Competition", "Academic Excellence", "Corporate Event", "Retirement / Farewell"];
const INDUSTRY_OPTIONS = ["Corporate", "Educational Institute", "Sports Club", "Government", "Other"];
const QUANTITY_OPTIONS = ["1 - 10 Pieces", "10 - 50 Pieces", "50 - 100 Pieces", "100 - 500 Pieces", "500+ Pieces"];
const COLOR_FINISH_OPTIONS = ["Gold & Black", "Silver & Black", "Gold Only", "Silver Only", "Bronze"];
const DELIVERY_TIMELINE_OPTIONS = ["2 - 3 Days (Express)", "4 - 6 Days", "7 - 10 Days", "Flexible"];

const PERSONALIZATION_OPTIONS = [
  { id: "yes", label: "Yes, I need\ncustomization", icon: Icon.Pencil },
  { id: "no", label: "No, standard\ndesign", icon: Icon.Grid },
] as const;

const ADDON_OPTIONS = [
  { id: "led-light", label: "LED Light Base", icon: Icon.Bulb },
  { id: "metal-plate", label: "Metal Plate", icon: Icon.Grid },
  { id: "gift-box", label: "Gift Box Packing", icon: Icon.Box },
  { id: "ribbons", label: "Ribbons", icon: Icon.Ribbon },
  { id: "other", label: "Other (Specify)", icon: Icon.Dots },
] as const;

const ENGRAVING_OPTIONS = [
  { id: "yes", label: "Yes, I need text / engraving", desc: "Add names, titles, event details or any custom text.", icon: Icon.TextIcon },
  { id: "no", label: "No text / engraving", desc: "I don't need any text on the trophy.", icon: Icon.Slash },
  { id: "not-sure", label: "Not sure", desc: "I'll decide later, please suggest.", icon: Icon.Pencil },
] as const;

const LOGO_OPTIONS = [
  { id: "yes", label: "Yes, I have logo / artwork", desc: "Upload your logo or artwork in next step.", icon: Icon.Upload },
  { id: "no", label: "No logo", desc: "I don't want to add any logo.", icon: Icon.Slash },
  { id: "need-help", label: "Need design help", desc: "I need a custom logo / design support from your team.", icon: Icon.Image },
] as const;

const PACKAGING_OPTIONS = [
  { id: "standard", label: "Standard", desc: "Safe packing", icon: Icon.Box },
  { id: "premium-box", label: "Premium Box", desc: "Premium look", icon: Icon.Gift },
  { id: "gift-wrap", label: "Gift Wrap", desc: "For gifting", icon: Icon.Gift },
  { id: "not-required", label: "Not Required", desc: "No special packing", icon: Icon.Slash },
] as const;

const STEPS = [
  { id: 1, label: "Requirements" },
  { id: 2, label: "Contact Details" },
  { id: 3, label: "Additional Info" },
  { id: 4, label: "Review & Submit" },
  { id: 5, label: "Inquiry Submitted" },
];

interface FormState {
  // Step 1
  trophyType: string; purpose: string; industry: string; material: string;
  size: string; quantity: string; shape: string; colorFinish: string;
  personalization: string; customizationDetails: string; addOns: string[]; deliveryTimeline: string;
  // Step 2
  fullName: string; designation: string; phone: string; altPhone: string;
  email: string; preferredContact: string; companyName: string; address: string;
  gstNumber: string; city: string; state: string;
  // Step 3
  engravingText: string; logoArtwork: string; packaging: string; otherRequirements: string;
}

const INITIAL_FORM: FormState = {
  trophyType: "achievement", purpose: "Employee Recognition", industry: "Corporate", material: "wood",
  size: "medium", quantity: "50 - 100 Pieces", shape: "cup", colorFinish: "Gold & Black",
  personalization: "yes", customizationDetails: "", addOns: ["metal-plate"], deliveryTimeline: "7 - 10 Days",
  fullName: "", designation: "", phone: "", altPhone: "", email: "", preferredContact: "WhatsApp",
  companyName: "", address: "", gstNumber: "", city: "", state: "",
  engravingText: "yes", logoArtwork: "yes", packaging: "standard", otherRequirements: "",
};

function labelFor<T extends { id: string; label: string }>(options: readonly T[], id: string): string {
  return options.find((o) => o.id === id)?.label.replace("\n", " ") ?? id;
}
function labelsFor<T extends { id: string; label: string }>(options: readonly T[], ids: string[]): string {
  if (ids.length === 0) return "—";
  return ids.map((id) => options.find((o) => o.id === id)?.label ?? id).join(", ");
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

// Image-based option card — for Trophy Type/Category and Material, which
// use real product photos instead of icon glyphs.
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
      <span className={`text-[11px] font-bold leading-tight whitespace-pre-line ${active ? "text-blue-700" : "text-gray-900"}`}>{label}</span>
      {active && (
        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#0000FF] flex items-center justify-center">
          <Icon.Check className="w-2.5 h-2.5 text-white" />
        </span>
      )}
    </button>
  );
}

// Icon-based option card — for everything else (Size, Shape, Personalization, Add-ons, etc.)
function OptionCard({ active, onClick, icon, label, subtitle }: {
  active: boolean; onClick: () => void; icon?: React.ComponentType<{ className?: string }> | null; label: string; subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center text-center gap-1.5 rounded-xl border px-3 py-3.5 transition-all ${
        active ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      {icon ? (
        (() => { const IconComp = icon; return <IconComp className={`w-6 h-6 ${active ? "text-purple-600" : "text-gray-500"}`} />; })()
      ) : (
        <span className="block w-6 h-6 rounded border border-dashed border-gray-300" />
      )}
      <span className={`text-[11px] font-bold leading-tight ${active ? "text-blue-700" : "text-gray-900"}`}>{label}</span>
      {subtitle && <span className="text-[9px] text-gray-400">{subtitle}</span>}
      {active && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#0000FF] flex items-center justify-center">
          <Icon.Check className="w-2.5 h-2.5 text-white" />
        </span>
      )}
    </button>
  );
}

// Wide horizontal card — icon left, title + description right. Used for
// Engraving/Logo/Packaging choices, matching the reference's wider layout.
function WideOptionCard({ active, onClick, icon, label, desc }: {
  active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string; desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
        active ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${active ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500"}`}>
        {(() => { const IconComp = icon; return <IconComp className="w-4.5 h-4.5" />; })()}
      </span>
      <div className="min-w-0">
        <span className={`text-[12px] font-bold block leading-snug ${active ? "text-blue-700" : "text-gray-900"}`}>{label}</span>
        <span className="text-[10px] text-gray-500 block mt-0.5 leading-snug">{desc}</span>
      </div>
      {active && (
        <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#0000FF] flex items-center justify-center">
          <Icon.Check className="w-2.5 h-2.5 text-white" />
        </span>
      )}
    </button>
  );
}

export default function TrophyInquiryModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [inquiryId, setInquiryId] = useState("");
  const [copied, setCopied] = useState(false);
  const [refImageName, setRefImageName] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleAddon = (id: string) => {
    setForm((prev) => ({
      ...prev,
      addOns: prev.addOns.includes(id) ? prev.addOns.filter((x) => x !== id) : [...prev.addOns, id],
    }));
  };

  const canGoNext = () =>
    step === 2
      ? !!(form.fullName.trim() && form.phone.trim() && form.email.trim() && form.companyName.trim() && form.address.trim() && form.city.trim() && form.state.trim() && form.preferredContact.trim() && !phoneError(form.phone) && !emailError(form.email))
      : true;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/web-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: "trophy",
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          companyName: form.companyName,
          businessAddress: form.address,
          details: {
            trophyType: form.trophyType, purpose: form.purpose, industry: form.industry, material: form.material,
            size: form.size, quantity: form.quantity, shape: form.shape, colorFinish: form.colorFinish,
            personalization: form.personalization, customizationDetails: form.customizationDetails,
            addOns: form.addOns, deliveryTimeline: form.deliveryTimeline,
            designation: form.designation, altPhone: form.altPhone, preferredContact: form.preferredContact,
            gstNumber: form.gstNumber, city: form.city, state: form.state,
            engravingText: form.engravingText, logoArtwork: form.logoArtwork, packaging: form.packaging,
            otherRequirements: form.otherRequirements, referenceImageName: refImageName,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data?.error || "Could not submit your inquiry. Please try again.");
        return;
      }
      const id = data?.enquiry?.id;
      setInquiryId(id ? `TRO-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${String(id).padStart(4, "0")}` : `TRO-${Date.now()}`);
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
    1: { title: "Let's understand your requirements", subtitle: "Tell us about the trophy you need.", icon: Icon.Trophy },
    2: { title: "Tell us your contact details", subtitle: "We'll use this information to get in touch with you regarding your inquiry.", icon: Icon.Person },
    3: { title: "Additional Information", subtitle: "Help us understand your requirements better.", icon: Icon.Clipboard },
    4: { title: "Review Your Inquiry", subtitle: "Please review all details before submitting your inquiry.", icon: Icon.ClipboardCheck },
  };
  const header = stepHeader[step];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row">
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
          <span className="w-10 h-10 rounded-xl bg-[#0000FF] text-white flex items-center justify-center mb-4">
            <Icon.Chat className="w-5 h-5" />
          </span>
          <span className="text-lg font-bold text-gray-900 leading-tight">
            Inquiry for<br /><span className="text-black">Trophy</span>
          </span>
          <span className="text-[12px] text-gray-500 mt-2 leading-relaxed">
            {submitted
              ? "Your inquiry has been submitted successfully. Our team will get back to you shortly."
              : "Share your requirements and we'll provide the best solution."}
          </span>

          <div className="relative w-full aspect-[4/3] mt-5 rounded-xl overflow-hidden bg-white border border-gray-200">
            <Image src="/trophy-after.webp" alt="Trophy collection" fill className="object-contain p-2" />
          </div>

          <div className="mt-6 space-y-4">
            {[
              { title: "Premium Quality", desc: "Finest materials & perfect finish", icon: Icon.Shield },
              { title: "Custom Design Support", desc: "Expert design assistance for your idea", icon: Icon.Pencil },
              { title: "On-time Delivery", desc: "Timely delivery, always assured", icon: Icon.Truck },
              { title: "Best Value", desc: "Competitive pricing with best quality", icon: Icon.Ribbon },
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
                  <span className="text-[11px] text-gray-500 block leading-snug">Our experts are here to help you choose the perfect trophy.</span>
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
              <div className="py-2">
                {/* Success banner */}
                <div className="relative rounded-xl bg-purple-50/40 border border-gray-200 p-5 mb-5 overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <span className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                      <Icon.Check className="w-8 h-8" />
                    </span>
                    <div className="flex-1 text-center sm:text-left">
                      <span className="text-lg font-bold text-gray-900 block">Thank You! Your Inquiry Has Been Submitted.</span>
                      <p className="text-[12px] text-gray-500 mt-1">
                        We have received your inquiry and our team will review it carefully. We&apos;ll get back to you with the best possible solution.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <div className="bg-white rounded-xl border border-gray-200 px-4 py-2.5 flex-1">
                          <span className="text-[10px] text-gray-400 block text-center sm:text-left">Your Inquiry ID</span>
                          <button type="button" onClick={copyInquiryId} className="flex items-center justify-center sm:justify-start gap-1.5 w-full">
                            <span className="text-base font-bold text-black">{inquiryId}</span>
                            <Icon.Copy className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                          <span className="text-[10px] text-gray-400 block text-center sm:text-left">{copied ? "Copied!" : "Save this ID for future reference"}</span>
                        </div>
                        <div className="flex items-center gap-2.5 bg-purple-50 border border-purple-100 rounded-xl px-4 py-2.5">
                          <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                            <Icon.Bell className="w-4 h-4" />
                          </span>
                          <span className="text-[11px] text-gray-700 font-medium">We will get back to you within 24 hours.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  {/* What's Next timeline */}
                  <div className="rounded-xl border border-gray-200 p-4">
                    <span className="flex items-center gap-2 text-[13px] font-bold text-gray-900 mb-4">
                      <Icon.Clipboard className="w-4 h-4 text-purple-600" />
                      What&apos;s Next?
                    </span>
                    <div className="space-y-4">
                      {[
                        { title: "Inquiry Received", desc: "We have received your inquiry successfully.", status: "Completed", icon: Icon.Check },
                        { title: "Review in Progress", desc: "Our team is reviewing your requirements.", status: "In Progress", icon: Icon.Gear },
                        { title: "Quotation", desc: "You will receive the best quotation soon.", status: "Upcoming", icon: Icon.Shield },
                        { title: "Discussion & Confirmation", desc: "We will discuss and confirm the details.", status: "Upcoming", icon: Icon.Chat },
                        { title: "Production & Delivery", desc: "Your order will be produced and delivered.", status: "Upcoming", icon: Icon.Truck },
                      ].map((item, i, arr) => (
                        <div key={item.title} className="flex items-start gap-3">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              item.status === "Completed" ? "bg-black text-white" : item.status === "In Progress" ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-400"
                            }`}>
                              <item.icon className="w-4 h-4" />
                            </span>
                            {i < arr.length - 1 && <span className="w-0.5 flex-1 bg-gray-200 mt-1" style={{ minHeight: 16 }} />}
                          </div>
                          <div className="flex-1 flex items-start justify-between gap-2 pb-1">
                            <div>
                              <span className={`text-[12px] font-bold block ${item.status === "Completed" ? "text-black" : "text-gray-900"}`}>{item.title}</span>
                              <span className="text-[10px] text-gray-500 block">{item.desc}</span>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              item.status === "Completed" ? "bg-green-100 text-green-700" : item.status === "In Progress" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inquiry Summary */}
                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="flex items-center gap-2 text-[13px] font-bold text-gray-900">
                        <Icon.Clipboard className="w-4 h-4 text-purple-600" />
                        Inquiry Summary
                      </span>
                      <button type="button" onClick={() => { setSubmitted(false); setStep(1); }} className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:underline">
                        <Icon.Pencil className="w-3 h-3" />
                        Edit Inquiry
                      </button>
                    </div>
                    <div className="space-y-2 text-[12px]">
                      {[
                        ["Trophy Type", labelFor(TROPHY_TYPE_OPTIONS, form.trophyType)],
                        ["Material", labelFor(MATERIAL_OPTIONS, form.material)],
                        ["Size", labelFor(SIZE_OPTIONS, form.size)],
                        ["Quantity", form.quantity],
                        ["Shape / Style", labelFor(SHAPE_OPTIONS, form.shape)],
                        ["Color / Finish", form.colorFinish],
                        ["Additional Info", labelsFor(ADDON_OPTIONS, form.addOns)],
                        ["Estimated Price", "₹6,500 - ₹8,200 (Approx.)"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between gap-2">
                          <span className="text-gray-500">{label}</span>
                          <span className="font-semibold text-gray-900 text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <span className="text-[13px] font-bold text-gray-900 block mb-1">You can download your inquiry details</span>
                    <p className="text-[11px] text-gray-500 mb-3">A summary of your inquiry has been sent to your email.</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button type="button" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-[12px] font-bold text-gray-700 hover:bg-gray-50">
                        <Icon.Download className="w-3.5 h-3.5" />
                        Download Summary (PDF)
                      </button>
                      <button type="button" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-[12px] font-bold text-gray-700 hover:bg-gray-50">
                        <Icon.Envelope className="w-3.5 h-3.5" />
                        Send to Email
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl bg-purple-50/40 border border-gray-200 p-4">
                    <span className="flex items-center gap-1.5 text-[13px] font-bold text-gray-900 block mb-1">
                      Need Immediate Assistance?
                    </span>
                    <p className="text-[11px] text-gray-500 mb-3">Talk to our expert for quick help.</p>
                    <button type="button" className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white py-2 text-[12px] font-bold">
                      <Icon.WhatsApp className="w-4 h-4" />
                      Contact Us on WhatsApp
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="mx-auto flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-sm font-bold"
                >
                  <Icon.Grid className="w-4 h-4" />
                  Go to Dashboard
                </button>
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
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_320px] gap-5">
                      <div>
                        <span className="text-[13px] font-semibold text-gray-800 mb-3 block">Trophy Type / Category <span className="text-red-500">*</span></span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {TROPHY_TYPE_OPTIONS.map((t) => (
                            <ImageOptionCard key={t.id} active={form.trophyType === t.id} onClick={() => set("trophyType", t.id)} image={t.image} label={t.label} />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Field label="Purpose / Occasion" required icon={<Icon.Users className="w-4 h-4" />}>
                          <SelectField value={form.purpose} onChange={(v) => set("purpose", v)} options={PURPOSE_OPTIONS} />
                        </Field>
                        <Field label="Industry / Organization Type" required icon={<Icon.Building className="w-4 h-4" />}>
                          <SelectField value={form.industry} onChange={(v) => set("industry", v)} options={INDUSTRY_OPTIONS} />
                        </Field>
                      </div>
                    </div>

                    <div>
                      <span className="text-[13px] font-semibold text-gray-800 mb-3 block">Material <span className="text-red-500">*</span></span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {MATERIAL_OPTIONS.map((m) => (
                          <ImageOptionCard key={m.id} active={form.material === m.id} onClick={() => set("material", m.id)} image={m.image} label={m.label} />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_260px] gap-5">
                      <div>
                        <span className="text-[13px] font-semibold text-gray-800 mb-3 block">Trophy Size <span className="text-red-500">*</span></span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                          {SIZE_OPTIONS.map((s) => (
                            <OptionCard key={s.id} active={form.size === s.id} onClick={() => set("size", s.id)} label={s.label} subtitle={s.subtitle} />
                          ))}
                        </div>
                      </div>
                      <Field label="Quantity" required icon={<Icon.Users className="w-4 h-4" />}>
                        <SelectField value={form.quantity} onChange={(v) => set("quantity", v)} options={QUANTITY_OPTIONS} />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_260px] gap-5">
                      <div>
                        <span className="text-[13px] font-semibold text-gray-800 mb-3 block">Trophy Shape / Style <span className="text-red-500">*</span></span>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                          {SHAPE_OPTIONS.map((s) => (
                            <OptionCard key={s.id} active={form.shape === s.id} onClick={() => set("shape", s.id)} icon={s.icon} label={s.label} />
                          ))}
                        </div>
                      </div>
                      <Field label="Color / Finish" required icon={<Icon.Grid className="w-4 h-4" />}>
                        <SelectField value={form.colorFinish} onChange={(v) => set("colorFinish", v)} options={COLOR_FINISH_OPTIONS} />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[13px] font-semibold text-gray-800 mb-3 block">Personalization / Customization <span className="text-red-500">*</span></span>
                        <div className="grid grid-cols-2 gap-2.5">
                          {PERSONALIZATION_OPTIONS.map((p) => (
                            <OptionCard key={p.id} active={form.personalization === p.id} onClick={() => set("personalization", p.id)} icon={p.icon} label={p.label} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[13px] font-semibold text-gray-800 mb-1.5 block">Customization Details (Optional)</label>
                        <textarea
                          value={form.customizationDetails}
                          onChange={(e) => set("customizationDetails", e.target.value)}
                          maxLength={500}
                          rows={3}
                          placeholder="Write text, logo, name, occasion or any specific requirement..."
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black resize-none placeholder:text-gray-400"
                        />
                        <span className="text-[10px] text-gray-400 block text-right mt-1">{form.customizationDetails.length} / 500</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_260px] gap-5">
                      <div>
                        <span className="text-[13px] font-semibold text-gray-800 mb-3 block">Add-on Features <span className="text-gray-400 font-normal">(Optional)</span></span>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                          {ADDON_OPTIONS.map((a) => (
                            <OptionCard key={a.id} active={form.addOns.includes(a.id)} onClick={() => toggleAddon(a.id)} icon={a.icon} label={a.label} />
                          ))}
                        </div>
                      </div>
                      <Field label="Delivery Timeline" required icon={<Icon.Truck className="w-4 h-4" />}>
                        <SelectField value={form.deliveryTimeline} onChange={(v) => set("deliveryTimeline", v)} options={DELIVERY_TIMELINE_OPTIONS} />
                      </Field>
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
                        <Field label="Alternate Phone (Optional)" icon={null}>
                          <TextField icon={<Icon.Phone className="w-4 h-4" />} type="tel" value={form.altPhone} onChange={(v) => set("altPhone", v)} placeholder="Enter alternate number" />
                        </Field>
                        <Field label="Email Address" required icon={null}>
                          <TextField icon={<Icon.Envelope className="w-4 h-4" />} type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="Enter email address" error={emailError(form.email)} />
                        </Field>
                        <Field label="Preferred Contact Method" required icon={<Icon.Chat className="w-4 h-4" />}>
                          <SelectField value={form.preferredContact} onChange={(v) => set("preferredContact", v)} options={["WhatsApp", "Phone Call", "Email"]} />
                        </Field>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <span className="text-[13px] font-bold text-gray-900 block mb-3">Organization Details</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Company / Organization Name" required icon={null}>
                          <TextField icon={<Icon.Building className="w-4 h-4" />} value={form.companyName} onChange={(v) => set("companyName", v)} placeholder="Enter company name" />
                        </Field>
                        <Field label="Complete Address" required icon={null}>
                          <div className="flex items-start gap-2.5">
                            <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
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
                        <Field label="GST Number (Optional)" icon={null}>
                          <TextField icon={<Icon.Clipboard className="w-4 h-4" />} value={form.gstNumber} onChange={(v) => set("gstNumber", v)} placeholder="Enter GST number" />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="City" required icon={null}>
                            <TextField icon={<Icon.Building className="w-4 h-4" />} value={form.city} onChange={(v) => set("city", v)} placeholder="Enter city" />
                          </Field>
                          <Field label="State" required icon={null}>
                            <SelectField value={form.state || "Maharashtra"} onChange={(v) => set("state", v)} options={["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "Other"]} />
                          </Field>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-purple-50/40 border border-gray-200 p-4">
                      <span className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <Icon.Shield className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="text-[12px] font-bold text-gray-900 block">Your information is safe with us</span>
                        <span className="text-[11px] text-gray-500 block">We respect your privacy. Your details will only be used to respond to your inquiry.</span>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <span className="text-[13px] font-bold text-gray-900 block">Engraving / Printing Text</span>
                      <span className="text-[11px] text-gray-500 block mb-3">What would you like to print on the trophy?</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {ENGRAVING_OPTIONS.map((o) => (
                          <WideOptionCard key={o.id} active={form.engravingText === o.id} onClick={() => set("engravingText", o.id)} icon={o.icon} label={o.label} desc={o.desc} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[13px] font-bold text-gray-900 block">Logo / Artwork</span>
                      <span className="text-[11px] text-gray-500 block mb-3">Do you want to add a logo or artwork?</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {LOGO_OPTIONS.map((o) => (
                          <WideOptionCard key={o.id} active={form.logoArtwork === o.id} onClick={() => set("logoArtwork", o.id)} icon={o.icon} label={o.label} desc={o.desc} />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_320px] gap-5">
                      <div>
                        <span className="text-[13px] font-bold text-gray-900 block">Packaging</span>
                        <span className="text-[11px] text-gray-500 block mb-3">How would you like the trophy to be packed?</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {PACKAGING_OPTIONS.map((o) => (
                            <OptionCard key={o.id} active={form.packaging === o.id} onClick={() => set("packaging", o.id)} icon={o.icon} label={o.label} subtitle={o.desc} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[13px] font-bold text-gray-900 block">Reference Image <span className="text-gray-400 font-normal">(Optional)</span></span>
                        <span className="text-[11px] text-gray-500 block mb-3">Upload any design or style reference (if any)</span>
                        <label className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 py-6 px-3 text-center cursor-pointer hover:border-gray-400 transition-colors">
                          <Icon.Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-[11px] font-semibold text-gray-600">
                            {refImageName ? refImageName : (<>Drag &amp; drop an image here<br />or click to browse</>)}
                          </span>
                          <span className="text-[10px] text-gray-400">JPG, PNG (Max. 5MB)</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            className="hidden"
                            onChange={(e) => setRefImageName(e.target.files?.[0]?.name ?? null)}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-[13px] font-semibold text-gray-800 mb-1.5">
                        <Icon.Clipboard className="w-4 h-4 text-gray-400" />
                        Any Other Requirements? <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <textarea
                        value={form.otherRequirements}
                        onChange={(e) => set("otherRequirements", e.target.value)}
                        maxLength={300}
                        rows={3}
                        placeholder="Write about any specific requirement..."
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black resize-none placeholder:text-gray-400"
                      />
                      <span className="text-[10px] text-gray-400 block text-right mt-1">{form.otherRequirements.length} / 300</span>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_320px] gap-5">
                    <div className="space-y-4">
                      <div className="rounded-xl border border-gray-200 p-4">
                        <span className="flex items-center gap-2 text-[13px] font-bold text-gray-900 mb-3">
                          <Icon.Trophy className="w-4 h-4 text-purple-600" />
                          Requirements Summary
                        </span>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                          {[
                            ["Trophy Type", labelFor(TROPHY_TYPE_OPTIONS, form.trophyType)], ["Purpose / Occasion", form.purpose],
                            ["Material", labelFor(MATERIAL_OPTIONS, form.material)], ["Industry / Organization", form.industry],
                            ["Size", labelFor(SIZE_OPTIONS, form.size)], ["Shape / Style", labelFor(SHAPE_OPTIONS, form.shape)],
                            ["Quantity", form.quantity], ["Color / Finish", form.colorFinish],
                          ].map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between gap-2">
                              <span className="text-gray-500">{label}</span>
                              <span className="font-semibold text-gray-900 text-right">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4">
                        <span className="flex items-center gap-2 text-[13px] font-bold text-gray-900 mb-3">
                          <Icon.Clipboard className="w-4 h-4 text-purple-600" />
                          Additional Info Summary
                        </span>
                        <div className="space-y-2 text-[12px]">
                          {[
                            ["Engraving / Printing Text", labelFor(ENGRAVING_OPTIONS, form.engravingText)],
                            ["Logo / Artwork", labelFor(LOGO_OPTIONS, form.logoArtwork)],
                            ["Packaging", labelFor(PACKAGING_OPTIONS, form.packaging)],
                          ].map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between gap-2">
                              <span className="text-gray-500">{label}</span>
                              <span className="font-semibold text-gray-900 text-right">{value}</span>
                            </div>
                          ))}
                          {refImageName && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-gray-500">Reference Image</span>
                              <span className="flex items-center gap-1 font-semibold text-purple-600"><Icon.Image className="w-3.5 h-3.5" />{refImageName}</span>
                            </div>
                          )}
                          {form.otherRequirements && <p className="text-gray-500 italic mt-1">&quot;{form.otherRequirements}&quot;</p>}
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4">
                        <span className="flex items-center gap-2 text-[13px] font-bold text-gray-900 mb-3">
                          <Icon.Person className="w-4 h-4 text-purple-600" />
                          Contact Summary
                        </span>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                          {[
                            ["Contact Person", form.fullName || "—"], ["Company / Organization", form.companyName || "—"],
                            ["Phone", form.phone || "—"], ["Address", form.address || "—"],
                            ["Email", form.email || "—"], ["Preferred Contact", form.preferredContact || "—"],
                          ].map(([label, value]) => (
                            <div key={label} className="flex items-start justify-between gap-2">
                              <span className="text-gray-500 flex-shrink-0">{label}</span>
                              <span className="font-semibold text-gray-900 text-right">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 rounded-lg bg-purple-50/40 border border-gray-200 px-3.5 py-2.5">
                        <Icon.Gear className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <div>
                          <span className="text-[11px] font-semibold text-gray-800 block">Looks good?</span>
                          <span className="text-[10px] text-gray-500">Click &quot;Submit Inquiry&quot; and our team will get back to you within 24 hours.</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-xl border border-gray-200 p-4">
                        <span className="text-[13px] font-bold text-gray-900 block mb-3">Trophy Preview</span>
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
                          <Image src="/trophies/trophy-preview-sample.webp" alt="Trophy preview" fill className="object-contain p-3" />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">* Preview is for reference only. Final product may vary slightly.</p>
                      </div>

                      <div className="rounded-xl bg-purple-50/40 border border-gray-200 p-4">
                        <span className="flex items-center gap-1.5 text-[13px] font-bold text-gray-900 mb-2">
                          Estimated Price
                          <Icon.Info className="w-3.5 h-3.5 text-gray-400" />
                        </span>
                        <span className="text-lg font-bold text-black block mb-3">₹6,500 - ₹8,200 <span className="text-[11px] font-normal text-gray-500">(Approx.)</span></span>
                        <div className="space-y-1.5 text-[11px]">
                          {[
                            ["Item Total (50 - 100 Pieces)", "₹5,500 - ₹7,000"],
                            ["Engraving / Printing", "₹500 - ₹800"],
                            ["Packaging (Premium Box)", "₹500 - ₹700"],
                            ["Taxes (GST Extra)", "As applicable"],
                          ].map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between">
                              <span className="text-gray-500">{label}</span>
                              <span className="font-semibold text-gray-800">{value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-start gap-1.5 mt-3 pt-3 border-t border-purple-100">
                          <Icon.Shield className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                          <span className="text-[10px] text-gray-500">Final price will be confirmed after our team reviews your requirements.</span>
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

                <div className="flex items-center gap-2">
                  {step === 4 && (
                    <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50">
                      <Icon.Pencil className="w-4 h-4" />
                      Edit Details
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
              </div>
              {submitError && <span className="text-[11px] text-red-500 font-medium">{submitError}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}