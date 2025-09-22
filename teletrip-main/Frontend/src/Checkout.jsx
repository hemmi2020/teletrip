// Fixed Checkout.jsx - Updated for backend validation compatibility
import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserDataContext } from './components/CartSystem';
import { useCart } from './components/CartSystem';
import { AuthModal } from './components/CartSystem';
import Header from './components/Header';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Lock,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Set up axios interceptor for authentication
const setupAxiosInterceptors = () => {
  // Request interceptor to add auth token
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle auth errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Clear invalid tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        // Optionally redirect to login
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

// Call this when your app starts (in main.jsx or App.jsx)
setupAxiosInterceptors();




const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserDataContext);
  const { items: cartItems, getTotalPrice, clearCart } = useCart();
  
  // Get cart data from navigation state or use current cart
  const checkoutItems = location.state?.cartItems || cartItems;
  const totalAmount = location.state?.totalAmount || getTotalPrice();

  // State management
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBillingDetails, setShowBillingDetails] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data - Changed structure to match backend expectations
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'PK', // Default to Pakistan country code
    state: '',
    postalCode: ''
  });

  const checkAuthentication = () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    console.log('🔍 Authentication check:', {
      hasToken: !!token,
      hasUserData: !!userData,
      tokenPreview: token?.substring(0, 20) + '...',
      user: userData ? JSON.parse(userData).email : 'No user'
    });

    if (!token || !userData) {
      console.log('❌ No authentication found');
      return false;
    }

    try {
      const parsedUser = JSON.parse(userData);
      return { token, user: parsedUser };
    } catch (error) {
      console.error('❌ Invalid user data in localStorage:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return false;
    }
  };

  // Populate form with user data if logged in
  useEffect(() => {
    if (user && user.email) {
      setBillingInfo(prev => ({
        ...prev,
        firstName: user.fullname?.firstname || '',
        lastName: user.fullname?.lastname || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [checkoutItems, navigate, user]);

  // Redirect if no items to checkout
  useEffect(() => {
    if (!checkoutItems || checkoutItems.length === 0) {
      navigate('/home');
    }
  }, [checkoutItems, navigate]);

  const handleInputChange = (field, value) => {
  setBillingInfo(prev => ({
    ...prev,
    [field]: value
  }));
  setError(''); // Clear errors when user types
  
  // Real-time validation for specific fields
  if (field === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setError('Please enter a valid email address');
    }
  }
  
  if (field === 'phone' && value) {
    const phoneRegex = /^(\+92|0)?[0-9]{10,11}$/;
    if (!phoneRegex.test(value.replace(/\s+/g, ''))) {
      setError('Please enter a valid Pakistani phone number');
    }
  }
};

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'country', 'state'];
    const missing = required.filter(field => !billingInfo[field]?.trim());
    
    if (missing.length > 0) {
      setError(`Please fill in all required fields: ${missing.join(', ')}`);
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingInfo.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation
    const phoneRegex = /^(\+92|0)?[0-9]{10,11}$/;
    if (!phoneRegex.test(billingInfo.phone.replace(/\s+/g, ''))) {
      setError('Please enter a valid Pakistani phone number');
      return false;
    }

    // Name validation
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(billingInfo.firstName) || !nameRegex.test(billingInfo.lastName)) {
      setError('Names should only contain letters and spaces');
      return false;
    }

    return true;
  };


  const handlePayment = async () => {
  // Validate form before proceeding
  if (!validateForm()) {
      return;
    }

    // Check authentication
    const authData = checkAuthentication();
    if (!authData) {
      console.log('❌ Authentication required');
      setError('Please login to continue with your booking.');
      setShowAuthModal(true);
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 Starting checkout process...');
      console.log('🔑 Using token:', authData.token.substring(0, 20) + '...');

      // Create axios instance with authentication
      const authenticatedAxios = axios.create({
        baseURL: import.meta.env.VITE_BACKEND_URL,
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json'
        }
      });

      // Step 1: Create booking first
      const bookingPayload = {
        items: checkoutItems.map(item => ({
          hotelName: item.hotelName || 'Hotel Booking',
          roomName: item.roomName || 'Standard Room',
          location: item.location || 'Location',
          checkIn: item.checkIn || new Date().toISOString(),
          checkOut: item.checkOut || new Date(Date.now() + 86400000).toISOString(),
          guests: item.guests || 1,
          totalAmount: parseFloat(item.price || item.totalPrice || 0)
        })),
        totalAmount: parseFloat(totalAmount),
        currency: 'PKR',
        guestInfo: {
          primaryGuest: {
            firstName: billingInfo.firstName,
            lastName: billingInfo.lastName,
            email: billingInfo.email,
            phone: billingInfo.phone
          }
        },
        billingAddress: {
          street: billingInfo.address,
          city: billingInfo.city,
          state: billingInfo.state,
          country: billingInfo.country,
          postalCode: billingInfo.postalCode
        }
      };

      console.log('📋 Creating booking with payload:', bookingPayload);

      const bookingResponse = await authenticatedAxios.post('/api/bookings/create', bookingPayload);

      const bookingId = bookingResponse.data.data?.bookingId || 
                       bookingResponse.data.data?._id ||
                       bookingResponse.data.bookingId;

      console.log('✅ Booking created:', bookingId);

      // Step 2: Initiate payment with properly structured data
      const paymentPayload = {
        userData: {
          firstName: billingInfo.firstName.trim(),
          lastName: billingInfo.lastName.trim(),
          email: billingInfo.email.trim().toLowerCase(),
          phone: billingInfo.phone.trim(),
          address: billingInfo.address.trim(),
          city: billingInfo.city.trim(),
          state: billingInfo.state.trim(),
          country: billingInfo.country.trim(),
          postalCode: billingInfo.postalCode.trim()
        },
        bookingData: {
          hotelName: checkoutItems[0]?.hotelName || 'Hotel Booking',
          items: checkoutItems.map(item => ({
            name: item.hotelName || 'Hotel Booking',
            quantity: 1,
            price: item.price || item.totalPrice
          })),
          itinerary: checkoutItems.map(item => 
            `${item.hotelName} - ${item.checkIn} to ${item.checkOut}`
          ).join('; ')
        },
        amount: parseFloat(totalAmount),
        currency: 'PKR',
        bookingId: bookingId,
        orderId: `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      console.log('💳 Initiating payment...');

      const paymentResponse = await authenticatedAxios.post('/api/payments/hblpay/initiate', paymentPayload);

      if (paymentResponse.data.success) {
        const { redirectUrl, paymentId, sessionId } = paymentResponse.data.data;
        
        console.log('✅ Payment initiated successfully');

        // Store payment info
        localStorage.setItem('currentPayment', JSON.stringify({
          paymentId,
          bookingId,
          amount: totalAmount,
          timestamp: Date.now()
        }));

        setSuccess('Payment initiated successfully! Redirecting to HBLPay...');

        // Clear cart
        clearCart();

        // Redirect to HBLPay
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1500);

      } else {
        throw new Error(paymentResponse.data.message || 'Payment initiation failed');
      }

    } catch (error) {
      console.error('❌ Checkout error:', error);
      
      let errorMessage = 'Payment processing failed. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please login again.';
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setShowAuthModal(true);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

   useEffect(() => {
    const authData = checkAuthentication();
    if (authData?.user) {
      setBillingInfo(prev => ({
        ...prev,
        firstName: authData.user.fullname?.firstname || '',
        lastName: authData.user.fullname?.lastname || '',
        email: authData.user.email || '',
        phone: authData.user.phone || ''
      }));
    }
  }, []);

  // Redirect if no items to checkout
  useEffect(() => {
    if (!checkoutItems || checkoutItems.length === 0) {
      navigate('/home');
    }
  }, [checkoutItems, navigate]);

  const handleAuthSuccess = (userData) => {
    setShowAuthModal(false);
    setBillingInfo(prev => ({
      ...prev,
      firstName: userData.fullname?.firstname || '',
      lastName: userData.fullname?.lastname || '',
      email: userData.email || '',
      phone: userData.phone || ''
    }));
  };

  // Render authentication prompt
  const renderAuthPrompt = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-blue-900">Sign in for faster checkout</h3>
          <p className="text-sm text-blue-700 mt-1">
            Save your information and track your bookings
          </p>
        </div>
        <button
          onClick={() => setShowAuthModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {user ? 'Account' : 'Sign In'}
        </button>
      </div>
    </div>
  );

  // Render billing form
  const renderBillingForm = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Billing Information</h2>
        <button
          onClick={() => setShowBillingDetails(!showBillingDetails)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showBillingDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {showBillingDetails && (
        <div className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={billingInfo.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter first name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={billingInfo.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={billingInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={billingInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="03001234567"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pakistani format: 03001234567 (10 digits after 0)
              </p>
            </div>
          </div>

          {/* Address Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={billingInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full address"
                required
              />
            </div>
          </div>

          {/* City and Postal Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={billingInfo.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter city"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                value={billingInfo.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter postal code"
              />
            </div>
          </div>

          {/* Country and State - FIXED to match backend validation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <select
                value={billingInfo.country}
                onChange={(e) => {
                  handleInputChange('country', e.target.value);
                  handleInputChange('state', ''); // Reset state when country changes
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Country</option>
                <option value="PK">Pakistan</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                {/* Add more countries as needed */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province *
              </label>
              <select
                value={billingInfo.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!billingInfo.country}
              >
                <option value="">
                  {billingInfo.country ? 'Select State/Province' : 'Select Country First'}
                </option>
                {billingInfo.country === 'PK' && (
                  <>
                    <option value="IS">Islamabad</option>
                    <option value="BA">Balochistan</option>
                    <option value="KP">Khyber Pakhtunkhwa</option>
                    <option value="PB">Punjab</option>
                    <option value="SD">Sindh</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render order summary
  const renderOrderSummary = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
      
      <div className="space-y-4 mb-6">
        {checkoutItems.map((item, index) => (
          <div key={index} className="flex justify-between items-start border-b pb-4">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{item.hotelName}</h3>
              <p className="text-sm text-gray-600">{item.roomName}</p>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(item.checkIn).toLocaleDateString()} - {new Date(item.checkOut).toLocaleDateString()}
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {item.location}
              </div>
              {item.quantity > 1 && (
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                PKR {(item.price * item.quantity).toLocaleString()}
              </p>
              {item.rateClass && (
                <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                  item.rateClass.toLowerCase().includes('refundable') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {item.rateClass}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total Amount:</span>
          <span className="text-blue-600">PKR {totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Debug Info - Remove this in production */}
      {import.meta.env.MODE === 'production' && (
        <div className="bg-gray-100 p-4 rounded-lg mb-4 text-xs">
          <h4 className="font-medium mb-2">Debug Info:</h4>
          <pre>{JSON.stringify({
            userData: billingInfo, // Changed from billingInfo to userData for clarity
            checkoutItems: checkoutItems?.length || 0,
            totalAmount,
            user: user?.email || 'Not logged in'
          }, null, 2)}</pre>
        </div>
      )}

      {/* Payment Button */}
      <div className="mt-6">
        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 text-green-600 text-sm mb-4 p-3 bg-green-50 rounded-lg">
            <span>✅ {success}</span>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={isProcessing || checkoutItems.length === 0}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Secure Payment - PKR {totalAmount.toLocaleString()}</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center space-x-2 mt-3 text-xs text-gray-500">
          <Lock className="w-3 h-3" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>
    </div>
  );

  if (!checkoutItems || checkoutItems.length === 0) {
    return (
      <>
        <Header />
        <div className="pt-20 min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
              <p className="text-gray-600 mb-6">Add some items to your cart to proceed with checkout.</p>
              <button
                onClick={() => navigate('/home')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-2">Complete your booking securely</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {!user && renderAuthPrompt()}
              {renderBillingForm()}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              {renderOrderSummary()}
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        defaultTab="login"
      />
    </>
  );
};

export default Checkout;
