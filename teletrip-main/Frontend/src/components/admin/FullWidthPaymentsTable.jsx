import React, { useState } from 'react';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  CreditCard, Search, RefreshCw, CheckCircle, Clock, XCircle, 
  RotateCcw, DollarSign, ArrowUpRight, ShieldAlert, Eye, User
} from 'lucide-react';
import { PAYMENT_STATUS_COLORS } from '../../lib/stateMachines';

export const FullWidthPaymentsTable = ({
  payments = [],
  loading = false,
  onRefresh,
  onSelectPayment,
  onProcessRefund
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPayments = payments.filter(p => {
    const status = (p.status || 'pending').toLowerCase();

    if (statusFilter === 'completed' && status !== 'completed') return false;
    if (statusFilter === 'pending' && status !== 'pending' && status !== 'processing') return false;
    if (statusFilter === 'refunded' && status !== 'refunded' && status !== 'partially_refunded' && status !== 'refund_pending') return false;
    if (statusFilter === 'failed' && status !== 'failed' && status !== 'cancelled' && status !== 'disputed') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const pId = String(p.paymentId || p.transactionId || p._id || '').toLowerCase();
      const bRef = String(p.bookingReference || p.orderId || p.bookingId || '').toLowerCase();
      const user = String(p.user?.email || p.user?.fullname?.firstname || p.guestEmail || '').toLowerCase();
      const method = String(p.method || p.paymentMethod || '').toLowerCase();
      return pId.includes(q) || bRef.includes(q) || user.includes(q) || method.includes(q);
    }
    return true;
  });

  return (
    <div className="w-full space-y-4">
      {/* Subtabs Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Transactions', count: payments.length },
            { id: 'completed', label: 'Completed', count: payments.filter(p => (p.status || '').toLowerCase() === 'completed').length },
            { id: 'pending', label: 'Pending / Processing', count: payments.filter(p => ['pending', 'processing'].includes((p.status || '').toLowerCase())).length },
            { id: 'refunded', label: 'Refunded', count: payments.filter(p => ['refunded', 'partially_refunded', 'refund_pending'].includes((p.status || '').toLowerCase())).length },
            { id: 'failed', label: 'Failed / Disputed', count: payments.filter(p => ['failed', 'cancelled', 'disputed'].includes((p.status || '').toLowerCase())).length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
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
              placeholder="Search transaction ID, PNR, email..."
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
              title="Refresh payments"
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
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Transaction ID & Date</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Booking PNR / Order</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Customer / Payer</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Method & Gateway</TableHead>
                <TableHead className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</TableHead>
                <TableHead className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Status</TableHead>
                <TableHead className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-xs font-medium">Loading payments ledger...</p>
                  </TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No payment records found</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters or search keywords</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => {
                  const id = payment._id || payment.paymentId;
                  const txId = payment.paymentId || payment.transactionId || payment._id?.slice(-8) || 'N/A';
                  const bookingRef = payment.bookingReference || payment.orderId || 'N/A';
                  const status = (payment.status || 'pending').toLowerCase();
                  const badgeClass = PAYMENT_STATUS_COLORS[status] || 'bg-slate-100 text-slate-700 border-slate-200';
                  const currency = payment.currency || 'AED';
                  const amount = Number(payment.amount || 0);
                  const method = payment.method || payment.paymentMethod || 'Credit Card';
                  const createdAt = payment.createdAt ? new Date(payment.createdAt).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : 'N/A';
                  const userEmail = payment.user?.email || payment.guestEmail || 'customer@telitrip.com';
                  const userName = payment.user?.fullname ? `${payment.user.fullname.firstname || ''} ${payment.user.fullname.lastname || ''}`.trim() : (payment.guestName || 'Customer');

                  return (
                    <TableRow key={id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Transaction ID & Date */}
                      <TableCell className="px-4 py-3.5">
                        <div className="min-w-[160px]">
                          <span className="font-mono font-bold text-xs text-blue-700 block select-all">
                            {txId}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {createdAt}
                          </span>
                        </div>
                      </TableCell>

                      {/* Booking PNR */}
                      <TableCell className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                            {bookingRef}
                          </span>
                        </div>
                      </TableCell>

                      {/* Customer */}
                      <TableCell className="px-4 py-3.5">
                        <div className="min-w-[150px]">
                          <span className="font-bold text-xs text-slate-900 block truncate">
                            {userName}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {userEmail}
                          </span>
                        </div>
                      </TableCell>

                      {/* Method & Gateway */}
                      <TableCell className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                            <CreditCard className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-semibold text-slate-700 capitalize">
                            {method}
                          </span>
                        </div>
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="font-extrabold text-xs sm:text-sm text-slate-900">
                          {currency} {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-4 py-3.5 text-center whitespace-nowrap">
                        <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                          {status.replace('_', ' ')}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {status === 'completed' && onProcessRefund && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onProcessRefund(payment)}
                              className="h-7 px-2 text-[10px] font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg cursor-pointer"
                              title="Initiate refund"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" /> Refund
                            </Button>
                          )}
                          {onSelectPayment && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onSelectPayment(payment)}
                              className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="Inspect payment details"
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
          <span>Showing <strong>{filteredPayments.length}</strong> of <strong>{payments.length}</strong> transactions</span>
          <span className="text-[11px] text-slate-400">Real-time ledger synced with payment gateways</span>
        </div>
      </div>
    </div>
  );
};

export default FullWidthPaymentsTable;
