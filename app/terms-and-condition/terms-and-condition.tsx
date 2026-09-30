// PATH: app/terms-and-condition/terms-and-condition.tsx
// app/terms-and-condition/terms-and-condition.tsx
'use client';

import { useState, useEffect, JSX } from 'react';
import Link from 'next/link';
import {
  FaFileContract,
  FaShieldAlt,
  FaCopyright,
  FaCreditCard,
  FaGavel,
  FaUserSecret,
  FaTruck,
  FaUndo,
  FaCheckCircle,
  FaEnvelope,
  FaPrint,
  FaPalette,
  FaRegClock,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaHeadset,
  FaPhoneAlt,
  FaWhatsapp,
  FaBan,
} from 'react-icons/fa';

interface Section {
  id: string;
  title: string;
  icon: JSX.Element;
  content: string[];
}

export default function TermsAndCondition() {
  // Empty string = every panel collapsed. Only one section open at a time,
  // same interaction as the reference design — clicking an open section
  // closes it again.
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
      title: 'Acceptance of Terms',
      icon: <FaFileContract className="w-5 h-5" />,
      content: [
        'Welcome to CluesStyle. These Terms and Conditions govern your use of our website and services. By accessing or using our services, you agree to be bound by these terms.',
        'Please read these terms carefully before placing any order. If you disagree with any part of these terms, you may not access our services.',
        'CluesStyle reserves the right to modify these terms at any time. Changes become effective immediately upon posting. Your continued use of our services constitutes acceptance of modified terms.',
      ],
    },
    {
      id: 'services',
      title: 'Use of Website',
      icon: <FaPrint className="w-5 h-5" />,
      content: [
        'You agree to use this website only for lawful purposes and in a way that does not infringe the rights of others or restrict their use and enjoyment of the site.',
        'CluesStyle provides professional printing services including but not limited to:',
        '• Screen Printing',
        '• Embroidery',
        '• DTF (Direct to Film) Printing',
        '• Vinyl Printing',
        '• Sublimation Printing',
        '• Custom T-Shirt Design',
        '• Bulk Order Fulfillment',
        '',
        'We reserve the right to refuse service to anyone for any reason at any time, and all services are subject to availability and may be discontinued or modified without notice.',
      ],
    },
    {
      id: 'orders',
      title: 'Orders & Product Information',
      icon: <FaCheckCircle className="w-5 h-5" />,
      content: [
        'All products displayed on our website are subject to availability. We reserve the right to refuse or cancel any order at our discretion.',
        'By placing an order with CluesStyle, you represent that:',
        '• You are at least 18 years of age',
        '• You have the legal right to use the designs/artwork submitted',
        '• All information provided is accurate and complete',
        '• You understand that digital proofs are for layout representation only',
        '',
        'Order Acceptance:',
        'We reserve the right to accept or decline any order. Order confirmation does not guarantee acceptance.',
        '',
        'Production Timeline:',
        'Production begins only after full payment or deposit is received, artwork is approved via digital proof, and all necessary information has been provided.',
      ],
    },
    {
      id: 'pricing',
      title: 'Pricing & Payment',
      icon: <FaCreditCard className="w-5 h-5" />,
      content: [
        'All prices are listed in INR and are inclusive/exclusive of GST as mentioned. We reserve the right to change prices at any time without prior notice — quoted prices remain valid for 30 days.',
        '',
        'Payment Terms:',
        '• 50% advance payment required for custom orders',
        '• 100% payment required for sample orders',
        '• Balance payment due before shipping',
        '• Bulk orders may have different payment terms as agreed',
        '',
        'Accepted Payment Methods:',
        '• Credit/Debit Cards',
        '• Net Banking',
        '• UPI',
        '• Bank Transfer',
        '• Razorpay (Secure Payment Gateway)',
        '',
        'Late payments may result in production delays or order cancellation.',
      ],
    },
    {
      id: 'designs',
      title: 'Customization & Artwork',
      icon: <FaPalette className="w-5 h-5" />,
      content: [
        'Customers are responsible for providing high-quality design files. We are not liable for issues arising from low-resolution or incorrect artwork.',
        '',
        'Artwork Requirements:',
        '• Minimum 300 DPI resolution for optimal print quality',
        '• Vector files preferred (AI, EPS, PDF, SVG)',
        '• Acceptable formats: PNG, JPG, PSD, AI, EPS, PDF',
        '• Color mode: CMYK for printing, RGB for digital proofs',
        '',
        'Design Ownership:',
        'You retain all rights to your original designs. By submitting artwork, you grant us permission to use it for your order.',
        '',
        'Prohibited Content:',
        'We do not print designs containing copyrighted material without permission, obscene or offensive content, counterfeit or trademark-infringing designs, or politically/religiously sensitive material. We reserve the right to reject any design that violates these terms.',
        '',
        'A digital proof is provided for your approval before production. Once approved, no changes can be made — approved proofs are considered final, and we are not liable for errors in approved designs. We provide up to 3 rounds of free revisions; additional revisions may incur charges.',
      ],
    },
    {
      id: 'shipping',
      title: 'Shipping & Delivery',
      icon: <FaTruck className="w-5 h-5" />,
      content: [
        'Delivery timelines are estimates and may vary due to location, courier delays, or unforeseen circumstances.',
        '',
        'Domestic Shipping:',
        '• Standard shipping: 3-7 business days',
        '• Express shipping: 1-3 business days',
        '• Free shipping on orders above ₹5,000',
        '',
        'International Shipping:',
        '• Delivery time: 7-21 business days',
        "• Customs duties and taxes are the buyer's responsibility",
        '• We are not responsible for customs delays',
        '',
        'Risk of loss passes to you upon delivery to the carrier. Please inspect packages immediately upon arrival and report damages within 48 hours.',
      ],
    },
    {
      id: 'refunds',
      title: 'Returns & Refunds',
      icon: <FaUndo className="w-5 h-5" />,
      content: [
        'Since our products are custom printed and made-to-order, returns are accepted only in case of manufacturing defects or if you receive a wrong product.',
        '',
        'Key Points:',
        '• Defective products: Full refund or reprint',
        '• Wrong item shipped: Full refund or reprint',
        '• Customer errors: No refund after proof approval',
        '• Change of mind: No refund after production starts',
        '',
        'Refund requests must be submitted within 7 days of delivery. Custom and personalized items are generally non-refundable unless defective. Please refer to our detailed Refund Policy for complete information.',
      ],
    },
    {
      id: 'cancellation',
      title: 'Cancellation Policy',
      icon: <FaBan className="w-5 h-5" />,
      content: [
        'Orders can be cancelled within a limited time before production begins. Once production has started, cancellations may not be possible.',
        'To request a cancellation, contact our support team as soon as possible with your order reference — the closer you are to the production start date, the less likely a full refund becomes.',
      ],
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      icon: <FaGavel className="w-5 h-5" />,
      content: [
        'CluesStyle shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products.',
        'To the maximum extent permitted by law, this also covers loss of profits, revenue, or data, delays caused by circumstances beyond our control, and third-party claims arising from your use of our products.',
        'Our total liability shall not exceed the amount paid for the specific order. We are not responsible for errors in user-provided artwork or specifications.',
      ],
    },
    {
      id: 'governing',
      title: 'Changes to Terms',
      icon: <FaShieldAlt className="w-5 h-5" />,
      content: [
        'We may update these Terms & Conditions from time to time. Any changes will be posted on this page with the updated date.',
        'These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms or your use of our services shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.',
        'If any provision of these terms is found to be unenforceable, the remaining provisions shall remain in effect. Our failure to enforce any right or provision does not waive that right.',
      ],
    },
    {
      id: 'intellectual',
      title: 'Intellectual Property',
      icon: <FaCopyright className="w-5 h-5" />,
      content: [
        'All content on this website, including logos, designs, text, graphics, and images, is the property of CluesStyle and protected by copyright laws.',
        '',
        'You may not:',
        '• Copy, reproduce, or distribute our content without permission',
        '• Use our designs for commercial purposes without authorization',
        '• Claim our designs as your own',
        '• Resell our products without written consent',
        '',
        'CluesStyle respects intellectual property rights. If you believe your work has been infringed, please contact us with proper documentation.',
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy & Data',
      icon: <FaUserSecret className="w-5 h-5" />,
      content: [
        'Your privacy is important to us. Please review our Privacy Policy for information on how we collect, use, and protect your data.',
        '',
        'By using our services, you consent to:',
        '• Collection and use of your information as described',
        '• Receiving order-related communications',
        '• Storage of your design files for future reorders',
        '',
        'We do not sell or share your personal information with third parties except as necessary to fulfill your order.',
      ],
    },
    {
      id: 'contact',
      title: 'Contact Us',
      icon: <FaEnvelope className="w-5 h-5" />,
      content: [
        'If you have any questions about these Terms and Conditions, please contact us:',
        '',
        'Email: legal@cluesstyle.com',
        'Phone: +91 800 555 1234',
        'Address: 123 Creative Street, Andheri East, Mumbai - 400069, India',
        '',
        'We aim to respond to all inquiries within 2 business days.',
      ],
    },
  ];

  const toggleSection = (id: string) => {
    setActiveSection((prev) => (prev === id ? '' : id));
  };

  // First non-empty, non-bullet line of a section — used as the one-line
  // preview shown while a panel is collapsed.
  const previewOf = (section: Section) =>
    section.content.find((p) => p && !p.startsWith('•')) ?? '';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-b from-violet-50 via-violet-50/60 to-white">
        <div className="container mx-auto px-4 pt-6 pb-12 md:pb-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
            <span className="text-gray-300">›</span>
            <span className="text-gray-700">Terms & Conditions</span>
          </nav>

          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-6">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Terms &amp; Conditions
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Please read these terms carefully before using our website or placing an order.
                By accessing or using CluesStyle, you agree to be bound by these terms.
              </p>
              <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 shadow-sm">
                <FaCalendarAlt className="w-3.5 h-3.5 text-violet-600" />
                Last Updated: {lastUpdated}
              </div>
            </div>

            {/* Decorative illustration */}
            <div className="relative flex-shrink-0 hidden md:flex items-center justify-center w-72 h-64">
              <div className="absolute inset-0 m-auto w-52 h-52 rounded-full bg-violet-100/80" />
              <div className="absolute left-2 top-2 w-40 h-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 -rotate-6">
                <div className="space-y-2.5">
                  <div className="h-2 bg-gray-200 rounded w-full" />
                  <div className="h-2 bg-gray-200 rounded w-5/6" />
                  <div className="h-2 bg-gray-200 rounded w-full" />
                  <div className="h-2 bg-gray-200 rounded w-4/6" />
                  <div className="h-2 bg-gray-200 rounded w-full" />
                </div>
                <div className="mt-8 text-2xl text-gray-300 font-serif italic">Sign</div>
              </div>
              <div className="absolute bottom-2 right-6 w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                <FaCheck className="w-7 h-7 text-white" />
              </div>
              <p className="absolute -top-2 right-0 text-right font-serif italic text-gray-600 leading-snug">
                Print<br />Customize<br />Create<br />
                <span className="underline decoration-violet-400 decoration-2 underline-offset-2">Together</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-5xl mx-auto space-y-4">
          {sections.map((section, idx) => {
            const isOpen = activeSection === section.id;
            return (
              <div
                key={section.id}
                id={section.id}
                className={`rounded-2xl border transition-colors scroll-mt-24 ${
                  isOpen ? 'bg-violet-50 border-violet-100' : 'bg-white border-gray-100 hover:border-violet-200'
                }`}
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-3 sm:gap-4 p-5 sm:p-6 text-left"
                >
                  <span
                    className={`flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      isOpen ? 'bg-violet-600 text-white' : 'bg-white border-2 border-violet-200 text-violet-600'
                    }`}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className={`flex-shrink-0 hidden xs:flex ${isOpen ? 'text-violet-700' : 'text-gray-500'}`}>
                    {section.icon}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-gray-900 text-base sm:text-lg">{section.title}</span>
                    {!isOpen && (
                      <span className="block text-sm text-gray-500 mt-0.5 truncate">{previewOf(section)}</span>
                    )}
                  </span>
                  <span className={`flex-shrink-0 ${isOpen ? 'text-violet-600' : 'text-gray-400'}`}>
                    {isOpen ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 sm:pl-[92px]">
                    <div className="space-y-3">
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
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Help / contact CTA */}
        <div className="max-w-5xl mx-auto mt-10">
          <div className="bg-violet-50 rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-10">
            <div className="flex items-start gap-5 flex-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                <FaHeadset className="w-6 h-6 sm:w-7 sm:h-7 text-violet-600" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-violet-600 mb-1 uppercase">Still have questions?</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">We&apos;re Here to Help</h3>
                <p className="text-gray-600 mb-5 max-w-md">
                  If you have any questions about our Terms &amp; Conditions, feel free to reach out to our support team.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
                >
                  <FaEnvelope className="w-4 h-4" /> Contact Support
                </Link>
              </div>
            </div>

            <div className="hidden lg:block w-px self-stretch bg-violet-200" />

            <div className="flex flex-col gap-5 w-full lg:w-64 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">
                  <FaEnvelope className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900 text-sm truncate">legal@cluesstyle.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">
                  <FaPhoneAlt className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Call Us</p>
                  <p className="font-semibold text-gray-900 text-sm truncate">+91 800 555 1234</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                  <FaWhatsapp className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">WhatsApp</p>
                  <p className="font-semibold text-gray-900 text-sm truncate">+91 800 555 1234</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}