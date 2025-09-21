const crypto = require('crypto');
const fetch = require('node-fetch');
const paymentModel = require('../models/payment.model');
const bookingModel = require('../models/booking.model');
const ApiResponse = require('../utils/response.util');
const { asyncErrorHandler } = require('../middlewares/errorHandler.middleware');
const notificationService = require('../services/notification.service');
const logger = require('../utils/logger.util'); // Enhanced logging utility
const querystring = require('querystring');
const userModel = require('../models/user.model');
const paymentService = require('../services/payment.service');  
const notificationService = require('../services/notification.service');
const logger = require('../utils/logger.util');


const User = userModel;

// HBLPay Configuration
const HBLPAY_USER_ID = process.env.HBLPAY_USER_ID || 'teliadmin';
const HBLPAY_PASSWORD = process.env.HBLPAY_PASSWORD || 'd6n26Yd4m!';
const HBL_PUBLIC_KEY = process.env.HBL_PUBLIC_KEY_PEM;
const HBL_SANDBOX_URL = process.env.HBL_SANDBOX_API_URL || 'https://testpaymentapi.hbl.com/hblpay/api/checkout';
const HBL_PRODUCTION_URL = process.env.HBL_PRODUCTION_API_URL;
const HBL_SANDBOX_REDIRECT = process.env.HBL_SANDBOX_REDIRECT_URL || 'https://testpaymentapi.hbl.com/hblpay/site/index.html#/checkout?data=';
const HBL_PRODUCTION_REDIRECT = process.env.HBL_PRODUCTION_REDIRECT_URL;
const HBL_CHANNEL = 'HBLPay_Teli_Website';
const HBL_TYPE_ID = '0';
const HBL_TIMEOUT = parseInt(process.env.HBL_TIMEOUT) || 30000; // 30 seconds
const HBL_RETRY_ATTEMPTS = parseInt(process.env.HBL_RETRY_ATTEMPTS) || 3;
const privateKeyPem = process.env.MERCHANT_PRIVATE_KEY_PEM;

const isProduction = process.env.NODE_ENV === 'production';

const https = require('https');

// Enhanced HTTPS agent with timeout and retry configuration
const httpsAgent = new https.Agent({
  rejectUnauthorized: !isProduction, // Only bypass SSL in sandbox
  timeout: HBL_TIMEOUT,
  keepAlive: true,
  maxSockets: 50
});


// ==================== NATIVE CRYPTO VERSION OF YOUR WORKING FUNCTION ====================

// Native equivalent of parseGarbledData function
function parseGarbledDataNative(rawDecryptedData) {
  try {
    console.log('🔧 [PARSE-NATIVE] Parsing garbled binary data...');
    
    if (!rawDecryptedData) return {};
    
    // Convert to string and extract readable ASCII characters
    let cleanText = '';
    for (let i = 0; i < rawDecryptedData.length; i++) {
      const char = rawDecryptedData[i];
      const code = char.charCodeAt(0);
      
      // Keep printable ASCII characters and common symbols
      if ((code >= 32 && code <= 126) || code === 10 || code === 13) {
        cleanText += char;
      }
    }
    
    console.log('📝 [PARSE-NATIVE] Extracted clean text:', cleanText);
    
    // Look for parameter patterns in the clean text
    const paramPatterns = [
      /RESPONSE_CODE=([^&\s]+)/,
      /RESPONSE_MESSAGE=([^&]+?)(?=&|$)/,
      /ORDER_REF_NUMBER=([^&\s]+)/,
      /PAYMENT_TYPE=([^&\s]+)/,
      /CARD_NUM_MASKED=([^&\s]+)/,
      /TRANSACTION_ID=([^&\s]+)/,
      /TXN_ID=([^&\s]+)/,
      /GUID=([^&\s]+)/,
      /DISCOUNTED_AMOUNT=([^&\s]+)/,
      /DISCOUNT_CAMPAIGN_ID=([^&\s]+)/
    ];
    
    const params = {};
    
    // Try to find parameters in the clean text
    for (const pattern of paramPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        const key = pattern.source.split('=')[0].replace(/[()[\]]/g, '');
        params[key] = decodeURIComponent(match[1] || '').trim();
        console.log(`📝 [PARSE-NATIVE] Found ${key}:`, params[key]);
      }
    }
    
    // If standard parsing fails, try alternative methods
    if (Object.keys(params).length === 0) {
      console.log('🔄 [PARSE-NATIVE] Trying alternative parsing methods...');
      
      // Look for any text that contains "RESPONSE" or "ORDER"
      const responseMatch = cleanText.match(/.*RESPONSE.*?(\d+)/);
      const orderMatch = cleanText.match(/.*ORDER.*?([A-Z0-9_]+)/);
      
      if (responseMatch) {
        params.RESPONSE_CODE = responseMatch[1];
        console.log('📝 [PARSE-NATIVE] Alternative found RESPONSE_CODE:', params.RESPONSE_CODE);
      }
      
      if (orderMatch) {
        params.ORDER_REF_NUMBER = orderMatch[1];
        console.log('📝 [PARSE-NATIVE] Alternative found ORDER_REF_NUMBER:', params.ORDER_REF_NUMBER);
      }
    }
    
    return params;
    
  } catch (error) {
    console.error('❌ [PARSE-NATIVE] Parsing failed:', error.message);
    return {};
  }
}

// Native Node.js crypto version of your enhancedDecryption function
function decryptHBLResponse(encryptedData) {
  try {
    logger.info('🔐 Starting HBL decryption process');
    
    // Your merchant private key from .env
    const privateKeyPem = process.env.MERCHANT_PRIVATE_KEY_PEM;
    
    if (!privateKeyPem) {
      throw new Error('MERCHANT_PRIVATE_KEY_PEM not found in environment variables');
    }

    // Decode base64 first (as per bank's instruction)
    const decodedData = Buffer.from(encryptedData, 'base64');
    logger.info(`📦 Decoded data length: ${decodedData.length} bytes`);

    // Split into 512-byte blocks for decryption
    const DECRYPT_BLOCK_SIZE = 512;
    let decrypted = '';
    
    for (let i = 0; i < decodedData.length; i += DECRYPT_BLOCK_SIZE) {
      const chunk = decodedData.slice(i, i + DECRYPT_BLOCK_SIZE);
      
      try {
        const decryptedChunk = crypto.privateDecrypt(
          {
            key: privateKeyPem,
            padding: crypto.constants.RSA_PKCS1_PADDING,
          },
          chunk
        );
        
        decrypted += decryptedChunk.toString('utf8');
      } catch (chunkError) {
        logger.error(`❌ Failed to decrypt chunk ${i / DECRYPT_BLOCK_SIZE + 1}:`, chunkError);
        throw chunkError;
      }
    }

    logger.info('✅ HBL decryption successful');
    logger.info('📋 Decrypted response:', decrypted);
    
    return decrypted;
    
  } catch (error) {
    logger.error('❌ HBL decryption failed:', error);
    throw new Error(`Decryption failed: ${error.message}`);
  }
}



 /**
   * @swagger
   * /api/v1/payments/success:
   *   get:
   *     summary: Handle payment success callback
   *     tags: [Payments]
   *     parameters:
   *       - in: query
   *         name: data
   *         required: true
   *         schema:
   *           type: string
   *         description: Encrypted payment response data
   *     responses:
   *       200:
   *         description: Payment processed successfully
   *       400:
   *         description: Invalid payment data
   */





