// PATH: app/admin/(protected)/AdminShell.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

interface NavItem {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
}

function iconStroke(active: boolean) {
  return active ? "text-white" : "text-gray-400 group-hover:text-gray-200";
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (active) => (
      <svg className={`w-5 h-5 ${iconStroke(active)}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: (active) => (
      <svg className={`w-5 h-5 ${iconStroke(active)}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 2a1 1 0 00-1 1v1H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2V3a1 1 0 00-1-1H9zM8 12h8m-8 4h5" />
      </svg>
    ),
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: (active) => (
      <svg className={`w-5 h-5 ${iconStroke(active)}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-9-6h19.5" />
        <rect x="2.25" y="6" width="19.5" height="13.5" rx="2" strokeWidth={1.8} />
      </svg>
    ),
  },
  {
    label: "Admins",
    href: "/admin/admins",
    icon: (active) => (
      <svg className={`w-5 h-5 ${iconStroke(active)}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-8a4 4 0 11-8 0 4 4 0 018 0zm6 3a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: "Heatmap",
    href: "/admin/heatmap",
    icon: (active) => (
      <svg className={`w-5 h-5 ${iconStroke(active)}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
  },
  {
    label: "Certificates",
    href: "/admin/certificates",
    icon: (active) => (
      <svg className={`w-5 h-5 ${iconStroke(active)}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: (active) => (
      <svg className={`w-5 h-5 ${iconStroke(active)}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    label: "Returns",
    href: "/admin/returns",
    icon: (active) => (
      <svg className={`w-5 h-5 ${iconStroke(active)}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
      </svg>
    ),
  },
  {
    label: "Contact Messages",
    href: "/admin/contact-messages",
    icon: (active) => (
      <svg className={`w-5 h-5 ${iconStroke(active)}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    label: "Product Enquiries",
    href: "/admin/web-enquiries",
    icon: (active) => (
      <svg className={`w-5 h-5 ${iconStroke(active)}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  // Add more sections as you build them, e.g.:
  // { label: "Products", href: "/admin/products", icon: (active) => (...) },
];

// "/admin" (Dashboard) is a PREFIX of every other admin route
// ("/admin/orders/CLU-...", "/admin/admins", ...), so a naive
// `pathname.startsWith(item.href)` check matches Dashboard on literally
// every admin page — e.g. viewing an order under /admin/orders/[orderRef]
// would highlight both "Dashboard" and "Orders" at once. Dashboard only
// counts as active on an exact match; every other nav item still uses
// prefix matching so its own sub-routes (like an order detail page) stay
// highlighted under it.
function isNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

function pageTitle(pathname: string): string {
  const match = [...NAV_ITEMS].reverse().find((item) => isNavActive(pathname, item.href));
  return match?.label ?? "Dashboard";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AdminShell({
  children,
  adminName,
  adminRole,
  notificationCount = 0,
}: {
  children: React.ReactNode;
  adminName: string;
  adminRole: string;
  notificationCount?: number;
}) {
  const pathname = usePathname() ?? "/admin";
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    router.push(`/admin/orders?q=${encodeURIComponent(q)}`);
  };

  const Sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-gray-800 flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
          <span className="text-gray-900 font-extrabold text-sm">CS</span>
        </span>
        <div className="min-w-0">
          <span className="block text-white font-bold text-base tracking-tight leading-tight truncate">Cluestyle</span>
          <span className="block text-[10.5px] text-gray-400 leading-tight truncate">Print Your Ideas</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
              }`}
            >
              {item.icon(active)}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-4">
        <div className="rounded-xl bg-gray-800/60 border border-gray-800 px-4 py-3.5 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.451.999-1.451 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 17h.008v.008H12V17z" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white leading-tight">Need Help?</p>
            <a href="mailto:support@cluesstyle.com" className="text-[11px] text-gray-400 hover:text-gray-200 leading-tight truncate block">
              support@cluesstyle.com
            </a>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-gray-800 text-xs text-gray-400">
        Signed in as
        <div className="text-gray-200 font-medium truncate">{adminName}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex print:block print:min-h-0 print:bg-white">
      {/* Desktop sidebar — print:hidden so pages with their own print view
          (order detail's Print button, the shipping label) never print the
          nav chrome around them, just the content. */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-gray-900 fixed inset-y-0 print:hidden">
        {Sidebar}
      </aside>

      {/* Mobile sidebar (slide-over) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-gray-900">{Sidebar}</aside>
        </div>
      )}

      {/* Main column
          min-w-0 here (and on <main> below) is load-bearing: without it, a
          flex child never shrinks below its content's natural width, so any
          wide content inside (a table that needs horizontal scroll, a filter
          row with several fixed-width controls) pushes this whole column —
          and the page body with it — wider than the viewport. The sidebar is
          `fixed`, so it doesn't move when that happens; the page just scrolls
          sideways underneath it, which looks like the sidebar "moving over"
          the content. min-w-0 lets this column stay viewport-width and pushes
          any overflow down into the individual `overflow-x-auto` wrappers
          (e.g. around the orders table) where it belongs. */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 print:pl-0 print:flex-none">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center gap-3 print:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Global search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                type="text"
                placeholder="Search orders, customers, products..."
                className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:bg-white transition-colors"
              />
            </div>
          </form>

          <div className="hidden sm:block flex-1" />

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 relative"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-gray-100 shadow-lg z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">Notifications</p>
                    </div>
                    {notificationCount > 0 ? (
                      <Link
                        href="/admin/orders"
                        onClick={() => setNotifOpen(false)}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span className="font-semibold text-amber-700">{notificationCount}</span> order
                        {notificationCount !== 1 ? "s" : ""} awaiting payment confirmation
                      </Link>
                    ) : (
                      <p className="px-4 py-6 text-center text-xs text-gray-400">You're all caught up.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-lg hover:bg-gray-100"
              >
                <span className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {initials(adminName)}
                </span>
                <span className="hidden sm:block text-left leading-tight">
                  <span className="block text-xs font-semibold text-gray-900">{adminName.split(" ")[0]}</span>
                  <span className="block text-[10.5px] text-gray-400 capitalize">{adminRole}</span>
                </span>
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{adminName}</p>
                      <p className="text-xs text-gray-400 capitalize">{adminRole}</p>
                    </div>
                    <div className="px-2 py-2">
                      <LogoutButton />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main screen */}
        <main className="flex-1 p-4 sm:p-6 min-w-0 print:p-0">{children}</main>
      </div>
    </div>
  );
}