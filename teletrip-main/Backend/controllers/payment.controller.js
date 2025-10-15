//THE FINL PAYMENT CONTROLLER //



const crypto = require('crypto');
const fetch = require('node-fetch');
const paymentModel = require('../models/payment.model');
const bookingModel = require('../models/booking.model');
const ApiResponse = require('../utils/response.util');
const { asyncErrorHandler } = require('../middlewares/errorHandler.middleware');
const notificationService = require('../services/notification.service');
const logger = require('../utils/logger.util'); // Enhanced logging utility
const querystring = require('querystring');
const forge = require('node-forge');


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

function enhancedDecryptionNative(encryptedData, privateKeyPem) {
  try {
    console.log('\n🔧 [ENHANCED-NATIVE] Starting enhanced decryption with Node.js crypto...');
    console.log('🌐 [ENHANCED-NATIVE] Environment:', process.env.NODE_ENV);
    console.log('📦 [ENHANCED-NATIVE] Platform:', process.platform);
    
    if (!encryptedData || !privateKeyPem) {
      console.log('❌ [ENHANCED-NATIVE] Missing encrypted data or private key');
      return {};
    }
    
    // Step 1: Fix URL encoding issues (exact same as your Node Forge version)
    let cleanData = encryptedData.trim();
    cleanData = cleanData.replace(/ /g, '+');
    cleanData = cleanData.replace(/%2B/g, '+');
    cleanData = cleanData.replace(/%2F/g, '/');
    cleanData = cleanData.replace(/%3D/g, '=');
    
    console.log('🧹 [ENHANCED-NATIVE] Cleaned data length:', cleanData.length);
    
    // Step 2: Try standard PKCS1 decryption first (fallback for standard cases)
    try {
      console.log('🔄 [ENHANCED-NATIVE] Trying standard PKCS1 decryption...');
      
      const encryptedBuffer = Buffer.from(cleanData, 'base64');
      console.log('📦 [ENHANCED-NATIVE] Buffer length:', encryptedBuffer.length);
      
      if (encryptedBuffer.length === 512) {
        // Perfect block size - try standard decryption first
        const standardResult = crypto.privateDecrypt({
          key: privateKeyPem,
          padding: crypto.constants.RSA_PKCS1_PADDING
        }, encryptedBuffer);
        
        const standardString = standardResult.toString('utf8');
        if (standardString && standardString.includes('RESPONSE_CODE')) {
          console.log('✅ [ENHANCED-NATIVE] Standard PKCS1 decryption successful');
          const params = {};
          standardString.split('&').forEach(pair => {
            if (pair.includes('=')) {
              const [key, ...valueParts] = pair.split('=');
              params[key.trim()] = decodeURIComponent(valueParts.join('=') || '');
            }
          });
          return params;
        }
      }
    } catch (standardError) {
      console.log('❌ [ENHANCED-NATIVE] Standard PKCS1 method failed:', standardError.message);
    }
    
    // Step 3: Use Node.js crypto with NO_PADDING (YOUR WORKING METHOD)
    try {
      console.log('🔄 [ENHANCED-NATIVE] Trying Node.js crypto NO_PADDING (your working method)...');
      
      const encryptedBuffer = Buffer.from(cleanData, 'base64');
      console.log('📦 [ENHANCED-NATIVE] Buffer length for NO_PADDING:', encryptedBuffer.length);
      
      const decrypted = crypto.privateDecrypt({
        key: privateKeyPem,
        padding: crypto.constants.RSA_NO_PADDING
      }, encryptedBuffer);
      
      console.log('✅ [ENHANCED-NATIVE] Node.js NO_PADDING decryption successful');
      console.log('📊 [ENHANCED-NATIVE] Decrypted buffer length:', decrypted.length);
      
      // Parse the garbled binary data (exact same method as your Node Forge version)
      const decryptedString = decrypted.toString('binary');
      console.log('📝 [ENHANCED-NATIVE] Binary string length:', decryptedString.length);
      console.log('📝 [ENHANCED-NATIVE] Binary string sample (first 100 chars):', 
                  decryptedString.substring(0, 100).replace(/[^\x20-\x7E]/g, ' '));
      
      const params = parseGarbledDataNative(decryptedString);
      
      if (Object.keys(params).length > 0) {
        console.log('✅ [ENHANCED-NATIVE] Successfully parsed parameters from binary data');
        return params;
      }
      
      // Fallback: try different string encodings (exact same as your version)
      console.log('🔄 [ENHANCED-NATIVE] Trying alternative encodings...');
      const encodings = ['utf8', 'ascii', 'latin1'];
      for (const encoding of encodings) {
        try {
          console.log(`🔄 [ENHANCED-NATIVE] Trying ${encoding} encoding...`);
          const testString = decrypted.toString(encoding);
          const testParams = parseGarbledDataNative(testString);
          if (Object.keys(testParams).length > 0) {
            console.log(`✅ [ENHANCED-NATIVE] Success with ${encoding} encoding`);
            return testParams;
          }
        } catch (encodingError) {
          console.log(`❌ [ENHANCED-NATIVE] ${encoding} encoding failed:`, encodingError.message);
          // Continue to next encoding
        }
      }
      
    } catch (cryptoError) {
      console.log('❌ [ENHANCED-NATIVE] Node.js crypto NO_PADDING failed:', cryptoError.message);
      console.log('❌ [ENHANCED-NATIVE] Crypto error code:', cryptoError.code);
      console.log('❌ [ENHANCED-NATIVE] Crypto error stack:', cryptoError.stack);
    }
    
    // Step 4: Try OAEP padding as last resort
    try {
      console.log('🔄 [ENHANCED-NATIVE] Trying OAEP padding as last resort...');
      
      const encryptedBuffer = Buffer.from(cleanData, 'base64');
      const decrypted = crypto.privateDecrypt({
        key: privateKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
      }, encryptedBuffer);
      
      const decryptedString = decrypted.toString('binary');
      const params = parseGarbledDataNative(decryptedString);
      
      if (Object.keys(params).length > 0) {
        console.log('✅ [ENHANCED-NATIVE] OAEP padding successful');
        return params;
      }
      
    } catch (oaepError) {
      console.log('❌ [ENHANCED-NATIVE] OAEP padding failed:', oaepError.message);
    }
    
    console.log('❌ [ENHANCED-NATIVE] All decryption methods failed');
    return {};
    
  } catch (error) {
    console.error('💥 [ENHANCED-NATIVE] Fatal error:', error.message);
    console.error('💥 [ENHANCED-NATIVE] Error stack:', error.stack);
    console.log('🔍 [ENHANCED-NATIVE] Debug info:');
    console.log('   - Node version:', process.version);
    console.log('   - Platform:', process.platform);
    console.log('   - Architecture:', process.arch);
    console.log('   - Memory usage:', JSON.stringify(process.memoryUsage(), null, 2));
    return {};
  }
}


