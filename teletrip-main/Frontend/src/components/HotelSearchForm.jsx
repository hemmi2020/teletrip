import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Users, Search, ChevronDown, X, Plus, Minus } from 'lucide-react';
import { DateRange } from 'react-date-range';
import { addDays, format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

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

  // Fetch all cities on mount (countries excluded)
  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoadingLocations(true);
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/');
        const data = await response.json();
        
        if (!data.error) {
          const locations = [];
          data.data.forEach(country => {
            // Only add cities (not countries)
            if (country.cities && country.cities.length > 0) {
              country.cities.forEach(city => {
                locations.push({
                  type: 'city',
                  city: city,
                  country: country.country,
                  countryCode: country.iso3,
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

  // Filter locations based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLocations([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allLocations
      .filter(location => location.searchText.includes(query))
      .slice(0, 50); // Limit to 50 results for performance

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
    { id: 'stays', label: 'Stays', icon: '🏨' },
    { id: 'transfers', label: 'Transfers', icon: '🚐' },
    { id: 'experiences', label: 'Experiences', icon: '🎭' },
    { id: 'car-rental', label: 'Car Rental', icon: '🚗' },
    { id: 'theme-parks', label: 'Theme parks', icon: '🎢' }
  ];

  return (
    <div className=".sm:min-h-screen mt-10  sm:pt-8 md:pt-12 lg:pt-16 bg-transparent px-2 sm:px-4 mb-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/30 rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-2 md:p-6 lg:p-8 backdrop-blur-lg bg-opacity-95">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6 lg:mb-8 px-1">
            Search for hotels, transfers, experiences and more
          </h1>

          {/* Tabs - Responsive scrolling on mobile */}
          <div className="flex overflow-x-auto space-x-2 mb-4 sm:mb-6 md:mb-8 pb-2 scrollbar-hide">
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
                <span className="hidden xs:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'stays' ? (
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
                {showLocationDropdown && (searchQuery.trim() !== '' || isLoadingLocations) && (
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
                    <div className="fixed sm:absolute z-50 inset-x-0 sm:inset-x-auto top-1/2 sm:top-auto left-1/2 sm:left-auto transform -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:translate-y-0 sm:mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-w-full overflow-hidden">
                      <div className="overflow-x-auto">
                        <DateRange
                          ranges={dateRange}
                          onChange={(item) => setDateRange([item.selection])}
                          minDate={new Date()}
                          moveRangeOnFirstSelection={false}
                          months={window.innerWidth < 640 ? 1 : 2}
                          direction="horizontal"
                          rangeColors={['#2563eb']}
                          className="text-sm sm:text-base"
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
              <button
                type="submit"
                className="w-full md:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2 cursor-pointer text-sm sm:text-base"
              >
                <Search size={18} />
                <span>Search Hotels</span>
              </button>
            </form>
          ) : (
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