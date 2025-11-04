import React, { useState } from 'react';
import { FileText, Download, Mail, Calendar } from 'lucide-react';

const ReportBuilder = ({ onGenerate, onEmail }) => {
  const [config, setConfig] = useState({
    reportType: 'revenue',
    startDate: '',
    endDate: '',
    format: 'pdf',
    includeCharts: true,
    groupBy: 'day'
  });

  const handleGenerate = () => {
    if (!config.startDate || !config.endDate) {
      alert('Please select date range');
      return;
    }
    onGenerate(config);
  };

  const handleEmail = () => {
    if (!config.startDate || !config.endDate) {
      alert('Please select date range');
      return;
    }
    onEmail(config);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileText size={20} />
        Custom Report Builder
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Report Type</label>
          <select
            value={config.reportType}
            onChange={(e) => setConfig({ ...config, reportType: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="revenue">Revenue Report</option>
            <option value="user-activity">User Activity</option>
            <option value="booking-analytics">Booking Analytics</option>
            <option value="custom">Custom Report</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Format</label>
          <select
            value={config.format}
            onChange={(e) => setConfig({ ...config, format: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Start Date</label>
          <input
            type="date"
            value={config.startDate}
            onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">End Date</label>
          <input
            type="date"
            value={config.endDate}
            onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Group By</label>
          <select
            value={config.groupBy}
            onChange={(e) => setConfig({ ...config, groupBy: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.includeCharts}
              onChange={(e) => setConfig({ ...config, includeCharts: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Include Charts</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Download size={16} />
          Generate Report
        </button>
        <button
          onClick={handleEmail}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <Mail size={16} />
          Email Report
        </button>
      </div>
    </div>
  );
};

export default ReportBuilder;
