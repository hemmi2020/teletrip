import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { MapPin, Calendar, Users, Search, ChevronDown, X, Plus, Minus, Loader2, Star, Clock, Tag, Plane, Building2, Hotel, Car, Compass } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { searchTransfers } from '../services/transfersApi';
import axios from 'axios';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

// Lazy-load DateRange to avoid TDZ error with React 19
const LazyDateRange = lazy(() =>
  import('react-date-range').then(mod => ({ default: mod.DateRange }))
);

// Transfers Tab Component
const TransfersTab = ({ variant = 'dark' }) => {
  const lbl = variant === 'light' ? 'text-gray-700' : 'text-white/80';
  const [tripType, setTripType] = useState('one_way');
  const [pickupQuery, setPickupQuery] = useState('');
  const [dropoffQuery, setDropoffQuery] = useState('');
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);
  const [transferLocations, setTransferLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [filteredPickupLocations, setFilteredPickupLocations] = useState([]);
  const [filteredDropoffLocations, setFilteredDropoffLocations] = useState([]);
  const [groupedPickup, setGroupedPickup] = useState([]);
  const [groupedDropoff, setGroupedDropoff] = useState([]);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedDropoff, setSelectedDropoff] = useState(null);
  const [transferDate, setTransferDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [transferDateRange, setTransferDateRange] = useState([{ startDate: addDays(new Date(), 1), endDate: addDays(new Date(), 1), key: 'selection' }]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTravellerDropdown, setShowTravellerDropdown] = useState(false);
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);
  const travellerRef = useRef(null);
  const calendarRef = useRef(null);

  // Debounced search for pickup locations via API (airports + hotels)
  useEffect(() => {
    if (pickupQuery.trim().length < 2) {
      setFilteredPickupLocations([]);
      setGroupedPickup([]);
      return;
    }
    setIsLoadingLocations(true);
    const timer = setTimeout(async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/locations/transfers?search=${encodeURIComponent(pickupQuery.trim())}`);
        if (response.data.success) {
          setFilteredPickupLocations(response.data.data || []);
          setGroupedPickup(response.data.grouped || []);
        }
      } catch (error) {
        console.error('Error searching pickup locations:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [pickupQuery]);

  // Debounced search for dropoff locations via API (airports + hotels)
  useEffect(() => {
    if (dropoffQuery.trim().length < 2) {
      setFilteredDropoffLocations([]);
      setGroupedDropoff([]);
      return;
    }
    setIsLoadingLocations(true);
    const timer = setTimeout(async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/locations/transfers?search=${encodeURIComponent(dropoffQuery.trim())}`);
        if (response.data.success) {
          setFilteredDropoffLocations(response.data.data || []);
          setGroupedDropoff(response.data.grouped || []);
        }
      } catch (error) {
        console.error('Error searching dropoff locations:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [dropoffQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickupRef.current && !pickupRef.current.contains(event.target)) {
        setShowPickupDropdown(false);
      }
      if (dropoffRef.current && !dropoffRef.current.contains(event.target)) {
        setShowDropoffDropdown(false);
      }
      if (travellerRef.current && !travellerRef.current.contains(event.target)) {
        setShowTravellerDropdown(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
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
    if (!transferDateRange[0].startDate) {
      setError('Please select a travel date');
      return;
    }
    if (tripType === 'round_trip' && transferDateRange[0].startDate >= transferDateRange[0].endDate) {
      setError('Return date must be after outbound date');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (!selectedPickup?.code || !selectedDropoff?.code) {
        setError('Please select valid pickup and dropoff locations from the dropdown');
        setLoading(false);
        return;
      }
      const outboundDate = format(transferDateRange[0].startDate, 'yyyy-MM-dd');
      const returnDateStr = tripType === 'round_trip' ? format(transferDateRange[0].endDate, 'yyyy-MM-dd') : null;
      const searchParams = {
        language: 'en',
        fromType: selectedPickup.type || 'ATLAS',
        fromCode: selectedPickup.code,
        toType: selectedDropoff.type || 'IATA',
        toCode: selectedDropoff.code,
        outbound: `${outboundDate}T10:00:00`,
        adults,
        children,
        infants,
        tripType,
        ...(returnDateStr ? { inbound: `${returnDateStr}T10:00:00` } : {})
      };

      // Store search params for display on results page
      sessionStorage.setItem('transferSearch', JSON.stringify({
        ...searchParams,
        pickupName: selectedPickup.name,
        dropoffName: selectedDropoff.name
      }));
      sessionStorage.removeItem('transferError');

      console.log('Calling searchTransfers API...');
      const results = await searchTransfers(searchParams);
      console.log('API Response:', results);

      if (results.success) {
        sessionStorage.setItem('transferResults', JSON.stringify(results.data));
        const params = new URLSearchParams({
          from: selectedPickup.name,
          to: selectedDropoff.name,
          fromCode: selectedPickup.code,
          toCode: selectedDropoff.code,
          fromType: selectedPickup.type || 'ATLAS',
          toType: selectedDropoff.type || 'IATA',
          date: outboundDate,
          ...(returnDateStr ? { returnDate: returnDateStr } : {}),
          tripType,
          adults: String(adults),
          ...(children > 0 ? { children: String(children) } : {}),
          ...(infants > 0 ? { infants: String(infants) } : {})
        });
        window.location.href = `/transfers?${params.toString()}`;
      } else {
        sessionStorage.setItem('transferError', JSON.stringify({ message: results.message || 'No transfers found for this route.' }));
        window.location.href = '/transfers';
      }
    } catch (err) {
      console.error('Search error:', err);
      const apiResponse = err.response?.data;
      const errorMessage = apiResponse?.message || err.message || 'Transfer search failed. Please try again.';
      sessionStorage.setItem('transferResults', JSON.stringify({ transfers: [] }));
      sessionStorage.setItem('transferError', JSON.stringify({ message: errorMessage, error: apiResponse?.error }));
      window.location.href = '/transfers';
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-400/30 text-red-200 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Trip Type Radio Buttons */}
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer min-h-[36px]">
          <input type="radio" name="tripType" value="one_way" checked={tripType === 'one_way'} onChange={() => setTripType('one_way')} className="w-4 h-4 text-blue-600 cursor-pointer flex-shrink-0" style={{minHeight:'unset'}} />
          <span className={`text-sm font-medium ${lbl}`}>One Way</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer min-h-[36px]">
          <input type="radio" name="tripType" value="round_trip" checked={tripType === 'round_trip'} onChange={() => setTripType('round_trip')} className="w-4 h-4 text-blue-600 cursor-pointer flex-shrink-0" style={{minHeight:'unset'}} />
          <span className={`text-sm font-medium ${lbl}`}>Round Trip</span>
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="relative" ref={pickupRef}>
          <label className={`block text-xs sm:text-sm font-medium ${lbl} mb-1.5 sm:mb-2 px-1`}>
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
              placeholder="Airport, hotel or area, e.g. DXB, Hilton Dubai"
              required
              className="search-form-input w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto" style={{scrollbarWidth:'thin'}}>
              {isLoadingLocations ? (
                <div className="p-3 text-center text-gray-500 text-sm">Searching locations...</div>
              ) : groupedPickup.length > 0 ? (
                groupedPickup.map((group, gi) => (
                  <div key={gi}>
                    <div className="px-3 pt-2.5 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0">
                      {group.city}{group.country ? `, ${group.country}` : ''}
                    </div>
                    {group.airports.map((loc, i) => (
                      <div key={`a-${gi}-${i}`} onClick={() => { setSelectedPickup(loc); setPickupQuery(loc.name); setShowPickupDropdown(false); }} className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2.5">
                        <Plane size={15} className="text-blue-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium text-gray-800 truncate">{loc.name}</div>
                          <div className="text-[11px] text-gray-400">Airport · {loc.code}</div>
                        </div>
                      </div>
                    ))}
                    {group.hotels.map((loc, i) => (
                      <div key={`h-${gi}-${i}`} onClick={() => { setSelectedPickup(loc); setPickupQuery(loc.name); setShowPickupDropdown(false); }} className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2.5">
                        <Building2 size={15} className="text-green-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium text-gray-800 truncate">{loc.name}</div>
                          <div className="text-[11px] text-gray-400">Hotel · {loc.code}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : filteredPickupLocations.length > 0 ? (
                filteredPickupLocations.map((loc, i) => (
                  <div key={i} onClick={() => { setSelectedPickup(loc); setPickupQuery(loc.name); setShowPickupDropdown(false); }} className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2.5">
                    {loc.type === 'IATA' ? <Plane size={15} className="text-blue-600 flex-shrink-0" /> : <Building2 size={15} className="text-green-600 flex-shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium text-gray-800 truncate">{loc.name}</div>
                      <div className="text-[11px] text-gray-400">{loc.type === 'IATA' ? 'Airport' : 'Hotel'} · {loc.city}{loc.country ? `, ${loc.country}` : ''}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500 text-sm">No locations found</div>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={dropoffRef}>
          <label className={`block text-xs sm:text-sm font-medium ${lbl} mb-1.5 sm:mb-2 px-1`}>
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
              placeholder="Airport, hotel or area, e.g. DXB, DAMAC Maison"
              required
              className="search-form-input w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto" style={{scrollbarWidth:'thin'}}>
              {isLoadingLocations ? (
                <div className="p-3 text-center text-gray-500 text-sm">Searching locations...</div>
              ) : groupedDropoff.length > 0 ? (
                groupedDropoff.map((group, gi) => (
                  <div key={gi}>
                    <div className="px-3 pt-2.5 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0">
                      {group.city}{group.country ? `, ${group.country}` : ''}
                    </div>
                    {group.airports.map((loc, i) => (
                      <div key={`a-${gi}-${i}`} onClick={() => { setSelectedDropoff(loc); setDropoffQuery(loc.name); setShowDropoffDropdown(false); }} className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2.5">
                        <Plane size={15} className="text-blue-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium text-gray-800 truncate">{loc.name}</div>
                          <div className="text-[11px] text-gray-400">Airport · {loc.code}</div>
                        </div>
                      </div>
                    ))}
                    {group.hotels.map((loc, i) => (
                      <div key={`h-${gi}-${i}`} onClick={() => { setSelectedDropoff(loc); setDropoffQuery(loc.name); setShowDropoffDropdown(false); }} className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2.5">
                        <Building2 size={15} className="text-green-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium text-gray-800 truncate">{loc.name}</div>
                          <div className="text-[11px] text-gray-400">Hotel · {loc.code}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : filteredDropoffLocations.length > 0 ? (
                filteredDropoffLocations.map((loc, i) => (
                  <div key={i} onClick={() => { setSelectedDropoff(loc); setDropoffQuery(loc.name); setShowDropoffDropdown(false); }} className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2.5">
                    {loc.type === 'IATA' ? <Plane size={15} className="text-blue-600 flex-shrink-0" /> : <Building2 size={15} className="text-green-600 flex-shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium text-gray-800 truncate">{loc.name}</div>
                      <div className="text-[11px] text-gray-400">{loc.type === 'IATA' ? 'Airport' : 'Hotel'} · {loc.city}{loc.country ? `, ${loc.country}` : ''}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500 text-sm">No locations found</div>
              )}
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="relative" ref={calendarRef}>
          <label className={`block text-xs sm:text-sm font-medium ${lbl} mb-1.5 sm:mb-2 px-1`}>
            {tripType === 'round_trip' ? 'Travel Dates' : 'Travel Date'} <span className="text-red-500">*</span>
          </label>
        <div
          onClick={() => setShowCalendar(!showCalendar)}
          className="flex items-center w-full px-3 py-2.5 sm:py-3 border border-gray-300 bg-white rounded-lg cursor-pointer hover:border-blue-500 transition-all"
        >
          <Calendar className="text-gray-400 mr-2 flex-shrink-0" size={18} />
          <span className="text-gray-700 flex-1 text-sm sm:text-base truncate">
            {tripType === 'round_trip'
              ? `${format(transferDateRange[0].startDate, 'MMM dd, yyyy')} – ${format(transferDateRange[0].endDate, 'MMM dd, yyyy')}`
              : format(transferDateRange[0].startDate, 'MMM dd, yyyy')}
          </span>
        </div>
        {showCalendar && (
          <div className="fixed sm:absolute z-50 left-1/2 top-1/2 sm:top-auto transform -translate-x-1/2 -translate-y-1/2 sm:translate-y-0 sm:mt-2 bg-white border border-gray-300 rounded-lg shadow-xl overflow-auto max-w-[95vw]">
            <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading calendar...</div>}>
              <LazyDateRange
                ranges={transferDateRange}
                onChange={(item) => {
                  setTransferDateRange([item.selection]);
                  if (tripType === 'one_way') setShowCalendar(false);
                }}
                minDate={new Date()}
                moveRangeOnFirstSelection={false}
                preventSnapRefocus={true}
                months={tripType === 'round_trip' ? (window.innerWidth < 640 ? 1 : 2) : 1}
                direction="horizontal"
                rangeColors={['#2563eb']}
                showDateDisplay={false}
                selectsRange={tripType === 'round_trip'}
              />
            </Suspense>
            <div className="px-4 pb-3 flex justify-end">
              <button type="button" onClick={() => setShowCalendar(false)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">OK</button>
            </div>
          </div>
        )}
        </div>

        <div className="relative" ref={travellerRef}>
          <label className={`block text-xs sm:text-sm font-medium ${lbl} mb-1.5 sm:mb-2 px-1`}>
            Travellers <span className="text-red-500">*</span>
          </label>
          <div
            onClick={() => setShowTravellerDropdown(!showTravellerDropdown)}
            className="flex items-center w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all bg-white"
          >
            <Users className="text-gray-400 mr-2 flex-shrink-0" size={18} />
            <span className="text-gray-700 flex-1 text-sm sm:text-base truncate">
              {adults} Adult{adults > 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}{infants > 0 ? `, ${infants} Infant${infants > 1 ? 's' : ''}` : ''}
            </span>
            <ChevronDown className="text-gray-400 flex-shrink-0" size={18} />
          </div>
          {showTravellerDropdown && (
            <div className="fixed sm:absolute inset-x-0 sm:inset-x-auto bottom-0 sm:bottom-auto sm:top-full sm:mt-2 z-[200] bg-white border border-gray-300 rounded-t-2xl sm:rounded-xl shadow-2xl p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Adults</span>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"><Minus size={14} /></button>
                  <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{adults}</span>
                  <button type="button" onClick={() => setAdults(Math.min(20, adults + 1))} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"><Plus size={14} /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Children</span>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"><Minus size={14} /></button>
                  <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{children}</span>
                  <button type="button" onClick={() => setChildren(Math.min(10, children + 1))} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"><Plus size={14} /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Infants</span>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button type="button" onClick={() => setInfants(Math.max(0, infants - 1))} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"><Minus size={14} /></button>
                  <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{infants}</span>
                  <button type="button" onClick={() => setInfants(Math.min(5, infants + 1))} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"><Plus size={14} /></button>
                </div>
              </div>
              <button type="button" onClick={() => setShowTravellerDropdown(false)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base">Done</button>
            </div>
          )}
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
const ExperiencesTab = ({ variant = 'dark' }) => {
  const lbl = variant === 'light' ? 'text-gray-700' : 'text-white/80';
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
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showTravellerDropdown, setShowTravellerDropdown] = useState(false);
  const locationRef = useRef(null);
  const calendarRef = useRef(null);
  const travellerRef = useRef(null);

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
      if (calendarRef.current && !calendarRef.current.contains(event.target)) setShowCalendar(false);
      if (locationRef.current && !locationRef.current.contains(event.target)) setShowLocationDropdown(false);
      if (travellerRef.current && !travellerRef.current.contains(event.target)) setShowTravellerDropdown(false);
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

    const url = `/activity-search-results?destination=${encodeURIComponent(selectedLocation.city)}&country=${encodeURIComponent(selectedLocation.country)}&from=${from}&to=${to}&adults=${adults}&children=${children}`;
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
        <label className={`block text-xs sm:text-sm font-medium ${lbl} mb-1.5 sm:mb-2 px-1`}>
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
            className="search-form-input w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
          <label className={`block text-xs sm:text-sm font-medium ${lbl} mb-1.5 sm:mb-2 px-1`}>
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
            <div className="fixed sm:absolute z-50 left-1/2 top-1/2 sm:top-auto transform -translate-x-1/2 -translate-y-1/2 sm:translate-y-0 sm:mt-2 bg-white border border-gray-300 rounded-lg shadow-xl overflow-auto max-w-[95vw]">
                <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading calendar...</div>}>
                  <LazyDateRange
                    ranges={dateRange}
                    onChange={(item) => setDateRange([item.selection])}
                    minDate={new Date()}
                    moveRangeOnFirstSelection={false}
                    preventSnapRefocus={true}
                    months={window.innerWidth < 640 ? 1 : 2}
                    direction="horizontal"
                    rangeColors={['#2563eb']}
                    showDateDisplay={false}
                  />
                </Suspense>
              <div className="px-4 pb-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={travellerRef}>
          <label className={`block text-xs sm:text-sm font-medium ${lbl} mb-1.5 sm:mb-2 px-1`}>
            Travellers <span className="text-red-500">*</span>
          </label>
          <div
            onClick={() => setShowTravellerDropdown(!showTravellerDropdown)}
            className="flex items-center w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all bg-white"
          >
            <Users className="text-gray-400 mr-2 flex-shrink-0" size={18} />
            <span className="text-gray-700 flex-1 text-sm sm:text-base truncate">
              {adults} Adult{adults > 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}{infants > 0 ? `, ${infants} Infant${infants > 1 ? 's' : ''}` : ''}
            </span>
            <ChevronDown className="text-gray-400 flex-shrink-0" size={18} />
          </div>
          {showTravellerDropdown && (
            <div className="fixed sm:absolute inset-x-0 sm:inset-x-auto bottom-0 sm:bottom-auto sm:top-full sm:mt-2 z-[200] bg-white border border-gray-300 rounded-t-2xl sm:rounded-xl shadow-2xl p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Adults</span>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"><Minus size={14} /></button>
                  <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{adults}</span>
                  <button type="button" onClick={() => setAdults(Math.min(20, adults + 1))} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"><Plus size={14} /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Children</span>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"><Minus size={14} /></button>
                  <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{children}</span>
                  <button type="button" onClick={() => setChildren(Math.min(10, children + 1))} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"><Plus size={14} /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Infants</span>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button type="button" onClick={() => setInfants(Math.max(0, infants - 1))} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"><Minus size={14} /></button>
                  <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{infants}</span>
                  <button type="button" onClick={() => setInfants(Math.min(5, infants + 1))} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"><Plus size={14} /></button>
                </div>
              </div>
              <button type="button" onClick={() => setShowTravellerDropdown(false)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base">Done</button>
            </div>
          )}
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

const HotelSearchForm = ({ defaultTab: initialTab = 'stays', variant = 'dark' }) => {
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
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [hotelNameQuery, setHotelNameQuery] = useState('');
  const locationRef = useRef(null);

  // Other states
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Debounced location search via API (cities + countries + hotels)
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setFilteredLocations([]);
      return;
    }
    setIsLoadingLocations(true);
    const timer = setTimeout(async () => {
      try {
        const API_BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${API_BASE}/api/locations/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (!res.ok) throw new Error('API unavailable');
        const data = await res.json();
        if (data.success) {
          setFilteredLocations(data.data || []);
        }
      } catch (err) {
        // Fallback: search CountriesNow directly
        try {
          const res = await fetch('https://countriesnow.space/api/v0.1/countries/');
          const data = await res.json();
          if (!data.error) {
            const query = searchQuery.toLowerCase().trim();
            const results = [];
            data.data.forEach(country => {
              if (country.country.toLowerCase().includes(query)) {
                results.push({ type: 'country', name: country.country, city: '', country: country.country, countryCode: country.iso3, displayName: country.country });
              }
              (country.cities || []).forEach(city => {
                if (city.toLowerCase().includes(query) && results.length < 30) {
                  results.push({ type: 'city', name: city, city, country: country.country, countryCode: country.iso3, displayName: `${city}, ${country.country}` });
                }
              });
            });
            setFilteredLocations(results.slice(0, 30));
          }
        } catch (fallbackErr) {
          console.error('Fallback search failed:', fallbackErr);
        }
      } finally {
        setIsLoadingLocations(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    setSearchQuery(location.displayName || location.name);
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

    const city = selectedLocation.city || selectedLocation.name;
    const country = selectedLocation.country;
    let url = `/hotel-search-results?checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}&adults=${adults}&children=${children}`;
    url += `&country=${encodeURIComponent(country)}`;
    url += `&city=${encodeURIComponent(city)}`;
    if (hotelNameQuery.trim()) {
      url += `&hotelName=${encodeURIComponent(hotelNameQuery.trim())}`;
    }

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
    { id: 'stays', label: 'Stays', Icon: Hotel },
    { id: 'transfers', label: 'Transfers', Icon: Car },
    { id: 'experiences', label: 'Experiences', Icon: Compass }
  ];

  // Label color based on context
  const lbl = variant === 'light' ? 'text-gray-700' : 'text-white/80';

  return (
    <div className="w-full">
      <div className="bg-white/15 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-4 sm:p-5 md:p-6">
        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 mb-4 sm:mb-5 bg-black/20 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'stays' && (
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Location + Hotel Name - Two separate fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Location Search (City/Country) */}
                <div className="relative" ref={locationRef}>
                  <label className={`block text-xs sm:text-sm font-medium ${lbl} mb-1.5 sm:mb-2 px-1`}>
                    Destination <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onFocus={() => setShowLocationDropdown(true)}
                      placeholder="City or country, e.g: London"
                      className="search-form-input w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-sm sm:text-base"
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => { setSearchQuery(''); setSelectedLocation(null); setFilteredLocations([]); }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={18} /></button>
                    )}
                  </div>
                  {showLocationDropdown && searchQuery.trim() !== '' && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 sm:max-h-96 overflow-y-auto" style={{scrollbarWidth:'thin'}}>
                      {isLoadingLocations ? (
                        <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
                      ) : filteredLocations.length > 0 ? (
                        <div>
                          <div className="px-3 pt-2.5 pb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Destinations</div>
                          {filteredLocations.filter(l => l.type !== 'hotel').map((location, index) => (
                            <div key={`loc-${index}`} onClick={() => handleLocationSelect(location)} className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors flex items-center gap-2.5">
                              <MapPin size={15} className="text-blue-600 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="text-[13px] font-medium text-gray-800 truncate">{location.city || location.country || location.name}</div>
                                <div className="text-[11px] text-gray-400 truncate">{location.type === 'country' ? 'Country' : `City in ${location.country}`}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-400 text-sm">No destinations found</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Hotel Name Filter */}
                <div>
                  <label className={`block text-xs sm:text-sm font-medium ${lbl} mb-1.5 sm:mb-2 px-1`}>
                    Hotel Name <span className="text-gray-400 text-xs font-normal">(filter)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={hotelNameQuery}
                      onChange={(e) => setHotelNameQuery(e.target.value)}
                      placeholder="e.g. Hilton, Marriott..."
                      className="search-form-input w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-sm sm:text-base"
                    />
                    {hotelNameQuery && (
                      <button type="button" onClick={() => setHotelNameQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={18} /></button>
                    )}
                  </div>
                  {hotelNameQuery.trim().length > 0 && (
                    <p className="text-[11px] text-gray-400 mt-1 px-1">Results will be filtered by this name</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Date Range Picker */}
                <div className="relative" ref={calendarRef}>
                  <label className={`block text-xs sm:text-sm font-medium ${lbl} mb-1.5 sm:mb-2 px-1`}>
                    Dates <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="flex items-center w-full px-3 py-2.5 sm:py-3 border border-gray-300 bg-white rounded-lg cursor-pointer hover:border-blue-500 transition-all"
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
                    <div className="fixed sm:absolute z-50 left-1/2 top-1/2 sm:top-auto transform -translate-x-1/2 -translate-y-1/2 sm:translate-y-0 sm:mt-2 bg-white border border-gray-300 rounded-lg shadow-xl overflow-auto max-w-[95vw]">
                        <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading calendar...</div>}>
                          <LazyDateRange
                            ranges={dateRange}
                            onChange={(item) => setDateRange([item.selection])}
                            minDate={new Date()}
                            moveRangeOnFirstSelection={false}
                            preventSnapRefocus={true}
                            months={window.innerWidth < 640 ? 1 : 2}
                            direction="horizontal"
                            rangeColors={['#2563eb']}
                            showDateDisplay={false}
                          />
                        </Suspense>
                      <div className="px-4 pb-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowCalendar(false)}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Travellers Dropdown */}
                <div className="relative" ref={travellerRef}>
                  <label className={`block text-xs sm:text-sm font-medium ${lbl} mb-1.5 sm:mb-2 px-1`}>
                    Travellers & Rooms <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => setShowTravellerDropdown(!showTravellerDropdown)}
                    className="flex items-center w-full px-3 py-2.5 sm:py-3 border border-gray-300 bg-white rounded-lg cursor-pointer hover:border-blue-500 transition-all"
                  >
                    <Users className="text-gray-400 mr-2 flex-shrink-0" size={18} />
                    <span className="text-gray-700 flex-1 text-sm sm:text-base truncate">
                      {getTravellerSummary()}
                    </span>
                    <ChevronDown className="text-gray-400 flex-shrink-0" size={18} />
                  </div>

                  {showTravellerDropdown && (
                    <>
                      {/* Mobile backdrop — prevents background scroll */}
                      <div className="fixed inset-0 bg-black/30 z-[199] sm:hidden" onClick={() => setShowTravellerDropdown(false)} />
                      <div className="fixed sm:absolute inset-x-0 sm:inset-x-auto bottom-0 sm:bottom-auto sm:top-full sm:mt-2 z-[200] bg-white border border-gray-300 rounded-t-2xl sm:rounded-xl shadow-2xl p-4 space-y-3 max-h-[70vh] overflow-y-auto">
                      {/* Mobile drag handle */}
                      <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-2 sm:hidden" />
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
                  </>
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

          {activeTab === 'transfers' && <TransfersTab variant={variant} />}
          {activeTab === 'experiences' && <ExperiencesTab variant={variant} />}

          {activeTab !== 'stays' && activeTab !== 'transfers' && activeTab !== 'experiences' && (
            <div className="text-center py-8 text-white/40">
              <p className="text-sm">{tabs.find(t => t.id === activeTab)?.label} feature coming soon!</p>
            </div>
          )}
        </div>
      </div>
  );
};

export default HotelSearchForm;

