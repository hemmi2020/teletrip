import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HotelSearchForm from './components/HotelSearchForm';
import { useCart } from './components/CartSystem';
import { useCurrency } from './context/CurrencyContext';
import {
  MapPin, Calendar, Users, ArrowRight, AlertTriangle, SearchX, Car, Clock,
  Filter, ChevronDown, ChevronRight, X, ShoppingCart, CheckCircle, Plane,
  Briefcase, Shield, Info, ChevronLeft, Eye, Luggage
} from 'lucide-react';
import MobileFilters from './components/MobileFilters';

const TransferSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { formatPKR, convert } = useCurrency();

  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [searchInfo, setSearchInfo] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sortOption, setSortOption] = useState('price_asc');
  const [showModifySearch, setShowModifySearch] = useState(false);

  // Listen for Search tab press from BottomNavBar
  useEffect(() => {
    const handler = () => setShowModifySearch(s => !s);
    window.addEventListener('toggleModifySearch', handler);
    return () => window.removeEventListener('toggleModifySearch', handler);
  }, []);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modal booking fields
  const [flightCode, setFlightCode] = useState('');
  const [flightTime, setFlightTime] = useState('');
  const [returnFlightCode, setReturnFlightCode] = useState('');
  const [returnFlightTime, setReturnFlightTime] = useState('');

  // Filters
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [expandedSections, setExpandedSections] = useState({ type: true, category: true, price: true, capacity: true });

  // Gallery
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    const sr = sessionStorage.getItem('transferResults');
    const ss = sessionStorage.getItem('transferSearch');
    const se = sessionStorage.getItem('transferError');
    if (se) { setError(JSON.parse(se)); sessionStorage.removeItem('transferError'); }
    if (sr) { try { setResults(JSON.parse(sr)); } catch { setError({ message: 'Failed to load results.' }); } }
    // Prefer URL params over sessionStorage for searchInfo
    if (searchParams.get('from')) {
      setSearchInfo({
        pickupName: searchParams.get('from'),
        dropoffName: searchParams.get('to'),
        fromCode: searchParams.get('fromCode'),
        toCode: searchParams.get('toCode'),
        fromType: searchParams.get('fromType') || 'ATLAS',
        toType: searchParams.get('toType') || 'IATA',
        outbound: searchParams.get('date') ? `${searchParams.get('date')}T10:00:00` : null,
        inbound: searchParams.get('returnDate') ? `${searchParams.get('returnDate')}T10:00:00` : null,
        tripType: searchParams.get('tripType') || 'one_way',
        adults: parseInt(searchParams.get('adults') || '1'),
        children: parseInt(searchParams.get('children') || '0'),
        infants: parseInt(searchParams.get('infants') || '0'),
      });
    } else if (ss) {
      try { setSearchInfo(JSON.parse(ss)); } catch {}
    }
  }, [searchParams]);

  // Reset modal fields when transfer changes
  useEffect(() => { setFlightCode(''); setFlightTime(''); setReturnFlightCode(''); setReturnFlightTime(''); }, [selectedTransfer]);

  const transfers = results?.transfers || [];
  const hasSearched = results !== null || error !== null;
  const toggleSection = (s) => setExpandedSections(p => ({ ...p, [s]: !p[s] }));
  const toggleFilter = (arr, setArr, val) => setArr(p => p.includes(val) ? p.filter(v => v !== val) : [...p, val]);
  const clearFilters = () => { setSelectedTypes([]); setSelectedCategories([]); setPriceMin(''); setPriceMax(''); setMinCapacity(''); };

  const dynamicTypes = useMemo(() => { const m = {}; transfers.forEach(t => { const k = t.transferType || 'OTHER'; m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); }, [transfers]);
  const dynamicCategories = useMemo(() => { const m = {}; transfers.forEach(t => { const k = t.category || 'Standard'; m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); }, [transfers]);

  const priceBounds = useMemo(() => {
    if (!transfers.length) return { min: 0, max: 500 };
    const prices = transfers.map(t => parseFloat(t.price?.amount || 0)).filter(p => p > 0);
    if (!prices.length) return { min: 0, max: 500 };
    const minE = Math.floor(Math.min(...prices)), maxE = Math.ceil(Math.max(...prices));
    return { min: convert ? Math.floor(convert(minE) || minE) : minE, max: convert ? Math.ceil(convert(maxE) || maxE) : maxE };
  }, [transfers, convert]);

  const filteredTransfers = useMemo(() => transfers.filter(t => {
    if (selectedTypes.length && !selectedTypes.includes(t.transferType)) return false;
    if (selectedCategories.length && !selectedCategories.includes(t.category)) return false;
    const pkr = convert ? (convert(parseFloat(t.price?.amount || 0)) || parseFloat(t.price?.amount || 0)) : parseFloat(t.price?.amount || 0);
    if (priceMin && pkr < parseFloat(priceMin)) return false;
    if (priceMax && pkr > parseFloat(priceMax)) return false;
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

  const fmtDT = (dt) => { if (!dt) return ''; try { const d = new Date(dt); return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); } catch { return dt; } };
  const isAirportRoute = true; // Always show flight details for all transfers
  const isDeparture = searchInfo?.toType === 'IATA' || (!searchInfo?.fromType && !searchInfo?.toType);

  const handleAddToCart = (transfer) => {
    if (!searchInfo) return;
    addToCart({
      type: 'transfer', id: `transfer-${transfer.id}-${Date.now()}`,
      name: `${transfer.vehicle || 'Transfer'} - ${transfer.category || ''}`,
      hotelName: `${searchInfo.pickupName || searchInfo.fromCode} → ${searchInfo.dropoffName || searchInfo.toCode}`,
      rateKey: transfer.rateKey, transferType: transfer.transferType,
      vehicle: transfer.vehicle, category: transfer.category,
      price: parseFloat(transfer.price?.amount || 0), totalPrice: parseFloat(transfer.price?.amount || 0),
      currency: transfer.price?.currency || 'EUR',
      checkIn: searchInfo.outbound?.split('T')[0] || '', checkOut: searchInfo.inbound?.split('T')[0] || searchInfo.outbound?.split('T')[0] || '',
      from: searchInfo.pickupName || searchInfo.fromCode, to: searchInfo.dropoffName || searchInfo.toCode,
      fromCode: searchInfo.fromCode, toCode: searchInfo.toCode, fromType: searchInfo.fromType, toType: searchInfo.toType,
      adults: searchInfo.adults || 1, children: searchInfo.children || 0, infants: searchInfo.infants || 0,
      maxPaxCapacity: transfer.maxPaxCapacity, minPaxCapacity: transfer.minPaxCapacity,
      cancellationPolicies: transfer.cancellationPolicies || [],
      thumbnail: transfer.images?.[0] || '',
      location: `${searchInfo.pickupName || searchInfo.fromCode} → ${searchInfo.dropoffName || searchInfo.toCode}`,
      flightCode: flightCode || '', flightTime: flightTime || '',
      returnFlightCode: returnFlightCode || '', returnFlightTime: returnFlightTime || '',
      direction: transfer.direction, pickupInformation: transfer.pickupInformation,
      transferDetails: transfer.transferDetails || [], remarks: transfer.remarks || [],
      tripType: searchInfo.tripType || 'one_way',
      inbound: searchInfo.inbound || null,
      addedAt: new Date().toISOString(),
    });
    setSelectedTransfer(null);
    setNotification({ show: true, message: `${transfer.vehicle || 'Transfer'} added to cart!` });
    setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    window.dispatchEvent(new CustomEvent('openCart'));
  };

  return (
    <>
      <Header />
      {notification.show && (
        <div className="fixed top-20 right-4 z-[200] px-5 py-3 rounded-lg shadow-lg bg-green-500 text-white flex items-center gap-2 animate-slide-in">
          <CheckCircle className="w-4 h-4" /><span className="text-sm">{notification.message}</span>
          <button onClick={() => setNotification({ show: false, message: '' })}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="pt-12 sm:pt-16 min-h-screen bg-gray-50 flex">
        {/* Mobile overlay backdrop */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black/40 z-[120] lg:hidden" onClick={() => setShowMobileFilters(false)} />
        )}

        {/* Sidebar — desktop only */}
        <div className={`
          hidden lg:block
          lg:sticky lg:top-[120px] lg:self-start lg:h-[calc(100vh-120px)] lg:z-40
          ${(sidebarCollapsed || transfers.length === 0) ? 'lg:hidden' : 'lg:w-[300px]'}
        `}>
          <div className="filter-sidebar-inner h-full overflow-y-auto px-4 py-4" style={{scrollbarWidth:'thin'}}>
            <div className="flex items-center justify-between pb-3 mb-1 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-900 tracking-wider uppercase">Filters</span>
              <div className="flex items-center gap-2">
                <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer">Reset all</button>
                <button onClick={() => setSidebarCollapsed(true)} className="p-1 rounded hover:bg-gray-100 flex cursor-pointer"><ChevronLeft className="w-3.5 h-3.5 text-gray-400" /></button>
              </div>
            </div>
            {dynamicTypes.length > 0 && (<div className="py-3 border-b border-gray-50"><button onClick={() => toggleSection('type')} className="flex items-center justify-between w-full cursor-pointer"><span className="text-[13px] font-semibold text-gray-800">Transfer Type</span><ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.type ? 'rotate-180' : ''}`} /></button>{expandedSections.type && (<div className="mt-2 space-y-1.5">{dynamicTypes.map(([t, c]) => (<label key={t} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group"><input type="checkbox" checked={selectedTypes.includes(t)} onChange={() => toggleFilter(selectedTypes, setSelectedTypes, t)} className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 cursor-pointer" /><span className="text-[13px] text-gray-600 group-hover:text-gray-900 flex-1 text-left">{t}</span><span className="text-[11px] text-gray-400">{c}</span></label>))}</div>)}</div>)}
            {dynamicCategories.length > 0 && (<div className="py-3 border-b border-gray-50"><button onClick={() => toggleSection('category')} className="flex items-center justify-between w-full cursor-pointer"><span className="text-[13px] font-semibold text-gray-800">Vehicle Category</span><ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.category ? 'rotate-180' : ''}`} /></button>{expandedSections.category && (<div className="mt-2 space-y-1.5">{dynamicCategories.map(([cat, c]) => (<label key={cat} className="flex flex-row items-center justify-start gap-2.5 py-0.5 cursor-pointer group"><input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleFilter(selectedCategories, setSelectedCategories, cat)} className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 cursor-pointer" /><span className="text-[13px] text-gray-600 group-hover:text-gray-900 flex-1 text-left">{cat}</span><span className="text-[11px] text-gray-400">{c}</span></label>))}</div>)}</div>)}
            <div className="py-3 border-b border-gray-50"><button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full cursor-pointer"><span className="text-[13px] font-semibold text-gray-800">Price Range (PKR)</span><ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} /></button>{expandedSections.price && (<div className="mt-2 space-y-3"><div className="relative h-6 flex items-center"><div className="absolute left-0 right-0 h-1 bg-gray-200 rounded-full" /><div className="absolute h-1 bg-blue-500 rounded-full" style={{ left: `${((parseFloat(priceMin) || priceBounds.min) - priceBounds.min) / (priceBounds.max - priceBounds.min || 1) * 100}%`, right: `${100 - ((parseFloat(priceMax) || priceBounds.max) - priceBounds.min) / (priceBounds.max - priceBounds.min || 1) * 100}%` }} /><input type="range" min={priceBounds.min} max={priceBounds.max} value={parseFloat(priceMin) || priceBounds.min} onChange={(e) => { const v = parseFloat(e.target.value); setPriceMin(v >= (parseFloat(priceMax) || priceBounds.max) ? String((parseFloat(priceMax) || priceBounds.max) - 1) : String(v)); }} className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer" style={{ zIndex: 3 }} /><input type="range" min={priceBounds.min} max={priceBounds.max} value={parseFloat(priceMax) || priceBounds.max} onChange={(e) => { const v = parseFloat(e.target.value); setPriceMax(v <= (parseFloat(priceMin) || priceBounds.min) ? String((parseFloat(priceMin) || priceBounds.min) + 1) : String(v)); }} className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer" style={{ zIndex: 4 }} /></div><div className="flex items-center gap-2"><input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder={String(priceBounds.min)} className="w-full px-2.5 py-1.5 text-[13px] border border-gray-200 rounded-md outline-none" /><span className="text-gray-300 text-xs">–</span><input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder={String(priceBounds.max)} className="w-full px-2.5 py-1.5 text-[13px] border border-gray-200 rounded-md outline-none" /></div><div className="flex justify-between text-[10px] text-gray-400"><span>PKR {priceBounds.min.toLocaleString()}</span><span>PKR {priceBounds.max.toLocaleString()}</span></div></div>)}</div>
            <div className="py-3"><button onClick={() => toggleSection('capacity')} className="flex items-center justify-between w-full cursor-pointer"><span className="text-[13px] font-semibold text-gray-800">Min Passengers</span><ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expandedSections.capacity ? 'rotate-180' : ''}`} /></button>{expandedSections.capacity && (<div className="mt-2"><input type="number" min="1" max="50" value={minCapacity} onChange={(e) => setMinCapacity(e.target.value)} placeholder="Any" className="w-full px-2.5 py-1.5 text-[13px] border border-gray-200 rounded-md outline-none" /></div>)}</div>
          </div>
        </div>

        {sidebarCollapsed && (<button onClick={() => setSidebarCollapsed(false)} className="hidden lg:flex fixed top-20 left-2 z-50 items-center gap-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-[12px] text-gray-600 cursor-pointer"><Filter className="w-3.5 h-3.5" /><ChevronRight className="w-3 h-3" /></button>)}

        {/* Mobile Filter FAB */}
        <button
          onClick={() => setShowMobileFilters(true)}
          style={{
            position: 'fixed', bottom: 80, right: 16, zIndex: 115,
            alignItems: 'center', gap: 8,
            backgroundColor: '#2563eb', color: '#fff',
            padding: '10px 18px', borderRadius: 99,
            boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
            border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
          }}
          className="lg:hidden flex"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {(selectedTypes.length + selectedCategories.length + (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (minCapacity ? 1 : 0)) > 0 && (
            <span style={{
              backgroundColor: '#fff', color: '#2563eb', fontSize: 11,
              fontWeight: 700, borderRadius: 99, width: 20, height: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {selectedTypes.length + selectedCategories.length + (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (minCapacity ? 1 : 0)}
            </span>
          )}
        </button>

        {/* Mobile Filters Sheet */}
        <MobileFilters
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          onReset={clearFilters}
          activeCount={selectedTypes.length + selectedCategories.length + (priceMin ? 1 : 0) + (priceMax ? 1 : 0) + (minCapacity ? 1 : 0)}
          sections={[
            ...(dynamicTypes.length > 0 ? [{
              key: 'type', label: 'Transfer Type', type: 'checkbox',
              value: selectedTypes, onChange: setSelectedTypes,
              options: dynamicTypes.map(([t, c]) => ({ value: t, label: t, count: c })),
            }] : []),
            ...(dynamicCategories.length > 0 ? [{
              key: 'category', label: 'Vehicle Category', type: 'checkbox',
              value: selectedCategories, onChange: setSelectedCategories,
              options: dynamicCategories.map(([cat, c]) => ({ value: cat, label: cat, count: c })),
            }] : []),
            {
              key: 'price', label: 'Price Range (PKR)', type: 'range',
              valueMin: priceMin, onChangeMin: setPriceMin,
              valueMax: priceMax, onChangeMax: setPriceMax,
              placeholderMin: String(priceBounds.min),
              placeholderMax: String(priceBounds.max),
            },
            {
              key: 'capacity', label: 'Min Passengers', type: 'search',
              placeholder: 'Any',
              value: minCapacity, onChange: setMinCapacity,
            },
          ]}
        />

        {/* Main content — boxed */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Sticky sort bar — outside padded content */}
          <div className="sticky top-12 sm:top-16 z-[99] bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
          <div className="max-w-[1280px] mx-auto px-3 py-2 flex items-center gap-2">
            {/* Route summary — mobile compact, desktop full */}
            <div className="flex-1 min-w-0 hidden md:flex items-center gap-2 text-[13px] text-gray-600">
              {searchInfo && (<>
                {searchInfo.tripType === 'round_trip' ? (
                  <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Round Trip</span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">One Way</span>
                )}
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-medium">{searchInfo.pickupName || searchInfo.fromCode}</span>
                <ArrowRight className="w-3 h-3 text-gray-300" />
                <span className="font-medium">{searchInfo.dropoffName || searchInfo.toCode}</span>
                <span className="text-gray-300 mx-1">|</span>
                <Calendar className="w-3.5 h-3.5" /><span>{fmtDT(searchInfo.outbound)}</span>
                {searchInfo.inbound && <><ArrowRight className="w-3 h-3 text-gray-300" /><span>{fmtDT(searchInfo.inbound)}</span></>}
                <span className="text-gray-300 mx-1">|</span>
                <Users className="w-3.5 h-3.5" /><span>{searchInfo.adults || 1} Adult{(searchInfo.adults || 1) > 1 ? 's' : ''}</span>
              </>)}
            </div>
            {/* Mobile: count */}
            <span className="text-[12px] font-semibold text-gray-700 md:hidden flex-1 min-w-0 truncate">
              {filteredTransfers.length} Transfers
            </span>
            <span className="text-[12px] text-gray-400 hidden md:block">{filteredTransfers.length} of {transfers.length}</span>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="text-[12px] border border-gray-200 rounded-lg px-2 py-1 bg-white cursor-pointer outline-none flex-shrink-0 max-w-[110px] sm:max-w-none">
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="capacity">Capacity</option>
            </select>
            <button onClick={() => setShowModifySearch(!showModifySearch)} className="text-[12px] text-blue-600 font-medium cursor-pointer flex-shrink-0 px-2 py-1 rounded-lg border border-blue-200 bg-blue-50">{showModifySearch ? 'Close' : 'Modify'}</button>
          </div>
          {/* Expandable Modify Search */}
          {showModifySearch && (
            <div className="max-w-[1280px] mx-auto px-4 pb-4 pt-3 border-t border-gray-100 bg-white">
              <HotelSearchForm defaultTab="transfers" variant="light" />
            </div>
          )}
        </div>

        <div className="max-w-[1280px] mx-auto px-4 py-4">
          {/* Error / Empty / No search states */}
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
              <button onClick={() => navigate('/home')} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium cursor-pointer">Search Again</button>
            </div>
          )}
          {!hasSearched && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
              <Car className="w-10 h-10 text-blue-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Search for Transfers</h3>
              <p className="text-gray-500 text-sm mb-5">Use the search form on the home page to find available transfers.</p>
              <button onClick={() => navigate('/home')} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium cursor-pointer">Go to Search</button>
            </div>
          )}

          {/* Cards */}
          {!error && transfers.length > 0 && (
            <div className="space-y-3">
              {filteredTransfers.length === 0 && (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                  <p className="text-gray-500 text-sm">No transfers match your filters.</p>
                  <button onClick={clearFilters} className="mt-3 text-blue-600 text-sm font-medium cursor-pointer">Clear Filters</button>
                </div>
              )}
              {sortedTransfers.map((t, idx) => {
                    const price = parseFloat(t.price?.amount || 0);
                    const pkrPrice = formatPKR(price);
                    const typeLabel = t.transferType === 'PRIVATE' ? 'Private' : t.transferType === 'SHARED' ? 'Shared' : t.transferType || 'Transfer';
                    const details = t.transferDetails || [];
                    const luggageInfo = details.find(d => /luggage|suitcase|bag/i.test(d.name || d.description || ''));
                    const durationInfo = details.find(d => /duration|journey|time|min/i.test(d.name || d.description || ''));

                    return (
                      <div key={idx} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-200 flex flex-col sm:flex-row group">
                        {/* Image */}
                        <div className="sm:w-48 lg:w-56 relative overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-50 to-blue-100 h-36 sm:h-auto">
                          {t.images?.[0] ? (
                            <img src={t.images[0]} alt={t.vehicle} className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Car className="w-10 h-10 text-blue-200" /></div>
                          )}
                          <span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded font-medium ${t.transferType === 'PRIVATE' ? 'bg-blue-600/90 text-white' : 'bg-amber-500/90 text-white'}`}>{typeLabel}</span>
                        </div>
                        {/* Content */}
                        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-1.5">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-[14px] font-semibold text-gray-900 leading-tight">{t.vehicle || 'Transfer Vehicle'}</h3>
                                <p className="text-[12px] text-gray-500">{t.category || 'Standard'}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-base font-bold text-blue-600 leading-tight">{pkrPrice || '...'}</div>
                                <div className="text-[10px] text-gray-400">total</div>
                              </div>
                            </div>
                            {searchInfo && (
                              <div className="flex items-center text-gray-400 text-[11px] mb-1.5">
                                <MapPin className="w-3 h-3 mr-0.5 flex-shrink-0" />
                                <span className="truncate">{searchInfo.pickupName || searchInfo.fromCode} → {searchInfo.dropoffName || searchInfo.toCode}</span>
                              </div>
                            )}
                            <div className="flex gap-1 flex-wrap">
                              <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">{t.minPaxCapacity || 1}–{t.maxPaxCapacity || '?'} pax</span>
                              {durationInfo && <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded">{durationInfo.name || durationInfo.description}</span>}
                              {t.cancellationPolicies?.length > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${t.cancellationPolicies[0]?.amount === 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                  {t.cancellationPolicies[0]?.amount === 0 ? 'Free cancel' : 'Cancel fee'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-end mt-2 pt-2 border-t border-gray-50">
                            <button onClick={() => setSelectedTransfer(t)} className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-[13px] font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer">
                              <Eye className="w-3.5 h-3.5" /> View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>
          )}
          </div>
        </div>
      {selectedTransfer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center" onClick={() => setSelectedTransfer(null)}>
          <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[92vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>

            {/* ── Sticky Header ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] font-bold text-gray-900 truncate">{selectedTransfer.vehicle || 'Transfer'}</h2>
                <p className="text-[12px] text-gray-500">{selectedTransfer.category} · {selectedTransfer.transferType}</p>
              </div>
              <button onClick={() => setSelectedTransfer(null)} className="ml-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 cursor-pointer"><X className="w-4 h-4 text-gray-600" /></button>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{scrollbarWidth:'thin'}}>

              {/* Route */}
              {searchInfo && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] text-blue-600 font-semibold">Transfer Route</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${searchInfo.tripType === 'round_trip' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {searchInfo.tripType === 'round_trip' ? 'Round Trip' : 'One Way'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-[13px] text-gray-800 font-medium mb-1.5">
                    <span className="flex-1 min-w-0">{searchInfo.pickupName || searchInfo.fromCode}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="flex-1 min-w-0 text-right">{searchInfo.dropoffName || searchInfo.toCode}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 space-y-0.5">
                    <div>Outbound: {fmtDT(searchInfo.outbound)}</div>
                    {searchInfo.inbound && <div>Return: {fmtDT(searchInfo.inbound)}</div>}
                    <div>{searchInfo.adults || 1} Adult{(searchInfo.adults || 1) > 1 ? 's' : ''}{searchInfo.children > 0 ? `, ${searchInfo.children} Children` : ''}</div>
                  </div>
                </div>
              )}

              {/* Stats — 2x2 grid on mobile */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div><div className="text-[13px] font-semibold text-gray-800">{selectedTransfer.minPaxCapacity || 1}–{selectedTransfer.maxPaxCapacity || '?'}</div><div className="text-[10px] text-gray-400">Passengers</div></div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                  <Car className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div><div className="text-[13px] font-semibold text-gray-800">{selectedTransfer.transferType}</div><div className="text-[10px] text-gray-400">Type</div></div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <div><div className="text-[13px] font-semibold text-gray-800">{selectedTransfer.cancellationPolicies?.[0]?.amount === 0 ? 'Free' : 'Fee'}</div><div className="text-[10px] text-gray-400">Cancellation</div></div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div><div className="text-[13px] font-semibold text-gray-800">{selectedTransfer.direction || 'ONE WAY'}</div><div className="text-[10px] text-gray-400">Direction</div></div>
                </div>
              </div>

              {/* Service Details */}
              {selectedTransfer.transferDetails?.length > 0 && (
                <div>
                  <h4 className="text-[13px] font-semibold text-gray-800 mb-2">Service Details</h4>
                  <div className="space-y-1.5">
                    {selectedTransfer.transferDetails.map((d, i) => (
                      <div key={i} className="flex items-start gap-2 text-[12px]">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
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
                        <Info className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${r.mandatory ? 'text-red-400' : 'text-gray-400'}`} />
                        <span>{r.description}{r.mandatory && <span className="text-[10px] ml-1 text-red-400">(required)</span>}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancellation Policy */}
              {selectedTransfer.cancellationPolicies?.length > 0 && (
                <div>
                  <h4 className="text-[13px] font-semibold text-gray-800 mb-2">Cancellation Policy</h4>
                  <div className="space-y-1.5">
                    {selectedTransfer.cancellationPolicies.map((p, i) => (
                      <div key={i} className="text-[12px] text-gray-600 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${parseFloat(p.amount) === 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-medium">{parseFloat(p.amount) === 0 ? 'Free cancellation' : `${formatPKR(parseFloat(p.amount)) || '...'} fee`}</span>
                        {(p.from || p.dateFrom) && <span className="text-gray-400 text-[11px]">from {new Date(p.from || p.dateFrom).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Flight Details */}
              {isAirportRoute && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-3">
                  <div className="flex items-start gap-2">
                    <Plane className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-[13px] font-semibold text-amber-800">Flight Details Required</h4>
                      <p className="text-[11px] text-amber-700 mt-0.5">Required to confirm your transfer. Inaccurate info may result in cancellation fees.</p>
                    </div>
                  </div>
                  {/* Outbound */}
                  <div className="border-t border-amber-200 pt-3">
                    <p className="text-[11px] font-semibold text-gray-700 mb-2">{searchInfo?.pickupName || searchInfo?.fromCode} → {searchInfo?.dropoffName || searchInfo?.toCode}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-gray-700 mb-1">Flight Code *</label>
                        <input type="text" value={flightCode} onChange={(e) => setFlightCode(e.target.value.toUpperCase().slice(0, 7))} placeholder="e.g. EK203" maxLength={7} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-gray-700 mb-1">{isDeparture ? 'Departure' : 'Arrival'} Time *</label>
                        <input type="time" value={flightTime} onChange={(e) => setFlightTime(e.target.value)} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                  </div>
                  {/* Return */}
                  {searchInfo?.tripType === 'round_trip' && (
                    <div className="border-t border-amber-200 pt-3">
                      <p className="text-[11px] font-semibold text-gray-700 mb-2">{searchInfo?.dropoffName || searchInfo?.toCode} → {searchInfo?.pickupName || searchInfo?.fromCode}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-medium text-gray-700 mb-1">Flight Code *</label>
                          <input type="text" value={returnFlightCode} onChange={(e) => setReturnFlightCode(e.target.value.toUpperCase().slice(0, 7))} placeholder="e.g. EK204" maxLength={7} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-gray-700 mb-1">Departure Time *</label>
                          <input type="time" value={returnFlightTime} onChange={(e) => setReturnFlightTime(e.target.value)} className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Sticky Footer: Price + Add to Cart ── */}
            <div className="flex-shrink-0 border-t border-gray-100 px-4 py-3 bg-white flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] text-gray-400">Total price</div>
                <div className="text-[18px] font-bold text-blue-600 leading-tight">{formatPKR(parseFloat(selectedTransfer.price?.amount || 0)) || '...'}</div>
              </div>
              <button
                onClick={() => handleAddToCart(selectedTransfer)}
                disabled={!flightCode.trim() || !flightTime || (searchInfo?.tripType === 'round_trip' && (!returnFlightCode.trim() || !returnFlightTime))}
                className="flex-1 max-w-[200px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-[14px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery */}
      {galleryOpen && galleryImages.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center" onClick={() => setGalleryOpen(false)}>
          <button onClick={() => setGalleryOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white z-10 cursor-pointer"><X className="w-8 h-8" /></button>
          <button onClick={(e) => { e.stopPropagation(); setGalleryIndex(i => (i - 1 + galleryImages.length) % galleryImages.length); }} className="absolute left-4 text-white/70 hover:text-white z-10 cursor-pointer"><ChevronLeft className="w-10 h-10" /></button>
          <img src={galleryImages[galleryIndex]} alt="" className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); setGalleryIndex(i => (i + 1) % galleryImages.length); }} className="absolute right-4 text-white/70 hover:text-white z-10 cursor-pointer"><ChevronRight className="w-10 h-10" /></button>
          <div className="absolute bottom-4 text-white/60 text-sm">{galleryIndex + 1} / {galleryImages.length}</div>
        </div>
      )}

      </div>

      <Footer />
    </>
  );
};

export default TransferSearch;
