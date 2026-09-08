const bookingModel = require('../models/booking.model');
const paymentModel = require('../models/payment.model');
const ApiResponse = require('../utils/response.util');
const DateUtil = require('../utils/date.util');
const { asyncErrorHandler } = require('../middlewares/errorHandler.middleware');
const notificationService = require('../services/notification.service');
const { addLog } = require('../services/certificationLogger');
const { getMTLSAgent } = require('../config/mtls.config');
const { getHotelContent } = require('../services/hotelbeds.content.service');
const crypto = require('crypto');
const fetch = require('node-fetch');
// Hotelbeds API configuration
const HOTELBEDS_API_KEY = process.env.HOTELBEDS_API_KEY;
const HOTELBEDS_SECRET = process.env.HOTELBEDS_SECRET;
const HOTELBEDS_BASE_URL = process.env.HOTELBEDS_BASE_URL || (
  (process.env.HOTELBEDS_MTLS_CERT || process.env.HOTELBEDS_MTLS_CERT_PATH)
    ? 'https://api-mtls.test.hotelbeds.com'
    : 'https://api.test.hotelbeds.com'
);

// Generate signature for Hotelbeds API
function generateHotelbedsSignature(apiKey, secret, timestamp) {
    const stringToSign = apiKey + secret + timestamp;
    return crypto.createHash('sha256').update(stringToSign).digest('hex');
}

