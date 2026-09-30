// app/about-us/about-us.tsx
'use client';

import { JSX, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaTshirt, 
  FaTrophy, 
  FaUsers, 
  FaGlobe,
  FaClock,
  FaShippingFast,
  FaAward,
  FaHeart,
  FaQuoteLeft,
  FaCheckCircle,
  FaIndustry,
  FaLeaf,
  FaLightbulb,
  FaChartLine,
  FaHeadset
} from 'react-icons/fa';

interface Stat {
  icon: JSX.Element;
  value: string;
  label: string;
}

interface Value {
  icon: JSX.Element;
  title: string;
  description: string;
}

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  social?: {
    linkedin?: string;
    twitter?: string;
  };
}

export default function AboutUs() {
  const [activeTab, setActiveTab] = useState<'story' | 'mission' | 'values'>('story');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats: Stat[] = [
    { icon: <FaTrophy className="w-8 h-8" />, value: '5000+', label: 'Projects Completed' },
    { icon: <FaUsers className="w-8 h-8" />, value: '2500+', label: 'Happy Clients' },
    { icon: <FaTshirt className="w-8 h-8" />, value: '1M+', label: 'T-Shirts Printed' },
    { icon: <FaGlobe className="w-8 h-8" />, value: '25+', label: 'Countries Served' },
  ];

  const values: Value[] = [
    {
      icon: <FaAward className="w-8 h-8 text-purple-600" />,
      title: 'Quality First',
      description: 'We never compromise on quality. Every print meets our rigorous standards before it reaches you.',
    },
    {
      icon: <FaUsers className="w-8 h-8 text-purple-600" />,
      title: 'Customer Centric',
      description: 'Your satisfaction is our priority. We work closely with you to bring your vision to life.',
    },
    {
      icon: <FaLightbulb className="w-8 h-8 text-purple-600" />,
      title: 'Innovation',
      description: 'We continuously invest in the latest printing technologies and techniques.',
    },
    {
      icon: <FaLeaf className="w-8 h-8 text-purple-600" />,
      title: 'Sustainability',
      description: 'Eco-friendly inks and sustainable practices to protect our planet.',
    },
    {
      icon: <FaShippingFast className="w-8 h-8 text-purple-600" />,
      title: 'Fast Delivery',
      description: 'Timely delivery without compromising on quality standards.',
    },
    {
      icon: <FaHeart className="w-8 h-8 text-purple-600" />,
      title: 'Passion',
      description: 'We love what we do, and it shows in every project we undertake.',
    },
  ];

  const teamMembers: TeamMember[] = [
    {
      name: 'Rajesh Kumar',
      role: 'Founder & CEO',
      image: '/team/ceo.jpg',
      bio: 'With over 15 years of experience in the printing industry, Rajesh founded CluesStyle with a vision to revolutionize custom apparel.',
      social: { linkedin: '#', twitter: '#' },
    },
    {
      name: 'Priya Sharma',
      role: 'Creative Director',
      image: '/team/creative-director.jpg',
      bio: 'Priya leads our design team with her exceptional creative vision and attention to detail.',
      social: { linkedin: '#', twitter: '#' },
    },
    {
      name: 'Amit Patel',
      role: 'Production Head',
      image: '/team/production-head.jpg',
      bio: 'Amit ensures every print meets our highest quality standards with his technical expertise.',
      social: { linkedin: '#', twitter: '#' },
    },
    {
      name: 'Neha Gupta',
      role: 'Customer Success',
      image: '/team/customer-success.jpg',
      bio: 'Neha and her team ensure every client receives exceptional support throughout their journey.',
      social: { linkedin: '#', twitter: '#' },
    },
  ];

  const milestones = [
    { year: '2015', title: 'The Beginning', description: 'CluesStyle was founded with a single printing machine and a big dream.' },
    { year: '2017', title: 'Expansion', description: 'Moved to a larger facility and added embroidery services.' },
    { year: '2019', title: 'Technology Upgrade', description: 'Invested in state-of-the-art DTF and sublimation printers.' },
    { year: '2021', title: 'Global Reach', description: 'Started serving international clients across 15+ countries.' },
    { year: '2024', title: 'Innovation Hub', description: 'Launched AI-powered design generator and expanded team.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-900 via-purple-700 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              Crafting Stories Through
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"> Premium Prints</span>
            </h1>
            <p className={`text-xl md:text-2xl text-gray-200 mb-8 transition-all duration-700 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              Transforming ideas into reality with passion, precision, and creativity
            </p>
            <div className={`flex flex-wrap justify-center gap-4 transition-all duration-700 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Link href="/contact" className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get in Touch
              </Link>
              <Link href="/services" className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">
                Our Services
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="text-purple-600 flex justify-center mb-3">
                {stat.icon}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Story/Mission/Values Tabs */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Tab Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {['story', 'mission', 'values'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
            {activeTab === 'story' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Story</h2>
                <div className="relative">
                  <FaQuoteLeft className="absolute -top-4 -left-4 text-purple-200 w-12 h-12" />
                  <p className="text-gray-600 leading-relaxed pl-8">
                    CluesStyle was born from a simple yet powerful vision - to empower creators, businesses, and 
                    individuals to express themselves through premium quality custom apparel. What started as a 
                    small workshop with a single screen printing machine has grown into a comprehensive printing 
                    solution provider.
                  </p>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Over the years, we've expanded our capabilities, embraced cutting-edge technologies, and built 
                  a team of passionate professionals who share our commitment to excellence. Today, we're proud 
                  to serve thousands of clients worldwide, from individual artists to large corporations.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our journey has been driven by continuous innovation, unwavering quality standards, and a 
                  deep understanding of our clients' needs. Every project, whether big or small, receives the 
                  same level of dedication and attention to detail.
                </p>
              </div>
            )}

            {activeTab === 'mission' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  "To deliver exceptional quality custom printing solutions that bring our clients' visions to life, 
                  while fostering creativity, sustainability, and lasting partnerships."
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <FaChartLine className="w-10 h-10 text-purple-600 mb-3" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Excellence</h3>
                    <p className="text-gray-600">Strive for perfection in every print, every time.</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <FaUsers className="w-10 h-10 text-purple-600 mb-3" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Partnership</h3>
                    <p className="text-gray-600">Build lasting relationships with our clients and community.</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <FaLeaf className="w-10 h-10 text-purple-600 mb-3" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Sustainability</h3>
                    <p className="text-gray-600">Minimize environmental impact through eco-friendly practices.</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <FaLightbulb className="w-10 h-10 text-purple-600 mb-3" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Innovation</h3>
                    <p className="text-gray-600">Embrace new technologies to serve you better.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'values' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Core Values</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {values.map((value, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0">
                        {value.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">{value.title}</h3>
                        <p className="text-sm text-gray-600">{value.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">Our Journey</h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-1 h-full bg-purple-200"></div>
              
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex flex-col md:flex-row items-start mb-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="flex-1 md:w-1/2 px-4 md:px-8">
                    <div className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <div className="text-2xl font-bold text-purple-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-600 rounded-full border-4 border-white"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Meet Our Leadership</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Passionate professionals dedicated to bringing your ideas to life with excellence
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="group">
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden mb-4 aspect-square">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex justify-center gap-3">
                    {member.social?.linkedin && (
                      <a href={member.social.linkedin} className="bg-white p-2 rounded-full hover:bg-purple-100 transition-colors">
                        <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 text-center">{member.name}</h3>
              <p className="text-purple-600 text-center text-sm mb-2">{member.role}</p>
              <p className="text-gray-500 text-sm text-center">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose CluesStyle?</h2>
            <p className="text-white text-opacity-90 max-w-2xl mx-auto">
              We combine expertise, technology, and passion to deliver exceptional results
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaAward className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-white text-opacity-80">Industry-leading printing technology and premium materials</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaClock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Turnaround</h3>
              <p className="text-white text-opacity-80">Quick delivery without compromising on quality</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHeadset className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-white text-opacity-80">Dedicated support team ready to assist you</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Ready to Start Your Project?</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Let's bring your ideas to life with our premium printing services
        </p>
        <Link 
          href="/contact" 
          className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          Get in Touch Today
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* Add FontAwesome for missing icon */}
      <style jsx>{`
        .fa-headset:before {
          content: "💬";
        }
      `}</style>
    </div>
  );
}