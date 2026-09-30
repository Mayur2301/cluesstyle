"use client";

import { useState } from "react";

const podProducts = [
  {
    name: "Framed Poster",
    basePrice: 168,
    image: "/framer-poster.avif",
  },
  {
    name: "Unisex AOP Bomber Jacket",
    basePrice: 430,
    image: "/bomber-jacket.avif",
  },
  {
    name: "iPhone Class Case",
    basePrice: 120,
    image: "/iphone.avif",
  },
];

export default function PodProfitCalculator() {
  const [podProductIndex, setPodProductIndex] = useState(0);
  const [podSellingPrice, setPodSellingPrice] = useState(268);
  const [podSalesPerDay, setPodSalesPerDay] = useState(200);

  const podSelectedProduct = podProducts[podProductIndex];

  const podProfitPerSale =
    podSellingPrice - podSelectedProduct.basePrice;

  const podMonthlyProfit =
    Math.max(0, podProfitPerSale) *
    podSalesPerDay *
    30;

  const formatIndianCurrency = (amount: number) =>
    amount.toLocaleString("en-IN");

  const handlePrevProduct = () => {
    setPodProductIndex((prev) =>
      prev === 0 ? podProducts.length - 1 : prev - 1
    );
  };

  const handleNextProduct = () => {
    setPodProductIndex((prev) =>
      prev === podProducts.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section className="bg-[#ffff] py-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* heading */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-[#1f2937]">
            Calculate Your Print on Demand Profit
          </h2>

          <p className="text-gray-500 mt-3 max-w-3xl mx-auto">
            Find out exactly how much you can earn selling print on
            demand products in India.
          </p>
        </div>

        {/* calculator */}
        <div className="grid md:grid-cols-2 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">

          {/* LEFT */}
          <div className="bg-gradient-to-r from-[#ececec] to-[#f8f8f8] p-8 flex flex-col items-center justify-center relative">

            <h3 className="font-semibold text-xl text-gray-800">
              {podSelectedProduct.name}
            </h3>

            <p className="text-orange-500 text-sm font-semibold mt-1">
              Starting from ~ ₹{podSelectedProduct.basePrice}
            </p>

            {/* carousel */}
            <div className="mt-8 flex items-center gap-5">

              <img
                src={podSelectedProduct.image}
                className="w-14 opacity-25"
                alt=""
              />

              <img
                src={podSelectedProduct.image}
                className="w-36"
                alt={podSelectedProduct.name}
              />

              <img
                src={podSelectedProduct.image}
                className="w-14 opacity-25"
                alt=""
              />
            </div>

            {/* arrows */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={handlePrevProduct}
                className="w-9 h-9 rounded-full bg-white shadow hover:shadow-md"
              >
                ←
              </button>

              <button
                onClick={handleNextProduct}
                className="w-9 h-9 rounded-full bg-white shadow hover:shadow-md"
              >
                →
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col justify-between">

            <div className="p-8">
              <h3 className="text-2xl font-semibold text-gray-800">
                Price and Quantity
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Fix the price and daily sales quantity to
                calculate your monthly profit.
              </p>

              {/* selling price */}
              <div className="mt-10">
                <div className="flex justify-between mb-3">
                  <span>Selling price</span>

                  <div className="border px-4 py-1 rounded-md text-sm font-medium">
                    ₹ {podSellingPrice}
                  </div>
                </div>

                <input
                  type="range"
                  min={podSelectedProduct.basePrice}
                  max={1000}
                  value={podSellingPrice}
                  onChange={(e) =>
                    setPodSellingPrice(
                      Number(e.target.value)
                    )
                  }
                  className="w-full accent-orange-500"
                />

                <p className="text-xs text-blue-500 mt-1">
                  Recommended price
                </p>
              </div>

              {/* sales/day */}
              <div className="mt-8">
                <div className="flex justify-between mb-3">
                  <span>Sales per day</span>

                  <div className="border px-4 py-1 rounded-md text-sm font-medium">
                    {podSalesPerDay}
                  </div>
                </div>

                <input
                  type="range"
                  min={1}
                  max={500}
                  value={podSalesPerDay}
                  onChange={(e) =>
                    setPodSalesPerDay(
                      Number(e.target.value)
                    )
                  }
                  className="w-full accent-orange-500"
                />
              </div>
            </div>

            {/* bottom profit */}
            <div className="bg-[#e7c94d] px-8 py-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  You could make profit per month
                </p>

                <h3 className="text-3xl font-bold text-gray-900">
                  ₹
                  {formatIndianCurrency(
                    podMonthlyProfit
                  )}
                </h3>
              </div>

              <button className="bg-[#0d4f8b] text-white px-5 py-2 rounded-lg text-sm font-semibold">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}