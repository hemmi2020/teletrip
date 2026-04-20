import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Search, ArrowLeft, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_BASE = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000') + '/api';

const PLACEHOLDER_GRADIENT = 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)';

const DestinationPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [heroError, setHeroError] = useState(false);
  const [galleryErrors, setGalleryErrors] = useState({});

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setDestination(null);
    setHeroError(false);
    setGalleryErrors({});

    fetch(`${API_BASE}/destinations/slug/${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setDestination(data.data);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const handleSearchHotels = () => {
    if (!destination) return;
    const params = new URLSearchParams({
      city: destination.name,
      country: destination.country,
    });
    navigate(`/hotel-search-results?${params.toString()}`);
  };

  const handleGalleryImageError = (index) => {
    setGalleryErrors((prev) => ({ ...prev, [index]: true }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <div className="pt-28 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading destination...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <div className="bg-white min-h-screen">
        <Helmet>
          <title>Destination Not Found | Telitrip</title>
        </Helmet>
        <Header />
        <div className="pt-28 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
              Destination not found
            </h1>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              The destination you're looking for doesn't exist or may have been removed.
            </p>
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              style={{ minHeight: 'unset' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Browse Destinations
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { name, country, heroImage, longDescription, highlights, gallery, seo, tag } = destination;

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>{seo?.metaTitle || `${name}, ${country} | Telitrip`}</title>
        {seo?.metaDescription && <meta name="description" content={seo.metaDescription} />}
        {seo?.metaTitle && <meta property="og:title" content={seo.metaTitle} />}
        {seo?.metaDescription && <meta property="og:description" content={seo.metaDescription} />}
        {seo?.ogImage && <meta property="og:image" content={seo.ogImage} />}
        <meta property="og:type" content="website" />
      </Helmet>
      <Header />

      {/* Hero Banner */}
      <section className="relative w-full" style={{ height: '50vh', minHeight: 320 }}>
        {heroImage && !heroError ? (
          <img
            src={heroImage}
            alt={`${name}, ${country}`}
            className="w-full h-full object-cover"
            onError={() => setHeroError(true)}
          />
        ) : (
          <div className="w-full h-full" style={{ background: PLACEHOLDER_GRADIENT }} />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 40%, transparent 70%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16">
          <div className="max-w-7xl mx-auto">
            {tag && (
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3"
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.25)',
                  letterSpacing: '0.1em',
                }}
              >
                {tag}
              </span>
            )}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1"
              style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}
            >
              {name}
            </h1>
            <p className="text-white/60 text-sm sm:text-base flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {country}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col md:flex-row gap-10 lg:gap-14">
          {/* Left Column — Content */}
          <div className="flex-1 min-w-0">
            {/* Long Description */}
            {longDescription && (
              <div className="mb-8">
                <h2
                  className="text-xl sm:text-2xl font-bold text-gray-900 mb-4"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  About {name}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {longDescription}
                </p>
              </div>
            )}

            {/* Highlights */}
            {highlights && highlights.length > 0 && (
              <div className="mb-8">
                <h2
                  className="text-xl sm:text-2xl font-bold text-gray-900 mb-4"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  Highlights
                </h2>
                <ul className="space-y-2.5">
                  {highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Star className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <span className="text-gray-700 text-sm sm:text-base">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Search Hotels CTA */}
            <div className="mt-8 p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
                Ready to visit {name}?
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Find the best hotel deals in {name}, {country}.
              </p>
              <button
                onClick={handleSearchHotels}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors active:scale-95"
                style={{ minHeight: 'unset' }}
              >
                <Search className="w-4 h-4" />
                Search Hotels
              </button>
            </div>
          </div>

          {/* Right Column — Gallery Sidebar (desktop) */}
          {gallery && gallery.length > 0 && (
            <div className="hidden md:block w-80 lg:w-96 flex-shrink-0">
              <h2
                className="text-xl font-bold text-gray-900 mb-4"
                style={{ letterSpacing: '-0.02em' }}
              >
                Gallery
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {gallery.map((img, i) => (
                  <div
                    key={i}
                    className="relative rounded-xl overflow-hidden"
                    style={{ aspectRatio: '1/1' }}
                  >
                    {galleryErrors[i] ? (
                      <div className="w-full h-full" style={{ background: PLACEHOLDER_GRADIENT }} />
                    ) : (
                      <img
                        src={img}
                        alt={`${name} gallery ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        onError={() => handleGalleryImageError(i)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Gallery — scrollable horizontal grid */}
        {gallery && gallery.length > 0 && (
          <div className="md:hidden mt-10">
            <h2
              className="text-xl font-bold text-gray-900 mb-4"
              style={{ letterSpacing: '-0.02em' }}
            >
              Gallery
            </h2>
            <div
              className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none' }}
            >
              {gallery.map((img, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[65vw] snap-start rounded-xl overflow-hidden"
                  style={{ aspectRatio: '4/3' }}
                >
                  {galleryErrors[i] ? (
                    <div className="w-full h-full" style={{ background: PLACEHOLDER_GRADIENT }} />
                  ) : (
                    <img
                      src={img}
                      alt={`${name} gallery ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleGalleryImageError(i)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default DestinationPage;
