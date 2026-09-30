// app/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import HeroSection from "./components/HeroSection";
import FloatingProductsSection from "./components/floating-component";
import ScrollFramesSection from "./components/video";
import FAQSection from "./components/faq";
import CustomerSuccessSection from "./components/Customersuccesssection";
import Link from "next/link";
import BulkOrderButton from "./components/BulkOrderButton";
import SplitTestimonials from "./components/home-reviews";
import GoogleReviews from "./components/GoogleReviews";
import FifaWorldCupCard from "./components/offer";





export default function Home() {
  const [showAllCorporate, setShowAllCorporate] = useState(false);
  const [showBulkDetails, setShowBulkDetails] = useState(false);
  const [showApparelDetails, setShowApparelDetails] = useState(false);

  return (
    <div className="min-h-screen w-full bg-white ">
      
      <div className="layout-container">
      {/* to get the hero shifted down remove -mt-20 */}
      {/* ========== HERO SECTION with #823AEC Overlay ========== */}
      {/* earlier it was cluesstyle-hero-section.webp for hero section */}
      
      <HeroSection/>

<div className="text-center pt-6 pb-3 sm:py-10">
  <h1
    className="
      text-[42px]
      sm:text-[60px]
      md:text-[90px]
      lg:text-[120px]
      font-black
      tracking-[0.01em]
      leading-[0.82]
      text-black
    "
  >
    Custom T-Shirt Printing In India
  </h1>

 
</div> 

 


{/* new design */}
<section className="py-6 sm:py-10 md:py-20">
  
  <div className="mx-auto max-w-[1600px] px-4">
{/* <div className="mb-10 flex items-center gap-3">
              <img
                src="/gold-arrow.png" // your arrow image
                alt="arrow"
                className="w-8 h-8"
              />
              <h2 className="text-3xl font-semibold md:text-4xl">
                Shop Our Best Selling Products 
              </h2>
          </div> */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

      {/* Card 1 */}
     <a
  href="/apparels"
  className="
    group relative flex overflow-hidden
  rounded-xl lg:rounded-2xl
  border border-black/20
  bg-[#f7f9fc]
  bg-[url('/#')]
  bg-cover
  bg-left-top
  bg-[length:180px]
  shadow-[1px_1px_0px_#000]
  transition-all duration-300 ease-out
  hover:-translate-y-2
  hover:shadow-[5px_8px_0px_#000]
  h-[220px]
  sm:h-[150px]
  lg:h-[370px]
  "
>
  {/* LEFT */}
  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className=" text-black font-bold leading-tight text-sm sm:text-base lg:text-[28px]">
      Apparels
      </h4>
    </div>

    <div
  className="
    flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>

  {/* RIGHT IMAGE */}
<div
  className="
    absolute right-0 top-2 sm:top-0
    w-[70%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/multi-apparel.webp"
    alt="Box Before"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/multi-apparel.webp"
    alt="Box After"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a>

      {/* Card 2 */}
     <a
  href="/sports-wear"
  className="
    group relative flex overflow-hidden
    rounded-xl lg:rounded-2xl
    border border-black/20
    bg-[#f7f9fc]
    bg-[url('/#')]
    bg-cover
    bg-left-top
    bg-contain
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    h-[220px]
  sm:h-[150px]
  lg:h-[370px]
  "
>
  {/* LEFT */}
  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
    <h4 className=" text-black font-bold leading-tight text-sm sm:text-base lg:text-[28px]">
      Sports Wear
      </h4>
    </div>

    <div
  className="
    flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>

  {/* RIGHT IMAGE */}
<div
  className="
    absolute right-0 top-3 sm:top-6
    w-[70%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/sport-tshirt-front-1.webp"
    alt="Box Before"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/sport-tshirt-front-1.webp"
    alt="Box After"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a>

  <a
  href="/accessories"
  className="
   group relative flex overflow-hidden
  rounded-xl lg:rounded-2xl
  border border-black/20
  bg-[#f7f9fc]
  bg-[url('/')]
  bg-cover
  bg-left-top
  bg-[length:180px]
  shadow-[1px_1px_0px_#000]
  transition-all duration-300 ease-out
  hover:-translate-y-2
  hover:shadow-[5px_8px_0px_#000]
  h-[220px]
  sm:h-[150px]
  lg:h-[370px]
  "
>

  <Image
  src="https://cdn.cluesstyle.com/public/packdora-texture.png" // your background image
  alt=""
  width={120}
  height={120}
  className="
    absolute
    top-0
    left-0
    z-0
    opacity-20
    pointer-events-none
    select-none
  "
/>
  {/* LEFT */}
  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className=" text-black font-bold leading-tight text-sm sm:text-base lg:text-[34px]">
      Accessories
      </h4>
    </div>

    <div
  className="
    flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>

  {/* RIGHT IMAGE */}
<div
  className="
    absolute right-0 top-4 sm:top-8
    w-[70%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/accessory.webp"
    alt="Box Before"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/accessory.webp"
    alt="Box After"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a>
      {/* Card 3 */}
     
    </div>

  </div>
</section>



{/* new design */}
    <section className="py-6 sm:py-10 md:py-5 ">
        <div className="mx-auto max-w-[1600px] px-4">
          
          {/* Section Header */}
          <div className="mb-4 sm:mb-6 md:mb-10 flex items-center gap-3">
              <img
                src="https://cdn.cluesstyle.com/public/gold-arrow.png" // your arrow image
                alt="arrow"
                className="w-8 h-8"
              />
              <h2 className="text-3xl font-semibold md:text-4xl">
                Corporate Product Categories
              </h2>
          </div>

          {/* Categories Grid - Pacdora Style */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">



   {/* CARD 2 */}
 


 {/* CARD 4*/}

 <a
  href="/products/apparels/polo-t-shirt"
  className="
    group relative flex overflow-hidden
    rounded-xl lg:rounded-2xl
    border border-black/20 bg-white
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    h-[130px]
    sm:h-[150px]
    lg:h-[200px]
  "
>
  {/* LEFT */}
  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className="font-bold text-gray-900 leading-tight text-sm sm:text-base lg:text-lg">
      Polo T-Shirt
      </h4>
    </div>

    <div
  className="
    flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>

  {/* RIGHT IMAGE */}
<div
  className="
    absolute right-0 top-0
    w-[55%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/green-polo-before.webp"
    alt="Box Before"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/green-polo-after.webp"
    alt="Box After"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a>



<a
  href="/products/apparels/round-neck-t-shirt"
  className="
    group relative flex overflow-hidden
    rounded-xl lg:rounded-2xl
    border border-black/20 bg-white
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    h-[130px]
    sm:h-[150px]
    lg:h-[200px]
  "
>
  {/* LEFT */}
  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className="font-bold text-gray-900 leading-tight text-sm sm:text-base lg:text-lg">
     Round Neck
      </h4>
    </div>

    <div
  className="
    flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>

  {/* RIGHT IMAGE */}
<div
  className="
    absolute right-0 top-0
    w-[55%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/round-neck-tshirt-icon.webp"
    alt="Round Neck"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/round-neck-tshirt-icon.webp"
    alt="Round Neck "
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a>


{/* 3rd product */}




<a
  href="/products/apparels/oversized-t-shirt"
  className="
    group relative flex overflow-hidden
    rounded-xl lg:rounded-2xl
    border border-black/20 bg-white
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    h-[130px]
    sm:h-[150px]
    lg:h-[200px]
  "
>
  {/* LEFT */}
  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className="font-bold text-gray-900 leading-tight text-sm sm:text-base lg:text-lg">
     Over Sized <br/>T-Shirts
      </h4>
    </div>

    <div
  className="
    flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>

  {/* RIGHT IMAGE */}
<div
  className="
    absolute right-0 top-0
    w-[55%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/oversize-tshirt.webp"
    alt="Black and white oversized t-shirt"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/oversize-tshirt.webp"
    alt="Box After"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a>



{/* 4th product */}


{/* <a
  href="/sports-wear"
  className="
    group relative flex overflow-hidden
    rounded-xl lg:rounded-2xl
    border border-black/20 bg-white
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    h-[130px]
    sm:h-[150px]
    lg:h-[200px]
  "
>
  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className="font-bold text-gray-900 leading-tight text-sm sm:text-base lg:text-lg">
      Jersey's
      </h4>
    </div>

    <div
  className="
   flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>

<div
  className="
    absolute right-0 top-0
    w-[55%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/indian-jersey-before.webp"
    alt="Box Before"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/indian-jersey-after.webp"
    alt="Box After"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a> */}

{/* 5th product */}



<a
  href="/products/apparels/full-sleeves-shirt"
  className="
    group relative flex overflow-hidden
    rounded-xl lg:rounded-2xl
    border border-black/20 bg-white
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    h-[130px]
    sm:h-[150px]
    lg:h-[200px]
  "
>
  {/* LEFT */}
  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className="font-bold text-gray-900 leading-tight text-sm sm:text-base lg:text-lg">
       Full Sleeves Shirt
      </h4>
    </div>

    <div
  className="
   flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>

  {/* RIGHT IMAGE */}
<div
  className="
    absolute right-0 top-0
    w-[55%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/shirt-before.webp"
    alt="Box Before"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/shirt-after.webp"
    alt="Box After"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a>


{/* 6th product */}



<a
  href="/products/apparels/hoodies"
  className="
    group relative flex overflow-hidden
    rounded-xl lg:rounded-2xl
    border border-black/20 bg-white
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    h-[130px]
    sm:h-[150px]
    lg:h-[200px]
  "
>
  {/* LEFT */}
  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className="font-bold text-gray-900 leading-tight text-sm sm:text-base lg:text-lg">
      Hoodies
      </h4>
    </div>

    <div
  className="
   flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>

  {/* RIGHT IMAGE */}
<div
  className="
    absolute right-0 top-0
    w-[55%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/hoodie-before.webp"
    alt="Box Before"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/hoodie-after.webp"
    alt="Box After"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a>


{/* 7th product */}

  <a
  href="/products/bags/tote-bag"
  className="
    group relative flex overflow-hidden
    rounded-xl lg:rounded-2xl
    border border-black/20 bg-white
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    h-[130px]
    sm:h-[150px]
    lg:h-[200px]
  "
>
  {/* LEFT */}
  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className="font-bold text-gray-900 leading-tight text-sm sm:text-base lg:text-lg">
      Eco-Friendly Canvas Tote Bag
      </h4>
    </div>

    <div
  className="
    flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>

  {/* RIGHT IMAGE */}
<div
  className="
    absolute right-0 top-0
    w-[55%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/tote-bag-before.webp"
    alt="Box Before"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/tote-bag-after.webp"
    alt="Box After"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a>
{/* new Products Lists with new css starts here*/}





<a
  href="/products/bags/office-bag"
  className="
    group relative flex overflow-hidden
    rounded-xl lg:rounded-2xl
    border border-black/20 bg-white
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    h-[130px]
    sm:h-[150px]
    lg:h-[200px]
  "
>
  {/* LEFT */}
  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className="font-bold text-gray-900 leading-tight text-sm sm:text-base lg:text-lg">
      Blue Bag
      </h4>
    </div>

    <div
  className="
   flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>

  {/* RIGHT IMAGE */}
<div
  className="
    absolute right-0 top-0
    w-[55%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/blue-bag-before.webp"
    alt="Box Before"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/blue-bag-after.webp"
    alt="Box After"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a>


{/* 

<a
  href="/products/caps-collection"
  className="
    group relative flex overflow-hidden
    rounded-xl lg:rounded-2xl
    border border-black/20 bg-white
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    h-[130px]
    sm:h-[150px]
    lg:h-[200px]
  "
>
  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className="font-bold text-gray-900 leading-tight text-sm sm:text-base lg:text-lg">
       Cap
      </h4>
    </div>

    <div
  className="
    flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>

<div
  className="
    absolute right-0 top-0
    w-[55%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/new-cap-before.webp"
    alt="Box Before"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/new-cap-after.webp"
    alt="Box After"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a> */}




<a
  href="/products/badge-collection"
  className="
    group relative flex overflow-hidden
    rounded-xl lg:rounded-2xl
    border border-black/20 bg-white
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    h-[130px]
    sm:h-[150px]
    lg:h-[200px]
  "
>
  {/* LEFT */}
  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className="font-bold text-gray-900 leading-tight text-sm sm:text-base lg:text-lg">
    Pin Batches
      </h4>
    </div>

    <div
  className="
    flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>

  {/* RIGHT IMAGE */}
<div
  className="
    absolute right-0 top-0
    w-[55%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/pin-badges.webp"
    alt="Pin Badges"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/pin-badges.webp"
    alt="Pin Badges"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a>



{/* 
<a
  href="/products/frames"
  className="
    group relative flex overflow-hidden
    rounded-xl lg:rounded-2xl
    border border-black/20 bg-white
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    h-[130px]
    sm:h-[150px]
    lg:h-[200px]
  "
>
  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className="font-bold text-gray-900 leading-tight text-sm sm:text-base lg:text-lg">
      Certificate Frames 
      </h4>
    </div>

    <div
  className="
   flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>

<div
  className="
    absolute right-0 top-0
    w-[55%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/frame-before.webp"
    alt="Box Before"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/frame-after.webp"
    alt="Box After"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a> */}



{/* 
<a
  href="/products/umbrella"
  className="
    group relative flex overflow-hidden
    rounded-xl lg:rounded-2xl
    border border-black/20 bg-white
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    h-[130px]
    sm:h-[150px]
    lg:h-[200px]
  "
>
  
  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className="font-bold text-gray-900 leading-tight text-sm sm:text-base lg:text-lg">
      Umbrella
      </h4>
    </div>

    <div
  className="
    flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>

<div
  className="
    absolute right-0 top-0
    w-[55%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/umbrella-before.webp"
    alt="Box Before"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/umbrella-after.webp"
    alt="Box After"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a> */}


{/* 
<a
  href="/products/executive-kit"
  className="
    group relative flex overflow-hidden
    rounded-xl lg:rounded-2xl
    border border-black/20 bg-white
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    h-[130px]
    sm:h-[150px]
    lg:h-[200px]
  "
>

  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className="font-bold text-gray-900 leading-tight text-sm sm:text-base lg:text-lg">
     3-in-1 Executive Kit
      </h4>
    </div>

    <div
  className="
   flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>


<div
  className="
    absolute right-0 top-0
    w-[55%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/bottle-box-before.webp"
    alt="Box Before"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/bottle-box-after.webp"
    alt="Box After"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a>



<a
  href="/products/identity-cards"
  className="
    group relative flex overflow-hidden
    rounded-xl lg:rounded-2xl
    border border-black/20 bg-white
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    h-[130px]
    sm:h-[150px]
    lg:h-[200px]
  "
>

  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className="font-bold text-gray-900 leading-tight text-sm sm:text-base lg:text-lg">
      Identity Cards
      </h4>
    </div>

    <div
  className="
    flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>


<div
  className="
    absolute right-0 top-0
    w-[55%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/identy-card-before.webp"
    alt="Box Before"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/identy-card-after.webp"
    alt="Box After"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a>


 */}





{/* new 4 cards  */}

<div className={showAllCorporate ? "contents" : "hidden lg:contents"}>

{/* 
<a
  href="/products/trophies-collection"
  className="
    group relative flex overflow-hidden
    rounded-xl lg:rounded-2xl
    border border-black/20 bg-white
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    h-[130px]
    sm:h-[150px]
    lg:h-[200px]
  "
>

  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className="font-bold text-gray-900 leading-tight text-sm sm:text-base lg:text-lg">
     Trophy's
      </h4>
    </div>

    <div
  className="
    flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>


<div
  className="
    absolute right-0 top-0
    w-[55%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/trophy-before.webp"
    alt="Box Before"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/trophy-after.webp"
    alt="Box After"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a>







<a
  href="/products/visiting-cards"
  className="
    group relative flex overflow-hidden
    rounded-xl lg:rounded-2xl
    border border-black/20 bg-white
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    h-[130px]
    sm:h-[150px]
    lg:h-[200px]
  "
>
  <div
    className="
      relative z-20
      flex flex-col justify-between
      w-[60%] p-3
      sm:w-1/2 sm:p-4
      lg:p-4
      bg-transparent
    "
  >
    <div>
      <h4 className="font-bold text-gray-900 leading-tight text-sm sm:text-base lg:text-lg">
    Visiting Cards
      </h4>
    </div>

    <div
  className="
    flex items-center justify-center
    rounded-full
    h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9
    bg-[#000]
    
    
    transition-all duration-300 ease-out
    group-hover:bg-[#444444]
    group-hover:-translate-y-1
    
  "
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    className="transition-transform duration-300 group-hover:translate-x-[2px]"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</div>
  </div>

<div
  className="
    absolute right-0 top-0
    w-[55%] h-full
    z-10
    overflow-hidden
  "
>
  <Image
    src="/visiting-card.webp"
    alt="Box Before"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-100 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-0
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />

  <Image
    src="/visiting-card.webp"
    alt="Box After"
    fill
    className="
      object-contain
      transition-all duration-700 ease-out
      opacity-0 scale-100
      drop-shadow-[0_0px_0px_rgba(0,0,0,0)]
      group-hover:opacity-100
      group-hover:scale-110
      group-hover:drop-shadow-[0_14px_12px_rgba(0,0,0,0.18)]
    "
  />
</div>
</a> */}


{/* new cards */}

{/* new Products lists with new css ends here */}


 {/* CARD 5*/}
 

</div>
{/* /mobile show-more group */}

</div>

{/* Mobile-only: expand/collapse the extra 8 cards */}
<div className="flex justify-center lg:hidden mt-4 pb-4">
  <button
    type="button"
    onClick={() => setShowAllCorporate((v) => !v)}
    className="
      inline-flex items-center gap-2
      px-5 py-2.5
      rounded-full
      border border-black/20
      bg-white
      text-black
      font-semibold text-sm
      shadow-[1px_1px_0px_#000]
      transition-all duration-300 ease-out
      active:translate-y-0.5
    "
  >
    {showAllCorporate ? "Show Less" : "View More"}
    <span
      className={`inline-block transition-transform duration-300 ${showAllCorporate ? "rotate-180" : ""}`}
    >
      ↓
    </span>
  </button>
</div>

<div className="hidden lg:flex justify-left py-10 ">
  <button>
  <a
    href="/products"
    className="
      group inline-flex items-center gap-3
      px-5 py-3
      rounded-[25px]
      bg-black
      text-white
      font-semibold
      text-sm sm:text-base
      border border-black
      
      transition-all duration-300 ease-out
      hover:bg-[#444444]
      hover:-translate-y-1
      hover:shadow-[6px_8px_0px_#000]
    "
  >
    View More Products

    <span
      className="
        flex items-center justify-center
        w-7 h-7
        rounded-full
        bg-white text-black
        transition-transform duration-300
        group-hover:translate-x-1
      "
    >
      →
    </span>
    </a>
  </button>
</div>
        </div>
      </section>



{/* right content left video */}




<div className="relative mx-auto  max-w-[1600px] px-4 py-3 sm:py-5">

  
  <div className="absolute inset-0 -z-10 opacity-30">
    <div className="h-full w-full bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(to_right,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px]" />
  </div>
<div className="mb-4 sm:mb-6 md:mb-10 flex items-center gap-3">
              <img
                src="https://cdn.cluesstyle.com/public/gold-arrow.png" // your arrow image
                alt="arrow"
                className="w-8 h-8"
              />
              <h2 className="text-3xl font-semibold md:text-4xl">
               Fast and Easy Bulk Orders 
              </h2>
          </div>
  <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">



  {/* LEFT CONTENT */}
  <div
    className="
      flex flex-col justify-center

      rounded-b-2xl lg:rounded-2xl
      border border-t-0 lg:border
      border-black/20

      bg-white
      p-5 sm:p-6 lg:p-10

      shadow-[6px_6px_0px_#000]
      order-2 lg:order-1
    "
  >
    <button
      type="button"
      onClick={() => setShowBulkDetails((v) => !v)}
      className="w-full flex items-center justify-between gap-3 text-left lg:pointer-events-none lg:cursor-default"
    >
      <h3 className="text-[28px] md:text-[38px] font-black leading-tight">
        Bulk Orders Made Easy
      </h3>
      <span
        className={`flex-shrink-0 lg:hidden flex items-center justify-center w-8 h-8 rounded-full border border-black/30 text-lg font-bold transition-transform duration-300 ${showBulkDetails ? "rotate-45" : ""}`}
      >
        +
      </span>
    </button>

    <div className={`${showBulkDetails ? "block" : "hidden"} lg:block`}>
      <p className="mt-4  text-gray-700">
    <span className="text-[14px] leading-relaxed">
      If you want to order in{" "}
      <a href="/bulk-order" className="underline">
        bulk for a company corporate function
      </a>
      , school, team sport, or even a clothes brand, then Cluesstyle will help make things easy for you. Custom T-shirts, hoodies, uniforms, and merchandise are what we are best known for.
    </span>
  </p>

  <p className="mt-4 leading-7 text-gray-700">
    <span className="text-[14px] leading-relaxed">
      We have a well-oiled process that makes working with us from the beginning to end an enjoyable experience. We pride ourselves on providing top-notch embroidery, DTF printing, and screen printing services, so that our clients will always get excellent value for their money, irrespective of the quantity of pieces required.
    </span>
  </p>

  <p className="mt-4 leading-7 text-gray-700">
    <span className="text-[14px] leading-relaxed">
      It is our job to see that everything is done as planned. Our efforts in working out your branding needs will pay off, as you will have exactly what you want in the end.
    </span>
  </p>
    </div>

    <div className="mt-6 flex flex-wrap gap-3">
     <BulkOrderButton/>
    
      <Link href="/bulk-order">
        <button
          className="
            rounded-[25px]
            border border-black
            px-6 py-3
            font-semibold
            transition
            hover:bg-black
            hover:text-white
          "
        >
          Learn More
        </button>
      </Link>
    </div>
  </div>

  {/* RIGHT VIDEO */}
  <div
    className="
      overflow-hidden
      rounded-t-2xl lg:rounded-2xl
      border border-black/20
      bg-[#c7c3e6]
      p-3 lg:p-0

      shadow-[6px_6px_0px_#000]
      order-1 lg:order-2
    "
  >
    <div
      className="
        relative w-full overflow-hidden rounded-xl
        aspect-[4/5]
        sm:aspect-[16/10]
        lg:h-full
        min-h-[320px]
        lg:min-h-[100%]
      "
    >
      <video
        src="/bulk-order-hp.webm"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  </div>

</div>
</div>


{/* Video section start here */}
<div className="relative mx-auto max-w-[1600px] px-4 py-20">

  {/* Background grid */}
  <div className="absolute inset-0 -z-10 opacity-30">
    <div className="h-full w-full bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(to_right,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px]" />
  </div>

  {/* Heading */}
  



<div className="mb-4 sm:mb-6 md:mb-10 flex items-center gap-3">
              <img
                src="https://cdn.cluesstyle.com/public/gold-arrow.png" // your arrow image
                alt="arrow"
                className="w-8 h-8"
              />
              <h2 className="text-3xl font-semibold md:text-4xl">
                Corporate Product Categories
              </h2>
          </div>
<div className="
  grid grid-cols-1 
  lg:grid-cols-2 
  lg:gap-6   /* 🔥 GAP ONLY ON DESKTOP */
">

 
  <div className="
    overflow-hidden 
    rounded-t-2xl lg:rounded-2xl
    border border-black/20 
    bg-[#c7c3e6] 
    p-3 lg:p-0
    shadow-[6px_6px_0px_#000]
  ">
    <div className="relative w-full overflow-hidden rounded-xl aspect-[4/5] sm:aspect-[16/10] lg:h-full min-h-[320px] lg:min-h-[100%]">
  <video
    src="/custom-p-o-d.webm"
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 h-full w-full object-cover"
  />
</div>
  </div>


  <div className="
    flex flex-col justify-center 

    rounded-b-2xl lg:rounded-2xl
    border border-t-0 lg:border   /* 🔥 merge on mobile */
    border-black/20

    bg-white
    p-5 sm:p-6 lg:p-8 

    shadow-[6px_6px_0px_#000]
  ">

    <button
      type="button"
      onClick={() => setShowApparelDetails((v) => !v)}
      className="w-full flex items-center justify-between gap-3 text-left lg:pointer-events-none lg:cursor-default"
    >
      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold">
        Design Your Custom Apparel
      </h3>
      <span
        className={`flex-shrink-0 lg:hidden flex items-center justify-center w-8 h-8 rounded-full border border-black/30 text-lg font-bold transition-transform duration-300 ${showApparelDetails ? "rotate-45" : ""}`}
      >
        +
      </span>
    </button>

    <div className={`${showApparelDetails ? "block" : "hidden"} lg:block`}>
      <p className="mt-3 text-sm sm:text-base text-gray-700">
        <span className="text-[14px] leading-relaxed">
       Make your ideas come alive using CluesStyle’s user-friendly custom apparel designer to create unique t-shirts, hoodies, sweatshirts, and even uniforms. Add your own logos, text, artwork, and designs to get a preview of your creation in real-time and tweak all aspects of your apparel according to your requirements.
      </span>
      </p>

      <p className="mt-3 text-sm sm:text-base text-gray-700">
        <span className="text-[14px] leading-relaxed">
        From corporate businesses to schools, from teams competing in sports events to promotion campaigns, whatever kind of custom apparel you need to be created, we’ve got everything covered with our online designer where you’ll get the freedom to choose what apparel style, color, and type of customization you want for your products.
        </span>
      </p>

      <p className="mt-3 text-sm sm:text-base text-gray-700">
        <span className="text-[14px] leading-relaxed">
        There is no need for any prior knowledge in designing anything; just upload your artwork, make the necessary changes, get a preview of your design, and place your order for your final output. 
      </span>
      </p>
    </div>

    
    
    <div className="mt-5 flex flex-col sm:flex-row gap-3">
      <a href="/customized-your-t-shirt">
      <button className="w-full sm:w-auto rounded-[25px] bg-black px-5 py-3 text-white font-medium transition hover:bg-gray-800">
        Create a mockup
      </button>
      </a>
    <a href="/print-on-demand">
      <button className="w-full sm:w-auto rounded-[25px] border border-black px-5 py-3 font-medium transition hover:bg-black hover:text-white">
        Learn more
      </button>
      </a>
    </div>

  </div>

</div>
</div>


{/* new right video and left content */}

{/* new cards section video */}
<section className="py-1">
  <div className="mx-auto max-w-[1655px] px-6 lg:px-10">

    {/* Heading */}
    <div className="mb-4 sm:mb-6 md:mb-10 flex items-center gap-4">
      <img
        src="https://cdn.cluesstyle.com/public/gold-arrow.png"
        alt="Arrow"
        className="h-8 w-8 md:h-10 md:w-10 object-contain"
      />

      <h2 className="text-3xl md:text-5xl font-black text-black leading-none">
        Our Top Selling Products
      </h2>
    </div>

    <div className="grid grid-cols-12 gap-5">

      {/* CARD 1 */}
      <a
        href="/products/custom-tshirts"
        className="
          col-span-12
          lg:col-span-3
          group
          relative
          overflow-hidden
          rounded-2xl
          border border-black/20
          shadow-[1px_1px_0px_#000]
          hover:-translate-y-2
          hover:shadow-[5px_8px_0px_#000]
          transition-all duration-300 ease-out
          h-[470px]
        "
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/polo-yellow.webm" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/30 lg:bg-black/20 lg:group-hover:bg-black/30 transition-all duration-300" />

        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">

          {/* Hover Heading — visible by default on mobile, hover-reveal on desktop */}
          <div className="overflow-hidden mb-4">
            <div
              className="
                translate-y-0
                opacity-100
                lg:translate-y-full
                lg:opacity-0
                lg:group-hover:translate-y-0
                lg:group-hover:opacity-100
                transition-all duration-500
              "
            >
             <span
              className="
              block font-[900] text-[45px] leading-[1.0] tracking-[-0.02em] drop-shadow-lg text-white
              ">
                Custom
                <br />
                Apparel
                
                
              </span>
            </div>
          </div>

          {/* Static Button */}
          <button
            className="
               w-fit
              rounded-full
              border border-white/50
              bg-white/10
              backdrop-blur-md
              px-6
              py-3
              hover:bg-[#000]
              text-[15px]
              font-bold
              text-white
            "
          >
            Explore Products
          </button>
        </div>
      </a>

      {/* CARD 2 */}
      <a
        href="/products/hoodies"
        className="
          col-span-12
          lg:col-span-6
          group
          relative
          overflow-hidden
          rounded-2xl
          border border-black/20
          shadow-[1px_1px_0px_#000]
          hover:-translate-y-2
          hover:shadow-[5px_8px_0px_#000]
          transition-all duration-300
          h-[470px]
        "
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/all-products.webm" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/30 lg:bg-black/20 lg:group-hover:bg-black/30 transition-all duration-300" />

        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">

          <div className="overflow-hidden mb-4">
            <div
              className="
                translate-y-0
                opacity-100
                lg:translate-y-full
                lg:opacity-0
                lg:group-hover:translate-y-0
                lg:group-hover:opacity-100
                transition-all duration-500
              "
            >
              <span
              className="
              block font-[900] text-[45px] leading-[1.0] tracking-[-0.02em] drop-shadow-lg text-white
              ">
                Corporate
                <br />
                Gift
                
                Solutions
              </span>
            </div>
          </div>

          <button
            className="
              w-fit
              rounded-full
              border border-white/50
              bg-white/10
              backdrop-blur-md
              px-6
              py-3
              hover:bg-[#000]
              text-[15px]
              font-bold
              text-white
            "
          >
            Explore Products
          </button>
        </div>
      </a>

      {/* CARD 3 */}
      <a
        href="/products/corporate-gifts"
        className="
          col-span-12
          lg:col-span-3
          group
          relative
          overflow-hidden
          rounded-2xl
          border border-black/20
          shadow-[1px_1px_0px_#000]
          hover:-translate-y-2
          hover:shadow-[5px_8px_0px_#000]
          transition-all duration-300
          h-[470px]
        "
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/barcellona.webm" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/30 lg:bg-black/20 lg:group-hover:bg-black/30 transition-all duration-300" />

        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">

          <div className="overflow-hidden mb-4">
            <div
              className="
                translate-y-0
                opacity-100
                lg:translate-y-full
                lg:opacity-0
                lg:group-hover:translate-y-0
                lg:group-hover:opacity-100
                transition-all duration-500
              "
            >
              <span
              className="
              block font-[900] text-[45px] leading-[1.0] tracking-[-0.02em] drop-shadow-lg text-white
              ">
                Custom 
                <br />
               
                
               Jersey
              </span>
            </div>
          </div>

          <button
            className="
               w-fit
              rounded-full
              border border-white/50
              bg-white/10
              backdrop-blur-md
              px-6
              py-3
              hover:bg-[#000]
              text-[15px]
              font-bold
              text-white
            "
          >
            Explore Products
          </button>
        </div>
      </a>

    </div>
  </div>
</section>
 {/* new cards sectopm video */}

{/* video sections ends here */}
      {/* ========== TOP MOCKUP CATEGORIES SECTION ========== */}
  

{/* <FifaWorldCupCard/> */}


      <FAQSection/>

  
<SplitTestimonials/>

    {/* <CustomerSuccessSection/> */}


<div className="mx-auto max-w-[1600px] px-4 py-8 overflow-hidden">

      {/* Heading */}
      <div className="mb-10 flex items-center gap-3">
        <img
          src="https://cdn.cluesstyle.com/public/gold-arrow.png" // your arrow image
          alt="arrow"
          className="w-8 h-8"
        />
        <h2 className="text-3xl font-semibold md:text-4xl">
          Loved by designers worldwide
        </h2>
      </div>

      {/* 🔥 Marquee */}
      <div className="relative overflow-hidden">

        {/* Gradient fade (left & right) */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-white to-transparent z-10"></div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white to-transparent z-10"></div>

        {/* Moving Row */}
        <div className="flex w-max animate-marquee gap-12">

          {/* LOGOS */}
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12">
              
              <Image src="/company-logos/aws-logo.webp" alt="" width={120} height={40} className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition" />
              <Image src="/company-logos/Dream11_Logo.webp" alt="" width={120} height={40} className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition" />
              <Image src="/company-logos/decathlon-logo.webp" alt="" width={120} height={40} className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition" />
              <Image src="/company-logos/Cadbury-Logo.webp" alt="" width={120} height={40} className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition" />
              <Image src="/company-logos/tcs-logo.webp" alt="" width={120} height={40} className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition" />
              <Image src="/company-logos/iit-bomby.webp" alt="" width={120} height={40} className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition" />
              <Image src="/company-logos/enrich-logo.webp" alt="" width={120} height={40} className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition" />
              <Image src="/company-logos/pressto-logo.webp" alt="" width={120} height={40} className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition" />
              <Image src="/company-logos/somaiya.webp" alt="" width={120} height={40} className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition" />
              <Image src="/company-logos/urban-company.webp" alt="" width={120} height={40} className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition" />
              <Image src="/company-logos/iit-bomby.webp" alt="" width={120} height={40} className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition" />
              <Image src="/company-logos/eleganz-logo.webp" alt="" width={120} height={40} className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition" />
              <Image src="/company-logos/zoomlion.webp" alt="" width={120} height={40} className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition" />
              <Image src="/company-logos/bare-international-logo.webp" alt="" width={120} height={40} className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition" />
              <Image src="/company-logos/Black-and-veatch-logo.webp" alt="" width={120} height={40} className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition" />
              <Image src="/company-logos/atoy-print.webp" alt="" width={120} height={40} className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition" />

            </div>
          ))}

        </div>

      </div>
    </div>






{/* <a
  href="https://search.google.com/local/writereview?placeid=ChIJp2AFNILH5zsRVGa_VQ6moXc"
  target="_blank"
  rel="noopener noreferrer"
>
  Leave a Google Review
</a> */}

      {/* ========== Ending bottom div closure ========== */}

          </div>    
    </div>
  );
}