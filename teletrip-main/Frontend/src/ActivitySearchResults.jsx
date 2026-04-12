import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Calendar, Users, Filter, Star, Clock, Search, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';

const ActivitySearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [sortOption, setSortOption] = useState('default');

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

  const destination = searchParams.get('destination');
  const country = searchParams.get('country');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const adults = searchParams.get('adults') || 2;

  const API_BASE_URL = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000') + '/api';

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
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
        if (data.success) {
          setActivities(data.data.activities || []);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (destination && from && to) fetchActivities();
  }, [destination, country, from, to, adults]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

  const filteredActivities = useMemo(() => activities.filter(a => {
    if (nameSearch && !a.name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
    if (selectedCategories.length > 0 && !selectedCategories.includes(a.activityFactsheetType)) return false;
    if (selectedDaytimes.length > 0) { const times = getActivityDaytimes(a); if (!selectedDaytimes.some(d => times.has(d))) return false; }
    if (selectedRecommended.length > 0) { const recs = getActivityRecommended(a); if (!selectedRecommended.some(r => recs.has(r))) return false; }
    if (selectedSuppliers.length > 0 && !selectedSuppliers.includes(a.supplier)) return false;
    if (selectedVoucherTypes.length > 0 && !selectedVoucherTypes.includes(a.voucherType)) return false;
    if (selectedServices.length > 0) { const svcs = getActivityServices(a); if (!selectedServices.some(s => svcs.has(s))) return false; }
    const price = parseFloat(a.pricing?.amount || 0);
    if (priceMin && price < parseFloat(priceMin)) return false;
    if (priceMax && price > parseFloat(priceMax)) return false;
    return true;
  }), [activities, nameSearch, selectedCategories, selectedDaytimes, selectedRecommended, selectedSuppliers, selectedVoucherTypes, selectedServices, priceMin, priceMax]);

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
      <div className="pt-16 flex">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden fixed top-32 left-4 z-50">
          <button onClick={() => setShowFilters(!showFilters)} className="bg-white/70 backdrop-blur-sm text-gray-700 p-2.5 rounded-lg shadow-sm border border-gray-200/60 hover:bg-white/90 cursor-pointer flex items-center gap-2">
            <Filter className="w-4 h-4" /><span className="text-sm font-medium">Filters</span>
          </button>
        </div>

        {/* Sidebar */}
        <div className={`fixed lg:sticky lg:top-16 inset-y-0 left-0 z-40 bg-white border-r border-gray-100 transform transition-all duration-300 ease-in-out lg:h-[calc(100vh-4rem)] pt-16 lg:pt-0 ${showFilters ? 'translate-x-0 w-[300px]' : '-translate-x-full w-[300px]'} ${sidebarCollapsed ? 'lg:w-0 lg:overflow-hidden lg:border-0' : 'lg:w-[300px] lg:translate-x-0'}`}>
          <div className="h-full overflow-y-auto overscroll-contain px-4 py-4 text-left" style={{scrollbarWidth:'thin',scrollbarColor:'#e5e7eb transparent'}}>
            <div className="lg:hidden flex justify-between items-center pb-3 mb-3 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-900 tracking-wider uppercase">Filters</span>
              <button onClick={() => setShowFilters(false)} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="hidden lg:flex justify-between items-center pb-3 mb-1 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-900 tracking-wider uppercase">Filters</span>
              <div className="flex items-center gap-2">
                <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Reset all</button>
                <button onClick={() => setSidebarCollapsed(true)} className="p-1 rounded hover:bg-gray-100"><ChevronLeft className="w-3.5 h-3.5 text-gray-400" /></button>
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
                        <label key={cat} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{cat}</span><span className="text-[11px] text-gray-400">{countCat(cat)}</span>
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
                      <label key={time} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedDaytimes.includes(time)}
                          onChange={() => setSelectedDaytimes(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time])}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{time}</span><span className="text-[11px] text-gray-400">{countDaytime(time)}</span>
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
                        <label key={rec} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedRecommended.includes(rec)}
                            onChange={() => setSelectedRecommended(prev => prev.includes(rec) ? prev.filter(r => r !== rec) : [...prev, rec])}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{rec}</span><span className="text-[11px] text-gray-400">{countRec(rec)}</span>
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
                        <label key={sup} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedSuppliers.includes(sup)}
                            onChange={() => setSelectedSuppliers(prev => prev.includes(sup) ? prev.filter(s => s !== sup) : [...prev, sup])}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{sup}</span><span className="text-[11px] text-gray-400">{countSupplier(sup)}</span>
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
                        <label key={vt} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedVoucherTypes.includes(vt)}
                            onChange={() => setSelectedVoucherTypes(prev => prev.includes(vt) ? prev.filter(v => v !== vt) : [...prev, vt])}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{vt}</span><span className="text-[11px] text-gray-400">{countVoucher(vt)}</span>
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
                        <label key={svc} className="flex items-center gap-2.5 py-0.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(svc)}
                            onChange={() => setSelectedServices(prev => prev.includes(svc) ? prev.filter(s => s !== svc) : [...prev, svc])}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{svc}</span><span className="text-[11px] text-gray-400">{countService(svc)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 8. Price Min & Max */}
              <div className="py-3 border-b border-gray-50">
                <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full cursor-pointer">
                  <span className="text-[13px] font-semibold text-gray-800">Price Range</span>
                  {expandedSections.price ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 rotate-180" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" />}
                </button>
                {expandedSections.price && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="Min"
                      className="w-full px-2.5 py-1.5 text-[13px] border border-gray-200 rounded-md bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <span className="text-gray-300 text-xs">�</span>
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder="Max"
                      className="w-full px-2.5 py-1.5 text-[13px] border border-gray-200 rounded-md bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Open Button */}
        {sidebarCollapsed && (
          <button onClick={() => setSidebarCollapsed(false)} className="hidden lg:flex fixed top-20 left-2 z-50 items-center gap-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-[12px] text-gray-600">
            <Filter className="w-3.5 h-3.5" /><ChevronRight className="w-3 h-3" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
            {error && (<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"><p className="text-red-800">{error}</p></div>)}

            <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-sm py-2.5 -mx-4 px-4 border-b border-gray-100 flex items-center justify-between gap-3 mb-2">
              <h1 className="text-[14px] sm:text-base font-semibold text-gray-900 truncate">{sortedActivities.length} Activities in {destination}</h1>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="text-[12px] sm:text-[13px] px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 focus:ring-1 focus:ring-blue-500 outline-none flex-shrink-0">
                <option value="default">Sort: Recommended</option>
                <option value="priceLow">Price: Low → High</option>
                <option value="priceHigh">Price: High → Low</option>
                <option value="name">Name: A → Z</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-400 py-2 flex-wrap mb-2">
              <span>{from} → {to}</span><span>·</span><span>{adults} adults</span>
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
                  <div key={activity.code} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-200 flex flex-col sm:flex-row group animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}>
                    <div className="sm:w-56 lg:w-64 relative overflow-hidden flex-shrink-0">
                      <img src={activity.images?.[0] || 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'} alt={activity.name} className="w-full h-40 sm:h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => e.target.src = 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'} />
                      {activity.activityFactsheetType && (<div className="absolute top-2 left-2 bg-blue-600/90 text-white px-2 py-0.5 rounded text-[10px] font-medium">{activity.activityFactsheetType}</div>)}
                    </div>
                    <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h3 className="text-[14px] font-semibold text-gray-900 line-clamp-1 leading-tight">{activity.name}</h3>
                          <div className="text-right flex-shrink-0">
                            {activity.pricing?.amount ? (<div className="text-lg font-bold text-blue-600 leading-tight">{activity.pricing.currency} {parseFloat(activity.pricing.amount).toFixed(0)}</div>) : <span className="text-[11px] text-gray-400">On request</span>}
                            <div className="text-[10px] text-gray-400">per person</div>
                          </div>
                        </div>
                        {activity.summary && <p className="text-[12px] text-gray-500 line-clamp-1 mb-1.5" dangerouslySetInnerHTML={{ __html: activity.summary }} />}
                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                          {activity.destination && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{activity.destination}</span>}
                        </div>
                      </div>
                      <div className="flex items-center justify-end mt-2 pt-2 border-t border-gray-50">
                        <button onClick={() => setSelectedActivity(activity)} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-[12px] font-medium">View Details</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showFilters && (<div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setShowFilters(false)} />)}
      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center" onClick={() => setSelectedActivity(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white w-full sm:max-w-3xl sm:rounded-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Image */}
            <div className="relative h-48 sm:h-56 flex-shrink-0">
              <img src={selectedActivity.images?.[0] || 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setSelectedActivity(null)} className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 rounded-full transition-colors"><X className="w-4 h-4 text-white" /></button>
              {selectedActivity.activityFactsheetType && (
                <div className="absolute bottom-3 left-3 bg-blue-600/90 text-white px-2.5 py-1 rounded-lg text-[12px] font-medium">{selectedActivity.activityFactsheetType}</div>
              )}
            </div>
            {/* Info */}
            <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{selectedActivity.name}</h2>
              <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-3">
                {selectedActivity.destination && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedActivity.destination}</span>}
                <span>·</span>
                <span>{from} → {to}</span>
                <span>·</span>
                <span>{adults} adults</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  {selectedActivity.pricing?.amount ? (
                    <><span className="text-xl font-bold text-blue-600">{selectedActivity.pricing.currency} {parseFloat(selectedActivity.pricing.amount).toFixed(2)}</span><span className="text-[12px] text-gray-400 ml-1">/ person</span></>
                  ) : <span className="text-gray-400">Price on request</span>}
                </div>
                <button onClick={() => navigate(`/activity/${selectedActivity.code}?from=${from}&to=${to}&price=${selectedActivity.pricing?.amount || 0}&currency=${selectedActivity.pricing?.currency || 'AED'}&adults=${adults}`)} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-[13px] font-semibold">Book Now</button>
              </div>
            </div>
            {/* Description */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4" style={{scrollbarWidth:'thin'}}>
              {selectedActivity.summary && (
                <div><div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Summary</div><p className="text-[13px] text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedActivity.summary }} /></div>
              )}
              {selectedActivity.description && (
                <div><div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</div><p className="text-[13px] text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedActivity.description }} /></div>
              )}
              {selectedActivity.images && selectedActivity.images.length > 1 && (
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Photos</div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedActivity.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-24 h-20 rounded-lg object-cover flex-shrink-0" onError={(e) => e.target.style.display='none'} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default ActivitySearchResults;
