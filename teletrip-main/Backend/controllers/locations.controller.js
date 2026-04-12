const transferLocations = require('../data/transferLocations.json');

exports.getTransferLocations = async (req, res) => {
  try {
    const { search, type } = req.query;
    
    let filteredLocations = transferLocations;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLocations = transferLocations.filter(loc => 
        loc.name.toLowerCase().includes(searchLower) ||
        loc.city.toLowerCase().includes(searchLower) ||
        loc.code.toLowerCase().includes(searchLower) ||
        loc.country.toLowerCase().includes(searchLower)
      );

      // Also search hotels from Hotelbeds if query is at least 3 chars
      if (searchLower.length >= 3) {
        try {
          const crypto = require('crypto');
          const apiKey = process.env.HOTELBEDS_API_KEY;
          const secret = process.env.HOTELBEDS_SECRET;
          const timestamp = Math.floor(Date.now() / 1000);
          const sig = crypto.createHash('sha256').update(apiKey + secret + timestamp).digest('hex');

          const fetch = (await import('node-fetch')).default;
          const hotelRes = await fetch(
            `https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels?fields=name,code,city,country&language=en&from=1&to=20&keywords=${encodeURIComponent(search)}`,
            {
              headers: {
                'Accept': 'application/json',
                'Api-key': apiKey,
                'X-Signature': sig
              }
            }
          );

          if (hotelRes.ok) {
            const hotelData = await hotelRes.json();
            const hotels = (hotelData.hotels || []).map(h => ({
              code: String(h.code),
              type: 'ATLAS',
              name: h.name?.content || h.name || 'Hotel',
              city: h.city?.content || h.city || '',
              country: h.country?.description?.content || h.countryCode || ''
            }));
            filteredLocations = [...filteredLocations, ...hotels];
          }
        } catch (hotelErr) {
          console.error('Hotel search for transfers failed:', hotelErr.message);
          // Continue with airport-only results
        }
      }
    }
    
    if (type) {
      filteredLocations = filteredLocations.filter(loc => loc.type === type);
    }
    
    res.json({
      success: true,
      data: filteredLocations,
      total: filteredLocations.length
    });
  } catch (error) {
    console.error('Error fetching transfer locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transfer locations',
      error: error.message
    });
  }
};

// Cached countries data
let countriesCache = null;
let countriesCacheTime = 0;

async function getCountriesData() {
  if (countriesCache && Date.now() - countriesCacheTime < 3600000) return countriesCache;
  try {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch('https://countriesnow.space/api/v0.1/countries/');
    const data = await res.json();
    if (!data.error) {
      countriesCache = data.data;
      countriesCacheTime = Date.now();
      return countriesCache;
    }
  } catch (err) {
    console.error('Failed to fetch countries:', err.message);
  }
  return countriesCache || [];
}

exports.searchLocations = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const query = q.toLowerCase().trim();
    const results = [];

    // Search cities & countries
    const countries = await getCountriesData();
    for (const country of countries) {
      // Match country
      if (country.country.toLowerCase().includes(query)) {
        results.push({
          type: 'country',
          name: country.country,
          city: '',
          country: country.country,
          countryCode: country.iso3,
          displayName: country.country
        });
      }
      // Match cities
      if (country.cities) {
        for (const city of country.cities) {
          if (city.toLowerCase().includes(query)) {
            results.push({
              type: 'city',
              name: city,
              city: city,
              country: country.country,
              countryCode: country.iso3,
              displayName: `${city}, ${country.country}`
            });
          }
          if (results.length >= 30) break;
        }
      }
      if (results.length >= 30) break;
    }

    // Sort: cities first, then countries
    results.sort((a, b) => {
      const order = { city: 0, country: 1 };
      return (order[a.type] || 2) - (order[b.type] || 2);
    });

    // Also search hotels from transfer locations (ATLAS entries) + Hotelbeds Content API
    if (query.length >= 3) {
      // 1. Search static transfer locations for hotels
      const hotelMatches = transferLocations
        .filter(loc => loc.type === 'ATLAS' && (
          loc.name.toLowerCase().includes(query) ||
          loc.city.toLowerCase().includes(query)
        ))
        .slice(0, 5)
        .map(h => ({
          type: 'hotel',
          name: h.name,
          hotelCode: h.code,
          city: h.city,
          country: h.country,
          displayName: `${h.name}, ${h.city}`
        }));
      
      // 2. Search Hotelbeds Content API
      try {
        const crypto = require('crypto');
        const apiKey = process.env.HOTELBEDS_API_KEY;
        const secret = process.env.HOTELBEDS_SECRET;
        if (apiKey && secret) {
          const timestamp = Math.floor(Date.now() / 1000);
          const sig = crypto.createHash('sha256').update(apiKey + secret + timestamp).digest('hex');
          const fetch = (await import('node-fetch')).default;
          const hotelRes = await fetch(
            `https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels?fields=name,code,city,country&language=ENG&from=1&to=50`,
            { headers: { 'Accept': 'application/json', 'Api-key': apiKey, 'X-Signature': sig } }
          );
          if (hotelRes.ok) {
            const hotelData = await hotelRes.json();
            (hotelData.hotels || [])
              .filter(h => (h.name?.content || '').toLowerCase().includes(query) || (h.city?.content || '').toLowerCase().includes(query))
              .slice(0, 10)
              .forEach(h => {
                const name = h.name?.content || '';
                const city = h.city?.content || '';
                const country = h.country?.description?.content || '';
                // Avoid duplicates
                if (!hotelMatches.some(m => m.name === name && m.city === city)) {
                  hotelMatches.push({ type: 'hotel', name, hotelCode: String(h.code), city, country, displayName: `${name}${city ? ', ' + city : ''}` });
                }
              });
          }
        }
      } catch (err) {
        console.error('Hotel content search failed:', err.message);
      }

      results.push(...hotelMatches.slice(0, 10));
    }

    res.json({ success: true, data: results.slice(0, 40) });
  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