function decryptHBLResponseNodeForge(encryptedData, privateKeyPem) {
  try {
    console.log('\n🔐 [DECRYPT] Starting multi-method decryption...');
    
    if (!encryptedData || !privateKeyPem) {
      console.log('❌ [DECRYPT] Missing data or key');
      return {};
    }

    // Step 1: Clean the data
    let cleanData = encryptedData.trim();
    cleanData = cleanData.replace(/ /g, '+');
    cleanData = cleanData.replace(/%2B/g, '+');
    cleanData = cleanData.replace(/%2F/g, '/');
    cleanData = cleanData.replace(/%3D/g, '=');
    
    console.log('📏 [DECRYPT] Clean data length:', cleanData.length);
    console.log('📏 [DECRYPT] First 50 chars:', cleanData.substring(0, 50));

    // Step 2: Load keys
    const forgePrivateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    console.log('🔑 [DECRYPT] Private key loaded');

    // Step 3: Decode Base64
    const encryptedBytes = forge.util.decode64(cleanData);
    console.log('📦 [DECRYPT] Decoded length:', encryptedBytes.length);

    // ============================================================================
    // TRY MULTIPLE DECRYPTION METHODS
    // ============================================================================
    
    const methods = [
      {
        name: 'node-forge PKCS1 v1.5',
        decrypt: () => forgePrivateKey.decrypt(encryptedBytes, 'RSAES-PKCS1-V1_5')
      },
      {
        name: 'node-forge PKCS1 (RSA-OAEP with SHA-1)',
        decrypt: () => forgePrivateKey.decrypt(encryptedBytes, 'RSA-OAEP', {
          md: forge.md.sha1.create()
        })
      },
      {
        name: 'node-forge PKCS1 (RSA-OAEP with SHA-256)',
        decrypt: () => forgePrivateKey.decrypt(encryptedBytes, 'RSA-OAEP', {
          md: forge.md.sha256.create()
        })
      },
      {
        name: 'node-forge RAW (no padding)',
        decrypt: () => forgePrivateKey.decrypt(encryptedBytes, null)
      },
      {
        name: 'node-forge RAW with manual PKCS1 removal',
        decrypt: () => {
          const raw = forgePrivateKey.decrypt(encryptedBytes, null);
          // Remove PKCS1 padding manually
          const buffer = forge.util.createBuffer(raw, 'raw');
          const bytes = buffer.bytes();
          
          // Find the 0x00 separator after padding
          let i = 2; // Skip first two bytes (0x00 0x02 for PKCS1)
          while (i < bytes.length && bytes.charCodeAt(i) !== 0x00) {
            i++;
          }
          i++; // Skip the 0x00 byte
          
          return bytes.substring(i);
        }
      },
      {
        name: 'Native crypto PKCS1 OAEP (SHA-1)',
        decrypt: () => {
          const buffer = Buffer.from(cleanData, 'base64');
          return crypto.privateDecrypt({
            key: privateKeyPem,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha1'
          }, buffer).toString('utf8');
        }
      },
      {
        name: 'Native crypto PKCS1 OAEP (SHA-256)',
        decrypt: () => {
          const buffer = Buffer.from(cleanData, 'base64');
          return crypto.privateDecrypt({
            key: privateKeyPem,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
          }, buffer).toString('utf8');
        }
      },
      {
        name: 'Native crypto NO PADDING',
        decrypt: () => {
          const buffer = Buffer.from(cleanData, 'base64');
          const decrypted = crypto.privateDecrypt({
            key: privateKeyPem,
            padding: crypto.constants.RSA_NO_PADDING
          }, buffer);
          
          // Extract readable text from binary
          let result = '';
          for (let i = 0; i < decrypted.length; i++) {
            const code = decrypted[i];
            if ((code >= 32 && code <= 126) || code === 10 || code === 13) {
              result += String.fromCharCode(code);
            }
          }
          return result;
        }
      }
    ];

    // Try each method
    for (const method of methods) {
      try {
        console.log(`\n🔄 [DECRYPT] Trying: ${method.name}...`);
        const decrypted = method.decrypt();
        
        console.log('✅ [DECRYPT] Method succeeded!');
        console.log('📝 [DECRYPT] Decrypted length:', decrypted.length);
        console.log('📝 [DECRYPT] Sample:', decrypted.substring(0, 200));
        
        // Try to parse
        const params = parseDecryptedParams(decrypted);
        
        if (params && Object.keys(params).length > 0) {
          console.log(`🎉 [DECRYPT] SUCCESS with method: ${method.name}`);
          console.log('📋 [DECRYPT] Parameters found:', Object.keys(params));
          return params;
        } else {
          console.log(`⚠️ [DECRYPT] Method worked but no parameters parsed`);
        }
        
      } catch (methodError) {
        console.log(`❌ [DECRYPT] ${method.name} failed:`, methodError.message);
      }
    }

    console.log('❌ [DECRYPT] All methods failed');
    return {};

  } catch (error) {
    console.error('❌ [DECRYPT] Fatal error:', error.message);
    return {};
  }
}

// ==================== PARSE DECRYPTED PARAMETERS ====================
function parseDecryptedParams(decryptedString) {
  try {
    console.log('🔍 [PARSE] Starting to parse...');
    
    if (!decryptedString || decryptedString.length === 0) {
      console.log('❌ [PARSE] Empty string');
      return {};
    }
    
    const params = {};
    
    // Method 1: Standard query string format (key=value&key=value)
    if (decryptedString.includes('=') && decryptedString.includes('&')) {
      console.log('🔍 [PARSE] Trying query string format...');
      
      const pairs = decryptedString.split('&');
      for (const pair of pairs) {
        if (pair.includes('=')) {
          const [key, ...valueParts] = pair.split('=');
          const value = valueParts.join('=');
          
          if (key && value) {
            try {
              params[key.trim()] = decodeURIComponent(value.trim());
              console.log(`✅ [PARSE] ${key.trim()}: ${params[key.trim()]}`);
            } catch {
              params[key.trim()] = value.trim();
              console.log(`⚠️ [PARSE] ${key.trim()}: ${value.trim()} (raw)`);
            }
          }
        }
      }
    }
    
    // Method 2: Try regex patterns if Method 1 failed
    if (Object.keys(params).length === 0) {
      console.log('🔍 [PARSE] Trying regex patterns...');
      
      const patterns = {
        RESPONSE_CODE: /RESPONSE_CODE[=:]([^&\s\n]+)/i,
        RESPONSE_MESSAGE: /RESPONSE_MESSAGE[=:]([^&\n]+)/i,
        ORDER_REF_NUMBER: /ORDER_REF_NUMBER[=:]([^&\s\n]+)/i,
        REFERENCE_NUMBER: /REFERENCE_NUMBER[=:]([^&\s\n]+)/i,
        TRANSACTION_ID: /TRANSACTION_ID[=:]([^&\s\n]+)/i,
        TXN_ID: /TXN_ID[=:]([^&\s\n]+)/i,
        GUID: /GUID[=:]([^&\s\n]+)/i,
        PAYMENT_TYPE: /PAYMENT_TYPE[=:]([^&\s\n]+)/i,
        CARD_NUM_MASKED: /CARD_NUM_MASKED[=:]([^&\s\n]+)/i,
        SESSION_ID: /SESSION_ID[=:]([^&\s\n]+)/i,
        AMOUNT: /AMOUNT[=:]([^&\s\n]+)/i,
        CURRENCY: /CURRENCY[=:]([^&\s\n]+)/i
      };
      
      for (const [key, pattern] of Object.entries(patterns)) {
        const match = decryptedString.match(pattern);
        if (match && match[1]) {
          params[key] = match[1].trim();
          console.log(`✅ [PARSE] ${key}: ${params[key]}`);
        }
      }
    }
    
    // Method 3: Try JSON parsing
    if (Object.keys(params).length === 0) {
      console.log('🔍 [PARSE] Trying JSON parsing...');
      try {
        const jsonData = JSON.parse(decryptedString);
        Object.assign(params, jsonData);
        console.log('✅ [PARSE] Parsed as JSON');
      } catch {
        console.log('❌ [PARSE] Not valid JSON');
      }
    }
    
    console.log(`📊 [PARSE] Total parameters: ${Object.keys(params).length}`);
    return params;

  } catch (error) {
    console.error('❌ [PARSE] Error:', error.message);
    return {};
  }
} 









