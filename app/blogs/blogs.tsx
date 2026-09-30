// PATH: app/blogs/blogs.tsx
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FaSearch, FaChevronLeft, FaChevronRight, FaEnvelope } from 'react-icons/fa';

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  image: string;
}

const CATEGORIES = [
  'All',
  'Custom T-Shirts',
  'Printing Techniques',
  'Business Tips',
  'Corporate Gifting',
  'Design Tips',
  'Case Studies',
];

// Counts shown in the sidebar — informational only, independent of how many
// sample posts are actually loaded on this page.
const CATEGORY_COUNTS: Record<string, number> = {
  All: 24,
  'Custom T-Shirts': 6,
  'Printing Techniques': 5,
  'Business Tips': 5,
  'Corporate Gifting': 4,
  'Design Tips': 3,
  'Case Studies': 3,
};

const posts: Post[] = [
  {
    slug: '#',
    title: 'How to Choose the Right Fabric for Your Custom T-Shirts',
    excerpt: 'A complete guide to different fabric types, GSM, and what works best for your needs.',
    category: 'Custom T-Shirts',
    date: 'Sep 12, 2025',
    readTime: '5 min read',
    author: 'Cluesstyle Team',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: '#',
    title: 'DTF vs Screen Printing – Which is Better?',
    excerpt: 'Compare DTF and screen printing methods to find the best option for your design and budget.',
    category: 'Printing Techniques',
    date: 'Sep 8, 2025',
    readTime: '6 min read',
    author: 'Cluesstyle Team',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: '#',
    title: 'Top 10 Corporate Gift Ideas for Your Team',
    excerpt: 'Thoughtful and practical corporate gift ideas that leave a lasting impression.',
    category: 'Corporate Gifting',
    date: 'Sep 4, 2025',
    readTime: '4 min read',
    author: 'Cluesstyle Team',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: '#',
    title: 'How to Start a T-Shirt Business in 2025',
    excerpt: 'Step-by-step guide to start your own t-shirt brand with low investment.',
    category: 'Business Tips',
    date: 'Sep 28, 2025',
    readTime: '8 min read',
    author: 'Cluesstyle Team',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: '#',
    title: 'T-Shirt Design Trends in 2025',
    excerpt: 'Explore the latest t-shirt design trends, styles and ideas that are popular this year.',
    category: 'Design Tips',
    date: 'Aug 20, 2025',
    readTime: '5 min read',
    author: 'Cluesstyle Team',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: '#',
    title: 'How We Delivered 1,000+ T-Shirts for a Corporate Event',
    excerpt: 'A behind-the-scenes look at our production process, challenges and key learnings.',
    category: 'Case Studies',
    date: 'Aug 12, 2025',
    readTime: '6 min read',
    author: 'Cluesstyle Team',
    image: 'https://images.unsplash.com/photo-1607166452427-7e4477079cb9?auto=format&fit=crop&w=800&q=80',
  },
];

const popularPosts = posts.slice(0, 3);

const TOTAL_PAGES = 8;

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
      const matchesQuery = !q || post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  const pageNumbers = [1, 2, 3];

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-violet-50 via-violet-50/60 to-white">
        <div className="max-w-7xl mx-auto px-4 pt-10 pb-12 md:pb-16">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-widest text-violet-600 mb-3 uppercase">Blog</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Ideas. Insights. Inspiration.
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Tips, guides and stories to help you customize, brand and grow — for individuals,
                businesses and creators.
              </p>
            </div>

            {/* Decorative hero image */}
            <div className="relative flex-shrink-0 hidden md:flex items-center justify-center w-80 h-64">
              <img
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"
                alt="Custom printed t-shirts"
                className="w-72 h-56 object-cover rounded-2xl shadow-xl border border-gray-100"
              />
              <div className="absolute -bottom-4 left-2 bg-white rounded-xl shadow-lg border border-gray-100 px-5 py-3 -rotate-3">
                <p className="font-serif italic text-gray-700 leading-tight text-sm">
                  Good Ideas<br />Wear Better
                </p>
              </div>
              <p className="absolute -top-4 right-0 text-right font-serif italic text-gray-600 leading-snug">
                Print<br />Customize<br />Create<br />
                <span className="underline decoration-violet-400 decoration-2 underline-offset-2">Together</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                activeCategory === cat
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Body: grid + sidebar */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Post grid */}
          <div className="flex-1 min-w-0">
            {filteredPosts.length === 0 ? (
              <p className="text-gray-500 py-12 text-center">No articles found. Try a different category or search term.</p>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <Link
                    href={post.slug}
                    key={post.title}
                    className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <span className="self-start text-xs font-semibold text-violet-600 bg-violet-50 px-3 py-1 rounded-full mb-3">
                        {post.category}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 leading-snug mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {post.author.charAt(0)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{post.author}</p>
                            <p className="text-[11px] text-gray-400">{post.date} · {post.readTime}</p>
                          </div>
                        </div>
                        <span className="text-gray-300 group-hover:text-violet-600 transition-colors flex-shrink-0">→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-violet-300 hover:text-violet-600 transition-colors"
                aria-label="Previous page"
              >
                <FaChevronLeft className="w-3 h-3" />
              </button>
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                    currentPage === n
                      ? 'bg-violet-600 text-white'
                      : 'border border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-600'
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="px-1 text-gray-400">…</span>
              <button
                onClick={() => setCurrentPage(TOTAL_PAGES)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                  currentPage === TOTAL_PAGES
                    ? 'bg-violet-600 text-white'
                    : 'border border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-600'
                }`}
              >
                {TOTAL_PAGES}
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-violet-300 hover:text-violet-600 transition-colors"
                aria-label="Next page"
              >
                <FaChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0 space-y-6">
            {/* Search */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300"
                  />
                </div>
                <button className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors flex-shrink-0">
                  Search
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-900 mb-3">Categories</h3>
              <ul className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeCategory === cat
                          ? 'bg-violet-50 text-violet-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={activeCategory === cat ? 'text-violet-600 font-semibold' : 'text-gray-400'}>
                        {CATEGORY_COUNTS[cat]}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular posts */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-900 mb-4">Popular Posts</h3>
              <div className="space-y-4">
                {popularPosts.map((post) => (
                  <Link href={post.slug} key={post.title} className="flex gap-3 group">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-violet-600 transition-colors">
                        {post.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{post.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-violet-50 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Stay Updated</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get the latest articles, tips and offers directly in your inbox.
              </p>
              <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}