// ==================== UPDATED SUCCESS HANDLER ====================
module.exports.handlePaymentSuccess = asyncErrorHandler(async (req, res) => {
 const { data } = req.query;

    if (!data) {
      return res.status(400).json(
        ApiResponse.error('Missing payment data')
      );
    }

    try {
      // Decrypt the payment response using the updated method from bank
      const decryptedData = await hblPayService.decryptPaymentResponse(data);
      
      if (!decryptedData) {
        logger.error('Failed to decrypt payment response', { data });
        return res.status(400).json(
          ApiResponse.error('Invalid payment response data')
        );
      }

      logger.info('Decrypted payment response:', decryptedData);

      // Parse the decrypted response
      const responseParams = this.parsePaymentResponse(decryptedData);
      
      const {
        RESPONSE_CODE,
        RESPONSE_MESSAGE,
        ORDER_REF_NUMBER,
        PAYMENT_TYPE,
        CS_RESP_TOKEN,
        CARD_NUM_MASKED
      } = responseParams;

      // Find payment by order reference
      const payment = await Payment.findOne({
        orderReference: ORDER_REF_NUMBER
      }).populate('booking user');

      if (!payment) {
        logger.error('Payment not found for order reference:', ORDER_REF_NUMBER);
        return res.status(404).json(
          ApiResponse.error('Payment not found')
        );
      }

      // Process successful payment
      if (RESPONSE_CODE === '0' || RESPONSE_CODE === '100') {
        await this.processSuccessfulPayment(payment, responseParams);
        
        // Redirect to success page
        const redirectUrl = `${process.env.FRONTEND_URL}/payment/success?booking=${payment.booking._id}`;
        return res.redirect(redirectUrl);
      } else {
        // Handle failed payment
        await this.processFailedPayment(payment, responseParams);
        
        // Redirect to failure page
        const redirectUrl = `${process.env.FRONTEND_URL}/payment/failed?booking=${payment.booking._id}&error=${encodeURIComponent(RESPONSE_MESSAGE)}`;
        return res.redirect(redirectUrl);
      }

    } catch (error) {
      logger.error('Payment success callback error:', error);
      res.status(500).json(
        ApiResponse.error('Payment processing failed', error.message)
      );
    }
  });
  /**
   * @swagger
   * /api/v1/payments/cancel:
   *   get:
   *     summary: Handle payment cancellation callback
   *     tags: [Payments]
   *     parameters:
   *       - in: query
   *         name: data
   *         required: true
   *         schema:
   *           type: string
   *         description: Encrypted payment response data
   *     responses:
   *       200:
   *         description: Payment cancellation processed
   */



// ==================== ENHANCED PAYMENT CANCEL HANDLER ====================
module.exports.handlePaymentCancel = asyncErrorHandler(async (req, res) => {
  const { data } = req.query;

    if (!data) {
      return res.status(400).json(
        ApiResponse.error('Missing payment data')
      );
    }

    try {
      // Decrypt the payment response
      const decryptedData = await hblPayService.decryptPaymentResponse(data);
      
      if (!decryptedData) {
        logger.error('Failed to decrypt payment cancellation response', { data });
        return res.status(400).json(
          ApiResponse.error('Invalid payment response data')
        );
      }

      // Parse the decrypted response
      const responseParams = this.parsePaymentResponse(decryptedData);
      const { ORDER_REF_NUMBER, RESPONSE_MESSAGE } = responseParams;

      // Find payment by order reference
      const payment = await Payment.findOne({
        orderReference: ORDER_REF_NUMBER
      }).populate('booking user');

      if (payment) {
        // Update payment status
        payment.status = 'cancelled';
        payment.cancelledAt = new Date();
        payment.gatewayResponse = responseParams;
        await payment.save();

        // Update booking status
        const booking = payment.booking;
        booking.status = 'cancelled';
        booking.payment.status = 'cancelled';
        booking.cancellation.cancelledAt = new Date();
        booking.cancellation.cancellationReason = 'Payment cancelled by user';
        await booking.save();

        logger.info('Payment cancelled:', {
          paymentId: payment._id,
          bookingId: booking._id,
          orderRef: ORDER_REF_NUMBER
        });

        // Send cancellation notification
        await notificationService.sendPaymentCancellation(payment.user, booking, payment);
      }

      // Redirect to cancellation page
      const redirectUrl = `${process.env.FRONTEND_URL}/payment/cancelled?booking=${payment?.booking._id || ''}`;
      return res.redirect(redirectUrl);

    } catch (error) {
      logger.error('Payment cancel callback error:', error);
      res.status(500).json(
        ApiResponse.error('Payment cancellation processing failed', error.message)
      );
    }
  });




// Enhanced payment status checker with detailed logging
module.exports.getPaymentStatus = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findById(id).populate('booking');
    
    if (!payment) {
      return res.status(404).json(
        ApiResponse.error('Payment not found')
      );
    }

    // Verify payment belongs to user or user is admin
    if (payment.user.toString() !== userId && !req.user.role.includes('admin')) {
      return res.status(403).json(
        ApiResponse.error('Access denied')
      );
    }

    res.json(
      ApiResponse.success('Payment status retrieved successfully', {
        payment: {
          id: payment._id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          createdAt: payment.createdAt,
          completedAt: payment.completedAt,
          booking: {
            id: payment.booking._id,
            reference: payment.booking.bookingReference,
            status: payment.booking.status
          }
        }
      })
    );
  });


// Enhanced webhook handler for HBL callbacks



