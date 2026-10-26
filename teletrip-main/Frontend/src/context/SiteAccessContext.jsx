import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

export const SiteAccessProvider = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGateEnabled, setIsGateEnabled] = useState(true);
  const [error, setError] = useState(null);

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
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  };

  // Monkey-patch window.fetch to automatically append x-site-access-token header
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let [resource, config] = args;
      const token = getStoredToken();

      if (token) {
        config = config || {};
        const headers = new Headers(config.headers || {});
        if (!headers.has('x-site-access-token')) {
          headers.set('x-site-access-token', token);
        }
        config.headers = headers;
      }

      return originalFetch(resource, config);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Verify a passcode with the backend
  const verifyPasscode = useCallback(async (passcode) => {
    setError(null);
    try {
      const backendUrl = getBackendBase();
      const res = await window.fetch(`${backendUrl}/api/site-access/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          storeToken(data.token);
        }
        setIsUnlocked(true);
        setError(null);
        return { success: true };
      } else {
        const msg = data.message || 'Incorrect passcode. Please try again.';
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = 'Unable to connect to verification server. Please check your connection.';
      setError(msg);
      return { success: false, message: msg };
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
          // Clean the query parameter without page reload
          urlParams.delete('preview');
          urlParams.delete('access');
          const cleanQuery = urlParams.toString();
          const cleanUrl = window.location.pathname + (cleanQuery ? `?${cleanQuery}` : '') + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
          setIsLoading(false);
          return;
        }
      }

      // 2. Check stored token against backend status
      const storedToken = getStoredToken();
      try {
        const backendUrl = getBackendBase();
        const headers = storedToken ? { 'x-site-access-token': storedToken } : {};
        const res = await window.fetch(`${backendUrl}/api/site-access/status`, { headers });
        const data = await res.json();

        // If backend feature toggle is disabled, site is globally public (Launch Day!)
        if (!data.enabled) {
          setIsGateEnabled(false);
          setIsUnlocked(true);
        } else if (data.unlocked) {
          setIsUnlocked(true);
        } else {
          setIsUnlocked(false);
        }
      } catch (err) {
        // Fallback: If network check fails but we have a stored token, tentatively unlock
        if (storedToken) {
          setIsUnlocked(true);
        } else {
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
