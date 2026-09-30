import Image from "next/image";

const careInstructions = [
  {
    icon: "/desc-icons/Gentle_wash.svg",
    text: "Gentle wash\n40°C",
  },
  {
    icon: "/desc-icons/Do_not_wring.svg",
    text: "Do not wring",
  },
  {
    icon: "/desc-icons/Do_not_bleach.svg",
    text: "Do not bleach",
  },
  {
    icon: "/desc-icons/Do_not_dry_clean.svg",
    text: "Do not dry\nclean",
  },
  {
    icon: "/desc-icons/Line_Dry_In_Shade.svg",
    text: "Line Dry in\nShade",
  },
  {
    icon: "/desc-icons/Do_not_iron_on_label_embroidery_print.svg",
    text: "Do Not Iron\non Label / Print",
  },
  {
    icon: "/desc-icons/Wash_with_like_colours_inside_out.svg",
    text: "Wash inside out\n with like colours",
  },
];

export default function CareInstructions() {
  return (
    <section className="pt-1 sm:py-1">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-5">
        {/* Heading */}
        <div className="mb-6 sm:mb-10 flex items-center gap-3">
          <img
            src="https://cdn.cluesstyle.com/public/gold-arrow.png"
            alt="arrow"
            className="w-7 h-7 sm:w-8 sm:h-8"
          />
          <h2 className="text-2xl font-semibold sm:text-3xl md:text-4xl">
            Washing Instructions
          </h2>
        </div>

        {/* Card — no fixed height so it expands on small screens */}
        <div className="rounded-2xl border border-[#D8D8D8] bg-white px-5 py-7 sm:px-8 sm:py-9 md:px-10 md:py-10">
          <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-8 sm:gap-y-10">
            {careInstructions.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 mb-3">
                  <Image
                    src={item.icon}
                    alt={item.text.replace(/\n/g, " ")}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-[11px] sm:text-[13px] md:text-[14px] leading-[1.25] font-medium text-[#1A1A1A] whitespace-pre-line">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}