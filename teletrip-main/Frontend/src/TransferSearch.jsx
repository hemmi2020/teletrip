import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TransferResults from './components/transfers/TransferResults';
import Header from './components/Header';
import Footer from './components/Footer';
import { MapPin, Calendar, Users, ArrowRight, AlertTriangle, SearchX, RefreshCw, Home } from 'lucide-react';

const TransferSearch = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInfo, setSearchInfo] = useState(null);

  useEffect(() => {
    const savedResults = sessionStorage.getItem('transferResults');
    const savedSearch = sessionStorage.getItem('transferSearch');
    const savedError = sessionStorage.getItem('transferError');

    if (savedError) {
      setError(JSON.parse(savedError));
      sessionStorage.removeItem('transferError');
    }
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (e) {
        setError({ message: 'Failed to load search results. Please search again.' });
      }
    }
    if (savedSearch) {
      try {
        setSearchInfo(JSON.parse(savedSearch));
      } catch (e) { /* ignore */ }
    }
  }, []);

  const handleSelectTransfer = (transfer) => {
    const searchParams = JSON.parse(sessionStorage.getItem('transferSearch') || '{}');
    const cartItem = {
      type: 'transfer',
      ...transfer,
      fromCode: searchParams.fromCode,
      toCode: searchParams.toCode,
      fromType: searchParams.fromType,
      toType: searchParams.toType,
      pickupDate: searchParams.outbound,
      pickupTime: new Date(searchParams.outbound).toTimeString().slice(0, 5),
      adults: searchParams.adults,
      children: searchParams.children,
      infants: searchParams.infants
    };
    navigate('/checkout', {
      state: { cartItems: [cartItem], totalAmount: transfer.price?.amount }
    });
  };

  const transferCount = results?.transfers?.length || 0;
  const hasSearched = results !== null || error !== null;

  const formatDateTime = (dt) => {
    if (!dt) return '';
    try {
      const d = new Date(dt);
      return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch { return dt; }
  };

  return (
    <>
      <Header />
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-[1280px] mx-auto px-4 py-6">

          {/* Search Summary Bar */}
          {searchInfo && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{searchInfo.fromCode}</span>
                  <span className="text-gray-300">({searchInfo.fromType})</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
                <div className="flex items-center gap-1.5 text-gray-700">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span className="font-medium">{searchInfo.toCode}</span>
                  <span className="text-gray-300">({searchInfo.toType})</span>
                </div>
                <span className="text-gray-200">|</span>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDateTime(searchInfo.outbound)}</span>
                </div>
                <span className="text-gray-200">|</span>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Users className="w-3.5 h-3.5" />
                  <span>{searchInfo.adults || 1} Adult{(searchInfo.adults || 1) > 1 ? 's' : ''}{searchInfo.children > 0 ? `, ${searchInfo.children} Child${searchInfo.children > 1 ? 'ren' : ''}` : ''}{searchInfo.infants > 0 ? `, ${searchInfo.infants} Infant${searchInfo.infants > 1 ? 's' : ''}` : ''}</span>
                </div>
                <div className="ml-auto">
                  <button onClick={() => navigate('/home')} className="text-blue-600 hover:text-blue-700 text-[13px] font-medium">Modify Search</button>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center mb-6">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transfer Search Failed</h3>
              <p className="text-gray-500 text-sm mb-1">{error.message || 'Something went wrong while searching for transfers.'}</p>
              {error.error && error.error !== error.message && (
                <p className="text-gray-400 text-xs mb-4">{error.error}</p>
              )}
              <div className="flex items-center justify-center gap-3 mt-5">
                <button onClick={() => { setError(null); navigate('/home'); }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                  <RefreshCw className="w-4 h-4" /> Try Again
                </button>
                <button onClick={() => navigate('/home')} className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  <Home className="w-4 h-4" /> Home
                </button>
              </div>
            </div>
          )}

          {/* No Results State */}
          {hasSearched && !error && transferCount === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchX className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transfers Available</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-2">No transfer services were found for this route. This can happen when:</p>
              <ul className="text-gray-400 text-[13px] max-w-sm mx-auto text-left list-disc list-inside space-y-1 mb-6">
                <li>The route between these locations is not serviced</li>
                <li>No vehicles are available for the selected date/time</li>
                <li>The pickup and dropoff are too close or too far apart</li>
              </ul>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => navigate('/home')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                  <RefreshCw className="w-4 h-4" /> Search Again
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {!error && transferCount > 0 && (
            <TransferResults
              results={results?.transfers || []}
              onSelect={handleSelectTransfer}
              loading={loading}
            />
          )}

          {/* No search yet */}
          {!hasSearched && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Search for Transfers</h3>
              <p className="text-gray-500 text-sm mb-5">Use the search form on the home page to find available transfers.</p>
              <button onClick={() => navigate('/home')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                <Home className="w-4 h-4" /> Go to Search
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TransferSearch;
