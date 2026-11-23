import React, { useState, useEffect, useCallback } from 'react';
import { 
  History, Search, RefreshCw, Filter, Calendar, User, 
  ArrowRight, Shield, Clock, Eye, X, CheckCircle, AlertTriangle, 
  ChevronLeft, ChevronRight, Layers, FileText
} from 'lucide-react';
import { AdminDashboardAPI, formatDateTime } from '../../services/adminApi';

const ENTITY_FILTERS = [
  { id: 'all', label: 'All Entities' },
  { id: 'booking', label: 'Bookings' },
  { id: 'payment', label: 'Payments' },
  { id: 'user', label: 'Users' },
  { id: 'hotel', label: 'Hotels' },
  { id: 'markup', label: 'Markups' },
  { id: 'coupon', label: 'Coupons' },
  { id: 'system', label: 'System' }
];

export default function FullWidthAuditTable({ showToast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20 });
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        target: selectedEntity !== 'all' ? selectedEntity : undefined,
        search: search.trim() || undefined
      };
      const result = await AdminDashboardAPI.getAuditLogs(params);
      if (result.success && result.data) {
        setLogs(result.data.logs || []);
        setPagination(result.data.pagination || { total: 0, pages: 1, limit: 20 });
      } else {
        showToast?.('error', result.error || 'Failed to fetch audit logs');
      }
    } catch (err) {
      showToast?.('error', 'Error loading audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, selectedEntity, search, showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionBadge = (action = '') => {
    if (action.includes('created') || action.includes('added')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (action.includes('cancelled') || action.includes('deleted') || action.includes('blocked')) {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    if (action.includes('refund')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (action.includes('updated') || action.includes('transition')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="w-full space-y-4">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              System Audit Trail & State Transitions
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Immutable ledger of administrative actions, state machine transitions, and pricing rule modifications.
            </p>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Entity Filters & Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 pt-3 border-t border-gray-100">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none flex-1">
            {ENTITY_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => { setSelectedEntity(f.id); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedEntity === f.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search action, reason, actor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </form>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Transition / Change</th>
                <th className="py-3 px-4">Reason / Details</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <History className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No audit log entries found matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const oldStatus = log.metadata?.oldValues?.status;
                  const newStatus = log.metadata?.newValues?.status;
                  const hasTransition = oldStatus && newStatus;

                  return (
                    <tr key={log._id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatDateTime(log.createdAt)}</span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                            {log.admin?.name ? log.admin.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 leading-tight">
                              {log.admin?.name || 'System / Automated'}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              {log.admin?.email || log.ipAddress || 'Internal Worker'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Target Entity */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-800 capitalize">{log.target}</span>
                          {log.targetId && (
                            <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                              {log.targetId.slice(-6)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Transition / Change */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {hasTransition ? (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-medium">
                              {oldStatus}
                            </span>
                            <ArrowRight className="w-3 h-3 text-gray-400" />
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-semibold border border-indigo-200">
                              {newStatus}
                            </span>
                          </div>
                        ) : log.metadata?.newValues?.markupValue !== undefined ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {log.metadata.newValues.calculationType === 'percentage' ? `+${log.metadata.newValues.markupValue}%` : `+$${log.metadata.newValues.markupValue}`}
                          </span>
                        ) : log.metadata?.newValues?.code ? (
                          <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {log.metadata.newValues.code}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Direct Mutation</span>
                        )}
                      </td>

                      {/* Reason / Details */}
                      <td className="py-3 px-4 max-w-xs truncate text-gray-600" title={log.metadata?.reason || log.details ? JSON.stringify(log.details) : ''}>
                        {log.metadata?.reason || (log.details ? JSON.stringify(log.details) : '—')}
                      </td>

                      {/* Inspect */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="View Raw Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.pages > 1 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div>
              Showing page <span className="font-semibold text-gray-800">{page}</span> of{' '}
              <span className="font-semibold text-gray-800">{pagination.pages}</span> ({pagination.total} total entries)
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Detail Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900 text-base">Audit Log Record Details</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Action</span>
                  <span className="font-semibold text-gray-900 text-sm">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Target Entity</span>
                  <span className="font-semibold text-gray-900 text-sm capitalize">{selectedLog.target} ({selectedLog.targetId || 'N/A'})</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Actor</span>
                  <span className="font-medium text-gray-800">{selectedLog.admin?.name || 'System'} ({selectedLog.admin?.email || 'automated'})</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Date & Time</span>
                  <span className="font-medium text-gray-800">{formatDateTime(selectedLog.createdAt)}</span>
                </div>
              </div>

              {selectedLog.metadata?.reason && (
                <div>
                  <span className="text-gray-500 font-semibold block mb-1">Reason / Note:</span>
                  <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-indigo-900">
                    {selectedLog.metadata.reason}
                  </div>
                </div>
              )}

              <div>
                <span className="text-gray-500 font-semibold block mb-1">Raw State & Mutation Payload (JSON):</span>
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-slate-800">
                  {JSON.stringify(selectedLog.metadata || selectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
