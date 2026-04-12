import { useState, useEffect } from 'react';

let cachedRate = null;
let cachedMarkup = 0;
let cachedTxFee = 0;
let cacheTime = 0;
let fetchPromise = null;

async function fetchRate() {
  if (cachedRate && Date.now() - cacheTime < 1800000) return;
  if (fetchPromise) return fetchPromise;
  
  fetchPromise = (async () => {
    try {
      const API = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000') + '/api';
      const res = await fetch(`${API}/currency/rate`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          cachedRate = data.data.exchangeRate;
          cachedMarkup = data.data.markupPerEuro || 0;
          cachedTxFee = data.data.transactionFeePercentage || 0;
          cacheTime = Date.now();
        }
      }
    } catch (err) { /* silent */ }
    finally { fetchPromise = null; }
  })();
  return fetchPromise;
}

export function useCurrency() {
  const [ready, setReady] = useState(!!cachedRate);

  useEffect(() => {
    if (!cachedRate) {
      fetchRate().then(() => setReady(true));
    }
  }, []);

  const convert = (amountEUR) => {
    if (!cachedRate || !amountEUR) return null;
    const base = amountEUR * cachedRate;
    const markup = amountEUR * cachedMarkup;
    const subtotal = base + markup;
    const fee = (subtotal * cachedTxFee) / 100;
    return Math.round((subtotal + fee) * 100) / 100;
  };

  const formatPKR = (amountEUR) => {
    const pkr = convert(amountEUR);
    if (pkr === null) return null;
    return `PKR ${pkr.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return { convert, formatPKR, ready };
}
