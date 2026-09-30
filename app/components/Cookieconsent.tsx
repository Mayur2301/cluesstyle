"use client";

/**
 * CookieConsent.tsx — cluesstyle.com
 *
 * Full-width bottom bar, black & white design.
 * Shows on EVERY page, only once per browser (localStorage).
 * Optional server-side IP logging via POST /api/cookie-consent.
 */

import { useEffect, useState } from "react";

const STORAGE_KEY = "cluesstyle_cookies_accepted";

async function notifyServer() {
  try {
    await fetch("/api/cookie-consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accepted: true, ts: Date.now() }),
    });
  } catch {
    // non-critical
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    // Show on every page — no pathname check
    if (localStorage.getItem(STORAGE_KEY) === "true") return;
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    notifyServer();
    setAnimateOut(true);
    setTimeout(() => setVisible(false), 450);
  };

  const handleDecline = () => {
    setAnimateOut(true);
    setTimeout(() => setVisible(false), 450);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=Inter:wght@300;400;500&display=swap');

        .cs-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          width: 100%;

          background: #000000;
          border-top: 1px solid rgba(255,255,255,0.15);

          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;

          padding: 18px 48px;
          box-sizing: border-box;

          animation: cs-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .cs-bar.cs-out {
          animation: cs-fall 0.4s cubic-bezier(0.55, 0, 0.45, 1) both;
        }

        @keyframes cs-rise {
          from { opacity: 0; transform: translateY(100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cs-fall {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(100%); }
        }

        .cs-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 0;
        }

        .cs-cookie-icon {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cs-text-wrap {
          min-width: 0;
        }

        .cs-label {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 600;
          font-size: 0.88rem;
          letter-spacing: 0.05em;
          color: #ffffff;
          text-transform: uppercase;
          margin: 0 0 3px 0;
        }

        .cs-body {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.76rem;
          font-weight: 300;
          line-height: 1.55;
          color: rgba(255,255,255,0.52);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cs-body a {
          color: rgba(255,255,255,0.75);
          text-decoration: underline;
          text-underline-offset: 2px;
          text-decoration-color: rgba(255,255,255,0.3);
          transition: color 0.2s, text-decoration-color 0.2s;
        }
        .cs-body a:hover {
          color: #fff;
          text-decoration-color: #fff;
        }

        .cs-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .cs-btn {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          cursor: pointer;
          padding: 9px 26px;
          border-radius: 2px;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
          outline: none;
          white-space: nowrap;
        }
        .cs-btn:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 3px;
        }

        /* Accept — white bg, black text; hover flips to black bg, white text */
        .cs-btn-accept {
          background: #ffffff;
          color: #000000;
          border: 1px solid #ffffff;
        }
        .cs-btn-accept:hover {
          background: #000000;
          color: #ffffff;
          border-color: #ffffff;
        }

        /* Decline — transparent bg, white text; hover flips to white bg, black text */
        .cs-btn-decline {
          background: transparent;
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.35);
        }
        .cs-btn-decline:hover {
          background: #ffffff;
          color: #000000;
          border-color: #ffffff;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .cs-bar {
            padding: 16px 20px;
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
          .cs-body {
            white-space: normal;
            overflow: visible;
            text-overflow: unset;
          }
          .cs-actions {
            width: 100%;
          }
          .cs-btn {
            flex: 1;
            text-align: center;
          }
        }

        @media (max-width: 400px) {
          .cs-actions { flex-direction: column; }
          .cs-btn { width: 100%; }
        }
      `}</style>

      <div
        role="dialog"
        aria-modal="false"
        aria-label="Cookie consent"
        className={`cs-bar${animateOut ? " cs-out" : ""}`}
      >
        {/* Left: icon + text */}
        <div className="cs-left">
          <div className="cs-cookie-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M21.17 8A9.98 9.98 0 0 1 22 12" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="rgba(255,255,255,0.7)"/>
              <circle cx="15" cy="13" r="1" fill="rgba(255,255,255,0.7)"/>
              <circle cx="9" cy="15" r="1" fill="rgba(255,255,255,0.7)"/>
              <circle cx="17" cy="8" r="0.75" fill="rgba(255,255,255,0.7)"/>
              <path d="M14 5c0 1.1.9 2 2 2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M20 6c-1.1 0-2-.9-2-2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="cs-text-wrap">
            <p className="cs-label">Cookies &amp; Privacy</p>
            <p className="cs-body">
              We use cookies to enhance your experience and analyse traffic.&nbsp;
              <a href="/privacy-policy">Privacy Policy</a>&nbsp;&middot;&nbsp;
              <a href="/cookie-policy">Cookie Policy</a>
            </p>
          </div>
        </div>

        {/* Right: buttons */}
        <div className="cs-actions">
          <button
            className="cs-btn cs-btn-decline"
            onClick={handleDecline}
            aria-label="Decline cookies"
          >
            Decline
          </button>
          <button
            className="cs-btn cs-btn-accept"
            onClick={handleAccept}
            aria-label="Accept all cookies"
          >
            Accept All
          </button>
        </div>
      </div>
    </>
  );
}