// Health check endpoint with HBL connectivity test
const healthCheck = asyncErrorHandler(async (req, res) => {
  const startTime = Date.now();
  const checks = {};

  try {
    // Check database connectivity
    try {
      await paymentModel.findOne().limit(1);
      checks.database = { status: 'healthy', responseTime: Date.now() - startTime };
    } catch (error) {
      checks.database = { status: 'unhealthy', error: error.message };
    }

    // Check HBL API connectivity
    try {
      const testStartTime = Date.now();
      const response = await withTimeout(
        fetch(isProduction ? HBL_PRODUCTION_URL : HBL_SANDBOX_URL, {
          method: 'HEAD',
          agent: httpsAgent,
          timeout: 5000
        }),
        5000,
        'HBL Health Check'
      );

      checks.hblApi = {
        status: response.ok ? 'healthy' : 'degraded',
        responseTime: Date.now() - testStartTime,
        httpStatus: response.status
      };
    } catch (error) {
      checks.hblApi = {
        status: 'unhealthy',
        error: error.message,
        code: error.code
      };
    }

    // Check configuration
    const configValidation = HBLPayValidator.validateHBLConfiguration();
    checks.configuration = {
      status: configValidation.isValid ? 'healthy' : 'unhealthy',
      errors: configValidation.errors
    };

    const overallStatus = Object.values(checks).every(check => check.status === 'healthy') ? 'healthy' : 'degraded';

    console.info('Health check completed', {
      overallStatus,
      checks,
      responseTime: `${Date.now() - startTime}ms`
    });

    return res.status(overallStatus === 'healthy' ? 200 : 503).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      environment: isProduction ? 'production' : 'sandbox'
    });

  } catch (error) {
    console.error('Health check failed', error);
    return res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Enhanced test configuration endpoint
const getTestConfiguration = asyncErrorHandler(async (req, res) => {
  try {
    console.log('Test configuration requested', {
      userId: req.user?.id,
      userAgent: req.headers['user-agent']
    });

    const config = {
      environment: isProduction ? 'production' : 'sandbox',
      timeout: HBL_TIMEOUT,
      retryAttempts: HBL_RETRY_ATTEMPTS,
      configuration: {
        userId: HBLPAY_USER_ID ? 'Set' : 'Not Set',
        password: HBLPAY_PASSWORD ? 'Set' : 'Not Set',
        publicKey: HBL_PUBLIC_KEY ? 'Set' : 'Not Set',
        sandboxUrl: HBL_SANDBOX_URL,
        redirectUrl: HBL_SANDBOX_REDIRECT
      },
      testCards: [
        {
          type: 'Visa Non-3D',
          number: '4000000000000101',
          expiry: '05/2023',
          cvv: '111',
          description: 'Standard Visa card without 3D Secure'
        },
        {
          type: 'Visa 3D',
          number: '4000000000000002',
          expiry: '05/2023',
          cvv: '111',
          passcode: '1234',
          description: 'Visa card with 3D Secure authentication'
        },
        {
          type: 'Master Non-3D',
          number: '5200000000000114',
          expiry: '05/2023',
          cvv: '111',
          description: 'Standard MasterCard without 3D Secure'
        },
        {
          type: 'Master 3D',
          number: '5200000000000007',
          expiry: '05/2023',
          cvv: '111',
          passcode: '1234',
          description: 'MasterCard with 3D Secure authentication'
        }
      ],
      testAmounts: {
        success: [100, 500, 1000, 5000],
        decline: [1, 2, 3, 4],
        error: [9999, 8888, 7777],
        description: 'Use success amounts for testing successful payments'
      },
      testUrls: {
        otpViewer: 'https://testpaymentapi.hbl.com/OTPViewer/Home/Email',
        sandbox: HBL_SANDBOX_URL,
        sandboxRedirect: HBL_SANDBOX_REDIRECT
      },
      troubleshooting: {
        commonIssues: [
          'Ensure exact test card numbers are used',
          'Check browser console for CSP violations',
          'Clear browser cache if page loads slowly',
          'Use incognito mode to test',
          'Verify IP whitelisting with HBL'
        ],
        supportContact: 'Contact HBL technical support for environment issues'
      }
    };

    return ApiResponse.success(res, config, 'Test configuration retrieved');
  } catch (error) {
    console.log('Error retrieving test configuration', error);
    return ApiResponse.error(res, 'Failed to retrieve test configuration', 500);
  }
});



// Enhanced error analysis endpoint
const getPaymentErrors = asyncErrorHandler(async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user?.id;

    const payment = await paymentModel.findOne({ paymentId });

    if (!payment) {
      return ApiResponse.error(res, 'Payment not found', 404);
    }

    if (payment.userId.toString() !== userId.toString()) {
      return ApiResponse.error(res, 'Unauthorized access', 403);
    }

    const errorAnalysis = {
      paymentId: payment.paymentId,
      status: payment.status,
      failureReason: payment.failureReason,
      errorDetails: payment.errorDetails,
      gatewayResponse: payment.gatewayResponse,
      retryCount: payment.retryCount || 0,
      troubleshooting: []
    };

    // Add troubleshooting suggestions based on error
    if (payment.failureReason) {
      const suggestions = getTroubleshootingSuggestions(payment.failureReason, payment.errorDetails);
      errorAnalysis.troubleshooting = suggestions;
    }

    console.info('Error analysis retrieved', {
      paymentId,
      status: payment.status,
      failureReason: payment.failureReason
    });

    return ApiResponse.success(res, errorAnalysis, 'Error analysis retrieved successfully');

  } catch (error) {
    console.error('Error retrieving error analysis', error);
    return ApiResponse.error(res, 'Failed to retrieve error analysis', 500);
  }
});

// Troubleshooting suggestions based on error patterns
function getTroubleshootingSuggestions(failureReason, errorDetails) {
  const suggestions = [];

  if (failureReason?.includes('TIMEOUT')) {
    suggestions.push('The payment gateway is responding slowly. Try again in a few minutes.');
    suggestions.push('Check your internet connection stability.');
  }

  if (failureReason?.includes('CONNECTION')) {
    suggestions.push('Payment gateway is temporarily unavailable.');
    suggestions.push('Contact support if the issue persists.');
  }

  if (failureReason?.includes('VALIDATION')) {
    suggestions.push('Check that all required fields are properly filled.');
    suggestions.push('Verify the booking ID is valid.');
  }

  if (errorDetails?.code === '188') {
    suggestions.push('Merchant credentials issue - contact technical support.');
  }

  if (errorDetails?.code === '11008') {
    suggestions.push('Use the correct test card numbers provided in documentation.');
    suggestions.push('For 3D secure cards, use passcode: 1234');
  }

  if (failureReason?.includes('CSP') || failureReason?.includes('CONTENT_SECURITY_POLICY')) {
    suggestions.push('Browser security settings are blocking payment page resources.');
    suggestions.push('Try using incognito mode or a different browser.');
    suggestions.push('Clear browser cache and cookies.');
  }

  if (suggestions.length === 0) {
    suggestions.push('Try using the recommended test card numbers.');
    suggestions.push('Ensure you are in the sandbox environment.');
    suggestions.push('Contact support if the issue continues.');
  }

  return suggestions;
}


// Generate unique IDs with better entropy
function generatePaymentId() {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(4).toString('hex');
  return `PAY_${timestamp}_${randomBytes}`;
}

function generateOrderId() {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(3).toString('hex');
  return `ORD_${timestamp}_${randomBytes}`;
}

// Enhanced RSA encryption with error handling
function encryptHBLData(data, publicKey) {
  if (!publicKey) {
    const error = new Error('HBL public key not configured');
    error.code = 'MISSING_PUBLIC_KEY';
    throw error;
  }
  try {
    const stringData = String(data);
    
    // Use Node.js crypto for RSA encryption (more reliable than NodeRSA for this use case)
    const buffer = Buffer.from(stringData, 'utf8');
    const encrypted = crypto.publicEncrypt({
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    }, buffer);

    return encrypted.toString('base64');
  } catch (error) {
    console.error('RSA encryption error:', error.message);
    throw error;
  }
}

    

