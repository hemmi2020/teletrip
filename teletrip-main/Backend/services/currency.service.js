const https = require('https');
const CurrencySettings = require('../models/currencySettings.model');

// Cache for live exchange rates (valid for 1 hour)
let ratesCache = {
  rates: null,
  timestamp: null,
  ttl: 3600000 // 1 hour
};

// Fallback rates to PKR if external API is unreachable
const FALLBACK_RATES_TO_PKR = {
  AED: 75.39,
  EUR: 309.84,
  USD: 276.69,
  GBP: 370.90,
  PKR: 1.00
};

/**
 * Fetch JSON helper using standard Node https
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 4000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    req.on('error', reject);
  });
}

/**
 * Fetch live cross-rates to PKR from external API
 * Normalizes rates so 1 unit of foreign currency = X PKR
 */
async function fetchLiveRates() {
  try {
    if (ratesCache.rates && ratesCache.timestamp && (Date.now() - ratesCache.timestamp < ratesCache.ttl)) {
      return ratesCache.rates;
    }

    console.log('🔄 Fetching fresh exchange rates from ExchangeRate-API...');
    const data = await fetchJSON('https://api.exchangerate-api.com/v4/latest/USD');
    const pkr = data.rates?.PKR || 276.69;

    const liveRates = {
      AED: data.rates?.AED ? Math.round((pkr / data.rates.AED) * 100) / 100 : FALLBACK_RATES_TO_PKR.AED,
      EUR: data.rates?.EUR ? Math.round((pkr / data.rates.EUR) * 100) / 100 : FALLBACK_RATES_TO_PKR.EUR,
      USD: Math.round(pkr * 100) / 100,
      GBP: data.rates?.GBP ? Math.round((pkr / data.rates.GBP) * 100) / 100 : FALLBACK_RATES_TO_PKR.GBP,
      PKR: 1.00
    };

    ratesCache = {
      rates: liveRates,
      timestamp: Date.now(),
      ttl: 3600000
    };

    console.log('✅ Live Rates to PKR cached:', liveRates);
    return liveRates;
  } catch (error) {
    console.error('⚠️ Exchange rate fetch error, using fallbacks:', error.message);
    return ratesCache.rates || FALLBACK_RATES_TO_PKR;
  }
}

/**
 * Get active CurrencySettings document, creating defaults if not yet created
 */
async function getOrCreateSettings() {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return null;
    }
    let settings = await CurrencySettings.findOne({ isActive: true });
    if (!settings) {
      settings = await CurrencySettings.create({
        commissionPercentage: 0,
        serviceChargePercentage: 1,
        primaryCurrency: 'AED',
        manualRates: { AED: null, EUR: null, USD: null, GBP: null },
        autoFetchRates: true,
        markupPerEuro: 0,
        transactionFeePercentage: 1,
        isActive: true
      });
      console.log('✅ Created default currency settings');
    }
    return settings;
  } catch (err) {
    console.error('Error fetching settings doc:', err.message);
    return null;
  }
}

/**
 * Get effective exchange rates (respects admin manual overrides)
 */
async function getEffectiveRates() {
  const [settings, live] = await Promise.all([
    getOrCreateSettings(),
    fetchLiveRates()
  ]);

  const effective = { ...live };

  if (settings && settings.manualRates) {
    ['AED', 'EUR', 'USD', 'GBP'].forEach(cur => {
      const manual = settings.manualRates[cur];
      if (manual && manual > 0 && settings.autoFetchRates === false) {
        effective[cur] = manual;
      } else if (manual && manual > 0) {
        effective[cur] = manual;
      }
    });
  }

  return { effective, settings };
}

/**
 * Get currency settings payload for API / Frontend
 */
async function getCurrencySettings() {
  const { effective, settings } = await getEffectiveRates();

  return {
    primaryCurrency: settings?.primaryCurrency || 'AED',
    rates: effective,
    exchangeRate: effective[settings?.primaryCurrency || 'AED'] || 75.39,
    commissionPercentage: settings?.commissionPercentage ?? 0,
    serviceChargePercentage: settings?.serviceChargePercentage ?? settings?.transactionFeePercentage ?? 1,
    transactionFeePercentage: settings?.serviceChargePercentage ?? settings?.transactionFeePercentage ?? 1,
    markupPerEuro: settings?.markupPerEuro || 0,
    manualRates: settings?.manualRates || { AED: null, EUR: null, USD: null, GBP: null },
    autoFetchRates: settings?.autoFetchRates ?? true,
    lastUpdated: settings?.updatedAt || new Date().toISOString()
  };
}

/**
 * Convert any currency to PKR with admin commission & service charges
 * @param {number} amount - Amount in supplier currency
 * @param {string} fromCurrency - 'AED' | 'EUR' | 'USD' | 'GBP'
 * @param {Object} options - { applyCommission: boolean }
 */
