import React, { useState, useContext, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../images/Telitrip-Logo-1.png";
import { SlideOutCart, AuthModal, useCart } from './CartSystem';
import { UserDataContext } from './CartSystem';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isFormMenuOpen, setIsFormMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, setUser } = useContext(UserDataContext);
  const { getTotalItems, items: cartItems, getTotalPrice } = useCart();
  
  // Check if we're on the home page
  const isHomePage = location.pathname === '/home' || location.pathname === '/';

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.form-menu-container')) {
        setIsFormMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for cart open events
  useEffect(() => {
    const handleOpenCart = () => {
      setIsCartOpen(true);
    };
    window.addEventListener('openCart', handleOpenCart);
    return () => window.removeEventListener('openCart', handleOpenCart);
  }, []);

  const handleAccountClick = () => {
    if (user && user.email) {
      navigate("/account");
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = (userData) => {
    console.log('User authenticated:', userData);
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
  console.log('🛒 Proceeding to checkout from header...');
  console.log('👤 Current user from context:', user);
  
  // ✅ CHECK: Use context user first, then localStorage
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  
  if (!user && (!token || !userData)) {
    console.log('❌ User not logged in, showing auth modal');
    setShowAuthModal(true);
    return;
  }
  
  // ✅ If user exists in context but not in localStorage, save it
  if (user && !token) {
    console.log('⚠️ User in context but no token in localStorage - this might cause issues');
    console.log('Authentication error. Please try logging in again.');
    setShowAuthModal(true);
    return;
  }
  setIsCartOpen(false);
  
  if (!cartItems || cartItems.length === 0) {
    console.warn('⚠️ Cart is empty');
    return;
  }
  
  navigate('/checkout', {
    state: {
      cartItems: cartItems,
      totalAmount: getTotalPrice(),
      fromCart: true
    }
  });
};

  const handleFormMenuClick = (formType) => {
    setIsFormMenuOpen(false);
    setIsMobileMenuOpen(false);
    
    // Navigate to home page with the selected form
    if (formType === 'hotels') {
      navigate('/home', { state: { activeForm: 'stays' } });
    } else if (formType === 'tours') {
      navigate('/home', { state: { activeForm: 'experiences' } });
    } else if (formType === 'transfers') {
      navigate('/home', { state: { activeForm: 'transfers' } });
    }
  };

  return (
    <>
      <header className="bg-white fixed top-0 left-0 right-0 z-[100] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo on the left */}
            <NavLink to="/home" className="flex-shrink-0">
              <img src={logo} alt="Logo" className="h-14" />
            </NavLink>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {/* Regular Navigation Links */}
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  `text-gray-700 hover:text-blue-600 font-bold transition-colors duration-200 flex items-center ${
                    isActive ? 'text-blue-600 border-b-2 border-blue-600' : ''
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `text-gray-700 hover:text-blue-600 font-bold transition-colors duration-200 flex items-center ${
                    isActive ? 'text-blue-600 border-b-2 border-blue-600' : ''
                  }`
                }
              >
                Contact Us
              </NavLink>
            </nav>

            {/* Account and Cart - Desktop */}
            <div className="hidden md:flex font-bold items-center space-x-8">
              <div className="flex items-center space-x-4">
                {user && user.email ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-700">
                      Welcome, {user.fullname?.firstname || user.email}
                    </span>
                    <button
                      onClick={handleAccountClick}
                      className="text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Account
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-gray-700 hover:text-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAccountClick}
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Login / Sign Up
                  </button>
                )}

                {/* Cart Icon */}
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-2"
                >
                  <svg 
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h12" 
                    />
                  </svg>
                  <span>Cart</span>
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-3">
              {/* Regular Navigation */}
              <NavLink
                to="/home"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
              >
                Home
              </NavLink>
              <NavLink
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
              >
                Contact Us
              </NavLink>

              {/* Account Section */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                {user && user.email ? (
                  <>
                    <p className="px-4 py-2 text-sm text-gray-600">
                      Welcome, {user.fullname?.firstname || user.email}
                    </p>
                    <button
                      onClick={() => {
                        handleAccountClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
                    >
                      Account
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleAccountClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
                  >
                    Login / Sign Up
                  </button>
                )}

                {/* Cart Button for Mobile */}
                <button
                  onClick={() => {
                    setIsCartOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium flex items-center justify-between"
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h12" />
                    </svg>
                    <span>Cart</span>
                  </span>
                  {getTotalItems() > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Cart Slide-out */}
      <SlideOutCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        defaultTab="login"
        returnUrl={location.pathname}
      />
    </>
  );
};

export default Header;