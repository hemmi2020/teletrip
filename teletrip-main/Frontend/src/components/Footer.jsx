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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative">
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

        {/* Copyright — pill style, Team Rhino on same line */}
        <div className="flex justify-center">
          <div
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-[12px] text-gray-500 flex-wrap justify-center"
            style={{
              background: '#ffffff',
              borderRadius: 50,
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
            }}
          >
            <span>&copy; {new Date().getFullYear()}</span>
            <span className="text-gray-900 font-semibold">TELITRIP</span>
            <span className="text-gray-300">|</span>
            <span>All rights reserved</span>
            <span className="text-gray-300">|</span>
            <span>Developed by</span>
            <a href="https://www.tmrhino.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Team Rhino</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
