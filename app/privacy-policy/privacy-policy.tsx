// PATH: app/privacy-policy/privacy-policy.tsx
// app/privacy-policy/privacy-policy.tsx
'use client';

import { useState, useEffect, JSX } from 'react';
import Link from 'next/link';
import {
  FaFileAlt,
  FaDatabase,
  FaCog,
  FaShareAlt,
  FaShieldAlt,
  FaCookieBite,
  FaUserShield,
  FaLink,
  FaChild,
  FaSyncAlt,
  FaEnvelope,
  FaRegClock,
  FaGlobe,
  FaCalendarAlt,
  FaLock,
  FaHeadset,
  FaPhoneAlt,
} from 'react-icons/fa';

interface Section {
  id: string;
  title: string;
  icon: JSX.Element;
  content: string[];
}

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }, []);

  const sections: Section[] = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: <FaFileAlt className="w-4 h-4" />,
      content: [
        'Welcome to Cluesstyle. We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, place an order, or interact with our services.',
        'We comply with applicable data protection laws, including the Information Technology Act, 2000, and the General Data Protection Regulation (GDPR) where applicable.',
        'By using our services, you consent to the data practices described in this policy. Please read it carefully to understand our practices regarding your personal data.',
      ],
    },
    {
      id: 'information',
      title: 'Information We Collect',
      icon: <FaDatabase className="w-4 h-4" />,
      content: [
        'We may collect personal information such as your name, email address, phone number, shipping address, billing details, order history, and any other information you provide while using our website or services.',
        '',
        'Design and Artwork Information:',
        '• Uploaded design files and artwork',
        '• Project specifications and requirements',
        '• Design preferences and notes',
        '',
        'Automatically Collected Information:',
        '• IP address and device information',
        '• Browser type and version',
        '• Pages visited and time spent on our website',
        '• Cookies and similar tracking technologies',
      ],
    },
    {
      id: 'usage',
      title: 'How We Use Your Information',
      icon: <FaCog className="w-4 h-4" />,
      content: [
        'We use your information to process orders, provide customer support, improve our products and services, send important updates, and (with your consent) share promotional offers.',
        '',
        'Order Processing:',
        '• Process and fulfill your orders',
        '• Communicate about order status and updates',
        '• Process payments and prevent fraud',
        '',
        'Service Improvement:',
        '• Analyze usage patterns to improve our website',
        '• Personalize your experience',
        '• Troubleshoot technical issues',
        '',
        'Legal Compliance:',
        '• Comply with legal obligations',
        '• Enforce our terms and conditions',
        '• Protect our rights and prevent fraud',
      ],
    },
    {
      id: 'sharing',
      title: 'Sharing of Information',
      icon: <FaShareAlt className="w-4 h-4" />,
      content: [
        'We do not sell or rent your personal information. We may share your data with trusted third-party service providers (e.g., payment gateways, shipping partners) only for the purpose of fulfilling your orders and improving our services.',
        '',
        'Service Providers:',
        '• Payment processors (Razorpay, banks)',
        '• Shipping and logistics partners',
        '• Cloud storage and email service providers',
        '• Analytics providers',
        '',
        'Legal Requirements:',
        '• When required by law or court order',
        '• To protect our rights and property',
        '• To investigate fraud or security issues',
        '',
        'All third-party service providers are contractually obligated to protect your information and use it only for specified purposes.',
      ],
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: <FaShieldAlt className="w-4 h-4" />,
      content: [
        'We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.',
        '',
        'Technical Measures:',
        '• SSL/TLS encryption for data transmission',
        '• Secure data storage with access controls',
        '• Regular security audits and updates',
        '',
        'Organizational Measures:',
        '• Limited employee access to personal data',
        '• Confidentiality agreements with staff',
        '• Incident response procedures',
        '',
        'While we strive to protect your data, no method of transmission is 100% secure.',
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies',
      icon: <FaCookieBite className="w-4 h-4" />,
      content: [
        'Our website uses cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can manage your cookie preferences through your browser settings.',
        '',
        'Types of Cookies We Use:',
        '• Essential Cookies: Required for website functionality',
        '• Performance Cookies: Analyze website usage and performance',
        '• Functional Cookies: Remember your preferences',
        '• Targeting Cookies: Deliver relevant advertisements',
        '',
        'Disabling cookies may affect website functionality — some features may not work properly without them.',
      ],
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      icon: <FaRegClock className="w-4 h-4" />,
      content: [
        'We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy:',
        '',
        '• Account information: Until account deletion',
        '• Order history: 7 years for tax and legal compliance',
        '• Design files: 2 years for reorder convenience',
        '• Communication records: 3 years',
        '',
        'You may request deletion of your data at any time, subject to legal retention requirements. After the retention period, data is securely deleted or anonymized.',
      ],
    },
    {
      id: 'user-rights',
      title: 'Your Rights',
      icon: <FaUserShield className="w-4 h-4" />,
      content: [
        'You have the right to access, update, or delete your personal information. You can also opt out of marketing communications at any time by following the unsubscribe link or contacting us directly.',
        '',
        '• Request a copy of your personal data',
        '• Correct inaccurate or incomplete information',
        '• Request deletion of your data (Right to be Forgotten)',
        '• Restrict or object to certain types of processing',
        '• Receive your data in a portable format',
        '',
        'To exercise these rights, please contact us at privacy@cluesstyle.com.',
      ],
    },
    {
      id: 'third-party',
      title: 'Third-Party Links',
      icon: <FaLink className="w-4 h-4" />,
      content: [
        'Our website may contain links to third-party websites, products, and services. We are not responsible for the privacy practices or content of these external sites.',
        'We encourage you to read the privacy policies of any third-party websites you visit. This policy applies only to information collected by Cluesstyle.',
      ],
    },
    {
      id: 'international',
      title: 'International Data Transfers',
      icon: <FaGlobe className="w-4 h-4" />,
      content: [
        'Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers:',
        '',
        '• Standard contractual clauses approved by relevant authorities',
        '• Data processing agreements with service providers',
        '• Compliance with GDPR and other applicable laws',
        '',
        'By using our services, you consent to the transfer of your data to India and other countries where we operate.',
      ],
    },
    {
      id: 'children',
      title: "Children's Privacy",
      icon: <FaChild className="w-4 h-4" />,
      content: [
        'Our services are not intended for children under the age of 13 (or 18, where our services are age-restricted). We do not knowingly collect personal information from children.',
        'If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately and we will take steps to remove it promptly.',
      ],
    },
    {
      id: 'policy-updates',
      title: 'Updates to This Policy',
      icon: <FaSyncAlt className="w-4 h-4" />,
      content: [
        'We may update this Privacy Policy from time to time. Any changes will be posted on this page with the updated date.',
        '',
        '• Material changes will be notified via email',
        '• The "Last Updated" date above will be revised',
        '• Continued use of our services constitutes acceptance of the changes',
        '',
        'We encourage you to review this policy periodically for any updates.',
      ],
    },
    {
      id: 'contact',
      title: 'Contact Us',
      icon: <FaEnvelope className="w-4 h-4" />,
      content: [
        'If you have any questions or concerns about this Privacy Policy, please contact us at:',
        '',
        'Address: 123 Creative Street, Andheri East, Mumbai - 400069, India',
        'Data Protection Officer: dpo@cluesstyle.com',
        '',
        'We aim to respond to all privacy-related inquiries within 15 business days. For GDPR-related requests, please include "GDPR Request" in your subject line.',
      ],
    },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setActiveSection(sectionId);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-b from-violet-50 via-violet-50/60 to-white">
        <div className="container mx-auto px-4 pt-6 pb-12 md:pb-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
            <span className="text-gray-300">›</span>
            <span className="text-gray-700">Privacy Policy</span>
          </nav>

          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-widest text-violet-600 mb-3 uppercase">Privacy Policy</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Your Privacy Matters
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                At Cluesstyle, we value your trust and are committed to protecting your personal
                information. This Privacy Policy explains how we collect, use, and safeguard your data.
              </p>
              <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 shadow-sm">
                <FaCalendarAlt className="w-3.5 h-3.5 text-violet-600" />
                Last Updated: {lastUpdated}
              </div>
            </div>

            {/* Decorative illustration */}
            <div className="relative flex-shrink-0 hidden md:flex items-center justify-center w-72 h-64">
              <div className="absolute inset-0 m-auto w-52 h-52 rounded-full bg-violet-100/80" />
              <div className="absolute left-4 top-2 w-44 h-56 bg-white rounded-2xl shadow-xl border border-gray-100 -rotate-6" />
              <div className="absolute inset-0 m-auto w-28 h-28 bg-violet-600 rounded-3xl rotate-12 flex items-center justify-center shadow-lg ring-4 ring-white">
                <FaLock className="w-10 h-10 text-white -rotate-12" />
              </div>
              <p className="absolute -top-2 right-0 text-right font-serif italic text-gray-600 leading-snug">
                Your<br />Data<br />
                <span className="underline decoration-violet-400 decoration-2 underline-offset-2">Our Priority</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          {/* Sidebar */}
          <div className="lg:w-72 flex-shrink-0 space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 lg:sticky lg:top-24">
              <h3 className="text-sm font-bold text-gray-900 mb-3">On This Page</h3>
              <ul className="space-y-1 max-h-[60vh] lg:max-h-none overflow-y-auto">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-sm transition-colors ${
                        activeSection === section.id
                          ? 'bg-violet-50 text-violet-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className={activeSection === section.id ? 'text-violet-600' : 'text-gray-400'}>
                        {section.icon}
                      </span>
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-violet-50 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                <FaHeadset className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Have Questions?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Our support team is here to help you with any privacy-related queries.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                <FaEnvelope className="w-3.5 h-3.5" /> Contact Support
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
            {sections.map((section, idx) => (
              <div key={section.id} id={section.id} className="p-6 sm:p-8 scroll-mt-24 flex gap-4 sm:gap-5">
                <span className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-violet-50 text-violet-600 font-bold text-xs sm:text-sm flex items-center justify-center">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{section.title}</h2>
                  <div className="space-y-2.5">
                    {section.content.map((paragraph, pIdx) => {
                      if (paragraph.startsWith('•')) {
                        return (
                          <div key={pIdx} className="flex items-start gap-2 text-gray-600 ml-1">
                            <span className="text-violet-500 mt-1">•</span>
                            <span>{paragraph.substring(1)}</span>
                          </div>
                        );
                      }
                      if (paragraph === '') {
                        return <div key={pIdx} className="h-2" />;
                      }
                      return (
                        <p key={pIdx} className="text-gray-600 leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>
                  {section.id === 'contact' && (
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-800">
                        <FaEnvelope className="w-3.5 h-3.5 text-violet-500" /> support@cluesstyle.com
                      </span>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-800">
                        <FaPhoneAlt className="w-3.5 h-3.5 text-violet-500" /> +91 800 555 1234
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}