// Call Hotelbeds Booking API
async function confirmHotelbedsBooking(bookingData, rateKey) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateHotelbedsSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

    // Build paxes array for all guests
    const paxes = [];
    const adults = bookingData.guestInfo.totalGuests.adults || 1;
    const children = bookingData.guestInfo.totalGuests.children || 0;

    // Add all adults
    for (let i = 0; i < adults; i++) {
        paxes.push({
            roomId: 1,
            type: "AD",
            name: i === 0 ? bookingData.guestInfo.primaryGuest.firstName : "Adult",
            surname: i === 0 ? bookingData.guestInfo.primaryGuest.lastName : `Guest${i + 1}`
        });
    }

    // Add all children with ages
    if (children > 0 && bookingData.childAges) {
        for (let i = 0; i < children; i++) {
            paxes.push({
                roomId: 1,
                type: "CH",
                age: bookingData.childAges[i] || 10,
                name: "Child",
                surname: `Guest${i + 1}`
            });
        }
    }

    const hotelbedsRequest = {
        holder: {
            name: bookingData.guestInfo.primaryGuest.firstName,
            surname: bookingData.guestInfo.primaryGuest.lastName
        },
        rooms: [{
            rateKey: rateKey,
            paxes: paxes
        }],
        clientReference: bookingData.bookingReference,
        remark: bookingData.specialRequests || "",
        tolerance: 2.00,
        // ✅ MANDATORY: Source marker for distribution management
        source: {
            channel: 'B2C',
            device: 'WEB',
            deviceInfo: 'TeleTrip Web Application',
            sourceMarket: 'PK'
        }
    };

    // ✅ MANDATORY: Use MTLS agent for booking flow
    const agent = getMTLSAgent();
    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Api-key': HOTELBEDS_API_KEY,
            'X-Signature': signature,
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip'
        },
        body: JSON.stringify(hotelbedsRequest)
    };
    if (agent) fetchOptions.agent = agent;

    const response = await fetch(`${HOTELBEDS_BASE_URL}/hotel-api/1.0/bookings`, fetchOptions);
    const responseText = await response.text();
    const responseData = responseText ? JSON.parse(responseText) : null;

    // Log for certification
    addLog({
      step: 'Booking',
      request: {
        method: 'POST',
        url: `${HOTELBEDS_BASE_URL}/hotel-api/1.0/bookings`,
        headers: { 'Content-Type': 'application/json', 'Api-key': HOTELBEDS_API_KEY, 'X-Signature': signature, 'Accept': 'application/json' },
        body: hotelbedsRequest
      },
      response: {
        status: response.status,
        body: responseData
      }
    });

    if (!response.ok) {
        throw new Error(`Hotelbeds booking failed: ${responseText}`);
    }

    return responseData;

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hotelbeds booking failed: ${errorText}`);
    }

    return await response.json();
}

// Create booking - WITH HOTELBEDS API INTEGRATION
module.exports.createBooking = asyncErrorHandler(async (req, res) => {
  const {
    hotelName,
    roomName,
    location,
    checkIn,
    checkOut,
    guests,
    children = 0,
    childAges = [],
    totalAmount,
    boardType = 'Room Only',
    rateClass = 'NOR',
    rateKey,
    specialRequests,
    items = []
  } = req.body;

  // Validate rateKey
  if (!rateKey) {
    return ApiResponse.badRequest(res, 'rateKey is required for booking');
  }

  // Get user ID from JWT token (already available in req.user)
  const userId = req.user._id;

  // Calculate nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  // Create booking data matching your schema structure
  const bookingData = {
    // Required fields
    user: userId,                    // ✅ Correct field name
    bookingType: 'hotel',           // ✅ Required field
    bookingReference: generateBookingReference('hotel'),
    bookingId: undefined,            // ✅ Will be auto-generated if not provided
     // ✅ Will be auto-generated if not provided
    
    // Status 
    status: 'pending',
    
    // Pricing structure (required)
    pricing: {
      basePrice: totalAmount,       // ✅ Required field
      totalAmount: totalAmount,     // ✅ Required field
      currency: 'PKR',
      taxes: 0,
      fees: 0,
      discounts: 0
    },
    
    // Hotel booking details
    hotelBooking: {
      hotelName: hotelName,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights: nights,
      rooms: [{
        roomName: roomName,
        boardName: boardType,
        rateClass: rateClass,
        adults: guests || 1,
        children: children,
        childAges: childAges,
        netPrice: totalAmount,
        sellingPrice: totalAmount
      }],
      hotelAddress: {
        city: location ? location.split(',')[0] : '',
        country: location ? location.split(',')[1] : ''
      }
    },
    
    // Guest information
    guestInfo: {
      primaryGuest: {
        firstName: req.user.fullname?.firstname || req.user.email.split('@')[0],
        lastName: req.user.fullname?.lastname || '',
        email: req.user.email,
        phone: req.user.phone || ''
      },
      totalGuests: {
        adults: guests || 1,
        children: children,
        infants: 0
      }
    },
    
    // Store rateKey and special requests
    rateKey: rateKey,
    specialRequests: specialRequests,
    
    // Payment information
    payment: {
      status: 'pending',
      method: null,
      paidAmount: 0
    },
    
    // Travel dates
    travelDates: {
      departureDate: checkInDate,
      returnDate: checkOutDate,
      duration: nights
    },
    
    // Source tracking
    source: {
      platform: 'web'
    }
  };

  try {
    // ⚠️ STEP 1: Call Hotelbeds Booking API
    console.log('📞 Calling Hotelbeds Booking API...');
    const hotelbedsResponse = await confirmHotelbedsBooking(bookingData, rateKey);
    
    // ⚠️ STEP 2: Store Hotelbeds booking reference and certification data
    const hbBooking = hotelbedsResponse.booking;
    const hbHotel = hbBooking.hotel || {};
    const hbSupplier = hbHotel.supplier || hbBooking.supplier || {};
    const hbInvoice = hbBooking.invoiceCompany || {};
    const hbRooms = hbHotel.rooms || [];
    const hbRate = hbRooms[0]?.rates?.[0] || {};
    const hbPaxes = hbRooms[0]?.paxes || [];
    const hbChildAges = hbPaxes.filter(p => p.type === 'CH').map(p => p.age);
    
    bookingData.hotelbedsReference = hbBooking.reference;
    bookingData.status = 'confirmed';
    bookingData.pricing.currency = hbBooking.currency || 'EUR';
    
    // Extract certification-required fields from Hotelbeds response
    bookingData.hotelBooking.hotelCode = hbHotel.code || null;
    bookingData.hotelBooking.categoryCode = hbHotel.categoryCode || null;
    bookingData.hotelBooking.categoryName = hbHotel.categoryName || null;
    bookingData.hotelBooking.destinationCode = hbHotel.destinationCode || null;
    bookingData.hotelBooking.destinationName = hbHotel.destinationName || null;
    bookingData.hotelBooking.zoneName = hbHotel.zoneName || null;
    bookingData.hotelBooking.latitude = hbHotel.latitude || null;
    bookingData.hotelBooking.longitude = hbHotel.longitude || null;
    bookingData.hotelBooking.confirmationNumber = hbBooking.reference || null;
    bookingData.hotelBooking.currency = hbBooking.currency || 'EUR';

    // ✅ MANDATORY: Fetch hotel phone from Content API for voucher display
    try {
        const hotelContent = await getHotelContent(hbHotel.code);
        if (hotelContent && hotelContent.phones && hotelContent.phones.length > 0) {
            const phoneNumber = hotelContent.phones[0].phoneNumber;
            bookingData.hotelBooking.hotelPhone = phoneNumber;
            console.log('📞 Hotel phone fetched for voucher:', phoneNumber);
        }
        // ✅ MANDATORY: Store paid facilities (hotel + room) for voucher display
        const allPaidFacilities = [
            ...(hotelContent?.paidFacilities || []),
            ...(hotelContent?.roomPaidFacilities || [])
        ];
        if (allPaidFacilities.length > 0) {
            bookingData.hotelBooking.paidFacilities = allPaidFacilities;
            console.log('💰 Paid facilities stored for voucher:', allPaidFacilities.length);
        }
    } catch (phoneErr) {
        console.warn('⚠️ Could not fetch hotel content for voucher:', phoneErr.message);
    }
    try {
        const hotelContent = await getHotelContent(hbHotel.code);
        if (hotelContent && hotelContent.phones && hotelContent.phones.length > 0) {
            const phoneNumber = hotelContent.phones[0].phoneNumber;
            bookingData.hotelBooking.hotelPhone = phoneNumber;
            console.log('📞 Hotel phone fetched for voucher:', phoneNumber);
        }
    } catch (phoneErr) {
        console.warn('⚠️ Could not fetch hotel phone for voucher:', phoneErr.message);
    }
    bookingData.hotelBooking.totalNet = hbBooking.totalNet || null;
    bookingData.hotelBooking.supplier = hbSupplier ? {
      name: hbSupplier.name,
      vatNumber: hbSupplier.vatNumber
    } : null;
    bookingData.hotelBooking.invoiceCompany = hbInvoice ? {
      code: hbInvoice.code,
      company: hbInvoice.company,
      registrationNumber: hbInvoice.registrationNumber
    } : null;
    
    // Update room details from actual Hotelbeds response
    if (hbRooms.length > 0) {
      bookingData.hotelBooking.rooms = hbRooms.map((hbRoom, idx) => {
        const roomRate = hbRoom.rates?.[0] || {};
        const roomPaxes = hbRoom.paxes || [];
        const roomChildAges = roomPaxes.filter(p => p.type === 'CH').map(p => p.age);
        return {
          roomName: hbRoom.name || roomName,
          roomCode: hbRoom.code || null,
          boardCode: roomRate.boardCode || null,
          boardName: roomRate.boardName || boardType,
          rateComments: roomRate.rateComments || null,
          adults: roomRate.adults || roomPaxes.filter(p => p.type === 'AD').length || guests || 1,
          children: roomRate.children || roomPaxes.filter(p => p.type === 'CH').length || children,
          childAges: roomChildAges.length > 0 ? roomChildAges : childAges,
          netPrice: parseFloat(roomRate.net) || totalAmount,
          sellingPrice: parseFloat(roomRate.net) || totalAmount,
          paymentType: roomRate.paymentType || null,
          cancellationPolicies: roomRate.cancellationPolicies || [],
          taxes: roomRate.taxes || null,
          rateClass: roomRate.rateClass || rateClass,
          paxes: roomPaxes
        };
      });
    }
    
    // Update guest info with actual paxes from Hotelbeds
    bookingData.guestInfo.totalGuests.children = hbPaxes.filter(p => p.type === 'CH').length || children;
    
    bookingData.backup = {
      hotelbedsResponse: hotelbedsResponse
    };
    
    // STEP 3: Save to local database
    const booking = await bookingModel.create(bookingData);
    
    // Send confirmation notification (optional)
    try {
      await notificationService.sendBookingNotification(
        userId, 
        'bookingCreated', 
        { ...booking.toObject(), userDetails: req.user }
      );
    } catch (notificationError) {
      console.log('Notification failed:', notificationError.message);
      // Don't fail the booking creation if notification fails
    }

    return ApiResponse.created(res, {
      booking,
      hotelbedsReference: hotelbedsResponse.booking.reference,
      voucher: hotelbedsResponse.booking
    }, 'Booking confirmed successfully');
    
  } catch (error) {
    console.error('Booking creation error:', error);
    
    // If Hotelbeds booking fails, don't save to database
    if (error.message && error.message.includes('Hotelbeds')) {
      return ApiResponse.error(res, 'Booking failed: ' + error.message, 500);
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return ApiResponse.badRequest(res, 'Validation failed', validationErrors);
    }
    
    throw error; // Let asyncErrorHandler handle other errors
  }
});

// Create activity booking
module.exports.createActivityBooking = asyncErrorHandler(async (req, res) => {
  const { holder, activities, clientReference } = req.body;
  const userId = req.user._id;

  if (!holder || !activities || activities.length === 0) {
    return ApiResponse.badRequest(res, 'Holder info and activities are required');
  }

  const bookingReference = generateBookingReference('activity');
  const totalAmount = activities.reduce((sum, act) => sum + (act.price || 0), 0);

  const bookingData = {
    user: userId,
    bookingType: 'activity',
    bookingReference,
    status: 'pending',
    
    pricing: {
      basePrice: totalAmount,
      totalAmount,
      currency: activities[0]?.currency || 'AED',
      taxes: 0,
      fees: 0,
      discounts: 0
    },
    
    guestInfo: {
      primaryGuest: {
        firstName: holder.name?.split(' ')[0] || holder.name,
        lastName: holder.name?.split(' ').slice(1).join(' ') || '',
        email: holder.email,
        phone: holder.phone
      },
      totalGuests: {
        adults: activities.reduce((sum, act) => sum + (act.paxes?.length || 1), 0),
        children: 0,
        infants: 0
      }
    },
    
    payment: {
      status: 'pending',
      method: null,
      paidAmount: 0
    },
    
    travelDates: {
      departureDate: new Date(activities[0]?.date),
      returnDate: new Date(activities[activities.length - 1]?.date),
      duration: 1
    },
    
    source: {
      platform: 'web'
    },
    
    backup: {
      originalBookingData: {
        holder,
        activities,
        clientReference
      }
    }
  };

  try {
    const booking = await bookingModel.create(bookingData);
    
    try {
      await notificationService.sendBookingNotification(
        userId,
        'bookingCreated',
        { ...booking.toObject(), userDetails: req.user }
      );
    } catch (notificationError) {
      console.log('Notification failed:', notificationError.message);
    }

    return ApiResponse.created(res, {
      booking,
      bookingReference: booking.bookingReference,
      status: 'pending',
      voucher: {
        reference: booking.bookingReference,
        activities: activities.map(a => ({
          code: a.code,
          name: a.name,
          date: a.date,
          paxes: a.paxes
        }))
      }
    }, 'Activity booking created successfully');
    
  } catch (error) {
    console.error('Activity booking creation error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return ApiResponse.badRequest(res, 'Validation failed', validationErrors);
    }
    
    throw error;
  }
});

// Get booking by reference
module.exports.getBookingByReference = asyncErrorHandler(async (req, res) => {
  const { bookingReference } = req.params;
  const userId = req.user._id;

  const booking = await bookingModel.findOne({
    bookingReference,
    user: userId
  }).lean();

  if (!booking) {
    return ApiResponse.notFound(res, 'Booking not found');
  }

  return ApiResponse.success(res, booking, 'Booking retrieved successfully');
});

// Helper function to generate booking reference
function generateBookingReference(type) {
  const prefix = type.charAt(0).toUpperCase();
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// Update other methods to use correct field names
module.exports.getUserBookings = asyncErrorHandler(async (req, res) => {
  const userId = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;

  const query = { user: userId }; // ✅ Changed from 'userId' to 'user'
  if (status) query.status = status;

  const bookings = await bookingModel
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  // Add computed status based on dates
  const bookingsWithStatus = bookings.map(booking => ({
    ...booking,
    computedStatus: DateUtil.getBookingStatus(
      booking.hotelBooking?.checkIn, 
      booking.hotelBooking?.checkOut, 
      booking.status
    ),
    daysToCheckIn: booking.hotelBooking?.checkIn ? 
      DateUtil.getDaysBetween(new Date(), booking.hotelBooking.checkIn) : null,
    duration: booking.hotelBooking?.checkIn && booking.hotelBooking?.checkOut ?
      DateUtil.getDaysBetween(booking.hotelBooking.checkIn, booking.hotelBooking.checkOut) : null
  }));

  const total = await bookingModel.countDocuments(query);

  return ApiResponse.paginated(res, bookingsWithStatus, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit)
  });
});

module.exports.getBookingDetails = asyncErrorHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;

  const booking = await bookingModel.findOne({
    $or: [{ _id: bookingId }, { bookingReference: bookingId }], // ✅ Changed to bookingReference
    user: userId // ✅ Changed from userId to user
  }).lean();

  if (!booking) {
    return ApiResponse.notFound(res, 'Booking not found');
  }

  // Get associated payments
  const payments = await paymentModel.find({ bookingId: booking._id });

  // Add computed fields
  const bookingWithDetails = {
    ...booking,
    computedStatus: DateUtil.getBookingStatus(
      booking.hotelBooking?.checkIn, 
      booking.hotelBooking?.checkOut, 
      booking.status
    ),
    daysToCheckIn: booking.hotelBooking?.checkIn ?
      DateUtil.getDaysBetween(new Date(), booking.hotelBooking.checkIn) : null,
    duration: booking.hotelBooking?.checkIn && booking.hotelBooking?.checkOut ?
      DateUtil.getDaysBetween(booking.hotelBooking.checkIn, booking.hotelBooking.checkOut) : null,
    payments,
    canCancel: booking.status !== 'cancelled' && booking.status !== 'completed' && 
               booking.hotelBooking?.checkIn && DateUtil.isUpcoming(booking.hotelBooking.checkIn)
  };

  return ApiResponse.success(res, bookingWithDetails, 'Booking details retrieved');
});

module.exports.updateBooking = asyncErrorHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;
  const updates = req.body;

  const booking = await bookingModel.findOne({
    $or: [{ _id: bookingId }, { bookingReference: bookingId }], // ✅ Changed to bookingReference
    user: userId // ✅ Changed from userId to user
  });

  if (!booking) {
    return ApiResponse.notFound(res, 'Booking not found');
  }

  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return ApiResponse.badRequest(res, 'Cannot update cancelled or completed booking');
  }

  // Check if check-in date is not in the past
  const newCheckIn = updates.checkIn || booking.hotelBooking?.checkIn;
  if (newCheckIn && DateUtil.isPast(newCheckIn)) {
    return ApiResponse.badRequest(res, 'Cannot update to a past date');
  }

  // Update booking - handle nested structure
  if (updates.checkIn || updates.checkOut || updates.hotelName || updates.roomName) {
    if (!booking.hotelBooking) booking.hotelBooking = {};
    
    if (updates.checkIn) booking.hotelBooking.checkIn = new Date(updates.checkIn);
    if (updates.checkOut) booking.hotelBooking.checkOut = new Date(updates.checkOut);
    if (updates.hotelName) booking.hotelBooking.hotelName = updates.hotelName;
    if (updates.roomName && booking.hotelBooking.rooms && booking.hotelBooking.rooms[0]) {
      booking.hotelBooking.rooms[0].roomName = updates.roomName;
    }
  }

  if (updates.totalAmount) {
    if (!booking.pricing) booking.pricing = {};
    booking.pricing.totalAmount = updates.totalAmount;
    booking.pricing.basePrice = updates.totalAmount;
  }

  await booking.save();

  return ApiResponse.success(res, booking, 'Booking updated successfully');
});

module.exports.cancelBooking = asyncErrorHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;

  const booking = await bookingModel.findOne({
    $or: [{ _id: bookingId }, { bookingReference: bookingId }],
    user: userId
  });

  if (!booking) {
    return ApiResponse.notFound(res, 'Booking not found');
  }

  if (booking.status === 'cancelled') {
    return ApiResponse.badRequest(res, 'Booking is already cancelled');
  }

  if (booking.status === 'completed') {
    return ApiResponse.badRequest(res, 'Cannot cancel completed booking');
  }

  // ⚠️ STEP 1: Cancel with Hotelbeds API
  let hotelbedsResponse = null;
  const hotelbedsReference = booking.backup?.hotelbedsBookingData?.booking?.reference
    || booking.backup?.hotelbedsBookingData?.reference
    || booking.hotelBooking?.confirmationNumber;

  if (hotelbedsReference) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = generateHotelbedsSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

      const url = `${HOTELBEDS_BASE_URL}/hotel-api/1.0/bookings/${hotelbedsReference}?cancellationFlag=CANCELLATION`;
      
      // ✅ MANDATORY: Use MTLS agent for cancellation flow
      const agent = getMTLSAgent();
      const fetchOptions = {
        method: 'DELETE',
        headers: {
          'Api-key': HOTELBEDS_API_KEY,
          'X-Signature': signature,
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip'
        }
      };
      if (agent) fetchOptions.agent = agent;
      
      const response = await fetch(url, fetchOptions);

      const responseText = await response.text();
      const responseBody = responseText ? JSON.parse(responseText) : null;

      // Log for certification
      addLog({
        step: 'Cancellation',
        request: {
          method: 'DELETE',
          url,
          headers: { 'Api-key': HOTELBEDS_API_KEY, 'X-Signature': signature, 'Accept': 'application/json' }
        },
        response: {
          status: response.status,
          body: responseBody
        }
      });

      if (!response.ok) {
        console.error('Hotelbeds cancellation failed:', responseText);
        return ApiResponse.error(res, 'Failed to cancel booking with hotel provider', 500);
      }

      hotelbedsResponse = responseBody;
      console.log('✅ Hotelbeds booking cancelled:', hotelbedsResponse);
    } catch (error) {
      console.error('Hotelbeds cancellation error:', error);
      return ApiResponse.error(res, 'Failed to cancel booking with hotel provider', 500);
    }
  }

  // STEP 2: Calculate cancellation fee from Hotelbeds response or local policy
  const cancellationFee = hotelbedsResponse?.booking?.totalNet || calculateCancellationFee(booking);
  const refundAmount = booking.pricing.totalAmount - cancellationFee;

  // STEP 3: Update local booking status
  booking.status = 'cancelled';
  if (!booking.cancellation) booking.cancellation = {};
  booking.cancellation.cancelledAt = new Date();
  booking.cancellation.cancelledBy = userId;
  booking.cancellation.cancellationFee = cancellationFee;
  booking.cancellation.refundAmount = refundAmount;
  booking.cancellation.cancellationReference = hotelbedsResponse?.booking?.cancellationReference;
  
  await booking.save();

  // Process refund if payment was made
  if (booking.payment && booking.payment.status === 'completed') {
    const payment = await paymentModel.findOne({ 
      bookingId: booking._id, 
      status: 'completed' 
    });
    
    if (payment) {
      await paymentModel.create({
        userId,
        bookingId: booking._id,
        paymentId: `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: -refundAmount,
        method: 'Refund',
        status: 'completed',
        transactionId: `refund_${payment.transactionId}`,
        currency: payment.currency
      });

      payment.status = 'refunded'; 
      await payment.save();

      booking.payment.status = 'refunded';
      await booking.save();
    }
  }

  try {
    await notificationService.sendBookingNotification(
      userId, 
      'bookingCancellation', 
      { ...booking.toObject(), userDetails: req.user }
    );
  } catch (notificationError) {
    console.log('Notification failed:', notificationError.message);
  }

  return ApiResponse.success(res, {
    booking,
    cancellationFee,
    refundAmount
  }, 'Booking cancelled successfully');
});

