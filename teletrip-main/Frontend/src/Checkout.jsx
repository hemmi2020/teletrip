import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserDataContext } from './components/CartSystem';
import { useCart } from './components/CartSystem';
import { AuthModal } from './components/CartSystem';
import Header from './components/Header';
import axios from 'axios';
import { hotelApi } from './services/hotelApi';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Lock,
  AlertCircle,
  Building2,
  Wallet,
  Loader2,
  Users
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
  const [paymentMethod, setPaymentMethod] = useState('hblpay'); // 'hblpay' or 'pay_on_site'


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
      console.log('🚀 Starting HBLPay checkout process...');

      const firstItem = checkoutItems[0];
      const isActivity = firstItem?.type === 'activity';
      const isTransfer = firstItem?.type === 'transfer';
      
      let bookingResponse;
      
      if (isTransfer) {
        console.log('🚐 Creating transfer booking...');
        const transferBookingPayload = {
          holder: {
            name: `${billingInfo.firstName} ${billingInfo.lastName}`,
            surname: billingInfo.lastName,
            email: billingInfo.email,
            phone: billingInfo.phone
          },
          transfers: checkoutItems.map(item => ({
            rateKey: item.rateKey,
            transferDetails: [{
              type: 'PICKUP',
              date: item.pickupDate,
              time: item.pickupTime,
              pickupInformation: {
                from: { code: item.fromCode, type: item.fromType },
                to: { code: item.toCode, type: item.toType }
              },
              passengers: Array(item.adults || 1).fill({ name: billingInfo.firstName, surname: billingInfo.lastName, type: 'ADULT' })
            }]
          })),
          clientReference: `TRANSFER_${Date.now()}`
        };
        
        bookingResponse = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/transfers/bookings`,
          transferBookingPayload,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else if (isActivity) {
        const activityBookingPayload = {
          holder: {
            name: `${billingInfo.firstName} ${billingInfo.lastName}`,
            email: billingInfo.email,
            phone: billingInfo.phone
          },
          activities: checkoutItems.map(item => ({
            code: item.activityCode,
            modality: item.modalityCode,
            name: item.name,
            date: item.checkIn,
            paxes: Array(item.adults || 1).fill({ age: 30 }),
            price: item.price,
            currency: item.currency
          })),
          clientReference: `CLIENT_${Date.now()}`
        };
        
        console.log('📋 Creating activity booking:', activityBookingPayload);
        
        bookingResponse = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/bookings/activity`,
          activityBookingPayload,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        const hotelBookingPayload = {
          hotelName: firstItem?.hotelName || 'Hotel Booking',
          roomName: firstItem?.roomName || 'Standard Room',
          location: firstItem?.location || 'Karachi, Pakistan',
          checkIn: firstItem?.checkIn || new Date().toISOString(),
          checkOut: firstItem?.checkOut || new Date(Date.now() + 86400000).toISOString(),
          guests: firstItem?.guests || firstItem?.adults || 1,
          totalAmount: parseFloat(totalAmount),
          boardType: firstItem?.boardName || 'Room Only',
          rateClass: firstItem?.rateClass || 'NOR',
          rateKey: firstItem?.rateKey, // ⚠️ CRITICAL: Pass rateKey for Hotelbeds booking
          specialRequests: billingInfo?.specialRequests || ''
        };
        
        console.log('📋 Creating hotel booking:', hotelBookingPayload);
        
        bookingResponse = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/bookings/create`,
          hotelBookingPayload,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      const bookingId = bookingResponse.data?.booking?.reference ||
                        bookingResponse.data?.data?.booking?.reference ||
                        bookingResponse.data?.data?.booking?._id || 
                        bookingResponse.data?.data?._id || 
                        bookingResponse.data?.data?.id || 
                        bookingResponse.data?.data?.bookingId ||
                        bookingResponse.data?._id || 
                        bookingResponse.data?.id ||
                        bookingResponse.data?.bookingId;
      
      if (!bookingId) {
        console.error('❌ No booking ID found:', bookingResponse.data);
        throw new Error('No booking ID returned from booking creation');
      }

      console.log('✅ Booking created with ID:', bookingId);

      // Step 2: Build Hotelbeds booking request for hotels
      let hotelbedsBookingRequest = null;
      if (!isActivity && !isTransfer && firstItem.rateKey) {
        // Call checkRate to get fresh rateKey
        const checkRateResponse = await hotelApi.checkRate(firstItem.rateKey);
        const finalRateKey = checkRateResponse.data?.hotel?.rooms?.[0]?.rates?.[0]?.rateKey || firstItem.rateKey;
        
        hotelbedsBookingRequest = {
          holder: {
            name: billingInfo.firstName,
            surname: billingInfo.lastName
          },
          rooms: [{
            rateKey: finalRateKey,
            paxes: [
              ...Array(firstItem.adults || 2).fill(null).map((_, i) => ({
                roomId: 1,
                type: 'AD',
                name: i === 0 ? billingInfo.firstName : 'Guest',
                surname: i === 0 ? billingInfo.lastName : 'Surname'
              })),
              ...Array(firstItem.children || 0).fill(null).map((_, i) => ({
                roomId: 1,
                type: 'CH',
                age: 10,
                name: 'Child',
                surname: 'Surname'
              }))
            ]
          }],
          clientReference: `TELI_${Date.now()}`,
          remark: billingInfo?.specialRequests || 'Booking via TeleTrip',
          tolerance: 2.00
        };
      }

      // Step 3: Initiate HBLPay payment
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
          hotelName: isActivity ? firstItem.name : (firstItem?.hotelName || 'Hotel Booking'),
          checkIn: firstItem?.checkIn,
          checkOut: firstItem?.checkOut,
          items: checkoutItems.map(item => ({
            name: item.type === 'activity' ? item.name : (item.hotelName || 'Hotel Booking'),
            quantity: 1,
            price: parseFloat(item.price || item.totalPrice || 0)
          })),
          itinerary: checkoutItems.map(item => 
            item.type === 'activity' 
              ? `${item.name} - ${item.from} to ${item.to}`
              : `${item.hotelName} - ${item.checkIn} to ${item.checkOut}`
          ).join('; '),
          hotelbedsBookingRequest: hotelbedsBookingRequest
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
        const { paymentUrl , paymentId, sessionId } = paymentResponse.data.data;

        if (!paymentUrl) {
          throw new Error('No payment URL received from payment gateway');
        }

        console.log('✅ Payment initiated successfully');
        console.log('🔗 Redirecting to:', paymentUrl);

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
          window.location.href = paymentUrl ;
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
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
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

  // 3. ADD THIS NEW FUNCTION (keep your existing handlePayment function)
const handlePayOnSiteBooking = async () => {
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
    console.log('🏨 Creating Pay on Site booking...');

    const firstItem = checkoutItems[0];
    const isActivity = firstItem?.type === 'activity';
    
    let bookingResponse;
    
    if (isActivity) {
      const activityBookingPayload = {
        holder: {
          name: `${billingInfo.firstName} ${billingInfo.lastName}`,
          email: billingInfo.email,
          phone: billingInfo.phone
        },
        activities: checkoutItems.map(item => ({
          code: item.activityCode,
          modality: item.modalityCode,
          name: item.name,
          date: item.checkIn,
          paxes: Array(item.adults || 1).fill({ age: 30 }),
          price: item.price,
          currency: item.currency
        })),
        clientReference: `CLIENT_${Date.now()}`
      };
      
      console.log('📤 Sending activity booking:', activityBookingPayload);
      
      bookingResponse = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/bookings/activity`,
        activityBookingPayload,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('📥 Activity booking response:', bookingResponse.data);
    } else {
      // Always call CheckRate to get fresh rateKey
      console.log('🔄 Calling CheckRate API to get fresh rateKey...');
      const checkRateResponse = await hotelApi.checkRate(firstItem.rateKey);
      
      if (!checkRateResponse.success) {
        throw new Error('Rate validation failed. Room may no longer be available.');
      }
      
      const finalRateKey = checkRateResponse.data?.hotel?.rooms?.[0]?.rates?.[0]?.rateKey || firstItem.rateKey;
      console.log('✅ Rate validated, new rateKey:', finalRateKey);
      
      // Build Hotelbeds booking request
      const hotelbedsBookingRequest = {
        holder: {
          name: billingInfo.firstName,
          surname: billingInfo.lastName
        },
        rooms: [{
          rateKey: finalRateKey,
          paxes: [
            ...Array(firstItem.adults || 2).fill(null).map((_, i) => ({
              roomId: 1,
              type: 'AD',
              name: i === 0 ? billingInfo.firstName : 'Guest',
              surname: i === 0 ? billingInfo.lastName : 'Surname'
            })),
            ...Array(firstItem.children || 0).fill(null).map((_, i) => ({
              roomId: 1,
              type: 'CH',
              age: 10,
              name: 'Child',
              surname: 'Surname'
            }))
          ]
        }],
        clientReference: `TELI_${Date.now()}`,
        remark: billingInfo?.specialRequests || 'Booking via TeleTrip',
        tolerance: 2.00
      };
      
      // Send to Pay on Site endpoint with Hotelbeds request
      const payOnSitePayload = {
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
          checkIn: firstItem?.checkIn,
          checkOut: firstItem?.checkOut,
          guests: firstItem?.guests || firstItem?.adults || 1,
          items: checkoutItems.map(item => ({
            name: item.hotelName || 'Hotel Booking',
            quantity: 1,
            price: parseFloat(item.price || item.totalPrice || 0)
          })),
          hotelbedsBookingRequest: hotelbedsBookingRequest
        },
        amount: parseFloat(totalAmount),
        currency: checkoutItems[0]?.currency || 'PKR',
        bookingId: `HOTELBEDS_${Date.now()}`
      };
      
      console.log('📤 Sending Pay on Site booking with Hotelbeds request');
      bookingResponse = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/payments/pay-on-site`,
        payOnSitePayload,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('📥 Pay on Site response:', bookingResponse.data);
    }

    if (bookingResponse.data.success) {
      setSuccess('Booking confirmed! Payment will be collected on site.');
      clearCart();

      setTimeout(() => {
        navigate('/payment-success-onsite', {
          state: {
            bookingId: bookingResponse.data.data.bookingId,
            bookingReference: bookingResponse.data.data.bookingReference || bookingResponse.data.data.hotelbedsReference,
            paymentId: bookingResponse.data.data.paymentId,
            orderId: bookingResponse.data.data.orderId,
            amount: bookingResponse.data.data.amount,
            currency: bookingResponse.data.data.currency,
            message: bookingResponse.data.data.message,
            instructions: bookingResponse.data.data.instructions,
            bookingDetails: {
              ...bookingResponse.data.data.bookingDetails,
              roomName: firstItem.roomName || firstItem.modalityName,
              guests: firstItem.guests || firstItem.adults || 1,
              adults: firstItem.adults,
              children: firstItem.children,
              rooms: firstItem.rooms
            },
            bookingType: firstItem.type === 'activity' ? 'activity' : 'hotel'
          }
        });
      }, 1500);
    }

  } catch (error) {
    console.error('❌ Pay on Site error:', error);
    
    let errorMessage = 'Booking failed. Please try again.';
    
    if (error.response?.status === 401) {
      errorMessage = 'Session expired. Please login again.';
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setShowAuthModal(true);
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
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

const handlePaymentSubmit = () => {
  if (paymentMethod === 'pay_on_site') {
    handlePayOnSiteBooking();
  } else {
    handlePayment(); // Your existing HBL payment function
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

  const renderPaymentMethodSelector = () => (
    <div className="mb-6 space-y-3">
      {/* HBLPay Option */}
      <div
        onClick={() => setPaymentMethod('hblpay')}
        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
          paymentMethod === 'hblpay'
            ? 'border-blue-600 bg-blue-50 shadow-md'
            : 'border-gray-200 hover:border-blue-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              paymentMethod === 'hblpay' ? 'bg-blue-600' : 'bg-gray-200'
            }`}>
              <CreditCard className={`w-5 h-5 ${
                paymentMethod === 'hblpay' ? 'text-white' : 'text-gray-500'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Pay with HBLPay</h3>
              <p className="text-xs text-gray-500">Secure online payment</p>
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            paymentMethod === 'hblpay' ? 'border-blue-600' : 'border-gray-300'
          }`}>
            {paymentMethod === 'hblpay' && (
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            )}
          </div>
        </div>
      </div>

      {/* Pay on Site Option */}
      <div
        onClick={() => setPaymentMethod('pay_on_site')}
        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
          paymentMethod === 'pay_on_site'
            ? 'border-green-600 bg-green-50 shadow-md'
            : 'border-gray-200 hover:border-green-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              paymentMethod === 'pay_on_site' ? 'bg-green-600' : 'bg-gray-200'
            }`}>
              <Building2 className={`w-5 h-5 ${
                paymentMethod === 'pay_on_site' ? 'text-white' : 'text-gray-500'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Pay on Site</h3>
              <p className="text-xs text-gray-500">Pay when you arrive</p>
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            paymentMethod === 'pay_on_site' ? 'border-green-600' : 'border-gray-300'
          }`}>
            {paymentMethod === 'pay_on_site' && (
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
            )}
          </div>
        </div>
      </div>

      {/* Pay on Site Instructions */}
      {paymentMethod === 'pay_on_site' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-green-800">
              <p className="font-semibold mb-1">✅ Pay on Site Benefits:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Booking confirmed instantly</li>
                <li>Pay when you arrive at hotel</li>
                <li>Cash or card accepted</li>
                <li>No online payment needed</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrderSummary = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
      
      <div className="space-y-4 mb-6">
        {checkoutItems.map((item, index) => (
          <div key={index} className="flex gap-4 border-b pb-4">
            {item.image && (
              <img
                src={item.image}
                alt={item.type === 'activity' ? item.name : item.hotelName}
                className="w-20 h-20 object-cover rounded"
                onError={(e) => e.target.src = 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'}
              />
            )}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{item.type === 'activity' ? item.name : item.hotelName}</h3>
              <p className="text-sm text-gray-600">{item.type === 'activity' ? item.modalityName : item.roomName}</p>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                {item.type === 'activity' 
                  ? `${item.from} - ${item.to}`
                  : `${new Date(item.checkIn).toLocaleDateString()} - ${new Date(item.checkOut).toLocaleDateString()}`
                }
              </div>
              {item.type !== 'activity' && (
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                  <Users className="w-3 h-3" />
                  <span>{item.adults || 2} Adult{(item.adults || 2) > 1 ? 's' : ''}</span>
                  {item.children > 0 && <span>, {item.children} Child{item.children > 1 ? 'ren' : ''}</span>}
                  <span>• {item.rooms || 1} Room{(item.rooms || 1) > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {item.currency || 'PKR'} {parseFloat(item.price || item.totalPrice).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total Amount:</span>
          <span className="text-blue-600">
            {checkoutItems[0]?.currency || 'PKR'} {parseFloat(totalAmount).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-red-800">Booking Failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              {error.includes('no longer available') && (
                <button onClick={() => navigate('/hotel-search-results')} className="mt-2 text-xs text-red-600 underline hover:text-red-800">
                  Search for available rooms →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Selector */}
      {renderPaymentMethodSelector()}

      {/* Payment Button */}
      <button
        onClick={handlePaymentSubmit}
        disabled={isProcessing || checkoutItems.length === 0}
        className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all ${
          paymentMethod === 'hblpay'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {paymentMethod === 'hblpay' ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay with HBLPay - {checkoutItems[0]?.currency || 'PKR'} {parseFloat(totalAmount).toFixed(2)}</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span>Confirm Booking - Pay on Site</span>
              </>
            )}
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
            <p className="text-gray-600 mt-2">Complete your booking</p>
            <p className="text-gray-600 mt-2">Complete your booking</p>
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