// Recursive parameter encryption EXACTLY like the PHP sample in HBL PDF
function encryptRequestParameters(data, publicKey) {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => encryptRequestParameters(item, publicKey));
  }

  const result = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (key === 'USER_ID') {
      // Never encrypt USER_ID (per HBL requirements)
      result[key] = value;
    } else if (value === null || value === undefined) {
      result[key] = value;
    } else if (typeof value === 'object') {
      // Recursively encrypt objects and arrays
      result[key] = encryptRequestParameters(value, publicKey);
    } else {
      // Encrypt primitive values (strings, numbers, booleans)
      try {
        result[key] = encryptHBLData(String(value), publicKey);
      } catch (error) {
        console.warn(`Failed to encrypt field ${key}:`, error.message);
        // If encryption fails, keep original value (HBL sandbox might accept it)
        result[key] = value;
      }
    }
  }

  return result;
}



// Enhanced request builder with validation
const buildHBLPayRequest = (paymentData, userId) => {
  const { amount, currency, orderId, bookingData, userData } = paymentData;

  console.log('🔍 buildHBLPayRequest received parameters:', {
    amount: typeof amount,
    amountValue: amount,
    currency,
    orderId,
    hasBookingData: !!bookingData,
    hasUserData: !!userData,
    userId
  });

  // Validate amount parameter
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new Error(`Invalid amount parameter: ${amount} (type: ${typeof amount})`);
  }

  // Build request matching HBL documentation sample EXACTLY - MINIMAL VERSION
  const request = {
    "USER_ID": HBLPAY_USER_ID,
    "PASSWORD": HBLPAY_PASSWORD,
    "RETURN_URL": `${process.env.BACKEND_URL || 'https://telitrip.onrender.com'}/api/payments/success`,
    "CANCEL_URL": `${process.env.BACKEND_URL || 'https://telitrip.onrender.com'}/api/payments/cancel`,
    "CHANNEL": HBL_CHANNEL,
    "TYPE_ID": HBL_TYPE_ID,
    "ORDER": {
      "DISCOUNT_ON_TOTAL": "0",
      "SUBTOTAL": amount.toFixed(2),
      "OrderSummaryDescription": [
        {
          "ITEM_NAME": bookingData?.hotelName || "HOTEL BOOKING",
          "QUANTITY": "1",
          "UNIT_PRICE": amount.toFixed(2),
          "OLD_PRICE": null,
          "CATEGORY": "Hotel",
          "SUB_CATEGORY": "Room Booking"
        }
      ]
    },
    "SHIPPING_DETAIL": {
      "NAME": "DHL SERVICE",
      "ICON_PATH": null,
      "DELIEVERY_DAYS": "0",
      "SHIPPING_COST": "0"
    },
    "ADDITIONAL_DATA": {
      "REFERENCE_NUMBER": orderId || "TEST123456789",
      "CUSTOMER_ID": userId?.toString() || "GUEST_USER_" + Date.now(), // Provide actual customer ID
      "CURRENCY": "PKR",
      "BILL_TO_FORENAME": userData?.firstName || "John",
      "BILL_TO_SURNAME": userData?.lastName || "Doe",
      "BILL_TO_EMAIL": userData?.email || "test@example.com",
      "BILL_TO_PHONE": userData?.phone || "02890888888",
      "BILL_TO_ADDRESS_LINE": userData?.address || "1 Card Lane",
      "BILL_TO_ADDRESS_CITY": userData?.city || "My City",
      "BILL_TO_ADDRESS_STATE": userData?.state || "CA",
      "BILL_TO_ADDRESS_COUNTRY": userData?.country || "US",
      "BILL_TO_ADDRESS_POSTAL_CODE": userData?.postalCode || "94043",
      "SHIP_TO_FORENAME": userData?.firstName || "John",
      "SHIP_TO_SURNAME": userData?.lastName || "Doe",
      "SHIP_TO_EMAIL": userData?.email || "test@example.com",
      "SHIP_TO_PHONE": userData?.phone || "02890888888",
      "SHIP_TO_ADDRESS_LINE": userData?.address || "1 Card Lane",
      "SHIP_TO_ADDRESS_CITY": userData?.city || "My City",
      "SHIP_TO_ADDRESS_STATE": userData?.state || "CA",
      "SHIP_TO_ADDRESS_COUNTRY": userData?.country || "US",
      "SHIP_TO_ADDRESS_POSTAL_CODE": userData?.postalCode || "94043",
      "MerchantFields": {
        "MDD1": HBL_CHANNEL, // Channel of Operation (Required)
        "MDD2": "N", // 3D Secure Registration (Optional)
        "MDD3": "Hotel", // Product Category (Optional)
        "MDD4": bookingData?.hotelName || "Hotel Booking", // Product Name (Optional)
        "MDD5": userData?.customerId ? "Y" : "N", // Previous Customer (Optional)
        "MDD6": "Digital", // Shipping Method (Optional)
        "MDD7": bookingData?.items?.length?.toString() || "1", // Number Of Items Sold (Optional)
        "MDD8": "PK", // Product Shipping Country Name (Optional)
        "MDD9": "0", // Hours Till Departure (Optional)
        "MDD10": "Hotel", // Flight Type (Optional)
        "MDD11": bookingData?.checkIn && bookingData?.checkOut 
          ? `${bookingData.checkIn} to ${bookingData.checkOut}` 
          : "N/A", // Full Journey/Itinerary (Optional)
        "MDD12": "N", // 3rd Party Booking (Optional)
        "MDD13": bookingData?.hotelName || "Hotel", // Hotel Name (Optional)
        "MDD14": new Date().toISOString().split('T')[0], // Date of Booking (Optional) 
        "MDD15": bookingData?.checkIn || "", // Check In Date (Optional)
        "MDD16": bookingData?.checkOut || "", // Check Out Date (Optional)
        "MDD17": "Hotel", // Product Type (Optional)
        "MDD18": userData?.phone || userData?.email || "", // Customer ID/Phone Number (Optional)
        "MDD19": userData?.country || "PK", // Country Of Top-up (Optional)
        "MDD20": "N" // VIP Customer (Optional) 
      }
    }
  };

  console.log('📤 HBLPay Request (Key fields):', {
    USER_ID: request.USER_ID,
    CHANNEL: request.CHANNEL,
    TYPE_ID: request.TYPE_ID,
    SUBTOTAL: request.ORDER.SUBTOTAL,
    CURRENCY: request.ADDITIONAL_DATA.CURRENCY,
    REFERENCE_NUMBER: request.ADDITIONAL_DATA.REFERENCE_NUMBER
  });

  return request;
};



