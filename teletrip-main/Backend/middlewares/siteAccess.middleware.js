const crypto = require('crypto');

const SECRET = process.env.SITE_ACCESS_SECRET || process.env.JWT_SECRET || 'telitrip-preview-secret-key-2026';
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Generate a signed site access token valid for 7 days
 */
function createSiteAccessToken() {
    const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
    const payload = JSON.stringify({ exp: expiresAt, v: 1, site: 'telitrip' });
    const payloadB64 = Buffer.from(payload).toString('base64url');
    const signature = crypto.createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
    return `${payloadB64}.${signature}`;
}

/**
 * Verify a signed site access token
 */
function verifySiteAccessToken(token) {
    if (!token || typeof token !== 'string') return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [payloadB64, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(payloadB64).digest('base64url');

    const bufSig = Buffer.from(signature);
    const bufExp = Buffer.from(expectedSignature);

    if (bufSig.length !== bufExp.length || !crypto.timingSafeEqual(bufSig, bufExp)) {
        return false;
    }

    try {
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
        if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) {
            return false; // Expired
        }
        return true;
    } catch {
        return false;
    }
}

/**
 * Site Access Guard Middleware
 * Restricts public traffic when SITE_ACCESS_ENABLED=true
 */
function siteAccessGuard(req, res, next) {
    // 1. If feature toggle is disabled, allow all traffic immediately (instant launch switch)
    if (process.env.SITE_ACCESS_ENABLED !== 'true') {
        return next();
    }

    // 2. Allow CORS preflights
    if (req.method === 'OPTIONS') {
        return next();
    }

    const path = req.path || '';

    // 3. Whitelisted system & webhook routes
    const isWhitelisted = 
        path === '/health' ||
        path.startsWith('/api/site-access') ||
        path.startsWith('/api/payments/webhook') ||
        path.startsWith('/api/payments/hbl') ||
        path.startsWith('/api/payments/callback');

    if (isWhitelisted) {
        return next();
    }

    // 4. Extract token from header, query, or cookie
    const token = 
        req.headers['x-site-access-token'] ||
        (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7) : null) ||
        req.cookies?.['telitrip_site_access'] ||
        req.query?.preview_token;

    if (token && verifySiteAccessToken(token)) {
        return next();
    }

    // 5. Block unauthorized requests
    return res.status(403).json({
        success: false,
        code: 'SITE_ACCESS_REQUIRED',
        message: 'TeleTrip is currently in private preview mode. A valid access passcode is required to view live APIs.'
    });
}

module.exports = {
    siteAccessGuard,
    createSiteAccessToken,
    verifySiteAccessToken,
    TOKEN_TTL_SECONDS
};
