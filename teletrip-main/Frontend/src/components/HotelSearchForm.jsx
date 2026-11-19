import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Calendar, Users, Search, ChevronDown, X, Plus, Minus,
  Loader2, Star, Clock, Tag, Plane, Building2, Hotel, Car, Compass,
  Trash2, ShieldCheck, CheckCircle, Crown, ArrowRight
} from 'lucide-react';
import { addDays, format, parseISO, isValid } from 'date-fns';
import AnimatedIcon from './common/AnimatedIcon';
import { getInstantSuggestions, TOP_DESTINATIONS, FEATURED_HOTELS } from '../utils/instantSearchData';
import { searchTransfers } from '../services/transfersApi';
import axios from 'axios';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

// Lazy-load DateRange for React 19 compatibility
const LazyDateRange = lazy(() =>
  import('react-date-range').then(mod => ({ default: mod.DateRange }))
);

const TABS = [
  { id: 'stays', label: 'Stays', icon: Building2 },
  { id: 'transfers', label: 'Transfers', icon: Car },
  { id: 'experiences', label: 'Experiences', icon: Compass },
];

export default function HotelSearchForm({
  defaultTab = 'stays',
  variant = 'light',
  initialValues = null,
  onSearch = null,
  className = '',
}) {
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();

  // Active Category Tab
  const [activeTab, setActiveTab] = useState(defaultTab || 'stays');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. STAYS SEARCH STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [searchQuery, setSearchQuery] = useState('Dubai, United Arab Emirates');
  const [selectedLocation, setSelectedLocation] = useState({
    name: 'Dubai',
    city: 'Dubai',
    country: 'United Arab Emirates',
    destinationCode: 'DXB',
    type: 'destination'
  });
  const [selectedHotelCode, setSelectedHotelCode] = useState(null);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [hotelSuggestions, setHotelSuggestions] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Stays Dates
  const [dateRange, setDateRange] = useState([
    {
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 4),
      key: 'selection'
    }
  ]);
  const [showCalendar, setShowCalendar] = useState(false);

  // Stays Multi-Room & Travellers (Bedsonline standard)
  const [roomConfigs, setRoomConfigs] = useState([
    { adults: 2, children: 0, childAges: [] }
  ]);
  const [showTravellerDropdown, setShowTravellerDropdown] = useState(false);
  const [luxuryOnly, setLuxuryOnly] = useState(false);

  const isSelectingRef = useRef(false);
  const locationRef = useRef(null);
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. TRANSFERS SEARCH STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [tripType, setTripType] = useState('one_way');
  const [pickupQuery, setPickupQuery] = useState('');
  const [dropoffQuery, setDropoffQuery] = useState('');
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedDropoff, setSelectedDropoff] = useState(null);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);
  const [filteredPickupLocations, setFilteredPickupLocations] = useState([]);
  const [filteredDropoffLocations, setFilteredDropoffLocations] = useState([]);
  const [groupedPickup, setGroupedPickup] = useState([]);
  const [groupedDropoff, setGroupedDropoff] = useState([]);
  const [isLoadingPickup, setIsLoadingPickup] = useState(false);
  const [isLoadingDropoff, setIsLoadingDropoff] = useState(false);
  const [transferDateRange, setTransferDateRange] = useState([
    {
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 1),
      key: 'selection'
    }
  ]);
  const [showTransferCalendar, setShowTransferCalendar] = useState(false);
  const [transferTime, setTransferTime] = useState('10:00');
  const [returnTime, setReturnTime] = useState('14:00');
  const [transferAdults, setTransferAdults] = useState(2);
  const [transferChildren, setTransferChildren] = useState(0);
  const [transferInfants, setTransferInfants] = useState(0);
  const [showTransferTravellers, setShowTransferTravellers] = useState(false);
  const [transferError, setTransferError] = useState(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. EXPERIENCES SEARCH STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [experienceQuery, setExperienceQuery] = useState('Dubai, United Arab Emirates');
  const [selectedExperienceLocation, setSelectedExperienceLocation] = useState({
    city: 'Dubai',
    country: 'United Arab Emirates',
    displayName: 'Dubai, United Arab Emirates'
  });
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);
  const [experienceDateRange, setExperienceDateRange] = useState([
    {
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 4),
      key: 'selection'
    }
  ]);
  const [showExperienceCalendar, setShowExperienceCalendar] = useState(false);
  const [experienceAdults, setExperienceAdults] = useState(2);
  const [experienceChildren, setExperienceChildren] = useState(0);
  const [showExperienceTravellers, setShowExperienceTravellers] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZE FROM URL SEARCH PARAMS & PROPS
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (defaultTab && ['stays', 'transfers', 'experiences'].includes(defaultTab)) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  useEffect(() => {
    // 1. Stays URL params
    const city = initialValues?.city || urlSearchParams.get('city');
    const country = initialValues?.country || urlSearchParams.get('country');
    const hotelName = initialValues?.hotelName || urlSearchParams.get('hotelName');
    const hotelCode = initialValues?.hotelCode || urlSearchParams.get('hotelCode');
    const destCode = initialValues?.destinationCode || urlSearchParams.get('destinationCode');

    if (hotelName) {
      setSearchQuery(hotelName);
      setSelectedHotelCode(hotelCode || null);
      setSelectedLocation({
        name: hotelName,
        city: city || '',
        country: country || '',
        destinationCode: destCode || '',
        type: 'hotel'
      });
    } else if (city) {
      setSearchQuery(country ? `${city}, ${country}` : city);
      setSelectedHotelCode(null);
      setSelectedLocation({
        name: city,
        city: city,
        country: country || '',
        destinationCode: destCode || '',
        type: 'destination'
      });
    }

    const checkInStr = initialValues?.checkIn || urlSearchParams.get('checkIn');
    const checkOutStr = initialValues?.checkOut || urlSearchParams.get('checkOut');
    if (checkInStr && checkOutStr) {
      try {
        const start = parseISO(checkInStr);
        const end = parseISO(checkOutStr);
        if (isValid(start) && isValid(end)) {
          setDateRange([{ startDate: start, endDate: end, key: 'selection' }]);
        }
      } catch (err) {
        console.error('Failed to parse search dates:', err);
      }
    }

    const roomConfigsStr = initialValues?.roomConfigs || urlSearchParams.get('roomConfigs');
    if (roomConfigsStr) {
      try {
        const parsed = JSON.parse(decodeURIComponent(roomConfigsStr));
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRoomConfigs(parsed);
        }
      } catch (err) {
        console.error('Failed to parse roomConfigs:', err);
      }
    } else {
      const adultsParam = parseInt(urlSearchParams.get('adults'), 10);
      const childrenParam = parseInt(urlSearchParams.get('children'), 10);
      if (adultsParam) {
        const childAgesStr = urlSearchParams.get('childAges');
        const childAges = childAgesStr ? childAgesStr.split(',').map(a => parseInt(a, 10)) : [];
        setRoomConfigs([{ adults: adultsParam, children: childrenParam || 0, childAges }]);
      }
    }

    // 2. Transfers URL params
    const fromParam = initialValues?.from || urlSearchParams.get('from');
    const toParam = initialValues?.to || urlSearchParams.get('to');
    if (fromParam) {
      setPickupQuery(fromParam);
      setSelectedPickup({ name: fromParam, code: urlSearchParams.get('fromCode'), type: urlSearchParams.get('fromType') || 'ATLAS' });
    }
    if (toParam) {
      setDropoffQuery(toParam);
      setSelectedDropoff({ name: toParam, code: urlSearchParams.get('toCode'), type: urlSearchParams.get('toType') || 'IATA' });
    }
    const transferTripType = initialValues?.tripType || urlSearchParams.get('tripType');
    if (transferTripType) {
      setTripType(transferTripType);
    }
    const transferDateStr = initialValues?.date || urlSearchParams.get('date');
    if (transferDateStr) {
      try {
        const d = parseISO(transferDateStr);
        if (isValid(d)) {
          setTransferDateRange([{ startDate: d, endDate: d, key: 'selection' }]);
        }
      } catch (err) {}
    }

    // 3. Experiences URL params
    const expDest = initialValues?.destination || urlSearchParams.get('destination');
    if (expDest) {
      setExperienceQuery(expDest);
      setSelectedExperienceLocation({ city: expDest, country: '', displayName: expDest });
    }
  }, [urlSearchParams, initialValues]);

  // Outside click listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowLocationDropdown(false);
      }
      if (pickupRef.current && !pickupRef.current.contains(e.target)) {
        setShowPickupDropdown(false);
      }
      if (dropoffRef.current && !dropoffRef.current.contains(e.target)) {
        setShowDropoffDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Multi-room Helpers
  const addRoom = () => {
    if (roomConfigs.length < 6) {
      setRoomConfigs([...roomConfigs, { adults: 2, children: 0, childAges: [] }]);
    }
  };

  const removeRoom = (index) => {
    if (roomConfigs.length > 1) {
      setRoomConfigs(roomConfigs.filter((_, i) => i !== index));
    }
  };

  const updateRoom = (index, field, value) => {
    setRoomConfigs(
      roomConfigs.map((room, i) => {
        if (i !== index) return room;
        const updated = { ...room, [field]: value };
        if (field === 'children') {
          const count = Math.max(0, Math.min(4, value));
          updated.children = count;
          if (count > room.childAges.length) {
            updated.childAges = [
              ...room.childAges,
              ...Array(count - room.childAges.length).fill(5)
            ];
          } else {
            updated.childAges = room.childAges.slice(0, count);
          }
        }
        return updated;
      })
    );
  };

  const updateChildAge = (roomIndex, childIndex, age) => {
    setRoomConfigs(
      roomConfigs.map((room, i) => {
        if (i !== roomIndex) return room;
        const newAges = [...room.childAges];
        newAges[childIndex] = parseInt(age, 10);
        return { ...room, childAges: newAges };
      })
    );
  };

  const getTotalAdults = () => roomConfigs.reduce((sum, r) => sum + r.adults, 0);
  const getTotalChildren = () => roomConfigs.reduce((sum, r) => sum + r.children, 0);
  const getAllChildAges = () => roomConfigs.flatMap(r => r.childAges);

  const calculateNights = () => {
    const start = dateRange[0].startDate;
    const end = dateRange[0].endDate;
    return Math.max(1, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)));
  };

  const getTravellerSummary = () => {
    const totalAdults = getTotalAdults();
    const totalChildren = getTotalChildren();
    const rooms = roomConfigs.length;
    let parts = [`${totalAdults} Adult${totalAdults > 1 ? 's' : ''}`];
    if (totalChildren > 0) {
      parts.push(`${totalChildren} Child${totalChildren > 1 ? 'ren' : ''}`);
    }
    return `${parts.join(', ')} · ${rooms} Room${rooms > 1 ? 's' : ''}`;
  };

  // Autocomplete: Stays instant & API search
  useEffect(() => {
    if (isSelectingRef.current) return;
    if (!searchQuery || !searchQuery.trim()) {
      setFilteredLocations([]);
      setHotelSuggestions([]);
      return;
    }

    const instant = getInstantSuggestions(searchQuery);
    setFilteredLocations(instant.locations);
    setHotelSuggestions(instant.hotels);

    if (searchQuery.trim().length >= 2) {
      setIsLoadingLocations(true);
      const timer = setTimeout(async () => {
        try {
          const resp = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/locations?search=${encodeURIComponent(searchQuery.trim())}`
          );
          if (resp.data && resp.data.success) {
            const apiDests = resp.data.data.filter(l => l.type !== 'hotel');
            const apiHotels = resp.data.data.filter(l => l.type === 'hotel');
            setFilteredLocations(prev => {
              const combined = [...apiDests, ...prev];
              return combined.filter((v, i, a) => a.findIndex(t => (t.city || t.name) === (v.city || v.name)) === i);
            });
            if (apiHotels.length > 0) {
              setHotelSuggestions(prev => {
                const combined = [...apiHotels, ...prev];
                return combined.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
              });
            }
          }
        } catch (err) {
          console.error('Autocomplete API error:', err);
        } finally {
          setIsLoadingLocations(false);
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Autocomplete: Transfers pickup
  useEffect(() => {
    if (!pickupQuery || pickupQuery.trim().length < 2) {
      setFilteredPickupLocations([]);
      return;
    }
    setIsLoadingPickup(true);
    const timer = setTimeout(async () => {
      try {
        const resp = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/locations/transfers?search=${encodeURIComponent(pickupQuery.trim())}`
        );
        if (resp.data && resp.data.success) {
          setFilteredPickupLocations(resp.data.data || []);
          setGroupedPickup(resp.data.grouped || []);
        }
      } catch (err) {
        console.error('Transfers pickup search error:', err);
      } finally {
        setIsLoadingPickup(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [pickupQuery]);

  // Autocomplete: Transfers dropoff
  useEffect(() => {
    if (!dropoffQuery || dropoffQuery.trim().length < 2) {
      setFilteredDropoffLocations([]);
      return;
    }
    setIsLoadingDropoff(true);
    const timer = setTimeout(async () => {
      try {
        const resp = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/locations/transfers?search=${encodeURIComponent(dropoffQuery.trim())}`
        );
        if (resp.data && resp.data.success) {
          setFilteredDropoffLocations(resp.data.data || []);
          setGroupedDropoff(resp.data.grouped || []);
        }
      } catch (err) {
        console.error('Transfers dropoff search error:', err);
      } finally {
        setIsLoadingDropoff(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [dropoffQuery]);

  // Autocomplete: Experiences
  useEffect(() => {
    if (!experienceQuery.trim()) {
      setFilteredExperiences(TOP_DESTINATIONS.slice(0, 6));
      return;
    }
    const instant = getInstantSuggestions(experienceQuery);
    setFilteredExperiences(instant.locations.slice(0, 8));
  }, [experienceQuery]);

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPREHENSIVE SEARCH SUBMISSION
  // ═══════════════════════════════════════════════════════════════════════════
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === 'stays') {
        const trimmedQuery = searchQuery.trim();
        const checkIn = format(dateRange[0].startDate, 'yyyy-MM-dd');
        const checkOut = format(dateRange[0].endDate, 'yyyy-MM-dd');

        let loc = selectedLocation;
        let hCode = selectedHotelCode;
        let hName = '';

        if (loc?.type === 'hotel') {
          hCode = loc.code || hCode;
          hName = loc.name;
        } else if (hCode) {
          hName = loc?.name || trimmedQuery;
        } else if (!loc && trimmedQuery) {
          const instant = getInstantSuggestions(trimmedQuery);
          const exactHotel = instant.hotels?.find(
            h => h.name.toLowerCase() === trimmedQuery.toLowerCase()
          );
          if (exactHotel) {
            hCode = exactHotel.code;
            hName = exactHotel.name;
            loc = {
              type: 'hotel',
              code: exactHotel.code,
              name: exactHotel.name,
              city: exactHotel.destinationName || exactHotel.zoneName || '',
              destinationCode: exactHotel.destinationCode || '',
              country: exactHotel.countryCode || ''
            };
          } else {
            const exactLoc =
              instant.locations?.find(
                l =>
                  (l.city || l.name).toLowerCase() === trimmedQuery.toLowerCase() ||
                  l.displayName?.toLowerCase() === trimmedQuery.toLowerCase()
              ) || (instant.locations && instant.locations.length > 0 ? instant.locations[0] : null);
            if (exactLoc) {
              loc = exactLoc;
            } else {
              loc = {
                city: trimmedQuery,
                name: trimmedQuery,
                destinationCode: '',
                country: '',
                type: 'destination'
              };
            }
          }
        }

        const city = loc?.city || loc?.name || trimmedQuery || 'Dubai';
        const country = loc?.country || '';
        const destinationCode = loc?.destinationCode || '';

        const params = new URLSearchParams();
        params.set('city', city);
        if (country) params.set('country', country);
        if (destinationCode) params.set('destinationCode', destinationCode);
        params.set('checkIn', checkIn);
        params.set('checkOut', checkOut);
        params.set('adults', String(getTotalAdults()));
        params.set('children', String(getTotalChildren()));
        params.set('rooms', String(roomConfigs.length));
        params.set('roomConfigs', JSON.stringify(roomConfigs));

        const allChildAges = getAllChildAges();
        if (allChildAges.length > 0) {
          params.set('childAges', allChildAges.join(','));
        }
        if (hCode) {
          params.set('hotelCode', String(hCode));
          params.set('hotelName', hName || trimmedQuery);
        } else if (trimmedQuery && !loc) {
          params.set('hotelName', trimmedQuery);
        }
        if (luxuryOnly) {
          params.set('luxury', 'true');
        }

        if (onSearch) onSearch();
        navigate(`/hotels?${params.toString()}`);
      } else if (activeTab === 'transfers') {
        const fromLoc = selectedPickup;
        const toLoc = selectedDropoff;

        if (!fromLoc || !toLoc) {
          setTransferError('Please select both pickup and drop-off locations.');
          return;
        }

        const searchParams = {
          fromType: fromLoc.type || 'ATLAS',
          fromCode: fromLoc.code || fromLoc.id,
          toType: toLoc.type || 'IATA',
          toCode: toLoc.code || toLoc.id,
          outbound: `${format(transferDateRange[0].startDate, 'yyyy-MM-dd')}T${transferTime}:00`,
          inbound: tripType === 'round_trip' ? `${format(transferDateRange[0].endDate, 'yyyy-MM-dd')}T${returnTime}:00` : null,
          adults: transferAdults,
          children: transferChildren,
          infants: transferInfants,
        };

        const results = await searchTransfers(searchParams);
        const params = new URLSearchParams({
          from: fromLoc.name,
          to: toLoc.name,
          fromCode: fromLoc.code || fromLoc.id,
          toCode: toLoc.code || toLoc.id,
          fromType: fromLoc.type || 'ATLAS',
          toType: toLoc.type || 'IATA',
          date: format(transferDateRange[0].startDate, 'yyyy-MM-dd'),
          returnDate: tripType === 'round_trip' ? format(transferDateRange[0].endDate, 'yyyy-MM-dd') : '',
          tripType,
          adults: String(transferAdults),
          children: String(transferChildren),
          infants: String(transferInfants),
        });

        if (onSearch) onSearch();
        navigate(`/transfers?${params.toString()}`, { state: { transfers: results, searchParams } });
      } else if (activeTab === 'experiences') {
        const dest = selectedExperienceLocation?.city || experienceQuery.trim() || 'Dubai';
        const params = new URLSearchParams({
          destination: dest,
          from: format(experienceDateRange[0].startDate, 'yyyy-MM-dd'),
          to: format(experienceDateRange[0].endDate, 'yyyy-MM-dd'),
          adults: String(experienceAdults),
          children: String(experienceChildren),
        });

        if (onSearch) onSearch();
        navigate(`/activities?${params.toString()}`);
      }
    } catch (err) {
      console.error('Search submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`w-full text-left ${className}`}>
      {/* ── Top Tabs Row: Stays, Transfers, Experiences + Transfers Toggle ── */}
      <div className="flex items-center justify-between gap-4 mb-3 sm:mb-4 flex-wrap">
        <div className="flex items-center gap-1 sm:gap-2">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 ${
                  isActive
                    ? 'text-blue-600 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeSearchFormTabUnderline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* If Transfers active: One Way / Round Trip pill toggle */}
        {activeTab === 'transfers' && (
          <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setTripType('one_way')}
              className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                tripType === 'one_way'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              One Way
            </button>
            <button
              type="button"
              onClick={() => setTripType('round_trip')}
              className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                tripType === 'round_trip'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Round Trip
            </button>
          </div>
        )}
      </div>

      {/* Transfer Error Alert */}
      {activeTab === 'transfers' && transferError && (
        <div className="mb-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
          <span>{transferError}</span>
          <button
            type="button"
            onClick={() => setTransferError(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Floating Capsule Search Bar (Latest Modern Design) ── */}
      <div className="rounded-3xl sm:rounded-full p-1.5 sm:p-2 transition-all relative z-40 bg-white border border-slate-200/90 shadow-sm hover:shadow-md">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row sm:items-center w-full gap-2 sm:gap-0 justify-between"
        >
          <div className="flex flex-col sm:flex-row sm:items-center flex-1">
            {/* ═══════════════════════════════════════════════════════════════
                TAB 1: STAYS INPUT VIEW
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'stays' && (
              <>
                {/* Segment 1: Location & Hotel */}
                <div
                  ref={locationRef}
                  className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 cursor-pointer group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                    {selectedHotelCode ? (
                      <AnimatedIcon name="hotel" animation="pulse" size={16} className="text-emerald-600" />
                    ) : (
                      <AnimatedIcon name="location" animation="bounce" size={16} />
                    )}
                  </div>
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => setShowLocationDropdown(true)}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                        Location
                      </span>
                      {selectedHotelCode && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                          Hotel
                        </span>
                      )}
                      {!selectedHotelCode && selectedLocation && (
                        <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-full">
                          City
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        isSelectingRef.current = false;
                        setSearchQuery(e.target.value);
                        setSelectedLocation(null);
                        setSelectedHotelCode(null);
                        setShowLocationDropdown(true);
                      }}
                      onFocus={() => setShowLocationDropdown(true)}
                      placeholder="Where are you going? e.g. Dubai, Atlantis..."
                      className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate border-none p-0 m-0"
                    />
                  </div>

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        isSelectingRef.current = false;
                        setSearchQuery('');
                        setSelectedLocation(null);
                        setSelectedHotelCode(null);
                        setFilteredLocations([]);
                        setHotelSuggestions([]);
                        setShowLocationDropdown(false);
                      }}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}

                  {/* Dropdown with Grouped Autocomplete Results */}
                  {showLocationDropdown && (
                    <div
                      className="absolute top-full left-0 mt-2 sm:mt-3 w-full sm:w-96 max-w-[calc(100vw-3rem)] sm:max-w-none bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.22)] border border-slate-200 z-[200] overflow-hidden divide-y divide-slate-100"
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      <div className="p-2.5 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <span>Top Destinations & Hotels</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowLocationDropdown(false);
                          }}
                          className="hover:text-slate-700 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {isLoadingLocations && filteredLocations.length === 0 && hotelSuggestions.length === 0 ? (
                          <div className="p-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span>Searching destinations and hotels...</span>
                          </div>
                        ) : (
                          <>
                            {/* Destinations */}
                            {(() => {
                              const dests = filteredLocations.filter(l => l.type !== 'hotel');
                              const list = dests.length > 0 ? dests : TOP_DESTINATIONS.slice(0, 6);
                              const isDefault = dests.length === 0;
                              return (
                                <div>
                                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <MapPin size={12} className="text-blue-600" />
                                      <span>{isDefault ? 'Top Destinations' : 'Destinations & Cities'}</span>
                                    </div>
                                    {isDefault && (
                                      <span className="text-[9px] text-slate-400 font-medium">Popular</span>
                                    )}
                                  </div>
                                  {list.map((loc, i) => (
                                    <div
                                      key={`dest-${i}`}
                                      onClick={() => {
                                        isSelectingRef.current = true;
                                        setSelectedLocation(loc);
                                        setSelectedHotelCode(null);
                                        setSearchQuery(loc.displayName || `${loc.city || loc.name}, ${loc.country}`);
                                        setShowLocationDropdown(false);
                                      }}
                                      className="px-3 py-2 hover:bg-blue-50/70 cursor-pointer flex items-center justify-between gap-2 transition-colors border-b border-slate-50 last:border-0"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                        <div className="truncate">
                                          <div className="font-extrabold text-xs text-slate-900 truncate">
                                            {loc.city || loc.name}
                                          </div>
                                          <div className="text-[10px] text-slate-400 truncate">
                                            {loc.country}{loc.destinationCode ? ` · ${loc.destinationCode}` : ''}
                                          </div>
                                        </div>
                                      </div>
                                      <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                                        City
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}

                            {/* Hotels */}
                            {(() => {
                              const hotels = hotelSuggestions;
                              const hList = hotels.length > 0 ? hotels : FEATURED_HOTELS.slice(0, 5);
                              const isDefault = hotels.length === 0;
                              return (
                                <div>
                                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <Building2 size={12} className="text-emerald-600" />
                                      <span>{isDefault ? 'Featured Hotels' : 'Hotels & Properties'}</span>
                                    </div>
                                    {isDefault && (
                                      <span className="text-[9px] text-slate-400 font-medium">Iconic</span>
                                    )}
                                  </div>
                                  {hList.map((hotel, idx) => (
                                    <div
                                      key={`h-${idx}`}
                                      onClick={() => {
                                        isSelectingRef.current = true;
                                        setSelectedHotelCode(hotel.code || hotel.id);
                                        setSelectedLocation({
                                          type: 'hotel',
                                          code: hotel.code || hotel.id,
                                          name: hotel.name,
                                          city: hotel.zoneName || hotel.destinationName || hotel.city || '',
                                          destinationCode: hotel.destinationCode || '',
                                          country: hotel.countryCode || ''
                                        });
                                        setSearchQuery(hotel.name);
                                        setShowLocationDropdown(false);
                                      }}
                                      className="px-3 py-2 hover:bg-emerald-50/70 cursor-pointer flex items-center justify-between gap-2 transition-colors border-b border-slate-50 last:border-0"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                        <div className="truncate">
                                          <div className="font-extrabold text-xs text-slate-900 truncate">
                                            {hotel.name}
                                          </div>
                                          <div className="text-[10px] text-slate-400 truncate">
                                            {hotel.zoneName || hotel.destinationName || hotel.city || ''}
                                          </div>
                                        </div>
                                      </div>
                                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                                        Hotel
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Vertical Divider */}
                <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />

                {/* Segment 2: Dates */}
                <div
                  onClick={() => setShowCalendar(true)}
                  className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 cursor-pointer group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                    <AnimatedIcon name="time" animation="pulse" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                        Dates
                      </span>
                      <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full">
                        {calculateNights()}n
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight truncate">
                      {format(dateRange[0].startDate, 'MMM d')} - {format(dateRange[0].endDate, 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />
                <div className="sm:hidden h-px w-full bg-slate-100/90 my-0.5" />

                {/* Segment 3: Guests & Multi-Rooms */}
                <div
                  onClick={() => setShowTravellerDropdown(true)}
                  className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 cursor-pointer group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                    <AnimatedIcon name="users" animation="pulse" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                      Guests & Rooms
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight truncate">
                      {getTravellerSummary()}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 2: TRANSFERS INPUT VIEW
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'transfers' && (
              <>
                {/* Pickup */}
                <div
                  ref={pickupRef}
                  className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                    <AnimatedIcon name="car" animation="glide" size={16} />
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => setShowPickupDropdown(true)}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                      Pickup Location
                    </span>
                    <input
                      type="text"
                      value={pickupQuery}
                      onChange={(e) => {
                        setPickupQuery(e.target.value);
                        setSelectedPickup(null);
                        setShowPickupDropdown(true);
                      }}
                      onFocus={() => setShowPickupDropdown(true)}
                      placeholder="Airport, station or hotel..."
                      className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate border-none p-0 m-0"
                    />
                  </div>

                  {showPickupDropdown && (filteredPickupLocations.length > 0 || groupedPickup.length > 0 || isLoadingPickup) && (
                    <div
                      className="absolute top-full left-0 mt-2 sm:mt-3 w-full sm:w-96 max-w-[calc(100vw-3rem)] sm:max-w-none bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.22)] border border-slate-200 z-[200] overflow-hidden divide-y divide-slate-100"
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      <div className="p-2.5 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <span>Pickup Points</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPickupDropdown(false);
                          }}
                          className="hover:text-slate-700 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="max-h-60 overflow-y-auto">
                        {isLoadingPickup ? (
                          <div className="p-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span>Finding pickup locations...</span>
                          </div>
                        ) : (
                          filteredPickupLocations.map((loc, i) => (
                            <div
                              key={`pick-${i}`}
                              onClick={() => {
                                setSelectedPickup(loc);
                                setPickupQuery(loc.name);
                                setShowPickupDropdown(false);
                              }}
                              className="px-3 py-2 hover:bg-blue-50/70 cursor-pointer flex items-center justify-between gap-2 border-b border-slate-50 last:border-0"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Plane className="w-4 h-4 text-blue-600 shrink-0" />
                                <div className="truncate">
                                  <div className="font-extrabold text-xs text-slate-900 truncate">{loc.name}</div>
                                  <div className="text-[10px] text-slate-400 truncate">{loc.type || 'Airport'}</div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />

                {/* Dropoff */}
                <div
                  ref={dropoffRef}
                  className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => setShowDropoffDropdown(true)}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                      Drop-off Location
                    </span>
                    <input
                      type="text"
                      value={dropoffQuery}
                      onChange={(e) => {
                        setDropoffQuery(e.target.value);
                        setSelectedDropoff(null);
                        setShowDropoffDropdown(true);
                      }}
                      onFocus={() => setShowDropoffDropdown(true)}
                      placeholder="Hotel, resort or destination..."
                      className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate border-none p-0 m-0"
                    />
                  </div>

                  {showDropoffDropdown && (filteredDropoffLocations.length > 0 || groupedDropoff.length > 0 || isLoadingDropoff) && (
                    <div
                      className="absolute top-full left-0 mt-2 sm:mt-3 w-full sm:w-96 max-w-[calc(100vw-3rem)] sm:max-w-none bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.22)] border border-slate-200 z-[200] overflow-hidden divide-y divide-slate-100"
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      <div className="p-2.5 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <span>Drop-off Points</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDropoffDropdown(false);
                          }}
                          className="hover:text-slate-700 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="max-h-60 overflow-y-auto">
                        {isLoadingDropoff ? (
                          <div className="p-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span>Finding drop-off locations...</span>
                          </div>
                        ) : (
                          filteredDropoffLocations.map((loc, i) => (
                            <div
                              key={`drop-${i}`}
                              onClick={() => {
                                setSelectedDropoff(loc);
                                setDropoffQuery(loc.name);
                                setShowDropoffDropdown(false);
                              }}
                              className="px-3 py-2 hover:bg-blue-50/70 cursor-pointer flex items-center justify-between gap-2 border-b border-slate-50 last:border-0"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div className="truncate">
                                  <div className="font-extrabold text-xs text-slate-900 truncate">{loc.name}</div>
                                  <div className="text-[10px] text-slate-400 truncate">{loc.type || 'Hotel'}</div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />

                {/* Transfer Date */}
                <div
                  onClick={() => setShowTransferCalendar(true)}
                  className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 cursor-pointer group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                      Date & Time
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight truncate">
                      {format(transferDateRange[0].startDate, 'MMM d')} at {transferTime}
                    </span>
                  </div>
                </div>

                <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />

                {/* Passengers */}
                <div
                  onClick={() => setShowTransferTravellers(true)}
                  className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 cursor-pointer group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                      Passengers
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight truncate">
                      {transferAdults + transferChildren + transferInfants} Pax
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 3: EXPERIENCES INPUT VIEW
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'experiences' && (
              <>
                {/* Destination */}
                <div className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-purple-50 text-slate-400 group-hover:text-purple-600 flex items-center justify-center shrink-0">
                    <AnimatedIcon name="experiences" animation="bounce" size={16} />
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => setShowExperienceDropdown(true)}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                      Destination or Activity
                    </span>
                    <input
                      type="text"
                      value={experienceQuery}
                      onChange={(e) => {
                        setExperienceQuery(e.target.value);
                        setSelectedExperienceLocation(null);
                        setShowExperienceDropdown(true);
                      }}
                      onFocus={() => setShowExperienceDropdown(true)}
                      placeholder="Where are you going? e.g. Dubai, Paris..."
                      className="w-full text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 truncate border-none p-0 m-0"
                    />
                  </div>

                  {showExperienceDropdown && (
                    <div
                      className="absolute top-full left-0 mt-2 sm:mt-3 w-full sm:w-96 max-w-[calc(100vw-3rem)] sm:max-w-none bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.22)] border border-slate-200 z-[200] overflow-hidden divide-y divide-slate-100"
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      <div className="p-2.5 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <span>Popular Destinations</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowExperienceDropdown(false);
                          }}
                          className="hover:text-slate-700 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredExperiences.map((dest, i) => (
                          <div
                            key={`exp-${i}`}
                            onClick={() => {
                              setSelectedExperienceLocation(dest);
                              setExperienceQuery(dest.displayName || `${dest.name}, ${dest.country}`);
                              setShowExperienceDropdown(false);
                            }}
                            className="px-3 py-2 hover:bg-purple-50/70 cursor-pointer flex items-center justify-between gap-2 border-b border-slate-50 last:border-0"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Compass className="w-4 h-4 text-purple-600 shrink-0" />
                              <div className="truncate">
                                <div className="font-extrabold text-xs text-slate-900 truncate">{dest.name}</div>
                                <div className="text-[10px] text-slate-400 truncate">{dest.country}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />
                <div className="sm:hidden h-px w-full bg-slate-100/90 my-0.5" />

                {/* Date */}
                <div
                  onClick={() => setShowExperienceCalendar(true)}
                  className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 cursor-pointer group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                      Dates
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight truncate">
                      {format(experienceDateRange[0].startDate, 'MMM d')} - {format(experienceDateRange[0].endDate, 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                <div className="hidden sm:block h-7 w-px bg-slate-200/80 shrink-0" />
                <div className="sm:hidden h-px w-full bg-slate-100/90 my-0.5" />

                {/* Travelers */}
                <div
                  onClick={() => setShowExperienceTravellers(true)}
                  className="relative flex-1 px-4 py-1.5 sm:py-1 flex items-center gap-3 cursor-pointer group rounded-2xl sm:rounded-none hover:bg-slate-50/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                      Travelers
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight truncate">
                      {experienceAdults} Adults{experienceChildren > 0 ? `, ${experienceChildren} Children` : ''}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Search Action Button: Full-width tap target on mobile, circular on desktop ── */}
          <div className="p-1 sm:p-0 sm:pr-1 flex w-full sm:w-auto justify-end shrink-0 mt-1 sm:mt-0">
            <button
              type="submit"
              disabled={isSubmitting}
              aria-label="Search"
              className="w-full sm:w-12 h-11 sm:h-12 rounded-xl sm:rounded-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  <span className="sm:hidden text-xs font-black uppercase tracking-wider">
                    {activeTab === 'stays' ? 'Search Stays' : activeTab === 'transfers' ? 'Search Transfers' : 'Search Experiences'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL PORTALS FOR CALENDARS & TRAVELLERS
      ═══════════════════════════════════════════════════════════════════════ */}

      {/* 1. Stays Calendar Modal Portal */}
      {showCalendar &&
        createPortal(
          <div
            data-calendar-portal
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(2px)'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCalendar(false);
            }}
          >
            <div
              className="bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-auto max-h-[85vh] p-4 sm:p-6"
              style={{ maxWidth: '95vw', margin: 16 }}
            >
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">Select Dates</h3>
                  <p className="text-xs text-gray-400">
                    {calculateNights()} night stay ({format(dateRange[0].startDate, 'MMM d')} - {format(dateRange[0].endDate, 'MMM d, yyyy')})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <Suspense fallback={<div className="p-12 text-center text-gray-400">Loading calendar...</div>}>
                <LazyDateRange
                  ranges={dateRange}
                  onChange={(item) => {
                    const sel = item.selection;
                    let end = sel.endDate;
                    if (sel.startDate && sel.endDate && sel.startDate.getTime() === sel.endDate.getTime()) {
                      end = addDays(sel.startDate, 1);
                    }
                    setDateRange([{ ...sel, endDate: end }]);
                  }}
                  minDate={addDays(new Date(), 1)}
                  maxDate={addDays(new Date(), 365)}
                  months={window.innerWidth < 640 ? 1 : 2}
                  direction="horizontal"
                  rangeColors={['#2563eb']}
                  showDateDisplay={false}
                />
              </Suspense>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-semibold">
                  {calculateNights()} {calculateNights() === 1 ? 'Night' : 'Nights'} Selected
                </span>
                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold cursor-pointer"
                >
                  Apply Dates
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 2. Stays Guests & Multi-Room Modal Portal */}
      {showTravellerDropdown &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(2px)'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowTravellerDropdown(false);
            }}
          >
            <div
              className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-4 sm:p-6 w-[420px] max-w-[95vw] max-h-[85vh] overflow-y-auto"
              style={{ margin: 16 }}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">Rooms & Guests</h3>
                  <p className="text-xs text-gray-400">{getTravellerSummary()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTravellerDropdown(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {roomConfigs.map((room, roomIdx) => (
                  <div key={roomIdx} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                        Room {roomIdx + 1}
                      </span>
                      {roomConfigs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoom(roomIdx)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Adults</span>
                        <span className="text-[10px] text-slate-400">Age 18+</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateRoom(roomIdx, 'adults', Math.max(1, room.adults - 1))}
                          disabled={room.adults <= 1}
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-white cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-slate-900">{room.adults}</span>
                        <button
                          type="button"
                          onClick={() => updateRoom(roomIdx, 'adults', Math.min(6, room.adults + 1))}
                          disabled={room.adults >= 6}
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-white cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Children</span>
                        <span className="text-[10px] text-slate-400">Age 0-17</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateRoom(roomIdx, 'children', Math.max(0, room.children - 1))}
                          disabled={room.children <= 0}
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-white cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-slate-900">{room.children}</span>
                        <button
                          type="button"
                          onClick={() => updateRoom(roomIdx, 'children', Math.min(4, room.children + 1))}
                          disabled={room.children >= 4}
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-white cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Child Ages */}
                    {room.children > 0 && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
                          Child Ages (Required for exact rates)
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          {room.childAges.map((age, childIdx) => (
                            <div key={childIdx}>
                              <label className="text-[9px] text-slate-400 block mb-0.5">Child {childIdx + 1}</label>
                              <select
                                value={age}
                                onChange={(e) => updateChildAge(roomIdx, childIdx, e.target.value)}
                                className="w-full text-xs font-bold p-1 bg-white border border-slate-300 rounded-lg"
                              >
                                {[...Array(18)].map((_, a) => (
                                  <option key={a} value={a}>
                                    {a} {a === 1 ? 'yr' : 'yrs'}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {roomConfigs.length < 6 && (
                  <button
                    type="button"
                    onClick={addRoom}
                    className="w-full py-2.5 rounded-xl border border-dashed border-blue-400 text-blue-600 hover:bg-blue-50/60 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Another Room</span>
                  </button>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setLuxuryOnly(!luxuryOnly)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer ${
                    luxuryOnly ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Crown size={13} className={luxuryOnly ? 'text-amber-600' : 'text-slate-400'} />
                  <span>5-Star Luxury Only</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowTravellerDropdown(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 3. Transfers Calendar Modal Portal */}
      {showTransferCalendar &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(2px)'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowTransferCalendar(false);
            }}
          >
            <div
              className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-4 sm:p-6 max-h-[85vh] overflow-auto"
              style={{ maxWidth: '95vw', margin: 16 }}
            >
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
                <h3 className="font-extrabold text-base text-gray-900">Select Transfer Date & Time</h3>
                <button
                  type="button"
                  onClick={() => setShowTransferCalendar(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading calendar...</div>}>
                <LazyDateRange
                  ranges={transferDateRange}
                  onChange={(item) => {
                    const sel = item.selection;
                    if (tripType === 'one_way') {
                      setTransferDateRange([{ startDate: sel.startDate, endDate: sel.startDate, key: 'selection' }]);
                    } else {
                      setTransferDateRange([sel]);
                    }
                  }}
                  minDate={addDays(new Date(), 1)}
                  maxDate={addDays(new Date(), 365)}
                  months={window.innerWidth < 640 ? 1 : 2}
                  direction="horizontal"
                  rangeColors={['#2563eb']}
                  showDateDisplay={false}
                />
              </Suspense>

              {/* Time Pickers */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Pickup Time</label>
                  <input
                    type="time"
                    value={transferTime}
                    onChange={(e) => setTransferTime(e.target.value)}
                    className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                {tripType === 'round_trip' && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Return Time</label>
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowTransferCalendar(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold cursor-pointer"
                >
                  Apply Date & Time
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 4. Transfers Passengers Modal Portal */}
      {showTransferTravellers &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(2px)'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowTransferTravellers(false);
            }}
          >
            <div
              className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-4 sm:p-6 w-[360px] max-w-[95vw]"
              style={{ margin: 16 }}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <h3 className="font-extrabold text-base text-gray-900">Transfer Passengers</h3>
                <button
                  type="button"
                  onClick={() => setShowTransferTravellers(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Adults</span>
                    <span className="text-[10px] text-slate-400">Age 12+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTransferAdults(Math.max(1, transferAdults - 1))}
                      disabled={transferAdults <= 1}
                      className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-white cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-xs font-bold">{transferAdults}</span>
                    <button
                      type="button"
                      onClick={() => setTransferAdults(Math.min(10, transferAdults + 1))}
                      disabled={transferAdults >= 10}
                      className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-white cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Children</span>
                    <span className="text-[10px] text-slate-400">Age 2-11</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTransferChildren(Math.max(0, transferChildren - 1))}
                      disabled={transferChildren <= 0}
                      className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-white cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-xs font-bold">{transferChildren}</span>
                    <button
                      type="button"
                      onClick={() => setTransferChildren(Math.min(6, transferChildren + 1))}
                      disabled={transferChildren >= 6}
                      className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-white cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Infants</span>
                    <span className="text-[10px] text-slate-400">Under 2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTransferInfants(Math.max(0, transferInfants - 1))}
                      disabled={transferInfants <= 0}
                      className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-white cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-xs font-bold">{transferInfants}</span>
                    <button
                      type="button"
                      onClick={() => setTransferInfants(Math.min(4, transferInfants + 1))}
                      disabled={transferInfants >= 4}
                      className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-white cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowTransferTravellers(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 5. Experiences Calendar Modal Portal */}
      {showExperienceCalendar &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(2px)'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowExperienceCalendar(false);
            }}
          >
            <div
              className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-4 sm:p-6 max-h-[85vh] overflow-auto"
              style={{ maxWidth: '95vw', margin: 16 }}
            >
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
                <h3 className="font-extrabold text-base text-gray-900">Select Activity Dates</h3>
                <button
                  type="button"
                  onClick={() => setShowExperienceCalendar(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading calendar...</div>}>
                <LazyDateRange
                  ranges={experienceDateRange}
                  onChange={(item) => setExperienceDateRange([item.selection])}
                  minDate={addDays(new Date(), 1)}
                  maxDate={addDays(new Date(), 365)}
                  months={window.innerWidth < 640 ? 1 : 2}
                  direction="horizontal"
                  rangeColors={['#2563eb']}
                  showDateDisplay={false}
                />
              </Suspense>

              <div className="pt-4 mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowExperienceCalendar(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold cursor-pointer"
                >
                  Apply Dates
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 6. Experiences Travelers Modal Portal */}
      {showExperienceTravellers &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(2px)'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowExperienceTravellers(false);
            }}
          >
            <div
              className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-4 sm:p-6 w-[360px] max-w-[95vw]"
              style={{ margin: 16 }}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <h3 className="font-extrabold text-base text-gray-900">Experience Travelers</h3>
                <button
                  type="button"
                  onClick={() => setShowExperienceTravellers(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Adults</span>
                    <span className="text-[10px] text-slate-400">Age 18+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExperienceAdults(Math.max(1, experienceAdults - 1))}
                      disabled={experienceAdults <= 1}
                      className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-white cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-xs font-bold">{experienceAdults}</span>
                    <button
                      type="button"
                      onClick={() => setExperienceAdults(Math.min(10, experienceAdults + 1))}
                      disabled={experienceAdults >= 10}
                      className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-white cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Children</span>
                    <span className="text-[10px] text-slate-400">Age 0-17</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExperienceChildren(Math.max(0, experienceChildren - 1))}
                      disabled={experienceChildren <= 0}
                      className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-white cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-xs font-bold">{experienceChildren}</span>
                    <button
                      type="button"
                      onClick={() => setExperienceChildren(Math.min(6, experienceChildren + 1))}
                      disabled={experienceChildren >= 6}
                      className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center disabled:opacity-30 hover:bg-white cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowExperienceTravellers(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
