import CarouselControls from "./Carouselcontrols";

interface Review {
  stars: number;
  text: string;
  name: string;
  location: string;
}


interface VideoItem {
  src: string;
  title: string;
}

const reviews: Review[] = [
  { stars: 4, text: "Easy to upload, resize, & position my Canva graphics.", name: "Kari F.", location: "Mumbai" },
  { stars: 5, text: "They have a wide range of old designs and new designs.", name: "Harold R.", location: "Bengaluru" },
  { stars: 5, text: "Exceptional quality and very smooth ordering process.", name: "Rahul M.", location: "Delhi" },
  { stars: 4, text: "Great prints, fast turnaround. Will order again for sure!", name: "Priya K.", location: "Pune" },
  { stars: 5, text: "The team was super helpful from design to delivery.", name: "Vikram T.", location: "Hyderabad" },
];

const videos: VideoItem[] = [
  { src: "/barcellona.mp4", title: "Startup Merchandise" },
  { src: "/polo-yellow.mp4", title: "Corporate Gifting" },
  { src: "/merchandise.mp4", title: "College Events" },
  { src: "/black-formal-shirt.mp4", title: "Sports Teams" },
  { src: "/black-formal-shirt.mp4", title: "Brand Launches" },
];

export default function CustomerSuccessSection() {
  return (
    <section className="py-5 ">
      <div className="mx-auto  max-w-[1655px] px-6 lg:px-10">

        {/* heading */}
        <div className="mb-16 pl-4 md:pl-10">
          <div className="flex items-center gap-4">
            <img src="/gold-arrow.png" alt="" className="h-8 w-8 md:h-10 md:w-10" />
            <h2 className="text-3xl md:text-5xl font-black">Customer Success Stories</h2>
          </div>
        </div>

        {/* two panels side by side */}
        <div className="grid lg:grid-cols-2 -mt-10 gap-8 items-stretch">

          {/* ═══════════════════════════
              LEFT — REVIEWS
          ═══════════════════════════ */}
          <div className="rounded-[32px] bg-white  border border-black p-8 lg:p-10 text-white shadow-[6px_6px_0px_#000] flex flex-col">

            {/* stat + subtitle */}
            <div className="mb-8">
              <h3 className="text-2xl text-black leading-snug">
                20,000+ Reviews &amp; Counting
              </h3>
             
            </div>

            {/* 2 cards visible at once — all cards in DOM for SEO */}
            <div className="flex-1 overflow-hidden">
              <div
                id="review-track"
                className="flex gap-4   border transition-transform duration-500 ease-in-out"
                style={{ width: `${reviews.length * 50}%` }}
                aria-live="polite"
              >
                {reviews.map((r, i) => (
                  <article
                    key={i}
                    className="bg-white text-black  border border-black bg-gray-600 rounded-2xl p-6 flex flex-col justify-between flex-shrink-0"
                    style={{ width: `${100 / reviews.length}%` }}
                    aria-label={`Review by ${r.name}`}
                  >
                    <div>
                      <div className="mb-4 text-xl text-yellow-400" aria-label={`${r.stars} out of 5 stars`}>
                        {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                      </div>
                      <p className="text-sm leading-6">{r.text}</p>
                    </div>
                    <footer className="mt-8">
                      <p className="font-bold">{r.name}</p>
                      <p className="text-gray-500 text-sm">{r.location}</p>
                    </footer>
                  </article>
                ))}
              </div>
            </div>

            {/* see all + arrows */}
            <div className="mt-6 flex items-center  justify-between">
              <a href="#" className="text-black   underline underline-offset-4 text-sm font-semibold hover:text-black transition-colors">
                See All Reviews
              </a>
              <CarouselControls trackId="review-track" total={reviews.length} step={2}  variant="review" />
            </div>

          </div>

          {/* ═══════════════════════════
              RIGHT — VIDEO TESTIMONIALS
              3 cards visible, arrows on outer edges
          ═══════════════════════════ */}
          <div className="rounded-[32px] bg-white  border border-black p-8 lg:p-10 text-white shadow-[6px_6px_0px_#000]">
  <div className="flex items-center justify-between mb-8">
    <h3 className="text-2xl text-black">
      Video Testimonials
    </h3>

<div className="flex gap-3">
  <CarouselControls
    trackId="video-track"
    total={videos.length}
    step={1}
    variant="video"
  />


     
    </div>
  </div>

  <div className="overflow-hidden">
    <div
      id="video-track"
      className="flex gap-6 transition-transform duration-500"
    >
      {videos.map((video, index) => (
        <div
          key={index}
          className="
            flex-shrink-0
            w-[280px]
            lg:w-[320px]
            rounded-[24px]
            overflow-hidden
            bg-black
            relative
            group
            h-[250px]
          "
        >
          <div className="aspect-[9/16] relative">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={video.src} type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-black/20" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-xl group-hover:scale-110 transition">
                <span className="text-black text-xl ml-1">
                  ▶
                </span>
              </div>
            </div>

            <div className="absolute bottom-5 left-5 right-5">
              <h4 className="font-black text-xl leading-tight">
                {video.title}
              </h4>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
</div>
      </div>
    </section>
  );
}