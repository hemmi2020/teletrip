import React from 'react';
import { Wifi, WifiOff, Database, Server, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

const SystemStatus = ({ status }) => {
  const getStatusColor = (state) => {
    switch (state) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (state) => {
    switch (state) {
      case 'online': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'offline': return <WifiOff className="w-4 h-4" />;
      default: return <Wifi className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">System Status</h3>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.overall)}`}>
          {getStatusIcon(status.overall)}
          <span className="capitalize">{status.overall}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className={`w-4 h-4 ${status.websocket === 'online' ? 'text-green-600' : 'text-red-600'}`} />
            <span className="text-sm text-gray-700">WebSocket</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status.websocket)}`}>
            {status.websocket}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className={`w-4 h-4 ${status.database === 'online' ? 'text-green-600' : 'text-red-600'}`} />
            <span className="text-sm text-gray-700">Database</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status.database)}`}>
            {status.database}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className={`w-4 h-4 ${status.api === 'online' ? 'text-green-600' : 'text-red-600'}`} />
            <span className="text-sm text-gray-700">API Server</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status.api)}`}>
            {status.api}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${status.performance === 'online' ? 'text-green-600' : 'text-yellow-600'}`} />
            <span className="text-sm text-gray-700">Performance</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status.performance)}`}>
            {status.performance}
          </span>
        </div>
      </div>

      {status.lastUpdate && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(status.lastUpdate).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default SystemStatus;
