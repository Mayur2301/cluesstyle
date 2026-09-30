"use client";
import { useState } from "react";
import Image from "next/image";
import {
  BarChart3,
  Boxes,
  ShieldCheck,
  PackageCheck,
  Sparkles,
   BadgeDollarSign,
  Palette,
  Wallet,
  Shirt,
  Truck,
  Box
} from "lucide-react";
import PodProfitCalculator from "./calculator";



const categories = [
  {
    title: "Best Sellers",
    image: "/g1.avif",
  },
  {
    title: "T-Shirts",
    image: "/g2.avif",
  },
  {
    title: "Hoodies & Jackets",
    image: "/g3.avif",
  },
  {
    title: "AOP Apparel",
    image: "/g4.avif",
  },
  {
    title: "Kids Clothing",
    image: "/g5.avif",
  },
  {
    title: "Home & Living",
    image: "/g6.avif",
  },
  {
    title: "Drinkware",
    image: "/g7.avif",
  },
  {
    title: "Pet Wear",
    image: "/g8.avif",
  },
];


const stats = [
  {
    title: "Products To Customize",
    value: "350+",
    icon: Boxes,
    bg: "bg-[#ebe6f4]",
    iconBg: "bg-[#f5efff]",
    iconColor: "text-[#b46cff]",
  },
  {
    title: "Designs Secured",
    value: "45M",
    icon: ShieldCheck,
    bg: "bg-[#f6e9e4]",
    iconBg: "bg-[#fff4ef]",
    iconColor: "text-[#ff7b39]",
  },
  {
    title: "Items Fulfilled",
    value: "5M+",
    icon: PackageCheck,
    bg: "bg-[#efe6c9]",
    iconBg: "bg-[#fff8df]",
    iconColor: "text-[#d6a400]",
  },
  {
    title: "Active Brands Today",
    value: "25,000+",
    icon: Sparkles,
    bg: "bg-[#dff2e9]",
    iconBg: "bg-[#effff7]",
    iconColor: "text-[#22d66b]",
  },
];

const features = [
  {
    title: "COD with Zero RTO Charges",
    description:
      "The only print on demand platform in India offering Cash on Delivery with no return to origin fees. Sell more with COD, zero risk, zero extra cost.",
    icon: BadgeDollarSign,
    iconColor: "text-[#d97706]",
    iconBg: "bg-[#fff4eb]",
    border: "border-[#f5c9a6]",
  },

  {
    title: "10+ Print Methods",
    description:
      "DTG, DTF, AOP, Engraving, Sublimation, Embroidery, Puff, UV Printing and more. All available under one roof.",
    icon: Palette,
    iconColor: "text-[#76a400]",
    iconBg: "bg-[#fff0f1]",
    border: "border-[#f7c4ca]",
  },

  {
    title: "Sell More, Earn More",
    description:
      "Automatic monthly cashback credited directly to your wallet. No claims needed. Just rewards that grow as your business scales.",
    icon: Wallet,
    iconColor: "text-[#20b8b8]",
    iconBg: "bg-[#e8ffff]",
    border: "border-[#a8eded]",
  },

  {
    title: "Your Brand. Every Package",
    description:
      "Branded neck labels, hang tags and thank you cards on every order. Your customer never sees another brand at their doorstep.",
    icon: Shirt,
    iconColor: "text-[#b028c4]",
    iconBg: "bg-[#ffe8ff]",
    border: "border-[#efb4f5]",
  },

  {
    title: "2–3 Day Dispatch Guaranteed",
    description:
      "95% of orders leave within 2–3 business days. Faster delivery means fewer support tickets and happier repeat customers.",
    icon: Truck,
    iconColor: "text-[#5c56ff]",
    iconBg: "bg-[#efedff]",
    border: "border-[#c6c2ff]",
  },

  {
    title: "In-House Manufacturing",
    description:
      "We manufacture apparel in-house at scale. No third-party suppliers, no out-of-stock surprises and consistent quality.",
    icon: Box,
    iconColor: "text-[#2848b8]",
    iconBg: "bg-[#edf2ff]",
    border: "border-[#c5d3ff]",
  },
];
const podFeatures = [
    {
      title: "350+ products, your designs",
      desc: "From oversized t-shirts and hoodies to mugs, tote bags and phone cases. Pick any product, add your design, and set price. Your catalogue, your brand, your margins.",
      icon: "",
    },
    {
      title: "Built for Indian sellers",
      desc: "Sell on Shopify, WooCommerce, Amazon or any storefront. COD supported across India gives your customers a great checkout experience.",
      icon: "",
    },
    {
      title: "From order to doorstep",
      desc: "Every order dispatched within 2-3 business days. Delivered across 29,000+ pincodes in India to metros, Tier 2, and Tier 3 cities.",
      icon: "",
    },
  ];

 const podCities = [
    { name: "Delhi NCR", href: "/print-on-demand/delhi" },
    { name: "Mumbai", href: "/print-on-demand/mumbai" },
    { name: "Bangalore", href: "/print-on-demand/bangalore" },
    { name: "Chennai", href: "/print-on-demand/chennai" },
    { name: "Hyderabad", href: "/print-on-demand/hyderabad" },
    { name: "Kolkata", href: "/print-on-demand/kolkata" },
  ];

  const podStats = [
    {
      value: "29,000+",
      label: "Pincodes covered across India",
    },
    {
      value: "2–5",
      label: "Day average delivery timeline",
    },
    {
      value: "28",
      label: "States + Union territories served",
    },
  ];


   

