import React, { useState } from 'react';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  MessageSquare, Search, RefreshCw, AlertCircle, CheckCircle2, 
  Clock, ArrowUpRight, MessageCircle, User, ShieldAlert
} from 'lucide-react';

const PRIORITY_COLORS = {
  urgent: 'bg-red-50 text-red-700 border-red-200',
  high: 'bg-amber-50 text-amber-700 border-amber-200',
  normal: 'bg-blue-50 text-blue-700 border-blue-200',
  low: 'bg-slate-50 text-slate-600 border-slate-200'
};

const STATUS_COLORS = {
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200'
};

export const FullWidthSupportTable = ({
  tickets = [],
  loading = false,
  onRefresh,
  onSelectTicket,
  onUpdateStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTickets = tickets.filter(t => {
    const status = (t.status || 'open').toLowerCase();

    if (statusFilter === 'open' && status !== 'open') return false;
    if (statusFilter === 'in_progress' && status !== 'in_progress') return false;
    if (statusFilter === 'resolved' && status !== 'resolved') return false;
    if (statusFilter === 'closed' && status !== 'closed') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const id = String(t.ticketId || t._id || '').toLowerCase();
      const subject = String(t.subject || '').toLowerCase();
      const user = String(t.user?.email || t.user?.fullname?.firstname || t.email || '').toLowerCase();
      const cat = String(t.category || '').toLowerCase();
      return id.includes(q) || subject.includes(q) || user.includes(q) || cat.includes(q);
    }
    return true;
  });

  return (
    <div className="w-full space-y-4">
      {/* Subtabs Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Tickets', count: tickets.length },
            { id: 'open', label: 'Open', count: tickets.filter(t => (t.status || 'open').toLowerCase() === 'open').length },
            { id: 'in_progress', label: 'In Progress', count: tickets.filter(t => (t.status || '').toLowerCase() === 'in_progress').length },
            { id: 'resolved', label: 'Resolved', count: tickets.filter(t => (t.status || '').toLowerCase() === 'resolved').length },
            { id: 'closed', label: 'Closed', count: tickets.filter(t => (t.status || '').toLowerCase() === 'closed').length },
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
              placeholder="Search ticket ID, customer, subject..."
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
              title="Refresh tickets"
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
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Ticket & Subject</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Customer / User</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Category</TableHead>
                <TableHead className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Priority</TableHead>
                <TableHead className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Status</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Updated</TableHead>
                <TableHead className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-xs font-medium">Loading support queue...</p>
                  </TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No support tickets found</p>
                    <p className="text-xs text-slate-400">All customer inquiries are resolved</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => {
                  const id = ticket._id || ticket.ticketId;
                  const tId = ticket.ticketId || ticket._id?.slice(-6) || 'TKT';
                  const subject = ticket.subject || 'Support Inquiry';
                  const priority = (ticket.priority || 'normal').toLowerCase();
                  const status = (ticket.status || 'open').toLowerCase();
                  const category = ticket.category || 'General';
                  const priorityClass = PRIORITY_COLORS[priority] || PRIORITY_COLORS.normal;
                  const statusClass = STATUS_COLORS[status] || STATUS_COLORS.open;
                  const updatedAt = ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : 'Recently';
                  const userEmail = ticket.user?.email || ticket.email || 'guest@telitrip.com';
                  const userName = ticket.user?.fullname ? `${ticket.user.fullname.firstname || ''} ${ticket.user.fullname.lastname || ''}`.trim() : (ticket.name || 'Customer');

                  return (
                    <TableRow key={id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Ticket & Subject */}
                      <TableCell className="px-4 py-3.5">
                        <div className="min-w-[180px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                              #{tId}
                            </span>
                            <span className="font-extrabold text-xs text-slate-900 truncate">
                              {subject}
                            </span>
                          </div>
                          {ticket.bookingId && (
                            <span className="text-[10px] text-blue-600 block mt-0.5">
                              Ref Booking: {ticket.bookingId}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Customer */}
                      <TableCell className="px-4 py-3.5">
                        <div className="min-w-[140px]">
                          <span className="font-bold text-xs text-slate-900 block truncate">
                            {userName}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {userEmail}
                          </span>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md capitalize">
                          {category}
                        </span>
                      </TableCell>

                      {/* Priority */}
                      <TableCell className="px-4 py-3.5 text-center whitespace-nowrap">
                        <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${priorityClass}`}>
                          {priority}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-4 py-3.5 text-center whitespace-nowrap">
                        <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
                          {status.replace('_', ' ')}
                        </Badge>
                      </TableCell>

                      {/* Updated Date */}
                      <TableCell className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{updatedAt}</span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {onSelectTicket && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onSelectTicket(ticket)}
                              className="h-7 px-2.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                              title="Open ticket thread"
                            >
                              <MessageCircle className="w-3.5 h-3.5 mr-1" /> Reply
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
          <span>Showing <strong>{filteredTickets.length}</strong> of <strong>{tickets.length}</strong> inquiries</span>
          <span className="text-[11px] text-slate-400">Customer communications queue</span>
        </div>
      </div>
    </div>
  );
};

export default FullWidthSupportTable;
