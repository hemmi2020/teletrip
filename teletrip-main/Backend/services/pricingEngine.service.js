const crypto = require('crypto');
const MarkupEngine = require('./markupEngine.service');
const { getEffectiveRates } = require('./currency.service');
const Quote = require('../models/quote.model');

// Configurable FX spread buffer to protect against currency fluctuations (e.g., 2%)
const DEFAULT_FX_SPREAD_BUFFER = 1.02;

class PricingEngine {
  /**
   * Calculate customer price in PKR for a raw net amount in supplier currency
   * Formula:
   * 1. Marked up net = rule.calculationType(net, markupValue)
   * 2. Marked up with service fee = markedUpNet * (1 + serviceChargePct / 100)
   * 3. Total PKR = Math.ceil(markedUpWithFee * fxRate * fxSpreadBuffer)
   */
  calculatePkrPrice(rawNet, rule, fxRate, serviceChargePct, fxSpreadBuffer = DEFAULT_FX_SPREAD_BUFFER) {
    if (!rawNet || isNaN(rawNet) || rawNet <= 0) return 0;

    // 1. Apply markup rule (percentage or fixed)
    let markedUp = rawNet;
    if (rule) {
      if (rule.calculationType === 'percentage') {
        markedUp = rawNet * (1 + (rule.markupValue / 100));
      } else if (rule.calculationType === 'fixed_amount') {
        markedUp = rawNet + rule.markupValue;
      }
    }

    // 2. Apply service charge / gateway fee percentage
    const serviceFeeMultiplier = 1 + ((serviceChargePct || 0) / 100);
    const markedUpWithFee = markedUp * serviceFeeMultiplier;

    // 3. Convert to PKR with FX buffer and deterministic whole-rupee ceiling
    const effectiveFx = fxRate * fxSpreadBuffer;
    const totalPkr = Math.ceil(markedUpWithFee * effectiveFx);

    return {
      markedUpNetSupplier: Math.round(markedUp * 100) / 100,
      totalPkr: totalPkr,
      effectiveFx
    };
  }

  /**
   * Process and sanitize a single rate object according to HBX APItude certification
   */
  processRate(rate, rule, fxRate, serviceChargePct, fxSpreadBuffer) {
    const rawNet = parseFloat(rate.net || rate.sellingRate || 0);
    const { totalPkr } = this.calculatePkrPrice(rawNet, rule, fxRate, serviceChargePct, fxSpreadBuffer);

    // 1. Separate included vs excluded (pay-at-hotel) taxes
    // Under HBX rules: taxes with included === false MUST NOT be added into online PKR total
    // They must remain in their native hotel currency with clear disclosure.
    const excludedTaxes = [];
    let includedTaxesCount = 0;

    if (rate.taxes && Array.isArray(rate.taxes.taxes)) {
      rate.taxes.taxes.forEach(t => {
        if (t.included === false) {
          excludedTaxes.push({
            amount: t.amount?.toString() || '0.00',
            currency: t.currency || rate.currency || 'AED',
            included: false,
            type: t.type || 'TAX',
            description: 'Payable directly at the property upon check-in.'
          });
        } else {
          includedTaxesCount++;
        }
      });
    }

    // Break total into base fare and included taxes/fees (typical 78% base, 22% taxes/charges split for clear presentation)
    const baseFarePkr = Math.round(totalPkr * 0.78);
    const taxesAndFeesPkr = totalPkr - baseFarePkr;

    // 2. Convert cancellation policy penalty amounts to PKR using the exact same formula
    const sanitizedCancellationPolicies = [];
    if (Array.isArray(rate.cancellationPolicies)) {
      rate.cancellationPolicies.forEach(cp => {
        const cpAmount = parseFloat(cp.amount || 0);
        let cpAmountPkr = totalPkr;
        if (cpAmount > 0 && cpAmount < rawNet) {
          const res = this.calculatePkrPrice(cpAmount, rule, fxRate, serviceChargePct, fxSpreadBuffer);
          cpAmountPkr = res.totalPkr;
        } else if (cpAmount >= rawNet) {
          cpAmountPkr = totalPkr;
        }
        sanitizedCancellationPolicies.push({
          amountPkr: cpAmountPkr,
          amount: cpAmountPkr, // compatibility
          from: cp.from,
          percent: cp.percent
        });
      });
    }

    // 3. ZERO LEAKAGE: Strip raw wholesale net, margin percentages, and supplier internal math
    delete rate.net;
    delete rate.sellingRate;
    delete rate.wholesaleNet;
    delete rate.markupApplied;
    delete rate.commission;

    // 4. Attach clean, server-computed PKR fields
    rate.displayCurrency = 'PKR';
    rate.pricePkr = totalPkr;
    rate.totalAmountPkr = totalPkr;
    rate.baseFarePkr = baseFarePkr;
    rate.taxesAndFeesPkr = taxesAndFeesPkr;
    rate.price = totalPkr; // Backward compatibility
    rate.cancellationPolicies = sanitizedCancellationPolicies;
    rate.excludedTaxes = excludedTaxes;
    rate.packaging = Boolean(rate.packaging);
    rate.rateComments = rate.rateComments || '';

    return {
      totalPkr,
      baseFarePkr,
      taxesAndFeesPkr
    };
  }