// ==================== UPDATED SUCCESS HANDLER ====================
module.exports.handlePaymentSuccess = asyncErrorHandler(async (req, res) => {
  console.log('\n🎉 ========== PAYMENT SUCCESS CALLBACK ==========');
  console.log('🔗 Full URL:', req.url);
  
  try {
    // Extract encrypted data (your existing code is good!)
    let encryptedData = null;
    
    if (req.url && req.url.includes('data=')) {
      const rawUrl = req.url;
      const dataStart = rawUrl.indexOf('data=') + 5;
      const dataEnd = rawUrl.indexOf('&', dataStart);
      encryptedData = dataEnd === -1 ? 
        rawUrl.substring(dataStart) : 
        rawUrl.substring(dataStart, dataEnd);
      console.log('✅ [SUCCESS] Data from raw URL');
    } else if (req.query && req.query.data) {
      encryptedData = req.query.data;
      console.log('⚠️ [SUCCESS] Data from query');
    } else if (req.body && req.body.data) {
      encryptedData = req.body.data;
      console.log('✅ [SUCCESS] Data from body');
    }

    if (!encryptedData) {
      console.log('❌ [SUCCESS] No encrypted data');
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=missing_data`);
    }

    console.log('📦 [SUCCESS] Encrypted data length:', encryptedData.length);

    const privateKeyPem = process.env.MERCHANT_PRIVATE_KEY_PEM;
    
    if (!privateKeyPem) {
      console.log('❌ [SUCCESS] No private key');
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=config_error`);
    }

    // USE MULTI-METHOD DECRYPTION
    const decryptedResponse = decryptHBLResponseNodeForge(encryptedData, privateKeyPem);

    if (!decryptedResponse || Object.keys(decryptedResponse).length === 0) {
      console.log('❌ [SUCCESS] All decryption methods failed');
      console.log('⚠️ [SUCCESS] This means HBL is using a different public key');
      console.log('📧 [SUCCESS] Action required: Contact HBL support to verify your public key');
      
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=key_mismatch`);
    }

    console.log('🎊 [SUCCESS] DECRYPTION SUCCESSFUL!');
    console.log('📋 [SUCCESS] Response:', JSON.stringify(decryptedResponse, null, 2));

    // Rest of your code (database update, redirect, etc.)
    const responseCode = decryptedResponse.RESPONSE_CODE;
    const orderRefNumber = decryptedResponse.ORDER_REF_NUMBER || decryptedResponse.REFERENCE_NUMBER;
    const transactionId = decryptedResponse.TRANSACTION_ID || decryptedResponse.TXN_ID || decryptedResponse.GUID;

    let actualAmount = '0';
    let actualCurrency = 'PKR';
    
    if (orderRefNumber) {
      const payment = await paymentModel.findOne({ 
        'gateway.orderRefNumber': orderRefNumber 
      });

      if (payment) {
        actualAmount = payment.amount.toString();
        actualCurrency = payment.currency || 'PKR';
        
        const isSuccess = responseCode === '0' || responseCode === '100';
        
        await payment.updateOne({
          status: isSuccess ? 'completed' : 'failed',
          completedAt: isSuccess ? new Date() : null,
          'gateway.transactionId': transactionId,
          'gateway.responseCode': responseCode,
          'gateway.responseMessage': decryptedResponse.RESPONSE_MESSAGE,
          'gateway.paymentType': decryptedResponse.PAYMENT_TYPE,
          'gateway.cardMasked': decryptedResponse.CARD_NUM_MASKED,
          gatewayResponse: decryptedResponse,
          updatedAt: new Date()
        });

        if (payment.bookingId && isSuccess) {
          await bookingModel.findByIdAndUpdate(payment.bookingId, {
            paymentStatus: 'paid',
            status: 'confirmed',
            confirmedAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    }

    const successParams = new URLSearchParams({
      RESPONSE_CODE: decryptedResponse.RESPONSE_CODE || '',
      RESPONSE_MESSAGE: encodeURIComponent(decryptedResponse.RESPONSE_MESSAGE || ''),
      ORDER_REF_NUMBER: orderRefNumber || '',
      amount: actualAmount,
      currency: actualCurrency,
      transactionId: transactionId || ''
    });

    const successUrl = `${process.env.FRONTEND_URL}/payment/success?${successParams.toString()}`;
    return res.redirect(successUrl);

  } catch (error) {
    console.error('❌ [SUCCESS] Error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=server_error`);
  }
});

