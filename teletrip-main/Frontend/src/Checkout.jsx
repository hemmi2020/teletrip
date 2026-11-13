import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserDataContext } from './components/CartSystem';
import { useCart } from './components/CartSystem';
import { AuthModal } from './components/CartSystem';
import { useCurrency } from './context/CurrencyContext';
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
  Users,
  ShieldCheck,
  CheckCircle,
  Clock
} from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserDataContext);
  const { items: cartItems, getTotalPrice, clearCart } = useCart();
  const { formatPKR, convert } = useCurrency();
  
  // Get cart data from navigation state or use current cart
  const checkoutItems = location.state?.cartItems || cartItems;
  const totalAmount = location.state?.totalAmount || getTotalPrice();
  
  // Currency conversion state
  const [currencyConversion, setCurrencyConversion] = useState(null);
  const [isLoadingConversion, setIsLoadingConversion] = useState(false);

  // State management
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('hblpay'); // 'hblpay' or 'pay_on_site'
  const [showOrderSummary, setShowOrderSummary] = useState(true);
  const [rateComments, setRateComments] = useState([]);
  const [excludedTaxes, setExcludedTaxes] = useState([]);
  const [validatedRateKeys, setValidatedRateKeys] = useState({});
  const [priceChangeNotice, setPriceChangeNotice] = useState(null);
  const [isValidatingRates, setIsValidatingRates] = useState(false);


  // Inventory hold countdown timer (Expedia / Bedsonline style)
  const [timeLeft, setTimeLeft] = useState(899); // 14:59

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
    postalCode: '',
    specialRequests: ''
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
  
  // Convert currency to PKR when component loads
  useEffect(() => {
    const convertCurrency = async () => {
      const firstItem = checkoutItems[0];
      const cur = firstItem?.currency || 'AED';
      if (cur === 'PKR') {
        return; // Already in PKR
      }
      
      setIsLoadingConversion(true);
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/currency/convert`,
          { amount: totalAmount, currency: cur },
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        if (response.data.success) {
          setCurrencyConversion(response.data.data);
          console.log('💱 Currency converted:', response.data.data);
        }
      } catch (error) {
        console.error('Currency conversion error:', error);
      } finally {
        setIsLoadingConversion(false);
      }
    };
    
    if (checkoutItems && checkoutItems.length > 0) {
      convertCurrency();
    }
  }, [checkoutItems, totalAmount]);

  // Pre-validate rates with CheckRate on checkout entry (mandatory HBX workflow & disclosure compliance)
  useEffect(() => {
    const validateRatesOnEntry = async () => {
      const hotelItems = (checkoutItems || []).filter(item => item.type !== 'activity' && item.type !== 'transfer' && item.rateKey);
      if (hotelItems.length === 0) return;

      setIsValidatingRates(true);
      const keysMap = {};
      const comments = [];
      const taxes = [];
      let detectedPriceChange = false;
      let freshTotal = 0;

      for (let idx = 0; idx < hotelItems.length; idx++) {
        const item = hotelItems[idx];
        try {
          const res = await hotelApi.checkRate(item.rateKey);
          if (res?.success && res.data?.hotel?.rooms?.[0]?.rates?.[0]) {
            const freshRate = res.data.hotel.rooms[0].rates[0];
            keysMap[item.rateKey] = freshRate.rateKey;

            if (freshRate.rateComments) {
              comments.push(freshRate.rateComments);
            }
            if (freshRate.taxes?.taxes?.length > 0) {
              const unpaidTaxes = freshRate.taxes.taxes.filter(t => !t.included);
              taxes.push(...unpaidTaxes);
            }

            const freshNet = parseFloat(freshRate.net || 0);
            const originalNet = parseFloat(item.totalPrice || item.net || item.price || 0);
            if (freshNet > 0 && Math.abs(freshNet - originalNet) > 0.01) {
              detectedPriceChange = true;
              freshTotal += freshNet;
            } else {
              freshTotal += originalNet;
            }
          } else {
            keysMap[item.rateKey] = item.rateKey;
          }
        } catch (err) {
          console.warn(`CheckRate pre-validation error for room ${idx + 1}:`, err.message);
          keysMap[item.rateKey] = item.rateKey;
        }
      }

      setValidatedRateKeys(keysMap);
      if (comments.length > 0) setRateComments([...new Set(comments)]);
      if (taxes.length > 0) setExcludedTaxes(taxes);
      if (detectedPriceChange && freshTotal > 0) {
        setPriceChangeNotice({
          oldTotal: parseFloat(totalAmount),
          newTotal: freshTotal,
          difference: (freshTotal - parseFloat(totalAmount)).toFixed(2)
        });
      }
      setIsValidatingRates(false);
    };

    validateRatesOnEntry();
  }, [checkoutItems]);

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

    // Phone validation (Flexible international format supporting Pakistani + international)
    const phoneRegex = /^[+]?[0-9\s\-()]{7,20}$/;
    if (!phoneRegex.test(billingInfo.phone.replace(/\s+/g, ''))) {
      setError('Please enter a valid phone number');
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
            code: item.activityCode || item.code,
            modality: item.modalityCode,
            modalityName: item.modalityName,
            name: item.name,
            date: item.checkIn,
            selectedTime: item.selectedTime,
            duration: item.duration,
            paxes: Array(item.guests || item.adults || 1).fill({ age: 30 }),
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
          currency: firstItem?.currency || 'AED',
          currencyConversion: currencyConversion || null,
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
        // Get all hotel items from cart (each is a separate room)
        const hotelItems = checkoutItems.filter(item => item.type !== 'activity' && item.type !== 'transfer' && item.rateKey);
        
        // Call checkRate for each room to get fresh rateKeys
        const roomsWithFreshKeys = await Promise.all(
          hotelItems.map(async (item, idx) => {
            try {
              const checkRateResponse = await hotelApi.checkRate(item.rateKey);
              const freshRateKey = checkRateResponse.data?.hotel?.rooms?.[0]?.rates?.[0]?.rateKey || item.rateKey;
              return { item, rateKey: freshRateKey, roomId: idx + 1, rateComments: checkRateResponse.data?.hotel?.rooms?.[0]?.rates?.[0]?.rateComments || '' };
            } catch (err) {
              console.warn(`CheckRate failed for room ${idx + 1}, using original rateKey`);
              return { item, rateKey: item.rateKey, roomId: idx + 1, rateComments: '' };
            }
          })
        );

        // Collect and display rate comments (important hotel info)
        const allRateComments = roomsWithFreshKeys
          .map(r => r.rateComments)
          .filter(Boolean);
        if (allRateComments.length > 0) {
          setRateComments(allRateComments);
        }
        
        hotelbedsBookingRequest = {
          holder: {
            name: billingInfo.firstName,
            surname: billingInfo.lastName
          },
          rooms: roomsWithFreshKeys.map(({ item, rateKey, roomId }) => {
            // Use per-room occupancy from cart item (rateKey regex is unreliable for multi-room)
            const rateAdults = item.adults || 2;
            const rateChildren = item.children || 0;
            const rateChildAges = item.childAges || [];
            
            return {
              rateKey,
              paxes: [
                ...Array(rateAdults).fill(null).map((_, i) => ({
                  roomId: roomId || 1,
                  type: 'AD',
                  name: i === 0 ? billingInfo.firstName : 'Guest',
                  surname: i === 0 ? billingInfo.lastName : 'Surname'
                })),
                ...Array(rateChildren).fill(null).map((_, i) => ({
                  roomId: roomId || 1,
                  type: 'CH',
                  age: rateChildAges[i] || 10,
                  name: 'Child',
                  surname: 'Surname'
                }))
              ]
            };
          }),
          clientReference: `TELI_${Date.now()}`,
          source: {
            channel: 'B2C',
            device: 'WEB',
            deviceInfo: 'TeleTrip Web Application'
          },
          remark: billingInfo?.specialRequests ? `${billingInfo.specialRequests} | Booking via TeleTrip` : 'Booking via TeleTrip',
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
            roomName: item.roomName || null,
            quantity: 1,
            price: parseFloat(item.totalPrice || item.net || item.price || 0)
          })),
          itinerary: checkoutItems.map(item => 
            item.type === 'activity' 
              ? `${item.name} - ${item.from} to ${item.to}`
              : `${item.hotelName} - ${item.checkIn} to ${item.checkOut}`
          ).join('; '),
          hotelbedsBookingRequest: hotelbedsBookingRequest
        },
        amount: currencyConversion ? currencyConversion.totalPKR : parseFloat(totalAmount),
        currency: 'PKR',
        currencyConversion: currencyConversion, // Store conversion details
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
          code: item.activityCode || item.code,
          modality: item.modalityCode,
          modalityName: item.modalityName,
          name: item.name,
          date: item.checkIn,
          selectedTime: item.selectedTime,
          duration: item.duration,
          paxes: Array(item.guests || item.adults || 1).fill({ age: 30 }),
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
      // Get all hotel items from cart (each is a separate room)
      const hotelItems = checkoutItems.filter(item => item.type !== 'activity' && item.type !== 'transfer' && item.rateKey);
      
      // Call CheckRate for each room to get fresh rateKeys
      console.log(`🔄 Calling CheckRate API for ${hotelItems.length} room(s)...`);
      const roomsWithFreshKeys = await Promise.all(
        hotelItems.map(async (item, idx) => {
          try {
            const checkRateResponse = await hotelApi.checkRate(item.rateKey);
            if (!checkRateResponse.success) {
              throw new Error(`Rate validation failed for room ${idx + 1}`);
            }
            const freshRateKey = checkRateResponse.data?.hotel?.rooms?.[0]?.rates?.[0]?.rateKey || item.rateKey;
            console.log(`✅ Room ${idx + 1} rate validated`);
            return { item, rateKey: freshRateKey, roomId: idx + 1, rateComments: checkRateResponse.data?.hotel?.rooms?.[0]?.rates?.[0]?.rateComments || '' };
          } catch (err) {
            console.warn(`⚠️ CheckRate failed for room ${idx + 1}:`, err.message);
            return { item, rateKey: item.rateKey, roomId: idx + 1, rateComments: '' };
          }
        })
      );

      // Collect and display rate comments (important hotel info)
      const allRateComments = roomsWithFreshKeys
        .map(r => r.rateComments)
        .filter(Boolean);
      if (allRateComments.length > 0) {
        setRateComments(allRateComments);
      }
      
      // Build Hotelbeds booking request with ALL rooms
      const hotelbedsBookingRequest = {
        holder: {
          name: billingInfo.firstName,
          surname: billingInfo.lastName
        },
        rooms: roomsWithFreshKeys.map(({ item, rateKey, roomId }) => {
          // Use per-room occupancy from cart item (rateKey regex is unreliable for multi-room)
          const rateAdults = item.adults || 2;
          const rateChildren = item.children || 0;
          const rateChildAges = item.childAges || [];
          
          return {
            rateKey,
            paxes: [
              ...Array(rateAdults).fill(null).map((_, i) => ({
                roomId: roomId || 1,
                type: 'AD',
                name: i === 0 ? billingInfo.firstName : 'Guest',
                surname: i === 0 ? billingInfo.lastName : 'Surname'
              })),
              ...Array(rateChildren).fill(null).map((_, i) => ({
                roomId: roomId || 1,
                type: 'CH',
                age: rateChildAges[i] || 10,
                name: 'Child',
                surname: 'Surname'
              }))
            ]
          };
        }),
        clientReference: `TELI_${Date.now()}`,
        source: {
          channel: 'B2C',
          device: 'WEB',
          deviceInfo: 'TeleTrip Web Application'
        },
        remark: billingInfo?.specialRequests ? `${billingInfo.specialRequests} | Booking via TeleTrip` : 'Booking via TeleTrip',
        tolerance: 2.00
      };
      
      // Send to Pay at Office endpoint with Hotelbeds request
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
          guests: checkoutItems.reduce((sum, item) => sum + (item.adults || 0) + (item.children || 0), 0),
          items: checkoutItems.map(item => ({
            name: item.hotelName || item.roomName || 'Hotel Booking',
            roomName: item.roomName || 'Room',
            quantity: 1,
            price: parseFloat(item.totalPrice || item.net || item.price || 0),
            totalPrice: parseFloat(item.totalPrice || item.net || item.price || 0),
            adults: item.adults || 2,
            children: item.children || 0,
            childAges: item.childAges || [],
            nights: item.nights || 1,
            boardName: item.boardName || 'Room Only',
            rateKey: item.rateKey || null
          })),
          hotelbedsBookingRequest: hotelbedsBookingRequest
        },
        amount: parseFloat(totalAmount),
        currency: firstItem?.currency || checkoutItems[0]?.currency || 'AED',
        currencyConversion: currencyConversion,
        confirmImmediately: true,
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
      setSuccess('Booking reserved! Please visit the Telitrip office to complete payment.');
      clearCart();

      setTimeout(() => {
        navigate('/payment-success-onsite', {
          state: {
            bookingId: bookingResponse.data.data.bookingId,
            bookingReference: bookingResponse.data.data.bookingReference || bookingResponse.data.data.hotelbedsReference,
            paymentId: bookingResponse.data.data.paymentId,
            orderId: bookingResponse.data.data.orderId,
            amount: currencyConversion?.totalPKR || bookingResponse.data.data.amount,
            currency: 'PKR',
            message: bookingResponse.data.data.message,
            instructions: bookingResponse.data.data.instructions,
            bookingDetails: {
              ...bookingResponse.data.data.bookingDetails,
              roomName: checkoutItems.map(item => item.roomName || item.modalityName).join(', '),
              guests: checkoutItems.reduce((sum, item) => sum + (item.adults || 0) + (item.children || 0), 0),
              adults: checkoutItems.reduce((sum, item) => sum + (item.adults || 0), 0),
              children: checkoutItems.reduce((sum, item) => sum + (item.children || 0), 0),
              rooms: checkoutItems.length,
              paidFacilities: firstItem?.paidFacilities || (firstItem?.hotelFacilities || []).filter(f => f.indFee === true) || [],
              roomsList: checkoutItems.map((item, idx) => ({
                name: item.roomName || `Room ${idx + 1}`,
                boardName: item.boardName || 'Room Only',
                adults: item.adults || 2,
                children: item.children || 0,
                childAges: item.childAges || [],
                netPrice: parseFloat(item.totalPrice || item.net || item.price || 0),
                nights: item.nights || 1,
                rateComments: item.rateComments || null
              }))
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full address"
              required
            />
          </div>
        </div>

        {/* City and State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              value={billingInfo.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Special Requests - Hotelbeds Certification Recommended */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requests (optional)
          </label>
          <textarea
            value={billingInfo.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            placeholder="E.g. late check-in, extra pillows, high floor, etc."
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1">These requests will be sent to the hotel (not guaranteed).</p>
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
              <h3 className="font-semibold text-gray-900">Pay at Office</h3>
              <p className="text-xs text-gray-500">Visit Telitrip office to pay</p>
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

      {/* Pay at Office Instructions */}
      {paymentMethod === 'pay_on_site' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-green-800">
              <p className="font-semibold mb-1">Pay at Office:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Hotel room reserved instantly</li>
                <li>Visit Telitrip office to complete payment before check-in</li>
                <li>Cash or card accepted</li>
                <li>Booking confirmed once payment received</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPaymentBox = () => (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900">Payment Options</h2>
          <p className="text-xs text-gray-500">Choose your preferred payment method</p>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted</span>
        </span>
      </div>

      {/* Payment Method Selector */}
      {renderPaymentMethodSelector()}

      {/* Primary Payment CTA Button */}
      <button
        onClick={handlePaymentSubmit}
        disabled={isProcessing || checkoutItems.length === 0}
        className={`w-full min-h-[50px] py-3.5 px-4 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
          paymentMethod === 'hblpay'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
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
                <span>Pay with HBLPay · {checkoutItems[0]?.currency || 'AED'} {parseFloat(totalAmount).toFixed(2)}</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span>Reserve Booking · Pay at Office</span>
              </>
            )}
          </>
        )}
      </button>

      <div className="flex items-center justify-center space-x-1.5 text-xs text-gray-400 pt-1">
        <Lock className="w-3 h-3 text-gray-400" />
        <span>Bank-grade 256-bit SSL encrypted checkout</span>
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900">Fare Breakdown & Taxes</h2>
          <p className="text-xs text-gray-500">Official Hotelbeds certified net rates</p>
        </div>
        <button
          onClick={() => setShowOrderSummary(v => !v)}
          className="lg:hidden text-xs text-blue-600 font-semibold px-2 py-1 rounded-md bg-blue-50"
        >
          {showOrderSummary ? 'Hide' : 'Show'}
        </button>
      </div>
      
      <div className={`space-y-4 mb-6 ${showOrderSummary ? '' : 'hidden lg:block'}`}>
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
              {item.type === 'activity' && item.selectedTime && (
                <p className="text-xs text-blue-600 font-medium mt-0.5">Time: {item.selectedTime}{item.duration ? ` · ${item.duration}` : ''}</p>
              )}
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                {item.type === 'activity' 
                  ? `${item.checkIn || item.from} - ${item.checkOut || item.to}`
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
                {(() => {
                  const itemTotal = item.type === 'activity'
                    ? parseFloat(item.price || 0)
                    : parseFloat(item.totalPrice || item.net || item.price || 0);
                  const eurStr = `${item.currency || 'EUR'} ${itemTotal.toFixed(2)}`;
                  const pkrStr = formatPKR(itemTotal, item.currency);
                  return pkrStr ? `${eurStr} (≈ ${pkrStr})` : eurStr;
                })()}
              </p>
              {item.taxes?.taxes?.filter(t => !t.included).length > 0 && (
                <div className="text-[10px] text-amber-600 mt-1">
                  {item.taxes.taxes.filter(t => !t.included).map((tax, i) => (
                    <span key={i}>{tax.subType || tax.type}: {tax.currency} {tax.amount} (payable on arrival){i < item.taxes.taxes.filter(t => !t.included).length - 1 ? ' · ' : ''}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown - Hidden from users */}
      
      {/* Total */}
      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total Amount:</span>
          <span className="text-blue-600 text-right">
              <div className="text-xs text-gray-500 font-normal">Hotelbeds Booking Currency</div>
              <div className="font-bold">{checkoutItems[0]?.currency || 'AED'} {parseFloat(totalAmount).toFixed(2)}</div>
              {(formatPKR(totalAmount, checkoutItems[0]?.currency) || currencyConversion?.totalPKR) && (
                <div className="text-sm text-green-600">≈ {formatPKR(totalAmount, checkoutItems[0]?.currency) || `PKR ${Math.round(currencyConversion.totalPKR).toLocaleString()}`} <span className="text-xs text-gray-500">(for local payment)</span></div>
              )}
            </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Rates are provided by Hotelbeds in EUR. PKR amount is an estimate for local payment reference only. Actual booking is confirmed in EUR.
        </p>
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

      {/* Rate Change Alert if CheckRate detected updated pricing */}
      {priceChangeNotice && (
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-blue-900">Hotelbeds Rate Update</h4>
            <p className="text-xs text-blue-800 mt-1">
              The hotel has updated the room price from <strong>EUR {priceChangeNotice.oldTotal.toFixed(2)}</strong> to <strong>EUR {priceChangeNotice.newTotal.toFixed(2)}</strong> ({priceChangeNotice.difference > 0 ? `+EUR ${priceChangeNotice.difference}` : `EUR ${priceChangeNotice.difference}`}). Your booking will proceed with the confirmed rate.
            </p>
          </div>
        </div>
      )}

      {/* Mandatory Excluded Taxes & Local Destination Fees */}
      {excludedTaxes.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <h4 className="text-sm font-semibold text-orange-900">Local Taxes & Destination Fees (Payable at Hotel)</h4>
          </div>
          <p className="text-xs text-orange-800 mb-2">
            The following city tax / resort fee is not included in the pre-payment and must be paid directly to the hotel upon check-in:
          </p>
          <ul className="space-y-1">
            {excludedTaxes.map((tax, tIdx) => (
              <li key={tIdx} className="text-xs text-orange-950 font-medium flex justify-between">
                <span>{tax.subType || tax.type || 'City Tax / Tourist Fee'}:</span>
                <span>{tax.currency || 'EUR'} {parseFloat(tax.amount || 0).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rate Comments - Important Hotel Information */}
      {rateComments.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-amber-900 mb-2">Important Hotel Information & Remarks</h4>
          {rateComments.map((comment, idx) => (
            <p key={idx} className="text-xs text-amber-800 mb-1">{comment}</p>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Guaranteed Net Rates</span>
        </span>
        <span className="text-[11px] text-gray-400">Zero Hidden Booking Fees</span>
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
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Secure Checkout</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Complete your booking with direct B2B net rates</p>
          </div>

          {/* Inventory Hold Timer Banner (Style 1 from Cart Design Lab) */}
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-amber-950 flex items-center gap-2">
                  <span>Room & Guaranteed Net Rate Held</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-black">
                    {formatTimer(timeLeft)}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  This rate is reserved exclusively for you. Complete booking before timer expires to avoid repricing.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Confirmation</span>
            </div>
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

            {/* Desktop Right Column: Payment Options ON TOP of Fare Breakdown & Taxes */}
            <div className="lg:col-span-1 space-y-6 sticky top-24">
              {renderPaymentBox()}
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