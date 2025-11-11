const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const CurrencySettings = require('../models/currencySettings.model');

// Cache for exchange rates (valid for 1 hour)
let rateCache = {
  rate: null,
  timestamp: null,
  ttl: 3600000 // 1 hour in milliseconds
};

/**
 * Get EUR to PKR exchange rate from Frankfurter API
 */
async function getExchangeRate() {
  try {
    // Check cache first
    if (rateCache.rate && rateCache.timestamp && (Date.now() - rateCache.timestamp < rateCache.ttl)) {
      console.log('💰 Using cached exchange rate:', rateCache.rate);
      return rateCache.rate;
    }

    console.log('💰 Fetching fresh exchange rate from ExchangeRate-API...');
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
    
    if (!response.ok) {
      console.error('❌ ExchangeRate-API returned status:', response.status);
      throw new Error(`ExchangeRate-API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('📊 ExchangeRate-API response:', data);
    
    if (!data.rates || !data.rates.PKR) {
      throw new Error('PKR rate not found in response');
    }
    
    const rate = data.rates.PKR;

    // Update cache
    rateCache = {
      rate,
      timestamp: Date.now(),
      ttl: 3600000
    };

    console.log(`✅ Exchange rate: 1 EUR = ${rate} PKR`);
    return rate;

  } catch (error) {
    console.error('❌ Exchange rate fetch error:', error.message);
    
    // Fallback to cached rate if available
    if (rateCache.rate) {
      console.log('⚠️ Using stale cached rate:', rateCache.rate);
      return rateCache.rate;
    }
    
    // Ultimate fallback
    console.log('⚠️ Using fallback rate: 300 PKR');
    return 300; // Fallback rate
  }
}

/**
 * Get admin-configured markup per EUR
 */
async function getMarkupPerEuro() {
  try {
    let settings = await CurrencySettings.findOne({ isActive: true });
    
    // Create default settings if none exist
    if (!settings) {
      settings = await CurrencySettings.create({
        markupPerEuro: 20,
        transactionFeePercentage: 1,
        isActive: true
      });
      console.log('✅ Created default currency settings: 20 PKR markup per EUR, 1% transaction fee');
    }

    return settings.markupPerEuro;
  } catch (error) {
    console.error('❌ Error fetching markup:', error.message);
    return 20; // Default fallback
  }
}

/**
 * Get admin-configured transaction fee percentage
 */
async function getTransactionFeePercentage() {
  try {
    let settings = await CurrencySettings.findOne({ isActive: true });
    
    if (!settings) {
      settings = await CurrencySettings.create({
        markupPerEuro: 20,
        transactionFeePercentage: 1,
        isActive: true
      });
    }

    return settings.transactionFeePercentage;
  } catch (error) {
    console.error('❌ Error fetching transaction fee:', error.message);
    return 1; // Default fallback
  }
}

/**
 * Convert EUR to PKR with admin markup and transaction fee
 * @param {number} amountInEUR - Amount in EUR
 * @returns {Promise<Object>} - Conversion details
 */
async function convertEURtoPKR(amountInEUR) {
  try {
    const [exchangeRate, markupPerEuro, transactionFeePercentage] = await Promise.all([
      getExchangeRate(),
      getMarkupPerEuro(),
      getTransactionFeePercentage()
    ]);

    // Calculate base PKR amount
    const basePKR = amountInEUR * exchangeRate;
    
    // Calculate markup (markup per EUR * number of EURs)
    const markupAmount = amountInEUR * markupPerEuro;
    
    // Subtotal before transaction fee
    const subtotal = basePKR + markupAmount;
    
    // Calculate transaction fee (percentage of subtotal)
    const transactionFee = (subtotal * transactionFeePercentage) / 100;
    
    // Total PKR with markup and transaction fee
    const totalPKR = subtotal + transactionFee;

    const result = {
      amountInEUR,
      exchangeRate,
      markupPerEuro,
      transactionFeePercentage,
      basePKR: Math.round(basePKR * 100) / 100,
      markupAmount: Math.round(markupAmount * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      transactionFee: Math.round(transactionFee * 100) / 100,
      totalPKR: Math.round(totalPKR * 100) / 100,
      currency: 'PKR'
    };

    console.log('💱 Currency Conversion:', result);
    return result;

  } catch (error) {
    console.error('❌ Currency conversion error:', error.message);
    throw error;
  }
}

/**
 * Update markup per EUR (Admin only)
 */
async function updateMarkup(newMarkup, adminId) {
  try {
    let settings = await CurrencySettings.findOne({ isActive: true });
    
    if (!settings) {
      settings = new CurrencySettings({
        markupPerEuro: newMarkup,
        transactionFeePercentage: 1,
        isActive: true,
        lastUpdatedBy: adminId
      });
    } else {
      settings.markupPerEuro = newMarkup;
      settings.lastUpdatedBy = adminId;
    }

    await settings.save();
    console.log(`✅ Markup updated to ${newMarkup} PKR per EUR by admin ${adminId}`);
    
    return settings;
  } catch (error) {
    console.error('❌ Error updating markup:', error.message);
    throw error;
  }
}

/**
 * Update transaction fee percentage (Admin only)
 */
async function updateTransactionFee(newFeePercentage, adminId) {
  try {
    let settings = await CurrencySettings.findOne({ isActive: true });
    
    if (!settings) {
      settings = new CurrencySettings({
        markupPerEuro: 20,
        transactionFeePercentage: newFeePercentage,
        isActive: true,
        lastUpdatedBy: adminId
      });
    } else {
      settings.transactionFeePercentage = newFeePercentage;
      settings.lastUpdatedBy = adminId;
    }

    await settings.save();
    console.log(`✅ Transaction fee updated to ${newFeePercentage}% by admin ${adminId}`);
    
    return settings;
  } catch (error) {
    console.error('❌ Error updating transaction fee:', error.message);
    throw error;
  }
}

/**
 * Get current currency settings
 */
async function getCurrencySettings() {
  try {
    const [settings, exchangeRate] = await Promise.all([
      CurrencySettings.findOne({ isActive: true }),
      getExchangeRate()
    ]);

    return {
      markupPerEuro: settings?.markupPerEuro || 20,
      transactionFeePercentage: settings?.transactionFeePercentage || 1,
      currentExchangeRate: exchangeRate,
      lastUpdated: settings?.updatedAt,
      lastUpdatedBy: settings?.lastUpdatedBy
    };
  } catch (error) {
    console.error('❌ Error fetching currency settings:', error.message);
    throw error;
  }
}

module.exports = {
  convertEURtoPKR,
  getExchangeRate,
  getMarkupPerEuro,
  getTransactionFeePercentage,
  updateMarkup,
  updateTransactionFee,
  getCurrencySettings
};
