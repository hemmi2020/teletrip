import React, { useState, useEffect } from 'react';
import { 
  GitCompare, Search, RefreshCw, CheckCircle, XCircle, AlertTriangle, 
  Loader2, Calendar, Filter, Phone, BarChart3, ArrowUpRight 
} from 'lucide-react';
import { AdminDashboardAPI } from '../services/adminApi';

const HotelbedsToolsTab = ({ showToast }) => {
  // Reconciliation state
  const [reconcileLoading, setReconcileLoading] = useState(false);
  const [reconcileResult, setReconcileResult] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('CHECKIN');

  // HCN state
  const [hcnLoading, setHcnLoading] = useState(false);
  const [hcnSummary, setHcnSummary] = useState(null);
  const [hcnResult, setHcnResult] = useState(null);
  const [maxAgeDays, setMaxAgeDays] = useState(30);

  // Load HCN summary on mount
  useEffect(() => {
    fetchHCNSummary();
  }, []);

  const fetchHCNSummary = async () => {
    const result = await AdminDashboardAPI.getHCNSummary();
    if (result.success) {
      setHcnSummary(result.data);
    }
  };

  const handleReconcile = async () => {
    if (!startDate || !endDate) {
      showToast('Please select start and end dates', 'error');
      return;
    }
    setReconcileLoading(true);
    const result = await AdminDashboardAPI.reconcileBookings({
      startDate,
      endDate,
      filterType
    });
    setReconcileLoading(false);

    if (result.success) {
      setReconcileResult(result.data);
      showToast(`Reconciliation complete: ${result.data.summary.matchedCount} matched, ${result.data.summary.missingLocallyCount} missing locally, ${result.data.summary.missingInHotelbedsCount} missing in Hotelbeds`, 'success');
    } else {
      showToast(result.error || 'Reconciliation failed', 'error');
    }
  };

  const handlePollHCN = async () => {
    setHcnLoading(true);
    const result = await AdminDashboardAPI.pollHCN({ maxAgeDays, batchSize: 50 });
    setHcnLoading(false);

    if (result.success) {
      setHcnResult(result.data);
      showToast(`HCN poll complete: ${result.data.updated} updated, ${result.data.failed} failed`, 'success');
      fetchHCNSummary();
    } else {
      showToast(result.error || 'HCN poll failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 rounded-lg">
            <GitCompare className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Hotelbeds Tools</h2>
            <p className="text-sm text-gray-500">
              Reconciliation and HCN polling for Hotelbeds certification
            </p>
          </div>
        </div>
      </div>

      {/* HCN Coverage Summary */}
      {hcnSummary && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              Hotel Confirmation Number (HCN) Coverage
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              hcnSummary.percentage >= 80 ? 'bg-green-100 text-green-700' :
              hcnSummary.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {hcnSummary.percentage}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{hcnSummary.total}</p>
              <p className="text-sm text-gray-500">Total Confirmed</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{hcnSummary.withHCN}</p>
              <p className="text-sm text-gray-500">With HCN</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{hcnSummary.withoutHCN}</p>
              <p className="text-sm text-gray-500">Missing HCN</p>
            </div>
          </div>
        </div>
      )}

      {/* Reconciliation Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-600" />
            Booking Reconciliation
          </h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Recommended</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Compare your local bookings with Hotelbeds to find mismatches, missing bookings, or status discrepancies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="CHECKIN">Check-in Date</option>
              <option value="CREATION">Creation Date</option>
              <option value="MODIFICATION">Modification Date</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleReconcile}
              disabled={reconcileLoading}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {reconcileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
              Run Reconciliation
            </button>
          </div>
        </div>

        {/* Reconciliation Results */}
        {reconcileResult && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-green-600">{reconcileResult.summary.matchedCount}</p>
                <p className="text-xs text-gray-600">Matched</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-blue-600">{reconcileResult.summary.totalHotelbedsBookings}</p>
                <p className="text-xs text-gray-600">In Hotelbeds</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-yellow-600">{reconcileResult.summary.missingLocallyCount}</p>
                <p className="text-xs text-gray-600">Missing Locally</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-red-600">{reconcileResult.summary.missingInHotelbedsCount}</p>
                <p className="text-xs text-gray-600">Missing in HB</p>
              </div>
            </div>

            {/* Missing Locally */}
            {reconcileResult.missingLocally.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Missing Locally ({reconcileResult.missingLocally.length})
                </h4>
                <p className="text-xs text-yellow-700 mb-2">These bookings exist in Hotelbeds but not in your local database:</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {reconcileResult.missingLocally.slice(0, 10).map((item, i) => (
                    <div key={i} className="text-xs bg-white rounded p-2 flex justify-between">
                      <span>{item.hotelbedsReference} — {item.hotelName}</span>
                      <span className="text-gray-500">{item.status}</span>
                    </div>
                  ))}
                  {reconcileResult.missingLocally.length > 10 && (
                    <p className="text-xs text-gray-500">...and {reconcileResult.missingLocally.length - 10} more</p>
                  )}
                </div>
              </div>
            )}

            {/* Missing in Hotelbeds */}
            {reconcileResult.missingInHotelbeds.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Missing in Hotelbeds ({reconcileResult.missingInHotelbeds.length})
                </h4>
                <p className="text-xs text-red-700 mb-2">These bookings exist locally but not in Hotelbeds (may be cancelled or failed):</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {reconcileResult.missingInHotelbeds.slice(0, 10).map((item, i) => (
                    <div key={i} className="text-xs bg-white rounded p-2 flex justify-between">
                      <span>{item.localReference} — {item.hotelName}</span>
                      <span className="text-gray-500">{item.status}</span>
                    </div>
                  ))}
                  {reconcileResult.missingInHotelbeds.length > 10 && (
                    <p className="text-xs text-gray-500">...and {reconcileResult.missingInHotelbeds.length - 10} more</p>
                  )}
                </div>
              </div>
            )}

            {/* Status Mismatches */}
            {reconcileResult.statusMismatches.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Status Mismatches ({reconcileResult.statusMismatches.length})
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {reconcileResult.statusMismatches.map((item, i) => (
                    <div key={i} className="text-xs bg-white rounded p-2 flex justify-between">
                      <span>{item.hotelbedsReference} — {item.hotelName}</span>
                      <span className="text-gray-500">Local: {item.localStatus} → HB: {item.hotelbedsStatus}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reconcileResult.missingLocally.length === 0 && reconcileResult.missingInHotelbeds.length === 0 && reconcileResult.statusMismatches.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">All bookings are perfectly reconciled!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* HCN Polling Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" />
            HCN Polling (PULL)
          </h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Recommended</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Poll Hotelbeds for Hotel Confirmation Numbers (HCN) that hotels provide after booking. These are different from the Hotelbeds booking reference.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Booking Age (days)</label>
            <select
              value={maxAgeDays}
              onChange={(e) => setMaxAgeDays(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handlePollHCN}
              disabled={hcnLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {hcnLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
              Poll HCN Now
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchHCNSummary}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Summary
            </button>
          </div>
        </div>

        {/* HCN Poll Results */}
        {hcnResult && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{hcnResult.processed}</p>
              <p className="text-xs text-gray-500">Processed</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-green-600">{hcnResult.updated}</p>
              <p className="text-xs text-gray-500">HCN Found</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-yellow-600">{hcnResult.alreadyHaveHCN}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-red-600">{hcnResult.failed}</p>
              <p className="text-xs text-gray-500">Failed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelbedsToolsTab;