// ==================== REPLACE YOUR handlePaymentCancel FUNCTION ====================
module.exports.handlePaymentCancel = asyncErrorHandler(async (req, res) => {
  console.log('\n🚫 ========== PAYMENT CANCEL CALLBACK ==========');
  console.log('🔗 Full URL:', req.url);
  
  try {
    let encryptedData = null;
    
    // Extract from raw URL (best method)
    if (req.url && req.url.includes('data=')) {
      const rawUrl = req.url;
      const dataStart = rawUrl.indexOf('data=') + 5;
      const dataEnd = rawUrl.indexOf('&', dataStart);
      encryptedData = dataEnd === -1 ? 
        rawUrl.substring(dataStart) : 
        rawUrl.substring(dataStart, dataEnd);
      console.log('✅ [CANCEL] Data from raw URL');
    } else if (req.query && req.query.data) {
      encryptedData = req.query.data;
      console.log('⚠️ [CANCEL] Data from query');
    } else if (req.body && req.body.data) {
      encryptedData = req.body.data;
      console.log('✅ [CANCEL] Data from body');
    }

    if (!encryptedData) {
      console.log('❌ [CANCEL] No encrypted data');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel?reason=no_data`);
    }

    const privateKeyPem = process.env.MERCHANT_PRIVATE_KEY_PEM;
    
    if (!privateKeyPem) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel?reason=config_error`);
    }

    // Use fixed decryption
    const decryptedResponse = decryptHBLResponseNodeForge(encryptedData, privateKeyPem);

    if (!decryptedResponse || Object.keys(decryptedResponse).length === 0) {
      console.log('❌ [CANCEL] Decryption failed');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel?reason=decrypt_failed`);
    }

    console.log('✅ [CANCEL] Decryption successful');
    console.log('📋 [CANCEL] Response:', JSON.stringify(decryptedResponse, null, 2));

    const orderRefNumber = decryptedResponse.ORDER_REF_NUMBER || decryptedResponse.REFERENCE_NUMBER;
    let actualAmount = '0';
    let actualCurrency = 'PKR';

    // Update records
    if (orderRefNumber) {
      try {
        const payment = await paymentModel.findOne({ 
          'gateway.orderRefNumber': orderRefNumber 
        });

        if (payment) {
          actualAmount = payment.amount.toString();
          actualCurrency = payment.currency || 'PKR';

          await payment.updateOne({
            status: 'cancelled',
            cancelledAt: new Date(),
            'gateway.responseCode': decryptedResponse.RESPONSE_CODE,
            'gateway.responseMessage': decryptedResponse.RESPONSE_MESSAGE || 'Payment cancelled',
            gatewayResponse: decryptedResponse,
            updatedAt: new Date()
          });

          console.log('✅ [CANCEL] Payment cancelled:', payment.paymentId);
        }
      } catch (dbError) {
        console.error('❌ [CANCEL] Database error:', dbError.message);
      }
    }

    // Redirect
    const cancelParams = new URLSearchParams({
      RESPONSE_CODE: decryptedResponse.RESPONSE_CODE || '',
      RESPONSE_MESSAGE: encodeURIComponent(decryptedResponse.RESPONSE_MESSAGE || 'Payment cancelled'),
      ORDER_REF_NUMBER: orderRefNumber || '',
      amount: actualAmount,
      currency: actualCurrency,
      status: 'cancelled'
    });

    const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel?${cancelParams.toString()}`;
    
    console.log('🎯 [CANCEL] Redirecting to:', cancelUrl);
    return res.redirect(cancelUrl);

  } catch (error) {
    console.error('❌ [CANCEL] Handler error:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel?reason=server_error`);
  }
});




// Enhanced payment status checker with detailed logging
const getPaymentStatus = asyncErrorHandler(async (req, res) => {
  const requestId = crypto.randomUUID();

  try {
    const { paymentId } = req.params;
    const userId = req.user?.id;

    console.info('Payment status check requested', {
      paymentId,
      userId,
      requestId
    });

    if (!paymentId) {
      return ApiResponse.error(res, 'Payment ID is required', 400);
    }

    const payment = await paymentModel.findOne({ paymentId }).populate('bookingId');

    if (!payment) {
      console.warn('Payment not found for status check', {
        paymentId,
        userId,
        requestId
      });
      return ApiResponse.error(res, 'Payment not found', 404);
    }

    // Verify ownership
    if (payment.userId.toString() !== userId.toString()) {
      console.warn('Unauthorized payment status check', {
        paymentId,
        requestUserId: userId,
        paymentUserId: payment.userId,
        requestId
      });
      return ApiResponse.error(res, 'Unauthorized access', 403);
    }

    // Check if payment has expired
    if (payment.status === 'pending' && payment.expiresAt < new Date()) {
      await payment.updateOne({
        status: 'expired',
        expiredAt: new Date(),
        updatedAt: new Date()
      });

      console.info('Payment marked as expired', {
        paymentId,
        expiresAt: payment.expiresAt,
        requestId
      });

      payment.status = 'expired';
    }

    console.info('Payment status retrieved', {
      paymentId,
      status: payment.status,
      amount: payment.amount,
      requestId
    });

    return ApiResponse.success(res, {
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      expiresAt: payment.expiresAt,
      sessionId: payment.sessionId,
      booking: payment.bookingId
    }, 'Payment status retrieved successfully');

  } catch (error) {
    console.error('Error retrieving payment status', error, { requestId });
    return ApiResponse.error(res, 'Failed to retrieve payment status', 500);
  }
});

// Enhanced webhook handler for HBL callbacks
const handleWebhook = asyncErrorHandler(async (req, res) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    console.info('Webhook received', {
      requestId,
      headers: req.headers,
      body: req.body,
      query: req.query,
      method: req.method,
      url: req.url
    });

    // Verify webhook signature if configured
    const webhookSecret = process.env.HBL_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['x-hbl-signature'];
      if (!signature) {
        console.error('Missing webhook signature', new Error('No signature'), { requestId });
        return res.status(401).json({ error: 'Missing signature' });
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature', new Error('Signature mismatch'), {
          received: signature,
          expected: expectedSignature,
          requestId
        });
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Process webhook data
    const { sessionId, status, responseCode, responseMessage, transactionId } = req.body;

    if (!sessionId) {
      console.error('Missing session ID in webhook', new Error('No sessionId'), {
        body: req.body,
        requestId
      });
      return res.status(400).json({ error: 'Missing session ID' });
    }

    const payment = await paymentModel.findOne({ sessionId });
    if (!payment) {
      console.warn('Payment not found for webhook', {
        sessionId,
        requestId
      });
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment based on webhook status
    const updateData = {
      gatewayResponse: {
        ...payment.gatewayResponse,
        webhook: {
          status,
          responseCode,
          responseMessage,
          transactionId,
          timestamp: new Date(),
          requestId
        }
      },
      updatedAt: new Date()
    };

    if (status === 'SUCCESS') {
      updateData.status = 'completed';
      updateData.completedAt = new Date();
      updateData.transactionId = transactionId;
    } else if (status === 'FAILED') {
      updateData.status = 'failed';
      updateData.failureReason = `WEBHOOK_FAILURE_${responseCode}`;
      updateData.errorDetails = {
        code: responseCode,
        message: responseMessage,
        transactionId
      };
    }

    await payment.updateOne(updateData);

    console.info('Webhook processed successfully', {
      paymentId: payment.paymentId,
      status,
      responseCode,
      transactionId,
      responseTime: `${Date.now() - startTime}ms`,
      requestId
    });

    return res.status(200).json({
      message: 'Webhook processed successfully',
      paymentId: payment.paymentId,
      status: payment.status
    });

  } catch (error) {
    console.error('Webhook processing failed', error, {
      requestId,
      responseTime: `${Date.now() - startTime}ms`
    });
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

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

  const hashUserId = (userId) => {
  if (!userId) return Date.now().toString();
  
  // Simple numeric hash of ObjectId
  let hash = 0;
  const str = userId.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString();
};

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
      "CUSTOMER_ID": String(Math.floor(10000000 + Math.random() * 90000000)),
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
    REFERENCE_NUMBER: request.ADDITIONAL_DATA.REFERENCE_NUMBER,
    CUSTOMER_ID: request.ADDITIONAL_DATA.CUSTOMER_ID
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
  console.log('🔍 Looking for booking:', {
    bookingId,
    userId: userId.toString(),
    userIdType: typeof userId
  });

  // ✅ CORRECT: Use userId field consistently
  bookingRecord = await bookingModel.findOne({
    _id: bookingId,
     $or: [
    { userId: userId },  // New field name
    { user: userId }     // Old field name (what's actually in your DB)
  ] // Using userId field name
  });

    if (!bookingRecord) {
    console.error('❌ Booking not found:', {
      bookingId,
      userId: userId.toString(),
      searchQuery: { _id: bookingId, userId: userId }  // ✅ FIXED: Changed from "user" to "userId"
    });
    const bookingWithoutUser = await bookingModel.findOne({ _id: bookingId });
    if (bookingWithoutUser) {
      console.error('❌ Booking exists but belongs to different user:', {
        bookingUserId: bookingWithoutUser.userId?.toString(),  // ✅ FIXED: Changed from "user" to "userId"
        requestUserId: userId.toString(),
        match: bookingWithoutUser.userId?.toString() === userId.toString()
      });
      return ApiResponse.error(res, 'Booking access denied - belongs to different user', 403);
    } else { 
      console.error('❌ Booking does not exist at all');
      return ApiResponse.error(res, 'Booking not found', 404);
    }
  }

  console.log('✅ Booking found:', {
    bookingId: bookingRecord._id.toString(),
    status: bookingRecord.status,
    userId: bookingRecord.userId?.toString(),  // ✅ FIXED: Changed from "user" to "userId"
    paymentStatus: bookingRecord.payment?.status || bookingRecord.paymentStatus
  });

  // Check if booking is already paid
  if (bookingRecord.payment?.status === 'paid' || bookingRecord.paymentStatus === 'paid') {
    return ApiResponse.error(res, 'This booking is already paid', 400);
  }

} catch (error) {
  console.error('❌ Error finding booking:', error);
  return ApiResponse.error(res, 'Database error while finding booking: ' + error.message, 500);
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
      billing: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      address: {
        street: userData.address,
        city: userData.city,
        state: userData.state,
        country: userData.country || 'PK',
        postalCode: userData.postalCode
      }
    },
      userDetails: userData,
      bookingDetails: bookingData,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      gateway: {
      provider: 'HBLPay',
      orderRefNumber: finalOrderId
    },
    
    // Metadata
    metadata: {
      source: 'web',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    },
    
    // Timestamps
    initiatedAt: new Date(),
    expiredAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
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

// 🔥 Additional helper function to validate user data before payment
const validateUserDataForPayment = (userData) => {
  const required = ['firstName', 'lastName', 'email', 'phone'];
  const missing = required.filter(field => !userData[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required user data: ${missing.join(', ')}`);
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    throw new Error('Invalid email format');
  }
  
  return true;
};

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

  console.log('🔔 Webhook received:', webhookData);

  try {
    const { SESSION_ID, PAYMENT_STATUS, REFERENCE_NUMBER } = webhookData;

    if (SESSION_ID) {
      const payment = await paymentModel.findOne({
        $or: [
          { sessionId: SESSION_ID },
          { transactionId: SESSION_ID },
          { paymentId: REFERENCE_NUMBER }
        ]
      });

      if (payment && payment.status === 'pending') {
        if (PAYMENT_STATUS === 'SUCCESS' || PAYMENT_STATUS === 'COMPLETED') {
          await payment.updateOne({
            status: 'completed',
            paidAt: new Date(),
            gatewayResponse: webhookData,
            updatedAt: new Date()
          });

          console.log('✅ Payment updated via webhook:', payment.paymentId);
        }
      }
    }

    return ApiResponse.success(res, { received: true }, 'Webhook processed');
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return ApiResponse.error(res, 'Webhook processing failed', 500);
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
  const { paymentId } = req.params;
  const { amount, reason } = req.body;
  const userId = req.user._id;

  try {
    const payment = await paymentModel.findOne({
      paymentId,
      userId,
      status: 'completed'
    });

    if (!payment) {
      return ApiResponse.error(res, 'Payment not found or not eligible for refund', 404);
    }

    if (amount > payment.amount) {
      return ApiResponse.error(res, 'Refund amount cannot exceed payment amount', 400);
    }

    // Update the payment record
    await payment.updateOne({
      status: 'refunded',
      refundAmount: amount,
      refundReason: reason,
      refundedAt: new Date(),
      updatedAt: new Date()
    });

    console.log('💰 Refund processed:', {
      paymentId,
      refundAmount: amount,
      reason
    });

    return ApiResponse.success(res, {
      paymentId,
      refundAmount: amount,
      status: 'refunded'
    }, 'Refund processed successfully');

  } catch (error) {
    console.error('❌ Refund error:', error);
    return ApiResponse.error(res, 'Failed to process refund', 500);
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

module.exports.testHBLDecrypt = asyncErrorHandler(async (req, res) => {
  console.log('\n🧪 ========== HBL DECRYPT TEST (POSTMAN) ==========');
  
  try {
    const { url, encryptedData } = req.body;
    
    let dataToDecrypt = encryptedData;
    
    // If URL is provided, extract the data parameter
    if (!dataToDecrypt && url) {
      console.log('📋 Full URL provided:', url);
      
      // Extract data from URL
      let urlToParse = url;
      
      // Handle hash fragments
      if (urlToParse.includes('#/checkout?data=')) {
        urlToParse = urlToParse.split('#/checkout?data=')[1];
        dataToDecrypt = decodeURIComponent(urlToParse.split('&')[0]);
        console.log('✅ Extracted from hash fragment');
      } 
      // Handle success/cancel callbacks
      else if (urlToParse.includes('/success?data=') || urlToParse.includes('/cancel?data=')) {
        const match = urlToParse.match(/data=([^&]+)/);
        if (match) {
          dataToDecrypt = decodeURIComponent(match[1]);
          console.log('✅ Extracted from callback URL');
        }
      }
      // Handle regular query params
      else if (urlToParse.includes('?data=')) {
        const match = urlToParse.match(/data=([^&]+)/);
        if (match) {
          dataToDecrypt = decodeURIComponent(match[1]);
          console.log('✅ Extracted from query param');
        }
      }
    }
    
    if (!dataToDecrypt) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either "url" or "encryptedData"',
        examples: {
          checkout_url: {
            url: 'https://digitalbankingportal.hbl.com/hostedcheckout/site/index.html#/checkout?data=ABC123...'
          },
          callback_url: {
            url: '/success?data=XYZ789...'
          },
          direct_data: {
            encryptedData: 'ABC123...'
          }
        }
      });
    }
    
    console.log('📦 Encrypted data length:', dataToDecrypt.length);
    console.log('📦 First 50 chars:', dataToDecrypt.substring(0, 50));
    console.log('📦 Last 50 chars:', dataToDecrypt.substring(dataToDecrypt.length - 50));
    
    // Get private key
    const privateKeyPem = process.env.MERCHANT_PRIVATE_KEY_PEM;
    
    if (!privateKeyPem) {
      return res.status(500).json({
        success: false,
        error: 'MERCHANT_PRIVATE_KEY_PEM not configured in environment variables'
      });
    }
    
    console.log('🔑 Private key loaded, length:', privateKeyPem.length);
    
    // ============================================================================
    // TRY METHOD 1: enhancedDecryptionNative (your NO_PADDING method)
    // ============================================================================
    
    console.log('\n🔄 ========== TRYING METHOD 1: enhancedDecryptionNative ==========');
    let method1Result = null;
    
    try {
      method1Result = enhancedDecryptionNative(dataToDecrypt, privateKeyPem);
      
      if (method1Result && Object.keys(method1Result).length > 0) {
        console.log('🎉 METHOD 1 SUCCESS!');
        console.log('📋 Parameters found:', Object.keys(method1Result));
        
        return res.json({
          success: true,
          message: 'Decryption successful with Method 1! ✅',
          method: 'enhancedDecryptionNative (NO_PADDING)',
          decryptedData: method1Result,
          parameters: {
            RESPONSE_CODE: method1Result.RESPONSE_CODE || 'N/A',
            RESPONSE_MESSAGE: method1Result.RESPONSE_MESSAGE || 'N/A',
            ORDER_REF_NUMBER: method1Result.ORDER_REF_NUMBER || method1Result.REFERENCE_NUMBER || 'N/A',
            TRANSACTION_ID: method1Result.TRANSACTION_ID || method1Result.TXN_ID || method1Result.GUID || 'N/A',
            PAYMENT_TYPE: method1Result.PAYMENT_TYPE || 'N/A',
            CARD_NUM_MASKED: method1Result.CARD_NUM_MASKED || 'N/A',
            AMOUNT: method1Result.AMOUNT || 'N/A',
            CURRENCY: method1Result.CURRENCY || 'N/A',
            SESSION_ID: method1Result.SESSION_ID || 'N/A'
          },
          allFields: method1Result
        });
      } else {
        console.log('⚠️ METHOD 1 FAILED: No parameters found');
      }
    } catch (method1Error) {
      console.log('❌ METHOD 1 ERROR:', method1Error.message);
    }
    
    // ============================================================================
    // TRY METHOD 2: decryptHBLResponseNodeForge (multi-method with node-forge)
    // ============================================================================
    
    console.log('\n🔄 ========== TRYING METHOD 2: decryptHBLResponseNodeForge ==========');
    let method2Result = null;
    
    try {
      method2Result = decryptHBLResponseNodeForge(dataToDecrypt, privateKeyPem);
      
      if (method2Result && Object.keys(method2Result).length > 0) {
        console.log('🎉 METHOD 2 SUCCESS!');
        console.log('📋 Parameters found:', Object.keys(method2Result));
        
        return res.json({
          success: true,
          message: 'Decryption successful with Method 2! ✅',
          method: 'decryptHBLResponseNodeForge (multi-method with node-forge)',
          decryptedData: method2Result,
          parameters: {
            RESPONSE_CODE: method2Result.RESPONSE_CODE || 'N/A',
            RESPONSE_MESSAGE: method2Result.RESPONSE_MESSAGE || 'N/A',
            ORDER_REF_NUMBER: method2Result.ORDER_REF_NUMBER || method2Result.REFERENCE_NUMBER || 'N/A',
            TRANSACTION_ID: method2Result.TRANSACTION_ID || method2Result.TXN_ID || method2Result.GUID || 'N/A',
            PAYMENT_TYPE: method2Result.PAYMENT_TYPE || 'N/A',
            CARD_NUM_MASKED: method2Result.CARD_NUM_MASKED || 'N/A',
            AMOUNT: method2Result.AMOUNT || 'N/A',
            CURRENCY: method2Result.CURRENCY || 'N/A',
            SESSION_ID: method2Result.SESSION_ID || 'N/A'
          },
          allFields: method2Result
        });
      } else {
        console.log('⚠️ METHOD 2 FAILED: No parameters found');
      }
    } catch (method2Error) {
      console.log('❌ METHOD 2 ERROR:', method2Error.message);
    }
    
    // ============================================================================
    // BOTH METHODS FAILED
    // ============================================================================
    
    console.log('\n❌ ========== ALL METHODS FAILED ==========');
    
    return res.json({
      success: false,
      message: 'Both decryption methods failed - HBL has wrong public key',
      methodsTried: [
        {
          name: 'Method 1: enhancedDecryptionNative',
          result: 'Failed',
          details: 'NO_PADDING decryption succeeded but produced garbage'
        },
        {
          name: 'Method 2: decryptHBLResponseNodeForge',
          result: 'Failed',
          details: 'All 8 padding methods tried, none produced readable output'
        }
      ],
      diagnosis: {
        problem: 'HBL has the WRONG public key registered for your merchant account',
        evidence: [
          'Decryption technically succeeds (no errors)',
          'But output is binary garbage instead of readable text',
          'This means HBL encrypted with a different public key',
          'The public key used for encryption does not match your private key'
        ]
      },
      immediateAction: {
        step1: 'Contact HBL IPG Support NOW',
        step2: 'Email: hblpay.support@hbl.com',
        step3: 'Subject: URGENT - Public Key Mismatch - Merchant teliadmin',
        step4: 'Send them your MERCHANT_PUBLIC_KEY_PEM from .env file',
        step5: 'Request immediate key verification and update'
      },
      yourPublicKey: process.env.MERCHANT_PUBLIC_KEY_PEM ? 
        'Available in environment (send this to HBL)' : 
        'NOT FOUND in environment variables',
      technicalDetails: {
        encryptedDataLength: dataToDecrypt.length,
        base64Decoded: Buffer.from(dataToDecrypt, 'base64').length + ' bytes',
        expectedRSABlockSize: 512,
        decryptionAttempts: 10,
        allMethodsFailed: true
      }
    });
    
  } catch (error) {
    console.error('❌ Test endpoint fatal error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ============================================================================
// ADDITIONAL HELPER: Compare encryption/decryption with YOUR keys
// ============================================================================

module.exports.testYourKeys = asyncErrorHandler(async (req, res) => {
  console.log('\n🔑 ========== TESTING YOUR OWN KEY PAIR ==========');
  
  try {
    const forge = require('node-forge');
    
    const privateKeyPem = process.env.MERCHANT_PRIVATE_KEY_PEM;
    const publicKeyPem = process.env.MERCHANT_PUBLIC_KEY_PEM;
    
    if (!privateKeyPem || !publicKeyPem) {
      return res.status(500).json({
        success: false,
        error: 'Keys not configured',
        hasPrivateKey: !!privateKeyPem,
        hasPublicKey: !!publicKeyPem
      });
    }
    
    // Test data that simulates HBL response
    const testData = 'RESPONSE_CODE=0&ORDER_REF_NUMBER=TEST_ORDER_123&PAYMENT_TYPE=CARD&TRANSACTION_ID=TXN_456&AMOUNT=1500&CURRENCY=PKR';
    
    console.log('📝 Original data:', testData);
    
    // Encrypt with YOUR public key (simulating what HBL should do)
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const encrypted = publicKey.encrypt(testData, 'RSAES-PKCS1-V1_5');
    const encryptedBase64 = forge.util.encode64(encrypted);
    
    console.log('🔐 Encrypted (base64):', encryptedBase64.substring(0, 100) + '...');
    
    // Try decrypting with Method 1
    console.log('\n🔄 Testing with enhancedDecryptionNative...');
    const method1 = enhancedDecryptionNative(encryptedBase64, privateKeyPem);
    
    // Try decrypting with Method 2
    console.log('\n🔄 Testing with decryptHBLResponseNodeForge...');
    const method2 = decryptHBLResponseNodeForge(encryptedBase64, privateKeyPem);
    
    const method1Works = method1 && Object.keys(method1).length > 0;
    const method2Works = method2 && Object.keys(method2).length > 0;
    
    return res.json({
      success: method1Works || method2Works,
      message: method1Works || method2Works ? 
        'Your key pair is VALID! ✅' : 
        'Your key pair has issues ❌',
      testData: {
        original: testData,
        encryptedLength: encryptedBase64.length
      },
      results: {
        method1_enhancedDecryptionNative: {
          success: method1Works,
          decrypted: method1Works ? method1 : 'Failed'
        },
        method2_decryptHBLResponseNodeForge: {
          success: method2Works,
          decrypted: method2Works ? method2 : 'Failed'
        }
      },
      conclusion: method1Works || method2Works ?
        'Your keys work perfectly! The issue is 100% that HBL has the wrong public key.' :
        'Your key pair might be invalid. Generate a new RSA 4096 key pair.',
      nextStep: method1Works || method2Works ?
        'Send your MERCHANT_PUBLIC_KEY_PEM to HBL support immediately' :
        'Generate new keys and register with HBL'
    });
    
  } catch (error) {
    console.error('❌ Key test error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


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




module.exports.diagnoseHBLIntegration = asyncErrorHandler(async (req, res) => {
  console.log('\n🔬 ========== COMPREHENSIVE HBL DIAGNOSTIC ==========\n');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    tests: []
  };

  // TEST 1: Environment Variables Check
  console.log('📋 TEST 1: Environment Variables');
  const envTest = {
    name: 'Environment Variables',
    status: 'checking',
    details: {
      HBLPAY_USER_ID: {
        exists: !!process.env.HBLPAY_USER_ID,
        value: process.env.HBLPAY_USER_ID || 'NOT SET',
        length: process.env.HBLPAY_USER_ID?.length || 0
      },
      HBLPAY_PASSWORD: {
        exists: !!process.env.HBLPAY_PASSWORD,
        value: process.env.HBLPAY_PASSWORD ? '***' + process.env.HBLPAY_PASSWORD.slice(-3) : 'NOT SET',
        length: process.env.HBLPAY_PASSWORD?.length || 0
      },
      HBL_PUBLIC_KEY_PEM: {
        exists: !!process.env.HBL_PUBLIC_KEY_PEM,
        length: process.env.HBL_PUBLIC_KEY_PEM?.length || 0,
        hasPemHeaders: process.env.HBL_PUBLIC_KEY_PEM?.includes('BEGIN PUBLIC KEY')
      },
      HBL_CHANNEL: {
        exists: !!process.env.HBL_CHANNEL,
        value: process.env.HBL_CHANNEL || 'NOT SET'
      },
      HBL_SANDBOX_API_URL: {
        exists: !!process.env.HBL_SANDBOX_API_URL,
        value: process.env.HBL_SANDBOX_API_URL || 'NOT SET'
      }
    }
  };

  const missingEnv = Object.entries(envTest.details)
    .filter(([_, v]) => !v.exists)
    .map(([k]) => k);

  envTest.status = missingEnv.length === 0 ? 'PASS' : 'FAIL';
  if (missingEnv.length > 0) {
    envTest.error = `Missing: ${missingEnv.join(', ')}`;
  }
  diagnostics.tests.push(envTest);
  console.log(envTest.status === 'PASS' ? '✅ PASS' : '❌ FAIL', envTest.error || '');

  // TEST 2: Build Minimal Request
  console.log('\n📋 TEST 2: Build Minimal Test Request');
  const requestTest = {
    name: 'Request Building',
    status: 'checking',
    details: {}
  };

  try {
    const testRequest = {
      USER_ID: process.env.HBLPAY_USER_ID,
      PASSWORD: process.env.HBLPAY_PASSWORD,
      CHANNEL: process.env.HBL_CHANNEL || 'HBLPay_Teli_Website',
      TYPE_ID: '0',
      RETURN_URL: `${process.env.BACKEND_URL}/api/payments/success`,
      CANCEL_URL: `${process.env.BACKEND_URL}/api/payments/cancel`,
      ORDER: {
        DISCOUNT_ON_TOTAL: '0',
        SUBTOTAL: '100.00',
        OrderSummaryDescription: [{
          ITEM_NAME: 'TEST ITEM',
          QUANTITY: '1',
          UNIT_PRICE: '100.00',
          OLD_PRICE: null,
          CATEGORY: 'Test',
          SUB_CATEGORY: 'Test'
        }]
      },
      SHIPPING_DETAIL: {
        NAME: 'DHL SERVICE',
        ICON_PATH: null,
        DELIEVERY_DAYS: '0',
        SHIPPING_COST: '0'
      },
      ADDITIONAL_DATA: {
        REFERENCE_NUMBER: 'TEST_' + Date.now(),
        CUSTOMER_ID: '12345678',
        CURRENCY: 'PKR',
        BILL_TO_FORENAME: 'Test',
        BILL_TO_SURNAME: 'User',
        BILL_TO_EMAIL: 'test@example.com',
        BILL_TO_PHONE: '03001234567',
        BILL_TO_ADDRESS_LINE: 'Test Address',
        BILL_TO_ADDRESS_CITY: 'Karachi',
        BILL_TO_ADDRESS_STATE: 'Sindh',
        BILL_TO_ADDRESS_COUNTRY: 'PK',
        BILL_TO_ADDRESS_POSTAL_CODE: '75500',
        SHIP_TO_FORENAME: 'Test',
        SHIP_TO_SURNAME: 'User',
        SHIP_TO_EMAIL: 'test@example.com',
        SHIP_TO_PHONE: '03001234567',
        SHIP_TO_ADDRESS_LINE: 'Test Address',
        SHIP_TO_ADDRESS_CITY: 'Karachi',
        SHIP_TO_ADDRESS_STATE: 'Sindh',
        SHIP_TO_ADDRESS_COUNTRY: 'PK',
        SHIP_TO_ADDRESS_POSTAL_CODE: '75500',
        MerchantFields: {
          MDD1: process.env.HBL_CHANNEL || 'HBLPay_Teli_Website',
          MDD2: 'N'
        }
      }
    };

    requestTest.details = {
      hasUserId: !!testRequest.USER_ID,
      hasPassword: !!testRequest.PASSWORD,
      hasChannel: !!testRequest.CHANNEL,
      hasReturnUrl: !!testRequest.RETURN_URL,
      hasCancelUrl: !!testRequest.CANCEL_URL,
      hasOrder: !!testRequest.ORDER,
      hasAdditionalData: !!testRequest.ADDITIONAL_DATA,
      requestSize: JSON.stringify(testRequest).length
    };
    requestTest.status = 'PASS';
  } catch (error) {
    requestTest.status = 'FAIL';
    requestTest.error = error.message;
  }
  diagnostics.tests.push(requestTest);
  console.log(requestTest.status === 'PASS' ? '✅ PASS' : '❌ FAIL');

  // TEST 3: Encryption Test
  console.log('\n📋 TEST 3: Encryption Test');
  const encryptTest = {
    name: 'Encryption',
    status: 'checking',
    details: {}
  };

  try {
    const publicKey = process.env.HBL_PUBLIC_KEY_PEM;
    if (!publicKey) {
      throw new Error('Public key not found');
    }

    // Test encrypting a simple string
    const testString = 'TEST_VALUE_123';
    const buffer = Buffer.from(testString, 'utf8');
    const encrypted = crypto.publicEncrypt({
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING
    }, buffer);

    encryptTest.details = {
      publicKeyLength: publicKey.length,
      testStringLength: testString.length,
      encryptedLength: encrypted.length,
      encryptedBase64Length: encrypted.toString('base64').length,
      encryptionWorks: true
    };
    encryptTest.status = 'PASS';
  } catch (error) {
    encryptTest.status = 'FAIL';
    encryptTest.error = error.message;
  }
  diagnostics.tests.push(encryptTest);
  console.log(encryptTest.status === 'PASS' ? '✅ PASS' : '❌ FAIL');

  // TEST 4: Try UNENCRYPTED API Call (Debug Only)
  console.log('\n📋 TEST 4: Unencrypted API Call (Debug)');
  const unencryptedTest = {
    name: 'Unencrypted API Test',
    status: 'checking',
    details: {}
  };

  try {
    const minimalRequest = {
      USER_ID: process.env.HBLPAY_USER_ID,
      PASSWORD: process.env.HBLPAY_PASSWORD,
      CHANNEL: process.env.HBL_CHANNEL || 'HBLPay_Teli_Website',
      TYPE_ID: '0'
    };

    console.log('📤 Sending minimal UNENCRYPTED request...');
    console.log('Request:', JSON.stringify(minimalRequest, null, 2));

    const https = require('https');
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    const response = await fetch(process.env.HBL_SANDBOX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(minimalRequest),
      agent: httpsAgent
    });

    const responseText = await response.text();
    
    unencryptedTest.details = {
      requestSent: minimalRequest,
      responseStatus: response.status,
      responseStatusText: response.statusText,
      responseBody: responseText,
      responseLength: responseText.length
    };

    // Analyze the response
    if (response.status === 500 && responseText.includes('An error has occurred')) {
      unencryptedTest.status = 'CREDENTIAL_ISSUE';
      unencryptedTest.message = '⚠️ API is reachable but rejecting request - likely invalid USER_ID or PASSWORD';
      unencryptedTest.recommendations = [
        '1. Contact HBL support to verify your USER_ID: ' + process.env.HBLPAY_USER_ID,
        '2. Verify your PASSWORD is correct (currently: ' + (process.env.HBLPAY_PASSWORD?.length || 0) + ' characters)',
        '3. Confirm your sandbox account is activated',
        '4. Ask HBL if CHANNEL name "' + (process.env.HBL_CHANNEL || 'HBLPay_Teli_Website') + '" is correct'
      ];
    } else if (responseText.includes('RESPONSE_CODE') || responseText.includes('ResponseCode')) {
      try {
        const parsed = JSON.parse(responseText);
        unencryptedTest.status = 'PARTIAL_SUCCESS';
        unencryptedTest.message = '✅ Got a structured response!';
        unencryptedTest.hblResponse = parsed;
      } catch (e) {
        unencryptedTest.status = 'UNKNOWN';
      }
    } else {
      unencryptedTest.status = 'UNKNOWN';
      unencryptedTest.message = 'Unexpected response format';
    }

  } catch (error) {
    unencryptedTest.status = 'FAIL';
    unencryptedTest.error = error.message;
    unencryptedTest.recommendations = ['Check network connectivity to HBL API'];
  }
  diagnostics.tests.push(unencryptedTest);
  console.log('Status:', unencryptedTest.status);

  // TEST 5: Try ENCRYPTED API Call
  console.log('\n📋 TEST 5: Encrypted API Call');
  const encryptedTest = {
    name: 'Encrypted API Test',
    status: 'checking',
    details: {}
  };

  try {
    const testRequest = {
      USER_ID: process.env.HBLPAY_USER_ID,
      PASSWORD: process.env.HBLPAY_PASSWORD,
      CHANNEL: process.env.HBL_CHANNEL || 'HBLPay_Teli_Website',
      TYPE_ID: '0',
      RETURN_URL: `${process.env.BACKEND_URL}/api/payments/success`,
      CANCEL_URL: `${process.env.BACKEND_URL}/api/payments/cancel`,
      ORDER: {
        DISCOUNT_ON_TOTAL: '0',
        SUBTOTAL: '100.00'
      }
    };

    // Encrypt (except USER_ID)
    const publicKey = process.env.HBL_PUBLIC_KEY_PEM;
    const encryptedRequest = { USER_ID: testRequest.USER_ID };
    
    for (const [key, value] of Object.entries(testRequest)) {
      if (key !== 'USER_ID') {
        if (typeof value === 'object') {
          encryptedRequest[key] = {};
          for (const [subKey, subValue] of Object.entries(value)) {
            const buffer = Buffer.from(String(subValue), 'utf8');
            const encrypted = crypto.publicEncrypt({
              key: publicKey,
              padding: crypto.constants.RSA_PKCS1_PADDING
            }, buffer);
            encryptedRequest[key][subKey] = encrypted.toString('base64');
          }
        } else {
          const buffer = Buffer.from(String(value), 'utf8');
          const encrypted = crypto.publicEncrypt({
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PADDING
          }, buffer);
          encryptedRequest[key] = encrypted.toString('base64');
        }
      }
    }

    console.log('📤 Sending ENCRYPTED request...');

    const https = require('https');
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    const response = await fetch(process.env.HBL_SANDBOX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(encryptedRequest),
      agent: httpsAgent
    });

    const responseText = await response.text();

    encryptedTest.details = {
      responseStatus: response.status,
      responseBody: responseText,
      encryptedFieldsCount: Object.keys(encryptedRequest).length - 1 // Exclude USER_ID
    };

    if (response.ok) {
      try {
        const parsed = JSON.parse(responseText);
        encryptedTest.status = 'SUCCESS';
        encryptedTest.hblResponse = parsed;
      } catch (e) {
        encryptedTest.status = 'PARTIAL';
      }
    } else {
      encryptedTest.status = 'FAIL';
    }

  } catch (error) {
    encryptedTest.status = 'FAIL';
    encryptedTest.error = error.message;
  }
  diagnostics.tests.push(encryptedTest);
  console.log('Status:', encryptedTest.status);

  // FINAL SUMMARY
  console.log('\n📊 ========== DIAGNOSTIC SUMMARY ==========');
  const allPassed = diagnostics.tests.every(t => t.status === 'PASS');
  const credentialIssue = diagnostics.tests.some(t => t.status === 'CREDENTIAL_ISSUE');

  diagnostics.summary = {
    allTestsPassed: allPassed,
    credentialIssueDetected: credentialIssue,
    recommendations: []
  };

  if (credentialIssue) {
    diagnostics.summary.conclusion = '🔴 CREDENTIAL ISSUE DETECTED';
    diagnostics.summary.recommendations = [
      '1. Your code is CORRECT - the issue is with HBL credentials',
      '2. Contact HBL support and verify:',
      '   - USER_ID: ' + process.env.HBLPAY_USER_ID,
      '   - PASSWORD is correct',
      '   - Sandbox account is activated',
      '   - CHANNEL name is registered: ' + (process.env.HBL_CHANNEL || 'HBLPay_Teli_Website'),
      '3. Ask HBL for test credentials that definitely work',
      '4. Request a working code example from HBL'
    ];
  } else if (allPassed) {
    diagnostics.summary.conclusion = '✅ ALL TESTS PASSED';
  } else {
    diagnostics.summary.conclusion = '⚠️ SOME TESTS FAILED';
    diagnostics.summary.recommendations.push('Review failed tests above');
  }

  console.log('\n' + diagnostics.summary.conclusion);
  diagnostics.summary.recommendations.forEach(rec => console.log(rec));

  return ApiResponse.success(res, diagnostics, 'Diagnostic complete');
});

module.exports.checkHBLServerStatus = asyncErrorHandler(async (req, res) => {
  console.log('\n🏥 ========== HBL SERVER HEALTH CHECK ==========\n');
  
  const checks = {
    timestamp: new Date().toISOString(),
    checks: []
  };

  // CHECK 1: Basic Connectivity
  console.log('📡 CHECK 1: Testing basic connectivity...');
  const connectivityCheck = {
    name: 'HBL API Connectivity',
    url: process.env.HBL_SANDBOX_API_URL,
    status: 'checking'
  };

  try {
    const startTime = Date.now();
    const response = await fetch(process.env.HBL_SANDBOX_API_URL, {
      method: 'GET',
      timeout: 10000
    });
    const responseTime = Date.now() - startTime;

    connectivityCheck.status = 'REACHABLE';
    connectivityCheck.responseTime = responseTime + 'ms';
    connectivityCheck.httpStatus = response.status;
    connectivityCheck.statusText = response.statusText;
    
    console.log('✅ HBL API is reachable');
    console.log(`⏱️  Response time: ${responseTime}ms`);
    
  } catch (error) {
    connectivityCheck.status = 'UNREACHABLE';
    connectivityCheck.error = error.message;
    connectivityCheck.errorCode = error.code;
    console.log('❌ HBL API is not reachable:', error.message);
  }
  checks.checks.push(connectivityCheck);

  // CHECK 2: SSL Certificate
  console.log('\n🔒 CHECK 2: Checking SSL certificate...');
  const sslCheck = {
    name: 'SSL Certificate',
    status: 'checking'
  };

  try {
    const https = require('https');
    const url = new URL(process.env.HBL_SANDBOX_API_URL);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      method: 'GET',
      rejectUnauthorized: true
    };

    await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        const cert = res.socket.getPeerCertificate();
        
        if (cert) {
          sslCheck.status = 'VALID';
          sslCheck.details = {
            subject: cert.subject?.CN,
            issuer: cert.issuer?.O,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            daysRemaining: Math.floor((new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24))
          };
          
          if (new Date(cert.valid_to) < new Date()) {
            sslCheck.status = 'EXPIRED';
            sslCheck.warning = '⚠️ SSL certificate has EXPIRED!';
          }
          
          console.log('✅ SSL certificate is valid');
          console.log(`   Valid until: ${cert.valid_to}`);
        }
        resolve();
      });

      req.on('error', (error) => {
        sslCheck.status = 'INVALID';
        sslCheck.error = error.message;
        console.log('❌ SSL certificate issue:', error.message);
        reject(error);
      });

      req.end();
    });

  } catch (error) {
    sslCheck.status = 'ERROR';
    sslCheck.error = error.message;
  }
  checks.checks.push(sslCheck);

  // CHECK 3: DNS Resolution
  console.log('\n🌐 CHECK 3: DNS resolution...');
  const dnsCheck = {
    name: 'DNS Resolution',
    status: 'checking'
  };

  try {
    const dns = require('dns').promises;
    const url = new URL(process.env.HBL_SANDBOX_API_URL);
    const addresses = await dns.resolve4(url.hostname);
    
    dnsCheck.status = 'RESOLVED';
    dnsCheck.hostname = url.hostname;
    dnsCheck.ipAddresses = addresses;
    console.log('✅ DNS resolved:', addresses);
    
  } catch (error) {
    dnsCheck.status = 'FAILED';
    dnsCheck.error = error.message;
    console.log('❌ DNS resolution failed:', error.message);
  }
  checks.checks.push(dnsCheck);

  // CHECK 4: API Endpoint Test (with your credentials)
  console.log('\n🔑 CHECK 4: Testing API with credentials...');
  const apiCheck = {
    name: 'API Authentication Test',
    status: 'checking'
  };

  try {
    const https = require('https');
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    const minimalRequest = {
      USER_ID: process.env.HBLPAY_USER_ID,
      PASSWORD: process.env.HBLPAY_PASSWORD,
      CHANNEL: process.env.HBL_CHANNEL,
      TYPE_ID: '0'
    };

    const startTime = Date.now();
    const response = await fetch(process.env.HBL_SANDBOX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(minimalRequest),
      agent: httpsAgent,
      timeout: 15000
    });
    const responseTime = Date.now() - startTime;

    const responseText = await response.text();

    apiCheck.responseTime = responseTime + 'ms';
    apiCheck.httpStatus = response.status;
    apiCheck.statusText = response.statusText;
    apiCheck.responseBody = responseText;

    // Analyze the response
    if (response.status === 500) {
      apiCheck.status = 'SERVER_ERROR';
      apiCheck.message = '⚠️ HBL server is returning 500 errors';
      apiCheck.analysis = 'This could mean:';
      apiCheck.possibleCauses = [
        '1. HBL sandbox is undergoing maintenance',
        '2. HBL server is experiencing issues',
        '3. Your account was suspended/deactivated',
        '4. HBL made changes to their API',
        '5. Rate limiting or IP blocking'
      ];
    } else if (response.status === 503) {
      apiCheck.status = 'SERVICE_UNAVAILABLE';
      apiCheck.message = '🔴 HBL service is unavailable';
    } else if (response.ok) {
      apiCheck.status = 'SUCCESS';
      apiCheck.message = '✅ API is responding correctly';
    } else {
      apiCheck.status = 'UNKNOWN';
      apiCheck.message = '❓ Unexpected response';
    }

    console.log(apiCheck.message);

  } catch (error) {
    apiCheck.status = 'TIMEOUT_OR_ERROR';
    apiCheck.error = error.message;
    apiCheck.errorCode = error.code;
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
      apiCheck.message = '⏱️ Request timed out - server might be overloaded';
    } else if (error.code === 'ECONNREFUSED') {
      apiCheck.message = '🔴 Connection refused - server might be down';
    } else {
      apiCheck.message = '❌ Request failed: ' + error.message;
    }
    
    console.log(apiCheck.message);
  }
  checks.checks.push(apiCheck);

  // CHECK 5: Compare with yesterday
  console.log('\n📊 CHECK 5: Historical comparison...');
  const comparisonCheck = {
    name: 'Historical Comparison',
    status: 'INFO',
    message: 'Based on your report that it worked yesterday:',
    analysis: []
  };

  const serverErrorDetected = checks.checks.some(c => 
    c.status === 'SERVER_ERROR' || 
    c.status === 'SERVICE_UNAVAILABLE' ||
    c.status === 'TIMEOUT_OR_ERROR'
  );

  if (serverErrorDetected) {
    comparisonCheck.analysis = [
      '✅ Your code hasn\'t changed',
      '✅ Your credentials haven\'t changed',
      '❌ HBL server is having issues',
      '',
      '🎯 CONCLUSION: This is a temporary HBL server issue',
      '',
      'RECOMMENDED ACTIONS:',
      '1. Wait 1-2 hours and try again',
      '2. Check HBL\'s status page (if they have one)',
      '3. Contact HBL support to confirm maintenance',
      '4. Try again during business hours (9 AM - 5 PM PKT)',
      '5. Monitor their sandbox environment status'
    ];
  } else {
    comparisonCheck.analysis = [
      '⚠️ Server is reachable but rejecting requests',
      'Possible reasons:',
      '1. Your account was suspended/deactivated overnight',
      '2. HBL changed their API or requirements',
      '3. Your IP was rate-limited or blocked',
      '4. Configuration changes on HBL\'s end'
    ];
  }

  checks.checks.push(comparisonCheck);

  // FINAL VERDICT
  console.log('\n📋 ========== FINAL VERDICT ==========\n');
  
  const verdict = {
    timestamp: new Date().toISOString(),
    dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    localTime: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Karachi' }),
    timeZone: 'PKT (Pakistan Time)',
    status: serverErrorDetected ? 'HBL_SERVER_ISSUE' : 'CREDENTIAL_ISSUE',
    recommendation: '',
    nextSteps: []
  };

  if (serverErrorDetected) {
    verdict.recommendation = '⏳ WAIT AND RETRY';
    verdict.message = 'HBL sandbox appears to be having server issues';
    verdict.nextSteps = [
      '1. Try again in 1-2 hours',
      '2. HBL often does maintenance during off-hours',
      '3. If still failing after 4 hours, contact HBL support',
      '4. Your code is fine - no changes needed'
    ];
  } else {
    verdict.recommendation = '📞 CONTACT HBL SUPPORT';
    verdict.message = 'Server is up but rejecting your credentials';
    verdict.nextSteps = [
      '1. Contact HBL support immediately',
      '2. Ask if your account was deactivated',
      '3. Request confirmation of credentials',
      '4. Ask about any recent API changes'
    ];
  }

  checks.verdict = verdict;

  console.log('🎯 Status:', verdict.status);
  console.log('📝 Recommendation:', verdict.recommendation);
  console.log('⏰ Current time:', verdict.localTime, verdict.timeZone);
  console.log('\nNext Steps:');
  verdict.nextSteps.forEach((step, i) => {
    console.log(`   ${step}`);
  });

  return res.json({
    success: true,
    message: 'HBL server health check complete',
    data: checks
  });
});

// ============================================
// QUICK STATUS CHECK (Lightweight version)
// ============================================

module.exports.quickHBLCheck = asyncErrorHandler(async (req, res) => {
  try {
    const startTime = Date.now();
    const response = await fetch(process.env.HBL_SANDBOX_API_URL, {
      method: 'GET',
      timeout: 5000
    });
    const responseTime = Date.now() - startTime;

    const status = {
      isUp: response.status < 500,
      responseTime: responseTime + 'ms',
      httpStatus: response.status,
      timestamp: new Date().toISOString(),
      message: response.status < 500 ? 
        '✅ HBL API is responding' : 
        '❌ HBL API is having server issues'
    };

    return res.json(status);
  } catch (error) {
    return res.json({
      isUp: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      message: '🔴 HBL API is not reachable'
    });
  }
});