export default function PODHeroSection() {
  const podTestimonials = [
    {
      brand: "The Error Store",
      logo: "/error-store.avif",
      review:
        "So far my experience at Qikink is very good. The product that it provides is really good and the design quality is something I really appreciate. Keep up the good work and thank you for helping us in our journey.",
      customer: "Manan Jani",
      location: "Gujarat",
    },
    {
      brand: "Borbotom",
      logo: "/borbotom.avif",
      review:
        "Qikink has been an amazing partner for Borbotom. Their fabric quality, attention to detail, and customization options are top-notch. The team is professional, responsive, and ensures timely delivery for our store.",
      customer: "Adhyan Agrawal",
      location: "Maharashtra",
    },
    {
      brand: "HootPop",
      logo: "/hootpop.avif",
      review:
        "They handle returns very well and make sure that defects are taken care of promptly. They are very trustworthy when it comes to print on demand sites. I've gotten great feedback from my customers regarding the quality.",
      customer: "Shiv",
      location: "Pune",
    },
  ];
  return (
    <>
    <section className="w-full bg-[#ffff] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-14 lg:py-20">
        <div className="grid lg:grid-cols-2 items-center gap-12">
          
          {/* LEFT CONTENT */}
          <div className="relative z-10">
            {/* Small Icon */}
            <div className="mb-5">
              <span className="text-[#ff6b00] text-4xl">✦</span>
            </div>

            {/* Heading */}
            <h1
              className="
                text-[42px]
                sm:text-[58px]
                lg:text-[72px]
                leading-[1]
                font-black
                tracking-[-0.03em]
                text-[#1d1d1d]
                max-w-[700px]
              "
            >
              Start Print on
              <br />
              Demand in India
              <br />
              <span className="text-[#ff6b00]">
                with Dropshipping
              </span>
            </h1>

            {/* Description */}
            <p
              className="
                mt-7
                text-[15px]
                sm:text-[17px]
                leading-[1.8]
                text-[#5f5f5f]
                max-w-[520px]
              "
            >
              Join 25,000+ Indian sellers who design, sell and earn.
              CluesStyle prints and delivers across India.
              No inventory. No upfront investment.
            </p>

            {/* CTA */}
            <div className="mt-9">
              <a
                href="#"
                className="
                  group inline-flex items-center gap-3
                  bg-[#ff6b00]
                  text-white
                  px-7 py-4
                  rounded-[6px]
                  font-semibold
                  text-[15px]
                  shadow-[3px_3px_0px_#000]
                  transition-all duration-300
                  hover:bg-black
                  hover:-translate-y-1
                  hover:shadow-[6px_8px_0px_#000]
                "
              >
                Start Selling

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative flex justify-center items-center">
            
            {/* Circle Background */}
            <div
              className="
                absolute
                w-[320px]
                h-[320px]
                sm:w-[420px]
                sm:h-[420px]
                lg:w-[520px]
                lg:h-[520px]
                rounded-full
                bg-[#ffd7b5]
              "
            />

            {/* Inner Circle */}
            <div
              className="
                absolute
                w-[250px]
                h-[250px]
                sm:w-[340px]
                sm:h-[340px]
                lg:w-[430px]
                lg:h-[430px]
                rounded-full
                bg-[#ffbf8b]
              "
            />

            {/* Main Image */}
            <div
              className="
                relative
                z-10
                w-full
                max-w-[520px]
                h-[420px]
                sm:h-[520px]
              "
            >
              <Image
                src="/pod-header.png"
                alt="Print on Demand"
                fill
                priority
                className="
                  object-contain
                  drop-shadow-[0_25px_35px_rgba(0,0,0,0.18)]
                "
              />
            </div>

            {/* Floating Stars */}
            <div className="absolute top-10 left-10 text-[#ff6b00] text-3xl rotate-12">
              ✦
            </div>

            <div className="absolute bottom-14 right-10 text-[#ff6b00] text-3xl -rotate-12">
              ✦
            </div>

            <div className="absolute top-32 right-0 text-[#ffb37a] text-2xl">
              ✦
            </div>
          </div>
        </div>
      </div>
    </section>


    <section className="w-full bg-[#ffff] py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Label */}
        <div className="inline-flex items-center rounded-full border border-orange-200 bg-white px-3 py-1 text-[11px] font-medium text-orange-500">
          ✦ THE BASICS
        </div>

        {/* Heading */}
        <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[#111827]">
          What is Print on Demand in India?
        </h2>

        {/* Main Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6">
          
          {/* Left Blue Card */}
          <div className="rounded-3xl bg-[#0E4F8A] p-8 text-white flex flex-col justify-between min-h-[360px]">
            <div className="text-orange-400 text-5xl leading-none">“</div>

            <div className="space-y-5 text-[15px] leading-7">
              <p>
                Print on demand in India is an ecommerce model where sellers
                offer custom-designed products without holding inventory. Each
                order is printed and shipped only after a customer buys.
              </p>

              <p className="font-semibold">
                The biggest unlocks for Indian POD sellers are COD acceptance,
                pincode coverage beyond metros, and protection against
                return-to-origin (RTO) losses.
              </p>

              <p>
                New to the model? Read our complete guide to{" "}
                <span className="text-orange-300 font-medium">
                  print on demand
                </span>{" "}
                to understand how it works globally.
              </p>
            </div>

            {/* POD Tags */}
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
                ✓ COD Support
              </span>
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
                ✓ No RTO Charges
              </span>
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
                ✓ Monthly Discounts
              </span>
            </div>
          </div>

          {/* Right POD Feature Cards */}
          <div className="space-y-4">
            {podFeatures.map((podFeature, index) => (
              <div
                key={index}
                className="rounded-2xl border border-orange-200 bg-[#faf7f2] p-6 flex gap-4"
              >
               

                <div>
                  <h3 className="font-semibold text-[#111827]">
                    {podFeature.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    {podFeature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>



    <section className="w-full bg-[#ffff] py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        
        {/* Heading */}
        <div className="text-center max-w-4xl mx-auto">
          <h2
            className="
              text-[34px]
              sm:text-[42px]
              lg:text-[52px]
              font-black
              tracking-[-0.03em]
              leading-[1.05]
              text-[#1b1b1b]
            "
          >
            350+ Real Print on Demand
            <br />
            Products for Your Brand
          </h2>

          <p
            className="
              mt-5
              text-[14px]
              sm:text-[15px]
              leading-[1.8]
              text-[#5c5c5c]
              max-w-3xl
              mx-auto
            "
          >
            From everyday bestsellers to niche products, all printed
            on demand, quality-checked, and shipped under your brand
            name from India.
          </p>
        </div>

        {/* Grid */}
        <div
  className="
    mt-14
    grid
    grid-cols-2
    md:grid-cols-4
    gap-5
    items-start
  "
>
  {categories.map((item, index) => (
    <a
      key={index}
      href="#"
      className={`
        group relative overflow-hidden
        rounded-[18px]
        border border-black/10
        bg-white
        aspect-[0.82]
        shadow-[1px_1px_0px_#000]
        transition-all duration-300 ease-out
        hover:-translate-y-2
        hover:shadow-[5px_8px_0px_#000]

        ${
          index % 2 === 1
            ? "mt-10 lg:mt-14"
            : "mt-0"
        }
      `}
    >
      {/* Image */}
      <div className="relative w-full h-full overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="
            object-cover
            transition-transform duration-700 ease-out
            group-hover:scale-110
          "
        />
      </div>

      {/* Bottom Gradient */}
      <div
        className="
          absolute inset-x-0 bottom-0
          h-[45%]
          bg-gradient-to-t
          from-black/80
          via-black/20
          to-transparent
        "
      />

      {/* Title */}
      <div
        className="
          absolute bottom-4 left-0 right-0
          z-10 text-center
        "
      >
        <h3
          className="
            text-white
            text-[15px]
            sm:text-[17px]
            font-bold
          "
        >
          {item.title}
        </h3>
      </div>
    </a>
  ))}
</div>

        {/* CTA */}
        <div className="flex justify-center pt-14">
          <a
            href="#"
            className="
              group inline-flex items-center gap-3
              px-7 py-4
              rounded-[5px]
              bg-[#ff6b00]
              text-white
              font-semibold
              text-sm sm:text-base
              border border-black
              shadow-[3px_3px_0px_#000]
              transition-all duration-300 ease-out
              hover:bg-black
              hover:-translate-y-1
              hover:shadow-[6px_8px_0px_#000]
            "
          >
            Browse Our Print on Demand Products

            <span
              className="
                transition-transform duration-300
                group-hover:translate-x-1
              "
            >
              →
            </span>
          </a>
        </div>
      </div>
    </section>


    <section className="w-full bg-[#ffff] py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        
        {/* Heading */}
        <div className="text-center max-w-4xl mx-auto">
          <h2
            className="
              text-[34px]
              sm:text-[46px]
              lg:text-[58px]
              leading-[1.05]
              tracking-[-0.03em]
              font-black
              text-[#1b1b1b]
            "
          >
            Why 25,000+ Brands Use CluesStyle
            <br />
            for Print on Demand in India?
          </h2>

          <p
            className="
              mt-5
              text-[14px]
              sm:text-[16px]
              leading-[1.8]
              text-[#5d5d5d]
              max-w-3xl
              mx-auto
            "
          >
            Built for Indian ecommerce sellers — from COD support to
            in-house manufacturing, everything is optimized for fast,
            scalable and reliable print on demand operations.
          </p>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-2 gap-x-14 gap-y-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="
                  group
                  flex items-start gap-5
                "
              >
                {/* Icon Box */}
                <div
                  className={`
                    ${feature.iconBg}
                    ${feature.border}
                    w-[74px]
                    h-[74px]
                    rounded-[20px]
                    border
                    flex items-center justify-center
                    shrink-0
                    transition-all duration-300
                    group-hover:-translate-y-1
                  `}
                >
                  <Icon
                    className={`${feature.iconColor} w-9 h-9`}
                    strokeWidth={2.2}
                  />
                </div>

                {/* Content */}
                <div>
                  <h3
                    className="
                      text-[24px]
                      sm:text-[28px]
                      font-bold
                      leading-[1.2]
                      text-[#1c1c1c]
                    "
                  >
                    {feature.title}
                  </h3>

                  <p
                    className="
                      mt-3
                      text-[14px]
                      sm:text-[15px]
                      leading-[1.8]
                      text-[#5f5f5f]
                    "
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>

<section className="w-full bg-[#ffff] py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-10 items-start">
        
        {/* Left Content */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1d2433]">
            Print on Demand Across India
          </h2>

          <div className="mt-6 space-y-5 text-[15px] leading-7 text-[#4b5563] max-w-2xl">
            <p>
              India’s ecommerce market is no longer just Delhi, Mumbai, and
              Bangalore. Buyers in Tier 2 and Tier 3 cities, Coimbatore,
              Indore, Surat, Jaipur, and Patna, are ordering custom products
              online at scale. If your POD partner can’t deliver there, you’re
              leaving money on the table.
            </p>

            <p>
              Qikink delivers to 29,000+ pincodes across every Indian state.
              Standard, express delivery options available.
            </p>

            <p>
              Whether you're targeting metro buyers in Delhi and Mumbai or
              building a brand for rural areas, Qikink’s logistics network
              ensures your customers receive orders on time, every time. We
              support COD across all pincodes, so your buyers in smaller cities
              get the same checkout experience as metros.
            </p>
          </div>

          {/* City Links */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            {podCities.map((city) => (
              <a
                key={city.name}
                href={city.href}
                className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 text-sm font-medium text-[#1d2433] transition-all hover:border-orange-300 hover:bg-orange-50"
              >
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                {city.name}
              </a>
            ))}
          </div>
        </div>

        {/* Right Stats Card */}
        <div className="rounded-2xl bg-[#0E4F8A] p-8 text-white">
          <div className="space-y-7">
            {podStats.map((stat, index) => (
              <div
                key={stat.label}
                className={`${
                  index !== podStats.length - 1
                    ? "border-b border-white/15 pb-6"
                    : ""
                }`}
              >
                <h3 className="text-4xl font-bold tracking-tight">
                  {stat.value}
                </h3>
                <p className="mt-2 text-sm text-white/75">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>


    <section className="w-full bg-[#ffff] py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        
        {/* Heading */}
        <div className="text-center">
          <h2
            className="
              text-[34px]
              sm:text-[46px]
              lg:text-[58px]
              font-black
              leading-[1.05]
              tracking-[-0.03em]
              text-[#1b1b1b]
            "
          >
            India's One-Stop Print on Demand
            <br />
            and Fulfilment Partner
          </h2>

          <p
            className="
              mt-5
              text-[15px]
              sm:text-[17px]
              text-[#5d5d5d]
              leading-[1.7]
            "
          >
            From first order to 5M+ items fulfilled, built for Indian
            sellers, designed for Indian ecommerce.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid lg:grid-cols-[1.25fr_1fr] gap-5">
          
          {/* Left Large Card */}
          <div
            className="
              rounded-[28px]
              bg-[#e7e6f8]
              p-8 lg:p-10
              min-h-[340px]
              flex flex-col justify-end
              shadow-sm
              transition-all duration-300
              hover:-translate-y-1
            "
          >
            <div
              className="
                w-20 h-20
                rounded-[20px]
                bg-white/70
                flex items-center justify-center
                backdrop-blur-sm
              "
            >
              <BarChart3
                className="w-10 h-10 text-[#5b5cf0]"
                strokeWidth={2.3}
              />
            </div>

            <div className="mt-8">
              <h3
                className="
                  text-[28px]
                  sm:text-[34px]
                  font-semibold
                  text-[#1d1d1d]
                "
              >
                Company Growth
              </h3>

              <div
                className="
                  mt-2
                  text-[42px]
                  sm:text-[54px]
                  font-black
                  tracking-[-0.03em]
                  text-[#1d1d1d]
                "
              >
                240%
              </div>
            </div>
          </div>

          {/* Right Small Cards */}
          <div className="grid grid-cols-2 gap-5">
            {stats.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className={`
                    ${item.bg}
                    rounded-[24px]
                    p-5
                    min-h-[160px]
                    flex flex-col justify-between
                    transition-all duration-300
                    hover:-translate-y-1
                  `}
                >
                  <div
                    className={`
                      ${item.iconBg}
                      w-14 h-14
                      rounded-[18px]
                      flex items-center justify-center
                    `}
                  >
                    <Icon
                      className={`w-7 h-7 ${item.iconColor}`}
                      strokeWidth={2.5}
                    />
                  </div>

                  <div>
                    <p
                      className="
                        text-[15px]
                        text-[#404040]
                        leading-[1.4]
                      "
                    >
                      {item.title}
                    </p>

                    <h4
                      className="
                        mt-2
                        text-[34px]
                        font-black
                        tracking-[-0.03em]
                        text-[#1b1b1b]
                      "
                    >
                      {item.value}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>

    <PodProfitCalculator/>
    <section className="bg-[#ffff] py-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h2 className="text-[38px] font-bold text-[#1f2937] leading-tight">
              Trusted by Real Brands, Loved by Customers!
            </h2>

            <p className="mt-3 text-gray-500 max-w-2xl text-sm leading-6">
              25,000+ Indian brands trust Qikink for print on demand
              fulfillment. Here's what they say about the quality,
              delivery, and service.
            </p>
          </div>

          {/* arrows */}
          <div className="flex gap-4 mt-3">
            <button className="text-orange-500 text-xl hover:opacity-70">
              ←
            </button>
            <button className="text-orange-500 text-xl hover:opacity-70">
              →
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {podTestimonials.map((podItem, index) => (
            <div
              key={index}
              className="rounded-2xl border border-black p-6 bg-white min-h-[430px] flex flex-col"
            >
              {/* Logo */}
             <img
                src={podItem.logo}
                alt={podItem.brand}
                className="block h-20 w-auto object-contain mb-5 self-start"
                />

              {/* Brand */}
              <h3 className="text-2xl font-semibold text-[#1f2937] mb-4">
                {podItem.brand}
              </h3>

              {/* Review */}
              <p className="text-gray-600 text-sm leading-7 flex-1">
                "{podItem.review}"
              </p>

              {/* Customer */}
              <div className="mt-6">
                <p className="font-semibold text-[#1f2937]">
                  {podItem.customer} -
                </p>
                <p className="text-gray-500 text-sm">
                  {podItem.location}
                </p>
              </div>

              {/* Stars */}
              <div className="mt-5 flex gap-1 text-orange-500 text-sm">
                ★ ★ ★ ★ ★
              </div>
            </div>
          ))}
        </div>

        {/* Bottom dots */}
        

      </div>
    </section>
    </>
  );
}