// app/become-a-sponsor/become-a-sponsor.tsx
'use client';

import { JSX, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaTrophy, 
  FaUsers, 
  FaEye, 
  FaChartLine,
  FaCheckCircle,
  FaArrowRight,
  FaRupeeSign,
  FaTshirt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaHeart,
  FaStar,
  FaMedal,
  FaRocket,
  FaShieldAlt,
  FaWhatsapp,
  FaEnvelope
} from 'react-icons/fa';

interface Benefit {
  icon: JSX.Element;
  title: string;
  description: string;
}

interface Package {
  name: string;
  price: number;
  positions: string[];
  features: string[];
  popular?: boolean;
  icon: JSX.Element;
}

export default function BecomeASponsor() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const benefits: Benefit[] = [
    {
      icon: <FaEye className="w-8 h-8" />,
      title: 'Maximum Visibility',
      description: 'Your logo printed on premium quality event t-shirts seen by thousands of attendees',
    },
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: 'Target Audience',
      description: 'Reach your ideal customers through our diverse event communities',
    },
    {
      icon: <FaChartLine className="w-8 h-8" />,
      title: 'Brand Growth',
      description: 'Increase brand recognition and recall with strategic logo placement',
    },
    {
      icon: <FaHeart className="w-8 h-8" />,
      title: 'Community Support',
      description: 'Build goodwill by supporting local events and communities',
    },
  ];

  const packages: Package[] = [
    {
      name: 'Bronze',
      price: 1200,
      positions: ['Left Chest', 'Right Chest'],
      features: [
        'Logo on 1 position (Left or Right Chest)',
        '100+ event attendees reach',
        'Social media mention',
        'Digital certificate',
      ],
      icon: <FaMedal className="w-6 h-6" />,
    },
    {
      name: 'Silver',
      price: 2000,
      positions: ['Center/Stomach'],
      features: [
        'Logo on Center position (Larger area)',
        '500+ event attendees reach',
        'Social media mention with tag',
        'Digital certificate',
        'Event photo with your logo',
      ],
      icon: <FaStar className="w-6 h-6" />,
      popular: true,
    },
    {
      name: 'Gold',
      price: 2500,
      positions: ['Back Position'],
      features: [
        'Logo on Back position (Premium placement)',
        '1000+ event attendees reach',
        'Social media feature post',
        'Digital certificate + Printed certificate',
        'Event photos + Video mention',
        'Priority placement',
      ],
      icon: <FaTrophy className="w-6 h-6" />,
    },
  ];

  const stats = [
    { value: '5000+', label: 'T-Shirts Printed', icon: <FaTshirt className="w-5 h-5" /> },
    { value: '50+', label: 'Events Sponsored', icon: <FaCalendarAlt className="w-5 h-5" /> },
    { value: '25+', label: 'Active Sponsors', icon: <FaUsers className="w-5 h-5" /> },
    { value: '1M+', label: 'Impressions', icon: <FaEye className="w-5 h-5" /> },
  ];

  const testimonials = [
    {
      name: 'Rajesh Mehta',
      company: 'Tech Solutions India',
      quote: 'Sponsoring through CluesStyle gave our brand amazing visibility. The t-shirt quality is excellent and our logo looks fantastic!',
      rating: 5,
    },
    {
      name: 'Priya Singh',
      company: 'Fashion Hub',
      quote: 'Great experience! The process was smooth and our logo placement was perfect. Will definitely sponsor again.',
      rating: 5,
    },
    {
      name: 'Amit Sharma',
      company: 'Digital Dreams',
      quote: 'Best decision for brand promotion. Reached our target audience effectively and cost-efficiently.',
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
              <FaTrophy className="w-10 h-10" />
            </div> */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Become a Sponsor
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white text-opacity-90">
              Get Your Logo on Premium Event T-Shirts
            </p>
            <p className="text-lg text-white text-opacity-80 max-w-2xl mx-auto mb-10">
              Partner with us to reach thousands of potential customers. Choose your sponsorship package 
              and get your brand noticed at exciting events across the country.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/account"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-lg font-semibold transition-all hover:scale-105"
                style={{ color: '#155d8c' }}
              >
                Register as Sponsor
                <FaArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#packages"
                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-[#155d8c] transition-all"
              >
                View Packages
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
              Why Sponsor With Us?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join our sponsorship program and unlock powerful benefits for your brand
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
            Simple 4-step process to become a sponsor
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Choose Package', desc: 'Select your preferred sponsorship package' },
            { step: '02', title: 'Upload Logo', desc: 'Upload your high-resolution logo' },
            { step: '03', title: 'Make Payment', desc: 'Complete secure payment online' },
            { step: '04', title: 'Get Featured', desc: 'Your logo printed on event t-shirts' },
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

      {/* Packages Section */}
      <div id="packages" className="bg-gray-50 py-16 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Sponsorship Packages
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the perfect package for your brand
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all relative ${
                  pkg.popular ? 'ring-2 ring-[#155d8c] transform md:-translate-y-4' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0" style={{ backgroundColor: '#155d8c' }}>
                    <span className="text-white text-xs font-semibold px-3 py-1 block">Most Popular</span>
                  </div>
                )}
                <div className="p-6 text-center border-b" style={{ borderColor: '#e5e7eb' }}>
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{ backgroundColor: '#155d8c15', color: '#155d8c' }}
                  >
                    {pkg.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <FaRupeeSign className="w-5 h-5 text-gray-600" />
                    <span className="text-3xl font-bold text-gray-800">{pkg.price}</span>
                    <span className="text-gray-500">/ position</span>
                  </div>
                  <p className="text-sm text-gray-500">One-time payment</p>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Available Positions:</p>
                    <div className="flex flex-wrap gap-2">
                      {pkg.positions.map((pos, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: '#155d8c10', color: '#155d8c' }}
                        >
                          {pos}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <FaCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#155d8c' }} />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/account"
                    className="block text-center py-3 rounded-lg font-semibold transition-all hover:scale-105 text-white"
                    style={{ backgroundColor: '#155d8c' }}
                  >
                    Register Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            What Sponsors Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from our happy sponsors
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="w-4 h-4 fill-current" style={{ color: '#155d8c' }} />
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold text-gray-800">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about sponsorship
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: 'How do I become a sponsor?',
                a: 'Simply choose a package, click "Register Now", login or create an account, upload your logo, and complete payment. Your logo will be placed on the selected event t-shirts.'
              },
              {
                q: 'What file format should my logo be in?',
                a: 'We accept AI, EPS, PDF, SVG, PNG, and JPG formats. High-resolution files (300 DPI) are recommended for best print quality.'
              },
              {
                q: 'Can I sponsor multiple events?',
                a: 'Yes! You can sponsor any event listed on our platform. Each sponsorship is per event per position.'
              },
              {
                q: 'When will my logo be printed?',
                a: 'Once payment is confirmed, your logo will be included in the next production batch for the selected event.'
              },
              {
                q: 'Is there a refund policy?',
                a: 'Sponsorships are non-refundable once production begins. Please review our refund policy for more details.'
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div
          className="rounded-2xl p-10 text-center text-white"
          style={{ backgroundColor: '#155d8c' }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-white text-opacity-90">
            Join our sponsorship program today and get your brand noticed by thousands
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-lg font-semibold transition-all hover:scale-105"
              style={{ color: '#155d8c' }}
            >
              Register as Sponsor
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
            <a href="mailto:sponsor@cluesstyle.com" className="hover:underline" style={{ color: '#155d8c' }}>
              sponsor@cluesstyle.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}