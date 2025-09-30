import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Users, Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { DateRange } from 'react-date-range';
import { addDays, format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './DateRangePicker.css';

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
  const calendarRef = useRef(null);

  // Other states
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
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

  // Handle form submission
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const selectedCountryData = countries.find((c) => c.iso3 === country);
    const countryName = selectedCountryData ? selectedCountryData.country : country;

    // Convert dates to YYYY-MM-DD format for API
    const checkIn = format(dateRange[0].startDate, 'yyyy-MM-dd');
    const checkOut = format(dateRange[0].endDate, 'yyyy-MM-dd');

    const url = `/hotel-search-results?checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}&adults=${adults}&children=${children}&country=${encodeURIComponent(
      countryName
    )}&city=${encodeURIComponent(city)}`;

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
    <div className="min-h-screen bg-transparent from-blue-50 to-orange-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 backdrop-blur-sm bg-opacity-95">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">
            Search for hotels, transfers, experiences and more
          </h1>

          {/* Tabs */}
          <div className="flex overflow-x-auto space-x-2 mb-6 sm:mb-8 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-base sm:text-lg">{tab.icon}</span>
                <span className="text-sm sm:text-base">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Conditional Content Based on Active Tab */}
          {activeTab === 'stays' ? (
            /* Search Form - Only shown for Stays */
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Destination Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination, zone or hotel name
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-sm sm:text-base"
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
                      className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-sm sm:text-base"
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

                {/* Date Range Picker - NEW IMPLEMENTATION */}
                <div className="relative" ref={calendarRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dates <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="flex items-center w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div className="flex-1 flex items-center gap-2 text-sm sm:text-base">
                      <input
                        type="text"
                        value={formatDate(dateRange[0].startDate)}
                        placeholder="dd/mm/yyyy"
                        readOnly
                        className="w-20 sm:w-24 bg-transparent outline-none text-gray-700 cursor-pointer"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="text"
                        value={formatDate(dateRange[0].endDate)}
                        placeholder="dd/mm/yyyy"
                        readOnly
                        className="w-20 sm:w-24 bg-transparent outline-none text-gray-700 cursor-pointer"
                      />
                    </div>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Calendar Dropdown */}
                  {showCalendar && (
                    <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
                      <div className="p-2 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
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
                          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Nights and Travellers Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nights
                  </label>
                  <div className="px-3 sm:px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-center font-medium text-sm sm:text-base">
                    {calculateNights()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rooms
                  </label>
                  <select
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-sm sm:text-base"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} Room{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adults
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-sm sm:text-base"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Children
                  </label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-sm sm:text-base"
                  >
                    {[0, 1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="h-5 w-5" />
                  Search
                </button>
              </div>
            </form>
          ) : (
            /* Coming Soon Message for Other Tabs */
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="text-5xl sm:text-6xl lg:text-7xl mb-4 animate-bounce">
                {tabs.find((tab) => tab.id === activeTab)?.icon}
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </h2>
              <p className="text-gray-500 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8">
                Coming soon! We're working on bringing you amazing{' '}
                {tabs.find((tab) => tab.id === activeTab)?.label.toLowerCase()} options.
              </p>
              <div className="mt-6 sm:mt-8">
                <button
                  onClick={() => setActiveTab('stays')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 sm:py-3 px-6 sm:px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-sm sm:text-base"
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