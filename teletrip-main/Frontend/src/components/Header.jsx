import React, { useState, useContext, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../images/Telitrip-Logo-1.png";
import { SlideOutCart, AuthModal, useCart } from './CartSystem';
import { UserDataContext } from './CartSystem';
import BottomNavBar from './BottomNavBar';
import { X, User, LogOut, ShoppingCart } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, setUser } = useContext(UserDataContext);
  const { getTotalItems, items: cartItems, getTotalPrice } = useCart();

  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handler = () => setIsCartOpen(true);
    window.addEventListener('openCart', handler);
    return () => window.removeEventListener('openCart', handler);
  }, []);

  const handleAccountClick = () => {
    if (user?.email) navigate("/account");
    else setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    navigate("/account");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/home');
  };

  const handleProceedToCheckout = () => {
    const token = localStorage.getItem('token');
    if (!user && !token) { setShowAuthModal(true); return; }
    if (user && !token) { setShowAuthModal(true); return; }
    setIsCartOpen(false);
    if (!cartItems?.length) return;
    navigate('/checkout', { state: { cartItems, totalAmount: getTotalPrice(), fromCart: true } });
  };

  const navLinks = [
    { label: 'Hotels', to: '/hotel-search-results' },
    { label: 'Transfers', to: '/transfers' },
    { label: 'Experiences', to: '/activity-search-results' },
    { label: 'About', to: '/home' },
  ];

  return (
    <>
      {/* ── Floating Pill Header ── */}
      <header className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-3 sm:px-6 pt-3 sm:pt-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-5xl flex items-center justify-between gap-2 px-2 py-1.5"
          style={{
            background: '#edeae4',
            borderRadius: 50,
            boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          }}
        >
          {/* ── Logo circle ── */}
          <NavLink
            to="/home"
            className="flex-shrink-0 flex items-center justify-center rounded-full bg-white overflow-hidden"
            style={{ width: 44, height: 44, minWidth: 44 }}
          >
            <img src={logo} alt="Telitrip" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          </NavLink>

          {/* ── Desktop Nav links (center) ── */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase transition-all duration-200 ${
                    isActive
                      ? 'bg-white/60 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
                  }`
                }
                style={{ minHeight: 'unset', letterSpacing: '0.08em' }}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* ── Desktop Right: Contact + CTA + Cart ── */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {/* Contact / Account */}
            {user?.email ? (
              <>
                <button
                  onClick={handleAccountClick}
                  className="px-4 py-1.5 text-[11px] font-semibold tracking-widest uppercase text-gray-600 hover:text-gray-900 rounded-full hover:bg-white/40 transition-all"
                  style={{ minHeight: 'unset', letterSpacing: '0.08em' }}
                >
                  Account
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 text-[11px] font-semibold tracking-widest uppercase text-gray-500 hover:text-red-500 rounded-full hover:bg-white/40 transition-all"
                  style={{ minHeight: 'unset', letterSpacing: '0.08em' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleAccountClick}
                className="px-4 py-1.5 text-[11px] font-semibold tracking-widest uppercase text-gray-600 hover:text-gray-900 rounded-full hover:bg-white/40 transition-all"
                style={{ minHeight: 'unset', letterSpacing: '0.08em' }}
              >
                Contact
              </button>
            )}

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center rounded-full bg-white/60 hover:bg-white transition-all"
              style={{ width: 36, height: 36, minHeight: 'unset' }}
            >
              <ShoppingCart className="w-4 h-4 text-gray-700" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {getTotalItems()}
                </span>
              )}
            </button>

            {/* JOIN US / Sign In CTA */}
            <button
              onClick={handleAccountClick}
              className="px-5 py-2 text-[11px] font-bold tracking-widest uppercase text-white rounded-full transition-all hover:opacity-90"
              style={{
                background: '#1a1a2e',
                minHeight: 'unset',
                letterSpacing: '0.08em',
              }}
            >
              {user?.email ? 'Dashboard' : 'Join Us'}
            </button>
          </div>

          {/* ── Mobile: Cart + Hamburger ── */}
          <div className="flex md:hidden items-center gap-2 flex-shrink-0">
            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center rounded-full bg-white/60"
              style={{ width: 40, height: 40, minHeight: 'unset' }}
            >
              <ShoppingCart className="w-4 h-4 text-gray-700" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {getTotalItems()}
                </span>
              )}
            </button>

            {/* Hamburger in amber circle */}
            <button
              onClick={() => setIsMobileMenuOpen(o => !o)}
              className="flex items-center justify-center rounded-full transition-all"
              style={{
                width: 40, height: 40, minHeight: 'unset',
                border: '2.5px solid #f59e0b',
                background: 'transparent',
              }}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 text-gray-800" />
              ) : (
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <rect y="0" width="16" height="2" rx="1" fill="#1a1a2e" />
                  <rect y="5" width="16" height="2" rx="1" fill="#1a1a2e" />
                  <rect y="10" width="16" height="2" rx="1" fill="#1a1a2e" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Full-Screen Menu ── */}
      <div
        className={`fixed inset-0 z-[99] flex flex-col transition-all duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: '#edeae4' }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0">
          {/* Same pill header inside overlay */}
          <div
            className="flex items-center justify-between w-full px-2 py-1.5"
            style={{ background: '#e4e0d9', borderRadius: 50 }}
          >
            <NavLink to="/home" className="flex items-center justify-center rounded-full bg-white overflow-hidden" style={{ width: 44, height: 44 }}>
              <img src={logo} alt="Telitrip" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            </NavLink>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center rounded-full"
              style={{ width: 40, height: 40, minHeight: 'unset', border: '2.5px solid #f59e0b', background: 'transparent' }}
            >
              <X className="w-4 h-4 text-gray-800" />
            </button>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-6 py-8 space-y-2">
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-5 py-4 rounded-2xl text-[15px] font-semibold tracking-wide uppercase transition-all ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`
              }
              style={{ letterSpacing: '0.06em' }}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom CTA */}
        <div className="flex-shrink-0 px-6 pb-10 pt-4 space-y-3">
          {user?.email ? (
            <>
              <p className="text-gray-500 text-[12px] text-center mb-2">
                {user.fullname?.firstname || user.email}
              </p>
              <button
                onClick={() => { handleAccountClick(); setIsMobileMenuOpen(false); }}
                className="w-full py-3.5 rounded-2xl text-[13px] font-bold tracking-widest uppercase text-white transition-all"
                style={{ background: '#1a1a2e', minHeight: 'unset', letterSpacing: '0.08em' }}
              >
                My Account
              </button>
              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="w-full py-3.5 rounded-2xl text-[13px] font-semibold text-gray-600 bg-white/60 hover:bg-white transition-all"
                style={{ minHeight: 'unset' }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => { handleAccountClick(); setIsMobileMenuOpen(false); }}
              className="w-full py-3.5 rounded-2xl text-[13px] font-bold tracking-widest uppercase text-white transition-all"
              style={{ background: '#1a1a2e', minHeight: 'unset', letterSpacing: '0.08em' }}
            >
              Join Us
            </button>
          )}
        </div>
      </div>

      {/* ── Cart ── */}
      <SlideOutCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onProceedToCheckout={handleProceedToCheckout} />

      {/* ── Auth Modal ── */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} defaultTab="login" returnUrl={location.pathname} />

      {/* ── Bottom Nav (mobile only) ── */}
      <BottomNavBar />
    </>
  );
};

export default Header;
