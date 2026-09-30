"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const TOTAL_FRAMES = 15;

export default function ScrollFramesSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [currentFrame, setCurrentFrame] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate scroll progress
      const progress = Math.min(
        Math.max(
          (windowHeight - rect.top) / (windowHeight + rect.height),
          0
        ),
        1
      );

      // Convert progress to frame
      const frame = Math.min(
        TOTAL_FRAMES,
        Math.max(1, Math.ceil(progress * TOTAL_FRAMES))
      );

      setCurrentFrame(frame);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Format frame number → 001, 002, 003...
  const paddedFrame = String(currentFrame).padStart(3, "0");

  return (
    <section
      ref={sectionRef}
      className="relative h-[350vh] w-full bg-black"
    >
      {/* Sticky Frame Viewer */}
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-black">

        {/* FRAME IMAGE */}
        <div className="relative h-full w-full">
          <Image
            src={`/visiting-card-animation/vidssave_com_7_Point_Law_-_Cannabis_Grinder_Business_Card_Animation_720P-${paddedFrame}.png`}
            alt={`Frame ${currentFrame}`}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/40" />

        {/* Content */}
        <div className="absolute bottom-12 left-1/2 z-20 w-full max-w-[1400px] -translate-x-1/2 px-6 text-center text-white">

          <h1
            className="
              text-[52px]
              sm:text-[82px]
              md:text-[120px]
              lg:text-[160px]
              font-black
              tracking-[-0.08em]
              leading-[0.85]
            "
          >
            Print On Demand
          </h1>

          <p
            className="
              mt-2
              text-[18px]
              sm:text-[26px]
              md:text-[38px]
              font-semibold
              tracking-[-0.03em]
              text-white/90
            "
          >
            with Dropshipping in India
          </p>

        </div>

      </div>
    </section>
  );
}