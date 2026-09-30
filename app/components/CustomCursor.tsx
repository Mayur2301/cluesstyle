"use client";

/**
 * CustomCursor.tsx — cluesstyle.com
 *
 * - Custom animated cursor (dot + ring)
 * - Tracks every link/button click: href, text, page, timestamp, position,
 *   and the viewport size at click time (needed to place the click as a %
 *   position for the admin heatmap, since visitors have different screens)
 * - POSTs each click to /api/track-click → inserted into the click_events
 *   MySQL table (see app/lib/admin-heatmap.ts and the admin Heatmap page)
 * - Works on every page via app/layout.tsx
 */

import { useEffect, useRef, useState, useCallback } from "react";

interface ClickLog {
  href: string;
  text: string;
  page: string;
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
  timestamp: string;
  userAgent: string;
}

async function logClick(data: ClickLog) {
  try {
    await fetch("/api/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    // non-critical — silently fail
  }
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  // Smooth ring follow via RAF
  const animate = useCallback(() => {
    ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12;
    ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12;

    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
    }
    if (ringRef.current) {
      ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // Hide default cursor globally
    document.documentElement.style.cursor = "none";

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const onEnter = () => setIsVisible(true);
    const onLeave = () => setIsVisible(false);

    // Hover detection — links, buttons, [role=button]
    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        "a, button, [role='button'], input, textarea, select, label"
      );
      setIsHovering(!!target);
    };

    // Click tracking
    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a, button, [role='button']");
      if (!target) return;

      const href =
        target.getAttribute("href") ||
        target.getAttribute("data-href") ||
        target.getAttribute("aria-label") ||
        "(no href)";

      const text = (target.textContent || "").trim().slice(0, 100);

      logClick({
        href,
        text,
        page: window.location.pathname,
        x: Math.round(e.clientX),
        y: Math.round(e.clientY),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onMouseOver);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("click", onClick);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);

    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.documentElement.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("click", onClick);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafId.current);
    };
  }, [animate, isVisible]);

  // Don't render on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      <style>{`
        .cs-cursor-dot,
        .cs-cursor-ring {
          position: fixed;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 99999;
          will-change: transform;
          /* offset so center of element is at cursor tip */
        }

        /* Small solid dot */
        .cs-cursor-dot {
          width: 6px;
          height: 6px;
          margin-left: -3px;
          margin-top: -3px;
          background: #3659d8;
          border-radius: 50%;
          transition: opacity 0.2s, transform 0.1s;
        }

        /* Outer ring */
        .cs-cursor-ring {
          width: 36px;
          height: 36px;
          margin-left: -18px;
          margin-top: -18px;
          border: 1.5px solid rgba(0, 0, 0, 0.6);
          border-radius: 50%;
          transition:
            width 0.25s cubic-bezier(0.22, 1, 0.36, 1),
            height 0.25s cubic-bezier(0.22, 1, 0.36, 1),
            margin 0.25s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.2s,
            background 0.2s,
            opacity 0.2s;
        }

        /* Hover state — ring grows, fills slightly */
        .cs-cursor-ring.hovering {
          width: 52px;
          height: 52px;
          margin-left: -26px;
          margin-top: -26px;
          border-color: rgba(36, 80, 202, 0.9);
          background: rgba(17, 56, 214, 0.06);
        }

        /* Click state — ring shrinks */
        .cs-cursor-ring.clicking {
          width: 24px;
          height: 24px;
          margin-left: -12px;
          margin-top: -12px;
          border-color: #3659d8;
          background: rgba(34, 64, 135, 0.12);
        }

        .cs-cursor-dot.clicking {
          transform-origin: center;
          background: #3659d8;
        }

        /* Hidden when out of window */
        .cs-cursor-dot.hidden,
        .cs-cursor-ring.hidden {
          opacity: 0;
        }

        /* Hide on touch */
        @media (pointer: coarse) {
          .cs-cursor-dot,
          .cs-cursor-ring {
            display: none;
          }
        }
      `}</style>

      {/* Dot */}
      <div
        ref={dotRef}
        className={`cs-cursor-dot${isClicking ? " clicking" : ""}${!isVisible ? " hidden" : ""}`}
      />

      {/* Ring */}
      <div
        ref={ringRef}
        className={`cs-cursor-ring${isHovering ? " hovering" : ""}${isClicking ? " clicking" : ""}${!isVisible ? " hidden" : ""}`}
      />
    </>
  );
}