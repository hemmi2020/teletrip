const transferLocations = require('../data/transferLocations.json');
const path = require('path');

// In-memory cache for master destinations & countries
let indexedDestinations = null;
let indexedCountries = null;

const CITY_ALIASES = {
  'mallorca': 'majorca',
  'palma': 'majorca',
  'palma de mallorca': 'majorca',
  'mecca': 'makkah',
  'medina': 'madinah',
  'usa': 'united states',
  'america': 'united states',
  'uk': 'united kingdom',
  'england': 'united kingdom',
  'britain': 'united kingdom',
  'uae': 'united arab emirates',
  'emirates': 'united arab emirates'
};

function loadDestinationsIndex() {
  if (indexedDestinations && indexedCountries) {
    return { destinations: indexedDestinations, countries: indexedCountries };
  }
  try {
    const destPath = path.resolve(__dirname, '../data/hotelbedsDestinations.json');
    const countryPath = path.resolve(__dirname, '../data/hotelbedsCountries.json');
    if (fs.existsSync(destPath) && fs.existsSync(countryPath)) {
      indexedDestinations = JSON.parse(fs.readFileSync(destPath, 'utf8'));
      indexedCountries = JSON.parse(fs.readFileSync(countryPath, 'utf8'));
      return { destinations: indexedDestinations, countries: indexedCountries };
    }
  } catch (err) {
    console.warn('[LOCATIONS] Could not load static JSON index:', err.message);
  }
  return { destinations: [], countries: {} };
}


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

      // Also search hotels from Hotelbeds Transfers Cache API if query is at least 3 chars
      if (searchLower.length >= 3) {
        try {
          const crypto = require('crypto');
          const apiKey = process.env.HOTELBEDS_API_KEY;
          const secret = process.env.HOTELBEDS_SECRET;
          const isLive = (process.env.HOTELBEDS_ENV || 'test').toLowerCase() === 'live';
          const contentBase = process.env.HOTELBEDS_CONTENT_URL || (isLive ? 'https://api.hotelbeds.com/hotel-content-api/1.0' : 'https://api.test.hotelbeds.com/hotel-content-api/1.0');
          const timestamp = Math.floor(Date.now() / 1000);
          const sig = crypto.createHash('sha256').update(apiKey + secret + timestamp).digest('hex');

          const fetch = (await import('node-fetch')).default;
          
          // Use Hotel Content API with POST body for name filtering
          const hotelRes = await fetch(
            `${contentBase}/hotels`,
            {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Api-key': apiKey,
                'X-Signature': sig
              },
              body: JSON.stringify({
                fields: ['name', 'code', 'city', 'country', 'destinationCode', 'coordinates'],
                language: 'en',
                from: 1,
                to: 25,
                filter: {
                  name: search
                }
              })
            }
          );

          if (hotelRes.ok) {
            const hotelData = await hotelRes.json();
            const hotels = (hotelData.hotels || []).map(h => ({
              code: String(h.code),
              type: 'ATLAS',
              name: h.name?.content || h.name || 'Hotel',
              city: h.city?.content || h.city || '',
              country: h.country?.description?.content || h.countryCode || '',
              destinationCode: h.destinationCode || ''
            }));
            filteredLocations = [...filteredLocations, ...hotels];
          } else {
            console.error('Hotel Content API status:', hotelRes.status);
          }
        } catch (hotelErr) {
          console.error('Hotel search for transfers failed:', hotelErr.message);
        }
      }
    }
    
    if (type) {
      filteredLocations = filteredLocations.filter(loc => loc.type === type);
    }

    // Group by city for Hotelbeds-style display
    const grouped = {};
    for (const loc of filteredLocations) {
      const cityKey = `${loc.city || 'Other'}, ${loc.country || ''}`.trim().replace(/,\s*$/, '');
      if (!grouped[cityKey]) grouped[cityKey] = { city: loc.city || 'Other', country: loc.country || '', airports: [], hotels: [] };
      if (loc.type === 'IATA') grouped[cityKey].airports.push(loc);
      else grouped[cityKey].hotels.push(loc);
    }
    
    res.json({
      success: true,
      data: filteredLocations,
      grouped: Object.values(grouped),
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
  
  // Use Hotelbeds Content API for destinations
  try {
    const crypto = require('crypto');
    const fetch = (await import('node-fetch')).default;
    const isLive = (process.env.HOTELBEDS_ENV || 'test').toLowerCase() === 'live';
    const contentBase = process.env.HOTELBEDS_CONTENT_URL || (isLive ? 'https://api.hotelbeds.com/hotel-content-api/1.0' : 'https://api.test.hotelbeds.com/hotel-content-api/1.0');
    const apiKey = process.env.HOTELBEDS_API_KEY || (isLive ? 'f879ffbe1a15cfa78d4fc6770ec7c8e7' : '106700a0f2f1e2aa1d4c2b16daae70b2');
    const secret = process.env.HOTELBEDS_SECRET || (isLive ? 'qLevQhmgdb' : '018e478aa6');
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto.createHash('sha256').update(apiKey + secret + timestamp).digest('hex');

    const res = await fetch(`${contentBase}/locations/destinations?fields=code,name,countryCode&language=ENG&from=1&to=1500`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Api-key': apiKey,
        'X-Signature': signature
      },
      timeout: 15000
    });

    if (res.ok) {
      const data = await res.json();
      if (data.destinations && data.destinations.length > 0) {
        // Transform Hotelbeds destinations into our format grouped by country
        const countryMap = {};
        data.destinations.forEach(dest => {
          const countryCode = dest.countryCode || 'XX';
          if (!countryMap[countryCode]) {
            countryMap[countryCode] = {
              country: dest.countryCode || 'Unknown',
              iso3: countryCode,
              cities: []
            };
          }
          if (dest.name && dest.name.content) {
            countryMap[countryCode].cities.push({
              name: dest.name.content,
              code: dest.code
            });
          }
        });
        countriesCache = Object.values(countryMap);
        countriesCacheTime = Date.now();
        console.log(`[LOCATIONS] Loaded ${data.destinations.length} destinations from Hotelbeds Content API`);
        return countriesCache;
      }
    } else {
      console.error('[LOCATIONS] Hotelbeds Content API error:', res.status);
    }
  } catch (err) {
    console.error('[LOCATIONS] Failed to fetch from Hotelbeds Content API:', err.message);
  }

  // Fallback to countriesnow if Hotelbeds fails
  try {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch('https://countriesnow.space/api/v0.1/countries/', { timeout: 8000 });
    const data = await res.json();
    if (!data.error && data.data && data.data.length > 0) {
      countriesCache = data.data;
      countriesCacheTime = Date.now();
      console.log('[LOCATIONS] Loaded countries from countriesnow.space');
      return countriesCache;
    }
  } catch (err) {
    console.error('[LOCATIONS] countriesnow.space also failed:', err.message);
  }

  // Final fallback: built-in data
  if (!countriesCache || countriesCache.length === 0) {
    countriesCache = getBuiltInDestinations();
    countriesCacheTime = Date.now();
    console.log('[LOCATIONS] Using built-in destinations fallback');
  }
  return countriesCache || [];
}

