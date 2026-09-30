// Static, auto-scrolling testimonials carousel for the home page.
// Drop this component anywhere in your homepage layout — no props, no state
// besides the CSS animation itself. Update the `testimonials` array to
// change copy. The list is duplicated once so the scroll loops seamlessly.

const testimonials = [
  {
    name: "Ananya Rao",
    role: "HR Manager, Corporate Event",
    initials: "AR",
    avatarBg: "bg-blue-500",
    rating: 5,
    quote: "The print quality exceeded our expectations and the whole order arrived a day early. Our team loved the fit and finish.",
  },
  {
    name: "Karan Mehta",
    role: "Founder, Startup Merch",
    initials: "KM",
    avatarBg: "bg-emerald-500",
    rating: 5,
    quote: "Ordering in bulk was surprisingly easy — the size breakdown tool made it simple to get exact quantities per size.",
  },
  {
    name: "Priya Nair",
    role: "College Fest Coordinator",
    initials: "PN",
    avatarBg: "bg-orange-500",
    rating: 4,
    quote: "Great value for the price. Customer support helped us fix our logo file within minutes over chat.",
  },
  {
    name: "Rohit Sharma",
    role: "Sports Club Captain",
    initials: "RS",
    avatarBg: "bg-purple-500",
    rating: 5,
    quote: "Fabric feels premium and held up after multiple washes. Will definitely order again for next season.",
  },
  {
    name: "Simran Kaur",
    role: "Wedding Planner",
    initials: "SK",
    avatarBg: "bg-rose-500",
    rating: 5,
    quote: "The customization options let us match our exact theme colors. Guests kept asking where we got them made.",
  },
  {
    name: "Aditya Verma",
    role: "Small Business Owner",
    initials: "AV",
    avatarBg: "bg-indigo-500",
    rating: 4,
    quote: "Smooth checkout, transparent pricing tiers, and the delivery tracking kept us updated the whole way.",
  },
];

function TestimonialCard({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <div className="w-[300px] sm:w-[340px] flex-shrink-0 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < t.rating ? "text-yellow-400" : "text-gray-200"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.538 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.783.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.385c-.784-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.285-3.958z" />
          </svg>
        ))}
      </div>

      <p className="text-[14px] text-gray-700 leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>

      <div className="flex items-center gap-3 pt-1">
        <span
          className={`w-10 h-10 rounded-full ${t.avatarBg} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}
        >
          {t.initials}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{t.name}</p>
          <p className="text-[12px] text-gray-500 truncate">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  // Duplicate the list so translateX(-50%) loops back to an identical
  // starting point — the seam is invisible to the eye.
  const loop = [...testimonials, ...testimonials];

  return (
    <section className="py-12 sm:py-16 bg-white overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-5">
        <div className="mb-10 flex items-center gap-3">
          <img src="https://cdn.cluesstyle.com/public/gold-arrow.png" alt="arrow" className="w-7 h-7 sm:w-8 sm:h-8" />
          <h2 className="text-2xl font-semibold sm:text-3xl md:text-4xl">What Our Customers Say</h2>
        </div>
      </div>

      {/* Track constrained to max-w-[1600px] instead of true full-bleed */}
      <div className="max-w-[1600px] mx-auto">
        <div className="tst-marquee-viewport">
          <div className="tst-marquee-track">
            {loop.map((t, idx) => (
              <TestimonialCard key={idx} t={t} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .tst-marquee-viewport {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
        .tst-marquee-track {
          display: flex;
          gap: 1.25rem;
          width: max-content;
          animation: tst-scroll 40s linear infinite;
        }
        .tst-marquee-viewport:hover .tst-marquee-track {
          animation-play-state: paused;
        }
        @keyframes tst-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tst-marquee-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}