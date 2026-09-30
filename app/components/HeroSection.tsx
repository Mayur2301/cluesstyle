"use client";

import { useState } from "react";

const PANELS = [
  {
    id: 0,
    num: "01",
    label: "POLO T-SHIRTS",
    eyebrow: "Design · Visualise · Print",
     headline: ["Bring Your", "Designs", "to Life"],
    description:
      "From Canvas to Cotton",
    primaryCTA: "Start Designing",
    secondaryCTA: "Explore Products",
    tag1: "",
    tag2: "",
    accent: "#b4a797",
    bg: "linear-gradient(180deg, #778CA0 0%, #91A7B7 55%, #879AAE 100%)",
    videoSrc: "beige-polo-t-shirt.webm",
    videoMp4: "beige-polo-t-shirt.webm",
    btn:"#0c0c0c",
  },
  {
    id: 1,
    num: "02",
    label: "3D Mockups",
    eyebrow: "Mockup · Generate · Export",
    headline: ["Professional Gifts", "for Professional", "Brands"],
    description:
      "The Art of Personal Gifting",
    primaryCTA: "Start Customizing",
    secondaryCTA: "Browse Catalogue",
    tag1: "",
    tag2: "",
    accent: "#a6ce9d",
    bg: "linear-gradient(180deg,#2e1008 0%,#8e3d2d 60%,#E8734A 100%)",
    videoSrc: "/merchandise.webm,",
    videoMp4: "/merchandise.webm",
    btn:"#0c0c0c",
  },
  {
    id: 3,
    num: "03",
    label: "Bulk Orders",
    eyebrow: "Demand · Design · Deliver",
   headline: ["One Platform", " Infinite Bulk", "Orders"],
   description:
      "Your Vision Mass Produced",
    primaryCTA: "Get a Quote",
    secondaryCTA: "Shop Now",
    tag1: "",
    tag2: "",
    accent: "#000000",
    bg: "linear-gradient(180deg,#0a2018 0%,#1a5c38 60%,#7EC8A0 100%)",
    videoSrc: "/black-formal-shirt.webm",
    videoMp4: "/black-formal-shirt.webm",
    btn:"#0c0c0c",
  },
  {
    id: 4,
    num: "04",
    label: "Sport Wears",
    eyebrow: "Wear · Play · Go",
    headline: ["Premium Custom", "Sports Wear", "for teams"],
    description:
      "Custom Gear That Performs",
    primaryCTA: "Customize Jerseys",
    secondaryCTA: "Shop Team Wears",
    tag1: "",
    tag2: "",
    accent: "#4695c9",
    bg: "linear-gradient(180deg,#0a2018 0%,#1a5c38 60%,#7EC8A0 100%)",
    videoSrc: "/indian-jersey.webm",
    videoMp4: "/indian-jersey.webm",
    btn:"#0c0c0c",
  },
];

