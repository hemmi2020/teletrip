import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext({
  rate: null, markup: 0, txFee: 0, loading: true,
  convert: () => null,
  formatPKR: () => null,
});

export const CurrencyProvider = ({ children }) => {
  const [rate, setRate] = useState(null);
  const [markup, setMarkup] = useState(0);
  const [txFee, setTxFee] = useState(0);
  const [loading, setLoading] = useState(true);

  const API_BASE = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000') + '/api';

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch(`${API_BASE}/currency/rate`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setRate(data.data.exchangeRate);
            setMarkup(data.data.markupPerEuro || 0);
            setTxFee(data.data.transactionFeePercentage || 0);
          }
        }
      } catch (err) {
        console.error('Currency rate fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRate();
    // Refresh every 30 minutes
    const interval = setInterval(fetchRate, 1800000);
    return () => clearInterval(interval);
  }, []);

  const convert = (amountEUR) => {
    if (!rate || !amountEUR) return null;
    const base = amountEUR * rate;
    const markupAmt = amountEUR * markup;
    const subtotal = base + markupAmt;
    const fee = (subtotal * txFee) / 100;
    return Math.round((subtotal + fee) * 100) / 100;
  };

  const formatPKR = (amountEUR) => {
    const pkr = convert(amountEUR);
    if (pkr === null) return null;
    return `PKR ${pkr.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ rate, markup, txFee, loading, convert, formatPKR }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  return ctx || { rate: null, markup: 0, txFee: 0, loading: true, convert: () => null, formatPKR: () => null };
};