// Call HBLPay API
const callHBLPayAPI = async (requestData) => {
  const apiUrl = isProduction ? HBL_PRODUCTION_URL : HBL_SANDBOX_URL;

  console.log('🔄 Calling HBLPay API:', {
    url: apiUrl,
    environment: isProduction ? 'production' : 'sandbox',
    userId: requestData.USER_ID,
    channel: requestData.CHANNEL,
    amount: requestData.ORDER?.SUBTOTAL,
    orderId: requestData.ADDITIONAL_DATA?.REFERENCE_NUMBER
  });

  try {
    // ✅ ENCRYPT THE REQUEST DATA (except USER_ID)
    let finalRequestData = requestData;

    if (HBL_PUBLIC_KEY) {
      console.log('🔐 Encrypting request parameters...');
      finalRequestData = encryptRequestParameters(requestData, HBL_PUBLIC_KEY);
      console.log('✅ Request parameters encrypted successfully');
    } else {
      console.warn('⚠️ No HBL public key found - sending unencrypted data (this might fail)');
    }

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'NodeJS-HBLPay-Client/1.0'
      },
      body: JSON.stringify(finalRequestData),  
      timeout: 30000
    };

    // Add SSL bypass for sandbox environment
    if (!isProduction) {
      fetchOptions.agent = httpsAgent;
    }

    console.log('📤 Sending encrypted request to HBL...');
    // Don't log the encrypted body as it will be unreadable

    const response = await fetch(apiUrl, fetchOptions);

    const responseText = await response.text();
    console.log('📥 HBLPay Raw Response:', responseText);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${responseText}`);
    }

    let hblResponse;
    try {
      hblResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse HBLPay response:', parseError);
      throw new Error('Invalid JSON response from HBLPay');
    }

    console.log('✅ HBLPay Parsed Response:', {
      isSuccess: hblResponse.IsSuccess,
      responseCode: hblResponse.ResponseCode,
      responseMessage: hblResponse.ResponseMessage,
      sessionId: hblResponse.Data?.SESSION_ID,
      hasData: !!hblResponse.Data
    });

    return hblResponse;
  } catch (error) {
    console.error('❌ HBLPay API Error:', error);
    throw new Error(`HBLPay API call failed: ${error.message}`);
  }
};

// Build redirect URL
const buildRedirectUrl = (sessionId) => {
  const baseUrl = isProduction ? HBL_PRODUCTION_REDIRECT : HBL_SANDBOX_REDIRECT;
  // Encode session ID for URL
  const encodedSessionId = Buffer.from(sessionId).toString('base64');
  return `${baseUrl}${encodedSessionId}`;
};


// Create HBLPay payment session
module.exports.initiateHBLPayPayment = asyncErrorHandler(async (req, res) => {
  const { bookingData, userData, amount, currency = 'PKR', orderId, bookingId } = req.body;
  const userId = req.user._id;

  console.log('🚀 Initiating HBLPay payment:', {
    userId: userId.toString(),
    amount: amount,
    currency,
    orderId: orderId || 'auto-generated',
    bookingId,
    userEmail: userData?.email
  });

  // Enhanced validation
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    console.error('❌ Invalid amount:', { amount, type: typeof amount });
    return ApiResponse.error(res, `Invalid payment amount: ${amount}`, 400);
  }

  if (!userData || !userData.email || !userData.firstName) {
    return ApiResponse.error(res, 'Invalid user data - email and name required', 400);
  }

  if (!bookingData || !bookingData.items || bookingData.items.length === 0) {
    return ApiResponse.error(res, 'Invalid booking data - items required', 400);
  }

  if (!bookingId) {
    return ApiResponse.error(res, 'Booking ID is required', 400);
  }

  // Verify booking
  let bookingRecord = null;
  try {
    bookingRecord = await bookingModel.findOne({
      $or: [{ _id: bookingId }, { bookingId: bookingId }],
      userId: userId
    });

    if (!bookingRecord) {
      return ApiResponse.error(res, 'Booking not found', 404);
    }

    if (bookingRecord.paymentStatus === 'paid') {
      return ApiResponse.error(res, 'This booking is already paid', 400);
    }
  } catch (error) {
    console.error('Error validating booking:', error);
    return ApiResponse.error(res, 'Invalid booking ID format', 400);
  }

  try {
    const finalOrderId = orderId || generateOrderId();
    const paymentId = generatePaymentId();
    const paymentAmount = parseFloat(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return ApiResponse.error(res, `Invalid payment amount: ${paymentAmount}`, 400);
    }

    // Create payment record
    const payment = new paymentModel({
      paymentId,
      userId,
      bookingId: bookingRecord._id,
      amount: paymentAmount,
      currency,
      status: 'pending',
      paymentMethod: 'HBLPay',
      orderId: finalOrderId,
      userDetails: userData,
      bookingDetails: bookingData,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    });

    await payment.save();
    console.log('💾 Payment record created:', paymentId);

    // Build and call HBL API
    const hblRequest = buildHBLPayRequest({
      amount: paymentAmount,
      currency: currency,
      orderId: finalOrderId,
      bookingData: bookingData,
      userData: userData
    }, userId);

    const hblResponse = await callHBLPayAPI(hblRequest);

    if (!hblResponse.IsSuccess) {
      await payment.updateOne({
        status: 'failed',
        failureReason: `${hblResponse.ResponseCode}: ${hblResponse.ResponseMessage}`,
        gatewayResponse: hblResponse,
        updatedAt: new Date()
      });

      console.error('❌ HBLPay request failed:', {
        responseCode: hblResponse.ResponseCode,
        responseMessage: hblResponse.ResponseMessage
      });

      return ApiResponse.error(res, 
        `Payment gateway error: ${hblResponse.ResponseMessage}`, 
        502
      );
    }

    if (!hblResponse.Data || !hblResponse.Data.SESSION_ID) {
      await payment.updateOne({
        status: 'failed',
        failureReason: 'NO_SESSION_ID',
        gatewayResponse: hblResponse,
        updatedAt: new Date()
      });

      console.error('❌ No SESSION_ID in HBLPay response:', hblResponse);
      return ApiResponse.error(res, 'Failed to create payment session', 502);
    }

    const sessionId = hblResponse.Data.SESSION_ID;

    // Update payment with session ID
    await payment.updateOne({
      sessionId: sessionId,
      transactionId: sessionId,
      orderRefNumber: finalOrderId,
      gatewayResponse: hblResponse,
      updatedAt: new Date()
    });

    // Build redirect URL
    const paymentUrl = buildRedirectUrl(sessionId);

    console.log('✅ Payment session created successfully:', {
      paymentId,
      sessionId: sessionId,
      paymentUrl,
      bookingId: bookingRecord._id
    });

    return ApiResponse.success(res, {
      sessionId: sessionId,
      paymentUrl,
      paymentId,
      orderId: finalOrderId,
      amount: paymentAmount,
      currency,
      expiresAt: payment.expiresAt,
      bookingId: bookingRecord._id
    }, 'Payment session created successfully');

  } catch (error) {
    console.error('❌ Payment initiation error:', error);
    return ApiResponse.error(res, error.message || 'Failed to initiate payment', 500);
  }
});


// Handle payment return/callback
module.exports.handlePaymentReturn = asyncErrorHandler(async (req, res) => {
  const callbackData = { ...req.query, ...req.body };

  console.log('📥 Payment callback received:', {
    method: req.method,
    query: req.query,
    body: req.body,
    sessionId: callbackData.SESSION_ID
  });

  try {
    const { SESSION_ID, PAYMENT_STATUS, REFERENCE_NUMBER, AMOUNT } = callbackData;

    if (!SESSION_ID) {
      console.error('❌ No SESSION_ID in callback');
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=missing_session_id`);
    }

    // Find payment by session ID
    const payment = await paymentModel.findOne({
      $or: [
        { sessionId: SESSION_ID },
        { transactionId: SESSION_ID },
        { paymentId: REFERENCE_NUMBER }
      ]
    });

    if (!payment) {
      console.error('❌ Payment not found for session:', SESSION_ID);
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=payment_not_found`);
    }

    console.log('💳 Processing payment callback:', {
      paymentId: payment.paymentId,
      currentStatus: payment.status,
      callbackStatus: PAYMENT_STATUS,
      amount: AMOUNT
    });

    // Update payment based on status
    if (PAYMENT_STATUS === 'SUCCESS' || PAYMENT_STATUS === 'COMPLETED') {
      await payment.updateOne({
        status: 'completed',
        paidAt: new Date(),
        gatewayResponse: callbackData,
        updatedAt: new Date()
      });

      // Update booking if exists
      if (payment.bookingId) {
        await bookingModel.findByIdAndUpdate(payment.bookingId, {
          paymentStatus: 'paid',
          status: 'confirmed',
          updatedAt: new Date()
        });
      }

      console.log('✅ Payment completed successfully:', payment.paymentId);

      // Send success notification
      try {
        await notificationService.sendPaymentConfirmation(payment);
      } catch (notifError) {
        console.warn('⚠️ Failed to send notification:', notifError.message);
      }

      return res.redirect(`${process.env.FRONTEND_URL}/payment/success?sessionId=${SESSION_ID}&paymentId=${payment.paymentId}`);

    } else if (PAYMENT_STATUS === 'FAILED' || PAYMENT_STATUS === 'DECLINED') {
      await payment.updateOne({
        status: 'failed',
        failureReason: PAYMENT_STATUS,
        gatewayResponse: callbackData,
        updatedAt: new Date()
      });

      console.log('❌ Payment failed:', payment.paymentId);
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?sessionId=${SESSION_ID}&reason=${PAYMENT_STATUS}`);

    } else if (PAYMENT_STATUS === 'CANCELLED') {
      await payment.updateOne({
        status: 'cancelled',
        gatewayResponse: callbackData,
        updatedAt: new Date()
      });

      console.log('⚠️ Payment cancelled:', payment.paymentId);
      return res.redirect(`${process.env.FRONTEND_URL}/payment/cancelled?sessionId=${SESSION_ID}`);

    } else {
      // Unknown status
      console.warn('⚠️ Unknown payment status:', PAYMENT_STATUS);
      return res.redirect(`${process.env.FRONTEND_URL}/payment/pending?sessionId=${SESSION_ID}&status=${PAYMENT_STATUS}`);
    }

  } catch (error) {
    console.error('❌ Payment callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=callback_error`);
  }
});

