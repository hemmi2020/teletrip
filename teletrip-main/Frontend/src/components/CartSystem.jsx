// Fixed CartSystem.jsx - Complete working version
import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import { X, ShoppingCart, MapPin, Calendar, Trash2, User, Eye, EyeOff, Lock, Mail, Save, Bed, Info, XCircle, CreditCard  } from "lucide-react";
import { LoginSocialGoogle } from 'reactjs-social-login';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// User Data Context
export const UserDataContext = createContext();

// User Provider with proper authentication check
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("userData");

        console.log("🔍 Checking auth status:", {
          hasToken: !!token,
          hasUserData: !!userData,
        });

        if (token && userData) {
          try {
            const parsedUserData = JSON.parse(userData);

            if (parsedUserData && parsedUserData.email) {
              console.log("✅ Found valid stored auth:", parsedUserData.email);
              setUser(parsedUserData);
            } else {
              console.log("❌ Invalid stored user data, clearing...");
              localStorage.removeItem("token");
              localStorage.removeItem("userData");
            }
          } catch (parseError) {
            console.error("❌ Error parsing user data:", parseError);
            localStorage.removeItem("token");
            localStorage.removeItem("userData");
          }
        } else {
          console.log("ℹ️ No stored authentication found");
        }
      } catch (error) {
        console.error("❌ Auth check failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <UserDataContext.Provider value={{ user, setUser }}>
      {children}
    </UserDataContext.Provider>
  );
};

// Cart Context
export const CartContext = createContext();

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM": {
      // Check if exact same item already exists (same hotel, dates, room)
      const existingItem = state.items.find(
        (item) =>
          item.id === action.payload.id &&
          item.checkIn === action.payload.checkIn &&
          item.checkOut === action.payload.checkOut &&
          item.roomType === action.payload.roomType
      );

      if (existingItem) {
        // Item already in cart - don't add duplicate, just show notification
        return state;
      }

      // Add new item without quantity field
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(
              item.id === action.payload.id &&
              item.checkIn === action.payload.checkIn &&
              item.checkOut === action.payload.checkOut
            )
        ),
      };

    case "CLEAR_CART":
      return { ...state, items: [] };

    default:
      return state;
  }
};

// Cookie utility functions
const setCookie = (name, value) => {
  try {
    localStorage.setItem(name, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
};

const getCookie = (name) => {
  try {
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error("Failed to read from localStorage:", e);
    return null;
  }
};

// Cart Provider
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: getCookie("cart") || [],
  });

  useEffect(() => {
    setCookie("cart", state.items);
  }, [state.items]);

  const addToCart = (item) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeFromCart = (item) => {
    dispatch({ type: "REMOVE_ITEM", payload: item });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => {
      // Calculate nights
      const checkIn = new Date(item.checkIn);
      const checkOut = new Date(item.checkOut);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      
      // Total price = price per night * number of nights
      return total + (item.price * nights);
    }, 0);
  };

  const getTotalItems = () => {
    return state.items.length; // Just count items, no quantities
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Cart Icon Component for Header
export const CartIcon = ({ onClick }) => {
  const { getTotalItems } = useCart();
  const itemCount = getTotalItems();

  return (
    <button onClick={onClick} className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
      <ShoppingCart className="w-5 h-5 text-gray-600" />
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-semibold">{itemCount}</span>
      )}
    </button>
  );
};

