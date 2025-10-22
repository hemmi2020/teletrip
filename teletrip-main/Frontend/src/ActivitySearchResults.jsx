import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Calendar, Users, Filter, Star, Clock } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';

const ActivitySearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ priceRange: 'all', category: 'all' });

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

  const filteredActivities = activities.filter(a => {
    if (filters.priceRange !== 'all') {
      const price = parseFloat(a.pricing?.amount || 0);
      if (filters.priceRange === 'low' && price > 50) return false;
      if (filters.priceRange === 'mid' && (price <= 50 || price > 150)) return false;
      if (filters.priceRange === 'high' && price <= 150) return false;
    }
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
          <div className="w-64 hidden lg:block">
            <div className="bg-white rounded-lg shadow p-4 sticky top-24">
              <h3 className="font-semibold mb-4 flex items-center"><Filter className="w-4 h-4 mr-2" />Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="all">All Prices</option>
                    <option value="low">Under $50</option>
                    <option value="mid">$50 - $150</option>
                    <option value="high">Over $150</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

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