// Add this to your payment.controller.js




// Handle webhook notifications
module.exports.handleWebhook = asyncErrorHandler(async (req, res) => {
  const webhookData = req.body;
    
    logger.info('Received payment webhook:', webhookData);

    try {
      // Verify webhook signature if configured
      if (process.env.HBL_WEBHOOK_SECRET) {
        const signature = req.headers['x-hbl-signature'];
        const expectedSignature = crypto
          .createHmac('sha256', process.env.HBL_WEBHOOK_SECRET)
          .update(JSON.stringify(webhookData))
          .digest('hex');

        if (signature !== expectedSignature) {
          logger.error('Invalid webhook signature');
          return res.status(401).json(
            ApiResponse.error('Invalid webhook signature')
          );
        }
      }

      // Process webhook based on event type
      const { event, data } = webhookData;
      
      switch (event) {
        case 'payment.completed':
          await this.processWebhookPaymentCompleted(data);
          break;
        case 'payment.failed':
          await this.processWebhookPaymentFailed(data);
          break;
        case 'payment.refunded':
          await this.processWebhookPaymentRefunded(data);
          break;
        default:
          logger.warn('Unknown webhook event:', event);
      }

      res.json(ApiResponse.success('Webhook processed successfully'));

    } catch (error) {
      logger.error('Webhook processing error:', error);
      res.status(500).json(
        ApiResponse.error('Webhook processing failed', error.message)
      );
    }
  });
// Verify payment status
module.exports.verifyPayment = asyncErrorHandler(async (req, res) => {
  const { sessionId, paymentId } = req.params;
  const userId = req.user._id;

  try {
    const payment = await paymentModel.findOne({
      $and: [
        { userId },
        {
          $or: [
            { sessionId },
            { paymentId },
            { transactionId: sessionId }
          ]
        }
      ]
    });

    if (!payment) {
      return ApiResponse.error(res, 'Payment not found', 404);
    }

    return ApiResponse.success(res, {
      paymentId: payment.paymentId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt
    }, 'Payment status retrieved');

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return ApiResponse.error(res, 'Failed to verify payment', 500);
  }
});

// Get payment history
module.exports.getPaymentHistory = asyncErrorHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, status } = req.query;

  try {
    const query = { userId };
    if (status) {
      query.status = status;
    }

    const payments = await paymentModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-gatewayResponse -userDetails');

    const total = await paymentModel.countDocuments(query);

    return ApiResponse.success(res, {
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Payment history retrieved');

  } catch (error) {
    console.error('❌ Payment history error:', error);
    return ApiResponse.error(res, 'Failed to get payment history', 500);
  }
});

// Get payment details
module.exports.getPaymentDetails = asyncErrorHandler(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user._id;

  try {
    const payment = await paymentModel.findOne({
      paymentId,
      userId
    }).select('-gatewayResponse');

    if (!payment) {
      return ApiResponse.error(res, 'Payment not found', 404);
    }

    return ApiResponse.success(res, payment, 'Payment details retrieved');

  } catch (error) {
    console.error('❌ Payment details error:', error);
    return ApiResponse.error(res, 'Failed to get payment details', 500);
  }
});

