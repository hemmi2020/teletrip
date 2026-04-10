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

// Cached hotel names for search
let hotelCache = [];
let hotelCacheTime = 0;
let hotelCacheLoading = false;

async function loadHotelCache() {
  if (hotelCache.length > 0 && Date.now() - hotelCacheTime < 86400000) return; // 24h cache
  if (hotelCacheLoading) return;
  hotelCacheLoading = true;
  try {
    const crypto = require('crypto');
    const apiKey = process.env.HOTELBEDS_API_KEY;
    const secret = process.env.HOTELBEDS_SECRET;
    if (!apiKey || !secret) { hotelCacheLoading = false; return; }

    const fetch = (await import('node-fetch')).default;
    const allHotels = [];

    // Load hotels in batches (1000 per page, up to 5000 total)
    for (let from = 1; from <= 5000; from += 1000) {
      const timestamp = Math.floor(Date.now() / 1000);
      const sig = crypto.createHash('sha256').update(apiKey + secret + timestamp).digest('hex');
      const res = await fetch(
        `https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels?fields=name,code,city,country&language=ENG&from=${from}&to=${from + 999}`,
        { headers: { 'Accept': 'application/json', 'Accept-Encoding': 'gzip', 'Api-key': apiKey, 'X-Signature': sig } }
      );
      if (!res.ok) break;
      const data = await res.json();
      if (!data.hotels || data.hotels.length === 0) break;
      data.hotels.forEach(h => {
        allHotels.push({
          code: String(h.code),
          name: h.name?.content || '',
          city: h.city?.content || '',
          country: h.country?.description?.content || h.countryCode || '',
          searchText: `${h.name?.content || ''} ${h.city?.content || ''}`.toLowerCase()
        });
      });
      if (data.hotels.length < 1000) break;
    }

    hotelCache = allHotels;
    hotelCacheTime = Date.now();
    console.log(`Hotel cache loaded: ${hotelCache.length} hotels`);
  } catch (err) {
    console.error('Failed to load hotel cache:', err.message);
  } finally {
    hotelCacheLoading = false;
  }
}

async function searchHotelsByName(query) {
  await loadHotelCache();
  return hotelCache
    .filter(h => h.searchText.includes(query))
    .slice(0, 10)
    .map(h => ({
      type: 'hotel',
      name: h.name,
      hotelCode: h.code,
      city: h.city,
      country: h.country,
      displayName: `${h.name}${h.city ? ', ' + h.city : ''}`
    }));
}

async function getCountriesData() {
  // Cache for 1 hour
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

    // 1. Search cities & countries
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

    // 2. Search hotels from cached Hotelbeds data (3+ chars)
    if (query.length >= 3) {
      try {
        const hotelResults = await searchHotelsByName(query);
        results.push(...hotelResults);
        console.log(`Hotel search: found ${hotelResults.length} hotels for "${q}"`);
      } catch (hotelErr) {
        console.error('Hotel search failed:', hotelErr.message);
        console.error('Hotel search details:', hotelErr);
      }
      } catch (hotelErr) {
        console.error('Hotel search failed:', hotelErr.message);
        // Log full error for debugging
        console.error('Hotel search details:', hotelErr);
      }
    }

    // Sort: hotels first, then cities, then countries
    results.sort((a, b) => {
      const order = { hotel: 0, city: 1, country: 2 };
      return (order[a.type] || 3) - (order[b.type] || 3);
    });

    res.json({ success: true, data: results.slice(0, 40) });
  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
