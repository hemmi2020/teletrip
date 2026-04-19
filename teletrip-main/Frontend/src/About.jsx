import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { Heart, Target, Globe, Users, Shield, Zap } from 'lucide-react';

const About = () => {
  const values = [
    { Icon: Shield, title: 'Trust', desc: 'We partner with verified hotels, transfer providers, and activity operators worldwide to ensure every booking meets our quality standards.', color: '#2563eb' },
    { Icon: Zap, title: 'Innovation', desc: 'Our platform leverages cutting-edge technology to deliver real-time pricing, instant confirmations, and a seamless booking experience.', color: '#7c3aed' },
    { Icon: Globe, title: 'Global Reach', desc: 'Access thousands of destinations across the globe with localized support, multi-currency payments, and 24/7 customer assistance.', color: '#059669' },
  ];

  const principles = [
    { Icon: Heart, title: 'Customer First', desc: 'Every decision we make starts with our travelers. Your satisfaction drives our innovation.' },
    { Icon: Users, title: 'Inclusive Travel', desc: 'We believe travel should be accessible to everyone, regardless of budget or background.' },
    { Icon: Target, title: 'Transparency', desc: 'No hidden fees, no surprises. What you see is what you pay — always.' },
    { Icon: Shield, title: 'Data Privacy', desc: 'Your personal information is protected with enterprise-grade security and encryption.' },
  ];

  return (
    <div className="bg-white min-h-screen">
      <Header />

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #3b82f6, #8b5cf6)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #059669, #3b82f6)', filter: 'blur(60px)' }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-px bg-blue-500" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-blue-500" style={{ letterSpacing: '0.14em' }}>Who We Are</span>
            <div className="w-8 h-px bg-blue-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            About <span className="text-blue-600">Telitrip.</span>
          </h1>
          <p className="text-gray-500 text-base max-w-lg mx-auto" style={{ lineHeight: 1.7 }}>
            We're on a mission to make travel planning effortless, transparent, and enjoyable for everyone.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-10 right-0 w-72 h-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7c3aed, #3b82f6)', filter: 'blur(70px)' }} />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6" style={{ letterSpacing: '-0.02em' }}>Our Mission</h2>
          <p className="text-gray-600 text-base leading-relaxed mb-4">
            At Telitrip, we believe that planning a trip should be as exciting as the journey itself. Founded with a passion for travel and technology, we set out to build a platform that connects travelers with the best hotels, transfers, and activities — all in one place.
          </p>
          <p className="text-gray-600 text-base leading-relaxed">
            Our team works tirelessly to negotiate the best rates, verify every listing, and ensure that your experience from search to checkout is smooth, secure, and delightful. Whether you're booking a weekend getaway or a month-long adventure, Telitrip is your trusted travel companion.
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3b82f6, #059669)', filter: 'blur(60px)' }} />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-px bg-blue-500" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-blue-500" style={{ letterSpacing: '0.14em' }}>Why Telitrip</span>
              <div className="w-8 h-px bg-blue-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Why Choose Us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {values.map(({ Icon, title, desc, color }, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 text-center">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5" style={{ background: `${color}12` }}>
                  <Icon style={{ width: 26, height: 26, color, strokeWidth: 1.8 }} />
                </div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-20 -right-10 w-56 h-56 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #f59e0b, #ef4444)', filter: 'blur(60px)' }} />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Our Values</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">The principles that guide everything we do at Telitrip.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {principles.map(({ Icon, title, desc }, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon style={{ width: 20, height: 20, color: '#2563eb', strokeWidth: 1.8 }} />
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold text-base mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
