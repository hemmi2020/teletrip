const express = require('express');
const crypto = require('crypto');
const { authUser } = require('../middlewares/auth.middleware'); 
const router = express.Router();   
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Hotelbeds API configuration  
const HOTELBEDS_API_KEY = process.env.HOTELBEDS_API_KEY || '106700a0f2f1e2aa1d4c2b16daae70b2';     
const HOTELBEDS_SECRET = process.env.HOTELBEDS_SECRET || '018e478aa6'; 
const HOTELBEDS_BASE_URL = 'https://api.test.hotelbeds.com';
const HOTELBEDS_CONTENT_URL = 'https://api.test.hotelbeds.com/hotel-content-api/1.0';   
const TRIPADVISOR_API_KEY = process.env.TRIPADVISOR_API_KEY ;

// Generate signature for Hotelbeds API 
function generateHotelbedsSignature(apiKey, secret, timestamp) { 
    const stringToSign = apiKey + secret + timestamp;
    return crypto.createHash('sha256').update(stringToSign).digest('hex');      
} 

// NEW: Hotel search suggestions endpoint for autocomplete 
// === NEW UNIFIED SEARCH ENDPOINT ===
router.post('/search-suggestions', async (req, res) => {
    const { query } = req.body;

    if (!query || query.length < 2) {
        return res.json({ hotels: [], destinations: [] });
    }

    console.log('🔍 Searching for:', query);

    try {
        // Use CountriesNow API as fallback (free, no auth required)
        const response = await fetch('https://countriesnow.space/api/v0.1/countries');
        
        if (!response.ok) {
            throw new Error('Failed to fetch countries data');
        }

        const data = await response.json();
        const queryLower = query.toLowerCase();
        const results = [];

        // Search through all countries and cities
        if (data.data) {
            data.data.forEach(country => {
                if (country.cities && Array.isArray(country.cities)) {
                    country.cities.forEach(city => {
                        const cityLower = city.toLowerCase();
                        const countryLower = country.country.toLowerCase();
                        
                        // Match if query is in city name or country name
                        if (cityLower.includes(queryLower) || countryLower.includes(queryLower)) {
                            results.push({
                                id: `${country.iso3}-${city.replace(/\s+/g, '-')}`,
                                name: city,
                                type: 'city',
                                country: country.country,
                        countryCode: country.iso3,
                                location: `${city}, ${country.country}`
                            });
                        }
                    });
                }
            });
        }

        // Limit to 50 results
        const limitedResults = results.slice(0, 50);

        console.log('✅ Found', limitedResults.length, 'cities');

        res.json({
            success: true,
            hotels: [],
            destinations: limitedResults
        });

    } catch (error) {
        console.error('💥 Search error:', error.message);
        res.json({
            success: false,
            hotels: [],
            destinations: [],
            error: error.message
        });
    }
});

// Function to fetch hotel images and details
async function fetchHotelContent(hotelCodes) {
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = generateHotelbedsSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);
        
        const codesParam = Array.isArray(hotelCodes) ? hotelCodes.join(',') : hotelCodes;
        const contentUrl = `${HOTELBEDS_CONTENT_URL}/hotels?fields=images,facilities,amenities&language=ENG&codes=${codesParam}`;

        const response = await fetch(contentUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Api-key': HOTELBEDS_API_KEY,
                'X-Signature': signature,
                'X-Timestamp': timestamp.toString()
            }
        });

        if (!response.ok) {
            console.error('Hotel Content API Error:', response.status);
            return {};
        }

        const data = await response.json();
        
        const contentMap = {};
        if (data.hotels) {
            data.hotels.forEach(hotel => {
                contentMap[hotel.code] = {
                    images: hotel.images || [],
                    facilities: hotel.facilities || [],
                    amenities: hotel.amenities || []
                };
            });
        }
        
        return contentMap;
    } catch (error) {
        console.error('Error fetching hotel content:', error);
        return {};
    }
}

// Function to get hotel details for a single hotel
async function fetchHotelDetails(hotelCode) {
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = generateHotelbedsSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);
        
        const detailsUrl = `${HOTELBEDS_CONTENT_URL}/hotels/${hotelCode}/details`;

        const response = await fetch(detailsUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Api-key': HOTELBEDS_API_KEY,
                'X-Signature': signature,
                'X-Timestamp': timestamp.toString()
            }
        });

        if (!response.ok) {
            console.error('Hotel Details API Error:', response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching hotel details:', error);
        return null;
    }
}

// Enhanced hotel search with images and content
async function enhanceHotelsWithContent(hotels) {
    try {
        const hotelCodes = hotels.map(hotel => hotel.code).filter(Boolean);
        
        if (hotelCodes.length === 0) return hotels;

        const contentMap = await fetchHotelContent(hotelCodes);

        return hotels.map(hotel => {
            const content = contentMap[hotel.code] || {};
            
            let thumbnail = null;
            if (content.images && content.images.length > 0) {
                const mainImage = content.images.find(img => img.typeCode === 'GEN') || content.images[0];
                if (mainImage && mainImage.path) {
                    thumbnail = `https://photos.hotelbeds.com/giata/original/${mainImage.path}`;
                }
            }

            const amenities = [];
            if (content.facilities) {
                content.facilities.forEach(facility => {
                    switch(facility.facilityCode) {
                        case 20: amenities.push('WIFI'); break;
                        case 15: amenities.push('BREAKFAST'); break;
                        case 50: amenities.push('PARKING'); break;
                        case 110: amenities.push('POOL'); break;
                        case 70: amenities.push('GYM'); break;
                        case 260: amenities.push('SPA'); break;
                        case 440: amenities.push('RESTAURANT'); break;
                    }
                });
            }

            return {
                ...hotel,
                thumbnail,
                amenities,
                images: content.images || [],
                facilities: content.facilities || []
            };
        });
    } catch (error) {
        console.error('Error enhancing hotels with content:', error);
        return hotels;
    }
}

