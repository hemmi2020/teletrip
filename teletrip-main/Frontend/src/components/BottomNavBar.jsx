import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { House, Search, Calendar, User, ShoppingCart } from "lucide-react";
import { useCart } from "./CartSystem";

const BottomNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getTotalItems } = useCart();

  const cartCount = getTotalItems();

  const tabs = [
    { label: "Home", icon: House, path: "/home" },
    { label: "Search", icon: Search, path: "/home" },
    { label: "Bookings", icon: Calendar, path: "/bookings" },
    { label: "Account", icon: User, path: "/account" },
    { label: "Cart", icon: ShoppingCart, path: null },
  ];

  const isActive = (tab) => {
    if (tab.path === null) return false;
    return location.pathname === tab.path;
  };

  const handleTabClick = (tab) => {
    if (tab.label === "Cart") {
      window.dispatchEvent(new CustomEvent("openCart"));
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
              className={`flex flex-col items-center justify-center flex-1 py-2 min-h-[56px] cursor-pointer relative ${
                active ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.label === "Cart" && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
