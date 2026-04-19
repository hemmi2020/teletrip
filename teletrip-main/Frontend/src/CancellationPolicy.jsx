import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { Building2, Car, Ticket, RefreshCw } from 'lucide-react';

const policyCards = [
  {
    Icon: Building2,
    title: 'Hotel Cancellations',
    color: '#2563eb',
    rules: [
      { label: 'Free Cancellation Rates', desc: 'Cancel free of charge up to the deadline shown on your booking confirmation. Deadlines typically range from 24 to 72 hours before check-in, depending on the hotel.' },
      { label: 'Non-Refundable Rates', desc: 'These rates offer lower prices but cannot be cancelled or modified once confirmed. No refund will be issued for non-refundable bookings.' },
      { label: 'Partial Cancellations', desc: 'For multi-room bookings, individual rooms may be cancelled subject to the cancellation policy of each room. The remaining rooms will stay confirmed.' },
      { label: 'No-Show', desc: 'If you do not check in on the scheduled date without prior cancellation, the full booking amount will be charged.' },
    ],
  },
  {
    Icon: Car,
    title: 'Transfer Cancellations',
    color: '#059669',
    rules: [
      { label: 'Standard Transfers', desc: 'Free cancellation up to 24 hours before the scheduled pickup time. Cancellations within 24 hours may incur a charge of up to 100% of the transfer cost.' },
      { label: 'Private Transfers', desc: 'Free cancellation up to 48 hours before pickup. Late cancellations within 48 hours are subject to a 50–100% cancellation fee depending on the provider.' },
      { label: 'Modifications', desc: 'Changes to pickup time, location, or passenger count can be requested up to 12 hours before the scheduled pickup, subject to availability.' },
    ],
  },
  {
    Icon: Ticket,
    title: 'Activity Cancellations',
    color: '#7c3aed',
    rules: [
      { label: 'Standard Activities', desc: 'Most activities offer free cancellation up to 24–48 hours before the scheduled start time. The exact deadline is displayed on the activity details page.' },
      { label: 'Special Events & Tours', desc: 'Certain premium experiences, seasonal events, or limited-availability tours may have stricter cancellation policies, including non-refundable terms.' },
      { label: 'Weather-Related Cancellations', desc: 'If an activity is cancelled by the provider due to weather or safety concerns, you will receive a full refund or the option to reschedule.' },
    ],
  },
];

const CancellationPolicy = () => {
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
            <span className="text-[11px] font-semibold tracking-widest uppercase text-blue-500" style={{ letterSpacing: '0.14em' }}>Policies</span>
            <div className="w-8 h-px bg-blue-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Cancellation <span className="text-blue-600">Policy.</span>
          </h1>
          <p className="text-gray-500 text-base max-w-lg mx-auto" style={{ lineHeight: 1.7 }}>
            Understand our cancellation rules for hotels, transfers, and activities before you book.
          </p>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7c3aed, #3b82f6)', filter: 'blur(70px)' }} />
        <div className="max-w-4xl mx-auto relative space-y-12">
          {policyCards.map(({ Icon, title, color, rules }, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100" style={{ background: `${color}08` }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}14` }}>
                  <Icon style={{ width: 20, height: 20, color, strokeWidth: 1.8 }} />
                </div>
                <h2 className="text-lg font-bold text-gray-900" style={{ letterSpacing: '-0.01em' }}>{title}</h2>
              </div>
              <div className="p-6 space-y-5">
                {rules.map((rule, j) => (
                  <div key={j}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{rule.label}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{rule.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Refund Process */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3b82f6, #059669)', filter: 'blur(60px)' }} />
        <div className="max-w-3xl mx-auto relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <RefreshCw style={{ width: 20, height: 20, color: '#2563eb', strokeWidth: 1.8 }} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Refund Process</h2>
          </div>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Initiate Cancellation</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Log in to your account, go to "My Bookings," and select the booking you wish to cancel. Review the cancellation terms and confirm.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Confirmation Email</h3>
                <p className="text-gray-500 text-sm leading-relaxed">You'll receive an email confirming the cancellation and the refund amount (if applicable). Keep this for your records.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Refund Processing</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Refunds are processed within 5–10 business days to your original payment method. The exact timeline depends on your bank or card issuer.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Need Help?</h3>
                <p className="text-gray-500 text-sm leading-relaxed">If your refund hasn't appeared after 10 business days, contact us at support@telitrip.com or through our Contact page and we'll investigate promptly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CancellationPolicy;
