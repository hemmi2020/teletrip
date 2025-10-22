const crypto = require('crypto');

class ActivitiesService {
  constructor() {
    this.apiKey = process.env.ACTIVITIES_API_KEY;
    this.secret = process.env.ACTIVITIES_SECRET;
    this.baseUrl = 'https://api.test.hotelbeds.com/activity-api/3.0';
  }

  // Get 3-letter destination code from coordinates
  async getDestinationCodeFromCoords(latitude, longitude) {
    try {
      const fetch = (await import('node-fetch')).default;
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.GEOCODING_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        const components = data.results[0].components;
        const city = components.city || components.town || components.village || components.county;
        
        if (city) {
          // Convert city name to 3-letter code
          return this.cityToCode(city);
        }
      }
      
      // Fallback: use first 3 letters of city name
      return 'LON'; // Default fallback
    } catch (error) {
      console.error('Error getting destination code:', error);
      return 'LON'; // Default fallback
    }
  }

  // Convert city name to 3-letter IATA-like code
  cityToCode(cityName) {
    const cityMap = {
      'dubai': 'DXB', 'london': 'LON', 'paris': 'PAR', 'new york': 'NYC',
      'barcelona': 'BCN', 'madrid': 'MAD', 'rome': 'ROM', 'amsterdam': 'AMS',
      'berlin': 'BER', 'tokyo': 'TYO', 'singapore': 'SIN', 'hong kong': 'HKG',
      'bangkok': 'BKK', 'istanbul': 'IST', 'lisbon': 'LIS', 'prague': 'PRG',
      'vienna': 'VIE', 'athens': 'ATH', 'budapest': 'BUD', 'dublin': 'DUB',
      'edinburgh': 'EDI', 'milan': 'MIL', 'venice': 'VCE', 'florence': 'FLR',
      'munich': 'MUC', 'zurich': 'ZRH', 'geneva': 'GVA', 'brussels': 'BRU',
      'copenhagen': 'CPH', 'stockholm': 'STO', 'oslo': 'OSL', 'helsinki': 'HEL',
      'warsaw': 'WAW', 'krakow': 'KRK', 'moscow': 'MOW', 'st petersburg': 'LED',
      'cairo': 'CAI', 'marrakech': 'RAK', 'casablanca': 'CAS', 'cape town': 'CPT',
      'johannesburg': 'JNB', 'sydney': 'SYD', 'melbourne': 'MEL', 'auckland': 'AKL',
      'los angeles': 'LAX', 'san francisco': 'SFO', 'las vegas': 'LAS',
      'miami': 'MIA', 'orlando': 'ORL', 'chicago': 'CHI', 'boston': 'BOS',
      'washington': 'WAS', 'seattle': 'SEA', 'toronto': 'YTO', 'vancouver': 'YVR',
      'montreal': 'YMQ', 'mexico city': 'MEX', 'cancun': 'CUN',
      'rio de janeiro': 'RIO', 'sao paulo': 'SAO', 'buenos aires': 'BUE',
      'lima': 'LIM', 'bogota': 'BOG', 'santiago': 'SCL', 'havana': 'HAV',
      'punta cana': 'PUJ', 'bali': 'DPS', 'phuket': 'HKT', 'kuala lumpur': 'KUL',
      'manila': 'MNL', 'seoul': 'SEL', 'beijing': 'BJS', 'shanghai': 'SHA',
      'mumbai': 'BOM', 'delhi': 'DEL', 'bangalore': 'BLR', 'tel aviv': 'TLV',
      'jerusalem': 'JRS', 'doha': 'DOH', 'abu dhabi': 'AUH', 'muscat': 'MCT',
      'riyadh': 'RUH', 'jeddah': 'JED'
    };

    const normalized = cityName.toLowerCase().trim();
    return cityMap[normalized] || normalized.substring(0, 3).toUpperCase();
  }



  generateSignature(timestamp) {
    const stringToSign = this.apiKey + this.secret + timestamp;
    return crypto.createHash('sha256').update(stringToSign).digest('hex');
  }

  getAuthHeaders() {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.generateSignature(timestamp);
    
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Api-key': this.apiKey,
      'X-Signature': signature,
      'Accept-Encoding': 'gzip'
    };
  }

  async makeRequest(endpoint, method = 'GET', body = null) {
    const fetch = (await import('node-fetch')).default;
    
    const options = {
      method,
      headers: this.getAuthHeaders()
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  async searchActivities(params) {
    const { latitude, longitude, from, to, paxes = [{ age: 30 }], language = 'en', pagination } = params;
    
    // Get 3-letter destination code from coordinates
    const destinationCode = await this.getDestinationCodeFromCoords(latitude, longitude);
    
    const payload = {
      filters: [
        {
          searchFilterItems: [
            {
              type: 'destination',
              value: destinationCode
            }
          ]
        }
      ],
      from,
      to,
      paxes,
      language,
      pagination: pagination || { itemsPerPage: 20, page: 1 }
    };

    console.log(`Searching activities at ${latitude}, ${longitude} (code: ${destinationCode})`);
    return await this.makeRequest('/activities', 'POST', payload);
  }

  async getActivityDetails(activityCode, from, to, language = 'en') {
    return await this.makeRequest(
      `/activities/${activityCode}/details?from=${from}&to=${to}&language=${language}`,
      'GET'
    );
  }

  async checkAvailability(params) {
    const { activityCode, modalityCode, from, to, paxes = [{ age: 30 }] } = params;
    
    const activity = {
      code: activityCode,
      from,
      to,
      paxes
    };

    if (modalityCode) {
      activity.modalities = [{ code: modalityCode }];
    }

    const payload = { activities: [activity] };

    // Retry logic for rate limits
    let retries = 3;
    while (retries > 0) {
      try {
        return await this.makeRequest('/activities/availability', 'POST', payload);
      } catch (error) {
        if (error.message.includes('429') && retries > 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          retries--;
        } else {
          throw error;
        }
      }
    }
  }

  async createBooking(bookingData) {
    const { activityCode, modalityCode, from, to, paxes, holder, clientReference } = bookingData;
    const payload = {
      activities: [
        {
          code: activityCode,
          modalityCode,
          from,
          to,
          paxes
        }
      ],
      holder: {
        name: holder.name,
        surname: holder.surname,
        email: holder.email,
        phone: holder.phone
      },
      clientReference: clientReference || `ACT_${Date.now()}`
    };

    return await this.makeRequest('/bookings', 'POST', payload);
  }

  async getBooking(bookingReference) {
    return await this.makeRequest(`/bookings/${bookingReference}`, 'GET');
  }
}

module.exports = new ActivitiesService();
