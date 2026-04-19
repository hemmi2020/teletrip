import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: [
      'By accessing or using the Telitrip platform, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.',
      'We reserve the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the revised terms. We will notify registered users of significant changes via email.',
    ],
  },
  {
    title: '2. Services',
    content: [
      'Telitrip provides an online platform for searching, comparing, and booking hotels, airport transfers, and local activities. We act as an intermediary between you and the service providers (hotels, transfer operators, activity organizers).',
      'While we strive to ensure accuracy, all information including pricing, availability, and descriptions is provided by third-party suppliers and may change without notice. Telitrip is not the direct provider of travel services.',
    ],
  },
  {
    title: '3. Booking Terms',
    content: [
      'When you make a booking through Telitrip, you enter into a contract with the respective service provider. You are responsible for providing accurate information including guest names, travel dates, and contact details.',
      'A booking is confirmed only when you receive a confirmation email with a booking reference number. Prices are subject to availability and may change until the booking is confirmed and payment is processed.',
    ],
  },
  {
    title: '4. Payments',
    content: [
      'All payments are processed securely through our payment partner, Stripe. By making a payment, you confirm that you are authorized to use the payment method provided.',
      'Prices displayed on the platform include applicable taxes unless otherwise stated. Currency conversion rates are indicative and may differ slightly from the rate applied by your bank or card issuer.',
    ],
  },
  {
    title: '5. Cancellations & Refunds',
    content: [
      'Cancellation policies vary by service provider and rate type. Free cancellation deadlines, non-refundable rates, and partial refund terms are clearly displayed at the time of booking.',
      'To cancel a booking, log in to your account and navigate to "My Bookings." Refunds for eligible cancellations are processed within 5–10 business days. Telitrip is not responsible for delays caused by your bank or payment provider.',
    ],
  },
  {
    title: '6. User Responsibilities',
    content: [
      'You agree to use the platform only for lawful purposes and in accordance with these terms. You are responsible for maintaining the confidentiality of your account credentials.',
      'You must not attempt to gain unauthorized access to our systems, interfere with the platform\'s operation, submit false information, or use the platform for any fraudulent or illegal activity.',
    ],
  },
  {
    title: '7. Limitation of Liability',
    content: [
      'Telitrip acts as an intermediary and is not liable for the quality, safety, or availability of services provided by third-party suppliers. Any disputes regarding the services should be directed to the respective provider.',
      'To the maximum extent permitted by law, Telitrip shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform or any booking made through it.',
    ],
  },
  {
    title: '8. Intellectual Property',
    content: [
      'All content on the Telitrip platform, including text, graphics, logos, images, and software, is the property of Telitrip or its licensors and is protected by intellectual property laws.',
      'You may not reproduce, distribute, modify, or create derivative works from any content on our platform without prior written consent from Telitrip.',
    ],
  },
  {
    title: '9. Governing Law',
    content: [
      'These Terms and Conditions are governed by and construed in accordance with the laws of Pakistan. Any disputes arising from these terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts of Islamabad, Pakistan.',
      'If any provision of these terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.',
    ],
  },
  {
    title: '10. Contact',
    content: [
      'If you have any questions about these Terms and Conditions, please contact us at legal@telitrip.com or through our Contact page.',
      'These Terms and Conditions were last updated on January 1, 2025.',
    ],
  },
];

const Terms = () => {
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
            <span className="text-[11px] font-semibold tracking-widest uppercase text-blue-500" style={{ letterSpacing: '0.14em' }}>Legal</span>
            <div className="w-8 h-px bg-blue-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Terms & <span className="text-blue-600">Conditions.</span>
          </h1>
          <p className="text-gray-500 text-base max-w-lg mx-auto" style={{ lineHeight: 1.7 }}>
            Please read these terms carefully before using the Telitrip platform.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-40 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7c3aed, #3b82f6)', filter: 'blur(70px)' }} />
        <div className="absolute bottom-20 -left-10 w-48 h-48 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #059669, #3b82f6)', filter: 'blur(50px)' }} />
        <div className="max-w-3xl mx-auto relative">
          <div className="space-y-10">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-lg font-bold text-gray-900 mb-3" style={{ letterSpacing: '-0.01em' }}>{section.title}</h2>
                {section.content.map((para, j) => (
                  <p key={j} className="text-gray-600 text-sm leading-relaxed mb-3 last:mb-0">{para}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
