import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Calendar, Users, Filter, Star, Clock, Search, X, ChevronDown } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';

const ActivitySearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

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

  const filteredActivities = activities.filter(a => {
    if (nameSearch && !a.name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
    if (selectedCategories.length > 0 && !selectedCategories.includes(a.activityFactsheetType)) return false;
    if (selectedDaytimes.length > 0) {
      const times = getActivityDaytimes(a);
      if (!selectedDaytimes.some(d => times.has(d))) return false;
    }
    if (selectedRecommended.length > 0) {
      const recs = getActivityRecommended(a);
      if (!selectedRecommended.some(r => recs.has(r))) return false;
    }
    if (selectedSuppliers.length > 0 && !selectedSuppliers.includes(a.supplier)) return false;
    if (selectedVoucherTypes.length > 0 && !selectedVoucherTypes.includes(a.voucherType)) return false;
    if (selectedServices.length > 0) {
      const svcs = getActivityServices(a);
      if (!selectedServices.some(s => svcs.has(s))) return false;
    }
    const price = parseFloat(a.pricing?.amount || 0);
    if (priceMin && price < parseFloat(priceMin)) return false;
    if (priceMax && price > parseFloat(priceMax)) return false;
    return true;
  });

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
      <div className="pt-20 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Activities in {destination}</h1>
          <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{from} to {to}</span>
            <span className="flex items-center"><Users className="w-4 h-4 mr-1" />{adults} Adults</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button onClick={() => setShowFilters(!showFilters)} className="bg-white/70 backdrop-blur-sm text-gray-700 px-3 py-2 rounded-lg shadow-sm border border-gray-200/60 hover:bg-white/90 cursor-pointer flex items-center gap-2">
              <Filter className="w-4 h-4" /><span className="text-sm font-medium">Filters</span>
            </button>
          </div>

          {/* Sidebar Filters */}
          <div className={`fixed lg:sticky lg:top-16 inset-y-0 left-0 z-40 w-[300px] bg-white border-r border-gray-100 transform ${showFilters ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out lg:h-[calc(100vh-4rem)] lg:flex-shrink-0 pt-16 lg:pt-0`}>
            <div className="h-full overflow-y-auto overscroll-contain px-4 py-4 text-left" style={{scrollbarWidth:'thin',scrollbarColor:'#e5e7eb transparent'}}>
              {/* Mobile Close */}
              <div className="lg:hidden flex justify-between items-center pb-3 mb-3 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-900 tracking-wider uppercase">Filters</span>
                <button onClick={() => setShowFilters(false)} className="p-1 rounded hover:bg-gray-100 cursor-pointer"><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <div className="hidden lg:flex justify-between items-center pb-3 mb-1 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-900 tracking-wider uppercase">Filters</span>
                <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer">Reset all</button>
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
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{cat}</span>`n                          <span className="text-[11px] text-gray-400">{countCat(cat)}</span>
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
                        <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{time}</span>`n                          <span className="text-[11px] text-gray-400">{countDaytime(time)}</span>
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
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{rec}</span>`n                          <span className="text-[11px] text-gray-400">{countRec(rec)}</span>
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
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{sup}</span>`n                          <span className="text-[11px] text-gray-400">{countSupplier(sup)}</span>
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
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{vt}</span>`n                          <span className="text-[11px] text-gray-400">{countVoucher(vt)}</span>
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
                          <span className="text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors flex-1">{svc}</span>`n                          <span className="text-[11px] text-gray-400">{countService(svc)}</span>
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

          {/* Mobile overlay */}
          {showFilters && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setShowFilters(false)} />
          )}

          <div className="flex-1">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {filteredActivities.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600 mb-4">No activities found</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Search Again
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">{filteredActivities.length} activities found</p>
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.code}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/activity/${activity.code}?from=${from}&to=${to}&price=${activity.pricing?.amount || 0}&currency=${activity.pricing?.currency || 'AED'}&adults=${adults}`)}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative w-full md:w-64 h-48">
                        <img
                          src={activity.images?.[0] || 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'}
                          alt={activity.name}
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.src = 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg'}
                        />
                        {activity.images?.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            +{activity.images.length - 1} photos
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4">
                        <h3 className="text-xl font-semibold mb-2">{activity.name}</h3>
                        {activity.summary && (
                          <p className="text-gray-700 text-sm mb-2 italic line-clamp-1" dangerouslySetInnerHTML={{ __html: activity.summary }} />
                        )}
                        {activity.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2" dangerouslySetInnerHTML={{ __html: activity.description }} />
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          {activity.destination && (
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{activity.destination}</span>
                          )}
                          {activity.activityFactsheetType && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {activity.activityFactsheetType}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            {activity.pricing?.amount ? (
                              <>
                                <span className="text-2xl font-bold text-blue-600">
                                  {activity.pricing.currency} {parseFloat(activity.pricing.amount).toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 ml-2">per person</span>
                              </>
                            ) : (
                              <span className="text-gray-500">Price on request</span>
                            )}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/activity/${activity.code}?from=${from}&to=${to}&price=${activity.pricing?.amount || 0}&currency=${activity.pricing?.currency || 'AED'}&adults=${adults}`);
                            }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ActivitySearchResults;
