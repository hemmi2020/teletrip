import React, { useState } from 'react';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Hotel, MapPin, Star, Search, RefreshCw, CheckCircle, XCircle, 
  BedDouble, ExternalLink, SlidersHorizontal, Eye, Building2, Crown
} from 'lucide-react';

export const FullWidthHotelsTable = ({
  hotels = [],
  loading = false,
  onRefresh,
  onToggleStatus,
  onSelectHotel,
  onManageRooms
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('all');

  const filteredHotels = hotels.filter(h => {
    const status = (h.status || 'active').toLowerCase();
    const stars = Number(h.stars || h.category || 0);

    if (filterTab === 'active' && status !== 'active') return false;
    if (filterTab === 'inactive' && status === 'active') return false;
    if (filterTab === 'luxury' && stars < 5 && !h.isLuxuryCollection) return false;
    if (filterTab === 'synced' && !h.hotelId && !h.code && !h.hotelbedsCode) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const name = (h.name || '').toLowerCase();
      const city = (h.location?.city || h.city || '').toLowerCase();
      const country = (h.location?.country || h.country || '').toLowerCase();
      const code = String(h.hotelId || h.code || h._id || '').toLowerCase();
      return name.includes(q) || city.includes(q) || country.includes(q) || code.includes(q);
    }
    return true;
  });

  return (
    <div className="w-full space-y-4">
      {/* Subtabs Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Inventory', count: hotels.length },
            { id: 'active', label: 'Active', count: hotels.filter(h => (h.status || 'active').toLowerCase() === 'active').length },
            { id: 'luxury', label: '5★ Luxury Collection', count: hotels.filter(h => Number(h.stars || 0) >= 5 || h.isLuxuryCollection).length },
            { id: 'synced', label: 'Bedsonline Connected', count: hotels.filter(h => h.hotelId || h.code || h.hotelbedsCode).length },
            { id: 'inactive', label: 'Inactive / Hidden', count: hotels.filter(h => (h.status || 'active').toLowerCase() !== 'active').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                filterTab === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search hotel name, city, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-8 px-2.5 text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Refresh inventory"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Main Full-Width Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-slate-50/90 sticky top-0 border-b border-slate-100">
              <TableRow>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Property & Location</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Category & Rating</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Room Inventory</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Pricing / Sync</TableHead>
                <TableHead className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Status</TableHead>
                <TableHead className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-xs font-medium">Loading hotel inventory...</p>
                  </TableCell>
                </TableRow>
              ) : filteredHotels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No properties found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search terms or filters</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredHotels.map((hotel) => {
                  const id = hotel._id || hotel.hotelId;
                  const stars = Number(hotel.stars || hotel.category || 4);
                  const isLuxury = stars >= 5 || hotel.isLuxuryCollection;
                  const isActive = (hotel.status || 'active').toLowerCase() === 'active';
                  const city = hotel.location?.city || hotel.city || 'Dubai';
                  const country = hotel.location?.country || hotel.country || 'UAE';
                  const rooms = hotel.rooms || [];
                  const thumb = hotel.thumbnail || hotel.images?.[0] || 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg';

                  return (
                    <TableRow key={id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Property & Location */}
                      <TableCell className="px-4 py-3.5">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <img
                            src={thumb}
                            alt={hotel.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200/80"
                            onError={(e) => {
                              e.target.src = 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg';
                            }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                                {hotel.name}
                              </span>
                              {isLuxury && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                                  <Crown className="w-2.5 h-2.5 text-amber-600" /> Luxe
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{city}, {country}</span>
                            </div>
                            {(hotel.code || hotel.hotelId) && (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Code: {hotel.code || hotel.hotelId}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Category & Rating */}
                      <TableCell className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-amber-400">
                            {[...Array(Math.min(5, Math.max(1, stars)))].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                            <span className="ml-1 text-[11px] font-bold text-slate-700">
                              {stars}★
                            </span>
                          </div>
                          {hotel.rating && (
                            <span className="text-[10px] font-semibold text-slate-500">
                              Score: {Number(hotel.rating).toFixed(1)}/10
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Room Inventory */}
                      <TableCell className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                            <BedDouble className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800">
                              {rooms.length} {rooms.length === 1 ? 'Room Type' : 'Room Types'}
                            </span>
                            {rooms.length > 0 && (
                              <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                {rooms[0].name || rooms[0].roomType || 'Standard'}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Pricing / Sync */}
                      <TableCell className="px-4 py-3.5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-900">
                            {hotel.currency || 'AED'} {Number(hotel.minRate || hotel.basePrice || hotel.price || 0).toLocaleString()}
                            <span className="text-[10px] text-slate-400 font-normal"> / night</span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                            <CheckCircle className="w-2.5 h-2.5 text-emerald-600" /> HBX Bedsonline
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-4 py-3.5 text-center whitespace-nowrap">
                        <Badge 
                          variant={isActive ? 'default' : 'secondary'}
                          className={`text-[10px] font-bold ${
                            isActive 
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {onToggleStatus && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onToggleStatus(id, !isActive)}
                              className={`h-7 px-2 text-[10px] font-bold rounded-lg cursor-pointer ${
                                isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={isActive ? 'Deactivate property' : 'Activate property'}
                            >
                              {isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          )}
                          {onSelectHotel && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onSelectHotel(hotel)}
                              className="h-7 px-2.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="Inspect property details"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> View
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer Summary */}
        <div className="p-3 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing <strong>{filteredHotels.length}</strong> of <strong>{hotels.length}</strong> properties</span>
          <span className="text-[11px] text-slate-400">Direct wholesale inventory synced from Hotelbeds / Bedsonline</span>
        </div>
      </div>
    </div>
  );
};

export default FullWidthHotelsTable;
