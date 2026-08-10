import React, { useState, useEffect, useCallback } from 'react';
import { Database, Play, RefreshCw, Loader2, CheckCircle, XCircle, AlertCircle, Clock, History } from 'lucide-react';
import { AdminDashboardAPI } from '../services/adminApi';

const HotelContentSyncTab = ({ showToast }) => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [isStarting, setIsStarting] = useState(false);
  const [polling, setPolling] = useState(false);

  const fetchStatus = useCallback(async () => {
    const result = await AdminDashboardAPI.getHotelSyncStatus();
    if (result.success) {
      setSyncStatus(result.data);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    const result = await AdminDashboardAPI.getHotelSyncHistory(10);
    if (result.success) {
      setHistory(result.data.jobs || []);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStatus();
    fetchHistory();
  }, [fetchStatus, fetchHistory]);

  // Poll every 5 seconds when sync is running
  useEffect(() => {
    let interval;
    if (syncStatus?.status === 'running') {
      setPolling(true);
      interval = setInterval(() => {
        fetchStatus();
        fetchHistory();
      }, 5000);
    } else {
      setPolling(false);
    }
    return () => clearInterval(interval);
  }, [syncStatus?.status, fetchStatus, fetchHistory]);

  const handleStartSync = async () => {
    if (!window.confirm('Start full hotel content sync? This will download all hotels from Hotelbeds and may take 5-10 minutes.')) return;
    
    setIsStarting(true);
    const result = await AdminDashboardAPI.startHotelSync(1000);
    setIsStarting(false);

    if (result.success) {
      showToast('Sync started in background', 'success');
      setSyncStatus(result.data);
      fetchHistory();
    } else {
      showToast(result.error || 'Failed to start sync', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'running': return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'failed': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Hotel Content Sync</h2>
              <p className="text-sm text-gray-500">
                Download all hotel static data from Hotelbeds Content API for 90% mapping coverage
              </p>
            </div>
          </div>
          <button
            onClick={handleStartSync}
            disabled={isStarting || syncStatus?.status === 'running'}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              isStarting || syncStatus?.status === 'running'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isStarting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            {syncStatus?.status === 'running' ? 'Sync Running...' : 'Start Full Sync'}
          </button>
        </div>
      </div>

      {/* Current Status */}
      {syncStatus && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Sync Status</h3>
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(syncStatus.status)}`}>
              {getStatusIcon(syncStatus.status)}
              {syncStatus.status === 'running' ? 'Running' : syncStatus.status === 'completed' ? 'Completed' : syncStatus.status === 'failed' ? 'Failed' : 'Pending'}
            </span>
          </div>

          {syncStatus.progress && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-900">
                    {syncStatus.progress.processed.toLocaleString()} / {syncStatus.progress.total.toLocaleString()} hotels
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${syncStatus.progress.percentage}%` }}
                  />
                </div>
                <div className="text-right text-sm text-gray-500 mt-1">
                  {syncStatus.progress.percentage}% complete
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{syncStatus.progress.processed.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Processed</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{syncStatus.progress.total.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{syncStatus.progress.failed.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Failed</p>
                </div>
              </div>

              {syncStatus.timing?.startedAt && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  Started: {new Date(syncStatus.timing.startedAt).toLocaleString()}
                  {syncStatus.timing.durationMinutes !== null && (
                    <span> • Duration: {syncStatus.timing.durationMinutes} min</span>
                  )}
                </div>
              )}

              {syncStatus.recentLogs && syncStatus.recentLogs.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Logs</h4>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
                    {syncStatus.recentLogs.map((log, i) => (
                      <p key={i} className="text-xs text-gray-600 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()} — {log.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sync History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Sync History</h3>
          <button
            onClick={fetchHistory}
            className="ml-auto p-1 text-gray-400 hover:text-blue-600 transition"
            title="Refresh history"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Database className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No sync jobs yet. Start your first sync above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Processed</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Failed</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Started</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Duration</th>
                </tr>
              </thead>
              <tbody>
                {history.map((job) => (
                  <tr key={job._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{job.processedItems?.toLocaleString() || 0}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{job.totalItems?.toLocaleString() || 0}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{job.failedItems?.toLocaleString() || 0}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {job.startedAt ? new Date(job.startedAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {job.startedAt && job.completedAt
                        ? `${Math.round((new Date(job.completedAt) - new Date(job.startedAt)) / 60000)} min`
                        : job.status === 'running' ? 'In progress' : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelContentSyncTab;
