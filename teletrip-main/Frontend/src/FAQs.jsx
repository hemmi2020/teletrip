import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    category: 'Booking',
    items: [
      { q: 'How do I search for and book a hotel?', a: 'Simply enter your destination, check-in and check-out dates, and the number of guests on our homepage. Browse the results, select your preferred hotel, choose a room, and proceed to checkout. You\'ll receive an instant confirmation via email.' },
      { q: 'Can I book hotels, transfers, and activities together?', a: 'Yes! Telitrip lets you add hotels, airport transfers, and local activities to a single cart. You can book everything in one checkout for a seamless travel planning experience.' },
      { q: 'How do I modify an existing booking?', a: 'Log in to your account and navigate to "My Bookings." Select the booking you want to modify and follow the on-screen instructions. Modification availability depends on the provider\'s policy and how close you are to the travel date.' },
    ],
  },
  {
    category: 'Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express), as well as online payment options through Stripe. All transactions are secured with industry-standard encryption.' },
      { q: 'Is my payment information secure?', a: 'Absolutely. We use Stripe for payment processing, which is PCI DSS Level 1 certified — the highest level of security in the payments industry. We never store your full card details on our servers.' },
    ],
  },
  {
    category: 'Cancellations',
    items: [
      { q: 'What is your cancellation policy?', a: 'Cancellation policies vary by provider and rate type. Free cancellation is available on many bookings if cancelled before the deadline shown at checkout. Non-refundable rates are clearly marked and offer lower prices in exchange for no cancellation flexibility.' },
      { q: 'How long does a refund take?', a: 'Once a cancellation is confirmed, refunds are typically processed within 5–10 business days. The exact timeline depends on your bank or card issuer. You\'ll receive an email confirmation when the refund is initiated.' },
    ],
  },
  {
    category: 'General',
    items: [
      { q: 'Do I need an account to make a booking?', a: 'While you can browse our platform without an account, you\'ll need to create one to complete a booking. Having an account also lets you track bookings, save favorites, and access exclusive deals.' },
      { q: 'What currencies do you support?', a: 'Telitrip supports multiple currencies including USD, EUR, GBP, PKR, and more. You can switch your preferred currency from the header at any time, and prices will update in real time.' },
      { q: 'How can I contact customer support?', a: 'You can reach us via our Contact page, by emailing support@telitrip.com, or by calling +92 300 1234567 during business hours (Mon–Fri, 9am–6pm PKT). We aim to respond to all inquiries within 24 hours.' },
    ],
  },
];

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => setOpenIndex(openIndex === idx ? null : idx);

  let globalIdx = 0;

  return (
    <div className="bg-white min-h-screen">
      <Header />

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #3b82f6, #8b5cf6)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #059669, #3b82f6)', filter: 'blur(60px)' }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-px bg-blue-500" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-blue-500" style={{ letterSpacing: '0.14em' }}>Support</span>
            <div className="w-8 h-px bg-blue-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Frequently Asked<br /><span className="text-blue-600">Questions.</span>
          </h1>
          <p className="text-gray-500 text-base max-w-lg mx-auto" style={{ lineHeight: 1.7 }}>
            Find quick answers to common questions about bookings, payments, cancellations, and more.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7c3aed, #3b82f6)', filter: 'blur(70px)' }} />
        <div className="max-w-3xl mx-auto relative">
          {faqs.map((section) => (
            <div key={section.category} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle style={{ width: 18, height: 18, color: '#2563eb', strokeWidth: 1.8 }} />
                <h2 className="text-lg font-bold text-gray-900" style={{ letterSpacing: '-0.01em' }}>{section.category}</h2>
              </div>
              <div className="space-y-3">
                {section.items.map((item) => {
                  const idx = globalIdx++;
                  const isOpen = openIndex === idx;
                  return (
                    <div key={idx} className={`rounded-2xl border transition-all duration-300 ${isOpen ? 'border-blue-200 bg-blue-50/30 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                      <button
                        onClick={() => toggle(idx)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left"
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm font-semibold text-gray-900 pr-4">{item.q}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}
                          style={{ strokeWidth: 2 }}
                        />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{item.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQs;
