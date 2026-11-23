const MarkupRule = require('../models/markupRule.model');

class MarkupEngine {
  constructor() {
    this.cachedRules = null;
    this.lastFetched = 0;
    this.CACHE_TTL_MS = 60 * 1000; // 60 seconds
  }

  async getActiveRules() {
    const now = Date.now();
    if (this.cachedRules && (now - this.lastFetched < this.CACHE_TTL_MS)) {
      return this.cachedRules;
    }

    try {
      this.cachedRules = await MarkupRule.find({ isActive: true })
        .sort({ priority: -1, createdAt: -1 })
        .lean();
      this.lastFetched = now;
      return this.cachedRules;
    } catch (err) {
      console.error('[MarkupEngine] Failed to load rules, using cached/empty:', err.message);
      return this.cachedRules || [];
    }
  }

  invalidateCache() {
    this.cachedRules = null;
    this.lastFetched = 0;
  }

  matchRule(rules, hotelCode, destinationName, starRating) {
    if (!rules || rules.length === 0) return null;

    // 1. Hotel-specific match
    if (hotelCode) {
      const hotelMatch = rules.find(r => r.ruleType === 'hotel' && r.targetHotelId === hotelCode.toString());
      if (hotelMatch) return hotelMatch;
    }

    // 2. Destination match (case-insensitive substring)
    if (destinationName) {
      const destLower = destinationName.toLowerCase();
      const destMatch = rules.find(r => 
        r.ruleType === 'destination' && 
        r.targetDestination && 
        destLower.includes(r.targetDestination.toLowerCase())
      );
      if (destMatch) return destMatch;
    }

    // 3. Star rating match
    if (starRating) {
      const starsMatch = rules.find(r => r.ruleType === 'star_rating' && Number(r.targetStarRating) === Number(starRating));
      if (starsMatch) return starsMatch;
    }

    // 4. Global default match
    const globalMatch = rules.find(r => r.ruleType === 'global');
    return globalMatch || null;
  }

  calculatePrice(netAmount, rule) {
    if (!rule || !netAmount || isNaN(netAmount)) return netAmount;
    
    let markedUp = netAmount;
    if (rule.calculationType === 'percentage') {
      markedUp = netAmount * (1 + (rule.markupValue / 100));
    } else if (rule.calculationType === 'fixed_amount') {
      markedUp = netAmount + rule.markupValue;
    }

    return Math.round(markedUp * 100) / 100;
  }

  async applyToHotel(hotel, destinationName = '') {
    if (!hotel) return hotel;

    const rules = await this.getActiveRules();
    const starRating = hotel.categoryCode ? parseInt(hotel.categoryCode.replace(/\D/g, '')) || null : null;
    const rule = this.matchRule(rules, hotel.code, destinationName || hotel.destinationName || hotel.zoneName, starRating);

    if (!rule) return hotel; // No rule active, rates unchanged

    let newMinRate = Infinity;
    let newMaxRate = -Infinity;

    if (Array.isArray(hotel.rooms)) {
      hotel.rooms.forEach(room => {
        if (Array.isArray(room.rates)) {
          room.rates.forEach(rate => {
            const rawNet = parseFloat(rate.net);
            if (!isNaN(rawNet) && rawNet > 0) {
              const customerPrice = this.calculatePrice(rawNet, rule);
              rate.wholesaleNet = rawNet.toFixed(2);
              rate.net = customerPrice.toFixed(2);
              rate.sellingRate = customerPrice.toFixed(2);
              rate.markupApplied = {
                ruleName: rule.name,
                ruleType: rule.ruleType,
                markupValue: rule.markupValue,
                calculationType: rule.calculationType
              };

              if (customerPrice < newMinRate) newMinRate = customerPrice;
              if (customerPrice > newMaxRate) newMaxRate = customerPrice;
            }
          });
        }
      });
    }

    if (newMinRate !== Infinity) {
      hotel.minRate = newMinRate.toFixed(2);
    }
    if (newMaxRate !== -Infinity) {
      hotel.maxRate = newMaxRate.toFixed(2);
    }

    return hotel;
  }

  async applyToHotelsList(hotels, destinationName = '') {
    if (!Array.isArray(hotels) || hotels.length === 0) return hotels;
    const rules = await this.getActiveRules();
    if (!rules || rules.length === 0) return hotels;

    for (let i = 0; i < hotels.length; i++) {
      await this.applyToHotel(hotels[i], destinationName);
    }
    return hotels;
  }

  async applyToCheckRate(checkRateResponse, destinationName = '') {
    if (!checkRateResponse?.hotel) return checkRateResponse;
    await this.applyToHotel(checkRateResponse.hotel, destinationName);
    return checkRateResponse;
  }
}

module.exports = new MarkupEngine();
