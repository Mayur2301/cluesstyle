'use client';

import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const progress =
        docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      setScrollProgress(progress);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScrollProgress);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    updateScrollProgress();

    return () =>
      window.removeEventListener('scroll', onScroll);
  }, []);

  const radius = 26;
  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference -
    (scrollProgress / 100) * circumference;

  return (
    <button
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }
      className="
        fixed
        left-4
        bottom-20
        md:left-6
        md:bottom-6
        z-[999]
        flex
        h-14
        w-14
        items-center
        justify-center
      "
      aria-label="Scroll to top"
    >
      <svg
        className="absolute h-full w-full -rotate-90"
        viewBox="0 0 60 60"
      >
        {/* Background Track */}
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="3"
        />

        {/* Progress Ring */}
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="none"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          border
          border-black
          bg-white
          shadow-md
          transition
          hover:bg-black
          hover:text-white
        "
      >
        <ChevronUp size={18} />
      </div>
    </button>
  );
}