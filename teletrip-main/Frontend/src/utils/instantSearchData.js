// Comprehensive instant suggestions dataset for world-class travel autocomplete
// Provides instant (0ms latency) matching for top worldwide destinations and iconic hotels

export const TOP_DESTINATIONS = [
  { name: 'Dubai', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', destinationCode: 'DXB', displayName: 'Dubai, United Arab Emirates', type: 'city', tags: ['uae', 'emirates', 'downtown', 'marina', 'palm'] },
  { name: 'Abu Dhabi', city: 'Abu Dhabi', country: 'United Arab Emirates', countryCode: 'AE', destinationCode: 'AUH', displayName: 'Abu Dhabi, United Arab Emirates', type: 'city', tags: ['uae', 'emirates', 'yas island'] },
  { name: 'Doha', city: 'Doha', country: 'Qatar', countryCode: 'QA', destinationCode: 'DOH', displayName: 'Doha, Qatar', type: 'city', tags: ['qatar', 'corniche', 'lusail'] },
  { name: 'Riyadh', city: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', destinationCode: 'RUH', displayName: 'Riyadh, Saudi Arabia', type: 'city', tags: ['saudi', 'ksa', 'kingdom'] },
  { name: 'Jeddah', city: 'Jeddah', country: 'Saudi Arabia', countryCode: 'SA', destinationCode: 'JED', displayName: 'Jeddah, Saudi Arabia', type: 'city', tags: ['saudi', 'red sea', 'corniche'] },
  { name: 'Makkah', city: 'Makkah', country: 'Saudi Arabia', countryCode: 'SA', destinationCode: 'MAK', displayName: 'Makkah, Saudi Arabia', type: 'city', tags: ['mecca', 'saudi', 'haram', 'umrah', 'hajj'] },
  { name: 'Madinah', city: 'Madinah', country: 'Saudi Arabia', countryCode: 'SA', destinationCode: 'MED', displayName: 'Madinah, Saudi Arabia', type: 'city', tags: ['medina', 'saudi', 'nabawi'] },
  { name: 'London', city: 'London', country: 'United Kingdom', countryCode: 'GB', destinationCode: 'LON', displayName: 'London, United Kingdom', type: 'city', tags: ['uk', 'england', 'britain', 'heathrow'] },
  { name: 'Paris', city: 'Paris', country: 'France', countryCode: 'FR', destinationCode: 'PAR', displayName: 'Paris, France', type: 'city', tags: ['france', 'eiffel', 'champs-elysees'] },
  { name: 'Istanbul', city: 'Istanbul', country: 'Turkey', countryCode: 'TR', destinationCode: 'IST', displayName: 'Istanbul, Turkey', type: 'city', tags: ['turkey', 'turkiye', 'bosphorus', 'taksim'] },
  { name: 'Antalya', city: 'Antalya', country: 'Turkey', countryCode: 'TR', destinationCode: 'AYT', displayName: 'Antalya, Turkey', type: 'city', tags: ['turkey', 'resort', 'mediterranean'] },
  { name: 'Singapore', city: 'Singapore', country: 'Singapore', countryCode: 'SG', destinationCode: 'SIN', displayName: 'Singapore, Singapore', type: 'city', tags: ['singapore', 'marina bay', 'sentosa', 'changi'] },
  { name: 'Bangkok', city: 'Bangkok', country: 'Thailand', countryCode: 'TH', destinationCode: 'BKK', displayName: 'Bangkok, Thailand', type: 'city', tags: ['thailand', 'siam', 'sukhumvit'] },
  { name: 'Phuket', city: 'Phuket', country: 'Thailand', countryCode: 'TH', destinationCode: 'HKT', displayName: 'Phuket, Thailand', type: 'city', tags: ['thailand', 'patong', 'kata', 'island'] },
  { name: 'Koh Samui', city: 'Koh Samui', country: 'Thailand', countryCode: 'TH', destinationCode: 'USM', displayName: 'Koh Samui, Thailand', type: 'city', tags: ['thailand', 'chaweng', 'island'] },
  { name: 'Bali', city: 'Bali', country: 'Indonesia', countryCode: 'ID', destinationCode: 'DPS', displayName: 'Bali, Indonesia', type: 'city', tags: ['indonesia', 'denpasar', 'seminyak', 'ubud', 'kuta', 'canggu'] },
  { name: 'Kuala Lumpur', city: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', destinationCode: 'KUL', displayName: 'Kuala Lumpur, Malaysia', type: 'city', tags: ['malaysia', 'petronas', 'klcc'] },
  { name: 'Tokyo', city: 'Tokyo', country: 'Japan', countryCode: 'JP', destinationCode: 'TYO', displayName: 'Tokyo, Japan', type: 'city', tags: ['japan', 'shinjuku', 'shibuya', 'ginza'] },
  { name: 'Kyoto', city: 'Kyoto', country: 'Japan', countryCode: 'JP', destinationCode: 'KYO', displayName: 'Kyoto, Japan', type: 'city', tags: ['japan', 'gion', 'temples'] },
  { name: 'Seoul', city: 'Seoul', country: 'South Korea', countryCode: 'KR', destinationCode: 'SEL', displayName: 'Seoul, South Korea', type: 'city', tags: ['korea', 'gangnam', 'myeongdong'] },
  { name: 'Hong Kong', city: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', destinationCode: 'HKG', displayName: 'Hong Kong, Hong Kong', type: 'city', tags: ['kowloon', 'central', 'victoria harbour'] },
  { name: 'New York', city: 'New York', country: 'United States', countryCode: 'US', destinationCode: 'NYC', displayName: 'New York, United States', type: 'city', tags: ['usa', 'manhattan', 'times square', 'brooklyn'] },
  { name: 'Miami', city: 'Miami', country: 'United States', countryCode: 'US', destinationCode: 'MIA', displayName: 'Miami, United States', type: 'city', tags: ['usa', 'south beach', 'florida'] },
  { name: 'Los Angeles', city: 'Los Angeles', country: 'United States', countryCode: 'US', destinationCode: 'LAX', displayName: 'Los Angeles, United States', type: 'city', tags: ['usa', 'california', 'hollywood', 'beverly hills', 'santa monica'] },
  { name: 'Las Vegas', city: 'Las Vegas', country: 'United States', countryCode: 'US', destinationCode: 'LAS', displayName: 'Las Vegas, United States', type: 'city', tags: ['usa', 'nevada', 'the strip', 'bellagio'] },
  { name: 'San Francisco', city: 'San Francisco', country: 'United States', countryCode: 'US', destinationCode: 'SFO', displayName: 'San Francisco, United States', type: 'city', tags: ['usa', 'california', 'golden gate'] },
  { name: 'Chicago', city: 'Chicago', country: 'United States', countryCode: 'US', destinationCode: 'CHI', displayName: 'Chicago, United States', type: 'city', tags: ['usa', 'illinois', 'michigan'] },
  { name: 'Toronto', city: 'Toronto', country: 'Canada', countryCode: 'CA', destinationCode: 'YYZ', displayName: 'Toronto, Canada', type: 'city', tags: ['canada', 'ontario', 'cn tower'] },
  { name: 'Vancouver', city: 'Vancouver', country: 'Canada', countryCode: 'CA', destinationCode: 'YVR', displayName: 'Vancouver, Canada', type: 'city', tags: ['canada', 'british columbia'] },
  { name: 'Rome', city: 'Rome', country: 'Italy', countryCode: 'IT', destinationCode: 'ROM', displayName: 'Rome, Italy', type: 'city', tags: ['italy', 'colosseum', 'vatican'] },
  { name: 'Milan', city: 'Milan', country: 'Italy', countryCode: 'IT', destinationCode: 'MIL', displayName: 'Milan, Italy', type: 'city', tags: ['italy', 'duomo', 'fashion'] },
  { name: 'Venice', city: 'Venice', country: 'Italy', countryCode: 'IT', destinationCode: 'VCE', displayName: 'Venice, Italy', type: 'city', tags: ['italy', 'san marco', 'gondola', 'canals'] },
  { name: 'Florence', city: 'Florence', country: 'Italy', countryCode: 'IT', destinationCode: 'FLR', displayName: 'Florence, Italy', type: 'city', tags: ['italy', 'tuscany', 'ponte vecchio'] },
  { name: 'Barcelona', city: 'Barcelona', country: 'Spain', countryCode: 'ES', destinationCode: 'BCN', displayName: 'Barcelona, Spain', type: 'city', tags: ['spain', 'catalonia', 'sagrada familia', 'ramblas'] },
  { name: 'Madrid', city: 'Madrid', country: 'Spain', countryCode: 'ES', destinationCode: 'MAD', displayName: 'Madrid, Spain', type: 'city', tags: ['spain', 'gran via', 'bernabeu'] },
  { name: 'Amsterdam', city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', destinationCode: 'AMS', displayName: 'Amsterdam, Netherlands', type: 'city', tags: ['netherlands', 'holland', 'canals'] },
  { name: 'Vienna', city: 'Vienna', country: 'Austria', countryCode: 'AT', destinationCode: 'VIE', displayName: 'Vienna, Austria', type: 'city', tags: ['austria', 'wien', 'opera'] },
  { name: 'Prague', city: 'Prague', country: 'Czech Republic', countryCode: 'CZ', destinationCode: 'PRG', displayName: 'Prague, Czech Republic', type: 'city', tags: ['czech', 'charles bridge', 'old town'] },
  { name: 'Budapest', city: 'Budapest', country: 'Hungary', countryCode: 'HU', destinationCode: 'BUD', displayName: 'Budapest, Hungary', type: 'city', tags: ['hungary', 'danube', 'parliament'] },
  { name: 'Athens', city: 'Athens', country: 'Greece', countryCode: 'GR', destinationCode: 'ATH', displayName: 'Athens, Greece', type: 'city', tags: ['greece', 'acropolis', 'parthenon'] },
  { name: 'Santorini', city: 'Santorini', country: 'Greece', countryCode: 'GR', destinationCode: 'JTR', displayName: 'Santorini, Greece', type: 'city', tags: ['greece', 'oia', 'thira', 'island'] },
  { name: 'Mykonos', city: 'Mykonos', country: 'Greece', countryCode: 'GR', destinationCode: 'JMK', displayName: 'Mykonos, Greece', type: 'city', tags: ['greece', 'island', 'aegean'] },
  { name: 'Zurich', city: 'Zurich', country: 'Switzerland', countryCode: 'CH', destinationCode: 'ZRH', displayName: 'Zurich, Switzerland', type: 'city', tags: ['switzerland', 'swiss', 'lake zurich'] },
  { name: 'Geneva', city: 'Geneva', country: 'Switzerland', countryCode: 'CH', destinationCode: 'GVA', displayName: 'Geneva, Switzerland', type: 'city', tags: ['switzerland', 'swiss', 'lake geneva'] },
  { name: 'Munich', city: 'Munich', country: 'Germany', countryCode: 'DE', destinationCode: 'MUC', displayName: 'Munich, Germany', type: 'city', tags: ['germany', 'bavaria', 'marienplatz'] },
  { name: 'Berlin', city: 'Berlin', country: 'Germany', countryCode: 'DE', destinationCode: 'BER', displayName: 'Berlin, Germany', type: 'city', tags: ['germany', 'brandenburg gate'] },
  { name: 'Cairo', city: 'Cairo', country: 'Egypt', countryCode: 'EG', destinationCode: 'CAI', displayName: 'Cairo, Egypt', type: 'city', tags: ['egypt', 'pyramids', 'giza', 'nile'] },
  { name: 'Sharm El Sheikh', city: 'Sharm El Sheikh', country: 'Egypt', countryCode: 'EG', destinationCode: 'SSH', displayName: 'Sharm El Sheikh, Egypt', type: 'city', tags: ['egypt', 'red sea', 'resort'] },
  { name: 'Male', city: 'Male', country: 'Maldives', countryCode: 'MV', destinationCode: 'MLE', displayName: 'Male, Maldives', type: 'city', tags: ['maldives', 'atoll', 'resort', 'overwater'] },
  { name: 'Mauritius', city: 'Mauritius', country: 'Mauritius', countryCode: 'MU', destinationCode: 'MRU', displayName: 'Mauritius', type: 'country', tags: ['indian ocean', 'island', 'beach'] },
  { name: 'Cape Town', city: 'Cape Town', country: 'South Africa', countryCode: 'ZA', destinationCode: 'CPT', displayName: 'Cape Town, South Africa', type: 'city', tags: ['south africa', 'table mountain', 'waterfront'] },
  { name: 'Sydney', city: 'Sydney', country: 'Australia', countryCode: 'AU', destinationCode: 'SYD', displayName: 'Sydney, Australia', type: 'city', tags: ['australia', 'opera house', 'harbour'] },
  { name: 'Melbourne', city: 'Melbourne', country: 'Australia', countryCode: 'AU', destinationCode: 'MEL', displayName: 'Melbourne, Australia', type: 'city', tags: ['australia', 'victoria'] },
  { name: 'Auckland', city: 'Auckland', country: 'New Zealand', countryCode: 'NZ', destinationCode: 'AKL', displayName: 'Auckland, New Zealand', type: 'city', tags: ['new zealand', 'sky tower'] }
];

export const TOP_HOTELS = [
  { code: 103294, name: 'Atlantis, The Palm', zoneName: 'Palm Jumeirah', destinationName: 'Dubai', destinationCode: 'DXB', countryCode: 'AE', categoryCode: '5EST', tags: ['atlantis', 'palm', 'luxury', 'aquaventure', 'dubai'] },
  { code: 738790, name: 'Atlantis The Royal', zoneName: 'Palm Jumeirah', destinationName: 'Dubai', destinationCode: 'DXB', countryCode: 'AE', categoryCode: '5EST', tags: ['atlantis', 'royal', 'ultra luxury', 'dubai'] },
  { code: 7660, name: 'Burj Al Arab Jumeirah', zoneName: 'Jumeirah Beach', destinationName: 'Dubai', destinationCode: 'DXB', countryCode: 'AE', categoryCode: '5EST', tags: ['burj al arab', '7 star', 'iconic', 'luxury', 'dubai'] },
  { code: 142659, name: 'Armani Hotel Dubai', zoneName: 'Downtown Dubai', destinationName: 'Dubai', destinationCode: 'DXB', countryCode: 'AE', categoryCode: '5EST', tags: ['burj khalifa', 'downtown', 'luxury', 'dubai'] },
  { code: 878259, name: 'SLS Dubai Hotel & Residences', zoneName: 'Business Bay', destinationName: 'Dubai', destinationCode: 'DXB', countryCode: 'AE', categoryCode: '5EST', tags: ['sls', 'infinity pool', 'lifestyle', 'dubai'] },
  { code: 115398, name: 'Address Downtown', zoneName: 'Downtown Dubai', destinationName: 'Dubai', destinationCode: 'DXB', countryCode: 'AE', categoryCode: '5EST', tags: ['address', 'downtown', 'dubai mall', 'fountain view'] },
  { code: 655254, name: 'Address Sky View', zoneName: 'Downtown Dubai', destinationName: 'Dubai', destinationCode: 'DXB', countryCode: 'AE', categoryCode: '5EST', tags: ['sky view', 'bridge', 'infinity pool', 'dubai'] },
  { code: 7656, name: 'Jumeirah Beach Hotel', zoneName: 'Jumeirah Beach', destinationName: 'Dubai', destinationCode: 'DXB', countryCode: 'AE', categoryCode: '5EST', tags: ['jumeirah', 'beach', 'family', 'wild wadi', 'dubai'] },
  { code: 545301, name: 'Jumeirah Al Naseem', zoneName: 'Madinat Jumeirah', destinationName: 'Dubai', destinationCode: 'DXB', countryCode: 'AE', categoryCode: '5EST', tags: ['madinat', 'jumeirah', 'resort', 'dubai'] },
  { code: 93664, name: 'The Ritz-Carlton, Dubai', zoneName: 'JBR Walk', destinationName: 'Dubai', destinationCode: 'DXB', countryCode: 'AE', categoryCode: '5EST', tags: ['ritz carlton', 'jbr', 'marina', 'beach', 'dubai'] },
  { code: 557509, name: 'Four Seasons Resort Dubai at Jumeirah Beach', zoneName: 'Jumeirah Beach', destinationName: 'Dubai', destinationCode: 'DXB', countryCode: 'AE', categoryCode: '5EST', tags: ['four seasons', 'jumeirah', 'luxury', 'dubai'] },
  { code: 191315, name: 'JW Marriott Marquis Hotel Dubai', zoneName: 'Business Bay', destinationName: 'Dubai', destinationCode: 'DXB', countryCode: 'AE', categoryCode: '5EST', tags: ['jw marriott', 'business bay', 'twin towers', 'dubai'] },
  { code: 82653, name: 'Kempinski Hotel Mall of the Emirates', zoneName: 'Al Barsha', destinationName: 'Dubai', destinationCode: 'DXB', countryCode: 'AE', categoryCode: '5EST', tags: ['kempinski', 'ski dubai', 'mall', 'dubai'] },
  { code: 224014, name: 'Sofitel Dubai The Palm Resort & Spa', zoneName: 'Palm Jumeirah', destinationName: 'Dubai', destinationCode: 'DXB', countryCode: 'AE', categoryCode: '5EST', tags: ['sofitel', 'palm', 'resort', 'polynesian', 'dubai'] },
  { code: 199054, name: 'One&Only Royal Mirage Resort Dubai', zoneName: 'Jumeirah Beach', destinationName: 'Dubai', destinationCode: 'DXB', countryCode: 'AE', categoryCode: '5EST', tags: ['one&only', 'palace', 'luxury', 'dubai'] },
  { code: 10016, name: 'Emirates Palace Mandarin Oriental', zoneName: 'Corniche', destinationName: 'Abu Dhabi', destinationCode: 'AUH', countryCode: 'AE', categoryCode: '5EST', tags: ['emirates palace', 'mandarin oriental', 'palace', 'abu dhabi'] },
  { code: 10017, name: 'The Savoy', zoneName: 'Westminster', destinationName: 'London', destinationCode: 'LON', countryCode: 'GB', categoryCode: '5EST', tags: ['savoy', 'strand', 'luxury', 'london'] },
  { code: 10018, name: 'The Ritz London', zoneName: 'Piccadilly', destinationName: 'London', destinationCode: 'LON', countryCode: 'GB', categoryCode: '5EST', tags: ['ritz', 'piccadilly', 'mayfair', 'london'] },
  { code: 10019, name: 'The Plaza Hotel', zoneName: 'Manhattan', destinationName: 'New York', destinationCode: 'NYC', countryCode: 'US', categoryCode: '5EST', tags: ['plaza', 'central park', '5th ave', 'new york'] },
  { code: 10020, name: 'Marina Bay Sands', zoneName: 'Marina Bay', destinationName: 'Singapore', destinationCode: 'SIN', countryCode: 'SG', categoryCode: '5EST', tags: ['mbs', 'infinity pool', 'skypark', 'singapore'] },
  { code: 10021, name: 'Raffles Hotel Singapore', zoneName: 'Colonial District', destinationName: 'Singapore', destinationCode: 'SIN', countryCode: 'SG', categoryCode: '5EST', tags: ['raffles', 'singapore sling', 'heritage', 'singapore'] },
  { code: 10022, name: 'Mandarin Oriental, Bangkok', zoneName: 'Riverside', destinationName: 'Bangkok', destinationCode: 'BKK', countryCode: 'TH', categoryCode: '5EST', tags: ['mandarin oriental', 'chao phraya', 'bangkok'] },
  { code: 10023, name: 'The Peninsula Paris', zoneName: 'Avenue Kleber', destinationName: 'Paris', destinationCode: 'PAR', countryCode: 'FR', categoryCode: '5EST', tags: ['peninsula', 'arc de triomphe', 'paris'] },
  { code: 10024, name: 'Four Seasons Hotel George V', zoneName: 'Champs-Elysees', destinationName: 'Paris', destinationCode: 'PAR', countryCode: 'FR', categoryCode: '5EST', tags: ['george v', 'four seasons', 'michelin', 'paris'] },
  { code: 10025, name: 'Banyan Tree Ungasan Bali', zoneName: 'Uluwatu', destinationName: 'Bali', destinationCode: 'DPS', countryCode: 'ID', categoryCode: '5EST', tags: ['banyan tree', 'cliff', 'villas', 'bali'] }
];

export function getInstantSuggestions(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') {
    return { locations: [], hotels: [] };
  }
  const term = rawInput.toLowerCase().trim();
  if (term.length < 1) {
    return { locations: [], hotels: [] };
  }

  const primaryTerm = term.split(',')[0].trim();
  const tokens = term.split(/[\s,]+/).filter(t => t.length > 0);

  // 1. Filter Destinations
  const matchedLocations = TOP_DESTINATIONS.filter(loc => {
    const nameLower = (loc.name || '').toLowerCase();
    const cityLower = (loc.city || '').toLowerCase();
    const countryLower = (loc.country || '').toLowerCase();
    const codeLower = (loc.destinationCode || '').toLowerCase();
    const fullLower = `${cityLower}, ${countryLower}`;
    const tags = loc.tags || [];

    // Exact or prefix match on city / code
    if (cityLower.startsWith(term) || codeLower === term || codeLower === primaryTerm) return true;
    if (cityLower.startsWith(primaryTerm)) return true;
    // Substring match on city or full display
    if (cityLower.includes(term) || fullLower.includes(term) || countryLower.includes(term)) return true;
    // All tokens present in either city, country, or tags
    if (tokens.length > 1 && tokens.every(tok => 
      cityLower.includes(tok) || countryLower.includes(tok) || codeLower.includes(tok) || tags.some(tag => tag.includes(tok))
    )) {
      return true;
    }
    // Tag matching
    if (tags.some(tag => tag.startsWith(term) || tag.includes(term))) return true;

    return false;
  }).slice(0, 10);

  // 2. Filter Hotels
  const matchedHotels = TOP_HOTELS.filter(hotel => {
    const hotelNameLower = (hotel.name || '').toLowerCase();
    const zoneLower = (hotel.zoneName || '').toLowerCase();
    const destLower = (hotel.destinationName || '').toLowerCase();
    const tags = hotel.tags || [];

    if (hotelNameLower.startsWith(term) || hotelNameLower.startsWith(primaryTerm)) return true;
    if (hotelNameLower.includes(term) || hotelNameLower.includes(primaryTerm)) return true;
    if (tokens.length > 1 && tokens.every(tok => 
      hotelNameLower.includes(tok) || zoneLower.includes(tok) || destLower.includes(tok) || tags.some(tag => tag.includes(tok))
    )) {
      return true;
    }
    if (tags.some(tag => tag.startsWith(term) || tag.includes(term))) return true;

    return false;
  }).slice(0, 10);

  return { locations: matchedLocations, hotels: matchedHotels };
}
