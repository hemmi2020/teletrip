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
 * CHAIN SUPPORT (required for SSL.com certs):
 *   Your client certificate may need the intermediate CA appended so Hotelbeds can
 *   verify the full chain. For file paths, place ca-intermediate.crt next to your
 *   client cert. For inline, concatenate leaf + intermediate into HOTELBEDS_MTLS_CERT
 *   or set HOTELBEDS_MTLS_INTERMEDIATE separately.
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

/**
 * Count how many certificates are in a PEM string/buffer
 */
function countCerts(pem) {
  if (!pem) return 0;
  const text = Buffer.isBuffer(pem) ? pem.toString() : pem;
  return (text.match(/-----BEGIN CERTIFICATE-----/g) || []).length;
}

/**
 * Compute a simple hash/fingerprint of the first cert in a PEM bundle
 * for diagnostic comparison
 */
function certFingerprint(pem) {
  try {
    const text = Buffer.isBuffer(pem) ? pem.toString() : pem;
    const match = text.match(/-----BEGIN CERTIFICATE-----([\s\S]+?)-----END CERTIFICATE-----/);
    if (!match) return 'no-cert-found';
    const base64 = match[1].replace(/\s/g, '');
    // Return first 16 chars of base64 as a simple identifier
    return base64.substring(0, 16) + '...' + base64.substring(base64.length - 8);
  } catch (e) {
    return 'error:' + e.message;
  }
}

/**
 * Compute a simple fingerprint of a private key for diagnostic comparison
 */
function keyFingerprint(pem) {
  try {
    const text = Buffer.isBuffer(pem) ? pem.toString() : pem;
    const match = text.match(/-----BEGIN ([A-Z ]+?)-----([\s\S]+?)-----END \1-----/);
    if (!match) return 'no-key-found';
    const base64 = match[2].replace(/\s/g, '');
    return base64.substring(0, 16) + '...' + base64.substring(base64.length - 8);
  } catch (e) {
    return 'error:' + e.message;
  }
}

/**
 * Try to find and read an intermediate CA certificate next to the client cert file.
 * Looks for: ca-intermediate.crt, client.chain.crt, or any .crt in the same dir
 */
function findIntermediateChain(certPath, certContent) {
  const dir = path.dirname(certPath);
  const base = path.basename(certPath, path.extname(certPath));

  const candidates = [
    path.join(dir, 'ca-intermediate.crt'),
    path.join(dir, `${base}-chain.crt`),
    path.join(dir, `${base}.chain.crt`),
    path.join(dir, 'chain.crt'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        const data = fs.readFileSync(candidate);
        if (countCerts(data) >= 1) {
          console.log(`[MTLS] Appending intermediate chain from ${path.basename(candidate)} (${countCerts(data)} cert(s))`);
          return data;
        }
      } catch (err) {
        // ignore
      }
    }
  }
  return null;
}

function getMTLSAgent() {
  // Return cached agent if available
  if (mtlsAgent) return mtlsAgent;

  let cert, key, ca;

  // Option 1: Read from environment variable content directly (for Render)
  if (process.env.HOTELBEDS_MTLS_CERT && process.env.HOTELBEDS_MTLS_KEY) {
    cert = normalizePem(process.env.HOTELBEDS_MTLS_CERT);
    key = normalizePem(process.env.HOTELBEDS_MTLS_KEY);

    console.log('[MTLS] Cert fingerprint:', certFingerprint(cert));
    console.log('[MTLS] Key fingerprint:', keyFingerprint(key));

    const leafCount = countCerts(cert);
    if (leafCount === 1 && process.env.HOTELBEDS_MTLS_INTERMEDIATE) {
      const intermediate = normalizePem(process.env.HOTELBEDS_MTLS_INTERMEDIATE);
      cert = cert.trim() + '\n' + intermediate.trim() + '\n';
      console.log('[MTLS] Appended intermediate CA from HOTELBEDS_MTLS_INTERMEDIATE env var');
    }

    if (process.env.HOTELBEDS_MTLS_USE_CUSTOM_CA === 'true' && process.env.HOTELBEDS_MTLS_CA) {
      ca = normalizePem(process.env.HOTELBEDS_MTLS_CA);
      console.log('[MTLS] Using custom CA from env var for server verification');
    }
    console.log('[MTLS] Reading cert from env vars. Total certs in chain:', countCerts(cert));
  }
  // Option 2: Read from file paths (for local development)
  else if (process.env.HOTELBEDS_MTLS_CERT_PATH && process.env.HOTELBEDS_MTLS_KEY_PATH) {
    try {
      const certPath = path.resolve(process.env.HOTELBEDS_MTLS_CERT_PATH);
      cert = fs.readFileSync(certPath);
      key = fs.readFileSync(path.resolve(process.env.HOTELBEDS_MTLS_KEY_PATH));

      const leafCount = countCerts(cert);
      if (leafCount === 1) {
        const intermediate = findIntermediateChain(certPath, cert);
        if (intermediate) {
          cert = Buffer.concat([cert, Buffer.from('\n'), intermediate]);
        } else {
          console.warn('[MTLS] ⚠️ Client cert appears to be a single leaf. Hotelbeds may reject it without the intermediate CA chain.');
        }
      }

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
    }
    return null;
  }

  try {
    const options = { cert, key, rejectUnauthorized: true };
    if (ca) options.ca = ca;

    if (process.env.HOTELBEDS_MTLS_REJECT_UNAUTHORIZED === 'false') {
      options.rejectUnauthorized = false;
      console.warn('[MTLS] ⚠️ WARNING: rejectUnauthorized=false — this disables certificate verification!');
    }

    mtlsAgent = new https.Agent(options);
    console.log('[MTLS] ✅ Mutual TLS agent configured successfully (chain length:', countCerts(cert), 'cert(s), rejectUnauthorized:', options.rejectUnauthorized + ')');
    return mtlsAgent;
  } catch (error) {
    console.error('[MTLS] ❌ Failed to create MTLS agent:', error.message);
    console.error('[MTLS]    If error is "key values mismatch", your HOTELBEDS_MTLS_CERT and HOTELBEDS_MTLS_KEY do not match.');
    console.error('[MTLS]    Re-copy both from your local cert files: telitrip-client.crt and telitrip-client.key');
    return null;
  }
}

module.exports = { getMTLSAgent };
