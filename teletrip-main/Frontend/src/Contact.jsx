import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: integrate with backend
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #3b82f6, #8b5cf6)', filter: 'blur(80px)' }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-px bg-blue-500" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-blue-500" style={{ letterSpacing: '0.14em' }}>Get in Touch</span>
            <div className="w-8 h-px bg-blue-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            We'd love to<br /><span className="text-blue-600">hear from you.</span>
          </h1>
          <p className="text-gray-500 text-base max-w-lg mx-auto" style={{ lineHeight: 1.7 }}>
            Have a question about your booking, need help planning a trip, or just want to say hello? We're here for you.
          </p>
        </div>
      </section>

      {/* Contact cards + Form */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
            {[
              { Icon: Mail, title: 'Email Us', detail: 'support@telitrip.com', sub: 'We reply within 24 hours', color: '#2563eb' },
              { Icon: Phone, title: 'Call Us', detail: '+92 300 1234567', sub: 'Mon–Fri, 9am–6pm PKT', color: '#059669' },
              { Icon: MapPin, title: 'Visit Us', detail: 'Islamabad, Pakistan', sub: 'By appointment only', color: '#7c3aed' },
            ].map(({ Icon, title, detail, sub, color }, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: `${color}12` }}>
                  <Icon style={{ width: 22, height: 22, color, strokeWidth: 1.8 }} />
                </div>
                <h3 className="text-gray-900 font-semibold text-base mb-1">{title}</h3>
                <p className="text-gray-700 text-sm font-medium mb-0.5">{detail}</p>
                <p className="text-gray-400 text-[12px]">{sub}</p>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Send us a message</h2>
            </div>

            {sent && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center gap-2">
                <Send className="w-4 h-4" /> Message sent! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="john@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                <input type="text" required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="How can we help?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                  placeholder="Tell us more about your inquiry..." />
              </div>
              <button type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
                style={{ minHeight: 'unset' }}>
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