// Calculate cancellation fee
function calculateCancellationFee(booking) {
  const now = new Date();
  const departureDate = booking.travelDates?.departureDate;
  
  if (!departureDate) return 0;
  
  const daysUntilDeparture = Math.ceil((new Date(departureDate) - now) / (1000 * 60 * 60 * 24));
  const totalAmount = booking.pricing.totalAmount;
  
  // Cancellation policy: 
  // - More than 7 days: 10% fee
  // - 3-7 days: 25% fee
  // - 1-2 days: 50% fee
  // - Less than 24 hours: 100% fee
  
  if (daysUntilDeparture > 7) return totalAmount * 0.1;
  if (daysUntilDeparture >= 3) return totalAmount * 0.25;
  if (daysUntilDeparture >= 1) return totalAmount * 0.5;
  return totalAmount;
}

// Generate voucher
module.exports.generateVoucher = asyncErrorHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;

  const booking = await bookingModel.findOne({
    $or: [{ _id: bookingId }, { bookingReference: bookingId }],
    user: userId
  }).populate('user', 'fullname email phone');

  if (!booking) {
    return ApiResponse.notFound(res, 'Booking not found');
  }

  if (booking.status !== 'confirmed' && booking.status !== 'completed') {
    return ApiResponse.badRequest(res, 'Voucher only available for confirmed bookings');
  }

  const voucher = {
    bookingReference: booking.bookingReference,
    bookingType: booking.bookingType,
    status: booking.status,
    guestName: `${booking.guestInfo?.primaryGuest?.firstName || ''} ${booking.guestInfo?.primaryGuest?.lastName || ''}`.trim(),
    email: booking.guestInfo?.primaryGuest?.email,
    phone: booking.guestInfo?.primaryGuest?.phone,
    activities: booking.backup?.originalBookingData?.activities || [],
    travelDates: booking.travelDates,
    totalAmount: booking.pricing.totalAmount,
    currency: booking.pricing.currency,
    generatedAt: new Date()
  };

  return ApiResponse.success(res, voucher, 'Voucher generated successfully');
});

// List bookings with filters
module.exports.listBookings = asyncErrorHandler(async (req, res) => {
  const userId = req.user._id;
  const { from, to, startDate, endDate, status, page = 1, limit = 10 } = req.query;

  const query = { user: userId };
  
  if (from || to) {
    query['travelDates.departureDate'] = {};
    if (from) query['travelDates.departureDate'].$gte = new Date(from);
    if (to) query['travelDates.departureDate'].$lte = new Date(to);
  }
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  if (status) query.status = status;

  const bookings = await bookingModel
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await bookingModel.countDocuments(query);

  return ApiResponse.paginated(res, bookings, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit)
  });
});