// Public hotel search route (enhanced with images)
router.post('/hotels/search', async (req, res) => { 
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = generateHotelbedsSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

        const response = await fetch(`${HOTELBEDS_BASE_URL}/hotel-api/1.0/hotels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-key': HOTELBEDS_API_KEY,
                'X-Signature': signature,
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip'
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hotelbeds API Error:', response.status, errorText);
            return res.status(response.status).json({
                success: false,
                error: 'Failed to fetch hotels',
                details: errorText
            });
        }

        const data = await response.json();
        
        if (data.hotels && data.hotels.hotels) {
            data.hotels.hotels = await enhanceHotelsWithContent(data.hotels.hotels);
        }

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('Hotel Search Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Protected hotel search route (enhanced with images)
router.post('/hotels/search-auth', async (req, res) => {
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = generateHotelbedsSignature(HOTELBEDS_API_KEY, HOTELBEDS_SECRET, timestamp);

        console.log('Hotel search (no auth required)');

        const response = await fetch(`${HOTELBEDS_BASE_URL}/hotel-api/1.0/hotels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-key': HOTELBEDS_API_KEY,
                'X-Signature': signature,
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip'
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hotelbeds API Error:', response.status, errorText);
            return res.status(response.status).json({
                success: false,
                error: 'Failed to fetch hotels',
                details: errorText
            });
        } 

        const data = await response.json();

        if (data.hotels && data.hotels.hotels) {
            data.hotels.hotels = await enhanceHotelsWithContent(data.hotels.hotels);
        }

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('Hotel Search Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Hotel details route
router.get('/hotels/details/:hotelCode', async (req, res) => {
    try {
        const { hotelCode } = req.params;
        const details = await fetchHotelDetails(hotelCode);
        
        if (!details) {
            return res.status(404).json({
                success: false,
                error: 'Hotel details not found'
            });
        }

        res.json({
            success: true,
            data: details  
        });
    } catch (error) {
        console.error('Hotel Details Error:', error);  
        res.status(500).json({
            success: false,
            error: 'Failed to fetch hotel details',
            message: error.message
        });
    }
});

// Search TripAdvisor for hotel location ID
async function searchTripAdvisorLocation(hotelName, city) {
  try {
    const searchQuery = `${hotelName} ${city}`;
    const url = `https://api.content.tripadvisor.com/api/v1/location/search?searchQuery=${encodeURIComponent(searchQuery)}&category=hotels&language=en&key=${TRIPADVISOR_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return data.data[0].location_id;
    }
    
    return null;
  } catch (error) {
    console.error('TripAdvisor search error:', error);
    return null;
  }
}

// Get TripAdvisor location details (rating info) 
async function getTripAdvisorDetails(locationId) {
  try {
    const url = `https://api.content.tripadvisor.com/api/v1/location/${locationId}/details?language=en&key=${TRIPADVISOR_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('TripAdvisor details error:', error);
    return null;
  }
}

// Get TripAdvisor reviews
async function getTripAdvisorReviews(locationId) {
  try {
    const url = `https://api.content.tripadvisor.com/api/v1/location/${locationId}/reviews?language=en&key=${TRIPADVISOR_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('TripAdvisor reviews error:', error);
    return null;
  }
}

// ROUTE: Get hotel reviews from TripAdvisor
router.get('/hotels/:hotelCode/reviews', async (req, res) => {
  try {
    const { hotelCode } = req.params;
    
    // Get hotel info from your database or Hotelbeds
    // For now, we'll need the hotel name and city from the search results
    // You should store this info when hotels are searched
    
    // This is a placeholder - you'll need to get actual hotel data
    const hotelName = req.query.name || '';
    const city = req.query.city || '';
    
    if (!hotelName || !city) {
      return res.json({
        success: false,
        message: 'Hotel name and city required',
        data: null
      });
    }
    
    // Step 1: Search for hotel on TripAdvisor
    const locationId = await searchTripAdvisorLocation(hotelName, city);
    
    if (!locationId) {
      return res.json({
        success: false,
        message: 'Hotel not found on TripAdvisor',
        data: null
      });
    }
    
    // Step 2: Get hotel details
    const details = await getTripAdvisorDetails(locationId);
    
    // Step 3: Get reviews
    const reviewsData = await getTripAdvisorReviews(locationId);
    
    // Format response
    res.json({
      success: true,
      data: {
        locationId: locationId,
        rating: details?.rating || 0,
        numReviews: details?.num_reviews || 0,
        rankingData: details?.ranking_data || null,
        ratingImageUrl: details?.rating_image_url || null,
        reviews: reviewsData?.data || []
      }
    });
    
  } catch (error) {
    console.error('Error fetching TripAdvisor data:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});


// Geocoding route (existing)
router.get('/geocode', async (req, res) => {  
    try {
        const { q } = req.query; 
  
        if (!q) { 
            return res.status(400).json({
                success: false, 
                error: 'Query parameter "q" is required'
            }); 
        }

        const response = await fetch( 
            `https://geocode.maps.co/search?q=${encodeURIComponent(q)}&apiKey=${process.env.GEOCODING_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Geocoding service failed');  
        }

        const data = await response.json();
        
        if (!data || !Array.isArray(data) || data.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Location not found'
            });
        }

        res.json({
            success: true,
            data: data
        });
        

    } catch (error) {
        console.error('Geocoding Error:', error);
        res.status(500).json({
            success: false,
            error: 'Geocoding failed',
            message: error.message
        });
    }
});

module.exports = router;
