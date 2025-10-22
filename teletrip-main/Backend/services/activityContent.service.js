const crypto = require('crypto');

class ActivityContentService {
  constructor() {
    this.apiKey = process.env.ACTIVITIES_API_KEY;
    this.secret = process.env.ACTIVITIES_SECRET;
    this.baseUrl = 'https://api.test.hotelbeds.com/activity-content-api/3.0';
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

  async getActivityContentSimple(language, activityCode, modalityCode = null) {
    const endpoint = modalityCode 
      ? `/activities/${language}/${activityCode}/${modalityCode}`
      : `/activities/${language}/${activityCode}`;
    return await this.makeRequest(endpoint, 'GET');
  }

  async getActivityContentMulti(language, activityCodes) {
    const payload = {
      language,
      codes: activityCodes.map(code => ({ activityCode: code }))
    };
    return await this.makeRequest('/activities', 'POST', payload);
  }

  async getCountries(language = 'en') {
    return await this.makeRequest(`/countries/${language}`, 'GET');
  }

  async getDestinations(language, countryCode) {
    return await this.makeRequest(`/destinations/${language}/${countryCode}`, 'GET');
  }

  async getCurrencies(language = 'en') {
    return await this.makeRequest(`/currencies/${language}`, 'GET');
  }

  async getLanguages() {
    return await this.makeRequest('/languages', 'GET');
  }

  async getSegments(language = 'en') {
    return await this.makeRequest(`/segments/${language}`, 'GET');
  }
}

module.exports = new ActivityContentService();
