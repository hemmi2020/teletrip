import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Filter, ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_BASE = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000') + '/api';

const PLACEHOLDER_GRADIENT = 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)';

/**
 * Truncates a description string to a maximum length, appending ellipsis if needed.
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum character length (default 120)
 * @returns {string} Truncated text with ellipsis, or original text if within limit
 */
export function truncateDescription(text, maxLength = 120) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

const DestinationCard = ({ destination, onClick }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {destination.image && !imgError ? (
          <img
            src={destination.image}
            alt={`${destination.name}, ${destination.country}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full" style={{ background: PLACEHOLDER_GRADIENT }} />
        )}
        {destination.tag && (
          <div className="absolute top-3 left-3">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)',
                letterSpacing: '0.1em',
              }}
            >
              {destination.tag}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className="text-gray-900 font-bold text-base mb-0.5"
          style={{ letterSpacing: '-0.02em' }}
        >
          {destination.name}
        </h3>
        <p className="text-gray-500 text-xs flex items-center gap-1 mb-2">
          <MapPin className="w-3 h-3" />
          {destination.country}
        </p>
        {destination.description && (
          <p className="text-gray-500 text-sm leading-relaxed">
            {truncateDescription(destination.description)}
          </p>
        )}
      </div>
    </div>
  );
};

const FeaturedCard = ({ destination, onClick }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer relative overflow-hidden rounded-2xl"
      style={{ aspectRatio: '4/5' }}
    >
      {destination.image && !imgError ? (
        <img
          src={destination.image}
          alt={`${destination.name}, ${destination.country}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full" style={{ background: PLACEHOLDER_GRADIENT }} />
      )}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }}
      />
      {destination.tag && (
        <div className="absolute top-3 left-3">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.25)',
              letterSpacing: '0.1em',
            }}
          >
            {destination.tag}
          </span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3
          className="text-white font-bold text-lg mb-1"
          style={{ letterSpacing: '-0.02em' }}
        >
          {destination.name}, {destination.country}
        </h3>
        {destination.description && (
          <p className="text-white/60 text-sm leading-relaxed">
            {truncateDescription(destination.description)}
          </p>
        )}
      </div>
    </div>
  );
};

const DestinationsListingPage = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/destinations`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.length) {
          setDestinations(data.data);
        } else {
          setDestinations([]);
        }
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Extract unique continents for the filter dropdown
  const continents = [...new Set(
    destinations
      .map((d) => d.continent)
      .filter((c) => c && c.trim() !== '')
  )].sort();

  // Filter destinations by selected continent
  const filteredDestinations = selectedContinent
    ? destinations.filter((d) => d.continent === selectedContinent)
    : destinations;

  // Separate featured and non-featured
  const featuredDestinations = filteredDestinations.filter((d) => d.isFeatured);
  const regularDestinations = filteredDestinations.filter((d) => !d.isFeatured);

  const handleCardClick = (dest) => {
    if (dest.slug) {
      navigate(`/destinations/${dest.slug}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <div className="pt-28 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading destinations...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <Helmet>
          <title>Destinations | Telitrip</title>
        </Helmet>
        <Header />
        <div className="pt-28 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-gray-400" />
            </div>
            <h1
              className="text-2xl font-bold text-gray-900 mb-2"
              style={{ letterSpacing: '-0.02em' }}
            >
              Failed to load destinations
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Please try again later.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Destinations | Telitrip</title>
        <meta
          name="description"
          content="Browse all travel destinations on Telitrip. Discover featured places and find your next adventure."
        />
      </Helmet>
      <Header />

      <div className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-blue-500" />
              <span
                className="text-[11px] font-semibold tracking-widest uppercase text-blue-500"
                style={{ letterSpacing: '0.14em' }}
              >
                Explore
              </span>
            </div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}
            >
              All Destinations
            </h1>
            <p
              className="text-gray-500 text-sm max-w-md"
              style={{ lineHeight: 1.7 }}
            >
              Discover amazing places around the world. Browse our curated collection of destinations.
            </p>
          </div>

          {/* Continent Filter */}
          {continents.length > 0 && (
            <div className="mb-8 flex items-center gap-3">
              <Filter className="w-4 h-4 text-gray-400" />
              <div className="relative">
                <select
                  value={selectedContinent}
                  onChange={(e) => setSelectedContinent(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-9 text-sm text-gray-700 hover:border-gray-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors cursor-pointer"
                >
                  <option value="">All Continents</option>
                  {continents.map((continent) => (
                    <option key={continent} value={continent}>
                      {continent}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Featured Section */}
          {featuredDestinations.length > 0 && (
            <section className="mb-12" data-testid="featured-section">
              <h2
                className="text-xl sm:text-2xl font-bold text-gray-900 mb-6"
                style={{ letterSpacing: '-0.02em' }}
              >
                Featured Destinations
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredDestinations.map((dest) => (
                  <FeaturedCard
                    key={dest._id}
                    destination={dest}
                    onClick={() => handleCardClick(dest)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Main Grid */}
          {regularDestinations.length > 0 && (
            <section data-testid="destinations-grid">
              {featuredDestinations.length > 0 && (
                <h2
                  className="text-xl sm:text-2xl font-bold text-gray-900 mb-6"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  All Destinations
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {regularDestinations.map((dest) => (
                  <DestinationCard
                    key={dest._id}
                    destination={dest}
                    onClick={() => handleCardClick(dest)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {filteredDestinations.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-gray-400" />
              </div>
              <h2
                className="text-xl font-bold text-gray-900 mb-2"
                style={{ letterSpacing: '-0.02em' }}
              >
                No destinations found
              </h2>
              <p className="text-gray-500 text-sm">
                {selectedContinent
                  ? `No destinations available in ${selectedContinent}. Try a different filter.`
                  : 'No destinations available at the moment.'}
              </p>
              {selectedContinent && (
                <button
                  onClick={() => setSelectedContinent('')}
                  className="mt-4 px-5 py-2 rounded-full text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
                  style={{ minHeight: 'unset' }}
                >
                  Clear Filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DestinationsListingPage;
