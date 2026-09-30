"use client";

import { useState } from "react";

export default function SameDayDeliveryFAQ() {
const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "What products can CluesStyle customize?",
      a: "We customize t-shirts, hoodies, jerseys, tote bags, mugs, bottles, caps, corporate gifts and promotional merchandise."
    },
    {
      q: "Do you offer bulk corporate orders?",
      a: "Yes. We specialize in bulk orders for companies, startups, colleges, events and marketing campaigns."
    },
    {
      q: "Which printing methods are available?",
      a: "We provide Screen Printing, DTF Printing, Embroidery, Sublimation, Vinyl and premium branding solutions."
    },
    {
      q: "What is the minimum order quantity?",
      a: "MOQ varies by product and customization method."
    },
    {
      q: "Can you help with design and artwork?",
      a: "Yes. Our design team can prepare print-ready artwork."
    },
    
    {
      q: "Do you deliver across India?",
      a: "Yes. We ship custom apparel and merchandise across India."
    },
    {
      q: "How long does production take?",
      a: "Most orders are completed within 5–15 business days."
    },
    {
      q: "Can I customize gifts with my logo?",
      a: "Absolutely. We provide logo printing, engraving and embroidery."
    },
    {
      q: "Do you provide samples?",
      a: "Sample availability depends on product category and order quantity."
    },
    {
      q: "Can you handle urgent orders?",
      a: "Yes, depending on production schedules and artwork approval."
    },{
      q: "Can you handle urgent orders?",
      a: "Yes, depending on production schedules and artwork approval."
    },
    {
      q: "Can you handle urgent orders?",
      a: "Yes, depending on production schedules and artwork approval."
    },
    
  ];

  const leftFaqs = faqs.slice(0, 7);
  const rightFaqs = faqs.slice(5);

  return (
    <section className="py-20 md:py-20">
  <div className="mx-auto max-w-[1600px] ">

    {/* Heading */}
    <div className="mb-16 pl-4 md:pl-2">
      <div className="flex items-center gap-4">
        <img
          src="/gold-arrow.png"
          alt="Arrow"
          className="h-8 w-8 md:h-10 md:w-10 object-contain"
        />

        <h2 className="text-3xl md:text-5xl font-black text-black leading-none">
          Frequently Asked Questions
        </h2>
      </div>
    </div>

    <div className="grid -mt-10  lg:grid-cols-[1.35fr_1fr_1fr] gap-6 items-start">

      {/* IMAGE */}
      <div
        className="
          relative
          overflow-hidden
          rounded-[32px]
          border border-black/15
          shadow-[2px_2px_0px_#000]
          h-[550px]
          lg:h-[525px]
        "
      >
        <img
          src="/faq-same-day-delivery.jpg"
          alt="CluesStyle FAQ"
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute bottom-5 left-10 text-white">
          <span className="block text-[50px] md:text-[70px] font-black leading-[0.9]">
            Got
            
            Questions?
          </span>

          {/* <p className="mt-5 max-w-[420px] text-[18px] text-white/90">
            Everything you need to know about custom apparel,
            corporate gifting, merchandise and branding solutions.
          </p> */}
        </div>
      </div>

      {/* COLUMN 1 */}
      <div className="space-y-4">
        {leftFaqs.map((faq, index) => (
          <div
            key={index}
            className="
              rounded-2xl
              border border-black/15
              bg-white
              px-6
              py-4
              shadow-[1px_1px_0px_#000]
              transition-all
              duration-300
              hover:shadow-[5px_8px_0px_#000]
            "
          >
            <button
              onClick={() =>
                setOpenFaq(openFaq === index ? null : index)
              }
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <span className="text-[16px] md:text-[17px]  text-black">
                {faq.q}
              </span>

              <span
                className={`
                  text-[26px]
                  leading-none
                  transition-transform
                  duration-300
                  ${openFaq === index ? "rotate-45" : ""}
                `}
              >
                +
              </span>
            </button>

            <div
              className={`
                overflow-hidden
                transition-all
                duration-300
                ${
                  openFaq === index
                    ? "max-h-[200px] mt-3"
                    : "max-h-0"
                }
              `}
            >
             <p className="leading-6 text-gray-600">
  <span className="text-sm md:text-base">
    {faq.a}
  </span>
</p>
            </div>
          </div>
        ))}
      </div>

      {/* COLUMN 2 */}
      <div className="space-y-4">
        {rightFaqs.map((faq, index) => {
          const actualIndex = index + leftFaqs.length;

          return (
            <div
              key={actualIndex}
              className="
                rounded-2xl
                border border-black/15
                bg-white
                px-6
                py-4
                shadow-[1px_1px_0px_#000]
                transition-all
                duration-300
                hover:shadow-[5px_8px_0px_#000]
              "
            >
              <button
                onClick={() =>
                  setOpenFaq(
                    openFaq === actualIndex
                      ? null
                      : actualIndex
                  )
                }
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <span className="text-[16px] md:text-[17px]  text-black">
                  {faq.q}
                </span>

                <span
                  className={`
                    text-[26px]
                    leading-none
                    transition-transform
                    duration-300
                    ${
                      openFaq === actualIndex
                        ? "rotate-45"
                        : ""
                    }
                  `}
                >
                  +
                </span>
              </button>

              <div
                className={`
                  overflow-hidden
                  transition-all
                  duration-300
                  ${
                    openFaq === actualIndex
                      ? "max-h-[200px] mt-3"
                      : "max-h-0"
                  }
                `}
              >
                <p className="leading-6 text-gray-600">
  <span className="text-sm md:text-base">
    {faq.a}
  </span>
</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  </div>
</section>
  );
}