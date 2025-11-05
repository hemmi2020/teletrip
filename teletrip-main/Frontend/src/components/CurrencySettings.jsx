import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, Save, RefreshCw, AlertCircle } from 'lucide-react';

const CurrencySettings = ({ showToast }) => {
  const [markup, setMarkup] = useState(20);
  const [currentRate, setCurrentRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/currency/settings`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setMarkup(response.data.data.markupPerEuro);
        setCurrentRate(response.data.data.currentExchangeRate);
        setLastUpdated(response.data.data.lastUpdated);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load settings';
      setMessage({ type: 'error', text: errorMsg });
      if (showToast) showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMarkup = async () => {
    if (markup < 0 || markup > 100) {
      setMessage({ type: 'error', text: 'Markup must be between 0 and 100 PKR' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/currency/settings/markup`,
        { markupPerEuro: markup },
        { headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }}
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Markup updated successfully!' });
        setLastUpdated(response.data.data.updatedAt);
        if (showToast) showToast('Markup updated successfully!', 'success');
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update markup';
      setMessage({ type: 'error', text: errorMsg });
      if (showToast) showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const exampleAmount = 30;
  const exampleBase = currentRate ? (exampleAmount * currentRate).toFixed(2) : 0;
  const exampleMarkup = (exampleAmount * markup).toFixed(2);
  const exampleTotal = currentRate ? (parseFloat(exampleBase) + parseFloat(exampleMarkup)).toFixed(2) : 0;

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
          <DollarSign className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Currency Settings</h2>
        </div>

        {message.text && (
          <div className={`mb-4 p-4 rounded-lg flex items-start ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Current Exchange Rate */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Exchange Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {currentRate ? `${currentRate} PKR/EUR` : 'Loading...'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-2">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>

        {/* Markup Configuration */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Markup Per EUR (PKR)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={markup}
              onChange={(e) => setMarkup(Number(e.target.value))}
              min="0"
              max="100"
              step="1"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Enter markup amount"
            />
            <button
              onClick={handleUpdateMarkup}
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
                  Update Markup
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            This amount will be added per EUR to the final price (0-100 PKR)
          </p>
        </div>

        {/* Example Calculation */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Calculation</h3>
          <p className="text-sm text-gray-600 mb-4">
            If a hotel costs <span className="font-semibold">€{exampleAmount} EUR</span>:
          </p>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Base Amount:</span>
              <span className="font-semibold">
                {exampleAmount} × {currentRate} = {exampleBase} PKR
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Service Fee (Markup):</span>
              <span className="font-semibold">
                {exampleAmount} × {markup} = {exampleMarkup} PKR
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 bg-blue-50 rounded-lg px-4">
              <span className="text-lg font-bold text-gray-900">Total Price:</span>
              <span className="text-2xl font-bold text-blue-600">
                {exampleTotal} PKR
              </span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Exchange rates are updated automatically every hour</li>
                <li>Markup changes take effect immediately for all new bookings</li>
                <li>Existing bookings are not affected by markup changes</li>
                <li>All conversions are stored in booking records for audit purposes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencySettings;
