// app/sports/football/[slug]/ProductDetailsClient
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { FaBoxes, FaStar, FaTruck } from "react-icons/fa";
import { useParams } from "next/navigation";
// ================== TYPES ==================
interface Product {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  price: number;
  priceLabel: string;
  // img: string;
  quantityReq: number;
  priceRange: "budget" | "mid" | "premium";
  category: string;
  size: string;
  images: string[]; // <-- replace img
  description?: string;
  features?: string[];
  material?: string;
  turnaround?: string;
  badge?:string;
  rating?:number;
  reviewCount?:number;
  colors?: {
  label: string;
  hex: string;
  }[];
   sameDayAvailable?: boolean;
  discount?:number;
}

// ================== MOCK DATA ==================
const productsData: Product[] = [
  {
    id: "1",
    name: "Solid Full Sleeve Shirts",
    slug: "round-neck-full-sub-cricket-jersey",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
      "/round-neck-full-sub-football/white-black-full-sublimation-round neck-front.webp",
    "/round-neck-full-sub-football/white-black-full-sublimation-round neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "round-neck-full-sub-cricket-jersey",
   sameDayAvailable: true,
  },


  {
    id: "2",
    name: "Solid Full Sleeve Shirts",
    slug: "round-neck-full-sub-football-jersey-sky-blue",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
      "/round-neck-full-sub-football/sport-sky-blue-full-sublimation-round neck-front.webp",
    "/round-neck-full-sub-football/sport-sky-blue-full-sublimation-round neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "round-neck-full-sub-cricket-jersey",
   sameDayAvailable: true,
  },


  {
    id: "3",
    name: "Solid Full Sleeve Shirts",
    slug: "round-neck-full-sub-football-jersey-black-and-white",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
      "/round-neck-full-sub-football/teal-phantom-full-sublimation-round neck-front.webp",
    "/round-neck-full-sub-football/teal-phantom-full-sublimation-round neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "round-neck-full-sub-football-jersey",
   sameDayAvailable: true,
  },

   {
    id: "4",
    name: "Solid Full Sleeve Shirts",
    slug: "round-neck-full-sub-football-jersey-pink-and-gray",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
      "/round-neck-full-sub-football/sport-white-pink-full-sublimation-round neck-front.webp",
    "/round-neck-full-sub-football/sport-white-pink-full-sublimation-round neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "round-neck-full-sub-football-jersey",
   sameDayAvailable: true,
  },


  {
    id: "5",
    name: "Solid Full Sleeve Shirts",
    slug: "round-neck-full-sub-football-jersey-gray-and-black",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
      "/round-neck-full-sub-football/sport-black-grey-full-sublimation-round neck-front.webp",
    "/round-neck-full-sub-football/sport-black-grey-full-sublimation-round neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "round-neck-full-sub-football-jersey",
   sameDayAvailable: true,
  },


   {
    id: "6",
    name: "Solid Full Sleeve Shirts",
    slug: "round-neck-full-sub-football-jersey-whitish-with-black",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/round-neck-full-sub-football/sport-whtie-full-sublimation-round neck-back.webp",
    "/round-neck-full-sub-football/sport-whtie-full-sublimation-round neck-front.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "round-neck-full-sub-football-jersey",
   sameDayAvailable: true,
  },

  
   {
    id: "7",
    name: "Solid Full Sleeve Shirts",
    slug: "round-neck-full-sub-football-jersey-bluesh-and-black",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
      "/round-neck-full-sub-football/sport-vneck-full-sublimation-round neck-front.webp",
    "/round-neck-full-sub-football/sport-vneck-full-sublimation-round neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "round-neck-full-sub-football-jersey",
   sameDayAvailable: true,
  },


  {
    id: "8",
    name: "Solid Full Sleeve Shirts",
    slug: "round-neck-full-sub-football-jersey-white-with-red-tipping",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
      "/round-neck-full-sub-football/sport-vneck-white-full-sublimation-round neck-front.webp",
    "/round-neck-full-sub-football/sport-vneck-white-full-sublimation-round neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "round-neck-full-sub-football-jersey",
   sameDayAvailable: true,
  },

{
    id: "9",
    name: "Solid Full Sleeve Shirts",
    slug: "round-neck-full-sub-football-jersey-redish-with-blue",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
      "/round-neck-full-sub-football/sport-red-blue-full-sublimation-round neck-back.webp",
    "/round-neck-full-sub-football/sport-red-blue-full-sublimation-round neck-front.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "round-neck-full-sub-football-jersey",
   sameDayAvailable: true,
  },


  {
    id: "10",
    name: "Solid Full Sleeve Shirts",
    slug: "round-neck-full-sub-football-jersey-royal-blue",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
      "/round-neck-full-sub-football/sport-royal-blue-full-sublimation-round neck-front.webp",
    "/round-neck-full-sub-football/sport-royal-blue-full-sublimation-round neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "round-neck-full-sub-football-jersey",
   sameDayAvailable: true,
  },


  {
    id: "11",
    name: "Solid Full Sleeve Shirts",
    slug: "round-neck-full-sub-football-jersey-cream-with-blue",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
      "/round-neck-full-sub-football/sport-beige-full-sublimation-round neck-front.webp",
    "/round-neck-full-sub-football/sport-beige-full-sublimation-round neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "round-neck-full-sub-football-jersey",
   sameDayAvailable: true,
  },



  
  {
    id: "12",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-cream-with-blue",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
      "/collar-football-jersey/collar-full-sublimation-polo-neck-tshirt-front.webp",
    "/collar-football-jersey/collar-full-sublimation-polo-neck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



   {
    id: "13",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-cream-with-red",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
      "/collar-football-jersey/sport-red-full-sublimation-collar-neck-front.webp",
    "/collar-football-jersey/sport-red-full-sublimation-collar-neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



  {
    id: "14",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-blue-with-orange-patches",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
      "/collar-football-jersey/sport-blue-full-sublimation-collar-neck-front.webp",
    "/collar-football-jersey/sport-blue-full-sublimation-collar-neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },


   {
    id: "15",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-golden-grey",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/sport-yellow-full-sublimation-collar-neck-.webp",
    "/collar-football-jersey/sport-yellow-full-sublimation-collar-neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



  {
    id: "16",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-blue-with-white",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/sport-white-full-sublimation-collar-neck-front.webp",
    "/collar-football-jersey/sport-white-full-sublimation-collar-neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



    {
    id: "17",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-royal-blue-with-cream",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/sport-navy-blue-full-sublimation-collar-neck-front.webp",
    "/collar-football-jersey/sport-navy-blue-full-sublimation-collar-neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },

 {
    id: "18",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-black-with-grey",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/sport-grey-full-sublimation-collar-neck-front.webp",
    "/collar-football-jersey/sport-grey-full-sublimation-collar-neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



   {
    id: "19",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-blue-with-yellow-white-tipping",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/sport-white-navy-blue-full-sublimation-collar-neck-front.webp",
    "/collar-football-jersey/sport-white-navy-blue-full-sublimation-collar-neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },


   {
    id: "20",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-cream-with-yellow-design",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/sport-beige-full-sublimation-collar-neck-front.webp",
    "/collar-football-jersey/sport-beige-full-sublimation-collar-neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },


    {
    id: "21",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-deep-sea",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/collar-football-jersey/sport-green-full-sublimation-collar-neck-front.webp",
    "/collar-football-jersey/sport-green-full-sublimation-collar-neck-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



  {
    id: "22",
    name: "Solid Full Sleeve Shirts",
    slug: "football-apparel-kit-blue-neon",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/football-apparel-kit/white-bluefullkit-full-sub-vneck-tshirt-front.webp",
    "/football-apparel-kit/white-bluefullkit-full-sub-vneck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "football-apparel-kit",
   sameDayAvailable: true,
  },

  {
    id: "23",
    name: "Solid Full Sleeve Shirts",
    slug: "football-apparel-kit-navy-blue",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/football-apparel-kit/navy-bluefullkit-full-sub-vneck-tshirt-front.webp",
    "/football-apparel-kit/navy-white-bluefullkit-full-sub-vneck-tshirt-front.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "football-apparel-kit",
   sameDayAvailable: true,
  },


  {
    id: "24",
    name: "Solid Full Sleeve Shirts",
    slug: "football-apparel-kit-white-blue",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/football-apparel-kit/white-blue-fullkit-full-sub-vneck-tshirt-front.webp",
    "/football-apparel-kit/white-blue-fullkit-full-sub-vneck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "football-apparel-kit",
   sameDayAvailable: true,
  },


   {
    id: "25",
    name: "Solid Full Sleeve Shirts",
    slug: "football-apparel-kit-royal-blue",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/football-apparel-kit/royal-bluefullkit-full-sub-vneck-tshirt-front.webp",
    "/football-apparel-kit/royal-bluefullkit-full-sub-vneck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "football-apparel-kit",
   sameDayAvailable: true,
  },


   {
    id: "26",
    name: "Solid Full Sleeve Shirts",
    slug: "football-apparel-kit-royal-blue-with-white",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/football-apparel-kit/1royal-blue-fullkit-full-sub-vneck-tshirt-front.webp",
    "/football-apparel-kit/1royal-blue-fullkit-full-sub-vneck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "football-apparel-kit",
   sameDayAvailable: true,
  },


  {
    id: "27",
    name: "Solid Full Sleeve Shirts",
    slug: "football-apparel-kit-redish-black",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/football-apparel-kit/fullkit-full-sub-vneck-tshirt-front.webp",
    "/football-apparel-kit/fullkit-full-sub-vneck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "football-apparel-kit",
   sameDayAvailable: true,
  },

   {
    id: "28",
    name: "Solid Full Sleeve Shirts",
    slug: "full-sleeve-football-jersey-white-red",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/football-full-sleeve-jersey/whtie-red-full-sleves-full-sublimation-round-neck-tshirt-front.webp",
    "/football-full-sleeve-jersey/whtie-red-full-sleves-full-sublimation-round-neck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "full-sleeve-football-jersey",
   sameDayAvailable: true,
  },

{
    id: "29",
    name: "Solid Full Sleeve Shirts",
    slug: "full-sleeve-football-jersey-white",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/football-full-sleeve-jersey/white-full-sleves-full-sublimation-round-neck-tshirt-front.webp",
    "/football-full-sleeve-jersey/white-full-sleves-full-sublimation-round-neck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "full-sleeve-football-jersey",
   sameDayAvailable: true,
  },


  {
    id: "30",
    name: "Solid Full Sleeve Shirts",
    slug: "full-sleeve-football-jersey-white-blue",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/football-full-sleeve-jersey/white-blue-full-sleves-full-sublimation-round-neck-tshirt-front.webp",
    "/football-full-sleeve-jersey/white-blue-full-sleves-full-sublimation-round-neck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "full-sleeve-football-jersey",
   sameDayAvailable: true,
  },

  {
    id: "31",
    name: "Solid Full Sleeve Shirts",
    slug: "full-sleeve-football-jersey-royal-blue",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/football-full-sleeve-jersey/royal-blue-full-sleves-full-sublimation-round-neck-tshirt-front.webp",
    "/football-full-sleeve-jersey/royal-blue-full-sleves-full-sublimation-round-neck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "full-sleeve-football-jersey",
   sameDayAvailable: true,
  },


  {
    id: "32",
    name: "Solid Full Sleeve Shirts",
    slug: "full-sleeve-football-jersey-royal-blue-white-border",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/football-full-sleeve-jersey/royal-blue-full-sleves-full-sublimation-jacket-tshirt-front.webp",
    "/football-full-sleeve-jersey/royal-blue-full-sleves-full-sublimation-jacket-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "full-sleeve-football-jersey",
   sameDayAvailable: true,
  },


  {
    id: "33",
    name: "Solid Full Sleeve Shirts",
    slug: "full-sleeve-football-jersey-red-with-black",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/football-full-sleeve-jersey/red-full-sleves-full-sublimation-polo-neck-tshirt-front.webp",
    "/football-full-sleeve-jersey/red-full-sleves-full-sublimation-polo-neck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "full-sleeve-football-jersey",
   sameDayAvailable: true,
  },


  {
    id: "34",
    name: "Solid Full Sleeve Shirts",
    slug: "full-sleeve-football-jersey-orange-with-black",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/football-full-sleeve-jersey/full-sleves-full-sublimation-round-neck-tshirt-front.webp",
    "/football-full-sleeve-jersey/full-sleves-full-sublimation-round-neck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "full-sleeve-football-jersey",
   sameDayAvailable: true,
  },


   {
    id: "35",
    name: "Solid Full Sleeve Shirts",
    slug: "full-sleeve-football-jersey-black-with-grey-strip",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/football-full-sleeve-jersey/black-full-sleves-full-sublimation-polo-neck-tshirt-front.webp",
    "/football-full-sleeve-jersey/black-full-sleves-full-sublimation-polo-neck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "full-sleeve-football-jersey",
   sameDayAvailable: true,
  },


  {
    id: "36",
    name: "Solid Full Sleeve Shirts",
    slug: "full-sleeve-football-jersey-black-and-white",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/football-full-sleeve-jersey/black-full-sleves-full-sublimation-round-neck-tshirt-front.webp",
    "/football-full-sleeve-jersey/black-full-sleves-full-sublimation-round-neck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "full-sleeve-football-jersey",
   sameDayAvailable: true,
  },



   {
    id: "37",
    name: "Solid Full Sleeve Shirts",
    slug: "full-sleeve-football-jersey-cyan-chapions",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/football-full-sleeve-jersey/ciyan-full-sleves-full-sublimation-round-neck-tshirt-front.webp",
    "/football-full-sleeve-jersey/ciyan-full-sleves-full-sublimation-round-neck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "full-sleeve-football-jersey",
   sameDayAvailable: true,
  },


  {
    id: "38",
    name: "Solid Full Sleeve Shirts",
    slug: "full-sleeve-football-jersey-cyan-with-white",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/football-full-sleeve-jersey/ciyan-blue-full-sleves-full-sublimation-round-neck-tshirt-front.webp",
    "/football-full-sleeve-jersey/ciyan-blue-full-sleves-full-sublimation-round-neck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "full-sleeve-football-jersey",
   sameDayAvailable: true,
  },


{
    id: "39",
    name: "Solid Full Sleeve Shirts",
    slug: "sleeveless-white-green",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/sleeveless-football-jersey/white-green-sleeveless-full-sublimation-vneck-tshirt-front.webp",
    "/sleeveless-football-jersey/white-green-sleeveless-full-sublimation-vneck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "sleeveless-sports-jersey",
   sameDayAvailable: true,
  },


  {
    id: "40",
    name: "Solid Full Sleeve Shirts",
    slug: "sleeveless-grey-white",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/sleeveless-football-jersey/grey-whiet-sleeveless-full-sublimation-vneck-tshirt-front.webp",
    "/sleeveless-football-jersey/grey-whiet-sleeveless-full-sublimation-vneck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "sleeveless-sports-jersey",
   sameDayAvailable: true,
  },



  {
    id: "41",
    name: "Solid Full Sleeve Shirts",
    slug: "sleeveless-grey-orange",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/sleeveless-football-jersey/grey-orange-sleeveless-full-sublimation-vneck-tshirt-front.webp",
    "/sleeveless-football-jersey/grey-orange-sleeveless-full-sublimation-vneck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "sleeveless-sports-jersey",
   sameDayAvailable: true,
  },




   {
    id: "42",
    name: "Solid Full Sleeve Shirts",
    slug: "sleeveless-white-with-orange",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/sleeveless-football-jersey/whiet-orange-sleeveless-full-sublimation-vneck-tshirt-front.webp",
    "/sleeveless-football-jersey/whiet-orange-sleeveless-full-sublimation-vneck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "sleeveless-sports-jersey",
   sameDayAvailable: true,
  },



    {
    id: "43",
    name: "Solid Full Sleeve Shirts",
    slug: "sleeveless-white-with-golden",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/sleeveless-football-jersey/white-golden-sleeveless-full-sublimation-vneck-tshirt-front.webp",
    "/sleeveless-football-jersey/white-golden-sleeveless-full-sublimation-vneck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "sleeveless-sports-jersey",
   sameDayAvailable: true,
  },


  {
    id: "44",
    name: "Solid Full Sleeve Shirts",
    slug: "sleeveless-white-with-black",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
   "/sleeveless-football-jersey/whiet-sleeveless-full-sublimation-vneck-tshirt-front.webp",
    "/sleeveless-football-jersey/whiet-sleeveless-full-sublimation-vneck-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "sleeveless-sports-jersey",
   sameDayAvailable: true,
  },

{
    id: "45",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-white-with-neon",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/white-neon-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/white-neon-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



  {
    id: "46",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-black-with-golden-border",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/1black-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/1black-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },


  {
    id: "47",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-white-with-blue-shade",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/1blue-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/1blue-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },


   {
    id: "48",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-black-with-gold-patch",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/2black-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/2black-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



   {
    id: "49",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-plain-black-grey-spot",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/3black-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/3black-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



   {
    id: "50",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-blue-with-brown",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
     "/collar-football-jersey/beige-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/beige-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



  
   {
    id: "51",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-black-with-golden-design",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
     "/collar-football-jersey/black-grey-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/black-grey-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },


    {
    id: "52",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-neon-with-black-strip",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
     "/collar-football-jersey/black-neon-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/black-neon-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



   {
    id: "53",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-black-with-orange-strips",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
     "/collar-football-jersey/black-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/black-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },

   {
    id: "54",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-blue-with-cyan-design",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
     "/collar-football-jersey/blue-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/blue-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



  {
    id: "55",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-dark-cyan",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
     "/collar-football-jersey/Dgreen-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/Dgreen-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },


   {
    id: "56",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-slate",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
     "/collar-football-jersey/dgrey-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/dgrey-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },


   {
    id: "57",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-muted-teal",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
     "/collar-football-jersey/green-black-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/green-black-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },


   {
    id: "58",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-midnight-blue",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
     "/collar-football-jersey/navy-b-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/navy-b-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



    {
    id: "59",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-midnight-green",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
     "/collar-football-jersey/ng-black-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/ng-black-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },


   {
    id: "60",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-off-white",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/offwhiet-black-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/offwhiet-black-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



  {
    id: "61",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-light-beige",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/offwhiet-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/offwhiet-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },

   {
    id: "62",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-athletic-gold",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },


  {
    id: "63",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-dark-royal-blue",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/rblue-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/rblue-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },


   {
    id: "64",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-pastel-pink",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/red-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/red-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },

   {
    id: "65",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-dark-sapphire",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/royal-blue1-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/royal-blue1-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



   {
    id: "66",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-deep-indigo",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/wb1-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/wb1-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



   {
    id: "67",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-fading-light-gold",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/wb-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/wb-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



   {
    id: "68",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-cobalt-blue",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/white-blue-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/white-blue-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },


    {
    id: "69",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-crisp-white",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/white-mil-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/white-mil-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



   {
    id: "70",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-crisp-white-with-navy-blue",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/white-nb-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/white-nb-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },



  {
    id: "71",
    name: "Solid Full Sleeve Shirts",
    slug: "collar-t-shirt-full-sublimation-light-grey-with-origami-pattern",
    price: 999,
    priceLabel: "599",
    discount:40.04,
    images: [
    "/collar-football-jersey/yb-black-polo-neck-full-sublimation-half-sleeves-tshirt-front.webp",
    "/collar-football-jersey/yb-black-polo-neck-full-sublimation-half-sleeves-tshirt-back.webp",
      
  ],
    quantityReq: 1,
    priceRange: "budget",
    category: "Bottle",
    description: "High-quality screen printing on basic cotton t-shirts.",
    features: ["100% Cotton", "Screen printed", "Wash-resistant", "Available in 10+ colors"],
    material: "Premium Cotton, 180 GSM",
    turnaround: "5-7 business days",
    size: '12" x 12"',
    badge:"Best Seller",
    rating:4.3,
    reviewCount:1500,
    colors: [
        { label: "White", hex: "#FFFFFF" },
        { label: "Red", hex: "#FF0000" },
        { label: "Navy Blue", hex: "#0C142A" },
        { label: "Lavender", hex: "#B497DA" },
        { label: "Beige", hex: "#E3CAAC" },
        { label: "Ice Blue", hex: "#AEDAF2" },
        { label: "Carbon Grey", hex: "#31322D" },
        { label: "Black", hex: "#000000" },
    ],
    categorySlug: "collar-t-shirt-full-sublimation",
   sameDayAvailable: true,
  },




];

const sizes = ["all", '12" x 12"', '18" x 15"', '24" x 18"'];

// ================== SIDEBAR CONTENT (shared) ==================
function SidebarContent({
  tempMinPrice,
  tempMaxPrice,
  minPrice,
  maxPrice,
  globalMinPrice,
  globalMaxPrice,
  formatPrice,
  handleMinPriceChange,
  handleMaxPriceChange,
  applyPriceRange,
  resetPriceRange,
  setTempMinPrice,
  setTempMaxPrice,
  selectedSize,
  setSelectedSize,
  onLinkClick,
}: {
  tempMinPrice: number;
  tempMaxPrice: number;
  minPrice: number;
  maxPrice: number;
  globalMinPrice: number;
  globalMaxPrice: number;
  formatPrice: (n: number) => string;
  handleMinPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMaxPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  applyPriceRange: () => void;
  resetPriceRange: () => void;
  setTempMinPrice: (n: number) => void;
  setTempMaxPrice: (n: number) => void;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  onLinkClick?: () => void;
}) {
  return (
    <div className="px-5 py-6">
      {/* Size Filter */}
      <div className="mb-7">
        <h2 className="inline-block border-b-2 border-black pb-1 text-base font-black tracking-tight mb-4">
          Oversized sized 
        </h2>
        <div className="flex flex-col gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => { setSelectedSize(size); onLinkClick?.(); }}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all
                ${selectedSize === size
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white hover:border-black"
                }`}
            >
              {size === "all" ? "All Sizes" : size}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold">
          <i className="fas fa-filter text-sm"></i> Price Range
        </h3>

        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">{formatPrice(minPrice)}</span>
          <span className="text-gray-400">—</span>
          <span className="font-medium text-gray-700">{formatPrice(maxPrice)}</span>
        </div>

        <div className="relative mb-6 h-1 rounded-full bg-gray-200">
          <div
            className="absolute h-1 rounded-full bg-black"
            style={{
              left: `${((tempMinPrice - globalMinPrice) / (globalMaxPrice - globalMinPrice)) * 100}%`,
              right: `${100 - ((tempMaxPrice - globalMinPrice) / (globalMaxPrice - globalMinPrice)) * 100}%`,
            }}
          />
          <input
            type="range"
            min={globalMinPrice}
            max={globalMaxPrice}
            value={tempMinPrice}
            onChange={handleMinPriceChange}
            onMouseUp={applyPriceRange}
            onTouchEnd={applyPriceRange}
            className="absolute -top-2 w-full appearance-none bg-transparent pointer-events-none
              [&::-webkit-slider-thumb]:pointer-events-auto
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-black
              [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
              [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
            style={{ zIndex: tempMinPrice > globalMinPrice ? 2 : 1 }}
          />
          <input
            type="range"
            min={globalMinPrice}
            max={globalMaxPrice}
            value={tempMaxPrice}
            onChange={handleMaxPriceChange}
            onMouseUp={applyPriceRange}
            onTouchEnd={applyPriceRange}
            className="absolute -top-2 w-full appearance-none bg-transparent pointer-events-none
              [&::-webkit-slider-thumb]:pointer-events-auto
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-black
              [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
              [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
            style={{ zIndex: tempMaxPrice < globalMaxPrice ? 2 : 1 }}
          />
        </div>

        <div className="mb-3 flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Min</label>
            <input
              type="number"
              value={tempMinPrice}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val <= tempMaxPrice) setTempMinPrice(val);
              }}
              onBlur={applyPriceRange}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Max</label>
            <input
              type="number"
              value={tempMaxPrice}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= tempMinPrice) setTempMaxPrice(val);
              }}
              onBlur={applyPriceRange}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={resetPriceRange}
          className="text-xs text-gray-500 underline hover:text-black"
        >
          Reset price range
        </button>
      </div>
    </div>
  );
}

// ================== PAGINATION ==================
function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  const window = 1;
  for (let p = 1; p <= totalPages; p++) {
    if (
      p === 1 ||
      p === totalPages ||
      (p >= currentPage - window && p <= currentPage + window)
    ) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-1.5 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 px-3 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        ‹
      </button>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-gray-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`h-9 min-w-9 px-3 rounded-lg text-sm font-semibold transition-colors ${
              currentPage === p
                ? "bg-black text-white"
                : "border border-gray-200 text-gray-600 hover:border-black"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 px-3 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
}

// ================== PRODUCT CARD ==================
function ProductCard({ product, categorySlug }: { product: Product; categorySlug: string }) {
  return (
    <Link
      href={`/products/sports/cricket/${categorySlug}/${product.slug}`}
      className="group block h-full"
    >
  <div className="relative  h-64 sm:h-120 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1">
      {product.badge && (
        <div className="absolute top-3 left-3 z-20 ">
          <span className="rounded-md bg-green-600 px-3 py-1 text-[10px] font-bold uppercase text-white shadow-md">
            {product.badge}
          </span>
        </div>
      )}
    {/* Image Slider */}
    <div className="relative h-full w-full overflow-hidden">
      <div className="flex h-full w-[200%] transition-transform duration-700 ease-in-out group-hover:-translate-x-1/2">

        <div className="relative h-full w-full">
          <Image
             src={product.images[0]}
             alt={product.name}
             fill
             sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
             className="object-contain "
          />
        </div>

        <div className="relative h-full w-full">
          <Image
             src={product.images[1]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-contain"
          />
        </div>

      </div>
    </div>
<div className="absolute bottom-3 left-3 z-20 transition-all duration-500 ease-out group-hover:bottom-32 group-hover:scale-105">
  <div className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-md">
    <span className="text-yellow-500">★</span>
    <span className="text-xs font-bold">{product.rating}</span>
  </div>
</div>

<div className="absolute bottom-3 right-3 z-20 transition-all duration-500 ease-out group-hover:bottom-32 group-hover:scale-105">
  <div className="flex items-center rounded-full bg-white px-2 py-1 shadow-md">
    <div className="flex -space-x-1">
      {(product.colors ?? []).slice(0, 4).map((color) => (
        <span
          key={color.label}
          className="h-4 w-4 rounded-full border border-white"
          style={{ backgroundColor: color.hex }}
        />
      ))}
    </div>

    {(product.colors?.length ?? 0) > 4 && (
      <span className="ml-1 text-[10px] font-bold">
        +{product.colors!.length - 4}
      </span>
    )}
  </div>
</div>
    {/* ORIGINAL OVERLAY FROM YOUR CODE */}
    <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
      <div className="bg-white/20 backdrop-blur-md border-t border-white/30 px-3 py-3">
      
        <h3 className="text-xs sm:text-sm font-bold text-black leading-snug line-clamp-1 drop-shadow">
          {product.name}
        </h3>
        <div className="mt-0.5 text-xs text-black/80 drop-shadow">
          Min qty: {product.quantityReq}+ · {product.priceLabel}
        </div>
        <button className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-full bg-white py-1.5 text-xs font-bold text-gray-900 shadow-md transition hover:bg-black hover:text-white">
          <i className="fas fa-shopping-bag text-xs"></i>
          Shop Now
        </button>
      </div>
    </div>

  </div>

  {/* ORIGINAL TITLE SECTION */}
  <div className="mt-3 px-2">
  {/* Brand */}
  <div className="flex items-center gap-1">
    <span className="text-sm font-bold text-gray-900">
      Cluesstyle
    </span>
    <sup className="inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold border border-gray-900 rounded-full">
      R
    </sup>
  </div>

  {/* Product Name */}
  <span className="mt-1 text-[16px] text-gray-400 line-clamp-2 min-h-[40px]">
    {product.name}
  </span>

  {/* Price */}
  <div className="-mt-4 flex items-center gap-2">
    <span className="text-xl font-bold text-black">
      {product.priceLabel}
    </span>

    {product.priceLabel && (
      <span className="text-sm text-gray-400 line-through">
        ₹{product.priceLabel}
      </span>
    )}

    {product.discount && (
      <span className="text-sm font-medium text-green-600">
        {Math.round(product.discount)}% OFF
      </span>
    )}
  </div>

  {/* Same Day Delivery */}
  {product.sameDayAvailable && (
    <div className="mt-2 flex items-center gap-1.5 text-green-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2L1 21h22L12 2zm0 4.8l6.6 12.2H5.4L12 6.8z" />
      </svg>

      <span className="text-xs font-semibold">
        Same Day Delivery Available
      </span>
    </div>
  )}
</div>
</Link>
  );
}
//football/[slug]/ProductDetailsClient
// ================== MAIN COMPONENT ==================
export default function ProductDeatilsClient () {
  const params = useParams();
  const categorySlug = params.slug as string;   // e.g. "solid-full-sleeves-shirt"

  const [minPrice, setMinPrice] = useState<number>(0);
  // const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [tempMinPrice, setTempMinPrice] = useState<number>(0);
  const [tempMaxPrice, setTempMaxPrice] = useState<number>(10000);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(productsData);

  // Desktop sidebar drawer
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Mobile filter modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

 const [headerHeight, setHeaderHeight] = useState<number>(72);
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PRODUCTS_PER_PAGE = 12;
  const mainScrollRef = useRef<HTMLElement>(null);

const categoryProducts = productsData.filter((p) => p.categorySlug === categorySlug);
  const allPrices = (categoryProducts.length > 0 ? categoryProducts : productsData).map((p) => p.price);
  const globalMinPrice = Math.min(...allPrices);
  const globalMaxPrice = Math.max(...allPrices);

  useEffect(() => {
    const measure = () => {
      const header = document.querySelector("header");
      if (header) setHeaderHeight(header.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    setMinPrice(globalMinPrice);
    setMaxPrice(globalMaxPrice);
    setTempMinPrice(globalMinPrice);
    setTempMaxPrice(globalMaxPrice);
  }, [globalMinPrice, globalMaxPrice]);

  const matchesPriceFilter = useCallback(
    (p: Product) => p.price >= minPrice && p.price <= maxPrice,
    [minPrice, maxPrice]
  );
  const matchesSearch = useCallback(
    (p: Product) =>
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    [searchQuery]
  );
 const matchesSize = useCallback(
    (p: Product) => selectedSize === "all" || p.size === selectedSize,
    [selectedSize]
  );
  const matchesCategory = useCallback(
    (p: Product) => p.categorySlug === categorySlug,
    [categorySlug]
  );

  const applyFilters = useCallback(() => {
    setFilteredProducts(
      productsData.filter((p) => matchesCategory(p) && matchesPriceFilter(p) && matchesSearch(p) && matchesSize(p))
    );
  }, [matchesCategory, matchesPriceFilter, matchesSearch, matchesSize]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  useEffect(() => { setCurrentPage(1); }, [filteredProducts.length, categorySlug]);

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTempMinPrice(parseInt(e.target.value));
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTempMaxPrice(parseInt(e.target.value));
  const applyPriceRange = () => {
    if (tempMinPrice <= tempMaxPrice) {
      setMinPrice(tempMinPrice);
      setMaxPrice(tempMaxPrice);
    }
  };
  const resetPriceRange = () => {
    setMinPrice(globalMinPrice);
    setMaxPrice(globalMaxPrice);
    setTempMinPrice(globalMinPrice);
    setTempMaxPrice(globalMaxPrice);
  };
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedSize("all");
    resetPriceRange();
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when either modal is open
  useEffect(() => {
    document.body.style.overflow = (isSidebarOpen || isFilterModalOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isSidebarOpen, isFilterModalOpen]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0,
    }).format(price);

  const activeFilterCount = [
    selectedSize !== "all",
    minPrice !== globalMinPrice || maxPrice !== globalMaxPrice,
  ].filter(Boolean).length;

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const goToPage = (page: number) => {
    const clamped = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(clamped);
    // Desktop: the grid scrolls inside <main>, not the window
    mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    // Mobile: the grid scrolls with the window
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const sidebarProps = {
    tempMinPrice, tempMaxPrice, minPrice, maxPrice,
    globalMinPrice, globalMaxPrice, formatPrice,
    handleMinPriceChange, handleMaxPriceChange,
    applyPriceRange, resetPriceRange,
    setTempMinPrice, setTempMaxPrice,
    selectedSize, setSelectedSize,
  };

  return (
    <>
      {/* ══════════════════════════════════════════════
          DESKTOP: overlay + drawer (existing behaviour)
      ══════════════════════════════════════════════ */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-[280px] overflow-y-auto border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-xl font-black tracking-tight">Cluesstyle</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-full bg-gray-100 p-2 hover:bg-gray-200"
            aria-label="Close sidebar"
          >✕</button>
        </div>
        <SidebarContent {...sidebarProps} onLinkClick={() => setIsSidebarOpen(false)} />
      </aside>

      {/* ══════════════════════════════════════════════
          MOBILE FILTER MODAL (bottom sheet)
      ══════════════════════════════════════════════ */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isFilterModalOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsFilterModalOpen(false)}
      />
      {/* Bottom sheet panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isFilterModalOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "85vh", overflowY: "auto" }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black tracking-tight">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                onClick={() => { clearAllFilters(); }}
                className="text-xs text-gray-500 underline hover:text-black"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 text-sm font-bold"
              aria-label="Close filters"
            >✕</button>
          </div>
        </div>
        {/* Filter content */}
        <SidebarContent {...sidebarProps} onLinkClick={() => setIsFilterModalOpen(false)} />
        {/* Apply button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4">
          <button
            onClick={() => setIsFilterModalOpen(false)}
            className="w-full rounded-2xl bg-black py-3.5 text-sm font-bold text-white transition hover:bg-gray-800"
          >
            Show {filteredProducts.length} Products
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          DESKTOP LAYOUT
      ══════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex bg-gray-50"
        style={{ height: `calc(100vh - ${headerHeight}px)` }}
      >
        {/* LEFT SIDEBAR */}
        <aside className="w-[280px] flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          <SidebarContent {...sidebarProps} />
        </aside>

        {/* RIGHT CONTENT */}
        <main ref={mainScrollRef} className="flex-1 min-w-0 overflow-y-auto no-scrollbar">
          <div className="p-6 lg:p-8">
            {/* Top Banner */}

            
            <div className="mb-8 overflow-hidden rounded-3xl border-2 border-black bg-white shadow-[6px_6px_0px_#000] transition-all hover:shadow-[8px_8px_0px_#000]">
              <div className="grid min-h-[420px] grid-cols-1 lg:grid-cols-2">
                <div className="flex flex-col justify-center p-6 md:p-10">
                  <div className="mb-3 inline-flex w-fit items-center rounded-full border border-black bg-black px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                     Oversized T-Shirt Collection
                  </div>
                  <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">
                    Shop and Personalised your Own <br />
                    <span className="text-gray-500">Oversized T-shirts</span>
                  </h1>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600">
                    Premium corporate office bags for modern professionals, offering style, durability, comfort, and smart organization for everyday work needs.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {[
                      { icon: <FaStar />, text: "Premium Quality" },
                      { icon: <FaBoxes />, text: "Bulk Orders" },
                      { icon: <FaTruck />, text: "Fast Delivery" },
                    ].map((item) => (
                      <div
                        key={item.text}
                        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm"
                      >
                        <span className="text-black">{item.icon}</span>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8">
                    {/* search bar */}
                    {/* <div className="relative">
                      <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tote bags..."
                        className="h-14 w-full rounded-2xl border-2 border-gray-300 bg-white pl-12 pr-4 text-sm outline-none transition-all focus:border-black focus:ring-2 focus:ring-black/10"
                      />
                    </div> */}
                    <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                    <Link
                      href="/"
                      className="transition-colors hover:text-black"
                    >
                      Home
                    </Link>

                    <span>/</span>

                    <Link
                      href="/products"
                      className="transition-colors hover:text-black"
                    >
                      Products
                    </Link>

                            

                    <span>/</span>


                    <Link
                      href="/products/apparels"
                      className="transition-colors hover:text-black"
                    >
                      Apparels
                    </Link>

                            

                    <span>/</span>
                    <span className="font-semibold text-black">
                    Oversized T-Shirt
                    </span>
                  </div>
                    {/* <p className="mt-2 text-xs text-gray-400">Try: "Premium", "Prime", "Canvas"</p> */}
                  </div>
                </div>
                <div className="relative min-h-[320px] overflow-hidden bg-black">
                  <video autoPlay muted loop playsInline preload="none" poster="/hoodie-poster.webp" className="absolute inset-0 h-full w-full object-cover">
                    <source src="/hoodie.webm" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  {/* <div className="absolute bottom-6 left-6 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/70">Starting From</p>
                    <h3 className="mt-1 text-3xl font-black text-white">₹499</h3>
                    <p className="mt-1 text-sm text-white/80">Premium Screen Printed Tote Bags</p>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Filter bar */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm font-medium">
                  {filteredProducts.length} products
                </span>
                
                <button onClick={clearAllFilters} className="text-xs text-gray-500 underline hover:text-black">
                  Clear all filters
                </button>
              </div>
              <div className="text-xs text-gray-500">
                <i className="fas fa-check-circle text-green-600"></i> authentic prints · eco-friendly
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <i className="fas fa-box-open text-5xl text-gray-300"></i>
                <p className="mt-3 font-medium text-gray-500">No products found for selected Category.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} categorySlug={categorySlug} />
                  ))}
                </div>
                <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
              </>
            )}
          </div>
        </main>
      </div>

      {/* ══════════════════════════════════════════════
          MOBILE LAYOUT — desktop-like structure
      ══════════════════════════════════════════════ */}
      <div className="lg:hidden min-h-screen bg-gray-50">

        {/* Mobile Hero Banner */}
        <div className="relative overflow-hidden bg-black" style={{ minHeight: 220 }}>
          <video autoPlay muted loop playsInline preload="none" poster="/hoodie-poster.webp" className="absolute inset-0 h-full w-full object-cover opacity-60">
            <source src="/hoodie.webm" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
          <div className="relative z-10 flex flex-col justify-end h-full px-5 py-6" style={{ minHeight: 220 }}>
            <div className="mb-2 inline-flex w-fit items-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Oversized T-Shirt Collection
            </div>
            <h1 className="text-2xl font-black leading-tight text-white">
              Shop and Personalised your Own <br />
              <span className="text-white/70">Oversized T-shirts</span>
            </h1>
            <p className="mt-1.5 text-xs text-white/80 max-w-xs">
              Screen printing for brands, events & businesses. Starting ₹499.
            </p>
          </div>
        </div>

        {/* Mobile Search + Filter bar — sticky */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3 flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tote bags..."
                className="w-full h-10 rounded-xl border-2 border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-black focus:bg-white"
              />
            </div>

            {/* Filter button */}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="relative flex-shrink-0 flex items-center gap-1.5 h-10 px-4 rounded-xl border-2 border-black bg-black text-white text-sm font-bold transition active:scale-95"
              aria-label="Open filters"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2M9 16h6" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="px-4 pb-2.5 flex flex-wrap gap-1.5">
              {selectedSize !== "all" && (
                <span className="flex items-center gap-1 rounded-full bg-black text-white text-xs font-medium px-2.5 py-1">
                  {selectedSize}
                  <button onClick={() => setSelectedSize("all")} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
                </span>
              )}
              {(minPrice !== globalMinPrice || maxPrice !== globalMaxPrice) && (
                <span className="flex items-center gap-1 rounded-full bg-black text-white text-xs font-medium px-2.5 py-1">
                  {formatPrice(minPrice)} – {formatPrice(maxPrice)}
                  <button onClick={resetPriceRange} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Product count row */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
          </span>
          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className="text-xs text-gray-400 underline hover:text-black">
              Clear all
            </button>
          )}
        </div>

        {/* Product Grid — 2 columns */}
        <div className="px-3 pb-8">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <i className="fas fa-box-open text-4xl text-gray-200"></i>
              <p className="mt-3 text-sm font-medium text-gray-400">No products match your filters.</p>
              <button
                onClick={clearAllFilters}
                className="mt-3 rounded-xl border-2 border-black px-4 py-2 text-xs font-bold transition hover:bg-black hover:text-white"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} categorySlug={categorySlug} />
                  ))}
              </div>
              <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
            </>
          )}
        </div>
      </div>
      {/* dcript schema */}

      <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://cluesstyle.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Products",
          item: "https://cluesstyle.com/products",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Cap",
          item: "https://cluesstyle.com/products/cap",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Tote Bags",
          item: "https://cluesstyle.com/products/bags/tote-bag",
        },
      ],
    }),
  }}
/>
    </>
    
  );
}