async function convertCurrency(amount, fromCurrency = 'AED', options = {}) {
  const num = parseFloat(amount) || 0;
  const cur = (fromCurrency || 'AED').toUpperCase();
  const applyCommission = options.applyCommission !== false;

  const { effective, settings } = await getEffectiveRates();
  const exRate = effective[cur] || effective.AED || 75.39;

  const commPct = settings?.commissionPercentage ?? 0;
  const servicePct = settings?.serviceChargePercentage ?? settings?.transactionFeePercentage ?? 1;

  // 1. Commission / Markup
  const commissionAmount = applyCommission ? (num * (commPct / 100)) : 0;
  const retailAmount = num + commissionAmount;

  // 2. Base PKR conversion
  const basePKR = retailAmount * exRate;

  // 3. Service charge / transaction fee
  const serviceChargeAmount = (basePKR * (servicePct / 100));

  // 4. Final total PKR
  const totalPKR = basePKR + serviceChargeAmount;

  return {
    netAmount: Math.round(num * 100) / 100,
    fromCurrency: cur,
    commissionPercentage: commPct,
    commissionAmount: Math.round(commissionAmount * 100) / 100,
    retailAmount: Math.round(retailAmount * 100) / 100,
    exchangeRate: exRate,
    basePKR: Math.round(basePKR * 100) / 100,
    serviceChargePercentage: servicePct,
    serviceChargeAmount: Math.round(serviceChargeAmount * 100) / 100,
    totalPKR: Math.round(totalPKR * 100) / 100,
    currency: 'PKR',
    // Legacy compatibility fields:
    amountInEUR: cur === 'EUR' ? num : Math.round((num * (effective[cur] / (effective.EUR || 309.84))) * 100) / 100,
    markupPerEuro: settings?.markupPerEuro || 0,
    markupAmount: Math.round(commissionAmount * 100) / 100,
    transactionFeePercentage: servicePct,
    transactionFee: Math.round(serviceChargeAmount * 100) / 100,
    subtotal: Math.round(basePKR * 100) / 100
  };
}

/**
 * Legacy convertEURtoPKR for backwards compatibility
 */
async function convertEURtoPKR(amountInEUR) {
  return convertCurrency(amountInEUR, 'EUR');
}

/**
 * Legacy exchange rate getter
 */
async function getExchangeRate() {
  const { effective, settings } = await getEffectiveRates();
  return effective[settings?.primaryCurrency || 'AED'] || 75.39;
}

/**
 * Legacy markup getter
 */
async function getMarkupPerEuro() {
  const settings = await getOrCreateSettings();
  return settings?.markupPerEuro || 0;
}

/**
 * Legacy transaction fee getter
 */
async function getTransactionFeePercentage() {
  const settings = await getOrCreateSettings();
  return settings?.serviceChargePercentage ?? settings?.transactionFeePercentage ?? 1;
}

/**
 * Update whole settings object (Admin only)
 */
async function updateSettings(updates, adminId) {
  let settings = await getOrCreateSettings();
  if (!settings) {
    settings = new CurrencySettings({ isActive: true });
  }

  if (updates.commissionPercentage !== undefined) {
    settings.commissionPercentage = Math.max(0, Math.min(100, parseFloat(updates.commissionPercentage) || 0));
  }
  if (updates.serviceChargePercentage !== undefined) {
    settings.serviceChargePercentage = Math.max(0, Math.min(20, parseFloat(updates.serviceChargePercentage) || 0));
    settings.transactionFeePercentage = settings.serviceChargePercentage;
  }
  if (updates.primaryCurrency) {
    settings.primaryCurrency = updates.primaryCurrency.toUpperCase();
  }
  if (updates.autoFetchRates !== undefined) {
    settings.autoFetchRates = Boolean(updates.autoFetchRates);
  }
  if (updates.manualRates && typeof updates.manualRates === 'object') {
    settings.manualRates = {
      AED: updates.manualRates.AED ? parseFloat(updates.manualRates.AED) : null,
      EUR: updates.manualRates.EUR ? parseFloat(updates.manualRates.EUR) : null,
      USD: updates.manualRates.USD ? parseFloat(updates.manualRates.USD) : null,
      GBP: updates.manualRates.GBP ? parseFloat(updates.manualRates.GBP) : null
    };
  }
  if (updates.markupPerEuro !== undefined) {
    settings.markupPerEuro = parseFloat(updates.markupPerEuro) || 0;
  }
  if (adminId) {
    settings.lastUpdatedBy = adminId;
  }

  await settings.save();
  console.log(`✅ Currency & Commission settings updated by admin ${adminId}:`, updates);
  return getCurrencySettings();
}

/**
 * Legacy update functions
 */
async function updateMarkup(newMarkup, adminId) {
  return updateSettings({ markupPerEuro: newMarkup }, adminId);
}

async function updateTransactionFee(newFee, adminId) {
  return updateSettings({ serviceChargePercentage: newFee }, adminId);
}

async function updateExchangeRate(newRate, adminId) {
  const settings = await getOrCreateSettings();
  const primary = settings?.primaryCurrency || 'AED';
  const manual = { ...(settings?.manualRates || {}) };
  manual[primary] = newRate ? parseFloat(newRate) : null;
  return updateSettings({ manualRates: manual, autoFetchRates: !newRate }, adminId);
}

module.exports = {
  fetchLiveRates,
  getEffectiveRates,
  getCurrencySettings,
  convertCurrency,
  convertEURtoPKR,
  getExchangeRate,
  getMarkupPerEuro,
  getTransactionFeePercentage,
  updateSettings,
  updateMarkup,
  updateTransactionFee,
  updateExchangeRate
};
