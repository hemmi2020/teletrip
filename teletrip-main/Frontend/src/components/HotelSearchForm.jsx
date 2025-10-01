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

  // Other states
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState([]);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [activeTab, setActiveTab] = useState('stays');

  // Fetch countries on mount
  useEffect(() => {
    fetch('https://countriesnow.space/api/v0.1/countries/')
      .then((response) => response.json())
      .then((data) => {
        if (!data.error) {
          const sortedCountries = data.data.sort((a, b) => 
            a.country.localeCompare(b.country)
          );
          setCountries(sortedCountries);
        }
      })
      .catch((error) => console.error('Error fetching countries:', error));
  }, []);

  // Update cities when country changes
  useEffect(() => {
    if (country) {
      const selectedCountryData = countries.find((c) => c.iso3 === country);
      if (selectedCountryData) {
        setCities(selectedCountryData.cities || []);
        if (selectedCountryData.cities && selectedCountryData.cities.length > 0) {
          setCity(selectedCountryData.cities[0]);
        }
      }
    }
  }, [country, countries]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
      if (travellerRef.current && !travellerRef.current.contains(event.target)) {
        setShowTravellerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date for display
  const formatDate = (date) => {
    return format(date, 'dd/MM/yyyy');
  };

  // Calculate nights
  const calculateNights = () => {
    const start = dateRange[0].startDate;
    const end = dateRange[0].endDate;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get traveller summary text
  const getTravellerSummary = () => {
    const parts = [];
    if (rooms > 0) parts.push(`${rooms} Room${rooms > 1 ? 's' : ''}`);
    if (adults > 0) parts.push(`${adults} Adult${adults > 1 ? 's' : ''}`);
    if (children > 0) parts.push(`${children} Child${children > 1 ? 'ren' : ''}`);
    return parts.join(', ') || 'Select travellers';
  };

  // Handle form submission
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const selectedCountryData = countries.find((c) => c.iso3 === country);
    const countryName = selectedCountryData ? selectedCountryData.country : country;

    // Convert dates to YYYY-MM-DD format for API
    const checkIn = format(dateRange[0].startDate, 'yyyy-MM-dd');
    const checkOut = format(dateRange[0].endDate, 'yyyy-MM-dd');

    // Build URL with childAges if children > 0
    let url = `/hotel-search-results?checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}&adults=${adults}&children=${children}&country=${encodeURIComponent(
      countryName
    )}&city=${encodeURIComponent(city)}`;
    
    // Add child ages to URL
    if (children > 0 && childAges.length > 0) {
      url += `&childAges=${childAges.join(',')}`;
    }

    window.location.href = url;
  };

  const tabs = [
    { id: 'stays', label: 'Stays', icon: '🏨' },
    { id: 'transfers', label: 'Transfers', icon: '🚐' },
    { id: 'experiences', label: 'Experiences', icon: '🎭' },
    { id: 'car-rental', label: 'Car Rental', icon: '🚗' },
    { id: 'theme-parks', label: 'Theme parks', icon: '🎢' }
  ];

  return (
    <div className="w-full pt-22">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
            Search for hotels, transfers, experiences and more
          </h1>

          {/* Tabs */}
          <div className="flex overflow-x-auto space-x-2 mb-4 sm:mb-6 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'stays' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Destination and Dates Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Destination */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Destination, zone or hotel name
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-xs sm:text-sm"
                      required
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.iso3} value={country.iso3}>
                          {country.country}
                        </option>
                      ))}
                    </select>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-xs sm:text-sm"
                      required
                      disabled={!country}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date Range Picker */}
                <div className="relative" ref={calendarRef}>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Dates <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="flex items-center w-full px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                    <div className="flex-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                      <input
                        type="text"
                        value={formatDate(dateRange[0].startDate)}
                        placeholder="dd/mm/yyyy"
                        readOnly
                        className="w-16 sm:w-24 bg-transparent outline-none text-gray-700 cursor-pointer text-xs sm:text-sm"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="text"
                        value={formatDate(dateRange[0].endDate)}
                        placeholder="dd/mm/yyyy"
                        readOnly
                        className="w-16 sm:w-24 bg-transparent outline-none text-gray-700 cursor-pointer text-xs sm:text-sm"
                      />
                    </div>
                    <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
                  </div>

                  {showCalendar && (
                    <div className="absolute top-full left-0 mt-2 z-[60] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
                      <div className="p-2 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          Select dates
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCalendar(false)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                      <DateRange
                        editableDateInputs={true}
                        onChange={(item) => setDateRange([item.selection])}
                        moveRangeOnFirstSelection={false}
                        ranges={dateRange}
                        minDate={new Date()}
                        rangeColors={['#2563eb']}
                        className="border-0"
                      />
                      <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <button
                          type="button"
                          onClick={() => setShowCalendar(false)}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Nights and Travellers Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Nights Display */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Nights
                  </label>
                  <div className="px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-center font-medium text-xs sm:text-sm">
                    {calculateNights()}
                  </div>
                </div>

                {/* Travellers Dropdown - Bedsonline Style */}
                <div className="relative" ref={travellerRef}>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Travellers
                  </label>
                  <div
                    onClick={() => setShowTravellerDropdown(!showTravellerDropdown)}
                    className="flex items-center w-full px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      value={getTravellerSummary()}
                      readOnly
                      className="flex-1 bg-transparent outline-none text-gray-700 cursor-pointer text-xs sm:text-sm"
                    />
                    <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transition-transform ${showTravellerDropdown ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Traveller Dropdown Panel */}
                  {showTravellerDropdown && (
                    <div className="absolute top-full left-0 mt-2 z-[60] bg-white rounded-lg shadow-2xl border border-gray-200 w-full min-w-[280px]">
                      <div className="p-4 space-y-4">
                        {/* Rooms */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Rooms</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setRooms(Math.max(1, rooms - 1))}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                              disabled={rooms <= 1}
                            >
                              <Minus className="h-4 w-4 text-gray-600" />
                            </button>
                            <span className="w-8 text-center font-medium text-gray-700">{rooms}</span>
                            <button
                              type="button"
                              onClick={() => setRooms(Math.min(5, rooms + 1))}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                              disabled={rooms >= 5}
                            >
                              <Plus className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                        </div>

                        {/* Adults */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Adults</div>
                            <div className="text-xs text-gray-500">Ages 18+</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setAdults(Math.max(1, adults - 1))}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                              disabled={adults <= 1}
                            >
                              <Minus className="h-4 w-4 text-gray-600" />
                            </button>
                            <span className="w-8 text-center font-medium text-gray-700">{adults}</span>
                            <button
                              type="button"
                              onClick={() => setAdults(Math.min(10, adults + 1))}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                              disabled={adults >= 10}
                            >
                              <Plus className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                        </div>

                        {/* Children */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-700">Children</div>
                              <div className="text-xs text-gray-500">Ages 0-17</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const newCount = Math.max(0, children - 1);
                                  setChildren(newCount);
                                  setChildAges(prev => prev.slice(0, newCount));
                                }}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                disabled={children <= 0}
                              >
                                <Minus className="h-4 w-4 text-gray-600" />
                              </button>
                              <span className="w-8 text-center font-medium text-gray-700">{children}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newCount = Math.min(10, children + 1);
                                  setChildren(newCount);
                                  if (newCount > childAges.length) {
                                    setChildAges(prev => [...prev, 5]); // Default age 5
                                  }
                                }}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                disabled={children >= 10}
                              >
                                <Plus className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>
                          </div>

                          {/* Child Ages Inputs */}
                          {children > 0 && (
                            <div className="space-y-2 pl-4 border-l-2 border-blue-200">
                              {Array.from({ length: children }).map((_, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <label className="text-xs text-gray-600 w-16">
                                    Child {index + 1}:
                                  </label>
                                  <select
                                    value={childAges[index] || 5}
                                    onChange={(e) => {
                                      const newAges = [...childAges];
                                      newAges[index] = parseInt(e.target.value);
                                      setChildAges(newAges);
                                    }}
                                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    {Array.from({ length: 18 }, (_, i) => (
                                      <option key={i} value={i}>
                                        {i} {i === 1 ? 'year' : 'years'}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Apply Button */}
                      <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <button
                          type="button"
                          onClick={() => setShowTravellerDropdown(false)}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                >
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  Search
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4 animate-bounce">
                {tabs.find((tab) => tab.id === activeTab)?.icon}
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </h2>
              <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6">
                Coming soon! We're working on bringing you amazing{' '}
                {tabs.find((tab) => tab.id === activeTab)?.label.toLowerCase()} options.
              </p>
              <div className="mt-4 sm:mt-6">
                <button
                  onClick={() => setActiveTab('stays')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-sm"
                >
                  Search Hotels Instead
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelSearchForm;