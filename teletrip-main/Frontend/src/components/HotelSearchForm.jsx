import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Users, Search, ChevronDown, X, Plus, Minus, Loader2, Star, Clock, Tag } from 'lucide-react';
import { DateRange } from 'react-date-range';
import { addDays, format } from 'date-fns';
import { searchTransfers } from '../services/transfersApi';
import axios from 'axios';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

// Transfers Tab Component
const TransfersTab = () => {
  const [pickupQuery, setPickupQuery] = useState('');
  const [dropoffQuery, setDropoffQuery] = useState('');
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);
  const [transferLocations, setTransferLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [filteredPickupLocations, setFilteredPickupLocations] = useState([]);
  const [filteredDropoffLocations, setFilteredDropoffLocations] = useState([]);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedDropoff, setSelectedDropoff] = useState(null);
  const [transferDate, setTransferDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);

  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoadingLocations(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/locations/transfers`);
        if (response.data.success) {
          setTransferLocations(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching transfer locations:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (pickupQuery.trim() === '') {
      setFilteredPickupLocations([]);
      return;
    }
    const query = pickupQuery.toLowerCase().trim();
    const filtered = transferLocations.filter(loc => 
      loc.name.toLowerCase().includes(query) || 
      loc.city.toLowerCase().includes(query) ||
      loc.code.toLowerCase().includes(query)
    );
    setFilteredPickupLocations(filtered);
  }, [pickupQuery, transferLocations]);

  useEffect(() => {
    if (dropoffQuery.trim() === '') {
      setFilteredDropoffLocations([]);
      return;
    }
    const query = dropoffQuery.toLowerCase().trim();
    const filtered = transferLocations.filter(loc => 
      loc.name.toLowerCase().includes(query) || 
      loc.city.toLowerCase().includes(query) ||
      loc.code.toLowerCase().includes(query)
    );
    setFilteredDropoffLocations(filtered);
  }, [dropoffQuery, transferLocations]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickupRef.current && !pickupRef.current.contains(event.target)) {
        setShowPickupDropdown(false);
      }
      if (dropoffRef.current && !dropoffRef.current.contains(event.target)) {
        setShowDropoffDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPickup || !selectedDropoff) {
      setError('Please select both pickup and dropoff locations');
      return;
    }
    if (!transferDate) {
      setError('Please select date and time');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (!selectedPickup?.code || !selectedDropoff?.code) {
        setError('Please select valid pickup and dropoff locations with codes');
        setLoading(false);
        return;
      }
      const dateTime = transferDate.includes('T') ? transferDate : transferDate.replace(' ', 'T');
      const searchParams = {
        language: 'en',
        fromType: selectedPickup.type || 'ATLAS',
        fromCode: selectedPickup.code,
        toType: selectedDropoff.type || 'IATA',
        toCode: selectedDropoff.code,
        outbound: dateTime + ':00',
        adults,
        children,
        infants
      };
      console.log('Calling searchTransfers API...');
      const results = await searchTransfers(searchParams);
      console.log('API Response:', results);
      sessionStorage.setItem('transferResults', JSON.stringify(results.data));
      sessionStorage.setItem('transferSearch', JSON.stringify(searchParams));
      window.location.href = '/transfers';
    } catch (err) {
      console.error('Search error:', err);
      const errorMsg = err.response?.data?.error;
      if (Array.isArray(errorMsg)) {
        setError(errorMsg.map(e => e.msg).join(', '));
      } else {
        setError(typeof errorMsg === 'string' ? errorMsg : err.response?.data?.message || 'Search failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="relative" ref={pickupRef}>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 px-1">
            Pickup Location <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={pickupQuery}
              onChange={(e) => {
                setPickupQuery(e.target.value);
                setShowPickupDropdown(true);
                if (e.target.value.trim() === '') setSelectedPickup(null);
              }}
              onFocus={() => setShowPickupDropdown(true)}
              placeholder="e.g., London"
              required
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            {pickupQuery && (
              <button
                type="button"
                onClick={() => {
                  setPickupQuery('');
                  setSelectedPickup(null);
                  setFilteredPickupLocations([]);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {showPickupDropdown && pickupQuery.trim() !== '' && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredPickupLocations.length > 0 ? (
                <ul>
                  {filteredPickupLocations.map((location, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setSelectedPickup(location);
                        setPickupQuery(location.name);
                        setShowPickupDropdown(false);
                      }}
                      className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="flex items-center space-x-2">
                        <MapPin size={16} className="text-blue-600" />
                        <div>
                          <div className="font-medium text-sm">{location.name}</div>
                          <div className="text-xs text-gray-500">{location.type} - {location.code}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 text-center text-gray-500 text-sm">No locations found</div>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={dropoffRef}>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 px-1">
            Dropoff Location <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={dropoffQuery}
              onChange={(e) => {
                setDropoffQuery(e.target.value);
                setShowDropoffDropdown(true);
                if (e.target.value.trim() === '') setSelectedDropoff(null);
              }}
              onFocus={() => setShowDropoffDropdown(true)}
              placeholder="e.g., Paris"
              required
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            {dropoffQuery && (
              <button
                type="button"
                onClick={() => {
                  setDropoffQuery('');
                  setSelectedDropoff(null);
                  setFilteredDropoffLocations([]);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {showDropoffDropdown && dropoffQuery.trim() !== '' && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredDropoffLocations.length > 0 ? (
                <ul>
                  {filteredDropoffLocations.map((location, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setSelectedDropoff(location);
                        setDropoffQuery(location.name);
                        setShowDropoffDropdown(false);
                      }}
                      className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="flex items-center space-x-2">
                        <MapPin size={16} className="text-blue-600" />
                        <div>
                          <div className="font-medium text-sm">{location.name}</div>
                          <div className="text-xs text-gray-500">{location.type} - {location.code}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 text-center text-gray-500 text-sm">No locations found</div>
              )}
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 px-1">
            Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={transferDate}
            onChange={(e) => setTransferDate(e.target.value)}
            required
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 px-1">Adults</label>
            <input
              type="number"
              min="1"
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
              className="w-full px-2 py-2.5 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 px-1">Children</label>
            <input
              type="number"
              min="0"
              value={children}
              onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
              className="w-full px-2 py-2.5 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 px-1">Infants</label>
            <input
              type="number"
              min="0"
              value={infants}
              onChange={(e) => setInfants(parseInt(e.target.value) || 0)}
              className="w-full px-2 py-2.5 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <Search size={18} />
          <span>{loading ? 'Searching...' : 'Search Transfers'}</span>
        </button>
      </div>
    </form>
  );
};

// Experiences Tab Component
const ExperiencesTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [allLocations, setAllLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [dateRange, setDateRange] = useState([{
    startDate: addDays(new Date(), 1),
    endDate: addDays(new Date(), 4),
    key: 'selection'
  }]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [adults, setAdults] = useState(2);
  const locationRef = useRef(null);
  const calendarRef = useRef(null);

  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoadingLocations(true);
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/');
        const data = await response.json();
        
        if (!data.error) {
          const locations = [];
          data.data.forEach(country => {
            if (country.cities && country.cities.length > 0) {
              country.cities.forEach(city => {
                locations.push({
                  city: city,
                  country: country.country,
                  displayName: `${city}, ${country.country}`,
                  searchText: `${city} ${country.country}`.toLowerCase()
                });
              });
            }
          });
          setAllLocations(locations);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLocations([]);
      return;
    }
    const query = searchQuery.toLowerCase().trim();
    const filtered = allLocations
      .filter(location => location.searchText.includes(query))
      .slice(0, 50);
    setFilteredLocations(filtered);
  }, [searchQuery, allLocations]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setSearchQuery(location.displayName);
    setShowLocationDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedLocation) {
      alert('Please select a destination');
      return;
    }

    const from = format(dateRange[0].startDate, 'yyyy-MM-dd');
    const to = format(dateRange[0].endDate, 'yyyy-MM-dd');

    const url = `/activity-search-results?destination=${encodeURIComponent(selectedLocation.city)}&country=${encodeURIComponent(selectedLocation.country)}&from=${from}&to=${to}&adults=${adults}`;
    window.location.href = url;
  };

  const calculateNights = () => {
    const start = dateRange[0].startDate;
    const end = dateRange[0].endDate;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="relative" ref={locationRef}>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 px-1">
          Destination <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowLocationDropdown(true);
              if (e.target.value.trim() === '') setSelectedLocation(null);
            }}
            onFocus={() => setShowLocationDropdown(true)}
            placeholder="Where are you going? e.g: Dubai"
            className="w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            required
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedLocation(null);
                setFilteredLocations([]);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {showLocationDropdown && (searchQuery.trim() !== '' || isLoadingLocations) && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 sm:max-h-80 overflow-y-auto">
            {isLoadingLocations ? (
              <div className="p-3 sm:p-4 text-center text-gray-500 text-sm sm:text-base">Loading locations...</div>
            ) : filteredLocations.length > 0 ? (
              <ul>
                {filteredLocations.map((location, index) => (
                  <li
                    key={index} 
                    onClick={() => handleLocationSelect(location)}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <MapPin size={16} className="text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-800 text-sm sm:text-base truncate">{location.city}</div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate">City in {location.country}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 sm:p-4 text-center text-gray-500 text-sm sm:text-base">
                No locations found. Try a different search term.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="relative" ref={calendarRef}>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 px-1">
            Dates <span className="text-red-500">*</span>
          </label>
          <div
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-white"
          >
            <Calendar className="text-gray-400 mr-2 flex-shrink-0" size={18} />
            <span className="text-gray-700 flex-1 text-sm sm:text-base truncate">
              <span className="hidden sm:inline">{format(dateRange[0].startDate, 'MMM dd, yyyy')} - {format(dateRange[0].endDate, 'MMM dd, yyyy')}</span>
              <span className="sm:hidden">{format(dateRange[0].startDate, 'MMM dd')} - {format(dateRange[0].endDate, 'MMM dd')}</span>
            </span>
            <span className="text-xs sm:text-sm text-gray-500 ml-2 flex-shrink-0">
              ({calculateNights()}d)
            </span>
          </div>
          {showCalendar && (
            <div className="fixed sm:absolute z-50 left-1/2 top-1/2 sm:top-auto transform -translate-x-1/2 -translate-y-1/2 sm:translate-y-0 sm:mt-2 bg-white border border-gray-300 rounded-lg shadow-xl">
              <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                <DateRange
                  ranges={dateRange}
                  onChange={(item) => setDateRange([item.selection])}
                  minDate={new Date()}
                  moveRangeOnFirstSelection={false}
                  months={window.innerWidth < 640 ? 1 : 2}
                  direction="horizontal"
                  rangeColors={['#2563eb']}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 px-1">
            Adults <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="number"
              min="1"
              max="20"
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="w-full md:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <Search size={18} />
          <span>Search Experiences</span>
        </button>
      </div>
    </form>
  );
};

const OldExperiencesResults = ({ experiences }) => {
  return (
    <>
      {experiences.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {experiences.length} Experience{experiences.length !== 1 ? 's' : ''} Found
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {experiences.map((activity) => (
              <div
                key={activity.code}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {activity.images?.[0] ? (
                  <img
                    src={activity.images[0]}
                    alt={activity.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => e.target.src = 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl">🎭</span>
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {activity.name}
                  </h4>
                  {activity.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                  {activity.destination && (
                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                      <MapPin size={12} />
                      {activity.destination}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    {activity.pricing?.amount ? (
                      <span className="text-lg font-bold text-blue-600">
                        {activity.pricing.currency} {activity.pricing.amount}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Price on request</span>
                    )}
                    <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const HotelSearchForm = () => {
  // Date range state
  const [dateRange, setDateRange] = useState([
    {
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 4),
      key: 'selection'
    }
  ]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTravellerDropdown, setShowTravellerDropdown] = useState(false);
  const calendarRef = useRef(null);
  const travellerRef = useRef(null);

  // Location search states
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [allLocations, setAllLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const locationRef = useRef(null);

  // Other states
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState([]);
  const [activeTab, setActiveTab] = useState('stays');

  // Fetch capital cities from REST Countries API
  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoadingLocations(true);
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,cca2');
        const data = await response.json();
        
        const locations = [];
        data.forEach(country => {
          if (country.capital && country.capital.length > 0) {
            country.capital.forEach(city => {
              locations.push({
                type: 'city',
                city: city,
                country: country.name.common,
                countryCode: country.cca2,
                displayName: `${city}, ${country.name.common}`,
                searchText: `${city} ${country.name.common}`.toLowerCase()
              });
            });
          }
        });

        setAllLocations(locations);
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  // Filter locations based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLocations([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allLocations
      .filter(location => location.searchText.includes(query))
      .slice(0, 50);

    setFilteredLocations(filtered);
  }, [searchQuery, allLocations]);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
      if (travellerRef.current && !travellerRef.current.contains(event.target)) {
        setShowTravellerDropdown(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setSearchQuery(location.displayName);
    setShowLocationDropdown(false);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowLocationDropdown(true);
    if (e.target.value.trim() === '') {
      setSelectedLocation(null);
    }
  };

  const handleChildrenChange = (newValue) => {
    const childCount = Math.max(0, Math.min(10, newValue));
    setChildren(childCount);
    
    if (childCount > childAges.length) {
      setChildAges([...childAges, ...Array(childCount - childAges.length).fill(0)]);
    } else if (childCount < childAges.length) {
      setChildAges(childAges.slice(0, childCount));
    }
  };

  const handleChildAgeChange = (index, age) => {
    const newAges = [...childAges];
    newAges[index] = parseInt(age);
    setChildAges(newAges);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedLocation) {
      alert('Please select a destination');
      return;
    }

    const checkIn = format(dateRange[0].startDate, 'yyyy-MM-dd');
    const checkOut = format(dateRange[0].endDate, 'yyyy-MM-dd');

    // Build URL - now we always have both city and country since we only show cities
    let url = `/hotel-search-results?checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}&adults=${adults}&children=${children}`;
    url += `&country=${encodeURIComponent(selectedLocation.country)}`;
    url += `&city=${encodeURIComponent(selectedLocation.city)}`;

    // Add child ages if present
    if (children > 0 && childAges.length > 0) {
      url += `&childAges=${childAges.join(',')}`;
    }

    window.location.href = url;
  };

  const calculateNights = () => {
    const start = dateRange[0].startDate;
    const end = dateRange[0].endDate;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTravellerSummary = () => {
    let summary = `${adults} Adult${adults > 1 ? 's' : ''}`;
    if (children > 0) {
      summary += `, ${children} Child${children > 1 ? 'ren' : ''}`;
    }
    summary += ` • ${rooms} Room${rooms > 1 ? 's' : ''}`;
    return summary;
  };

  const tabs = [
    { id: 'stays', label: 'Stays', icon: '🏨 ' },
    { id: 'transfers', label: 'Transfers', icon: '🚐 ' },
    { id: 'experiences', label: 'Experiences', icon: '🎭 ' }
  ];

  return (
    <div className="sm:min-h-screen pt-20 sm:pt-24 md:pt-28 lg:pt-32 bg-transparent px-2 sm:px-4 mb-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/30 rounded-xl   sm:rounded-2xl shadow-2xl p-3 sm:p-2 md:p-6 lg:p-8 backdrop-blur-lg bg-opacity-95">
          <h1 className="text-lg sm:text-xl  md:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6 lg:mb-8 px-1">
            Search for hotels, transfers, experiences and more
          </h1>

          {/* Tabs - Responsive scrolling on mobile */}
          <div className="flex overflow-x-auto  space-x-2 mb-4 sm:mb-6 md:mb-8 pb-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-base sm:text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'stays' && (
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Dynamic Location Search */}
              <div className="relative" ref={locationRef}>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 px-1">
                  Destination, zone or hotel name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={() => setShowLocationDropdown(true)}
                    placeholder="Where are you going? e.g: london"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-sm sm:text-base"
                    required
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedLocation(null);
                        setFilteredLocations([]);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Dropdown Results */}
                {showLocationDropdown && searchQuery.trim() !== '' && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 sm:max-h-80 overflow-y-auto">
                    {isLoadingLocations ? (
                      <div className="p-3 sm:p-4 text-center text-gray-500 text-sm sm:text-base">Loading locations...</div>
                    ) : filteredLocations.length > 0 ? (
                      <ul>
                        {filteredLocations.map((location, index) => (
                          <li
                            key={`${location.type}-${index}`}
                            onClick={() => handleLocationSelect(location)}
                            className="px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <MapPin size={16} className="text-blue-600 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-gray-800 text-sm sm:text-base truncate">
                                  {location.type === 'city' ? location.city : location.country}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 truncate">
                                  {location.type === 'city' 
                                    ? `City in ${location.country}` 
                                    : 'Country'}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-3 sm:p-4 text-center text-gray-500 text-sm sm:text-base">
                        No locations found. Try a different search term.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Date Range Picker */}
                <div className="relative" ref={calendarRef}>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 px-1">
                    Dates <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="flex items-center w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                  >
                    <Calendar className="text-gray-400 mr-2 flex-shrink-0" size={18} />
                    <span className="text-gray-700 flex-1 text-sm sm:text-base truncate">
                      <span className="hidden sm:inline">{format(dateRange[0].startDate, 'MMM dd, yyyy')} - {format(dateRange[0].endDate, 'MMM dd, yyyy')}</span>
                      <span className="sm:hidden">{format(dateRange[0].startDate, 'MMM dd')} - {format(dateRange[0].endDate, 'MMM dd')}</span>
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 ml-2 flex-shrink-0">
                      ({calculateNights()}n)
                    </span>
                  </div>

                  {showCalendar && (
                    <div className="fixed sm:absolute z-50 left-1/2 top-1/2 sm:top-auto transform -translate-x-1/2 -translate-y-1/2 sm:translate-y-0 sm:mt-2 bg-white border border-gray-300 rounded-lg shadow-xl">
                      <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                        <DateRange
                          ranges={dateRange}
                          onChange={(item) => setDateRange([item.selection])}
                          minDate={new Date()}
                          moveRangeOnFirstSelection={false}
                          months={window.innerWidth < 640 ? 1 : 2}
                          direction="horizontal"
                          rangeColors={['#2563eb']}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Travellers Dropdown */}
                <div className="relative" ref={travellerRef}>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 px-1">
                    Travellers & Rooms <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => setShowTravellerDropdown(!showTravellerDropdown)}
                    className="flex items-center w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                  >
                    <Users className="text-gray-400 mr-2 flex-shrink-0" size={18} />
                    <span className="text-gray-700 flex-1 text-sm sm:text-base truncate">
                      {getTravellerSummary()}
                    </span>
                    <ChevronDown className="text-gray-400 flex-shrink-0" size={18} />
                  </div>

                  {showTravellerDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                      {/* Rooms */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium text-sm sm:text-base">Rooms</span>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <button
                            type="button"
                            onClick={() => setRooms(Math.max(1, rooms - 1))}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{rooms}</span>
                          <button
                            type="button"
                            onClick={() => setRooms(Math.min(10, rooms + 1))}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium text-sm sm:text-base">Adults</span>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <button
                            type="button"
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{adults}</span>
                          <button
                            type="button"
                            onClick={() => setAdults(Math.min(20, adults + 1))}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium text-sm sm:text-base">Children</span>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <button
                            type="button"
                            onClick={() => handleChildrenChange(children - 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{children}</span>
                          <button
                            type="button"
                            onClick={() => handleChildrenChange(children + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Child Ages */}
                      {children > 0 && (
                        <div className="pt-2 sm:pt-3 border-t border-gray-200">
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Ages of children at check-out</p>
                          <div className="grid grid-cols-2 gap-2">
                            {childAges.map((age, index) => (
                              <select
                                key={index}
                                value={age}
                                onChange={(e) => handleChildAgeChange(index, e.target.value)}
                                className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                              >
                                <option value={0}>Under 1</option>
                                {[...Array(17)].map((_, i) => (
                                  <option key={i + 1} value={i + 1}>{i + 1} year{i + 1 > 1 ? 's' : ''}</option>
                                ))}
                              </select>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowTravellerDropdown(false)}
                        className="w-full mt-2 sm:mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  style={{ cursor: 'pointer' }}
                  className="w-full md:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2 cursor-pointer text-sm sm:text-base"
                >
                  <Search size={18} />
                  <span>Search Hotels</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'transfers' && <TransfersTab />}
          {activeTab === 'experiences' && <ExperiencesTab />}

          {activeTab !== 'stays' && activeTab !== 'transfers' && activeTab !== 'experiences' && (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <p className="text-base sm:text-lg">{tabs.find(t => t.id === activeTab)?.label} feature coming soon!</p>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default HotelSearchForm;