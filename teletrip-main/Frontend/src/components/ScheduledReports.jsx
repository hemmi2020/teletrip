import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Edit2, Mail } from 'lucide-react';
import { reportApi } from '../services/reportApi';

const ScheduledReports = ({ showToast }) => {
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    reportType: 'revenue',
    frequency: 'daily',
    time: '09:00',
    recipients: '',
    format: 'pdf',
    enabled: true
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await reportApi.getScheduledReports();
      setSchedules(data || []);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await reportApi.updateScheduledReport(editingId, formData);
        showToast?.('Schedule updated successfully', 'success');
      } else {
        await reportApi.createScheduledReport(formData);
        showToast?.('Schedule created successfully', 'success');
      }
      setShowModal(false);
      resetForm();
      loadSchedules();
    } catch (error) {
      showToast?.('Failed to save schedule', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this scheduled report?')) return;
    try {
      await reportApi.deleteScheduledReport(id);
      showToast?.('Schedule deleted', 'success');
      loadSchedules();
    } catch (error) {
      showToast?.('Failed to delete schedule', 'error');
    }
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.id);
    setFormData(schedule);
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      reportType: 'revenue',
      frequency: 'daily',
      time: '09:00',
      recipients: '',
      format: 'pdf',
      enabled: true
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock size={20} />
          Scheduled Reports
        </h3>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus size={16} />
          New Schedule
        </button>
      </div>

      <div className="space-y-3">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <h4 className="font-medium">{schedule.name}</h4>
              <p className="text-sm text-gray-600">
                {schedule.reportType} • {schedule.frequency} at {schedule.time}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Mail size={12} />
                {schedule.recipients}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(schedule)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(schedule.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {schedules.length === 0 && (
          <p className="text-gray-500 text-center py-8">No scheduled reports</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit' : 'New'} Scheduled Report
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Report Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Report Type</label>
                <select
                  value={formData.reportType}
                  onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="revenue">Revenue Report</option>
                  <option value="user-activity">User Activity</option>
                  <option value="booking-analytics">Booking Analytics</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Recipients (comma-separated)</label>
                <input
                  type="text"
                  value={formData.recipients}
                  onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                  placeholder="email1@example.com, email2@example.com"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Format</label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledReports;
