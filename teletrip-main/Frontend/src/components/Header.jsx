import React, { useState, useContext, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../images/Telitrip-Logo-1.png";
import { SlideOutCart, AuthModal, useCart } from './CartSystem';
import { UserDataContext } from './CartSystem';
import BottomNavBar from './BottomNavBar';
import { ShoppingCart, Menu, X, User, LogOut, ChevronDown } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, setUser } = useContext(UserDataContext);
  const { getTotalItems, items: cartItems, getTotalPrice } = useCart();

  const isHomePage = location.pathname === '/home' || location.pathname === '/';

  // Scroll detection — header becomes solid after scrolling 20px
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Listen for cart open events
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

  // Header background: transparent on home hero, dark solid otherwise / on scroll
  const isTransparent = isHomePage && !scrolled && !isMobileMenuOpen;
  const headerBg = isTransparent
    ? 'bg-transparent'
    : 'bg-[#0d0d0d]';

  const navLinks = [
    { label: 'Home', to: '/home' },
    { label: 'Hotels', to: '/hotel-search-results', partial: true },
    { label: 'Transfers', to: '/transfers', partial: true },
    { label: 'Experiences', to: '/activity-search-results', partial: true },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <>
      {/* ── Main Header ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${headerBg} ${
          !isTransparent ? 'border-b border-white/10' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* ── Logo ── */}
            <NavLink to="/home" className="flex-shrink-0 flex items-center">
              <img
                src={logo}
                alt="Telitrip"
                className="h-8 sm:h-10 brightness-0 invert"
                style={{ filter: isTransparent ? 'brightness(0) invert(1)' : 'brightness(0) invert(1)' }}
              />
            </NavLink>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ label, to, partial }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-white/10'
                        : 'text-white/70 hover:text-white hover:bg-white/8'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* ── Desktop Right: Account + Cart ── */}
            <div className="hidden md:flex items-center gap-2">
              {user?.email ? (
                <>
                  <span className="text-white/60 text-[13px] max-w-[120px] truncate">
                    {user.fullname?.firstname || user.email}
                  </span>
                  <button
                    onClick={handleAccountClick}
                    className="px-3 py-1.5 text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    style={{ minHeight: 'unset' }}
                  >
                    Account
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-[13px] font-medium text-white/60 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                    style={{ minHeight: 'unset' }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAccountClick}
                  className="px-4 py-1.5 text-[13px] font-semibold text-white border border-white/30 rounded-full hover:bg-white hover:text-gray-900 transition-all duration-200"
                  style={{ minHeight: 'unset' }}
                >
                  Sign In
                </button>
              )}

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                style={{ minHeight: 'unset' }}
              >
                <ShoppingCart className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>

            {/* ── Mobile: Hamburger ── */}
            <button
              onClick={() => setIsMobileMenuOpen(o => !o)}
              className="md:hidden p-2 text-white/80 hover:text-white rounded-lg transition-colors"
              style={{ minHeight: 'unset' }}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Full-Screen Menu ── */}
      <div
        className={`fixed inset-0 z-[99] bg-[#0d0d0d] flex flex-col transition-all duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top bar inside overlay */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-white/10 flex-shrink-0">
          <NavLink to="/home" className="flex-shrink-0">
            <img src={logo} alt="Telitrip" className="h-8 brightness-0 invert" />
          </NavLink>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-white/70 hover:text-white rounded-lg"
            style={{ minHeight: 'unset' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl text-[15px] font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/8'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: Account + Cart */}
        <div className="flex-shrink-0 px-4 pb-8 pt-4 border-t border-white/10 space-y-2">
          {user?.email ? (
            <>
              <p className="text-white/40 text-[12px] px-4 mb-2">
                Signed in as {user.fullname?.firstname || user.email}
              </p>
              <button
                onClick={() => { handleAccountClick(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
                style={{ minHeight: 'unset' }}
              >
                <User className="w-4 h-4" /> Account
              </button>
              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-red-400 hover:bg-red-500/10 transition-all"
                style={{ minHeight: 'unset' }}
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => { handleAccountClick(); setIsMobileMenuOpen(false); }}
              className="w-full py-3 rounded-xl text-[14px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              style={{ minHeight: 'unset' }}
            >
              Sign In / Create Account
            </button>
          )}
        </div>
      </div>

      {/* ── Cart Slide-out ── */}
      <SlideOutCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* ── Auth Modal ── */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        defaultTab="login"
        returnUrl={location.pathname}
      />

      {/* ── Bottom Nav (mobile only) ── */}
      <BottomNavBar />
    </>
  );
};

export default Header;
