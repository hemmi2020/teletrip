import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, Save, RefreshCw, AlertCircle, CheckCircle, Sliders, Globe } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const CurrencySettings = ({ showToast }) => {
  const { refreshRates } = useCurrency();

  const [rates, setRates] = useState({
    AED: 75.39,
    EUR: 309.84,
    USD: 276.69,
    GBP: 370.90
  });
  const [manualRates, setManualRates] = useState({
    AED: '',
    EUR: '',
    USD: '',
    GBP: ''
  });
  const [autoFetchRates, setAutoFetchRates] = useState(true);
  const [commissionPercentage, setCommissionPercentage] = useState(0);
  const [serviceChargePercentage, setServiceChargePercentage] = useState(1);
  const [primaryCurrency, setPrimaryCurrency] = useState('AED');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [lastUpdated, setLastUpdated] = useState(null);

  // Live test calculator state
  const [simNetPrice, setSimNetPrice] = useState(1000);
  const [simCurrency, setSimCurrency] = useState('AED');

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

      if (response.data.success && response.data.data) {
        const d = response.data.data;
        if (d.rates) setRates(d.rates);
        setCommissionPercentage(d.commissionPercentage ?? 0);
        setServiceChargePercentage(d.serviceChargePercentage ?? d.transactionFeePercentage ?? 1);
        setPrimaryCurrency(d.primaryCurrency || 'AED');
        setAutoFetchRates(d.autoFetchRates !== false);
        setManualRates({
          AED: d.manualRates?.AED || '',
          EUR: d.manualRates?.EUR || '',
          USD: d.manualRates?.USD || '',
          GBP: d.manualRates?.GBP || ''
        });
        setLastUpdated(d.lastUpdated);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load settings';
      setMessage({ type: 'error', text: errorMsg });
      if (showToast) showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (commissionPercentage < 0 || commissionPercentage > 100) {
      setMessage({ type: 'error', text: 'Commission must be between 0% and 100%' });
      return;
    }
    if (serviceChargePercentage < 0 || serviceChargePercentage > 20) {
      setMessage({ type: 'error', text: 'Service charge must be between 0% and 20%' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const payload = {
        commissionPercentage: parseFloat(commissionPercentage) || 0,
        serviceChargePercentage: parseFloat(serviceChargePercentage) || 1,
        primaryCurrency,
        autoFetchRates,
        manualRates: {
          AED: manualRates.AED ? parseFloat(manualRates.AED) : null,
          EUR: manualRates.EUR ? parseFloat(manualRates.EUR) : null,
          USD: manualRates.USD ? parseFloat(manualRates.USD) : null,
          GBP: manualRates.GBP ? parseFloat(manualRates.GBP) : null
        }
      };

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/currency/settings`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Pricing, commission & currency settings updated successfully!' });
        if (showToast) showToast('Settings saved successfully!', 'success');
        if (response.data.data?.rates) setRates(response.data.data.rates);
        setLastUpdated(response.data.data?.lastUpdated || new Date().toISOString());
        if (refreshRates) refreshRates();
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update settings';
      setMessage({ type: 'error', text: errorMsg });
      if (showToast) showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Calculation for live simulator
  const simRate = (autoFetchRates ? rates[simCurrency] : (parseFloat(manualRates[simCurrency]) || rates[simCurrency])) || 75.39;
  const simCommission = Math.round(simNetPrice * (commissionPercentage / 100) * 100) / 100;
  const simRetail = Math.round((simNetPrice + simCommission) * 100) / 100;
  const simBasePKR = Math.round(simRetail * simRate);
  const simFeePKR = Math.round(simBasePKR * (serviceChargePercentage / 100));
  const simTotalPKR = simBasePKR + simFeePKR;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pricing, Commission & Currency Engine</h2>
            <p className="text-xs text-gray-500">
              Live Hotelbeds API currency: <span className="font-semibold text-blue-600">AED (Dirham)</span> · Dual-currency PKR converter
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving Changes...' : 'Save All Settings'}</span>
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Grid: 1. Exchange Rates | 2. Commission & Service Charge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Exchange Rates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              Live PKR Exchange Rates
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-medium">Auto-Fetch API:</label>
              <input
                type="checkbox"
                checked={autoFetchRates}
                onChange={(e) => setAutoFetchRates(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Rates auto-update hourly. Enter a value below to set a custom manual exchange rate override.
          </p>

          <div className="space-y-3">
            {[
              { code: 'AED', name: 'UAE Dirham (Hotelbeds Live)', flag: '🇦🇪' },
              { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
              { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
              { code: 'GBP', name: 'British Pound', flag: '🇬🇧' }
            ].map(({ code, name, flag }) => {
              const liveVal = rates[code] || 0;
              const isPrimary = code === primaryCurrency;

              return (
                <div key={code} className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${
                  isPrimary ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="text-xl">{flag}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-gray-900">{code}</span>
                        {isPrimary && (
                          <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500 truncate block">{name}</span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Live Rate</div>
                      <div className="text-sm font-bold text-gray-800">
                        1 {code} = {liveVal} PKR
                      </div>
                    </div>
                    {!autoFetchRates && (
                      <input
                        type="number"
                        step="0.01"
                        placeholder={String(liveVal)}
                        value={manualRates[code]}
                        onChange={(e) => setManualRates({ ...manualRates, [code]: e.target.value })}
                        className="w-24 px-2 py-1 text-sm border rounded bg-white text-right font-medium"
                        title={`Manual ${code} to PKR override`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {lastUpdated && (
            <p className="text-[11px] text-gray-400">
              Last synced: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>

        {/* Section 2: Commission & Service Charges */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Agency Markup & Service Charges
          </h3>

          {/* Commission / Markup Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Agency Commission / Markup (%)
              </label>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                +{commissionPercentage}%
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Added directly to the supplier net rate. Displayed customer prices in AED (and PKR) will reflect this margin.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={commissionPercentage}
                onChange={(e) => setCommissionPercentage(parseFloat(e.target.value) || 0)}
                className="w-32 px-3 py-2 text-base font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <span className="text-xs text-gray-500">
                e.g. 10% adds AED 100 on an AED 1,000 net hotel booking.
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Service Charge / Local Payment Fee */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Service Charge / Local Payment Fee (%)
              </label>
              <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                +{serviceChargePercentage}%
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Percentage added to the final PKR amount for bank handling and local transaction processing.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={serviceChargePercentage}
                onChange={(e) => setServiceChargePercentage(parseFloat(e.target.value) || 0)}
                className="w-32 px-3 py-2 text-base font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              />
              <span className="text-xs text-gray-500">
                Default 1% (applied on checkout and PKR price display).
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Live Interactive Price Calculator */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50/40 rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Live Pricing Simulator
            </h3>
            <p className="text-xs text-gray-500">
              Test how a supplier price will look to a customer based on current settings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Simulate Net:</span>
            <input
              type="number"
              value={simNetPrice}
              onChange={(e) => setSimNetPrice(parseFloat(e.target.value) || 0)}
              className="w-28 px-2.5 py-1 text-sm font-bold bg-white border border-gray-300 rounded-md"
            />
            <select
              value={simCurrency}
              onChange={(e) => setSimCurrency(e.target.value)}
              className="px-2 py-1 text-sm font-bold bg-white border border-gray-300 rounded-md"
            >
              <option value="AED">AED</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <div className="text-[11px] text-gray-400 font-medium">Supplier Net Price</div>
            <div className="text-base font-extrabold text-gray-900">{simCurrency} {simNetPrice.toLocaleString()}</div>
            <div className="text-[10px] text-gray-400">Hotelbeds API rate</div>
          </div>

          <div>
            <div className="text-[11px] text-gray-400 font-medium">+ Agency Profit ({commissionPercentage}%)</div>
            <div className="text-base font-extrabold text-emerald-600">+{simCurrency} {simCommission.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-600 font-medium">Your Margin</div>
          </div>

          <div>
            <div className="text-[11px] text-gray-400 font-medium">Customer Retail Price</div>
            <div className="text-lg font-black text-blue-600">{simCurrency} {simRetail.toLocaleString()}</div>
            <div className="text-[10px] text-blue-600 font-medium">Displayed on Card</div>
          </div>

          <div>
            <div className="text-[11px] text-gray-400 font-medium">Total PKR Amount</div>
            <div className="text-lg font-black text-gray-900">PKR {simTotalPKR.toLocaleString()}</div>
            <div className="text-[10px] text-gray-400">Includes {serviceChargePercentage}% service fee</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencySettings;
