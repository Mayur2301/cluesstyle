"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const floatingProducts = [
  "/green-cap.webp",
  "/water-bottle.jpeg",
  "/products/cap.webp",
  "/products/mug.webp",
  "/products/polo.webp",
  "/products/bottle.webp",
  "/products/tote.webp",
  "/products/shoes.webp",
];

const positions = [
  "top-[4%] left-[16%]",
  "top-[0%] left-[44%]",
  "top-[8%] right-[14%]",
  "top-[34%] left-[4%]",
  "top-[32%] right-[4%]",
  "bottom-[10%] left-[16%]",
  "bottom-[2%] left-[44%]",
  "bottom-[10%] right-[14%]",
];

export default function FloatingProductsSection() {
  const [hovered, setHovered] = useState(false);
  const [locked, setLocked] = useState(false);

  const showProducts = hovered || locked;

  return (
    <section className="relative mx-auto flex min-h-[850px] w-full max-w-[1450px] items-center justify-center overflow-hidden px-4 py-24">

      {/* Background Glow */}
      <div className="absolute h-[600px] w-[600px] rounded-full bg-blue-100 blur-3xl opacity-60" />

      {/* MAIN PRODUCT */}
      <motion.div
        onHoverStart={() => !locked && setHovered(true)}
        onHoverEnd={() => !locked && setHovered(false)}
        onClick={() => setLocked(!locked)}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3 }}
        className="relative z-20 cursor-pointer"
      >
        <div className="relative h-[420px] w-[300px] sm:h-[520px] sm:w-[380px] md:h-[620px] md:w-[450px]">

          <Image
            src="/t-shirt-white.webp"
            alt="Main Product"
            fill
            priority
            className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.18)]"
          />

        </div>
      </motion.div>

      {/* FLOATING PRODUCTS */}
      <AnimatePresence>
        {showProducts &&
          floatingProducts.map((item, index) => (
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                scale: 0.2,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -8, 0],
              }}
              exit={{
                opacity: 0,
                scale: 0.2,
              }}
              transition={{
                duration: 0.45,
                delay: index * 0.05,
                y: {
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut",
                },
              }}
              className={`absolute ${positions[index]} z-10`}
            >
              <div
                className="
                  relative
                  h-[88px]
                  w-[88px]
                  sm:h-[110px]
                  sm:w-[110px]
                  md:h-[130px]
                  md:w-[130px]
                  overflow-hidden
                  rounded-full
                  bg-white
                  shadow-[0_12px_40px_rgba(0,0,0,0.12)]
                  backdrop-blur-xl
                  transition-transform
                  duration-300
                  hover:scale-110
                "
              >

                <Image
                  src={item}
                  alt="Product"
                  fill
                  className="object-cover"
                />

              </div>
            </motion.div>
          ))}
      </AnimatePresence>

    </section>
  );
}