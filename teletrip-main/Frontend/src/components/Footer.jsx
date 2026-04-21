import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import logo from '../images/Telitrip-Logo-1.png';

const Footer = () => {
  const quickLinks = [
    { text: 'Home', href: '/home' },
    { text: 'About Us', href: '/about' },
    { text: 'Contact', href: '/contact' },
    { text: 'FAQs', href: '/faqs' },
  ];

  const legalLinks = [
    { text: 'Privacy Policy', href: '/privacy-policy' },
    { text: 'Terms & Conditions', href: '/terms' },
    { text: 'Cancellation Policy', href: '/cancellation-policy' },
  ];

  return (
    <footer className="bg-gray-50 relative overflow-hidden">
      {/* Gradient blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #3b82f6, #8b5cf6)', filter: 'blur(80px)' }} />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #059669, #06b6d4)', filter: 'blur(60px)' }} />

      {/* ── Mobile Footer — dark, minimal, centered ── */}
      <div className="md:hidden relative overflow-hidden" style={{ background: '#0f172a' }}>
        {/* Subtle glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full opacity-[0.08]" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', filter: 'blur(40px)' }} />

        <div className="relative px-6 pt-10 pb-24 text-center">
          {/* Logo */}
          <Link to="/home" className="inline-block mb-3">
            <img src={logo} alt="Telitrip" className="h-14 w-auto mx-auto brightness-0 invert opacity-80" />
          </Link>
          <p className="text-white/30 text-[11px] mb-7 max-w-[220px] mx-auto leading-relaxed">
            Hotels · Transfers · Experiences<br />Best rates, guaranteed.
          </p>

          {/* Links — single row, dot-separated */}
          <div className="flex items-center justify-center flex-wrap gap-x-1.5 gap-y-1 mb-6">
            {[...quickLinks, ...legalLinks].map((link, i, arr) => (
              <span key={i} className="flex items-center">
                <Link to={link.href} className="text-white/40 text-[11px] hover:text-white/70 transition-colors">{link.text}</Link>
                {i < arr.length - 1 && <span className="text-white/15 mx-1.5">·</span>}
              </span>
            ))}
          </div>

          {/* Contact + Social — single row */}
          <div className="flex items-center justify-center gap-4 mb-7">
            <a href="mailto:support@telitrip.com" className="text-white/35 hover:text-white/60 transition-colors" style={{ minHeight: 'unset' }}>
              <Mail className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
            </a>
            <a href="tel:+923001234567" className="text-white/35 hover:text-white/60 transition-colors" style={{ minHeight: 'unset' }}>
              <Phone className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
            </a>
            <a href="#facebook" className="text-white/35 hover:text-white/60 transition-colors" style={{ minHeight: 'unset' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
            </a>
            <a href="#instagram" className="text-white/35 hover:text-white/60 transition-colors" style={{ minHeight: 'unset' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg>
            </a>
          </div>

          {/* Copyright — subtle */}
          <div className="pt-5 border-t border-white/[0.06]">
            <p className="text-white/20 text-[10px]">
              &copy; {new Date().getFullYear()} TELITRIP
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-14">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/home" className="inline-block mb-5">
              <img src={logo} alt="Telitrip" className="h-12 w-auto" />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-xs">
              Compare hotels, transfers and experiences across the globe. Best rates, guaranteed.
            </p>
            {/* Social — Facebook + Instagram only */}
            <div className="flex items-center gap-3">
              <a href="#facebook" className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all duration-200" style={{ minHeight: 'unset' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a href="#instagram" className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-pink-500 hover:border-pink-200 hover:shadow-sm transition-all duration-200" style={{ minHeight: 'unset' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-900 font-semibold text-sm mb-4" style={{ letterSpacing: '-0.01em' }}>Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.href} className="text-gray-500 hover:text-blue-600 text-sm transition-colors duration-200">{link.text}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-gray-900 font-semibold text-sm mb-4" style={{ letterSpacing: '-0.01em' }}>Legal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.href} className="text-gray-500 hover:text-blue-600 text-sm transition-colors duration-200">{link.text}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gray-900 font-semibold text-sm mb-4" style={{ letterSpacing: '-0.01em' }}>Contact</h4>
            <div className="space-y-3">
              <a href="mailto:support@telitrip.com" className="flex items-center gap-2.5 text-gray-500 hover:text-blue-600 text-sm transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" style={{ strokeWidth: 1.5 }} />
                support@telitrip.com
              </a>
              <a href="tel:+923001234567" className="flex items-center gap-2.5 text-gray-500 hover:text-blue-600 text-sm transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" style={{ strokeWidth: 1.5 }} />
                +92 300 1234567
              </a>
              <div className="flex items-start gap-2.5 text-gray-500 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ strokeWidth: 1.5 }} />
                Islamabad, Pakistan
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 mb-6" />

        {/* Copyright — pill style */}
        <div className="flex justify-center">
          <p className="inline-block px-6 py-2.5 text-[12px] text-gray-500 text-center sm:whitespace-nowrap" style={{ background: '#ffffff', borderRadius: 50, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
            &copy; {new Date().getFullYear()} <span className="text-gray-900 font-semibold">TELITRIP</span> <span className="text-gray-300 mx-1">|</span> All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