// Rate class badge helper
const getRateClassBadge = (rateClass) => {
  switch (rateClass?.toLowerCase()) {
    case "non-refundable":
      return (
        <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
          Non-Refundable
        </span>
      );
    case "refundable":
      return (
        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
          Refundable
        </span>
      );
    default:
      return null;
  }
};

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-20 right-4 z-[200] px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${
      type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`}>
      <span>{message}</span>
      <button onClick={onClose} className="hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// FIXED AuthModal Component
export const AuthModal = ({ isOpen, onClose, defaultTab = 'login', returnUrl }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const Navigate = useNavigate();

  const { setUser } = useContext(UserDataContext);
  
  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    firstName: '', 
    lastName: '',
    email: '', 
    password: ''
  });

  // Google OAuth Success Handler
 const handleGoogleSuccess = async (response) => {
  setIsLoading(true);
  setError('');

  try {
    // Log the FULL response to see structure
    console.log('Full Google response:', response);
    console.log('Response.data:', response.data);
    console.log('Response.data keys:', Object.keys(response.data || {}));
    
    // The data is in response.data
    const profile = response.data;
    
    // Log all available fields
    console.log('Available profile fields:', {
      email: profile.email,
      emails: profile.emails,
      sub: profile.sub,
      id: profile.id,
      name: profile.name,
      given_name: profile.given_name,
      family_name: profile.family_name,
      picture: profile.picture
    });
    
    // Extract data - Google response.data structure
    const googleData = {
      // Try multiple email fields
      email: profile.email || 
             profile.emails?.[0]?.value || 
             profile.emailAddresses?.[0]?.value ||
             profile.verified_email,
      
      // Name
      name: profile.name || 
            `${profile.given_name || ''} ${profile.family_name || ''}`.trim() ||
            profile.displayName,
      
      // Google ID
      googleId: profile.sub || profile.id,
      
      // Picture
      picture: profile.picture || profile.image?.url
    };

    console.log('Processed Google login data:', googleData);

    // If email is STILL undefined, let's see what IS in the profile
    if (!googleData.email) {
      console.error('❌ Email not found!');
      console.error('Full profile object:', JSON.stringify(profile, null, 2));
      
      // Show user-friendly error
      setError('Google did not provide your email address. Please make sure you grant email permission, or use email/password signup.');
      setIsLoading(false);
      return;
    }

    if (!googleData.googleId) {
      console.error('❌ Google ID not found!');
      setError('Could not verify your Google account. Please try again.');
      setIsLoading(false);
      return;
    }

    console.log('✅ Validation passed, sending to backend...');

    // Send to backend
    const result = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/users/google-auth`,
      googleData
    );

    console.log('✅ Backend response:', result.data);

    if (result.data.success) {
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('userData', JSON.stringify(result.data.user)); // ✅ ADD THIS LINE
      setUser(result.data.user);
      console.log('✅ Saved to localStorage:', {
    token: !!result.data.token,
    userData: !!result.data.user
  });
      onClose();
      Navigate(returnUrl || '/home');
    }
  } catch (error) {
    console.error('❌ Google login error:', error);
    console.error('Error response:', error.response?.data);
    setError(error.response?.data?.message || 'Failed to login with Google');
  } finally {
    setIsLoading(false);
  }
};
  // Google OAuth Error Handler
  const handleGoogleError = (error) => {
    console.error('Google login error:', error);
    setError('Failed to login with Google. Please try again.');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const userData = {
      email: loginData.email,
      password: loginData.password,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/login`,
        userData
      );
      
      console.log('✅ Login response:', response.data);
      
      if (response.status === 200 || response.status === 201) {
        // Backend returns: { success: true, data: { token, user }, message }
        const responseData = response.data.data || response.data;
        const token = responseData.token;
        const user = responseData.user;
        
        console.log('✅ Extracted data:', { token: !!token, user: !!user });
        
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        console.log('✅ Saved to localStorage, closing modal');
        onClose();
        Navigate(returnUrl || '/home');
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const newUser = {
      email: signupData.email,
      password: signupData.password,
      fullname: {
        firstname: signupData.firstName,
        lastname: signupData.lastName 
      },
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
        newUser
      );
      
      if (response.status === 200 || response.status === 201) {
        const responseData = response.data.data || response.data;
        const token = responseData.token;
        const user = responseData.user;
        
        setUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(user));
        onClose();
        Navigate(returnUrl || '/home');
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || "Failed to register. Please try again.";
      setToast({ message: errorMessage, type: 'error' });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setLoginData({ email: '', password: '' });
    setSignupData({ firstName: '', lastName: '', email: '', password: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => {
              setActiveTab('login');
              setError('');
            }}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'login'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('signup');
              setError('');
            }}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'signup'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <LoginSocialGoogle
            client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
            scope="openid email profile"
            onResolve={handleGoogleSuccess}
            onReject={handleGoogleError}
          >
            <button
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium text-gray-700">
                Continue with Google
              </span>
            </button>
          </LoginSocialGoogle>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={signupData.firstName}
                      onChange={(e) => setSignupData({...signupData, firstName: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="First name"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={signupData.lastName}
                      onChange={(e) => setSignupData({...signupData, lastName: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Last name"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={signupData.email}
                    onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signupData.password}
                    onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Create a password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 text-center text-sm text-gray-600">
          {activeTab === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setActiveTab('signup');
                  setError('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
                disabled={isLoading}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
                disabled={isLoading}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

// Updated SlideOut Cart Component with Authentication Check
const CartAuthModal = ({ isOpen, onClose, onAuthSuccess, defaultTab, returnUrl }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[140]">
      <AuthModal
        isOpen={isOpen}
        onClose={onClose}
        onAuthSuccess={onAuthSuccess}
        defaultTab={defaultTab}
        returnUrl={returnUrl}
      />
    </div>
  );
};

export const SlideOutCart = ({ isOpen, onClose, onProceedToCheckout }) => {
  const { items, removeFromCart, getTotalPrice } = useCart();
  const { user } = useContext(UserDataContext);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleCheckoutClick = () => {
  console.log('🛒 Checkout button clicked');
  
  // ✅ Check BOTH context and localStorage
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  
  console.log('👤 User from context:', user);
  console.log('🔑 Token:', !!token);
  console.log('📝 UserData:', !!userData);
  
  // If user exists in EITHER context OR localStorage, allow checkout
  if ((!user || !user.email) && (!token || !userData)) {
    console.log('🔒 User not logged in, showing auth modal');
    setShowAuthModal(true);
  } else {
    console.log('✅ User logged in, proceeding to checkout');
    onProceedToCheckout();
  }
};

  const handleAuthSuccess = (userData) => {
    console.log('✅ Auth successful:', userData);
    setShowAuthModal(false);
    onProceedToCheckout();
  };

  const handleRemoveItem = (item) => {
    console.log('🗑️ Removing item from cart:', item);
    removeFromCart(item);
  };

  const handleCloseCart = () => {
    console.log('❌ Closing cart');
    onClose();
  };

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Format short date for mobile
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short'
    });
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[120] transition-opacity duration-300" onClick={onClose} />
      )}

      <div className={`fixed right-0 top-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-[121] transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Cart</h2>
              <p className="text-[12px] text-gray-400">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
            </div>
            <button onClick={handleCloseCart} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto" style={{scrollbarWidth:'thin'}}>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-[14px] font-medium text-gray-800 mb-1">Your cart is empty</p>
                <p className="text-[12px] text-gray-400 mb-5">Search and add hotels or experiences</p>
                <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-[13px] font-medium transition-colors">Browse</button>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {items.map((item, index) => {
                  const nights = calculateNights(item.checkIn, item.checkOut);
                  const totalPrice = item.type === 'activity' ? (item.price || 0) : (item.price * nights);
                  const isActivity = item.type === 'activity';

                  return (
                    <div key={index} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-all">
                      {/* Thumbnail + Info */}
                      <div className="flex gap-3 p-3">
                        {item.thumbnail && (
                          <img src={item.thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" onError={(e) => e.target.style.display='none'} />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-[13px] font-semibold text-gray-900 line-clamp-1">{isActivity ? item.name : item.hotelName}</h3>
                            <button onClick={(e) => { e.stopPropagation(); handleRemoveItem(item); }} className="p-1 hover:bg-red-50 rounded transition-colors flex-shrink-0"><Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" /></button>
                          </div>
                          {!isActivity && item.roomName && <p className="text-[11px] text-gray-500 truncate">{item.roomName}</p>}
                          {item.location && <p className="text-[11px] text-gray-400 truncate flex items-center gap-0.5"><MapPin className="w-3 h-3" />{item.location}</p>}
                        </div>
                      </div>

                      {/* Details row */}
                      <div className="px-3 pb-2 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">{isActivity ? 'Experience' : 'Hotel'}</span>
                        {!isActivity && <span className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full">{nights}N</span>}
                        {!isActivity && item.boardName && <span className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full">{item.boardName}</span>}
                        {item.rateClass === 'NRF' && <span className="text-[10px] px-2 py-0.5 bg-red-50 text-red-500 rounded-full">Non-refundable</span>}
                        {item.rateClass === 'NOR' && <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full">Free cancellation</span>}
                      </div>

                      {/* Dates + Price */}
                      <div className="px-3 pb-3 flex items-center justify-between">
                        <span className="text-[11px] text-gray-400">{formatShortDate(item.checkIn)} → {formatShortDate(item.checkOut)}</span>
                        <div className="text-right">
                          <span className="text-[14px] font-bold text-gray-900">{item.currency || 'EUR'} {totalPrice.toFixed(2)}</span>
                          {!isActivity && <span className="text-[10px] text-gray-400 block">{(item.currency || 'EUR')} {item.price.toFixed(0)}/night</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 bg-white px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gray-500">Total</span>
                <span className="text-xl font-bold text-gray-900">{items[0]?.currency || 'EUR'} {getTotalPrice().toFixed(2)}</span>
              </div>
              <button onClick={handleCheckoutClick} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-[14px]">
                Checkout
              </button>
              {!user?.email && <p className="text-[11px] text-center text-gray-400">Sign in required to proceed</p>}
            </div>
          )}
        </div>
      </div>

      <CartAuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} defaultTab="login" returnUrl={window.location.pathname} />
    </>
  );
};