  /**
   * Process a hotel entity: sanitize all rooms and rates, calculate min/max rates in PKR
   */
  processHotel(hotel, destinationName, fxData, rules) {
    if (!hotel) return hotel;

    const starRating = hotel.categoryCode ? parseInt(hotel.categoryCode.replace(/\D/g, '')) || null : null;
    const rule = MarkupEngine.matchRule(rules, hotel.code, destinationName || hotel.destinationName || hotel.zoneName, starRating);

    const supplierCurrency = (hotel.currency || 'AED').toUpperCase();
    const fxRate = fxData.effective[supplierCurrency] || fxData.effective.AED || 75.39;
    const serviceChargePct = fxData.settings?.serviceChargePercentage ?? fxData.settings?.transactionFeePercentage ?? 1;

    let minRatePkr = Infinity;
    let maxRatePkr = -Infinity;
    let minRateTaxesPkr = 0;
    let minRateBaseFarePkr = 0;

    if (Array.isArray(hotel.rooms)) {
      hotel.rooms.forEach(room => {
        if (Array.isArray(room.rates)) {
          room.rates.forEach(rate => {
            const { totalPkr, baseFarePkr, taxesAndFeesPkr } = this.processRate(
              rate, 
              rule, 
              fxRate, 
              serviceChargePct, 
              DEFAULT_FX_SPREAD_BUFFER
            );

            if (totalPkr > 0) {
              if (totalPkr < minRatePkr) {
                minRatePkr = totalPkr;
                minRateTaxesPkr = taxesAndFeesPkr;
                minRateBaseFarePkr = baseFarePkr;
              }
              if (totalPkr > maxRatePkr) {
                maxRatePkr = totalPkr;
              }
            }
          });
        }
      });
    }

    // Set hotel-level PKR pricing
    hotel.currency = 'PKR';
    hotel.displayCurrency = 'PKR';
    if (minRatePkr !== Infinity) {
      hotel.minRatePkr = minRatePkr;
      hotel.minRate = minRatePkr;
      hotel.minRateTaxesPkr = minRateTaxesPkr;
      hotel.minRateBaseFarePkr = minRateBaseFarePkr;
    }
    if (maxRatePkr !== -Infinity) {
      hotel.maxRatePkr = maxRatePkr;
      hotel.maxRate = maxRatePkr;
    }

    return hotel;
  }

  /**
   * Process hotel list from Availability search
   */
  async processHotelsList(hotels, destinationName = '') {
    if (!Array.isArray(hotels) || hotels.length === 0) return hotels;

    const [rules, fxData] = await Promise.all([
      MarkupEngine.getActiveRules(),
      getEffectiveRates()
    ]);

    for (let i = 0; i < hotels.length; i++) {
      this.processHotel(hotels[i], destinationName, fxData, rules);
    }

    return hotels;
  }

