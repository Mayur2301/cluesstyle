// PATH: app/sports-wear/sports-wear.tsx
import { FaCheckCircle, FaClock, FaStar, FaTruck } from "react-icons/fa";
import AccessoriesFAQSection from "../components/accessories-faq";
import Link from "next/link";
import HeroCarousel from "../components/sports-wear-hero-section";

// Same "not live yet" pattern used across the rest of the site (see
// `comingSoon` in app/components/Header.tsx) — a card marked comingSoon
// gets greyed out, shows a "Listing Soon" badge, and its click goes to the
// shared /coming-soon page instead of its real (not-yet-built) product
// page. Flipping a category live later is just deleting the flag.
function comingSoonHref(label: string, back: string): string {
  return `/coming-soon?product=${encodeURIComponent(label)}&back=${encodeURIComponent(back)}`;
}

const collections = [
  {
    id: "01",
    title: "FOOTBALL",
    bg: "#ceb351",
    image: "/football-playing.png",
    imagePosition: "top-7 left-[68%]",
    imageWidth: "w-[650px]",
    imageHeight: "h-[330px]",
    link: "/products/sports/football",
    comingSoon: true,
  },
  {
    id: "02",
    title: "CRICKET\n",
    bg: "#a6d3e1",
    image: "/cricket-india-jersey.webp",
    imagePosition: "top-5 left-[75%]",
    imageWidth: "w-[400px]",
    imageHeight: "h-[330px]",
    link: "/products/sports/cricket",
    comingSoon: true,
  },
  {
    id: "03",
    title: "BASKET BALL",
    bg: "#6c86c7",
    image: "/volley-ball.png",
    imagePosition: "top-7 left-[75%]",
    imageWidth: "w-[550px]",
    imageHeight: "h-[330px]",
    link: "/products/sports/basketball",
    comingSoon: true,
  },
  {
    id: "05",
    title: "KABADDI",
    bg: "#ad78cf",
    image: "/kabaddi.png",
    imagePosition: "-top-10 left-[73%]",
    imageWidth: "w-[380px]",
    imageHeight: "h-[450px]",
    link: "/products/sports/kabaddi",
    comingSoon: true,
  },
  {
    id: "06",
    title: "E SPORTS",
    bg: "#958c8c",
    image: "/e-sports-tshirt.png",
    imagePosition: "top-3 left-[68%]",
    imageWidth: "w-[420px]",
    imageHeight: "h-[350px]",
    link: "/products/apparels/oversized-t-shirt",
    comingSoon: true,
  },
  {
    id: "",
    title: "View More\nProducts",
    bg: "#ffffff",
    special: true,
    link: "/products",
  }
];
export default function CollectionsSection() {
  return (
    <>
    <HeroCarousel/>

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
    Top Sports Collections 
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
  href={item.comingSoon ? comingSoonHref(item.title.replace(/\n/g, " ").trim(), item.link) : item.link}
  className={`
    group
    relative block h-[350px] overflow-hidden rounded-[20px]
    bg-white
    ${item.special ? "border border-black" : ""}
    shadow-[1px_1px_0px_#000]
    transition-all duration-300 ease-out
    hover:-translate-y-2
    hover:shadow-[5px_8px_0px_#000]
    ${item.comingSoon ? "grayscale opacity-70 hover:opacity-90" : ""}
    ${isLastOdd ? "xl:col-start-2" : ""}
  `}
>
                {item.comingSoon && (
                  <span
                    className="
                      absolute top-4 right-4 z-30
                      inline-flex items-center gap-1
                      px-3 py-1 rounded-full
                      bg-[#fff3e0] text-[#b56a00]
                      text-[10px] font-bold uppercase tracking-wide
                      shadow-sm
                    "
                  >
                    <FaClock className="w-2.5 h-2.5" />
                    Listing Soon
                  </span>
                )}
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