"use client";

import { useState } from "react";

export default function AccessoriesFAQSection() {
const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "What can I customize?",
      a: "You can customize a wide range of products including t-shirts, polo shirts, hoodies, jackets, caps, tote bags, mugs, bottles, flasks, office accessories, and corporate gift items with your logo, artwork, or branding."
    },
    {
      q: "Can I place a bulk order?",
      a: "Yes, CluesStyle specializes in bulk orders for corporate events, employee onboarding, conferences, promotional campaigns, schools, colleges, sports teams, and marketing activities."
    },
    {
      q: "What printing methods do you offer?",
      a: "We offer multiple customization techniques including screen printing, DTF printing, DTG printing, embroidery, heat transfer printing, sublimation, and other branding methods depending on the product and design requirements."
    },
    {
      q: "Is there a minimum order quantity?",
      a: "Minimum order quantities may vary depending on the product and customization method. We also offer flexible ordering options for selected products and bulk requirements."
    },
    {
      q: "Can I upload my own logo or design?",
      a: "Yes, you can upload your company logo, artwork, or custom design through our online design tool or share it with our team for professional customization assistance."
    },
    
    {
      q: "How long does it take to complete an order?",
      a: "Production and delivery timelines depend on the product type, customization requirements, and order quantity. Most orders are processed and shipped within a few business days after design approval."
    },
    {
      q: "Can I order custom corporate gifts?",
      a: "Yes, we offer customized corporate gifting solutions for employee appreciation, client gifting, festive gifting, promotional campaigns, and brand-building initiatives."
    },
    {
      q: "Can I order a sample?",
      a: "Yes, sample orders are available for select products before placing a bulk order. Contact us for details."
    },
    {
      q: "Do you ship across India?",
      a: "Yes, CluesStyle delivers customized apparel, promotional products, and corporate gifts across India through trusted shipping partners."
    },
    {
      q: "How can I get a quote for a bulk order?",
      a: "You can request a quote by selecting your preferred products, sharing your customization requirements, and providing the expected quantity. Our team will provide a customized pricing proposal."
    },{
      q: "Can you handle urgent orders?",
      a: "Yes, depending on production schedules and artwork approval."
    },
    {
      q: "Why shop with CluesStyle?",
      a: "CluesStyle offers high-quality products, professional customization, competitive bulk pricing, reliable delivery, and dedicated support to help businesses create impactful branded merchandise and corporate gifts."
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
          src="/faq.webp"
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