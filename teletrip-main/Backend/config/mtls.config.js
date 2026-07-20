/**
 * Mutual TLS (MTLS) Configuration for Hotelbeds API
 * 
 * Hotelbeds requires MTLS for the entire booking flow in production.
 * This module provides the HTTPS agent configured with client certificates.
 * 
 * Setup Options:
 * 
 * Option 1 - File paths (local development):
 *   HOTELBEDS_MTLS_CERT_PATH=./certs/telitrip-client.crt
 *   HOTELBEDS_MTLS_KEY_PATH=./certs/telitrip-client.key
 *   HOTELBEDS_MTLS_CA_PATH=./certs/ca-bundle.crt (optional)
 * 
 * Option 2 - Inline content (Render/cloud deployment):
 *   HOTELBEDS_MTLS_CERT=<paste full cert PEM content>
 *   HOTELBEDS_MTLS_KEY=<paste full key PEM content>
 *   HOTELBEDS_MTLS_CA=<paste full CA bundle PEM content> (optional)
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

  let cert, key, ca;

  // Option 1: Read from environment variable content directly (for Render)
  if (process.env.HOTELBEDS_MTLS_CERT && process.env.HOTELBEDS_MTLS_KEY) {
    cert = process.env.HOTELBEDS_MTLS_CERT.replace(/\\n/g, '\n');
    key = process.env.HOTELBEDS_MTLS_KEY.replace(/\\n/g, '\n');
    if (process.env.HOTELBEDS_MTLS_CA) {
      ca = process.env.HOTELBEDS_MTLS_CA.replace(/\\n/g, '\n');
    }
  }
  // Option 2: Read from file paths (for local development)
  else if (process.env.HOTELBEDS_MTLS_CERT_PATH && process.env.HOTELBEDS_MTLS_KEY_PATH) {
    try {
      cert = fs.readFileSync(path.resolve(process.env.HOTELBEDS_MTLS_CERT_PATH));
      key = fs.readFileSync(path.resolve(process.env.HOTELBEDS_MTLS_KEY_PATH));
      if (process.env.HOTELBEDS_MTLS_CA_PATH && fs.existsSync(path.resolve(process.env.HOTELBEDS_MTLS_CA_PATH))) {
        ca = fs.readFileSync(path.resolve(process.env.HOTELBEDS_MTLS_CA_PATH));
      }
    } catch (err) {
      console.error('[MTLS] ❌ Failed to read certificate files:', err.message);
      return null;
    }
  }
  // Not configured
  else {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[MTLS] ⚠️ WARNING: MTLS not configured. Production Hotelbeds API requires mutual TLS.');
      console.warn('[MTLS] Set HOTELBEDS_MTLS_CERT + HOTELBEDS_MTLS_KEY or file path equivalents.');
    }
    return null;
  }

  try {
    const options = { cert, key, rejectUnauthorized: true };
    if (ca) options.ca = ca;

    mtlsAgent = new https.Agent(options);
    console.log('[MTLS] ✅ Mutual TLS agent configured successfully');
    return mtlsAgent;
  } catch (error) {
    console.error('[MTLS] ❌ Failed to create MTLS agent:', error.message);
    return null;
  }
}

module.exports = { getMTLSAgent };
