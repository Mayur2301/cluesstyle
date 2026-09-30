// app/become-a-club/become-a-club.tsx
'use client';

import { JSX, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaTshirt, 
  FaChartLine,
  FaCheckCircle,
  FaArrowRight,
  FaRupeeSign,
  FaStore,
  FaTrophy,
  FaHeart,
  FaStar,
  FaMedal,
  FaRocket,
  FaShieldAlt,
  FaWhatsapp,
  FaEnvelope,
  FaHandshake,
  FaBullhorn,
  FaMoneyBillWave
} from 'react-icons/fa';

interface Benefit {
  icon: JSX.Element;
  title: string;
  description: string;
}

interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
}

export default function BecomeAClub() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const benefits: Benefit[] = [
    {
      icon: <FaCalendarAlt className="w-8 h-8" />,
      title: 'Host Events',
      description: 'Create and manage events easily. Get sponsors and grow your community.',
    },
    {
      icon: <FaTshirt className="w-8 h-8" />,
      title: 'Sell Merchandise',
      description: 'Design and sell custom t-shirts. Earn from every sale.',
    },
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: 'Build Community',
      description: 'Connect with members, attract sponsors, and build your brand.',
    },
    {
      icon: <FaMoneyBillWave className="w-8 h-8" />,
      title: 'Earn Revenue',
      description: 'Keep profits from merchandise sales and event sponsorships.',
    },
  ];

  const features: Feature[] = [
    {
      icon: <FaStore className="w-6 h-6" />,
      title: 'Free Club Store',
      description: 'Get your own branded storefront to sell merchandise',
    },
    {
      icon: <FaTshirt className="w-6 h-6" />,
      title: 'Custom Merchandise',
      description: 'Design t-shirts, hoodies, and more with your club logo',
    },
    {
      icon: <FaCalendarAlt className="w-6 h-6" />,
      title: 'Event Management',
      description: 'Easy event creation and attendee management',
    },
    {
      icon: <FaHandshake className="w-6 h-6" />,
      title: 'Sponsorship Opportunities',
      description: 'Connect with sponsors to fund your events',
    },
    {
      icon: <FaChartLine className="w-6 h-6" />,
      title: 'Analytics Dashboard',
      description: 'Track sales, attendance, and growth metrics',
    },
    {
      icon: <FaBullhorn className="w-6 h-6" />,
      title: 'Promotion Tools',
      description: 'Market your events to our community',
    },
  ];

  const stats = [
    { value: '100+', label: 'Active Clubs', icon: <FaUsers className="w-5 h-5" /> },
    { value: '500+', label: 'Events Hosted', icon: <FaCalendarAlt className="w-5 h-5" /> },
    { value: '50K+', label: 'T-Shirts Sold', icon: <FaTshirt className="w-5 h-5" /> },
    { value: '₹1Cr+', label: 'Club Earnings', icon: <FaMoneyBillWave className="w-5 h-5" /> },
  ];

  const testimonials = [
    {
      name: 'Cricket Club Mumbai',
      role: 'Sports Club',
      quote: 'CluesStyle helped us organize our tournament merchandise. We sold over 500 t-shirts and raised funds for our club!',
      rating: 5,
    },
    {
      name: 'Tech Meetup Group',
      role: 'Tech Community',
      quote: 'Amazing platform for clubs. Easy to use, great quality products, and excellent support team.',
      rating: 5,
    },
    {
      name: 'College Fest Committee',
      role: 'College Club',
      quote: 'Our annual fest was a huge success thanks to CluesStyle. The merchandise quality was outstanding!',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative" style={{ backgroundColor: '#155d8c' }}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
              <FaUsers className="w-10 h-10" />
            </div> */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Become a Club Partner
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white text-opacity-90">
              Host Events, Sell Merchandise, Build Your Community
            </p>
            <p className="text-lg text-white text-opacity-80 max-w-2xl mx-auto mb-10">
              Join the CluesStyle club network. Create events, sell custom merchandise, 
              earn revenue, and grow your community with our all-in-one platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-lg font-semibold transition-all hover:scale-105"
                style={{ color: '#155d8c' }}
              >
                Register Your Club
                <FaArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-[#155d8c] transition-all"
              >
                Explore Benefits
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ backgroundColor: '#155d8c10', color: '#155d8c' }}>
                {stat.icon}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Join as a Club?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed, all in one platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all"
              >
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                  style={{ backgroundColor: '#155d8c15', color: '#155d8c' }}
                >
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get started in 4 simple steps
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Register', desc: 'Create your club account for free' },
            { step: '02', title: 'Create Event', desc: 'Set up your first event or store' },
            { step: '03', title: 'Design Merch', desc: 'Upload designs or use our templates' },
            { step: '04', title: 'Start Selling', desc: 'Launch and earn from sales' },
          ].map((item, index) => (
            <div key={index} className="text-center relative">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4" style={{ backgroundColor: '#155d8c' }}>
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-500">{item.desc}</p>
              {index < 3 && (
                <div className="hidden md:block absolute top-8 -right-6 text-gray-300 text-2xl">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-gray-50 py-16 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Powerful Features for Clubs
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage and grow your club
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4"
                  style={{ backgroundColor: '#155d8c15', color: '#155d8c' }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            No hidden fees. Pay only when you sell.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {/* Free Plan */}
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#155d8c15' }}>
                  <FaHeart className="w-8 h-8" style={{ color: '#155d8c' }} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Free Club Registration</h3>
                <div className="text-4xl font-bold text-gray-800 mb-4">
                  ₹0<span className="text-lg font-normal text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 text-left mb-6">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4" style={{ color: '#155d8c' }} />
                    <span className="text-gray-600">Free club store setup</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4" style={{ color: '#155d8c' }} />
                    <span className="text-gray-600">Create unlimited events</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4" style={{ color: '#155d8c' }} />
                    <span className="text-gray-600">Sell merchandise</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4" style={{ color: '#155d8c' }} />
                    <span className="text-gray-600">10% commission on sales</span>
                  </li>
                </ul>
                <Link
                  href="/login"
                  className="block w-full py-3 rounded-lg font-semibold text-center transition-all hover:scale-105"
                  style={{ backgroundColor: '#155d8c', color: 'white' }}
                >
                  Register Club
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="p-8 text-center" style={{ backgroundColor: '#155d8c05' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#155d8c15' }}>
                  <FaTrophy className="w-8 h-8" style={{ color: '#155d8c' }} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Premium Club</h3>
                <div className="text-4xl font-bold text-gray-800 mb-4">
                  ₹2,999<span className="text-lg font-normal text-gray-500">/year</span>
                </div>
                <ul className="space-y-3 text-left mb-6">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4" style={{ color: '#155d8c' }} />
                    <span className="text-gray-600">Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4" style={{ color: '#155d8c' }} />
                    <span className="text-gray-600">5% commission on sales</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4" style={{ color: '#155d8c' }} />
                    <span className="text-gray-600">Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4" style={{ color: '#155d8c' }} />
                    <span className="text-gray-600">Featured club listing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4" style={{ color: '#155d8c' }} />
                    <span className="text-gray-600">Advanced analytics</span>
                  </li>
                </ul>
                <Link
                  href="/login"
                  className="block w-full py-3 rounded-lg font-semibold text-center transition-all hover:scale-105"
                  style={{ backgroundColor: '#155d8c', color: 'white' }}
                >
                  Upgrade to Premium
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Trusted by Clubs Across India
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join hundreds of clubs already growing with CluesStyle
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="w-4 h-4 fill-current" style={{ color: '#155d8c' }} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-800">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about becoming a club partner
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              q: 'How do I register my club?',
              a: 'Click on "Register Your Club", create an account, and complete your club profile. It takes less than 5 minutes.'
            },
            {
              q: 'Is there a registration fee?',
              a: 'Basic club registration is completely free. We only charge a small commission on merchandise sales. Premium plans are optional.'
            },
            {
              q: 'Can I create events immediately?',
              a: 'Yes! Once registered, you can start creating events and selling merchandise right away.'
            },
            {
              q: 'How do I get paid?',
              a: 'Earnings from merchandise sales and sponsorships are transferred to your bank account monthly.'
            },
            {
              q: 'What support do you provide?',
              a: 'We provide dedicated support via email, WhatsApp, and phone. Premium clubs get priority support.'
            },
          ].map((faq, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">{faq.q}</h3>
              <p className="text-gray-600 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div
          className="rounded-2xl p-10 text-center text-white"
          style={{ backgroundColor: '#155d8c' }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Grow Your Club?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-white text-opacity-90">
            Join hundreds of clubs already using CluesStyle to host events and sell merchandise
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-lg font-semibold transition-all hover:scale-105"
              style={{ color: '#155d8c' }}
            >
              Register Your Club
              <FaArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/918005551234"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-[#155d8c] transition-all"
            >
              <FaWhatsapp className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">
            Have questions? Contact us at{' '}
            <a href="mailto:clubs@cluesstyle.com" className="hover:underline" style={{ color: '#155d8c' }}>
              clubs@cluesstyle.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}