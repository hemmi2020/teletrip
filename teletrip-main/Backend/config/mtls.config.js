/**
 * Mutual TLS (MTLS) Configuration for Hotelbeds API
 * 
 * Hotelbeds requires MTLS for the entire booking flow in production.
 * This module provides the HTTPS agent configured with client certificates
 * for use with node-fetch or https requests.
 * 
 * Setup:
 * 1. Download your client certificate from Hotelbeds developer portal
 * 2. Place the .pem/.crt and .key files in this directory (or configure paths in .env)
 * 3. Set these environment variables:
 *    - HOTELBEDS_MTLS_CERT_PATH: Path to client certificate (.pem/.crt)
 *    - HOTELBEDS_MTLS_KEY_PATH: Path to client private key (.key)
 *    - HOTELBEDS_MTLS_CA_PATH: (Optional) Path to CA bundle
 * 
 * Reference: https://developer.hotelbeds.com/documentation/hotels/knowledge-base/mutual-authentication/
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

let mtlsAgent = null;

function getMTLSAgent() {
  // Return cached agent if available
  if (mtlsAgent) return mtlsAgent;

  const certPath = process.env.HOTELBEDS_MTLS_CERT_PATH;
  const keyPath = process.env.HOTELBEDS_MTLS_KEY_PATH;
  const caPath = process.env.HOTELBEDS_MTLS_CA_PATH;

  // If MTLS is not configured, return null (will use default HTTPS)
  if (!certPath || !keyPath) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[MTLS] ⚠️ WARNING: MTLS not configured. Production Hotelbeds API requires mutual TLS.');
      console.warn('[MTLS] Set HOTELBEDS_MTLS_CERT_PATH and HOTELBEDS_MTLS_KEY_PATH in environment.');
    }
    return null;
  }

  try {
    const options = {
      cert: fs.readFileSync(path.resolve(certPath)),
      key: fs.readFileSync(path.resolve(keyPath)),
      rejectUnauthorized: true
    };

    if (caPath && fs.existsSync(path.resolve(caPath))) {
      options.ca = fs.readFileSync(path.resolve(caPath));
    }

    mtlsAgent = new https.Agent(options);
    console.log('[MTLS] ✅ Mutual TLS agent configured successfully');
    return mtlsAgent;
  } catch (error) {
    console.error('[MTLS] ❌ Failed to configure MTLS agent:', error.message);
    return null;
  }
}

module.exports = { getMTLSAgent };
