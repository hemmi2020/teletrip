import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { House, Search, Calendar, User, ShoppingCart } from "lucide-react";
import { useCart, UserDataContext } from "./CartSystem";

const BottomNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { user } = useContext(UserDataContext);

  const cartCount = getTotalItems();
  const isLoggedIn = !!(user?.email || localStorage.getItem('token'));

  const tabs = [
    { label: "Home", icon: House, path: "/home" },
    { label: "Search", icon: Search, path: null, action: 'search' },
    ...(isLoggedIn ? [{ label: "Bookings", icon: Calendar, path: "/bookings" }] : []),
    { label: "Account", icon: User, path: "/account" },
    { label: "Cart", icon: ShoppingCart, path: null, action: 'cart' },
  ];

  const isActive = (tab) => {
    if (!tab.path) return false;
    return location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
  };

  const handleTabClick = (tab) => {
    if (tab.action === 'cart') {
      window.dispatchEvent(new CustomEvent("openCart"));
    } else if (tab.action === 'search') {
      // Navigate to home and scroll to search form
      if (location.pathname !== '/home') {
        navigate('/home');
        setTimeout(() => {
          const el = document.querySelector('.search-form-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        const el = document.querySelector('.search-form-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (tab.path) {
      navigate(tab.path);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[110] bg-white border-t border-gray-100 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab);
          return (
            <button
              key={tab.label}
              onClick={() => handleTabClick(tab)}
              className={`flex flex-col items-center justify-center flex-1 py-2 cursor-pointer relative ${
                active ? "text-blue-600" : "text-gray-400"
              }`}
              style={{ minHeight: '56px' }}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.action === 'cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center leading-none" style={{ fontSize: '10px' }}>
                    {cartCount}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '11px' }} className="mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
