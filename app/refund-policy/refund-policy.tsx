// app/refund-policy/refund-policy.tsx
'use client';

import { useState, useEffect, JSX } from 'react';
import Link from 'next/link';
import { 
  FaShieldAlt, 
  FaClock, 
  FaUndo, 
  FaCreditCard,
  FaExclamationTriangle,
  FaCheckCircle,
  FaQuestionCircle,
  FaEnvelope,
  FaPhone,
  FaFileInvoice,
  FaTshirt,
  FaPrint,
  FaTruck,
  FaMoneyBillWave
} from 'react-icons/fa';

interface PolicySection {
  id: string;
  title: string;
  icon: JSX.Element;
  content: string[];
}

interface FAQ {
  question: string;
  answer: string;
}

export default function RefundPolicy() {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    // Set last updated date
    setLastUpdated(new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }, []);

  const policySections: PolicySection[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <FaShieldAlt className="w-6 h-6" />,
      content: [
        'At CluesStyle, we are committed to delivering high-quality custom printing services that meet your expectations. We understand that sometimes things don\'t go as planned, which is why we have established a clear and transparent refund policy.',
        'This policy applies to all our services including screen printing, embroidery, DTF printing, vinyl printing, sublimation, and custom apparel orders.',
        'Please read this policy carefully before making a purchase. By placing an order with us, you agree to the terms outlined below.',
      ],
    },
    {
      id: 'eligibility',
      title: 'Refund Eligibility',
      icon: <FaCheckCircle className="w-6 h-6" />,
      content: [
        '• Manufacturing defects or printing errors on our part',
        '• Damaged items received due to shipping issues',
        '• Wrong item or design shipped compared to approved proof',
        '• Order cancellation within 24 hours of placement (before production starts)',
        '',
        'The following situations are NOT eligible for refund:',
        '• Change of mind after production has started',
        '• Design approval errors (you approved a proof with mistakes)',
        '• Minor color variations (digital proofs vs physical products)',
        '• Sizing issues (please refer to our size charts before ordering)',
        '• Normal wear and tear after use',
      ],
    },
    {
      id: 'timeline',
      title: 'Refund Timeline',
      icon: <FaClock className="w-6 h-6" />,
      content: [
        '• You must report any issues within 7 days of receiving your order',
        '• Refund requests submitted after 7 days will be reviewed on a case-by-case basis',
        '• Once approved, refunds are processed within 5-7 business days',
        '• Refunds will be issued to the original payment method',
        '• Depending on your bank, it may take 3-5 additional days for the refund to appear in your account',
      ],
    },
    {
      id: 'process',
      title: 'Refund Process',
      icon: <FaUndo className="w-6 h-6" />,
      content: [
        '1. Contact our support team at support@cluesstyle.com with your order details',
        '2. Provide clear photos showing the issue (damage, printing error, etc.)',
        '3. Our team will review your request within 24-48 hours',
        '4. If approved, we will provide a return shipping label (if applicable)',
        '5. Once we receive the returned items, we will process your refund',
        '6. You will receive a confirmation email once the refund is processed',
      ],
    },
    {
      id: 'cancellation',
      title: 'Cancellation Policy',
      icon: <FaFileInvoice className="w-6 h-6" />,
      content: [
        '• Order cancellation is free within 24 hours of order placement',
        '• After 24 hours but before production: 20% cancellation fee applies',
        '• Once production has started: No cancellation is possible',
        '• Digital proofs must be approved before we start production',
        '• Please review your proof carefully as approval indicates acceptance of the final design',
      ],
    },
    {
      id: 'shipping',
      title: 'Shipping & Returns',
      icon: <FaTruck className="w-6 h-6" />,
      content: [
        '• Return shipping costs for defective items will be covered by CluesStyle',
        '• For non-defective returns, the customer is responsible for return shipping',
        '• We recommend using a trackable shipping service for returns',
        '• Original shipping charges are non-refundable unless the error was on our part',
        '• International orders may have different return shipping arrangements',
      ],
    },
  ];

  const faqs: FAQ[] = [
    {
      question: 'How long do I have to request a refund?',
      answer: 'You have 7 days from the date of delivery to report any issues and request a refund. After 7 days, refund requests will be reviewed on a case-by-case basis.',
    },
    {
      question: 'What if I approved a proof with an error?',
      answer: 'Once you approve a digital proof, you are accepting the design as final. Errors in approved proofs cannot be refunded. Please review all proofs carefully before approval.',
    },
    {
      question: 'Do you offer refunds for custom designs?',
      answer: 'Custom designs are non-refundable once production has started. However, if there is a manufacturing defect or printing error on our part, we will reprint or refund.',
    },
    {
      question: 'How are refunds processed for bulk orders?',
      answer: 'For bulk orders, we may offer partial refunds or reprints for defective items rather than full order refunds. Each case is evaluated individually.',
    },
    {
      question: 'What if my package is lost in transit?',
      answer: 'If your package is lost in transit, we will file a claim with the shipping carrier. Once confirmed lost, we will either reprint your order or issue a full refund.',
    },
    {
      question: 'Can I exchange an item for a different size?',
      answer: 'Exchanges are handled on a case-by-case basis. Please contact our support team within 7 days of delivery to discuss exchange options.',
    },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveSection(sectionId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-[#155d8c] via-purple-700 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
              <FaMoneyBillWave className="w-10 h-10" />
            </div> */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Refund & Cancellation Policy</h1>
            <p className="text-xl text-gray-200 mb-2">
              Clear, transparent, and customer-friendly policies
            </p>
            <p className="text-sm text-gray-300">
              Last Updated: {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Quick Navigation</h3>
              <ul className="space-y-2">
                {policySections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                        activeSection === section.id
                          ? 'bg-purple-50 text-purple-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-purple-500">{section.icon}</span>
                      {section.title}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => scrollToSection('faq')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                      activeSection === 'faq'
                        ? 'bg-purple-50 text-purple-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FaQuestionCircle className="w-5 h-5 text-purple-500" />
                    FAQs
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4 space-y-8">
            {/* Policy Sections */}
            {policySections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden scroll-mt-24"
              >
                <div className="border-l-4 border-purple-600 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-purple-600">{section.icon}</div>
                    <h2 className="text-2xl font-bold text-gray-800">{section.title}</h2>
                  </div>
                  <div className="space-y-3">
                    {section.content.map((paragraph, idx) => {
                      if (paragraph.startsWith('•')) {
                        return (
                          <div key={idx} className="flex items-start gap-2 text-gray-600 ml-4">
                            <span className="text-purple-500 mt-1">•</span>
                            <span>{paragraph.substring(1)}</span>
                          </div>
                        );
                      }
                      if (paragraph.match(/^\d+\./)) {
                        return (
                          <div key={idx} className="flex items-start gap-3 text-gray-600 ml-2">
                            <span className="font-medium text-purple-600 min-w-[24px]">{paragraph.split('.')[0]}.</span>
                            <span>{paragraph.split('.').slice(1).join('.').trim()}</span>
                          </div>
                        );
                      }
                      if (paragraph === '') {
                        return <div key={idx} className="h-2"></div>;
                      }
                      return (
                        <p key={idx} className="text-gray-600 leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* FAQs Section */}
            <div id="faq" className="bg-white rounded-xl shadow-sm overflow-hidden scroll-mt-24">
              <div className="border-l-4 border-purple-600 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <FaQuestionCircle className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                      <h3 className="font-semibold text-gray-800 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaEnvelope className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-800">Need Help?</h2>
              </div>
              <p className="text-gray-600 mb-4">
                If you have any questions about our refund policy or need assistance with a refund request, please don't hesitate to contact us.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FaEnvelope className="w-4 h-4" />
                  Contact Support
                </Link>
                <a
                  href="mailto:support@cluesstyle.com"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <FaEnvelope className="w-4 h-4" />
                  support@cluesstyle.com
                </a>
              </div>
            </div>

            {/* Note Section */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Important Note</h3>
                  <p className="text-sm text-gray-600">
                    This refund policy is subject to change without prior notice. Please review this page periodically for updates. 
                    For any disputes, the laws of India shall apply and courts in [Your City] shall have exclusive jurisdiction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}