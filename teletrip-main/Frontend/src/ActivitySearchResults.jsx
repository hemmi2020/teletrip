import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Calendar, Users, Filter, Star, Clock, Search, X, ChevronDown, ChevronLeft, ChevronRight, ShoppingCart, CheckCircle } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import { useCart } from './components/CartSystem';
import { useCurrency } from './context/CurrencyContext';
import HotelSearchForm from './components/HotelSearchForm';
import MobileFilters from './components/MobileFilters';
const ActivitySearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPKR, convert } = useCurrency();

  const destination = searchParams.get('destination');
  const country = searchParams.get('country');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const adults = searchParams.get('adults') || '2';

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [sortOption, setSortOption] = useState('default');
  const [showModifySearch, setShowModifySearch] = useState(false);

  // Listen for Search tab press from BottomNavBar
  useEffect(() => {
    const handler = () => setShowModifySearch(s => !s);
    window.addEventListener('toggleModifySearch', handler);
    return () => window.removeEventListener('toggleModifySearch', handler);
  }, []);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);
  const [activityDetail, setActivityDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedModality, setSelectedModality] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(from);

  // Filter states
  const [nameSearch, setNameSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDaytimes, setSelectedDaytimes] = useState([]);
  const [selectedRecommended, setSelectedRecommended] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedVoucherTypes, setSelectedVoucherTypes] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    name: true,
    categories: true,
    daytime: true,
    recommended: true,
    supplier: true,
    voucherValidity: true,
    services: true,
    price: true,
  });

  const API_BASE_URL = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000') + '/api';

  useEffect(() => {
    let cancelled = false;
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setActivities([]);
        const response = await fetch(`${API_BASE_URL}/activities/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination,
            country,
            from,
            to,
            paxes: Array(parseInt(adults)).fill({ age: 30 }),
            language: 'en'
          })
        });

        const data = await response.json();
        if (!cancelled) {
          if (data.success) {
            setActivities(data.data.activities || []);
          } else {
            setError(data.error);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (destination && from && to) fetchActivities();
    return () => { cancelled = true; };
  }, [destination, country, from, to, adults]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Fetch activity detail when modal opens
  useEffect(() => {
    if (!selectedActivity) { setActivityDetail(null); setSelectedModality(null); setSelectedTime(null); setSelectedDate(from); return; }
    const fetchDetail = async () => {
      setLoadingDetail(true);
      try {
        const res = await fetch(`${API_BASE_URL}/activities/detail/${selectedActivity.code}?from=${from}&to=${to}&language=en`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) setActivityDetail(data.data);
        }
      } catch (err) { console.error('Detail fetch error:', err); }
      finally { setLoadingDetail(false); }
    };
    fetchDetail();
  }, [selectedActivity]);

  const clearFilters = () => {
    setNameSearch('');
    setSelectedCategories([]);
    setSelectedDaytimes([]);
    setSelectedRecommended([]);
    setSelectedSuppliers([]);
    setSelectedVoucherTypes([]);
    setSelectedServices([]);
    setPriceMin('');
    setPriceMax('');
  };

  const handleAddActivityToCart = (activity, modality = null, pricing = null, time = null) => {
    const price = pricing ? parseFloat(pricing.amount || 0) : parseFloat(activity.pricing?.amount || 0);
    const currency = pricing?.currency || activity.pricing?.currency || 'EUR';
    addToCart({
      id: `activity-${activity.code}-${modality?.code || 'default'}-${selectedDate}-${time || ''}`,
      type: 'activity',
      name: activity.name,
      code: activity.code,
      activityCode: activity.code,
      modalityCode: modality?.code || null,
      price,
      currency,
      checkIn: selectedDate,
      checkOut: to,
      from: selectedDate,
      to: to,
      guests: parseInt(adults),
      adults: parseInt(adults),
      paxes: Array(parseInt(adults)).fill({ age: 30 }),
      destination: activity.destination,
      country: activity.country,
      category: activity.activityFactsheetType,
      supplier: activity.supplier,
      thumbnail: activity.images?.[0],
      modalityName: modality?.name || activity.activityFactsheetType || 'Standard',
      selectedTime: time,
      selectedDate: selectedDate,
      duration: modality?.duration || (activity.scheduling?.duration?.value ? `${activity.scheduling.duration.value}h` : null),
      addedAt: new Date().toISOString(),
    });
    setSelectedActivity(null);
    setNotification({ show: true, message: `${activity.name} added to cart!` });
    setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    window.dispatchEvent(new CustomEvent('openCart'));
  };

  // Dynamic filter options from data
  const dynamicCategories = [...new Set(activities.map(a => a.activityFactsheetType).filter(Boolean))].sort();
  
  // Daytime options matching Hotelbeds B2B: Full day, Morning, Afternoon, Evening, Flexible
  const daytimeOptions = ['Full day', 'Morning', 'Afternoon', 'Evening', 'Flexible'];
  
  const dynamicRecommended = [...new Set(activities.flatMap(a => {
    const groups = [];
    if (a.segmentationGroups && Array.isArray(a.segmentationGroups)) {
      a.segmentationGroups.forEach(g => {
        if (g.segments) g.segments.forEach(s => { if (s.name) groups.push(s.name); });
        if (g.name) groups.push(g.name);
      });
    }
    if (groups.length === 0) {
      const text = ((a.name || '') + ' ' + (a.summary || '')).toLowerCase();
      if (text.includes('family') || text.includes('kid')) groups.push('Families');
      if (text.includes('couple') || text.includes('romantic')) groups.push('Couples');
      if (text.includes('youth') || text.includes('young')) groups.push('Youth');
      if (text.includes('senior')) groups.push('Senior');
    }
    return groups;
  }))].filter(Boolean).sort();

  const dynamicSuppliers = [...new Set(activities.map(a => a.supplier).filter(Boolean))].sort();
  const dynamicVoucherTypes = [...new Set(activities.map(a => a.voucherType).filter(Boolean))].sort();
  const dynamicServices = [...new Set(activities.flatMap(a => {
    const svcs = [];
    if (a.services && Array.isArray(a.services)) svcs.push(...a.services);
    const text = ((a.name || '') + ' ' + (a.summary || '') + ' ' + (a.description || '')).toLowerCase();
    if (text.includes('private')) svcs.push('Private');
    if (text.includes('small group')) svcs.push('Small group');
    if (text.includes('wheelchair') || text.includes('accessible')) svcs.push('Wheelchair accessible');
    return svcs;
  }))].filter(Boolean).sort();

  // Count helpers
  const countCat = (c) => activities.filter(a => a.activityFactsheetType === c).length;
  const countDaytime = (d) => activities.filter(a => getActivityDaytimes(a).has(d)).length;
  const countRec = (r) => activities.filter(a => getActivityRecommended(a).has(r)).length;
  const countSupplier = (s) => activities.filter(a => a.supplier === s).length;
  const countVoucher = (v) => activities.filter(a => a.voucherType === v).length;
  const countService = (s) => activities.filter(a => getActivityServices(a).has(s)).length;

  // Derive daytime tag for a single activity
  const getActivityDaytimes = (activity) => {
    const times = new Set();
    const sched = activity.scheduling;
    const name = (activity.name || '').toLowerCase();
    const desc = (activity.description || '').toLowerCase();
    const text = name + ' ' + desc;
    
    if (sched?.duration?.hours >= 6) times.add('Full day');
    if (text.includes('morning') || text.includes('sunrise')) times.add('Morning');
    if (text.includes('afternoon')) times.add('Afternoon');
    if (text.includes('evening') || text.includes('night') || text.includes('sunset')) times.add('Evening');
    if (text.includes('flexible') || (sched && !sched.duration)) times.add('Flexible');
    if (sched?.duration?.hours && sched.duration.hours >= 3 && sched.duration.hours < 6) {
      if (!times.has('Morning') && !times.has('Afternoon')) times.add('Morning');
    }
    if (times.size === 0) times.add('Flexible');
    return times;
  };

  const getActivityRecommended = (activity) => {
    const groups = new Set();
    if (activity.segmentationGroups && Array.isArray(activity.segmentationGroups)) {
      activity.segmentationGroups.forEach(g => {
        if (g.segments) g.segments.forEach(s => { if (s.name) groups.add(s.name); });
        if (g.name) groups.add(g.name);
      });
    }
    if (groups.size === 0) {
      const text = ((activity.name || '') + ' ' + (activity.summary || '')).toLowerCase();
      if (text.includes('family') || text.includes('kid')) groups.add('Families');
      if (text.includes('couple') || text.includes('romantic')) groups.add('Couples');
      if (text.includes('youth') || text.includes('young')) groups.add('Youth');
      if (text.includes('senior')) groups.add('Senior');
    }
    return groups;
  };

  const getActivityServices = (activity) => {
    const svcs = new Set();
    if (activity.services && Array.isArray(activity.services)) activity.services.forEach(s => svcs.add(s));
    const text = ((activity.name || '') + ' ' + (activity.summary || '') + ' ' + (activity.description || '')).toLowerCase();
    if (text.includes('private')) svcs.add('Private');
    if (text.includes('small group')) svcs.add('Small group');
    if (text.includes('wheelchair') || text.includes('accessible')) svcs.add('Wheelchair accessible');
    return svcs;
  };

  // Compute price bounds from all activities for slider (in PKR)
  const priceBounds = useMemo(() => {
    if (!activities.length) return { min: 0, max: 500 };
    const prices = activities.map(a => parseFloat(a.pricing?.amount || 0)).filter(p => p > 0);
    if (!prices.length) return { min: 0, max: 500 };
    const minEur = Math.floor(Math.min(...prices));
    const maxEur = Math.ceil(Math.max(...prices));
    const minPkr = convert ? Math.floor(convert(minEur) || minEur) : minEur;
    const maxPkr = convert ? Math.ceil(convert(maxEur) || maxEur) : maxEur;
    return { min: minPkr, max: maxPkr };
  }, [activities, convert]);

  const filteredActivities = useMemo(() => activities.filter(a => {
    if (nameSearch && !a.name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
    if (selectedCategories.length > 0 && !selectedCategories.includes(a.activityFactsheetType)) return false;
    if (selectedDaytimes.length > 0) { const times = getActivityDaytimes(a); if (!selectedDaytimes.some(d => times.has(d))) return false; }
    if (selectedRecommended.length > 0) { const recs = getActivityRecommended(a); if (!selectedRecommended.some(r => recs.has(r))) return false; }
    if (selectedSuppliers.length > 0 && !selectedSuppliers.includes(a.supplier)) return false;
    if (selectedVoucherTypes.length > 0 && !selectedVoucherTypes.includes(a.voucherType)) return false;
    if (selectedServices.length > 0) { const svcs = getActivityServices(a); if (!selectedServices.some(s => svcs.has(s))) return false; }
    const price = parseFloat(a.pricing?.amount || 0);
    const pricePkr = convert ? (convert(price) || price) : price;
    if (priceMin && pricePkr < parseFloat(priceMin)) return false;
    if (priceMax && pricePkr > parseFloat(priceMax)) return false;
    return true;
  }), [activities, nameSearch, selectedCategories, selectedDaytimes, selectedRecommended, selectedSuppliers, selectedVoucherTypes, selectedServices, priceMin, priceMax, convert]);

  const sortedActivities = useMemo(() => [...filteredActivities].sort((a, b) => {
    if (sortOption === 'priceLow') return parseFloat(a.pricing?.amount || 0) - parseFloat(b.pricing?.amount || 0);
    if (sortOption === 'priceHigh') return parseFloat(b.pricing?.amount || 0) - parseFloat(a.pricing?.amount || 0);
    if (sortOption === 'name') return (a.name || '').localeCompare(b.name || '');
    return 0;
  }), [filteredActivities, sortOption]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2">Searching activities...</span>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="pt-12 sm:pt-16 flex">

        {/* Mobile overlay backdrop */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black/40 z-[120] lg:hidden" onClick={() => setShowMobileFilters(false)} />
        )}

        {/* Sidebar — desktop only */}
        <div className={`
          hidden lg:block
          lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-40
          ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarCollapsed ? 'lg:w-0 lg:overflow-hidden lg:border-0' : 'lg:w-[300px] lg:translate-x-0'}
        `}>
          <div className="filter-sidebar-inner h-full overflow-y-auto overscroll-contain px-4 py-4 text-left" style={{scrollbarWidth:'thin',scrollbarColor:'#e5e7eb transparent'}}>
            <div className="flex justify-between items-center pb-3 mb-1 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-900 tracking-wider uppercase">Filters</span>
              <div className="flex items-center gap-2">
                <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Reset all</button>
                <button onClick={() => setSidebarCollapsed(true)} className="p-1 rounded hover:bg-gray-100 flex"><ChevronLeft className="w-3.5 h-3.5 text-gray-400" /></button>
              </div>
            </div>

              {/* 1. Search by Activity Name */}
              <div className="py-3 border-b border-gray-50">
                <button onClick={() => toggleSection('name')} className="flex items-center justify-between w-full cursor-pointer">
                  <span className="text-[13px] font-semibold text-gray-800">Activity Name</span>
                  {expandedSections.name ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
                </button>
                {expandedSections.name && (
                  <div className="relative mt-2.5">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input type="text" value={nameSearch} onChange={(e) => setNameSearch(e.target.value)} placeholder="Search activity..." className="w-full pl-8 pr-3 py-1.5 text-[13px] border border-gray-200 rounded-md bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                  </div>
                )}
              </div>

              {/* 2. Categories */}
              {dynamicCategories.length > 0 && (
                <div className="py-3 border-b border-gray-50">
                  <button onClick={() => toggleSection('categories')} className="flex items-center justify-between w-full cursor-pointer">
                    <span className="text-[13px] font-semibold text-gray-800">Categories</span>
                    {expandedSections.categories ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
                  </button>
                  {expandedSections.categories && (
                    <div className="space-y-1.5 max-h-44 overflow-y-auto">
                      {dynamicCategories.map(cat => (
                        <label key={cat} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{cat}</span><span className="text-[11px] text-gray-400">{countCat(cat)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. Daytime */}
              <div className="py-3 border-b border-gray-50">
                <button onClick={() => toggleSection('daytime')} className="flex items-center justify-between w-full cursor-pointer">
                  <span className="text-[13px] font-semibold text-gray-800">Daytime</span>
                  {expandedSections.daytime ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
                </button>
                {expandedSections.daytime && (
                  <div className="space-y-1.5">
                    {daytimeOptions.map(time => (
                      <label key={time} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedDaytimes.includes(time)}
                          onChange={() => setSelectedDaytimes(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time])}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{time}</span><span className="text-[11px] text-gray-400">{countDaytime(time)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Recommended Activity For */}
              {dynamicRecommended.length > 0 && (
                <div className="py-3 border-b border-gray-50">
                  <button onClick={() => toggleSection('recommended')} className="flex items-center justify-between w-full cursor-pointer">
                    <span className="text-[13px] font-semibold text-gray-800">Recommended For</span>
                    {expandedSections.recommended ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
                  </button>
                  {expandedSections.recommended && (
                    <div className="space-y-1.5">
                      {dynamicRecommended.map(rec => (
                        <label key={rec} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedRecommended.includes(rec)}
                            onChange={() => setSelectedRecommended(prev => prev.includes(rec) ? prev.filter(r => r !== rec) : [...prev, rec])}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{rec}</span><span className="text-[11px] text-gray-400">{countRec(rec)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. Supplier */}
              {dynamicSuppliers.length > 0 && (
                <div className="py-3 border-b border-gray-50">
                  <button onClick={() => toggleSection('supplier')} className="flex items-center justify-between w-full cursor-pointer">
                    <span className="text-[13px] font-semibold text-gray-800">Supplier</span>
                    {expandedSections.supplier ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
                  </button>
                  {expandedSections.supplier && (
                    <div className="space-y-1.5 max-h-44 overflow-y-auto">
                      {dynamicSuppliers.map(sup => (
                        <label key={sup} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedSuppliers.includes(sup)}
                            onChange={() => setSelectedSuppliers(prev => prev.includes(sup) ? prev.filter(s => s !== sup) : [...prev, sup])}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{sup}</span><span className="text-[11px] text-gray-400">{countSupplier(sup)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 6. Voucher Validity */}
              {dynamicVoucherTypes.length > 0 && (
                <div className="py-3 border-b border-gray-50">
                  <button onClick={() => toggleSection('voucherValidity')} className="flex items-center justify-between w-full cursor-pointer">
                    <span className="text-[13px] font-semibold text-gray-800">Voucher Validity</span>
                    {expandedSections.voucherValidity ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
                  </button>
                  {expandedSections.voucherValidity && (
                    <div className="space-y-1.5">
                      {dynamicVoucherTypes.map(vt => (
                        <label key={vt} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedVoucherTypes.includes(vt)}
                            onChange={() => setSelectedVoucherTypes(prev => prev.includes(vt) ? prev.filter(v => v !== vt) : [...prev, vt])}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{vt}</span><span className="text-[11px] text-gray-400">{countVoucher(vt)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 7. Services */}
              {dynamicServices.length > 0 && (
                <div className="py-3 border-b border-gray-50">
                  <button onClick={() => toggleSection('services')} className="flex items-center justify-between w-full cursor-pointer">
                    <span className="text-[13px] font-semibold text-gray-800">Services</span>
                    {expandedSections.services ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
                  </button>
                  {expandedSections.services && (
                    <div className="space-y-1.5">
                      {dynamicServices.map(svc => (
                        <label key={svc} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(svc)}
                            onChange={() => setSelectedServices(prev => prev.includes(svc) ? prev.filter(s => s !== svc) : [...prev, svc])}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1 text-left">{svc}</span><span className="text-[11px] text-gray-400">{countService(svc)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 8. Price Min & Max */}
              <div className="py-3 border-b border-gray-50">
                <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full cursor-pointer">
                  <span className="text-[13px] font-semibold text-gray-800">Price Range (PKR)</span>
                  {expandedSections.price ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
                </button>
                {expandedSections.price && (
                  <div className="mt-2 space-y-3">
                    <div className="relative h-6 flex items-center">
                      <div className="absolute left-0 right-0 h-1 bg-gray-200 rounded-full" />
                      <div
                        className="absolute h-1 bg-blue-500 rounded-full"
                        style={{
                          left: `${((parseFloat(priceMin) || priceBounds.min) - priceBounds.min) / (priceBounds.max - priceBounds.min || 1) * 100}%`,
                          right: `${100 - ((parseFloat(priceMax) || priceBounds.max) - priceBounds.min) / (priceBounds.max - priceBounds.min || 1) * 100}%`
                        }}
                      />
                      <input
                        type="range"
                        min={priceBounds.min}
                        max={priceBounds.max}
                        value={parseFloat(priceMin) || priceBounds.min}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          const maxV = parseFloat(priceMax) || priceBounds.max;
                          setPriceMin(v >= maxV ? String(maxV - 1) : String(v));
                        }}
                        className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
                        style={{ zIndex: 3 }}
                      />
                      <input
                        type="range"
                        min={priceBounds.min}
                        max={priceBounds.max}
                        value={parseFloat(priceMax) || priceBounds.max}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          const minV = parseFloat(priceMin) || priceBounds.min;
                          setPriceMax(v <= minV ? String(minV + 1) : String(v));
                        }}
                        className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
                        style={{ zIndex: 4 }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        placeholder={String(priceBounds.min)}
                        className="w-full px-2.5 py-1.5 text-[13px] border border-gray-200 rounded-md bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <span className="text-gray-300 text-xs">–</span>
                      <input
                        type="number"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        placeholder={String(priceBounds.max)}
                        className="w-full px-2.5 py-1.5 text-[13px] border border-gray-200 rounded-md bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>PKR {priceBounds.min.toLocaleString()}</span>
                      <span>PKR {priceBounds.max.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* Sidebar Open Button (desktop) */}
        {sidebarCollapsed && (
          <button onClick={() => setSidebarCollapsed(false)} className="hidden lg:flex fixed top-20 left-2 z-50 items-center gap-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-[12px] text-gray-600">
            <Filter className="w-3.5 h-3.5" /><ChevronRight className="w-3 h-3" />
          </button>
        )}

        {/* Mobile Filter FAB */}
        <button
          onClick={() => setShowMobileFilters(true)}
          style={{
            position: 'fixed', bottom: 64, right: 16, zIndex: 115,
            display: 'flex', alignItems: 'center', gap: 8,
            backgroundColor: '#2563eb', color: '#fff',
            padding: '10px 18px', borderRadius: 99,
            boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
            border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
          }}
          className="lg:hidden"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {(selectedCategories.length + selectedDaytimes.length + selectedRecommended.length + selectedSuppliers.length + selectedVoucherTypes.length + selectedServices.length + (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (nameSearch ? 1 : 0)) > 0 && (
            <span style={{
              backgroundColor: '#fff', color: '#2563eb', fontSize: 11,
              fontWeight: 700, borderRadius: 99, width: 20, height: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {selectedCategories.length + selectedDaytimes.length + selectedRecommended.length + selectedSuppliers.length + selectedVoucherTypes.length + selectedServices.length + (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (nameSearch ? 1 : 0)}
            </span>
          )}
        </button>

        {/* Mobile Filters Sheet */}
        <MobileFilters
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          onReset={clearFilters}
          activeCount={selectedCategories.length + selectedDaytimes.length + selectedRecommended.length + selectedSuppliers.length + selectedVoucherTypes.length + selectedServices.length + (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (nameSearch ? 1 : 0)}
          sections={[
            {
              key: 'name', label: 'Activity Name', type: 'search',
              placeholder: 'Search activity...',
              value: nameSearch, onChange: setNameSearch,
            },
            ...(dynamicCategories.length > 0 ? [{
              key: 'categories', label: 'Categories', type: 'checkbox',
              value: selectedCategories, onChange: setSelectedCategories,
              options: dynamicCategories.map(c => ({ value: c, label: c, count: countCat(c) })),
            }] : []),
            {
              key: 'daytime', label: 'Daytime', type: 'checkbox',
              value: selectedDaytimes, onChange: setSelectedDaytimes,
              options: daytimeOptions.map(d => ({ value: d, label: d, count: countDaytime(d) })),
            },
            ...(dynamicRecommended.length > 0 ? [{
              key: 'recommended', label: 'Recommended For', type: 'checkbox',
              value: selectedRecommended, onChange: setSelectedRecommended,
              options: dynamicRecommended.map(r => ({ value: r, label: r, count: countRec(r) })),
            }] : []),
            ...(dynamicSuppliers.length > 0 ? [{
              key: 'supplier', label: 'Supplier', type: 'checkbox',
              value: selectedSuppliers, onChange: setSelectedSuppliers,
              options: dynamicSuppliers.map(s => ({ value: s, label: s, count: countSupplier(s) })),
            }] : []),
            ...(dynamicVoucherTypes.length > 0 ? [{
              key: 'voucher', label: 'Voucher Validity', type: 'checkbox',
              value: selectedVoucherTypes, onChange: setSelectedVoucherTypes,
              options: dynamicVoucherTypes.map(v => ({ value: v, label: v, count: countVoucher(v) })),
            }] : []),
            ...(dynamicServices.length > 0 ? [{
              key: 'services', label: 'Services', type: 'checkbox',
              value: selectedServices, onChange: setSelectedServices,
              options: dynamicServices.map(s => ({ value: s, label: s, count: countService(s) })),
            }] : []),
            {
              key: 'price', label: 'Price Range (PKR)', type: 'range',
              valueMin: priceMin, onChangeMin: setPriceMin,
              valueMax: priceMax, onChangeMax: setPriceMax,
              placeholderMin: String(priceBounds.min),
              placeholderMax: String(priceBounds.max),
            },
          ]}
        />

        <div className="flex-1 min-w-0">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
            {error && (<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"><p className="text-red-800">{error}</p></div>)}

            <div className="sticky top-12 sm:top-16 z-20 bg-white py-2 -mx-4 px-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h1 className="text-[13px] sm:text-base font-semibold text-gray-900 truncate flex-1 min-w-0">{sortedActivities.length} Activities in {destination}</h1>
                <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="text-[12px] px-2 py-1 border border-gray-200 rounded-lg bg-white text-gray-600 outline-none flex-shrink-0 max-w-[120px] sm:max-w-none">
                  <option value="default">Recommended</option>
                  <option value="priceLow">Price ↑</option>
                  <option value="priceHigh">Price ↓</option>
                  <option value="name">Name A→Z</option>
                </select>
                <button onClick={() => setShowModifySearch(s => !s)} className="text-[12px] text-blue-600 font-medium whitespace-nowrap cursor-pointer flex-shrink-0 px-2 py-1 rounded-lg border border-blue-200 bg-blue-50">
                  {showModifySearch ? 'Close' : 'Modify'}
                </button>
              </div>
              {showModifySearch && (
                <div className="pt-3 pb-2 border-t border-gray-100 mt-2">
                  <HotelSearchForm defaultTab="experiences" variant="light" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-[12px] text-gray-500 py-2.5 flex-wrap border-b border-gray-50 mb-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="font-medium text-gray-700">{destination}{country ? `, ${country}` : ''}</span>
              <span className="text-gray-300">|</span>
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{from} → {to}</span>
              <span className="text-gray-300">|</span>
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{adults} adult{parseInt(adults) !== 1 ? 's' : ''}</span>
            </div>

            {sortedActivities.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🎭</div>
                <p className="text-gray-800 text-lg font-medium mb-1">No activities match your filters</p>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your filters</p>
                <button onClick={clearFilters} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Clear All Filters</button>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedActivities.map((activity, idx) => (
                  <div key={activity.code} className="bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200 flex flex-col sm:flex-row group overflow-hidden">
                    <div className="sm:w-56 lg:w-64 relative flex-shrink-0">
                      <img src={activity.images?.[0] || 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'} alt={activity.name} className="w-full h-44 sm:h-full object-cover sm:rounded-l-xl group-hover:scale-105 transition-transform duration-500" onError={(e) => e.target.src = 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'} />
                      {activity.activityFactsheetType && (<div className="absolute top-2 left-2 bg-blue-600/90 text-white px-2 py-0.5 rounded text-[10px] font-medium">{activity.activityFactsheetType}</div>)}
                    </div>
                    <div className="flex-1 p-3 sm:p-4 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <h3 className="text-[14px] font-semibold text-gray-900 leading-tight line-clamp-2 flex-1 min-w-0">{activity.name}</h3>
                          <div className="text-right flex-shrink-0 ml-2">
                            {activity.pricing?.amount ? (<div className="text-base font-bold text-blue-600 leading-tight whitespace-nowrap">{formatPKR(activity.pricing.amount) || `${activity.pricing.currency} ${parseFloat(activity.pricing.amount).toFixed(0)}`}</div>) : <span className="text-[11px] text-gray-400">On request</span>}
                            <div className="text-[10px] text-gray-400">per person</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-1.5 flex-wrap">
                          {activity.destination && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{activity.destination}</span>}
                          {activity.scheduling?.duration?.value && <><span>·</span><span><Clock className="w-3 h-3 inline" /> {activity.scheduling.duration.value}h</span></>}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {activity.supplier && <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded">{activity.supplier}</span>}
                          {activity.voucherType && <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded">{activity.voucherType}</span>}
                          {activity.services && activity.services.filter(Boolean).slice(0, 2).map((s, i) => (
                            <span key={`svc-${i}`} className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-end pt-2 mt-2 border-t border-gray-100">
                        <button onClick={() => setSelectedActivity(activity)} className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-[12px] font-medium inline-flex items-center justify-center gap-1.5">View Options</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center" onClick={() => setSelectedActivity(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white w-full sm:max-w-3xl sm:rounded-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Image */}
            <div className="relative h-48 sm:h-56 flex-shrink-0 bg-gray-200 overflow-hidden">
              {selectedActivity.images && selectedActivity.images.length >= 3 ? (
                <div className="grid grid-cols-3 gap-0.5 h-full">
                  <div className="col-span-2 cursor-pointer overflow-hidden" onClick={() => { setGalleryImages(selectedActivity.images); setGalleryIndex(0); setGalleryOpen(true); }}><img src={selectedActivity.images[0]} alt="" className="w-full h-full object-cover hover:brightness-90 transition-all" onError={(e) => e.target.src = 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'} /></div>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <div className="flex-1 cursor-pointer overflow-hidden" onClick={() => { setGalleryImages(selectedActivity.images); setGalleryIndex(1); setGalleryOpen(true); }}><img src={selectedActivity.images[1]} alt="" className="w-full h-full object-cover hover:brightness-90 transition-all" onError={(e) => e.target.src = 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'} /></div>
                    <div className="relative flex-1 cursor-pointer overflow-hidden" onClick={() => { setGalleryImages(selectedActivity.images); setGalleryIndex(2); setGalleryOpen(true); }}>
                      <img src={selectedActivity.images[2]} alt="" className="w-full h-full object-cover hover:brightness-90 transition-all" onError={(e) => e.target.src = 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'} />
                      {selectedActivity.images.length > 3 && <div className="absolute inset-0 bg-black/50 hover:bg-black/40 flex items-center justify-center text-white text-sm font-medium transition-colors">+{selectedActivity.images.length - 3}</div>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full cursor-pointer overflow-hidden" onClick={() => { setGalleryImages(selectedActivity.images || []); setGalleryIndex(0); setGalleryOpen(true); }}>
                  <img src={selectedActivity.images?.[0] || 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'} alt="" className="w-full h-full object-cover hover:brightness-90 transition-all" />
                </div>
              )}
              <button onClick={() => setSelectedActivity(null)} className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 rounded-full transition-colors"><X className="w-4 h-4 text-white" /></button>
              {selectedActivity.activityFactsheetType && (
                <div className="absolute bottom-3 left-3 bg-blue-600/90 text-white px-2.5 py-1 rounded-lg text-[12px] font-medium">{selectedActivity.activityFactsheetType}</div>
              )}
            </div>
            {/* Info header */}
            <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-1.5">{selectedActivity.name}</h2>
              <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-2 flex-wrap">
                {selectedActivity.destination && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedActivity.destination}{selectedActivity.country ? `, ${selectedActivity.country}` : ''}</span>}
                <span>·</span><span>{from} → {to}</span><span>·</span><span>{adults} adults</span>
              </div>
              {/* Tags */}
              {(() => {
                const tags = [];
                if (selectedActivity.supplier) tags.push({ label: selectedActivity.supplier, color: 'bg-gray-100 text-gray-600' });
                if (selectedActivity.scheduling?.duration?.value) tags.push({ label: `${selectedActivity.scheduling.duration.value}h duration`, color: 'bg-gray-100 text-gray-600' });
                if (selectedActivity.voucherType) tags.push({ label: `Voucher: ${selectedActivity.voucherType}`, color: 'bg-amber-50 text-amber-600' });
                if (selectedActivity.activityFactsheetType) tags.push({ label: selectedActivity.activityFactsheetType, color: 'bg-blue-50 text-blue-600' });
                if (selectedActivity.segmentationGroups) {
                  selectedActivity.segmentationGroups.forEach(g => {
                    if (g.segments) g.segments.forEach(s => { if (s.name) tags.push({ label: s.name, color: 'bg-purple-50 text-purple-600' }); });
                    else if (g.name) tags.push({ label: g.name, color: 'bg-purple-50 text-purple-600' });
                  });
                }
                if (selectedActivity.services) {
                  selectedActivity.services.forEach(s => { if (s) tags.push({ label: s, color: 'bg-green-50 text-green-600' }); });
                }
                return tags.length > 0 ? (
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {tags.map((t, i) => <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full ${t.color}`}>{t.label}</span>)}
                  </div>
                ) : null;
              })()}
              {/* Price display */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  {selectedActivity.pricing?.amount ? (
                    <><span className="text-xl font-bold text-blue-600">{formatPKR(selectedActivity.pricing.amount) || `${selectedActivity.pricing.currency} ${parseFloat(selectedActivity.pricing.amount).toFixed(2)}`}</span><span className="text-[12px] text-gray-400 ml-1">from / person</span></>
                  ) : <span className="text-gray-400">Price on request</span>}
                </div>
              </div>
            </div>
            {/* Scrollable details */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4" style={{scrollbarWidth:'thin'}}>
              {/* Select Date */}
              <div>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Select Date</div>
                <div className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
                  {(() => {
                    const dates = [];
                    const start = new Date(from);
                    const end = new Date(to);
                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                      dates.push(new Date(d));
                    }
                    return dates.map((d, i) => {
                      const dateStr = d.toISOString().split('T')[0];
                      const isSelected = selectedDate === dateStr;
                      return (
                        <div key={i} onClick={() => setSelectedDate(dateStr)} className={`flex-shrink-0 px-3 py-2 rounded-xl text-center transition-all min-w-[60px] ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                          <div className="text-[10px] uppercase">{d.toLocaleDateString('en', { weekday: 'short' })}</div>
                          <div className="text-[16px] font-bold leading-tight">{d.getDate()}</div>
                          <div className="text-[10px]">{d.toLocaleDateString('en', { month: 'short' })}</div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Select Package */}
              {loadingDetail ? (
                <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" /><span className="text-[13px] text-gray-400">Loading options...</span></div>
              ) : (() => {
                const modalities = activityDetail?.modalities?.length > 0 
                  ? activityDetail.modalities 
                  : [{
                      code: 'standard',
                      name: selectedActivity.activityFactsheetType || 'Standard',
                      duration: selectedActivity.scheduling?.duration?.value ? `${selectedActivity.scheduling.duration.value} ${(selectedActivity.scheduling.duration.metric || 'HOURS').toLowerCase()}` : null,
                      pricing: selectedActivity.pricing?.amount ? [{ amount: selectedActivity.pricing.amount, currency: selectedActivity.pricing.currency || 'EUR', paxType: 'ADULT' }] : []
                    }];
                return (
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{selectedActivity.scheduling?.opened?.length > 0 ? '1. Select Package' : 'Select Package'}</div>
                  <div className="space-y-2">
                    {modalities.map((mod, mi) => {
                      const isSelected = selectedModality?.code === mod.code;
                      const bestPrice = mod.pricing?.[0];
                      return (
                        <div key={mi} onClick={() => setSelectedModality(mod)} className={`border rounded-xl p-3 transition-all cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-200' : 'border-gray-100 hover:border-gray-200'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                              </div>
                              <div>
                                <span className="text-[13px] font-medium text-gray-800">{mod.name}</span>
                                {mod.duration && <span className="text-[11px] text-gray-400 ml-2">{mod.duration}</span>}
                              </div>
                            </div>
                            {bestPrice?.amount && <span className="text-[14px] font-bold text-blue-600">{formatPKR(bestPrice.amount) || `${bestPrice.currency} ${parseFloat(bestPrice.amount).toFixed(2)}`}</span>}
                          </div>
                          {isSelected && mod.pricing && mod.pricing.length > 1 && (
                            <div className="mt-2 pt-2 border-t border-blue-100 space-y-1">
                              {mod.pricing.map((p, pi) => (
                                <div key={pi} className="flex items-center justify-between text-[12px]">
                                  <span className="text-gray-500">{p.paxType === 'ADULT' ? 'Adult' : p.paxType === 'CHILD' ? 'Child' : p.paxType || 'Per person'}</span>
                                  <span className="font-medium text-gray-700">{formatPKR(p.amount) || `${p.currency} ${parseFloat(p.amount || 0).toFixed(2)}`}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                );
              })()}

              {/* Step 2: Select Time */}
              {selectedActivity.scheduling?.opened && selectedActivity.scheduling.opened.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">2. Select Time</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedActivity.scheduling.opened.map((slot, i) => {
                      const isSelected = selectedTime === slot.openingTime;
                      return (
                        <div key={i} onClick={() => setSelectedTime(slot.openingTime)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                          <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                          <span className="text-[12px] font-medium">{slot.openingTime} – {slot.closeTime}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Booking Summary */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-2">Booking Summary</div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-gray-500">Package</span>
                    {selectedModality ? <span className="font-medium text-gray-800">{selectedModality.name}</span> : <span className="text-amber-500">Please select</span>}
                  </div>
                  {selectedActivity.scheduling?.opened?.length > 0 && (
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-gray-500">Time</span>
                      {selectedTime ? <span className="font-medium text-gray-800">{selectedTime}</span> : <span className="text-amber-500">Please select</span>}
                    </div>
                  )}
                  {selectedModality?.duration && (
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-gray-500">Duration</span>
                      <span className="text-gray-700">{selectedModality.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-800">{new Date(selectedDate).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-gray-500">Guests</span>
                    <span className="text-gray-700">{adults} adults</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-blue-100">
                    <span className="text-[13px] font-medium text-gray-700">Total</span>
                    <span className="text-lg font-bold text-blue-600">
                      {(() => {
                        const amt = selectedModality?.pricing?.[0]?.amount || selectedActivity.pricing?.amount || 0;
                        return formatPKR(amt) || `${selectedModality?.pricing?.[0]?.currency || selectedActivity.pricing?.currency || 'EUR'} ${parseFloat(amt).toFixed(2)}`;
                      })()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleAddActivityToCart(selectedActivity, selectedModality, selectedModality?.pricing?.[0], selectedTime)}
                  disabled={!selectedModality || (selectedActivity.scheduling?.opened?.length > 0 && !selectedTime)}
                  className={`w-full py-2.5 rounded-lg font-semibold text-[13px] inline-flex items-center justify-center gap-1.5 transition-colors ${!selectedModality || (selectedActivity.scheduling?.opened?.length > 0 && !selectedTime) ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  <ShoppingCart className="w-4 h-4" />Add to Cart
                </button>
                {(!selectedModality || (selectedActivity.scheduling?.opened?.length > 0 && !selectedTime)) && (
                  <p className="text-[11px] text-amber-500 text-center mt-1.5">Select {!selectedModality ? 'a package' : 'a time'} to continue</p>
                )}
              </div>

              {/* Duration info */}
              {selectedActivity.scheduling?.duration?.value && !selectedActivity.scheduling?.opened?.length && (
                <div className="text-[13px] text-gray-600">Duration: {selectedActivity.scheduling.duration.value} {(selectedActivity.scheduling.duration.metric || 'HOURS').toLowerCase()}</div>
              )}

              {selectedActivity.summary && (
                <div><div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Summary</div><p className="text-[13px] text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedActivity.summary }} /></div>
              )}
              {selectedActivity.description && (
                <div><div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</div><p className="text-[13px] text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedActivity.description }} /></div>
              )}

              {/* What's included/excluded */}
              {activityDetail?.fullDescription && activityDetail.fullDescription.length > 0 && (
                <div>
                  {activityDetail.fullDescription.map((group, gi) => (
                    <div key={gi} className="mb-3">
                      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{group.title}</div>
                      {group.included.length > 0 && (
                        <ul className="space-y-0.5 mb-1">{group.included.map((item, ii) => <li key={ii} className="text-[12px] text-green-700 flex items-start gap-1"><span className="text-green-500 mt-0.5">✓</span>{item}</li>)}</ul>
                      )}
                      {group.excluded.length > 0 && (
                        <ul className="space-y-0.5">{group.excluded.map((item, ei) => <li key={ei} className="text-[12px] text-red-600 flex items-start gap-1"><span className="text-red-400 mt-0.5">✗</span>{item}</li>)}</ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Voucher */}
              {selectedActivity.voucherType && (
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Voucher</div>
                  <p className="text-[13px] text-gray-600">{selectedActivity.voucherType === 'PRINTED' ? 'Printed voucher required' : selectedActivity.voucherType === 'MOBILE' ? 'Mobile voucher accepted' : selectedActivity.voucherType}</p>
                </div>
              )}

              {/* Cancellation */}
              {activityDetail?.cancellationPolicies && activityDetail.cancellationPolicies.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Cancellation Policy</div>
                  {activityDetail.cancellationPolicies.map((cp, ci) => (
                    <p key={ci} className="text-[12px] text-gray-600">{cp.dateFrom ? `From ${cp.dateFrom}: ` : ''}{cp.amount ? `${cp.amount}%` : 'Free cancellation'}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Lightbox */}
      {galleryOpen && galleryImages.length > 0 && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
            <span className="text-white/70 text-sm">{galleryIndex + 1} / {galleryImages.length}</span>
            <button onClick={() => setGalleryOpen(false)} className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors"><X className="w-5 h-5 text-white" /></button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 relative min-h-0">
            <button onClick={() => setGalleryIndex(prev => prev > 0 ? prev - 1 : galleryImages.length - 1)} className="absolute left-2 sm:left-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"><ChevronLeft className="w-5 h-5 text-white" /></button>
            <img src={galleryImages[galleryIndex]} alt="" className="max-h-full max-w-full object-contain rounded-lg" onError={(e) => e.target.src = 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'} />
            <button onClick={() => setGalleryIndex(prev => prev < galleryImages.length - 1 ? prev + 1 : 0)} className="absolute right-2 sm:right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"><ChevronRight className="w-5 h-5 text-white" /></button>
          </div>
          <div className="flex-shrink-0 px-4 py-3 overflow-x-auto">
            <div className="flex gap-1.5 justify-center">
              {galleryImages.map((img, i) => (
                <button key={i} onClick={() => setGalleryIndex(i)} className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${i === galleryIndex ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className="fixed bottom-4 right-4 z-[200] bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />{notification.message}
        </div>
      )}
      <Footer />
    </>
  );
};

export default ActivitySearchResults;
