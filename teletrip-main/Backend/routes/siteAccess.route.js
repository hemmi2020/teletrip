const express = require('express');
const router = express.Router();
const { createSiteAccessToken, verifySiteAccessToken, TOKEN_TTL_SECONDS } = require('../middlewares/siteAccess.middleware');

/**
 * Check if the site access gate is currently enabled
 * GET /api/site-access/status
 */
router.get('/status', (req, res) => {
    const isEnabled = process.env.SITE_ACCESS_ENABLED === 'true';
    const clientToken = req.headers['x-site-access-token'] || req.cookies?.['telitrip_site_access'];
    const isUnlocked = !isEnabled || (clientToken && verifySiteAccessToken(clientToken));

    res.json({
        success: true,
        enabled: isEnabled,
        unlocked: !!isUnlocked
    });
});

/**
 * Verify passcode and issue signed 7-day access token
 * POST /api/site-access/verify
 */
router.post('/verify', (req, res) => {
    const isEnabled = process.env.SITE_ACCESS_ENABLED === 'true';

    // If gate is disabled globally, approve immediately
    if (!isEnabled) {
        return res.json({
            success: true,
            enabled: false,
            message: 'Site is public'
        });
    }

    const { passcode } = req.body || {};
    const configuredPasscode = process.env.SITE_ACCESS_PASSCODE || 'telitrip2026';

    if (!passcode || typeof passcode !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Passcode is required'
        });
    }

    if (passcode.trim() !== configuredPasscode.trim()) {
        return res.status(401).json({
            success: false,
            message: 'Incorrect passcode. Please check and try again.'
        });
    }

    // Passcode correct -> Generate 7-day token
    const token = createSiteAccessToken();

    // Optionally set cookie
    res.cookie('telitrip_site_access', token, {
        maxAge: TOKEN_TTL_SECONDS * 1000,
        httpOnly: false, // Accessible to frontend client
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });

    return res.json({
        success: true,
        token,
        expiresIn: TOKEN_TTL_SECONDS,
        message: 'Passcode verified successfully. Welcome to TeleTrip Private Preview!'
    });
});

module.exports = router;