function getBuiltInDestinations() {
  return [
    { country: 'United Arab Emirates', iso3: 'ARE', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Al Ain'] },
    { country: 'Saudi Arabia', iso3: 'SAU', cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Abha', 'Taif', 'Tabuk'] },
    { country: 'Pakistan', iso3: 'PAK', cities: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Murree', 'Naran', 'Swat', 'Hunza', 'Skardu'] },
    { country: 'Turkey', iso3: 'TUR', cities: ['Istanbul', 'Ankara', 'Antalya', 'Izmir', 'Bodrum', 'Cappadocia', 'Trabzon', 'Bursa', 'Fethiye'] },
    { country: 'Thailand', iso3: 'THA', cities: ['Bangkok', 'Phuket', 'Pattaya', 'Chiang Mai', 'Krabi', 'Koh Samui', 'Hua Hin'] },
    { country: 'Malaysia', iso3: 'MYS', cities: ['Kuala Lumpur', 'Penang', 'Langkawi', 'Johor Bahru', 'Kota Kinabalu', 'Malacca'] },
    { country: 'Indonesia', iso3: 'IDN', cities: ['Bali', 'Jakarta', 'Yogyakarta', 'Bandung', 'Surabaya', 'Lombok'] },
    { country: 'Egypt', iso3: 'EGY', cities: ['Cairo', 'Sharm El Sheikh', 'Hurghada', 'Alexandria', 'Luxor', 'Aswan'] },
    { country: 'United Kingdom', iso3: 'GBR', cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Liverpool', 'Glasgow', 'Bristol', 'Leeds', 'Oxford', 'Cambridge'] },
    { country: 'United States', iso3: 'USA', cities: ['New York', 'Los Angeles', 'Miami', 'Las Vegas', 'San Francisco', 'Chicago', 'Orlando', 'Houston', 'Dallas', 'Washington DC', 'Boston', 'Seattle'] },
    { country: 'France', iso3: 'FRA', cities: ['Paris', 'Nice', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Strasbourg', 'Cannes'] },
    { country: 'Spain', iso3: 'ESP', cities: ['Barcelona', 'Madrid', 'Malaga', 'Seville', 'Valencia', 'Ibiza', 'Palma de Mallorca', 'Granada', 'Marbella'] },
    { country: 'Italy', iso3: 'ITA', cities: ['Rome', 'Milan', 'Venice', 'Florence', 'Naples', 'Amalfi', 'Sicily', 'Turin', 'Bologna'] },
    { country: 'Germany', iso3: 'DEU', cities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne', 'Dusseldorf', 'Stuttgart'] },
    { country: 'Greece', iso3: 'GRC', cities: ['Athens', 'Santorini', 'Mykonos', 'Crete', 'Rhodes', 'Corfu', 'Thessaloniki'] },
    { country: 'Maldives', iso3: 'MDV', cities: ['Male', 'Maafushi', 'Hulhumale'] },
    { country: 'Sri Lanka', iso3: 'LKA', cities: ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Ella', 'Sigiriya', 'Nuwara Eliya'] },
    { country: 'India', iso3: 'IND', cities: ['Mumbai', 'Delhi', 'Goa', 'Jaipur', 'Agra', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Udaipur', 'Kerala', 'Shimla', 'Manali'] },
    { country: 'Singapore', iso3: 'SGP', cities: ['Singapore'] },
    { country: 'Japan', iso3: 'JPN', cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Hiroshima', 'Fukuoka', 'Sapporo'] },
    { country: 'South Korea', iso3: 'KOR', cities: ['Seoul', 'Busan', 'Jeju Island', 'Incheon'] },
    { country: 'Australia', iso3: 'AUS', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Gold Coast', 'Adelaide', 'Cairns'] },
    { country: 'Oman', iso3: 'OMN', cities: ['Muscat', 'Salalah', 'Nizwa', 'Sur'] },
    { country: 'Qatar', iso3: 'QAT', cities: ['Doha'] },
    { country: 'Bahrain', iso3: 'BHR', cities: ['Manama'] },
    { country: 'Kuwait', iso3: 'KWT', cities: ['Kuwait City'] },
    { country: 'Jordan', iso3: 'JOR', cities: ['Amman', 'Petra', 'Aqaba', 'Dead Sea'] },
    { country: 'Morocco', iso3: 'MAR', cities: ['Marrakech', 'Casablanca', 'Fez', 'Tangier', 'Agadir'] },
    { country: 'South Africa', iso3: 'ZAF', cities: ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth'] },
    { country: 'Kenya', iso3: 'KEN', cities: ['Nairobi', 'Mombasa', 'Diani Beach'] },
    { country: 'Tanzania', iso3: 'TZA', cities: ['Zanzibar', 'Dar es Salaam', 'Arusha'] },
    { country: 'Mexico', iso3: 'MEX', cities: ['Cancun', 'Mexico City', 'Playa del Carmen', 'Tulum', 'Puerto Vallarta', 'Los Cabos'] },
    { country: 'Canada', iso3: 'CAN', cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Quebec City', 'Niagara Falls'] },
    { country: 'Switzerland', iso3: 'CHE', cities: ['Zurich', 'Geneva', 'Lucerne', 'Bern', 'Interlaken', 'Zermatt'] },
    { country: 'Netherlands', iso3: 'NLD', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'] },
    { country: 'Portugal', iso3: 'PRT', cities: ['Lisbon', 'Porto', 'Faro', 'Madeira', 'Algarve'] },
    { country: 'Azerbaijan', iso3: 'AZE', cities: ['Baku', 'Gabala', 'Sheki'] },
    { country: 'Georgia', iso3: 'GEO', cities: ['Tbilisi', 'Batumi', 'Gudauri'] },
    { country: 'China', iso3: 'CHN', cities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Hong Kong', 'Macau', 'Hangzhou', 'Chengdu'] },
    { country: 'Vietnam', iso3: 'VNM', cities: ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Nha Trang', 'Hoi An', 'Phu Quoc'] },
    { country: 'Philippines', iso3: 'PHL', cities: ['Manila', 'Cebu', 'Boracay', 'Palawan', 'Bohol'] },
  ];
}

exports.searchLocations = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const query = q.toLowerCase().trim();
    const aliasQuery = CITY_ALIASES[query] || null;
    const results = [];
    const seen = new Set();

    const { destinations, countries } = loadDestinationsIndex();

    // 1. Search through Hotelbeds master destinations (7,423 real worldwide cities/destinations)
    if (destinations && destinations.length > 0) {
      for (const dest of destinations) {
        const destNameLower = dest.name.toLowerCase();
        const countryNameLower = (dest.country || '').toLowerCase();
        const codeLower = (dest.code || '').toLowerCase();

        const matchesCity = destNameLower.startsWith(query) || 
                            destNameLower.includes(query) || 
                            codeLower === query ||
                            (aliasQuery && (destNameLower.startsWith(aliasQuery) || destNameLower.includes(aliasQuery)));

        const matchesCountry = countryNameLower.startsWith(query) || 
                               countryNameLower === query ||
                               (aliasQuery && countryNameLower === aliasQuery);

        if (matchesCity) {
          const key = 'city-' + dest.code;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({
              type: 'city',
              name: dest.name,
              city: dest.name,
              country: dest.country,
              countryCode: dest.countryCode,
              destinationCode: dest.code,
              displayName: dest.name + ', ' + dest.country
            });
          }
        } else if (matchesCountry && results.length < 40) {
          const key = 'city-' + dest.code;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({
              type: 'city',
              name: dest.name,
              city: dest.name,
              country: dest.country,
              countryCode: dest.countryCode,
              destinationCode: dest.code,
              displayName: dest.name + ', ' + dest.country
            });
          }
        }
        if (results.length >= 60) break;
      }
    }

    // 2. Check Countries for direct country matches
    if (countries) {
      for (const [code, countryName] of Object.entries(countries)) {
        const cLower = countryName.toLowerCase();
        if (cLower.startsWith(query) || cLower.includes(query) || code.toLowerCase() === query || (aliasQuery && cLower === aliasQuery)) {
          const key = 'country-' + code;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({
              type: 'country',
              name: countryName,
              city: '',
              country: countryName,
              countryCode: code,
              displayName: countryName
            });
          }
        }
      }
    }

    // Sort: exact matches first, then prefix, then substring; cities before countries
    results.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aExact = aName === query ? 0 : (aName.startsWith(query) ? 1 : 2);
      const bExact = bName === query ? 0 : (bName.startsWith(query) ? 1 : 2);
      if (aExact !== bExact) return aExact - bExact;

      const order = { city: 0, country: 1 };
      return (order[a.type] || 2) - (order[b.type] || 2);
    });

    res.json({ success: true, data: results.slice(0, 40) });
  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchAddress = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 3) return res.json({ success: true, data: [] });

    const fetch = (await import('node-fetch')).default;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=8`,
      { headers: { 'User-Agent': 'Telitrip/1.0 (travel booking)', 'Accept-Language': 'en' } }
    );

    if (!response.ok) return res.json({ success: true, data: [] });

    const data = await response.json();
    const results = data.map(d => ({
      display: d.display_name,
      short: d.name || d.display_name.split(',')[0],
      type: d.type,
      lat: d.lat,
      lon: d.lon
    }));

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Address search error:', error.message);
    res.json({ success: true, data: [] });
  }
};
