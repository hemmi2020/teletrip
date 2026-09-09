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
 *   HOTELBEDS_MTLS_CA_PATH=./certs/ca-bundle.crt (optional — only if you need a custom CA to verify the server)
 * 
 * Option 2 - Inline content (Render/cloud deployment):
 *   HOTELBEDS_MTLS_CERT=<paste full cert PEM content>
 *   HOTELBEDS_MTLS_KEY=<paste full key PEM content>
 *   HOTELBEDS_MTLS_CA=<paste full CA bundle PEM content> (optional — only if you need a custom CA to verify the server)
 * 
 * NOTE: HOTELBEDS_MTLS_CA is for verifying the SERVER certificate. It is NOT the same
 * as the CA that issued your client certificate. In most cases, Hotelbeds' server cert
 * is signed by a well-known public CA (e.g., DigiCert) that Node.js already trusts,
 * so you should leave CA unset and let Node use its default trust store.
 * 
 * If you get "unable to get local issuer certificate", try:
 *   1. Ensure HOTELBEDS_BASE_URL points to the MTLS endpoint (api-mtls.test.hotelbeds.com or api-mtls.hotelbeds.com)
 *   2. Leave HOTELBEDS_MTLS_CA unset so Node uses its default CA store
 *   3. If still failing, set HOTELBEDS_MTLS_REJECT_UNAUTHORIZED=false for testing only
 * 
 * Reference: https://developer.hotelbeds.com/documentation/hotels/knowledge-base/mutual-authentication/
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

let mtlsAgent = null;

function normalizePem(value) {
  if (!value) return null;
  // Handle both formats: literal \n in string OR actual newlines
  return value.includes('\\n') ? value.replace(/\\n/g, '\n') : value;
}

function getMTLSAgent() {
  // Return cached agent if available
  if (mtlsAgent) return mtlsAgent;

  let cert, key, ca;

  // Option 1: Read from environment variable content directly (for Render)
  if (process.env.HOTELBEDS_MTLS_CERT && process.env.HOTELBEDS_MTLS_KEY) {
    cert = normalizePem(process.env.HOTELBEDS_MTLS_CERT);
    key = normalizePem(process.env.HOTELBEDS_MTLS_KEY);
    if (process.env.HOTELBEDS_MTLS_USE_CUSTOM_CA === 'true' && process.env.HOTELBEDS_MTLS_CA) {
      ca = normalizePem(process.env.HOTELBEDS_MTLS_CA);
      console.log('[MTLS] Using custom CA from env var for server verification');
    }
    console.log('[MTLS] Reading cert from env vars. Cert starts with:', cert.substring(0, 30));
  }
  // Option 2: Read from file paths (for local development)
  else if (process.env.HOTELBEDS_MTLS_CERT_PATH && process.env.HOTELBEDS_MTLS_KEY_PATH) {
    try {
      cert = fs.readFileSync(path.resolve(process.env.HOTELBEDS_MTLS_CERT_PATH));
      key = fs.readFileSync(path.resolve(process.env.HOTELBEDS_MTLS_KEY_PATH));
      if (process.env.HOTELBEDS_MTLS_USE_CUSTOM_CA === 'true' && process.env.HOTELBEDS_MTLS_CA_PATH && fs.existsSync(path.resolve(process.env.HOTELBEDS_MTLS_CA_PATH))) {
        ca = fs.readFileSync(path.resolve(process.env.HOTELBEDS_MTLS_CA_PATH));
        console.log('[MTLS] Using custom CA from file for server verification');
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
    // By default, do NOT override Node's CA store. Hotelbeds' server cert is signed
    // by a public CA that Node.js already trusts. Setting a custom ca replaces the
    // default store and causes "unable to get local issuer certificate" errors.
    const options = { cert, key, rejectUnauthorized: true };
    if (ca) options.ca = ca;

    // Emergency override for debugging certificate issues in test environments
    // NEVER use in production.
    if (process.env.HOTELBEDS_MTLS_REJECT_UNAUTHORIZED === 'false') {
      options.rejectUnauthorized = false;
      console.warn('[MTLS] ⚠️ WARNING: rejectUnauthorized=false — this disables certificate verification!');
    }

    mtlsAgent = new https.Agent(options);
    console.log('[MTLS] ✅ Mutual TLS agent configured successfully (rejectUnauthorized:', options.rejectUnauthorized + ')');
    return mtlsAgent;
  } catch (error) {
    console.error('[MTLS] ❌ Failed to create MTLS agent:', error.message);
    return null;
  }
}

module.exports = { getMTLSAgent };
