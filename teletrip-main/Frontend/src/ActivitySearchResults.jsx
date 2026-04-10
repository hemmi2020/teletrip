import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Calendar, Users, Filter, Star, Clock, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    name: true,
    categories: true,
    daytime: false,
    recommended: false,
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
    setPriceMin('');
    setPriceMax('');
  };

  // Dynamic filter options from data
  const dynamicCategories = [...new Set(activities.map(a => a.activityFactsheetType).filter(Boolean))].sort();
  const dynamicDaytimes = [...new Set(activities.flatMap(a => {
    const times = [];
    const sched = a.scheduling;
    if (sched?.opened) times.push('Daytime');
    if (sched?.duration?.hours >= 4) times.push('Full Day');
    if (sched?.duration?.hours && sched.duration.hours < 4) times.push('Half Day');
    const name = (a.name || '').toLowerCase();
    if (name.includes('night') || name.includes('evening') || name.includes('sunset')) times.push('Night / Evening');
    if (name.includes('morning') || name.includes('sunrise')) times.push('Morning');
    return times.length > 0 ? times : ['Daytime'];
  }))].sort();
  const dynamicRecommended = [...new Set(activities.flatMap(a => {
    const groups = [];
    if (a.segmentationGroups && Array.isArray(a.segmentationGroups)) {
      a.segmentationGroups.forEach(g => {
        if (g.segments) g.segments.forEach(s => { if (s.name) groups.push(s.name); });
        if (g.name) groups.push(g.name);
      });
    }
    // Fallback: derive from name/description
    if (groups.length === 0) {
      const text = ((a.name || '') + ' ' + (a.summary || '')).toLowerCase();
      if (text.includes('family') || text.includes('kid')) groups.push('Families');
      if (text.includes('couple') || text.includes('romantic')) groups.push('Couples');
      if (text.includes('adventure') || text.includes('thrill')) groups.push('Adventure Seekers');
      if (text.includes('group') || text.includes('team')) groups.push('Groups');
    }
    return groups;
  }))].filter(Boolean).sort();

  // Derive daytime tag for a single activity (for filtering)
  const getActivityDaytimes = (activity) => {
    const times = new Set();
    const sched = activity.scheduling;
    if (sched?.opened) times.add('Daytime');
    if (sched?.duration?.hours >= 4) times.add('Full Day');
    if (sched?.duration?.hours && sched.duration.hours < 4) times.add('Half Day');
    const name = (activity.name || '').toLowerCase();
    if (name.includes('night') || name.includes('evening') || name.includes('sunset')) times.add('Night / Evening');
    if (name.includes('morning') || name.includes('sunrise')) times.add('Morning');
    if (times.size === 0) times.add('Daytime');
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
      if (text.includes('adventure') || text.includes('thrill')) groups.add('Adventure Seekers');
      if (text.includes('group') || text.includes('team')) groups.add('Groups');
    }
    return groups;
  };

  const filteredActivities = activities.filter(a => {
    // Name search
    if (nameSearch && !a.name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
    // Category
    if (selectedCategories.length > 0 && !selectedCategories.includes(a.activityFactsheetType)) return false;
    // Daytime
    if (selectedDaytimes.length > 0) {
      const times = getActivityDaytimes(a);
      if (!selectedDaytimes.some(d => times.has(d))) return false;
    }
    // Recommended
    if (selectedRecommended.length > 0) {
      const recs = getActivityRecommended(a);
      if (!selectedRecommended.some(r => recs.has(r))) return false;
    }
    // Price
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Sidebar Filters */}
          <div className={`fixed lg:relative inset-y-0 left-0 z-40 w-80 bg-white shadow-lg transform ${showFilters ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out pt-16 lg:pt-0 lg:w-72 lg:flex-shrink-0`}>
            <div className="p-4 h-full overflow-y-auto">
              {/* Mobile Close */}
              <div className="lg:hidden flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700 cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg hidden lg:block">Filters</h3>
                <button onClick={clearFilters} className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer">Clear all</button>
              </div>

              {/* 1. Search by Activity Name */}
              <div className="mb-5">
                <button onClick={() => toggleSection('name')} className="flex items-center justify-between w-full text-left font-semibold text-gray-800 mb-2 cursor-pointer">
                  <span className="font-bold text-sm">Activity Name</span>
                  {expandedSections.name ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSections.name && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={nameSearch}
                      onChange={(e) => setNameSearch(e.target.value)}
                      placeholder="Search activity..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* 2. Categories */}
              {dynamicCategories.length > 0 && (
                <div className="mb-5">
                  <button onClick={() => toggleSection('categories')} className="flex items-center justify-between w-full text-left font-semibold text-gray-800 mb-2 cursor-pointer">
                    <span className="font-bold text-sm">Categories</span>
                    {expandedSections.categories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedSections.categories && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {dynamicCategories.map(cat => (
                        <label key={cat} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{cat}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. Daytime */}
              {dynamicDaytimes.length > 0 && (
                <div className="mb-5">
                  <button onClick={() => toggleSection('daytime')} className="flex items-center justify-between w-full text-left font-semibold text-gray-800 mb-2 cursor-pointer">
                    <span className="font-bold text-sm">Daytime</span>
                    {expandedSections.daytime ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedSections.daytime && (
                    <div className="space-y-2">
                      {dynamicDaytimes.map(time => (
                        <label key={time} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedDaytimes.includes(time)}
                            onChange={() => setSelectedDaytimes(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time])}
                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{time}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Recommended Activity For */}
              {dynamicRecommended.length > 0 && (
                <div className="mb-5">
                  <button onClick={() => toggleSection('recommended')} className="flex items-center justify-between w-full text-left font-semibold text-gray-800 mb-2 cursor-pointer">
                    <span className="font-bold text-sm">Recommended For</span>
                    {expandedSections.recommended ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedSections.recommended && (
                    <div className="space-y-2">
                      {dynamicRecommended.map(rec => (
                        <label key={rec} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedRecommended.includes(rec)}
                            onChange={() => setSelectedRecommended(prev => prev.includes(rec) ? prev.filter(r => r !== rec) : [...prev, rec])}
                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{rec}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. Price Min & Max */}
              <div className="mb-5">
                <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full text-left font-semibold text-gray-800 mb-2 cursor-pointer">
                  <span className="font-bold text-sm">Price Range</span>
                  {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSections.price && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
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
