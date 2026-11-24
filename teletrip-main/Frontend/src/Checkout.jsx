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
  Clock,
  ShoppingBag
} from 'lucide-react';
import { AnimatedIcon } from './components/common/AnimatedIcon';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserDataContext);
  const { items: cartItems, getTotalPrice, clearCart } = useCart();
  const { formatPKR, convert } = useCurrency();
  
  // Get cart data from navigation state or use current cart
  const checkoutItems = location.state?.cartItems || cartItems;

  const initialTotal = (() => {
    const fromNav = parseFloat(location.state?.totalAmount);
    if (!isNaN(fromNav) && fromNav > 0) return fromNav;
    const fromContext = parseFloat(getTotalPrice());
    if (!isNaN(fromContext) && fromContext > 0) return fromContext;
    if (Array.isArray(checkoutItems) && checkoutItems.length > 0) {
      const sum = checkoutItems.reduce((acc, it) => {
        const val = parseFloat(it.pricePkr ?? it.totalPrice ?? it.price ?? it.net ?? 0);
        return acc + (!isNaN(val) ? val : 0);
      }, 0);
      if (sum > 0) return sum;
    }
    return 0;
  })();

  const [totalAmount, setTotalAmount] = useState(initialTotal);

  const hasNonRefundable = checkoutItems?.some(item => item.rateClass === 'NRF');
  const hasFreeCancellation = checkoutItems?.length > 0 && !hasNonRefundable;
  const deadlineRaw = checkoutItems?.[0]?.cancellationDeadline || checkoutItems?.[0]?.cancellationPolicies?.[0]?.from || checkoutItems?.[0]?.cancellationPolicy?.from;
  let formattedDeadline = '';
  if (deadlineRaw) {
    try {
      const d = new Date(deadlineRaw);
      if (!isNaN(d.getTime())) {
        formattedDeadline = `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      }
    } catch (_) {}
  }
  
  // Currency conversion state
  const [currencyConversion, setCurrencyConversion] = useState(null);
  const [isLoadingConversion, setIsLoadingConversion] = useState(false);

  // State management
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('hblpay'); // 'hblpay' or 'pay_on_site' (Pay Later)
  const [showOrderSummary, setShowOrderSummary] = useState(true);
  const [serverQuoteId, setServerQuoteId] = useState(null);
  const [rateComments, setRateComments] = useState([]);
  const [excludedTaxes, setExcludedTaxes] = useState([]);
  const [validatedRateKeys, setValidatedRateKeys] = useState({});
  const [priceChangeNotice, setPriceChangeNotice] = useState(null);
  const [isValidatingRates, setIsValidatingRates] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeNRF, setAgreeNRF] = useState(false);
  const [isHoldExpired, setIsHoldExpired] = useState(false);

  // Inventory hold countdown timer (Expedia / Bedsonline style)
  const [timeLeft, setTimeLeft] = useState(899); // 14:59

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Point 15: Clear cart and invalidate hold immediately on timer expiry
  useEffect(() => {
    if (timeLeft === 0 && !isHoldExpired) {
      setIsHoldExpired(true);
      if (clearCart) {
        clearCart();
      }
    }
  }, [timeLeft, isHoldExpired, clearCart]);

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

            if (res.quoteId) {
              setServerQuoteId(res.quoteId);
            }

            if (freshRate.rateComments) {
              comments.push(freshRate.rateComments);
            }
            if (freshRate.excludedTaxes?.length > 0) {
              taxes.push(...freshRate.excludedTaxes);
            } else if (freshRate.taxes?.taxes?.length > 0) {
              const unpaidTaxes = freshRate.taxes.taxes.filter(t => !t.included);
              taxes.push(...unpaidTaxes);
            }

            const freshPkr = parseFloat(freshRate.pricePkr || freshRate.totalAmountPkr || freshRate.price || freshRate.net || 0);
            const originalPkr = parseFloat(item.pricePkr || item.totalPrice || item.price || item.net || 0);
            if (freshPkr > 0 && Math.abs(freshPkr - originalPkr) > 1) {
              detectedPriceChange = true;
              freshTotal += freshPkr;
            } else {
              freshTotal += (freshPkr || originalPkr);
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
      if (freshTotal > 0) {
        setTotalAmount(freshTotal);
      }
      if (detectedPriceChange && freshTotal > 0 && initialTotal > 0 && Math.abs(freshTotal - initialTotal) > 1) {
        setPriceChangeNotice({
          oldTotal: parseFloat(initialTotal),
          newTotal: freshTotal,
          difference: (freshTotal - parseFloat(initialTotal)).toFixed(0)
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
          rateKey: firstItem?.rateKey, // CRITICAL: Pass rateKey for Hotelbeds booking
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
        amount: parseFloat(totalAmount),
        currency: 'PKR',
        quoteId: serverQuoteId,
        rateKey: checkoutItems[0]?.rateKey,
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
        currency: 'PKR',
        quoteId: serverQuoteId,
        rateKey: firstItem?.rateKey,
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
  if (isHoldExpired) {
    setError('Your 15-minute price hold has expired. Please search stays again.');
    return;
  }
  if (hasNonRefundable && !agreeNRF) {
    setError('Please acknowledge that this booking is 100% non-refundable to proceed.');
    return;
  }
  if (!agreeTerms) {
    setError('Please agree to the Terms & Conditions and cancellation policy to proceed.');
    return;
  }
  if (paymentMethod === 'pay_on_site' || paymentMethod === 'pay_later') {
    handlePayOnSiteBooking();
  } else {
    handlePayment();
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
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 shadow-xs text-left">
      <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
        <User className="w-4 h-4 text-blue-600" />
        <span>Primary Guest Information</span>
      </h2>
      
      <div className="space-y-3.5">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              First Name <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={billingInfo.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-slate-900 transition-colors"
                placeholder="Ahmed"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Last Name <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={billingInfo.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-slate-900 transition-colors"
                placeholder="Khan"
                required
              />
            </div>
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address (for official voucher) <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={billingInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-slate-900 transition-colors"
                placeholder="guest@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mobile Phone <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={billingInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-slate-900 transition-colors"
                placeholder="+971 50 123 4567"
                required
              />
            </div>
          </div>
        </div>

        {/* Address and City Fields (Prefilled & Compact) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Billing Address <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={billingInfo.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 transition-colors"
              placeholder="Residential address"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              City <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={billingInfo.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 transition-colors"
              placeholder="City"
              required
            />
          </div>
        </div>

        {/* Special Requests */}
        <div className="pt-1">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Special Requests (Optional)
          </label>
          <textarea
            value={billingInfo.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            placeholder="E.g. High floor, quiet room, late check-in..."
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-slate-900 transition-colors"
            rows={2}
            maxLength={500}
          />
          <p className="text-[10px] text-gray-400 mt-0.5">Relayed directly to hotel reservation desk upon voucher issuance.</p>
        </div>
      </div>
    </div>
  );

  const renderPaymentMethodSelector = () => (
    <div className="space-y-2.5">
      {/* Option 1: Credit / Debit Card (HBLPay) */}
      <button
        type="button"
        onClick={() => setPaymentMethod('hblpay')}
        className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
          paymentMethod === 'hblpay'
            ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-100'
            : 'border-gray-200 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-gray-900 block">Credit / Debit Card (HBLPay)</span>
            <span className="text-[11px] text-gray-500">Instant confirmation via Visa, Mastercard & UnionPay</span>
          </div>
        </div>
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
          paymentMethod === 'hblpay' ? 'border-blue-600' : 'border-gray-300'
        }`}>
          {paymentMethod === 'hblpay' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
        </div>
      </button>

      {/* Option 2: Book Now & Pay Later (Only available for Free Cancellation bookings) */}
      {hasFreeCancellation ? (
        <button
          type="button"
          onClick={() => setPaymentMethod('pay_on_site')}
          className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            paymentMethod === 'pay_on_site'
              ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-100'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-gray-900 block">Book Now & Pay Later</span>
              <span className="text-[11px] text-emerald-700 font-semibold">Reserve now without immediate payment</span>
            </div>
          </div>
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
            paymentMethod === 'pay_on_site' ? 'border-emerald-600' : 'border-gray-300'
          }`}>
            {paymentMethod === 'pay_on_site' && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
          </div>
        </button>
      ) : (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
          <span className="font-bold text-slate-700 block mb-0.5">Pay Later unavailable for this booking:</span>
          <span>This rate is Non-Refundable (NRF). Immediate card payment is required by Bedsonline supplier policies to confirm this reservation.</span>
        </div>
      )}

      {/* Book Now & Pay Later Terms & Cancellation Warning (Point 13) */}
      {paymentMethod === 'pay_on_site' && hasFreeCancellation && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3.5 space-y-1.5 animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Pay Later Terms & Cancellation Warning:</span>
          </div>
          <p className="text-[11px] text-amber-900 leading-relaxed">
            Your booking will be reserved without upfront charge. Full payment must be completed before <strong>{formattedDeadline || 'the free cancellation deadline'}</strong>. If payment is not completed by this deadline, your reservation will be <strong>automatically cancelled</strong> to avoid supplier cancellation penalties.
          </p>
        </div>
      )}
    </div>
  );

  const renderPaymentBox = () => (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 space-y-4 text-left">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Payment Options</span>
          </h2>
          <p className="text-[11px] text-gray-500">Choose your preferred payment method</p>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          256-bit Encrypted
        </span>
      </div>

      {/* Payment Method Selector */}
      {renderPaymentMethodSelector()}

      {/* Mandatory Checkboxes (Point 13) */}
      <div className="pt-3 border-t border-gray-100 space-y-2.5">
        {hasNonRefundable && (
          <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeNRF}
              onChange={(e) => setAgreeNRF(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 accent-blue-600"
            />
            <span>
              I understand and acknowledge that this booking is <strong>100% Non-Refundable</strong> and cannot be amended or cancelled once confirmed. <span className="text-red-500 font-bold">*</span>
            </span>
          </label>
        )}

        <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 accent-blue-600"
          />
          <span>
            I have read and agree to the <a href="/terms" target="_blank" className="text-blue-600 underline font-semibold">Terms & Conditions</a>, Privacy Policy, and cancellation policies. <span className="text-red-500 font-bold">*</span>
          </span>
        </label>
      </div>

      {/* Primary Payment CTA Button */}
      <button
        onClick={handlePaymentSubmit}
        disabled={isProcessing || isHoldExpired || checkoutItems.length === 0 || !agreeTerms || (hasNonRefundable && !agreeNRF)}
        className={`w-full min-h-[50px] py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer ${
          paymentMethod === 'hblpay'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing Booking...</span>
          </>
        ) : (
          <>
            {paymentMethod === 'hblpay' ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay with HBLPay · PKR {Math.round(parseFloat(totalAmount)).toLocaleString()}</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span>Confirm Reservation · Pay Later</span>
              </>
            )}
          </>
        )}
      </button>

      <div className="flex items-center justify-center space-x-1.5 text-[11px] text-gray-400 pt-1">
        <Lock className="w-3 h-3 text-gray-400" />
        <span>Bank-grade 256-bit SSL encrypted checkout</span>
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-extrabold text-gray-900">Fare Breakdown & Taxes</h2>
          <p className="text-[11px] text-gray-500">Official wholesale certified net rates</p>
        </div>
        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          All-Inclusive
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between items-center text-gray-600">
          <span>Base Room Rate</span>
          <span className="font-semibold text-gray-800">
            PKR {Math.round(parseFloat(totalAmount) || 0).toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center text-gray-600">
          <span className="flex items-center gap-1">
            <span>Taxes & Service Fees</span>
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">Included</span>
          </span>
          <span className="font-semibold text-emerald-600">PKR 0.00</span>
        </div>

        {excludedTaxes && excludedTaxes.length > 0 && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-1">
            <span className="font-bold block">Payable directly at property:</span>
            {excludedTaxes.map((tax, i) => (
              <div key={i} className="flex justify-between">
                <span>{tax.subType || tax.type || 'City Tax'}:</span>
                <span className="font-semibold">{tax.currency} {tax.amount}</span>
              </div>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 flex justify-between items-end">
          <div>
            <span className="text-xs uppercase font-extrabold text-gray-500 block tracking-wider">
              Grand Total
            </span>
            <span className="text-[10px] text-gray-400">All local taxes & fees included</span>
          </div>
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-black text-blue-600 leading-tight">
              PKR {Math.round(parseFloat(totalAmount) || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Booking Notice:</span>
            <span>{error}</span>
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
              The hotel has updated the room price from <strong>PKR {Math.round(priceChangeNotice.oldTotal).toLocaleString()}</strong> to <strong>PKR {Math.round(priceChangeNotice.newTotal).toLocaleString()}</strong> ({priceChangeNotice.difference > 0 ? `+PKR ${Math.round(priceChangeNotice.difference).toLocaleString()}` : `PKR ${Math.round(priceChangeNotice.difference).toLocaleString()}`}). Your booking will proceed with the confirmed rate.
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
        <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto px-4 py-12 text-center w-full">
            {isHoldExpired ? (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Clock className="w-7 h-7" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900">Booking Hold Expired</h1>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Your 15-minute price and room availability hold has expired. The inventory has been released back to the supplier to ensure accurate live availability.
                </p>
                <button
                  onClick={() => navigate('/home')}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                >
                  Search Stays Again
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900">Your Cart is Empty</h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Select a room or activity to proceed with checkout.
                </p>
                <button
                  onClick={() => navigate('/home')}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                >
                  Browse Stays
                </button>
              </div>
            )}
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

          {/* 1. Checkout Timer (Mobile Order 1 & Desktop Top Banner) */}
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 bento-card border-0 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm shrink-0">
                <AnimatedIcon name="time" animation="pulse" size={16} className="text-white" />
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

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full font-bold shrink-0 border-0">
              <AnimatedIcon name="shield" animation="pulse" size={13} className="text-emerald-700 shrink-0" />
              <span>Instant Confirmation</span>
            </div>
          </div>

          {/* Reordered Layout: Mobile Order [1.Timer, 2.Property, 3.Passenger, 4.Fare Breakdown, 5.Payment, 6.Guarantee] */}
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-8 items-start">
            {/* Left 7 Columns on Desktop */}
            <div className="contents lg:block lg:col-span-7 lg:space-y-5">
              {/* Mobile Order 2: Selected Room / Property Cards */}
              <div className="order-1 lg:order-none space-y-4">
                {checkoutItems.map((item, idx) => {
                  const isActivity = item.type === 'activity';
                  const isTransfer = item.type === 'transfer';
                  const checkInDate = item.checkIn ? new Date(item.checkIn) : new Date();
                  const checkOutDate = item.checkOut ? new Date(item.checkOut) : new Date();
                  const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
                  const itemImg = item.thumbnail || item.image || (item.images && item.images[0]?.path ? `https://photos.hotelbeds.com/giata/original/${item.images[0].path.replace(/^\/+/, '')}` : "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg");

                  return (
                    <div key={idx} className="p-4 sm:p-5 rounded-2xl bento-card border-0 bg-slate-50/70 space-y-3 shadow-xs text-left">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={itemImg}
                          alt=""
                          className="w-20 h-20 rounded-xl object-cover shrink-0 border-0"
                          onError={(e) => { e.target.src = "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg"; }}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {isActivity ? 'Selected Experience' : isTransfer ? 'Selected Transfer' : 'Selected Property'}
                          </span>
                          <h3 className="text-base font-extrabold text-gray-900 mt-1 truncate">
                            {isActivity ? item.name : isTransfer ? (item.vehicle || item.name) : item.hotelName}
                          </h3>
                          {item.location && <p className="text-xs text-gray-500 truncate">{item.location}</p>}
                          <div className="flex items-center gap-2 text-xs text-gray-700 font-semibold mt-1 flex-wrap">
                            <span>
                              {checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ({nights} {nights === 1 ? 'night' : 'nights'})
                            </span>
                            {!isActivity && !isTransfer && item.roomName && (
                              <>
                                <span>·</span>
                                <span className="text-blue-600 truncate">{item.roomName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between text-xs text-gray-600 flex-wrap gap-2">
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          {item.rateClass === 'NRF' ? 'Non-refundable rate' : 'Free Cancellation Available'}
                        </span>
                        <span className="font-semibold text-gray-800">
                          {item.adults || 2} Adults{item.children > 0 ? `, ${item.children} Children` : ''} · 1 Room
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Order 3: Passenger / Primary Guest Information */}
              <div className="order-2 lg:order-none space-y-5">
                {!user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-blue-900">Sign in for faster checkout</h3>
                        <p className="text-xs text-blue-700 mt-0.5">Save your information and track your bookings</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAuthModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Guest Information Form */}
                {renderBillingForm()}
              </div>

              {/* Mobile Order 6: Teli Trip Guarantee & Cancellation Terms */}
              <div className="order-5 lg:order-none p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Teli Trip Guarantee & Cancellation Terms</span>
                </div>
                <ul className="text-[11px] text-blue-800 space-y-1 list-disc list-inside">
                  <li>Guaranteed room reservation with official Bedsonline wholesale booking voucher.</li>
                  <li>100% full refund on eligible refundable rates when cancelled before deadline.</li>
                  <li>No hidden booking surcharges — transparent currency exchange.</li>
                </ul>
              </div>
            </div>

            {/* Right 5 Columns on Desktop: Sticky Sidebar */}
            <div className="contents lg:block lg:col-span-5 lg:space-y-4 lg:sticky lg:top-24">
              {/* Mobile Order 4: Fare Breakdown & Taxes */}
              <div className="order-3 lg:order-none">
                {renderOrderSummary()}
              </div>

              {/* Mobile Order 5: Payment Options */}
              <div className="order-4 lg:order-none">
                {renderPaymentBox()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expired Hold Modal (Point 15) */}
      {isHoldExpired && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-gray-900">Booking Hold Expired</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Your 15-minute price and room availability hold has expired. The cart has been cleared to prevent bookings on expired supplier rates.
            </p>
            <button
              onClick={() => navigate('/home')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-md"
            >
              Search Stays Again
            </button>
          </div>
        </div>
      )}

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