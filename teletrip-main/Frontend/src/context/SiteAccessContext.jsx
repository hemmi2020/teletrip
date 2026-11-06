import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const SiteAccessContext = createContext(null);

const STORAGE_KEY = 'telitrip_site_access_token';

// Compute backend API base
const getBackendBase = () => {
  const viteApi = import.meta.env.VITE_API_BASE_URL || '';
  if (viteApi) {
    return viteApi.replace(/\/api\/?$/, '');
  }
  return '';
};

// Helper to get stored token
const getStoredToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
};

// Helper to store token
const storeToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
      axios.defaults.headers.common['x-site-access-token'] = token;
    } else {
      localStorage.removeItem(STORAGE_KEY);
      delete axios.defaults.headers.common['x-site-access-token'];
    }
  } catch {
    // ignore storage errors
  }
};

// ── GLOBAL INTERCEPTORS FOR BOTH FETCH AND AXIOS ──
// Set initial axios default header if token is present
const initialToken = getStoredToken();
if (initialToken) {
  axios.defaults.headers.common['x-site-access-token'] = initialToken;
}

// Axios Request Interceptor: ensures all axios calls (hotelApi, transfers, activities) carry the access token
axios.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['x-site-access-token'] = token;
  }
  return config;
});

// Global window.fetch patch at module load: ensures native fetch calls (currency, content, address) carry access token
if (typeof window !== 'undefined' && window.fetch && !window.__telitrip_fetch_patched) {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    let [resource, config] = args;
    const token = getStoredToken();

    const url = typeof resource === 'string' ? resource : resource?.url || '';
    const isBackendReq = url.startsWith('/api') || url.includes('/api/') || url.includes('telitrip-backend.onrender.com') || url.includes('localhost:3000') || url.includes('localhost:5000');

    if (token && isBackendReq) {
      config = config || {};
      const headers = new Headers(config.headers || (typeof resource === 'object' && resource.headers ? resource.headers : {}));
      if (!headers.has('x-site-access-token')) {
        headers.set('x-site-access-token', token);
      }
      config.headers = headers;
    }

    return originalFetch(resource, config);
  };
  window.__telitrip_fetch_patched = true;
}

export const SiteAccessProvider = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGateEnabled, setIsGateEnabled] = useState(true);
  const [error, setError] = useState(null);

  // Strict passcode verification
  const verifyPasscode = useCallback(async (passcode) => {
    setError(null);
    const clean = (passcode || '').trim().toLowerCase();

    if (!clean) {
      const msg = 'Please enter the preview passcode';
      setError(msg);
      return { success: false, message: msg };
    }

    // STRICT PASSCODE CHECK: Typing random text will NEVER unlock the site
    const isValidPasscode = clean === 'telitrip2026' || clean === 'teletrip2026';
    if (!isValidPasscode) {
      const msg = 'Incorrect passcode. Please check and try again.';
      setError(msg);
      return { success: false, message: msg };
    }

    // Passcode is verified! Call backend to fetch official HMAC token
    try {
      const backendUrl = getBackendBase();
      const res = await window.fetch(`${backendUrl}/api/site-access/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: clean })
      });

      const data = await res.json();
      const validToken = data?.token || 'preview_' + btoa(JSON.stringify({ v: 1, p: clean, exp: Date.now() + 7 * 86400000 }));
      storeToken(validToken);
      setIsUnlocked(true);
      setError(null);
      return { success: true };
    } catch {
      const validToken = 'preview_' + btoa(JSON.stringify({ v: 1, p: clean, exp: Date.now() + 7 * 86400000 }));
      storeToken(validToken);
      setIsUnlocked(true);
      setError(null);
      return { success: true };
    }
  }, []);

  // Lock site (allows testers to return to the preview lock screen)
  const lockSite = useCallback(() => {
    storeToken(null);
    setIsUnlocked(false);
  }, []);

  // Initial check on mount
  useEffect(() => {
    const checkInitialAccess = async () => {
      setIsLoading(true);

      // 1. Check for 1-click preview link in URL (e.g. ?preview=PASSCODE or ?access=PASSCODE)
      const urlParams = new URLSearchParams(window.location.search);
      const urlPasscode = urlParams.get('preview') || urlParams.get('access');

      if (urlPasscode) {
        const result = await verifyPasscode(urlPasscode);
        if (result.success) {
          urlParams.delete('preview');
          urlParams.delete('access');
          const cleanQuery = urlParams.toString();
          const cleanUrl = window.location.pathname + (cleanQuery ? `?${cleanQuery}` : '') + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
          setIsLoading(false);
          return;
        }
      }

      // 2. Check stored token
      const storedToken = getStoredToken();
      if (!storedToken) {
        setIsUnlocked(false);
        setIsLoading(false);
        return;
      }

      // 3. Stored token validation
      if (storedToken.startsWith('preview_') || storedToken.startsWith('fallback_')) {
        try {
          const raw = atob(storedToken.replace(/^(preview_|fallback_)/, ''));
          const payload = JSON.parse(raw);
          const p = (payload?.p || '').toLowerCase();
          if ((p === 'telitrip2026' || p === 'teletrip2026') && payload?.exp > Date.now()) {
            axios.defaults.headers.common['x-site-access-token'] = storedToken;
            setIsUnlocked(true);
            setIsLoading(false);
            return;
          }
        } catch {
          // invalid token
        }
      }

      // 4. Verify token with backend
      try {
        const backendUrl = getBackendBase();
        const res = await window.fetch(`${backendUrl}/api/site-access/status`, {
          headers: { 'x-site-access-token': storedToken }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.unlocked === true || data.enabled === false) {
            axios.defaults.headers.common['x-site-access-token'] = storedToken;
            setIsUnlocked(true);
          } else {
            storeToken(null);
            setIsUnlocked(false);
          }
        } else {
          storeToken(null);
          setIsUnlocked(false);
        }
      } catch {
        if (storedToken.startsWith('preview_')) {
          axios.defaults.headers.common['x-site-access-token'] = storedToken;
          setIsUnlocked(true);
        } else {
          storeToken(null);
          setIsUnlocked(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkInitialAccess();
  }, [verifyPasscode]);

  return (
    <SiteAccessContext.Provider
      value={{
        isUnlocked,
        isLoading,
        isGateEnabled,
        error,
        verifyPasscode,
        lockSite
      }}
    >
      {children}
    </SiteAccessContext.Provider>
  );
};

export const useSiteAccess = () => {
  const context = useContext(SiteAccessContext);
  if (!context) {
    throw new Error('useSiteAccess must be used within a SiteAccessProvider');
  }
  return context;
};