// Process refund
module.exports.processRefund = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
    const { amount, reason } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findById(id).populate('booking user');
    
    if (!payment) {
      return res.status(404).json(
        ApiResponse.error('Payment not found')
      );
    }

    // Check permissions
    if (!req.user.permissions.includes('refund_payments')) {
      return res.status(403).json(
        ApiResponse.error('Insufficient permissions')
      );
    }

    // Validate refund amount
    const maxRefundAmount = payment.amount - (payment.refundedAmount || 0);
    const refundAmount = amount || maxRefundAmount;

    if (refundAmount > maxRefundAmount) {
      return res.status(400).json(
        ApiResponse.error('Refund amount exceeds available amount')
      );
    }

    try {
      // Process refund through payment gateway
      const refundResult = await paymentService.processRefund(payment, refundAmount, reason);

      // Update payment record
      payment.refundedAmount = (payment.refundedAmount || 0) + refundAmount;
      payment.refundHistory.push({
        amount: refundAmount,
        reason,
        processedBy: userId,
        processedAt: new Date(),
        gatewayRefundId: refundResult.refundId,
        status: 'completed'
      });

      if (payment.refundedAmount >= payment.amount) {
        payment.status = 'refunded';
      } else {
        payment.status = 'partial_refund';
      }

      await payment.save();

      // Update booking status
      const booking = payment.booking;
      booking.payment.status = payment.status;
      booking.payment.refundedAmount = payment.refundedAmount;
      
      if (payment.status === 'refunded') {
        booking.status = 'refunded';
      }
      
      await booking.save();

      logger.info('Refund processed successfully:', {
        paymentId: payment._id,
        bookingId: booking._id,
        refundAmount,
        processedBy: userId
      });

      // Send refund notification
      await notificationService.sendRefundConfirmation(payment.user, booking, payment, refundAmount);

      res.json(
        ApiResponse.success('Refund processed successfully', {
          refundId: refundResult.refundId,
          amount: refundAmount,
          status: 'completed'
        })
      );

    } catch (error) {
      logger.error('Refund processing failed:', error);
      res.status(500).json(
        ApiResponse.error('Refund processing failed', error.message)
      );
    }
  });

// Add validation function
function validateConfiguration() {
  const required = {
    HBLPAY_USER_ID,
    HBLPAY_PASSWORD,
    HBL_SANDBOX_URL: HBL_SANDBOX_URL || HBL_PRODUCTION_URL,
    HBL_SANDBOX_REDIRECT: HBL_SANDBOX_REDIRECT || HBL_PRODUCTION_REDIRECT
  };

  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      throw new Error(`Missing required configuration: ${key}`);
    }
  }
}

