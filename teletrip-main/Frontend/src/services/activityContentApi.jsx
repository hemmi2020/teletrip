const API_BASE_URL = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000') + '/api/activity-content';

export const activityContentApi = {
  getCountries: async (language = 'en') => {
    const res = await fetch(`${API_BASE_URL}/countries/${language}`);
    return res.json();
  },

  getDestinations: async (language, countryCode) => {
    const res = await fetch(`${API_BASE_URL}/destinations/${language}/${countryCode}`);
    return res.json();
  },

  getCurrencies: async (language = 'en') => {
    const res = await fetch(`${API_BASE_URL}/currencies/${language}`);
    return res.json();
  },

  getLanguages: async () => {
    const res = await fetch(`${API_BASE_URL}/languages`);
    return res.json();
  },

  getSegments: async (language = 'en') => {
    const res = await fetch(`${API_BASE_URL}/segments/${language}`);
    return res.json();
  }
};
