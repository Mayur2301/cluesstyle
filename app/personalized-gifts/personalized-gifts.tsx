import { FaCheckCircle, FaClock, FaStar, FaTruck } from "react-icons/fa";
import AccessoriesFAQSection from "../components/accessories-faq";
import Link from "next/link";

import ApparelsHeroSection from "../components/apparel-category-hero-section";
const collections = [
  {
    id: "01",
    title: "BIRTHDAY\nGIFTS",
    bg: "#f1d56e",
    image: "/green-polo-after.png",
    imagePosition: "top-5 left-[75%]",
    imageWidth: "w-[450px]",
    imageHeight: "h-[330px]",
    link: "/products/apparels/polo-t-shirt",
  },
  {
    id: "02",
    title: "ANNIVERSERY\nGIFTS",
    bg: "#79a9b8",
    image: "/mumbai-jersey.png",
    imagePosition: "-top-4 left-[75%]",
    imageWidth: "w-[450px]",
    imageHeight: "h-[400px]",
    link: "/sports-wear",
  },
  {
    id: "03",
    title: "KIDS\nCOLLECTION",
    bg: "#83a4f6",
    image: "/hoodie-after.png",
    imagePosition: "top-5 left-[73%]",
    imageWidth: "w-[550px]",
    imageHeight: "h-[330px]",
    link: "/products/apparels/hoodies",
  },
  {
    id: "04",
    title: "VALENTINE\nGIFTS",
    bg: "#9a9797",
    image: "/shirt-after.png",
    imagePosition: "top-1 left-[73%]",
    imageWidth: "w-[420px]",
    imageHeight: "h-[350px]",
    link: "/products/apparels/full-sleeves-shirt",
  },
  {
    id: "05",
    title: "FRIENDSHIP\nCOLLECTION",
    bg: "#cba5e2",
    image: "/round-neck-t-shirt.webp",
    imagePosition: "top-5 left-[73%]",
    imageWidth: "w-[380px]",
    imageHeight: "h-[320px]",
    link: "/products/apparels/round-neck-t-shirt",
  },
  {
    id: "06",
    title: "COUPLE\nCOLLECTION",
    bg: "#b5e2a2",
    image: "/oversized-t-shirt.png",
    imagePosition: "-top-12 left-[70%]",
    imageWidth: "w-[420px]",
    imageHeight: "h-[450px]",
    link: "/products/apparels/oversized-t-shirt",
  },
 

  {
    id: "07",
    title: "FAMILY\nCOLLECTION",
    bg: "#d48f5b",
    image: "/oversized-t-shirt.png",
    imagePosition: "-top-12 left-[70%]",
    imageWidth: "w-[420px]",
    imageHeight: "h-[450px]",
    link: "/products/apparels/oversized-t-shirt",
  },
 
  

  {
  id: "",
  title: "View More\nProducts",
  bg: "#ffffff",
  special: true,
  link: "/products",
}
];
export default function PersonalizedGifts() {
  return (
    <>
    <ApparelsHeroSection/>
    <div className=" py-4 bg-white">
            <div className="mx-auto max-w-[1600px] px-4 py-4">
              <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-1.5">
                  <FaClock className="w-3.5 h-3.5 text-black" />
                  <span>4–10 Hour Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaCheckCircle className="w-3.5 h-3.5 text-black" />
                  <span>Premium Quality</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaStar className="w-3.5 h-3.5 text-black" />
                  <span>10,000+ Happy Customers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaTruck className="w-3.5 h-3.5 text-black" />
                  <span>Free Delivery in Mumbai</span>
                </div>
              </div>
            </div>
          </div>
    <section className="py-1 bg-[#ffff]">
      <div className="text-center py-10">
  <h1
    className="
      text-[42px]
      sm:text-[60px]
      md:text-[75px]
      lg:text-[100px]
      font-black
      tracking-[0.01em]
      leading-[0.82]
      text-black
    "
  >
    Personalized Gifts for Loved Onces
  </h1>

  <div className="mt-6 flex justify-center">
    <div className="h-px w-382 bg-black/20"></div>
  </div>
</div>

      <div className="max-w-[1600px] mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {collections.map((item, index) => {
            const isLastOdd =
              collections.length % 3 === 1 &&
              index === collections.length - 1;

            return (
              <Link
  key={item.id}
  href={item.link}
  className={`
    group
    relative block h-[350px] overflow-hidden rounded-[20px]
    bg-white
    ${item.special ? "border border-black" : ""}
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    ${isLastOdd ? "xl:col-start-2" : ""}
  `}
>
                <div
                  className="h-[48%] relative"
                  style={{ backgroundColor: item.bg }}
                >
                 {!item.special && (
                    <span
                      className="
                        absolute left-6 bottom-[-30px]
                        text-[100px] font-black leading-none
                        text-white
                      "
                    >
                      {item.id}
                    </span>
                  )}

                           {item.special && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span
                                className="
                                  text-8xl lg:text-6xl
                                  font-black
                                  text-black
                                  text-center
                                  whitespace-pre-line
                                  leading-[0.9]
                                  mt-20
                                "
                              >
                                {item.title}
                              </span>
                            </div>
                          )}
                        </div>

                {/* Title moved below the number, white fill with outline matching item.bg */}
                {!item.special && (
                  <span
                    style={{ color: item.bg }}
                    className="
                      block
                      relative
                      z-20
                      mt-2
                      pl-6 pr-4
                      text-2xl xl:text-3xl
                      font-extrabold
                      whitespace-pre-line
                      text-left
                    "
                  >
                    {item.title}
                  </span>
                )}

                {!item.special && (
          <img
            src={item.image}
            alt={item.title}
            className={`
              absolute
              -translate-x-1/2
              object-contain
              transition-all duration-500 ease-out
              group-hover:scale-110
              group-hover:-translate-y-3
              ${item.imagePosition}
              ${item.imageWidth}
              ${item.imageHeight}
            `}
          />
        )}
        {!item.special && (
          <div
            className="
              absolute
              bottom-5
              left-5

              flex items-center justify-center
              rounded-full
              h-9 w-9

              bg-black
              z-20

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
        )}


              {item.special && (
                <div
                  className="
                    absolute bottom-6 left-6
                    inline-flex items-center gap-3
                    px-5 py-3
                    rounded-[25px]
                    bg-black
                    text-white
                    font-semibold
                    text-sm
                    border border-black
                    transition-all duration-300 ease-out
                    group-hover:bg-[#444444]
                    group-hover:-translate-y-1
                    group-hover:shadow-[6px_8px_0px_#000]
                    left-[29%]
                    w-[200px]
                    mb-10
                  "
                >
                  Shop More 

                  <span
                    className="
                      flex items-center justify-center
                      w-7 h-7
                      rounded-full
                      bg-white text-black
                      transition-transform duration-300
                      group-hover:translate-x-1
                    ml-6
                  
                    "
                  >
                    →
                  </span>
                </div>
              )}
              </Link>
              
            );
          })}
        </div>
      </div>
    </section>

    <br/><br/>

    <AccessoriesFAQSection/>
     <br/><br/>
  </>
  );
}