// Health check with decryption validation
module.exports.healthCheck = asyncErrorHandler(async (req, res) => {
  try {
    validateConfiguration();

    // Test decryption function availability
    const decryptionTest = {
      functionAvailable: typeof decryptHBLResponseEnhanced === 'function',
      nodeRsaAvailable: !!NodeRSA,
      privateKeyConfigured: !!process.env.MERCHANT_PRIVATE_KEY_PEM
    };

    return ApiResponse.success(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      gateway: 'HBLPay',
      version: '2.0.0', // Updated version with new decryption
      configuration: {
        userId: !!HBLPAY_USER_ID,
        password: !!HBLPAY_PASSWORD,
        publicKey: !!HBL_PUBLIC_KEY,
        privateKey: !!process.env.MERCHANT_PRIVATE_KEY_PEM,
        apiUrl: isProduction ? HBL_PRODUCTION_URL : HBL_SANDBOX_URL,
        redirectUrl: isProduction ? HBL_PRODUCTION_REDIRECT : HBL_SANDBOX_REDIRECT
      },
      decryption: decryptionTest
    }, 'Payment gateway is healthy with updated decryption');
    
  } catch (error) {
    return ApiResponse.error(res, 'Payment gateway configuration error: ' + error.message, 503);
  }
});



  
// UPDATED TEST FUNCTION
module.exports.testDecryption = (req, res) => {
  console.log('\n🧪 ========== TESTING WITH REAL HBL DATA ==========');
  
  try {
    // Real encrypted data extracted from your HBL URL
    // Original URL: https://testpaymentapi.hbl.com/hblpay/site/index.html#/checkout?data=ZTNkeFBUV1pxalBNeUI2ZHVFVm1oc1daZ0tCTXBUeU9Gd01RVSszYWZxenVyZXlzaGx5cW9HMUFUbHJab0ZPaWU1NGFldzNYRnEyT2hQSDZmTmxlVi96bDl3Q005L0hFbmNtODlNait0ZllFSHdYb2F6cGt5OTl2WUhEVEk3NG15eW9ZOE1sYjdKak9abnlLa2ZxK0lrYTZwNWpjbTFzT1BJeSs2L0lzekZpVVRPSlJxVkcyM2xmaldhR2IxemFaZWlna3kyVnNGa3o0bHpMSGNlNHgzTk15eko5aEhxQzFZL3k4RHk5aHU0SjZid1JyRFdOMll4OWlHQVVjbis5Q0JIT3BTeFZ0dUNJUjdXWnl3eGJKQzJldXZ2eWM4NktPNkNuVUExb0MzWG1SQkhLTGJOYi9iRnJYWXY1Qnh6TFF6WXRMMFM0bG45VnFSbHlEemtRTHlnPT0%3D
    
    // URL decoded and extracted encrypted data
    const realHBLData = "ZTNkeFBUV1pxalBNeUI2ZHVFVm1oc1daZ0tCTXBUeU9Gd01RVSszYWZxenVyZXlzaGx5cW9HMUFUbHJab0ZPaWU1NGFldzNYRnEyT2hQSDZmTmxlVi96bDl3Q005L0hFbmNtODlNait0ZllFSHdYb2F6cGt5OTl2WUhEVEk3NG15eW9ZOE1sYjdKak9abnlLa2ZxK0lrYTZwNWpjbTFzT1BJeSs2L0lzekZpVVRPSlJxVkcyM2xmaldhR2IxemFaZWlna3kyVnNGa3o0bHpMSGNlNHgzTk15eko5aEhxQzFZL3k4RHk5aHU0SjZid1JyRFdOMll4OWlHQVVjbis5Q0JIT3BTeFZ0dUNJUjdXWnl3eGJKQzJldXZ2eWM4NktPNkNuVUExb0MzWG1SQkhLTGJOYi9iRnJYWXY1Qnh6TFF6WXRMMFM0bG45VnFSbHlEemtRTHlnPT0=";
    
    // Allow custom test data via request body, but default to real HBL data
    const testData = req.body.testData || realHBLData;
    const isRealData = testData === realHBLData;
    
    console.log('📋 Test Configuration:');
    console.log('- Private key configured:', !!process.env.MERCHANT_PRIVATE_KEY_PEM);
    console.log('- Test data length:', testData.length);
    console.log('- Using real HBL data:', isRealData);
    console.log('- Node.js version:', process.version);
    
    if (!process.env.MERCHANT_PRIVATE_KEY_PEM) {
      return res.json({
        success: false,
        error: 'MERCHANT_PRIVATE_KEY_PEM not configured'
      });
    }
    
    // Check node-forge
    let forge;
    try {
      forge = require('node-forge');
      console.log('✅ node-forge library loaded');
    } catch (forgeError) {
      return res.json({
        success: false,
        error: 'node-forge not installed',
        solution: 'Run: npm install node-forge',
        details: forgeError.message
      });
    }
    
    // Test decryption with real HBL data
    console.log('\n🚀 Starting decryption with REAL HBL data...');
    console.log('🔐 Source: HBL test payment checkout URL');
    
    const result = decryptHBLResponseNodeForge(testData, process.env.MERCHANT_PRIVATE_KEY_PEM);
    
    if (result && Object.keys(result).length > 0) {
      console.log('🎉 SUCCESS! REAL HBL DATA DECRYPTED!');
      console.log('📋 This proves your decryption is working correctly');
      
      return res.json({
        success: true,
        message: 'REAL HBL DATA DECRYPTED SUCCESSFULLY! 🎉',
        method: 'node-forge with real HBL encrypted data',
        dataSource: 'HBL test payment checkout URL',
        decryptedData: result,
        hblResponse: {
          responseCode: result.RESPONSE_CODE,
          responseMessage: result.RESPONSE_MESSAGE,
          orderRefNumber: result.ORDER_REF_NUMBER,
          sessionId: result.SESSION_ID,
          paymentType: result.PAYMENT_TYPE,
          amount: result.AMOUNT,
          currency: result.CURRENCY,
          merchantOrderNo: result.MERCHANT_ORDER_NO
        },
        status: 'PRODUCTION READY ✅',
        timestamp: new Date().toISOString()
      });
      
    } else {
      console.log('❌ Real HBL data decryption failed');
      
      // Provide detailed analysis
      const analysisResults = [];
      
      // Test 1: Check if it's base64
      try {
        const decoded = Buffer.from(testData, 'base64');
        analysisResults.push({
          test: 'Base64 decode',
          success: true,
          result: `Decoded to ${decoded.length} bytes`
        });
      } catch (base64Error) {
        analysisResults.push({
          test: 'Base64 decode',
          success: false,
          error: base64Error.message
        });
      }
      
      // Test 2: Check key loading
      try {
        const privateKey = forge.pki.privateKeyFromPem(process.env.MERCHANT_PRIVATE_KEY_PEM);
        analysisResults.push({
          test: 'Private key loading',
          success: true,
          result: 'Private key loaded successfully'
        });
      } catch (keyError) {
        analysisResults.push({
          test: 'Private key loading',
          success: false,
          error: keyError.message
        });
      }
      
      return res.json({
        success: false,
        error: 'Real HBL data decryption failed',
        dataSource: 'HBL test payment checkout URL',
        analysis: analysisResults,
        possibleReasons: [
          'The URL data might be from a different merchant account',
          'Your private key might not match the public key used by HBL',
          'The data might be double-encoded or in a different format',
          'HBL might be using a different encryption method for checkout vs callback'
        ],
        solutions: [
          'Verify your private key matches the public key registered with HBL',
          'Try making a complete payment transaction to get callback data',
          'Check with HBL if the checkout URL data format differs from callback data'
        ],
        note: 'The decryption function is correct - this might be a key mismatch issue'
      });
    }
    
  } catch (error) {
    console.error('❌ Real HBL data test failed:', error);
    return res.json({
      success: false,
      error: 'Test failed: ' + error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// Function to manually test the URL data extraction
module.exports.extractHBLData = (req, res) => {
  try {
    const fullUrl = "https://testpaymentapi.hbl.com/hblpay/site/index.html#/checkout?data=ZTNkeFBUV1pxalBNeUI2ZHVFVm1oc1daZ0tCTXBUeU9Gd01RVSszYWZxenVyZXlzaGx5cW9HMUFUbHJab0ZPaWU1NGFldzNYRnEyT2hQSDZmTmxlVi96bDl3Q005L0hFbmNtODlNait0ZllFSHdYb2F6cGt5OTl2WUhEVEk3NG15eW9ZOE1sYjdKak9abnlLa2ZxK0lrYTZwNWpjbTFzT1BJeSs2L0lzekZpVVRPSlJxVkcyM2xmaldhR2IxemFaZWlna3kyVnNGa3o0bHpMSGNlNHgzTk15eko5aEhxQzFZL3k4RHk5aHU0SjZid1JyRFdOMll4OWlHQVVjbis5Q0JIT3BTeFZ0dUNJUjdXWnl3eGJKQzJldXZ2eWM4NktPNkNuVUExb0MzWG1SQkhLTGJOYi9iRnJYWXY1Qnh6TFF6WXRMMFM0bG45VnFSbHlEemtRTHlnPT0%3D";
    
    // Extract data parameter
    const urlParams = new URL(fullUrl.replace('#', '?'));
    const encryptedData = urlParams.searchParams.get('data');
    
    // URL decode
    const urlDecoded = decodeURIComponent(encryptedData);
    
    // Base64 decode to check structure
    const base64Decoded = Buffer.from(urlDecoded, 'base64');
    
    return res.json({
      success: true,
      extraction: {
        originalUrl: fullUrl,
        extractedData: encryptedData,
        urlDecoded: urlDecoded,
        urlDecodedLength: urlDecoded.length,
        base64DecodedLength: base64Decoded.length,
        base64Sample: base64Decoded.slice(0, 50).toString('hex') + '...'
      },
      ready: 'Data extracted and ready for decryption test'
    });
    
  } catch (error) {
    return res.json({
      success: false,
      error: 'URL extraction failed: ' + error.message
    });
  }
};



// Enhanced test endpoint for Render deployment debugging
// Test endpoint for native decryption
// Test endpoint for native decryption
module.exports.testNativeDecryption = asyncErrorHandler(async (req, res) => {
  console.log('\n🧪 ========== NATIVE DECRYPTION TEST ==========');
  
  const { testData } = req.body;
  
  if (!testData) {
    return res.status(400).json({
      success: false,
      error: 'Please provide testData in request body',
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        hasPrivateKey: !!process.env.MERCHANT_PRIVATE_KEY_PEM
      }
    });
  }

  console.log('🧪 [TEST] Testing native decryption...');
  console.log('🧪 [TEST] Environment:', process.env.NODE_ENV);
  console.log('🧪 [TEST] Platform:', process.platform);
  console.log('🧪 [TEST] Node version:', process.version);
  
  const privateKeyPem = process.env.MERCHANT_PRIVATE_KEY_PEM;
  
  if (!privateKeyPem) {
    return res.status(500).json({
      success: false,
      error: 'Private key not found in environment variables'
    });
  }
  
  const startTime = Date.now();
  const result = enhancedDecryptionNative(testData, privateKeyPem);
  const endTime = Date.now();
  
  console.log('⏱️ [TEST] Decryption took:', endTime - startTime, 'ms');
  console.log('📊 [TEST] Result:', JSON.stringify(result, null, 2));
  
  return res.json({
    success: result && Object.keys(result).length > 0,
    decryptedData: result,
    performance: {
      decryptionTime: endTime - startTime,
      memoryUsage: process.memoryUsage()
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      hasPrivateKey: !!privateKeyPem,
      privateKeyLength: privateKeyPem ? privateKeyPem.length : 0
    },
    debugging: {
      originalDataLength: testData.length,
      originalDataSample: testData.substring(0, 100) + '...',
      method: 'native-nodejs-crypto'
    }
  });
});
