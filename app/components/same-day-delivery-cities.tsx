import Link from "next/link";

type ServiceCard = {
  title: string;
  desc: string;
  href: string;
};

type Props = {
  heading: string;
  items: ServiceCard[];
};

export default function SameDayDeliveryCities({ heading, items }: Props) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8">

        {/* Heading */}
        <header className="mb-12">
          <div className="mb-10 flex items-center gap-3">
            <img src="/gold-arrow.png" alt="arrow" className="w-8 h-8" />
            <h2 className="text-3xl font-semibold md:text-4xl">
              {heading}
            </h2>
          </div>
        </header>

        {/* Grid */}
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">

          {items.map((item, index) => (
            <li key={index}>

              {/* IMPORTANT: real anchor = SEO crawlable */}
              <Link
                href={item.href}
                className="
                  group flex flex-col justify-between
                  h-[280px]
                  rounded-2xl border border-gray-200 bg-white
                  p-6
                  shadow-[4px_4px_0px_#00000010]
                  hover:shadow-[6px_6px_0px_#000]
                  transition-all duration-300 hover:-translate-y-1
                  overflow-hidden
                "
              >

                {/* Content */}
                <div>

                  <h3 className="text-lg font-bold text-black line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                    {item.desc}
                  </p>

                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="h-2 w-2 rounded-full bg-black group-hover:scale-150 transition" />
                  <span className="text-xs text-gray-400">
                    View Details →
                  </span>
                </div>

              </Link>

            </li>
          ))}

        </ul>
      </div>
    </section>
  );
}