export default function HeroAccordion() {
  const [active, setActive] = useState(0);

  return (
    <>
      <div className="ha-wrapper">
        <div className="ha-sticky-hero">
          {PANELS.map((p, index) => {
            const isActive = active === index;
            return (
              <div
                key={p.id}
                className={`ha-panel${isActive ? " ha-active" : ""}`}
                style={{ background: p.bg }}
                onMouseEnter={() => setActive(index)}
              >
                {/* Video */}
                <video autoPlay loop muted playsInline className="ha-vid">
                  <source src={p.videoSrc} type="video/webm" />
                  <source src={p.videoMp4} type="video/mp4" />
                </video>

                {/* Scrim */}
                <div className="ha-overlay" />

                {/* Accent dot */}
                <div className="ha-dot" style={{ background: p.accent }} />

                {/* COLLAPSED: vertical label */}
                <div className={`ha-collapsed${isActive ? " ha-hidden" : ""}`}>
                  <span className="ha-col-num">{p.num}</span>
                  <span className="ha-col-label">{p.label}</span>
                  <div className="ha-col-tags">
                    <span>{p.tag1}</span>
                    <span>{p.tag2}</span>
                  </div>
                </div>

                {/* EXPANDED: full content */}
                <div className={`ha-expanded${isActive ? " ha-visible" : ""}`}>
                  <p className="ha-eyebrow">{p.eyebrow}</p>
                  <div style={{ flex: 1 }} />
                  <h2 className="ha-headline">
                    {p.headline.map((line, i) => (
                      <span key={i} className="ha-hline">{line}</span>
                    ))}
                  </h2>
                  <p className="ha-desc">{p.description}</p>
                  <div className="ha-btns">
                    <button
                      className="ha-btn-primary"
                      style={{ background: p.btn }}
                    >
                      {p.primaryCTA}
                    </button>
                    <button className="ha-btn-ghost">{p.secondaryCTA}</button>
                  </div>
                  <div className="ha-bottom-tags">
                    <span className="ha-tag">{p.tag1}</span>
                    <span className="ha-tag-sep">·</span>
                    <span className="ha-tag">{p.tag2}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Progress dots */}
          <div className="ha-progress">
            {PANELS.map((_, i) => (
              <button
                key={i}
                className={`ha-prog-dot${active === i ? " ha-prog-dot--active" : ""}`}
                onClick={() => setActive(i)}
                aria-label={`Go to panel ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .ha-wrapper {
          width: 100%;
          height: 100vh;
          overflow: hidden;
          position: relative;
        }

        .ha-sticky-hero {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: row;
          overflow: hidden;
        }

        /* ── Panel ── */
        .ha-panel {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          flex: 2.1 1 0%;
          transition: flex 0.75s cubic-bezier(0.76, 0, 0.24, 1);
          display: flex;
          flex-direction: column;
        }
        .ha-active { flex: 4.5 1 0%; }

        /* ── Video ── */
        .ha-vid {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: auto;
          height: 100%;
          min-width: 100%;
          object-fit: cover;
          object-position: center center;
          z-index: 0;
          opacity: 1;
          transition: opacity 0.65s ease;
          will-change: transform;
        }
        .ha-active .ha-vid { opacity: 1; }

        /* ── Overlay ── */
        .ha-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: 0;
          background: linear-gradient(
            to bottom,
            rgba(206, 203, 203, 0)  0%,
            rgba(204, 201, 201, 0.15) 40%,
            rgba(158, 149, 149, 0.65) 100%
          );
          pointer-events: none;
          transition: opacity 0.5s ease;
        }
        .ha-active .ha-overlay { opacity: 1; }

        /* ── Accent dot ── */
        .ha-dot {
          position: absolute;
          top: 1.8rem;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 12px;
          border-radius: 50%;
          z-index: 5;
          transition: left 0.75s cubic-bezier(0.76,0,0.24,1), transform 0.35s ease;
        }
        .ha-active .ha-dot {
          left: calc(100% - 1.8rem);
          transform: translateX(0) scale(1.5);
        }

        /* ── COLLAPSED ── */
        .ha-collapsed {
          position: absolute;
          inset: 0;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: 2.2rem;
          gap: 0.5rem;
          opacity: 1;
          transition: opacity 0.22s ease;
        }
        .ha-hidden { opacity: 0; pointer-events: none; }

        .ha-col-num {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.22em;
          color: rgba(255,255,255,0.35);
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }
        .ha-col-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.78);
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          white-space: nowrap;
        }
        .ha-col-tags {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          margin-top: 0.3rem;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }
        .ha-col-tags span {
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          white-space: nowrap;
        }

        /* ── EXPANDED ── */
        .ha-expanded {
          position: absolute;
          inset: 0;
          z-index: 3;
          display: flex;
          flex-direction: column;
          padding: 2.2rem 2rem 6rem;
          opacity: 0;
          transform: translateX(-16px);
          pointer-events: none;
          transition: opacity 0.4s ease 0.3s, transform 0.4s ease 0.3s;
          min-width: 270px;
        }
        .ha-visible {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
        }

        .ha-eyebrow {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.42);
          margin: 0;
        }

        .ha-headline {
          display: flex;
          flex-direction: column;
          margin: 0 0 0.9rem;
        }
        .ha-hline {
          display: block;
          font-size: clamp(2rem, 3.8vw, 4.2rem);
          font-weight: 800;
          line-height: 1.06;
          color: #fff;
          letter-spacing: -0.03em;
          text-shadow: 0 4px 22px rgba(0,0,0,0.5);
        }

        .ha-desc {
          font-size: 1rem;
          color: #21221a;
          line-height: 1.72;
          margin: 0 0 1.4rem;
          max-width: 300px;
          font-weight:500;
        }

        .ha-btns {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 1.6rem;
        }
        .ha-btn-primary {
          padding: 0.62rem 1.5rem;
          border-radius: 999px;
          border: none;
          color: #fff;
          font-weight: 700;
          font-size: 0.82rem;
          cursor: pointer;
          letter-spacing: 0.025em;
          transition: filter 0.2s, transform 0.2s;
        }
        .ha-btn-primary:hover { filter: brightness(1.18); transform: translateY(-2px); }

        .ha-btn-ghost {
          padding: 0.62rem 1.5rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255,255,255,0.22);
          color: rgba(255,255,255,0.85);
          font-weight: 600;
          font-size: 0.82rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .ha-btn-ghost:hover { background: rgba(255,255,255,0.18); }

        .ha-bottom-tags {
          display: flex;
          align-items: center;
          gap: 8px;
          
          padding-top: 0.9rem;
        }
        .ha-tag {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.38);
        }
        .ha-tag-sep { color: rgba(255,255,255,0.18); font-size: 10px; }

        /* ── Progress dots ── */
        .ha-progress {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .ha-prog-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.35s ease;
        }
        .ha-prog-dot--active {
          width: 22px;
          border-radius: 999px;
          background: rgba(255,255,255,0.9);
        }

        /* ── Mobile ── */
        @media (max-width: 700px) {
          .ha-sticky-hero { flex-direction: column; }
          .ha-panel { flex: 1 1 0%; }
          .ha-active { flex: 3.5 1 0%; }
          .ha-collapsed {
            flex-direction: row;
            justify-content: flex-start;
            padding: 0 1.3rem;
            gap: 0.7rem;
          }
          .ha-col-num, .ha-col-label {
            writing-mode: horizontal-tb;
            transform: none;
          }
          .ha-col-tags {
            writing-mode: horizontal-tb;
            transform: none;
            flex-direction: row;
          }
          .ha-dot {
            top: 50%;
            left: unset;
            right: 1.3rem;
            transform: translateY(-50%);
          }
          .ha-active .ha-dot {
            top: 1.2rem;
            left: unset;
            right: 1.2rem;
            transform: scale(1.45);
          }
          .ha-expanded {
            padding: 1.3rem 1.2rem;
            min-width: unset;
            transform: translateY(10px);
          }
          .ha-visible { transform: translateY(0); }
          .ha-hline { font-size: clamp(1.6rem, 7vw, 2.4rem); }
          .ha-desc { max-width: 100%; }
        }

        /* ── Tablet ── */
        @media (min-width: 701px) and (max-width: 1100px) {
          .ha-hline { font-size: clamp(1.7rem, 3vw, 2.8rem); }
          .ha-expanded { padding: 1.8rem 1.5rem; }
        }
      `}</style>
    </>
  );
}