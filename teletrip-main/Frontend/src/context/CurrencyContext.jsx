import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [rates, setRates] = useState({
    AED: 75.39,
    EUR: 309.84,
    USD: 276.69,
    GBP: 370.90,
    PKR: 1.00
  });
  const [commissionPercentage, setCommissionPercentage] = useState(0);
  const [serviceChargePercentage, setServiceChargePercentage] = useState(1);
  const [primaryCurrency, setPrimaryCurrency] = useState('AED');
  const [rate, setRate] = useState(75.39);
  const [markup, setMarkup] = useState(0);
  const [txFee, setTxFee] = useState(1);
  const [loading, setLoading] = useState(true);

  const API_BASE = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000') + '/api';

  const fetchRate = async () => {
    try {
      const res = await fetch(`${API_BASE}/currency/rate`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const d = data.data;
          if (d.rates) setRates(d.rates);
          const comm = parseFloat(d.commissionPercentage) || 0;
          const service = parseFloat(d.serviceChargePercentage ?? d.transactionFeePercentage) || 1;
          const prim = d.primaryCurrency || 'AED';
          setCommissionPercentage(comm);
          setServiceChargePercentage(service);
          setPrimaryCurrency(prim);
          setRate(d.rates?.[prim] || d.exchangeRate || 75.39);
          setMarkup(comm);
          setTxFee(service);
        }
      }
    } catch (err) {
      console.error('Currency rate fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
    // Refresh every 30 minutes
    const interval = setInterval(fetchRate, 1800000);
    return () => clearInterval(interval);
  }, []);

  // Calculate marked-up customer price in original currency (e.g. AED)
  const applyCommission = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return 0;
    if (!commissionPercentage || commissionPercentage <= 0) return num;
    return Math.round((num * (1 + commissionPercentage / 100)) * 100) / 100;
  };

  // Convert to PKR with exchange rate, commission & service charge
  // amount: supplier net or customer retail amount
  // currency: 'AED' | 'EUR' | 'USD' | 'GBP' (defaults to primaryCurrency or 'AED')
  // isAlreadyRetail: if true, does not re-apply commission
  const convert = (amount, currency = null, isAlreadyRetail = false) => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return null;

    const cur = (currency || primaryCurrency || 'AED').toUpperCase();
    const exRate = rates[cur] || (cur === 'AED' ? 75.39 : cur === 'EUR' ? 309.84 : cur === 'USD' ? 276.69 : 75.39);

    const retailAmount = isAlreadyRetail ? num : applyCommission(num);
    const basePKR = retailAmount * exRate;
    const fee = (basePKR * serviceChargePercentage) / 100;
    return Math.round((basePKR + fee) * 100) / 100;
  };

  const formatPKR = (amount, currency = null, isAlreadyRetail = false) => {
    const pkr = convert(amount, currency, isAlreadyRetail);
    if (pkr === null) return null;
    return `PKR ${Math.round(pkr).toLocaleString('en-PK')}`;
  };

  return (
    <CurrencyContext.Provider value={{
      rates,
      rate,
      commissionPercentage,
      serviceChargePercentage,
      primaryCurrency,
      markup,
      txFee,
      loading,
      applyCommission,
      convert,
      formatPKR,
      refreshRates: fetchRate
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
