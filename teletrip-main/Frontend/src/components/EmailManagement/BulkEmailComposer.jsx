import React, { useState, useEffect } from 'react';
import {
  Send, Loader2, Users, CheckCircle, AlertCircle, Plus, X
} from 'lucide-react';
import { EmailManagementAPI } from '../../services/emailApi';

const SEGMENTS = [
  { value: 'all', label: 'All Users', description: 'Send to every registered user' },
  { value: 'active', label: 'Active Users', description: 'Send to users with active accounts' },
  { value: 'inactive', label: 'By Booking Status', description: 'Send to inactive users' },
];

const BulkEmailComposer = ({ showToast }) => {
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [segment, setSegment] = useState('all');
  const [customVariables, setCustomVariables] = useState([]);
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState(null);

  // Load active templates
  useEffect(() => {
    const load = async () => {
      setLoadingTemplates(true);
      const res = await EmailManagementAPI.listTemplates({ limit: 100 });
      if (res.success) {
        const active = (res.data.docs || res.data.templates || []).filter((t) => t.isActive);
        setTemplates(active);
      } else {
        showToast?.(res.error, 'error');
      }
      setLoadingTemplates(false);
    };
    load();
  }, [showToast]);

  const addCustomVariable = () => {
    setCustomVariables((prev) => [...prev, { key: '', value: '' }]);
  };

  const updateCustomVariable = (index, field, val) => {
    setCustomVariables((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const removeCustomVariable = (index) => {
    setCustomVariables((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!selectedTemplateId) {
      showToast?.('Please select a template', 'error');
      return;
    }
    setShowConfirm(true);
  };

  const confirmSend = async () => {
    setShowConfirm(false);
    setSending(true);
    setResult(null);

    // Build custom variables object
    const vars = {};
    customVariables.forEach((cv) => {
      if (cv.key.trim()) vars[cv.key.trim()] = cv.value;
    });

    const res = await EmailManagementAPI.sendBulkEmail({
      templateId: selectedTemplateId,
      recipientFilter: { segment },
      customVariables: Object.keys(vars).length > 0 ? vars : undefined,
    });

    if (res.success) {
      setResult({ success: true, queued: res.data.queued || res.data.totalQueued || 0 });
      showToast?.('Bulk email queued successfully', 'success');
    } else {
      setResult({ success: false, error: res.error });
      showToast?.(res.error, 'error');
    }
    setSending(false);
  };

  const selectedTemplate = templates.find((t) => t._id === selectedTemplateId);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Compose Bulk Email</h3>

        <div className="space-y-6">
          {/* Template selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Template</label>
            {loadingTemplates ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading templates...
              </div>
            ) : (
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Select a template...</option>
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            )}
            {selectedTemplate && (
              <p className="mt-1 text-xs text-gray-500">
                Subject: {selectedTemplate.subject}
              </p>
            )}
          </div>

          {/* Recipient segment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Segment</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SEGMENTS.map((seg) => (
                <button
                  key={seg.value}
                  onClick={() => setSegment(seg.value)}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    segment === seg.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Users className={`w-4 h-4 ${segment === seg.value ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${segment === seg.value ? 'text-blue-700' : 'text-gray-700'}`}>
                      {seg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{seg.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom variables */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Custom Variables (optional)</label>
              <button
                onClick={addCustomVariable}
                className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            {customVariables.length === 0 ? (
              <p className="text-xs text-gray-400">No custom variables. These will be merged with template variables.</p>
            ) : (
              <div className="space-y-2">
                {customVariables.map((cv, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={cv.key}
                      onChange={(e) => updateCustomVariable(i, 'key', e.target.value)}
                      placeholder="Variable key"
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                    <input
                      type="text"
                      value={cv.value}
                      onChange={(e) => updateCustomVariable(i, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => removeCustomVariable(i)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Send button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSend}
              disabled={sending || !selectedTemplateId}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Bulk Email
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              {result.success ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Bulk email queued</p>
                    <p className="text-xs text-green-600">{result.queued} emails queued for delivery</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Failed to queue</p>
                    <p className="text-xs text-red-600">{result.error}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Bulk Email</h3>
            <p className="text-sm text-gray-600 mb-1">
              You are about to send <strong>{selectedTemplate?.name}</strong> to <strong>{SEGMENTS.find((s) => s.value === segment)?.label}</strong>.
            </p>
            <p className="text-xs text-gray-500 mb-6">
              This action cannot be undone. Emails will be queued for delivery.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmSend}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Confirm Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkEmailComposer;
