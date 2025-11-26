const axios = require('axios');

// Option 1: Using GeoNames API
exports.searchCities = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ success: true, data: [] });
    }

    // Replace 'demo' with your GeoNames username (register at geonames.org)
    const response = await axios.get('http://api.geonames.org/searchJSON', {
      params: {
        q: query,
        maxRows: 50,
        featureClass: 'P', // P = cities
        username: 'demo', // REPLACE WITH YOUR USERNAME
        style: 'SHORT'
      }
    });

    const cities = response.data.geonames.map(city => ({
      city: city.name,
      country: city.countryName,
      countryCode: city.countryCode,
      displayName: `${city.name}, ${city.countryName}`,
      searchText: `${city.name} ${city.countryName}`.toLowerCase(),
      population: city.population,
      lat: city.lat,
      lng: city.lng
    }));

    res.json({ success: true, data: cities });
  } catch (error) {
    console.error('Error searching cities:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search cities',
      error: error.message 
    });
  }
};

// Option 2: Using Teleport API (no registration needed)
exports.searchCitiesTeleport = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const response = await axios.get(`https://api.teleport.org/api/cities/`, {
      params: { search: query }
    });

    const cities = response.data._embedded['city:search-results'].map(result => {
      const city = result.matching_full_name.split(',')[0].trim();
      const country = result.matching_full_name.split(',').slice(-1)[0].trim();
      
      return {
        city: city,
        country: country,
        displayName: result.matching_full_name,
        searchText: result.matching_full_name.toLowerCase()
      };
    });

    res.json({ success: true, data: cities });
  } catch (error) {
    console.error('Error searching cities:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search cities',
      error: error.message 
    });
  }
};
