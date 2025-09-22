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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data matching your backend validation
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'PK',
    state: 'SD', // Default to Sindh
    postalCode: ''
  });

  // Authentication check function
  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
      return null;
    }

    try {
      const parsedUser = JSON.parse(userData);
      return { token, user: parsedUser };
    } catch (error) {
      return null;
    }
  };

  // Populate form with user data if logged in
  useEffect(() => {
    const authData = checkAuthentication();
    const currentUser = authData?.user || user;
    
    if (currentUser) {
      setBillingInfo(prev => ({
        ...prev,
        firstName: currentUser.fullname?.firstname || '',
        lastName: currentUser.fullname?.lastname || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      }));
    }
  }, [user]);

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
    setError('');
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state'];
    const missing = required.filter(field => !billingInfo[field]);
    
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`);
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingInfo.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation (Pakistani format)
    const phoneRegex = /^(\+92|0)?[0-9]{10}$/;
    if (!phoneRegex.test(billingInfo.phone.replace(/\s+/g, ''))) {
      setError('Please enter a valid Pakistani phone number');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    // Check authentication first
    const authData = checkAuthentication();
    if (!authData) {
      setError('Please login to continue with your booking.');
      setShowAuthModal(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 Starting checkout process...');

      // Step 1: Create booking with exact structure your backend expects
      const firstItem = checkoutItems[0];
      const bookingPayload = {
        hotelName: firstItem?.hotelName || 'Hotel Booking',
        roomName: firstItem?.roomName || 'Standard Room',
        location: firstItem?.location || 'Karachi, Pakistan',
        checkIn: firstItem?.checkIn || new Date().toISOString(),
        checkOut: firstItem?.checkOut || new Date(Date.now() + 86400000).toISOString(),
        guests: firstItem?.guests || firstItem?.adults || 1,
        totalAmount: parseFloat(totalAmount),
        boardType: firstItem?.boardName || 'Room Only',
        rateClass: firstItem?.rateClass || 'NOR'
      };

      console.log('📋 Creating booking with payload:', bookingPayload);

      const bookingResponse = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/bookings/create`,
        bookingPayload,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const bookingId = bookingResponse.data.data?._id;
      if (!bookingId) {
        throw new Error('No booking ID returned from booking creation');
      }

      console.log('✅ Booking created with ID:', bookingId);

      // Step 2: Initiate payment with exact structure your backend expects
      const paymentPayload = {
        userData: {
          firstName: billingInfo.firstName.trim(),
          lastName: billingInfo.lastName.trim(),
          email: billingInfo.email.trim().toLowerCase(),
          phone: billingInfo.phone.trim().replace(/\s+/g, ''),
          address: billingInfo.address.trim(),
          city: billingInfo.city.trim(),
          state: billingInfo.state,
          country: billingInfo.country,
          postalCode: billingInfo.postalCode || ''
        },
        bookingData: {
          hotelName: firstItem?.hotelName || 'Hotel Booking',
          items: checkoutItems.map(item => ({
            name: item.hotelName || 'Hotel Booking',
            quantity: 1,
            price: parseFloat(item.price || item.totalPrice || 0)
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

      console.log('💳 Initiating payment with payload:', paymentPayload);

      const paymentResponse = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/payments/hblpay/initiate`,
        paymentPayload,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📥 Payment response:', paymentResponse.data);

      // Check if payment initiation was successful
      if (paymentResponse.data.success && paymentResponse.data.data) {
        const { redirectUrl, paymentId, sessionId } = paymentResponse.data.data;
        
        if (!redirectUrl) {
          throw new Error('No redirect URL received from payment gateway');
        }

        console.log('✅ Payment initiated successfully');
        console.log('🔗 Redirecting to:', redirectUrl);

        // Store payment info for tracking
        localStorage.setItem('currentPayment', JSON.stringify({
          paymentId,
          bookingId,
          sessionId,
          amount: totalAmount,
          timestamp: Date.now()
        }));

        setSuccess('Payment initiated successfully! Redirecting to HBLPay...');

        // Clear cart
        clearCart();

        // Small delay to show success message, then redirect
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);

      } else {
        throw new Error(paymentResponse.data.message || 'Payment initiation failed');
      }

    } catch (error) {
      console.error('❌ Checkout error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      let errorMessage = 'Payment processing failed. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please login again.';
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
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

  // Render forms
  const renderBillingForm = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Information</h2>
      
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

        {/* City and State */}
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
              State *
            </label>
            <select
              value={billingInfo.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select State</option>
              <option value="IS">Islamabad</option>
              <option value="BA">Balochistan</option>
              <option value="KP">Khyber Pakhtunkhwa</option>
              <option value="PB">Punjab</option>
              <option value="SD">Sindh</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

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
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                PKR {item.price.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total Amount:</span>
          <span className="text-blue-600">PKR {totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Error/Success Messages */}
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

      {/* Payment Button */}
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
            <span>Pay with HBLPay - PKR {totalAmount.toLocaleString()}</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center space-x-2 mt-3 text-xs text-gray-500">
        <Lock className="w-3 h-3" />
        <span>Secure payment powered by HBL</span>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Secure Checkout</h1>
            <p className="text-gray-600 mt-2">Complete your booking with HBLPay</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {!user && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-blue-900">Sign in for faster checkout</h3>
                      <p className="text-sm text-blue-700 mt-1">Save your information and track your bookings</p>
                    </div>
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}
              {renderBillingForm()}
            </div>

            <div className="lg:col-span-1">
              {renderOrderSummary()}
            </div>
          </div>
        </div>
      </div>

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