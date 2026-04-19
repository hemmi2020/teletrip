import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

const sections = [
  {
    title: '1. Information We Collect',
    content: [
      'We collect information you provide directly when creating an account, making a booking, or contacting our support team. This includes your name, email address, phone number, payment details, and travel preferences.',
      'We also collect information automatically when you use our platform, including your IP address, browser type, device information, pages visited, and interaction data through cookies and similar technologies.',
    ],
  },
  {
    title: '2. How We Use Your Data',
    content: [
      'We use your personal information to process bookings, manage your account, send booking confirmations and travel updates, and provide customer support.',
      'We may also use your data to personalize your experience, improve our services, send promotional offers (with your consent), detect fraud, and comply with legal obligations.',
    ],
  },
  {
    title: '3. Cookies & Tracking',
    content: [
      'Telitrip uses cookies and similar tracking technologies to enhance your browsing experience, remember your preferences, and analyze site traffic. Essential cookies are required for the platform to function properly.',
      'You can manage your cookie preferences through your browser settings. Disabling certain cookies may affect the functionality of our platform.',
    ],
  },
  {
    title: '4. Third-Party Sharing',
    content: [
      'We share your information with hotel partners, transfer providers, and activity operators solely to fulfill your bookings. We also share data with payment processors (Stripe) to complete transactions securely.',
      'We do not sell your personal information to third parties. We may share anonymized, aggregated data with analytics partners to improve our services.',
    ],
  },
  {
    title: '5. Data Security',
    content: [
      'We implement industry-standard security measures including SSL/TLS encryption, secure payment processing through PCI DSS-compliant providers, and regular security audits to protect your personal information.',
      'While we take every reasonable precaution, no method of electronic transmission or storage is 100% secure. We encourage you to use strong passwords and keep your account credentials confidential.',
    ],
  },
  {
    title: '6. Your Rights',
    content: [
      'You have the right to access, correct, or delete your personal data at any time. You can update your information through your account settings or by contacting our support team.',
      'You may also request a copy of your data, withdraw consent for marketing communications, or request account deletion. We will respond to all valid requests within 30 days.',
    ],
  },
  {
    title: '7. Data Retention',
    content: [
      'We retain your personal information for as long as your account is active or as needed to provide our services. Booking records are kept for a minimum of 5 years to comply with legal and financial reporting requirements.',
      'When you delete your account, we will remove your personal data within 30 days, except where retention is required by law.',
    ],
  },
  {
    title: '8. Contact Us',
    content: [
      'If you have any questions or concerns about this Privacy Policy or how we handle your data, please contact us at privacy@telitrip.com or through our Contact page.',
      'This Privacy Policy was last updated on January 1, 2025. We may update this policy from time to time and will notify you of any significant changes via email or a notice on our platform.',
    ],
  },
];

const PrivacyPolicy = () => {
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
            Privacy <span className="text-blue-600">Policy.</span>
          </h1>
          <p className="text-gray-500 text-base max-w-lg mx-auto" style={{ lineHeight: 1.7 }}>
            Your privacy matters to us. Learn how we collect, use, and protect your personal information.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-40 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7c3aed, #3b82f6)', filter: 'blur(70px)' }} />
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

export default PrivacyPolicy;
