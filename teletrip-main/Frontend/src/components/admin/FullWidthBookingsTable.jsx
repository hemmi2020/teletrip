import React, { useState } from 'react';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Eye, FileText, CheckCircle2, XCircle, Clock, AlertTriangle, 
  Search, RefreshCw, ArrowUpDown, ChevronRight, Copy, Check
} from 'lucide-react';
import { getBookingStatusConfig, getPaymentStatusConfig } from '../../lib/stateMachines';

export const FullWidthBookingsTable = ({
  bookings = [],
  loading = false,
  onViewBooking,
  onOpenVoucher,
  onRefresh,
  selectedIds = [],
  onSelectItem,
  onSelectAll,
  activeSubFilter = 'all',
  onSubFilterChange
}) => {
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredBookings = bookings.filter(b => {
    if (activeSubFilter === 'confirmed' && b.status !== 'confirmed') return false;
    if (activeSubFilter === 'pending' && b.status !== 'pending' && b.status !== 'on_hold') return false;
    if (activeSubFilter === 'cancelled' && b.status !== 'cancelled' && b.status !== 'refund_pending' && b.status !== 'refunded') return false;
    if (activeSubFilter === 'completed' && b.status !== 'completed' && b.status !== 'expired') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const pnr = (b.bookingReference || b.bookingId || b._id || '').toLowerCase();
      const guest = (b.holder ? `${b.holder.name} ${b.holder.surname}` : (b.user?.email || '')).toLowerCase();
      const hotel = (b.hotelBooking?.hotel?.name || b.hotelName || '').toLowerCase();
      return pnr.includes(q) || guest.includes(q) || hotel.includes(q);
    }
    return true;
  });

  const allSelected = filteredBookings.length > 0 && selectedIds.length === filteredBookings.length;

  return (
    <div className="w-full space-y-4">
      {/* Subtabs Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Bookings', count: bookings.length },
            { id: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
            { id: 'pending', label: 'Pending / Action Req.', count: bookings.filter(b => b.status === 'pending' || b.status === 'on_hold').length },
            { id: 'cancelled', label: 'Cancellations & Refunds', count: bookings.filter(b => ['cancelled', 'refund_pending', 'refunded'].includes(b.status)).length },
            { id: 'completed', label: 'Completed', count: bookings.filter(b => ['completed', 'expired'].includes(b.status)).length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => onSubFilterChange && onSubFilterChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeSubFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeSubFilter === tab.id ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by PNR, Guest, Hotel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="shrink-0 text-xs font-semibold h-8"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Full-Width Table */}
      <div className="w-full overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xs">
        <div className="overflow-x-auto w-full">
          <Table className="w-full min-w-[900px]">
            <TableHeader className="bg-slate-50/90 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll && onSelectAll(e.target.checked ? filteredBookings.map(b => b._id) : [])}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Reference / PNR
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Guest
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Hotel & Room
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Dates
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Amount
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Payment
                </TableHead>
                <TableHead className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-16 text-slate-400">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <p className="text-sm font-semibold text-slate-600">No bookings found</p>
                      <p className="text-xs text-slate-400">Try adjusting your status filter or search keywords.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((b) => {
                  const statusConfig = getBookingStatusConfig(b.status);
                  const paymentConfig = getPaymentStatusConfig(b.paymentDetails?.status || b.paymentStatus);
                  const pnr = b.bookingReference || b.bookingId || b._id;
                  const isSelected = selectedIds.includes(b._id);

                  const guestName = b.holder 
                    ? `${b.holder.name} ${b.holder.surname}` 
                    : (b.user ? `${b.user.fullname?.firstname || ''} ${b.user.fullname?.lastname || ''}`.trim() : 'Guest');

                  const hotelName = b.hotelBooking?.hotel?.name || b.hotelName || 'Hotel Reservation';
                  const roomName = b.hotelBooking?.rooms?.[0]?.name || b.roomType || 'Standard';

                  const checkIn = b.hotelBooking?.checkIn || b.checkIn;
                  const checkOut = b.hotelBooking?.checkOut || b.checkOut;

                  const totalPKR = b.currencyConversion?.totalPKR 
                    ? Math.round(b.currencyConversion.totalPKR) 
                    : (b.totalAmount || b.pricing?.totalAmount || 0);

                  const supplierNet = b.hotelBooking?.totalNet || 0;
                  const supplierCurrency = (b.currencyConversion?.originalCurrency || b.hotelBooking?.currency || 'AED').toUpperCase();

                  return (
                    <TableRow 
                      key={b._id} 
                      className={`hover:bg-slate-50/80 transition cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                      onClick={() => onViewBooking && onViewBooking(b)}
                    >
                      <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectItem && onSelectItem(b._id)}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </TableCell>

                      <TableCell className="px-4 py-3 font-mono text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span>{pnr}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(pnr, b._id);
                            }}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                            title="Copy PNR"
                          >
                            {copiedId === b._id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        {b.hotelBooking?.reference && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            HBX: {b.hotelBooking.reference}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        <span className="text-xs font-bold text-slate-900 block truncate max-w-[160px]">{guestName}</span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[160px]">{b.holder?.email || b.user?.email || ''}</span>
                      </TableCell>

                      <TableCell className="px-4 py-3 max-w-[220px]">
                        <span className="text-xs font-bold text-slate-800 block truncate">{hotelName}</span>
                        <span className="text-[11px] text-slate-500 block truncate">{roomName}</span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-xs whitespace-nowrap">
                        <span className="font-semibold text-slate-700 block">
                          {checkIn ? new Date(checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'} - {checkOut ? new Date(checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-xs whitespace-nowrap">
                        <span className="font-extrabold text-blue-700 block">
                          PKR {totalPKR.toLocaleString()}
                        </span>
                        {supplierNet > 0 && (
                          <span className="text-[10px] text-slate-400 block">
                            Net: {supplierCurrency} {supplierNet}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border inline-block ${statusConfig.badgeClass}`}>
                          {statusConfig.label}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border inline-block ${paymentConfig.badgeClass}`}>
                          {paymentConfig.label}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {onOpenVoucher && (
                            <button
                              onClick={() => onOpenVoucher(b)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                              title="Print Voucher"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewBooking && onViewBooking(b)}
                            className="h-7 px-2 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Inspect
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
export default FullWidthBookingsTable;
