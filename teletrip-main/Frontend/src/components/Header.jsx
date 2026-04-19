import React, { useState, useContext, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../images/Telitrip-Logo-1.png";
import { SlideOutCart, AuthModal, useCart } from './CartSystem';
import { UserDataContext } from './CartSystem';
import BottomNavBar from './BottomNavBar';
import { X, ShoppingCart } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, setUser } = useContext(UserDataContext);
  const { getTotalItems, items: cartItems, getTotalPrice } = useCart();

  // Track scroll — pill becomes frosted glass after 60px
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
  const handleAuthSuccess = () => { setShowAuthModal(false); navigate("/account"); };
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
    { label: 'Home', to: '/home' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'FAQs', to: '/faqs' },
  ];

  // Pill style: solid white at top, frosted glass when scrolled
  const pillStyle = scrolled ? {
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: 50,
    border: '1px solid rgba(255,255,255,0.5)',
    boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
    transition: 'all 0.3s ease',
  } : {
    background: '#ffffff',
    borderRadius: 50,
    border: '1px solid rgba(0,0,0,0.07)',
    boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
  };

  // Header position: starts lower (pt-6), becomes sticky at top when scrolled
  const headerClass = scrolled
    ? 'fixed top-0 left-0 right-0 z-[100] flex justify-center px-3 sm:px-6 pt-3 sm:pt-4 pointer-events-none'
    : 'fixed top-0 left-0 right-0 z-[100] flex justify-center px-3 sm:px-6 pt-6 sm:pt-8 pointer-events-none';

  return (
    <>
      <header className={headerClass} style={{ transition: 'padding 0.3s ease' }}>
        <div
          className="pointer-events-auto w-full max-w-5xl flex items-center justify-between gap-3 py-2"
          style={{ ...pillStyle, paddingLeft: '20px', paddingRight: '12px' }}
        >
          {/* Logo — with left padding, full color */}
          <NavLink to="/home" className="flex-shrink-0 flex items-center pl-1">
            <img src={logo} alt="Telitrip" className="h-10 sm:h-12 w-auto object-contain" />
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase transition-all duration-200 ${
                    isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
                style={{ minHeight: 'unset', letterSpacing: '0.08em' }}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {user?.email && (
              <>
                <button onClick={handleAccountClick} className="px-4 py-1.5 text-[11px] font-semibold tracking-widest uppercase text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all" style={{ minHeight: 'unset', letterSpacing: '0.08em' }}>Account</button>
                <button onClick={handleLogout} className="px-4 py-1.5 text-[11px] font-semibold tracking-widest uppercase text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" style={{ minHeight: 'unset', letterSpacing: '0.08em' }}>Logout</button>
              </>
            )}
            <button onClick={() => setIsCartOpen(true)} className="relative flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all" style={{ width: 36, height: 36, minHeight: 'unset' }}>
              <ShoppingCart className="w-4 h-4 text-gray-700" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">{getTotalItems()}</span>
              )}
            </button>
            <button onClick={handleAccountClick} className="px-5 py-2 text-[11px] font-bold tracking-widest uppercase text-white rounded-full transition-all hover:opacity-90" style={{ background: '#111827', minHeight: 'unset', letterSpacing: '0.08em' }}>
              {user?.email ? 'Dashboard' : 'Join Us'}
            </button>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2 flex-shrink-0">
            <button onClick={() => setIsCartOpen(true)} className="relative flex items-center justify-center rounded-full bg-gray-100" style={{ width: 44, height: 44 }}>
              <ShoppingCart className="w-4 h-4 text-gray-700" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">{getTotalItems()}</span>
              )}
            </button>
            <button onClick={() => setIsMobileMenuOpen(o => !o)} className="flex items-center justify-center rounded-full transition-all" style={{ width: 44, height: 44, border: '2px solid #f59e0b', background: 'rgba(245,158,11,0.08)' }} aria-label="Toggle menu">
              {isMobileMenuOpen ? <X className="w-4 h-4 text-gray-800" /> : (
                <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                  <rect y="0" width="16" height="2" rx="1" fill="#1a1a2e" />
                  <rect y="4.5" width="16" height="2" rx="1" fill="#1a1a2e" />
                  <rect y="9" width="16" height="2" rx="1" fill="#1a1a2e" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu — z-[101] to sit above header pill */}
      <div className={`fixed inset-0 z-[101] flex flex-col transition-all duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} style={{ background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(20px)' }}>
        {/* Close button — top right, no duplicate pill */}
        <div className="flex justify-end px-5 pt-5 flex-shrink-0">
          <button onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center rounded-full" style={{ width: 44, height: 44, border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)' }}>
            <X className="w-4.5 h-4.5 text-white" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-6 pt-6 pb-4 space-y-1">
          {navLinks.map(({ label, to }) => (
            <NavLink key={to} to={to} onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `flex items-center px-5 py-4 rounded-2xl text-[15px] font-semibold tracking-wide uppercase transition-all ${isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              style={{ letterSpacing: '0.06em' }}
            >{label}</NavLink>
          ))}
        </nav>
        <div className="flex-shrink-0 px-6 pb-24 pt-4 space-y-3">
          {user?.email ? (
            <>
              <p className="text-white/40 text-[12px] text-center mb-2">{user.fullname?.firstname || user.email}</p>
              <button onClick={() => { handleAccountClick(); setIsMobileMenuOpen(false); }} className="w-full py-3.5 rounded-2xl text-[13px] font-bold tracking-widest uppercase text-white bg-white/15 hover:bg-white/25 transition-all" style={{ minHeight: 'unset', letterSpacing: '0.08em' }}>My Account</button>
              <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full py-3.5 rounded-2xl text-[13px] font-semibold text-white/60 hover:text-red-400 transition-all" style={{ minHeight: 'unset' }}>Logout</button>
            </>
          ) : (
            <button onClick={() => { handleAccountClick(); setIsMobileMenuOpen(false); }} className="w-full py-3.5 rounded-2xl text-[13px] font-bold tracking-widest uppercase text-white transition-all" style={{ background: 'rgba(37,99,235,0.8)', minHeight: 'unset', letterSpacing: '0.08em' }}>Join Us</button>
          )}
        </div>
      </div>

      <SlideOutCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onProceedToCheckout={handleProceedToCheckout} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} defaultTab="login" returnUrl={location.pathname} />
      <BottomNavBar />
    </>
  );
};

export default Header;
