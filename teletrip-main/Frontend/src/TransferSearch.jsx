import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { useCart } from './components/CartSystem';
import { useCurrency } from './context/CurrencyContext';
import {
  MapPin, Calendar, Users, ArrowRight, AlertTriangle, SearchX, RefreshCw, Home,
  Filter, ChevronDown, ChevronRight, X, ShoppingCart, CheckCircle, Car, Clock,
  Briefcase, Shield, Info, ChevronLeft, Loader2, Eye
} from 'lucide-react';

const TransferSearch = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPKR, convert } = useCurrency();

  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [searchInfo, setSearchInfo] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sortOption, setSortOption] = useState('price_asc');

  // Filters
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    type: true, category: true, price: true, capacity: true
  });

  // Gallery
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    const savedResults = sessionStorage.getItem('transferResults');
    const savedSearch = sessionStorage.getItem('transferSearch');
    const savedError = sessionStorage.getItem('transferError');
    if (savedError) { setError(JSON.parse(savedError)); sessionStorage.removeItem('transferError'); }
    if (savedResults) { try { setResults(JSON.parse(savedResults)); } catch { setError({ message: 'Failed to load results.' }); } }
    if (savedSearch) { try { setSearchInfo(JSON.parse(savedSearch)); } catch {} }
  }, []);

  const transfers = results?.transfers || [];
  const hasSearched = results !== null || error !== null;

  const toggleSection = (s) => setExpandedSections(p => ({ ...p, [s]: !p[s] }));
  const toggleFilter = (arr, setArr, val) => setArr(p => p.includes(val) ? p.filter(v => v !== val) : [...p, val]);

  const clearFilters = () => {
    setSelectedTypes([]); setSelectedCategories([]); setPriceMin(''); setPriceMax(''); setMinCapacity('');
  };

  // Dynamic filter options
  const dynamicTypes = useMemo(() => {
    const map = {};
    transfers.forEach(t => { const k = t.transferType || 'OTHER'; map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [transfers]);

  const dynamicCategories = useMemo(() => {
    const map = {};
    transfers.forEach(t => { const k = t.category || 'Standard'; map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [transfers]);

  const priceBounds = useMemo(() => {
    if (!transfers.length) return { min: 0, max: 500 };
    const prices = transfers.map(t => parseFloat(t.price?.amount || 0)).filter(p => p > 0);
    if (!prices.length) return { min: 0, max: 500 };
    const minE = Math.floor(Math.min(...prices)), maxE = Math.ceil(Math.max(...prices));
    return { min: convert ? Math.floor(convert(minE) || minE) : minE, max: convert ? Math.ceil(convert(maxE) || maxE) : maxE };
  }, [transfers, convert]);

  // Filtered + sorted
  const filteredTransfers = useMemo(() => transfers.filter(t => {
    if (selectedTypes.length && !selectedTypes.includes(t.transferType)) return false;
    if (selectedCategories.length && !selectedCategories.includes(t.category)) return false;
    const pricePkr = convert ? (convert(parseFloat(t.price?.amount || 0)) || parseFloat(t.price?.amount || 0)) : parseFloat(t.price?.amount || 0);
    if (priceMin && pricePkr < parseFloat(priceMin)) return false;
    if (priceMax && pricePkr > parseFloat(priceMax)) return false;
    if (minCapacity && (t.maxPaxCapacity || 0) < parseInt(minCapacity)) return false;
    return true;
  }), [transfers, selectedTypes, selectedCategories, priceMin, priceMax, minCapacity, convert]);

  const sortedTransfers = useMemo(() => [...filteredTransfers].sort((a, b) => {
    const pa = parseFloat(a.price?.amount || 0), pb = parseFloat(b.price?.amount || 0);
    if (sortOption === 'price_asc') return pa - pb;
    if (sortOption === 'price_desc') return pb - pa;
    if (sortOption === 'capacity') return (b.maxPaxCapacity || 0) - (a.maxPaxCapacity || 0);
    return 0;
  }), [filteredTransfers, sortOption]);

  const formatDateTime = (dt) => {
    if (!dt) return '';
    try { const d = new Date(dt); return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); } catch { return dt; }
  };

  const handleAddToCart = (transfer) => {
    if (!searchInfo) return;
    addToCart({
      type: 'transfer',
      id: `transfer-${transfer.id}-${transfer.rateKey?.slice(0, 20)}`,
      name: `${transfer.vehicle || 'Transfer'} - ${transfer.category || ''}`,
      hotelName: `${searchInfo.pickupName || searchInfo.fromCode} → ${searchInfo.dropoffName || searchInfo.toCode}`,
      rateKey: transfer.rateKey,
      transferType: transfer.transferType,
      vehicle: transfer.vehicle,
      category: transfer.category,
      price: parseFloat(transfer.price?.amount || 0),
      totalPrice: parseFloat(transfer.price?.amount || 0),
      currency: transfer.price?.currency || 'EUR',
      checkIn: searchInfo.outbound?.split('T')[0] || '',
      checkOut: searchInfo.outbound?.split('T')[0] || '',
      from: searchInfo.pickupName || searchInfo.fromCode,
      to: searchInfo.dropoffName || searchInfo.toCode,
      fromCode: searchInfo.fromCode,
      toCode: searchInfo.toCode,
      fromType: searchInfo.fromType,
      toType: searchInfo.toType,
      adults: searchInfo.adults || 1,
      children: searchInfo.children || 0,
      infants: searchInfo.infants || 0,
      maxPaxCapacity: transfer.maxPaxCapacity,
      cancellationPolicies: transfer.cancellationPolicies || [],
      thumbnail: transfer.images?.[0] || '',
      location: `${searchInfo.pickupName || searchInfo.fromCode} → ${searchInfo.dropoffName || searchInfo.toCode}`,
      addedAt: new Date().toISOString(),
    });
    setSelectedTransfer(null);
    setNotification({ show: true, message: `${transfer.vehicle || 'Transfer'} added to cart!` });
    setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    window.dispatchEvent(new CustomEvent('openCart'));
  };

  const openGallery = (images, idx) => { setGalleryImages(images); setGalleryIndex(idx); setGalleryOpen(true); };


  // ─── RENDER ───
  return (
    <>
      <Header />
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-4 z-[200] px-5 py-3 rounded-lg shadow-lg bg-green-500 text-white flex items-center gap-2 animate-slide-in">
          <CheckCircle className="w-4 h-4" /><span className="text-sm">{notification.message}</span>
          <button onClick={() => setNotification({ show: false, message: '' })}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="pt-20 min-h-screen bg-gray-50">
        {/* Sticky Sort Bar */}
        <div className="sticky top-[64px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
          <div className="max-w-[1280px] mx-auto px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {searchInfo && (
                <div className="hidden md:flex items-center gap-2 text-[13px] text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-medium">{searchInfo.pickupName || searchInfo.fromCode}</span>
                  <ArrowRight className="w-3 h-3 text-gray-300" />
                  <span className="font-medium">{searchInfo.dropoffName || searchInfo.toCode}</span>
                  <span className="text-gray-300 mx-1">|</span>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDateTime(searchInfo.outbound)}</span>
                  <span className="text-gray-300 mx-1">|</span>
                  <Users className="w-3.5 h-3.5" />
                  <span>{searchInfo.adults || 1} Adult{(searchInfo.adults || 1) > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-gray-400">{filteredTransfers.length} of {transfers.length} transfers</span>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="text-[13px] border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer">
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="capacity">Capacity: Most</option>
              </select>
              <button onClick={() => navigate('/home')} className="text-[13px] text-blue-600 hover:text-blue-700 font-medium">Modify</button>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 py-5">
          {/* Error State */}
          {error && (
            <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center mb-6">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Transfer Search Failed</h3>
              <p className="text-gray-500 text-sm mb-4">{error.message}</p>
              <button onClick={() => navigate('/home')} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Try Again</button>
            </div>
          )}

          {/* No Results */}
          {hasSearched && !error && transfers.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
              <SearchX className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transfers Available</h3>
              <p className="text-gray-500 text-sm mb-1">No transfer services found for this route.</p>
              <ul className="text-gray-400 text-[13px] max-w-sm mx-auto text-left list-disc list-inside space-y-1 mb-5">
                <li>The route between these locations is not serviced</li>
                <li>No vehicles available for the selected date/time</li>
                <li>Try swapping pickup and dropoff locations</li>
              </ul>
              <button onClick={() => navigate('/home')} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Search Again</button>
            </div>
          )}

          {/* No search yet */}
          {!hasSearched && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
              <Car className="w-10 h-10 text-blue-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Search for Transfers</h3>
              <p className="text-gray-500 text-sm mb-5">Use the search form on the home page to find available transfers.</p>
              <button onClick={() => navigate('/home')} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Go to Search</button>
            </div>
          )}

          {/* Main Content: Sidebar + Cards */}
          {!error && transfers.length > 0 && (
            <div className="flex gap-5">
              {/* Sidebar Filters */}
              {!sidebarCollapsed && (
                <div className="hidden lg:block w-[260px] flex-shrink-0">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-[120px] max-h-[calc(100vh-140px)] overflow-y-auto" style={{scrollbarWidth:'thin'}}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[14px] font-semibold text-gray-900">Filters</h3>
                      <div className="flex items-center gap-2">
                        <button onClick={clearFilters} className="text-[11px] text-blue-600 hover:text-blue-700 cursor-pointer">Clear all</button>
                        <button onClick={() => setSidebarCollapsed(true)} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-4 h-4 text-gray-400" /></button>
                      </div>
                    </div>

                    {/* Transfer Type */}
                    {dynamicTypes.length > 0 && (
                      <div className="py-3 border-b border-gray-50">
                        <button onClick={() => toggleSection('type')} className="flex items-center justify-between w-full cursor-pointer">
                          <span className="text-[13px] font-semibold text-gray-800">Transfer Type</span>
                          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.type ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSections.type && (
                          <div className="mt-2 space-y-1">
                            {dynamicTypes.map(([type, count]) => (
                              <label key={type} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                                <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => toggleFilter(selectedTypes, setSelectedTypes, type)} className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 cursor-pointer" />
                                <span className="text-[12px] text-gray-700 flex-1">{type}</span>
                                <span className="text-[10px] text-gray-400">{count}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Category */}
                    {dynamicCategories.length > 0 && (
                      <div className="py-3 border-b border-gray-50">
                        <button onClick={() => toggleSection('category')} className="flex items-center justify-between w-full cursor-pointer">
                          <span className="text-[13px] font-semibold text-gray-800">Vehicle Category</span>
                          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.category ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSections.category && (
                          <div className="mt-2 space-y-1">
                            {dynamicCategories.map(([cat, count]) => (
                              <label key={cat} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                                <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleFilter(selectedCategories, setSelectedCategories, cat)} className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 cursor-pointer" />
                                <span className="text-[12px] text-gray-700 flex-1">{cat}</span>
                                <span className="text-[10px] text-gray-400">{count}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Price Range */}
                    <div className="py-3 border-b border-gray-50">
                      <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full cursor-pointer">
                        <span className="text-[13px] font-semibold text-gray-800">Price Range (PKR)</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSections.price && (
                        <div className="mt-2 space-y-3">
                          <div className="relative h-6 flex items-center">
                            <div className="absolute left-0 right-0 h-1 bg-gray-200 rounded-full" />
                            <div className="absolute h-1 bg-blue-500 rounded-full" style={{ left: `${((parseFloat(priceMin) || priceBounds.min) - priceBounds.min) / (priceBounds.max - priceBounds.min || 1) * 100}%`, right: `${100 - ((parseFloat(priceMax) || priceBounds.max) - priceBounds.min) / (priceBounds.max - priceBounds.min || 1) * 100}%` }} />
                            <input type="range" min={priceBounds.min} max={priceBounds.max} value={parseFloat(priceMin) || priceBounds.min} onChange={(e) => { const v = parseFloat(e.target.value); const mx = parseFloat(priceMax) || priceBounds.max; setPriceMin(v >= mx ? String(mx - 1) : String(v)); }} className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer" style={{ zIndex: 3 }} />
                            <input type="range" min={priceBounds.min} max={priceBounds.max} value={parseFloat(priceMax) || priceBounds.max} onChange={(e) => { const v = parseFloat(e.target.value); const mn = parseFloat(priceMin) || priceBounds.min; setPriceMax(v <= mn ? String(mn + 1) : String(v)); }} className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer" style={{ zIndex: 4 }} />
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder={String(priceBounds.min)} className="w-full px-2.5 py-1.5 text-[13px] border border-gray-200 rounded-md bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none" />
                            <span className="text-gray-300 text-xs">–</span>
                            <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder={String(priceBounds.max)} className="w-full px-2.5 py-1.5 text-[13px] border border-gray-200 rounded-md bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none" />
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-400">
                            <span>PKR {priceBounds.min.toLocaleString()}</span>
                            <span>PKR {priceBounds.max.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Min Capacity */}
                    <div className="py-3">
                      <button onClick={() => toggleSection('capacity')} className="flex items-center justify-between w-full cursor-pointer">
                        <span className="text-[13px] font-semibold text-gray-800">Min Passengers</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.capacity ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSections.capacity && (
                        <div className="mt-2">
                          <input type="number" min="1" max="50" value={minCapacity} onChange={(e) => setMinCapacity(e.target.value)} placeholder="Any" className="w-full px-2.5 py-1.5 text-[13px] border border-gray-200 rounded-md bg-gray-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sidebar Open Button */}
              {sidebarCollapsed && (
                <button onClick={() => setSidebarCollapsed(false)} className="hidden lg:flex fixed top-20 left-2 z-50 items-center gap-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-[12px] text-gray-600">
                  <Filter className="w-3.5 h-3.5" /><ChevronRight className="w-3 h-3" />
                </button>
              )}


              {/* Transfer Cards */}
              <div className="flex-1 min-w-0">
                {filteredTransfers.length === 0 && transfers.length > 0 && (
                  <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                    <p className="text-gray-500 text-sm">No transfers match your filters.</p>
                    <button onClick={clearFilters} className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-700">Clear Filters</button>
                  </div>
                )}

                <div className="space-y-3">
                  {sortedTransfers.map((transfer, idx) => {
                    const price = parseFloat(transfer.price?.amount || 0);
                    const pkrPrice = formatPKR(price);
                    const typeLabel = transfer.transferType === 'PRIVATE' ? 'Private' : transfer.transferType === 'SHARED' ? 'Shared' : transfer.transferType || 'Transfer';

                    return (
                      <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          {/* Image */}
                          <div className="sm:w-[180px] h-[140px] sm:h-auto flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
                            {transfer.images?.[0] ? (
                              <img src={transfer.images[0]} alt={transfer.vehicle} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Car className="w-12 h-12 text-blue-200" /></div>
                            )}
                            <span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-medium ${transfer.transferType === 'PRIVATE' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'}`}>{typeLabel}</span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                            <div>
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="text-[14px] font-semibold text-gray-900 leading-tight line-clamp-1">{transfer.vehicle || 'Transfer Vehicle'}</h3>
                                  <p className="text-[12px] text-gray-500 mt-0.5">{transfer.category || 'Standard'}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-lg font-bold text-blue-600 leading-tight">{pkrPrice || `${transfer.price?.currency} ${price.toFixed(0)}`}</div>
                                  <div className="text-[10px] text-gray-400">total</div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                <span className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full flex items-center gap-1"><Users className="w-3 h-3" /> {transfer.minPaxCapacity || 1}–{transfer.maxPaxCapacity || '?'} pax</span>
                                {transfer.direction && <span className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full">{transfer.direction}</span>}
                                {transfer.cancellationPolicies?.length > 0 && (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${transfer.cancellationPolicies[0]?.amount === 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                    {transfer.cancellationPolicies[0]?.amount === 0 ? 'Free cancellation' : 'Cancellation fee applies'}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 mt-3">
                              <button onClick={() => setSelectedTransfer(transfer)} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-[12px] font-medium cursor-pointer">
                                <Eye className="w-3.5 h-3.5" /> Details
                              </button>
                              <button onClick={() => setSelectedTransfer(transfer)} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-[12px] font-semibold cursor-pointer">
                                <ShoppingCart className="w-3.5 h-3.5" /> Book
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* ─── TRANSFER DETAIL MODAL ─── */}
      {selectedTransfer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center overflow-y-auto py-8" onClick={() => setSelectedTransfer(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedTransfer.vehicle || 'Transfer'}</h2>
                <p className="text-[12px] text-gray-500">{selectedTransfer.category} · {selectedTransfer.transferType}</p>
              </div>
              <button onClick={() => setSelectedTransfer(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            {/* Image Collage */}
            {selectedTransfer.images?.length > 0 && (
              <div className="relative h-[220px] overflow-hidden cursor-pointer" onClick={() => openGallery(selectedTransfer.images, 0)}>
                {selectedTransfer.images.length === 1 ? (
                  <img src={selectedTransfer.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="grid grid-cols-3 gap-1 h-full">
                    <div className="col-span-2"><img src={selectedTransfer.images[0]} alt="" className="w-full h-full object-cover" /></div>
                    <div className="flex flex-col gap-1">
                      {selectedTransfer.images.slice(1, 3).map((img, i) => (
                        <div key={i} className="flex-1 relative">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          {i === 1 && selectedTransfer.images.length > 3 && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-medium">+{selectedTransfer.images.length - 3}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Route Info */}
              {searchInfo && (
                <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="font-medium text-gray-700">{searchInfo.pickupName || searchInfo.fromCode}</span>
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                  <span className="font-medium text-gray-700">{searchInfo.dropoffName || searchInfo.toCode}</span>
                  <span className="text-gray-400 ml-auto text-[12px]">{formatDateTime(searchInfo.outbound)}</span>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <div className="text-[13px] font-semibold text-gray-900">{selectedTransfer.minPaxCapacity || 1}–{selectedTransfer.maxPaxCapacity || '?'}</div>
                  <div className="text-[10px] text-gray-400">Passengers</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Car className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <div className="text-[13px] font-semibold text-gray-900">{selectedTransfer.transferType}</div>
                  <div className="text-[10px] text-gray-400">Type</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Shield className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <div className="text-[13px] font-semibold text-gray-900">{selectedTransfer.cancellationPolicies?.[0]?.amount === 0 ? 'Free' : 'Fee'}</div>
                  <div className="text-[10px] text-gray-400">Cancellation</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Briefcase className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <div className="text-[13px] font-semibold text-gray-900">{selectedTransfer.direction || 'ONE WAY'}</div>
                  <div className="text-[10px] text-gray-400">Direction</div>
                </div>
              </div>

              {/* Transfer Details */}
              {selectedTransfer.transferDetails?.length > 0 && (
                <div>
                  <h4 className="text-[13px] font-semibold text-gray-800 mb-2">Details</h4>
                  <div className="space-y-1.5">
                    {selectedTransfer.transferDetails.map((d, i) => (
                      <div key={i} className="flex items-start gap-2 text-[12px]">
                        <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{d.description || d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {selectedTransfer.remarks?.length > 0 && (
                <div>
                  <h4 className="text-[13px] font-semibold text-gray-800 mb-2">Important Information</h4>
                  <div className="space-y-1.5">
                    {selectedTransfer.remarks.map((r, i) => (
                      <div key={i} className={`flex items-start gap-2 text-[12px] ${r.mandatory ? 'text-red-600' : 'text-gray-600'}`}>
                        <CheckCircle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${r.mandatory ? 'text-red-400' : 'text-gray-400'}`} />
                        <span>{r.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancellation Policy */}
              {selectedTransfer.cancellationPolicies?.length > 0 && (
                <div>
                  <h4 className="text-[13px] font-semibold text-gray-800 mb-2">Cancellation Policy</h4>
                  <div className="space-y-1">
                    {selectedTransfer.cancellationPolicies.map((p, i) => (
                      <div key={i} className="text-[12px] text-gray-600 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${parseFloat(p.amount) === 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                        {parseFloat(p.amount) === 0 ? 'Free cancellation' : `${p.currencyId || 'EUR'} ${p.amount} fee`}
                        {p.dateFrom && <span className="text-gray-400">from {new Date(p.dateFrom).toLocaleDateString()}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer - Price + Add to Cart */}
            <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-gray-400">Total price</div>
                <div className="text-xl font-bold text-blue-600">{formatPKR(parseFloat(selectedTransfer.price?.amount || 0)) || `${selectedTransfer.price?.currency} ${parseFloat(selectedTransfer.price?.amount || 0).toFixed(2)}`}</div>
                <div className="text-[10px] text-gray-400">{selectedTransfer.price?.currency} {parseFloat(selectedTransfer.price?.amount || 0).toFixed(2)} before conversion</div>
              </div>
              <button onClick={() => handleAddToCart(selectedTransfer)} className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-[14px] cursor-pointer">
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── GALLERY LIGHTBOX ─── */}
      {galleryOpen && galleryImages.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center" onClick={() => setGalleryOpen(false)}>
          <button onClick={() => setGalleryOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white z-10"><X className="w-8 h-8" /></button>
          <button onClick={(e) => { e.stopPropagation(); setGalleryIndex(i => (i - 1 + galleryImages.length) % galleryImages.length); }} className="absolute left-4 text-white/70 hover:text-white z-10"><ChevronLeft className="w-10 h-10" /></button>
          <img src={galleryImages[galleryIndex]} alt="" className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); setGalleryIndex(i => (i + 1) % galleryImages.length); }} className="absolute right-4 text-white/70 hover:text-white z-10"><ChevronRight className="w-10 h-10" /></button>
          <div className="absolute bottom-4 text-white/60 text-sm">{galleryIndex + 1} / {galleryImages.length}</div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default TransferSearch;