  /**
   * Process CheckRate response, sanitize rates, and create a locked, tamper-proof server Quote
   */
  async processCheckRateAndCreateQuote(checkRateResponse, destinationName = '') {
    if (!checkRateResponse?.hotel) return { sanitizedResponse: checkRateResponse, quote: null };

    const hotel = checkRateResponse.hotel;
    const [rules, fxData] = await Promise.all([
      MarkupEngine.getActiveRules(),
      getEffectiveRates()
    ]);

    const starRating = hotel.categoryCode ? parseInt(hotel.categoryCode.replace(/\D/g, '')) || null : null;
    const rule = MarkupEngine.matchRule(rules, hotel.code, destinationName || hotel.destinationName || hotel.zoneName, starRating);

    const supplierCurrency = (hotel.currency || 'AED').toUpperCase();
    const fxRate = fxData.effective[supplierCurrency] || fxData.effective.AED || 75.39;
    const serviceChargePct = fxData.settings?.serviceChargePercentage ?? fxData.settings?.transactionFeePercentage ?? 1;

    // Keep an internal copy of raw supplier values before sanitization for server-side quote records
    let primaryRate = null;
    let rawSupplierNet = 0;

    if (Array.isArray(hotel.rooms) && hotel.rooms.length > 0) {
      const room = hotel.rooms[0];
      if (Array.isArray(room.rates) && room.rates.length > 0) {
        primaryRate = room.rates[0];
        rawSupplierNet = parseFloat(primaryRate.net || primaryRate.sellingRate || 0);
      }
    }

    // Sanitize the hotel response
    this.processHotel(hotel, destinationName, fxData, rules);

    let createdQuote = null;
    if (primaryRate && primaryRate.rateKey) {
      const quoteId = `QT_${crypto.randomBytes(12).toString('hex')}`;
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minute TTL

      try {
        createdQuote = await Quote.create({
          quoteId,
          rateKey: primaryRate.rateKey,
          hotelbedsRateKey: primaryRate.rateKey,
          hotelCode: hotel.code?.toString(),
          hotelName: hotel.name,
          checkIn: checkRateResponse.hotel?.checkIn,
          checkOut: checkRateResponse.hotel?.checkOut,
          displayCurrency: 'PKR',
          totalPkr: primaryRate.pricePkr,
          baseFarePkr: primaryRate.baseFarePkr,
          taxesAndFeesPkr: primaryRate.taxesAndFeesPkr,
          excludedTaxes: primaryRate.excludedTaxes || [],
          cancellationPolicies: primaryRate.cancellationPolicies || [],
          rooms: hotel.rooms,
          supplierCurrency,
          supplierNet: rawSupplierNet,
          markupRuleApplied: rule ? { name: rule.name, type: rule.ruleType, value: rule.markupValue } : null,
          exchangeRateUsed: fxRate,
          fxSpreadBufferUsed: DEFAULT_FX_SPREAD_BUFFER,
          serviceChargePctUsed: serviceChargePct,
          expiresAt
        });

        console.log(`🔒 [PricingEngine] Generated tamper-proof quote ${quoteId} for rateKey (${primaryRate.pricePkr} PKR)`);
      } catch (err) {
        console.error('Failed to save quote in DB:', err.message);
      }
    }

    return {
      sanitizedResponse: checkRateResponse,
      quote: createdQuote
    };
  }

  /**
   * Look up a quote by quoteId or rateKey to get the verified, tamper-proof amount in PKR
   */
  async getVerifiedAmount(quoteId, rateKey) {
    if (quoteId) {
      const quote = await Quote.findOne({ quoteId });
      if (quote) {
        return {
          valid: true,
          amountPkr: quote.totalPkr,
          quote
        };
      }
    }

    if (rateKey) {
      // Find latest quote with this rateKey
      const quote = await Quote.findOne({ rateKey }).sort({ createdAt: -1 });
      if (quote) {
        return {
          valid: true,
          amountPkr: quote.totalPkr,
          quote
        };
      }
    }

    return {
      valid: false,
      amountPkr: null,
      quote: null
    };
  }
}

module.exports = new PricingEngine();
