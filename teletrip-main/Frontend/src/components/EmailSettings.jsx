import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Save, RefreshCw, AlertCircle, Send, Eye, EyeOff } from 'lucide-react';

const EmailSettings = ({ showToast }) => {
  const [settings, setSettings] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    sender_name: '',
    sender_email: '',
    enable_tls: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL || 'http://localhost:3000'}/api/admin/settings/email`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        const data = response.data.data || {};
        setSettings(prev => ({
          smtp_host: data.smtp_host || prev.smtp_host,
          smtp_port: data.smtp_port || prev.smtp_port,
          smtp_user: data.smtp_user || prev.smtp_user,
          smtp_password: data.smtp_password || prev.smtp_password,
          sender_name: data.sender_name || prev.sender_name,
          sender_email: data.sender_email || prev.sender_email,
          enable_tls: data.enable_tls !== undefined ? data.enable_tls : prev.enable_tls
        }));
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load email settings';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL || 'http://localhost:3000'}/api/admin/settings/email`,
        settings,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Email settings saved successfully!' });
        if (showToast) showToast('Email settings saved successfully!', 'success');
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save email settings';
      setMessage({ type: 'error', text: errorMsg });
      if (showToast) showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('adminToken');
      // First save, then test by sending a test email via the existing test endpoint
      await axios.put(
        `${import.meta.env.VITE_BASE_URL || 'http://localhost:3000'}/api/admin/settings/email`,
        settings,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      setMessage({ type: 'success', text: 'Settings saved. SMTP connection configured — send a test email from Templates to verify delivery.' });
      if (showToast) showToast('Settings saved successfully. Use template test send to verify SMTP.', 'success');
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to test connection';
      setMessage({ type: 'error', text: errorMsg });
      if (showToast) showToast(errorMsg, 'error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Mail className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Email Settings</h2>
        </div>

        {message.text && (
          <div className={`mb-4 p-4 rounded-lg flex items-start ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{message.text}</span>
          </div>
        )}

        {/* SMTP Configuration */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                value={settings.smtp_host}
                onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                value={settings.smtp_port}
                onChange={(e) => setSettings({ ...settings, smtp_port: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="587"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP User
              </label>
              <input
                type="text"
                value={settings.smtp_user}
                onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your-email@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={settings.smtp_password}
                  onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sender Name
              </label>
              <input
                type="text"
                value={settings.sender_name}
                onChange={(e) => setSettings({ ...settings, sender_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Telitrip"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sender Email
              </label>
              <input
                type="email"
                value={settings.sender_email}
                onChange={(e) => setSettings({ ...settings, sender_email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="noreply@telitrip.com"
              />
            </div>
          </div>

          {/* Enable TLS Toggle */}
          <div className="flex items-center gap-3 py-2">
            <button
              type="button"
              onClick={() => setSettings({ ...settings, enable_tls: !settings.enable_tls })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enable_tls ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-label="Toggle TLS"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.enable_tls ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <span className="text-sm font-medium text-gray-700">Enable TLS</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {testing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Test Connection
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>For Gmail, use an App Password instead of your account password</li>
                <li>Port 587 is recommended for TLS connections</li>
                <li>Changes take effect immediately for new emails</li>
                <li>Use the Test Connection button to verify your SMTP configuration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;
